import json
import time
from typing import Optional, Dict, Any
from django.conf import settings
import redis

class PeerSessionState:
    CREATED = "CREATED"
    NEGOTIATING = "NEGOTIATING"
    CONNECTED = "CONNECTED"
    RENEGOTIATING = "RENEGOTIATING"
    DISCONNECTED = "DISCONNECTED"
    FAILED = "FAILED"
    CLOSED = "CLOSED"

class PeerRepository:
    """
    Manages WebRTC PeerSession states in Redis.
    Key: foudy:signaling:match:<match_id>
    """
    @property
    def redis(self):
        from core.redis_client import get_redis_client
        client = get_redis_client()
        if not client:
            raise Exception("Redis is unavailable.")
        return client

    def __init__(self):
        self.prefix = "foudy:signaling:match:"
        self.ttl = 86400  # 24 hours max for a session

    def _key(self, match_id: int) -> str:
        return f"{self.prefix}{match_id}"
        
    def _msg_key(self, match_id: int) -> str:
        return f"{self.prefix}{match_id}:messages"

    def get_session(self, match_id: int) -> Optional[Dict[str, Any]]:
        data = self.redis.hgetall(self._key(match_id))
        if not data:
            return None
            
        return {
            k.decode('utf-8'): v.decode('utf-8')
            for k, v in data.items()
        }

    def create_session(self, match_id: int, user_a_id: int, user_b_id: int):
        session = {
            "state": PeerSessionState.CREATED,
            "user_a_id": str(user_a_id),
            "user_b_id": str(user_b_id),
            "created_at": str(int(time.time())),
            "updated_at": str(int(time.time()))
        }
        self.redis.hset(self._key(match_id), mapping=session)
        self.redis.expire(self._key(match_id), self.ttl)
        
    def update_state(self, match_id: int, new_state: str):
        self.redis.hset(self._key(match_id), "state", new_state)
        self.redis.hset(self._key(match_id), "updated_at", str(int(time.time())))
        self.redis.expire(self._key(match_id), self.ttl)

    def delete_session(self, match_id: int):
        self.redis.delete(self._key(match_id))
        self.redis.delete(self._msg_key(match_id))

    def is_message_processed(self, match_id: int, correlation_id: str) -> bool:
        """
        Duplicate detection using a Redis set to track processed message correlation IDs.
        """
        # sadd returns 1 if added, 0 if already existed
        is_new = self.redis.sadd(self._msg_key(match_id), correlation_id) == 1
        if is_new:
            # Set TTL on the message key to avoid memory leak
            self.redis.expire(self._msg_key(match_id), self.ttl)
        return not is_new
