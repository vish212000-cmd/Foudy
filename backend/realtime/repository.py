import time
from typing import Optional, Set
from django.conf import settings
import redis

class PresenceState:
    OFFLINE = "OFFLINE"
    ONLINE = "ONLINE"
    MATCHING = "MATCHING"
    IN_CALL = "IN_CALL"
    IN_ROOM = "IN_ROOM"
    AWAY = "AWAY"
    RECONNECTING = "RECONNECTING"
    DISCONNECTED = "DISCONNECTED"

class RedisPresenceRepository:
    """
    Manages user presence and multiple connections per user.
    Uses Redis Hashes for state, and Sets for active connection tracking.
    """
    @property
    def redis(self):
        from core.redis_client import get_redis_client
        client = get_redis_client()
        if not client:
            raise Exception("Redis is unavailable.")
        return client

    def __init__(self):
        self.presence_prefix = "foudy:presence:user:"
        self.conn_prefix = "foudy:presence:connections:"
        self.ttl = 30 # seconds

    def _user_key(self, user_id: int) -> str:
        return f"{self.presence_prefix}{user_id}"

    def _conn_key(self, user_id: int) -> str:
        return f"{self.conn_prefix}{user_id}"

    def get_state(self, user_id: int) -> str:
        state = self.redis.hget(self._user_key(user_id), "state")
        if not state:
            return PresenceState.OFFLINE
        return state.decode('utf-8')

    def set_state(self, user_id: int, state: str):
        self.redis.hset(self._user_key(user_id), "state", state)
        self.redis.hset(self._user_key(user_id), "updated_at", int(time.time()))
        self.refresh_ttl(user_id)

    def refresh_ttl(self, user_id: int):
        self.redis.expire(self._user_key(user_id), self.ttl)
        self.redis.expire(self._conn_key(user_id), self.ttl)

    def add_connection(self, user_id: int, connection_id: str) -> bool:
        """
        Adds a connection. Returns True if this is the first connection (user came online).
        """
        is_new = self.redis.scard(self._conn_key(user_id)) == 0
        self.redis.sadd(self._conn_key(user_id), connection_id)
        self.refresh_ttl(user_id)
        return is_new

    def remove_connection(self, user_id: int, connection_id: str) -> bool:
        """
        Removes a connection. Returns True if this was the last connection (user went disconnected/offline).
        """
        self.redis.srem(self._conn_key(user_id), connection_id)
        count = self.redis.scard(self._conn_key(user_id))
        return count == 0

    def cleanup_user(self, user_id: int):
        self.redis.delete(self._user_key(user_id))
        self.redis.delete(self._conn_key(user_id))
