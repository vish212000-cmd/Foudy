import json
import time
from typing import Dict, Any, List, Optional
from django.conf import settings
from redis import Redis
from core.redis import RedisTTL

from .state_machine import QueueState, QueueStateMachine

# We will initialize redis connection centrally or per repo instance.
def get_redis_client() -> Redis:
    import redis
    redis_url = settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0]
    return redis.from_url(redis_url)

class RedisQueueNamespaces:
    QUEUE = "foudy:matchmaking:queue"
    USER_PREFIX = "foudy:matchmaking:user:"
    LOCK_PREFIX = "foudy:matchmaking:lock:"

class QueueRepository:
    """
    Repository pattern for managing Queue entities in Redis.
    """
    def __init__(self):
        self.redis = get_redis_client()

    def _user_key(self, user_id: int) -> str:
        return f"{RedisQueueNamespaces.USER_PREFIX}{user_id}"

    def _lock_key(self, user_id: int) -> str:
        return f"{RedisQueueNamespaces.LOCK_PREFIX}{user_id}"

    def acquire_lock(self, user_id: int, timeout_seconds: int = 10) -> bool:
        """
        Acquires a lock for the user to prevent race conditions during state updates.
        """
        return bool(self.redis.set(self._lock_key(user_id), "LOCKED", nx=True, ex=timeout_seconds))

    def release_lock(self, user_id: int):
        self.redis.delete(self._lock_key(user_id))

    def get_user_state(self, user_id: int) -> Optional[Dict[str, Any]]:
        """
        Retrieves user queue data.
        """
        data = self.redis.hgetall(self._user_key(user_id))
        if not data:
            return None
        
        # Decode byte strings
        decoded = {k.decode('utf-8'): v.decode('utf-8') for k, v in data.items()}
        
        # Parse JSON fields
        if 'preferences' in decoded:
            decoded['preferences'] = json.loads(decoded['preferences'])
        
        return decoded

    def save_user_state(self, user_id: int, state: QueueState, preferences: Dict[str, Any], score: int):
        """
        Creates or updates a user's state in Redis.
        """
        now = int(time.time())
        data = {
            "state": state.value,
            "preferences": json.dumps(preferences),
            "score": str(score),
            "updated_at": str(now),
        }
        
        # If transitioning to QUEUED, record entry time
        if state == QueueState.QUEUED:
            data["entry_time"] = str(now)
            
        self.redis.hset(self._user_key(user_id), mapping=data)
        self.redis.expire(self._user_key(user_id), RedisTTL.MATCHING_ORPHAN) # Expire in 1 hour if orphaned

    def update_state_only(self, user_id: int, current_state: QueueState, next_state: QueueState):
        """
        Safely transition state.
        """
        QueueStateMachine.validate_transition(current_state, next_state)
        
        self.redis.hset(self._user_key(user_id), "state", next_state.value)
        self.redis.hset(self._user_key(user_id), "updated_at", str(int(time.time())))

    def delete_user_state(self, user_id: int):
        self.redis.delete(self._user_key(user_id))


class RedisQueue:
    """
    Abstractions for the actual matchmaking ZSET.
    """
    def __init__(self):
        self.redis = get_redis_client()
        self.queue_key = RedisQueueNamespaces.QUEUE

    def add_to_queue(self, user_id: int):
        """
        Adds user to the waiting queue (ZSET sorted by current time).
        """
        now = int(time.time())
        self.redis.zadd(self.queue_key, {str(user_id): now})

    def remove_from_queue(self, user_id: int):
        """
        Removes user from the waiting queue.
        """
        self.redis.zrem(self.queue_key, str(user_id))

    def get_waiting_users(self, limit: int = 50) -> List[int]:
        """
        Gets the longest waiting users.
        """
        # Get users sorted by score (timestamp ascending)
        users = self.redis.zrange(self.queue_key, 0, limit - 1)
        return [int(u.decode('utf-8')) for u in users]

    def count(self) -> int:
        return self.redis.zcard(self.queue_key)
