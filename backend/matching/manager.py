import time
from typing import Dict, Any, Tuple
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from channels.layers import get_channel_layer

from .repository import QueueRepository, RedisQueue
from .state_machine import QueueState, QueueStateMachine
from moderation.services import ModerationRedisClient

class QueueManager:
    """
    Handles user interaction with the Queue (Join, Leave, Status).
    Enforces business logic (cooldowns, dupes, blocks).
    """
    
    def __init__(self):
        self.repo = QueueRepository()
        self.queue = RedisQueue()

    def join_queue(self, user_id: int, preferences: Dict[str, Any], score: int) -> Tuple[bool, str]:
        """
        Attempts to add a user to the matchmaking queue.
        Returns (success, message_or_error)
        """
        if score < 70:
            return False, "Profile completion score is too low."

        # Lock to prevent duplicate concurrent requests
        if not self.repo.acquire_lock(user_id):
            return False, "Action in progress."

        try:
            current_state_data = self.repo.get_user_state(user_id)
            
            if current_state_data:
                state_str = current_state_data.get('state')
                if state_str == QueueState.COOLDOWN.value:
                    updated_at = int(current_state_data.get('updated_at', 0))
                    if int(time.time()) - updated_at < 10: # 10 second cooldown
                        return False, "You are on cooldown. Please wait."
                    
                if state_str in [QueueState.QUEUED.value, QueueState.MATCHING.value]:
                    return False, "You are already in the queue."
                
                if state_str == QueueState.MATCHED.value:
                    return False, "You are already matched."

            # Valid to transition to QUEUED
            # Warm up block cache before joining
            ModerationRedisClient().refresh_block_cache(user_id)
            
            self.repo.save_user_state(user_id, QueueState.QUEUED, preferences, score)
            self.queue.add_to_queue(user_id)
            
            self._notify_user(user_id, "queue_status", {"status": QueueState.QUEUED.value})
            return True, "Successfully joined queue."
            
        finally:
            self.repo.release_lock(user_id)


    def leave_queue(self, user_id: int) -> Tuple[bool, str]:
        """
        Removes user from the queue if they are currently QUEUED or MATCHING.
        """
        if not self.repo.acquire_lock(user_id):
            return False, "Action in progress."

        try:
            data = self.repo.get_user_state(user_id)
            if not data:
                return False, "Not in queue."

            current_state = QueueState(data['state'])
            
            if current_state not in [QueueState.QUEUED, QueueState.MATCHING]:
                return False, f"Cannot leave queue from state {current_state.value}"

            # Transition to IDLE and cleanup
            self.queue.remove_from_queue(user_id)
            self.repo.delete_user_state(user_id)
            
            self._notify_user(user_id, "queue_status", {"status": QueueState.IDLE.value})
            return True, "Successfully left queue."
            
        finally:
            self.repo.release_lock(user_id)

    def _notify_user(self, user_id: int, event_type: str, payload: Dict[str, Any]):
        """
        Sends a websocket message to the user if connected.
        """
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
