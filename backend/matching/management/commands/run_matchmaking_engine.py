import time
from typing import List, Dict, Any
from django.core.management.base import BaseCommand
from matching.repository import QueueRepository, RedisQueue
from matching.engine import CompatibilityEngine
from matching.state_machine import QueueState, QueueStateMachine
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from moderation.services import ModerationRedisClient

class Command(BaseCommand):
    help = 'Runs the Matchmaking Engine background worker'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Matchmaking Engine..."))
        
        repo = QueueRepository()
        queue = RedisQueue()
        
        try:
            while True:
                # 1. Fetch top N waiting users
                waiting_user_ids = queue.get_waiting_users(limit=50)
                
                if len(waiting_user_ids) < 2:
                    time.sleep(1) # Wait for more users
                    continue
                
                # 2. Evaluate matches
                redis_client = ModerationRedisClient()
                self.evaluate_batch(waiting_user_ids, repo, queue, redis_client)
                
                # Sleep briefly to prevent 100% CPU on empty batches
                time.sleep(0.5)

        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Matchmaking Engine stopped by user."))

    def evaluate_batch(self, user_ids: List[int], repo: QueueRepository, queue: RedisQueue, redis_client: ModerationRedisClient = None):
        """
        Takes a batch of waiting users and attempts to match them.
        """
        matched_pairs = []
        skip_list = set()
        
        # Pre-fetch block sets using pipeline
        blocks = {}
        if redis_client:
            pipe = redis_client.redis.pipeline()
            for uid in user_ids:
                pipe.smembers(redis_client.get_blocked_cache_key(uid))
            results = pipe.execute()
            for uid, blocked_set in zip(user_ids, results):
                blocks[str(uid)] = blocked_set

        for i in range(len(user_ids)):
            user_a_id = user_ids[i]
            if user_a_id in skip_list:
                continue

            # Lock user A
            if not repo.acquire_lock(user_a_id, timeout_seconds=5):
                continue
                
            user_a = repo.get_user_state(user_a_id)
            if not user_a or user_a.get('state') != QueueState.QUEUED.value:
                repo.release_lock(user_a_id)
                continue

            best_match_id = None

            # Find compatible match
            for j in range(i + 1, len(user_ids)):
                user_b_id = user_ids[j]
                if user_b_id in skip_list:
                    continue
                
                if not repo.acquire_lock(user_b_id, timeout_seconds=2):
                    continue

                user_b = repo.get_user_state(user_b_id)
                if not user_b or user_b.get('state') != QueueState.QUEUED.value:
                    repo.release_lock(user_b_id)
                    continue

                # Enforce Blocks
                if str(user_b_id) in blocks.get(str(user_a_id), set()) or str(user_a_id) in blocks.get(str(user_b_id), set()):
                    repo.release_lock(user_b_id)
                    continue

                # Evaluate Compatibility
                if CompatibilityEngine.is_match(user_a, user_b):
                    best_match_id = user_b_id
                    # Keep B locked
                    break
                else:
                    repo.release_lock(user_b_id)

            if best_match_id:
                # We have a match! 
                user_b = repo.get_user_state(best_match_id)
                self.finalize_match(user_a_id, user_a, best_match_id, user_b, repo, queue)
                skip_list.add(user_a_id)
                skip_list.add(best_match_id)
            
            repo.release_lock(user_a_id)
            if best_match_id:
                repo.release_lock(best_match_id)

    def finalize_match(self, a_id: int, a_data: dict, b_id: int, b_data: dict, repo: QueueRepository, queue: RedisQueue):
        """
        Updates state and notifies both users.
        """
        # Update states to MATCHED
        repo.update_state_only(a_id, QueueState.QUEUED, QueueState.MATCHED)
        repo.update_state_only(b_id, QueueState.QUEUED, QueueState.MATCHED)
        
        # Remove from active queue
        queue.remove_from_queue(a_id)
        queue.remove_from_queue(b_id)
        
        # In a full implementation, we'd create a Room in the database here and return the room ID.
        # For this milestone, we just notify them they matched.
        self.notify_user(a_id, "matched", {"matched_with": b_id})
        self.notify_user(b_id, "matched", {"matched_with": a_id})
        
        self.stdout.write(self.style.SUCCESS(f"Matched {a_id} and {b_id}"))

    def notify_user(self, user_id: int, event_type: str, payload: Dict[str, Any]):
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                {
                    "type": "realtime_event",
                    "event": event_type,
                    "payload": payload
                }
            )
