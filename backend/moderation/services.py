import json
import time
from django.conf import settings
from django.db import transaction
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import redis
from core.redis import RedisTTL

from .models import Block, Report, AuditLog
from signaling.manager import PeerRepository, PeerSessionState
from matching.repository import QueueRepository

class ModerationError(Exception):
    def __init__(self, message, code=400):
        self.message = message
        self.code = code
        super().__init__(self.message)

class ModerationRedisClient:
    def __init__(self):
        redis_url = settings.CACHES['default'].get('LOCATION', getattr(settings, 'REDIS_URL', 'redis://127.0.0.1:6379/1'))
        if isinstance(redis_url, list):
            redis_url = redis_url[0]
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)

    def get_blocked_cache_key(self, user_id: int) -> str:
        return f"moderation:blocks:{user_id}"

    def refresh_block_cache(self, user_id: int):
        """
        Reloads the set of blocked user IDs (both initiated and received) into Redis.
        """
        key = self.get_blocked_cache_key(user_id)
        # Find all blocks where user is involved
        blocks = Block.objects.filter(Q(blocker_id=user_id) | Q(blocked_id=user_id))
        
        blocked_ids = set()
        for b in blocks:
            if b.blocker_id == user_id:
                blocked_ids.add(b.blocked_id)
            else:
                blocked_ids.add(b.blocker_id)
                
        self.redis.delete(key)
        if blocked_ids:
            self.redis.sadd(key, *blocked_ids)
            self.redis.expire(key, RedisTTL.MODERATION_BLOCK_CACHE) # Expire after 1 day
            
    def get_blocked_ids(self, user_id: int) -> set:
        """
        Gets the cached set of blocked user IDs. Returns string representations.
        """
        key = self.get_blocked_cache_key(user_id)
        if not self.redis.exists(key):
            self.refresh_block_cache(user_id)
        return self.redis.smembers(key)

    def is_blocked(self, user_id, target_user_id) -> bool:
        """
        Returns True if `target_user_id` is in `user_id`'s blocked list (either blocked by or blocking).
        """
        key = self.get_blocked_cache_key(user_id)
        if not self.redis.exists(key):
            self.refresh_block_cache(user_id)
        return self.redis.sismember(key, str(target_user_id))

class BlockService:
    def __init__(self):
        self.redis_client = ModerationRedisClient()
        self.peer_repo = PeerRepository()
        self.queue_repo = QueueRepository()

    @transaction.atomic
    def block_user(self, blocker_id: int, blocked_id: int):
        if blocker_id == blocked_id:
            raise ModerationError("You cannot block yourself.")
            
        block, created = Block.objects.get_or_create(blocker_id=blocker_id, blocked_id=blocked_id)
        
        if created:
            AuditLog.objects.create(
                action=AuditLog.Action.BLOCK,
                actor_id=blocker_id,
                target_id=blocked_id
            )
            
            # Refresh caches
            self.redis_client.refresh_block_cache(blocker_id)
            self.redis_client.refresh_block_cache(blocked_id)
            
            # Terminate active session if it exists
            self._terminate_active_session(blocker_id, blocked_id)

    @transaction.atomic
    def unblock_user(self, blocker_id: int, blocked_id: int):
        deleted, _ = Block.objects.filter(blocker_id=blocker_id, blocked_id=blocked_id).delete()
        if deleted:
            AuditLog.objects.create(
                action=AuditLog.Action.UNBLOCK,
                actor_id=blocker_id,
                target_id=blocked_id
            )
            # Refresh caches
            self.redis_client.refresh_block_cache(blocker_id)
            self.redis_client.refresh_block_cache(blocked_id)

    def _terminate_active_session(self, user_a_id: int, user_b_id: int):
        """
        If these two users are currently in a match, terminate the match.
        """
        # Get active session from PeerRepository
        session = self.peer_repo.get_session(user_a_id)
        if session:
            # Check if the session is with the blocked user
            other_user = session.get('user_b_id') if str(session.get('user_a_id')) == str(user_a_id) else session.get('user_a_id')
            if str(other_user) == str(user_b_id):
                # Terminate!
                self.peer_repo.delete_session(user_a_id)
                self.peer_repo.delete_session(user_b_id)
                
                # Cleanup queue repo just in case they were stuck in MATCHED state
                self.queue_repo.delete_user_state(user_a_id)
                self.queue_repo.delete_user_state(user_b_id)

                # Send signaling disconnect
                channel_layer = get_channel_layer()
                if channel_layer:
                    payload = {"reason": "blocked"}
                    async_to_sync(channel_layer.group_send)(
                        f"user_{user_a_id}",
                        {"type": "realtime_event", "event": "signaling.disconnect", "payload": payload}
                    )
                    async_to_sync(channel_layer.group_send)(
                        f"user_{user_b_id}",
                        {"type": "realtime_event", "event": "signaling.disconnect", "payload": payload}
                    )
                    
                AuditLog.objects.create(
                    action=AuditLog.Action.SESSION_TERMINATED,
                    actor_id=user_a_id,
                    target_id=user_b_id,
                    details={"reason": "block_enforcement"}
                )

class ReportService:
    def __init__(self):
        redis_url = settings.CACHES['default'].get('LOCATION', getattr(settings, 'REDIS_URL', 'redis://127.0.0.1:6379/1'))
        if isinstance(redis_url, list):
            redis_url = redis_url[0]
        self.redis = redis.Redis.from_url(redis_url, decode_responses=True)

    @transaction.atomic
    def report_user(self, reporter_id: int, reported_id: int, reason: str, details: str = ""):
        if reporter_id == reported_id:
            raise ModerationError("You cannot report yourself.")
            
        # Rate limit: 5 reports per hour
        rate_key = f"moderation:report_rl:{reporter_id}"
        count = self.redis.incr(rate_key)
        if count == 1:
            self.redis.expire(rate_key, RedisTTL.MODERATION_REPORT_RL)
        elif count > 5:
            raise ModerationError("Report rate limit exceeded. Try again later.", code=429)

        # Duplicate check: prevent duplicate reports within 24 hours
        dup_key = f"moderation:report_dup:{reporter_id}:{reported_id}"
        if self.redis.exists(dup_key):
            raise ModerationError("You have already reported this user recently.", code=409)

        # Create Report
        report = Report.objects.create(
            reporter_id=reporter_id,
            reported_user_id=reported_id,
            reason=reason
        )
        
        # Mark as reported recently
        self.redis.set(dup_key, "1", ex=RedisTTL.MODERATION_REPORT_DUP)

        AuditLog.objects.create(
            action=AuditLog.Action.REPORT,
            actor_id=reporter_id,
            target_id=reported_id,
            details={"reason": reason, "report_id": str(report.id), "extra_details": details}
        )
        return report
