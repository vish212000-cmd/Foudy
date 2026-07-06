import redis
from django.conf import settings
from typing import List, Dict, Optional, Set
import json
import time
import uuid

class RedisRoomRepository:
    def __init__(self):
        self.ttl = 3600 * 24 # 24 hour max TTL for rooms

    @property
    def redis(self):
        from core.redis_client import get_redis_client
        client = get_redis_client()
        if not client:
            raise Exception("Redis is unavailable.")
        return client

    # Key generators
    def _k_meta(self, room_id): return f"room:{room_id}"
    def _k_state(self, room_id): return f"room:state:{room_id}"
    def _k_host(self, room_id): return f"room:host:{room_id}"
    def _k_parts(self, room_id): return f"room:participants:{room_id}"
    def _k_presence(self, room_id): return f"room:presence:{room_id}"
    def _k_invite(self, invite_code): return f"room:invite:{invite_code}"
    def _k_locks(self, room_id): return f"room:locks:{room_id}"

    # Room creation
    def create_room(self, room_id: int, host_id: int, max_participants: int, settings: dict):
        pipe = self.redis.pipeline()
        pipe.hset(self._k_meta(room_id), mapping={
            'max_participants': max_participants,
            'settings': json.dumps(settings),
            'created_at': int(time.time())
        })
        pipe.set(self._k_state(room_id), 'CREATED')
        pipe.set(self._k_host(room_id), str(host_id))
        pipe.sadd(self._k_parts(room_id), str(host_id))
        pipe.hset(self._k_presence(room_id), str(host_id), 'JOINING')
        pipe.set(self._k_locks(room_id), '0') # 0 = unlocked, 1 = locked
        
        # Set expiry for all keys
        keys = [self._k_meta(room_id), self._k_state(room_id), self._k_host(room_id), 
                self._k_parts(room_id), self._k_presence(room_id), self._k_locks(room_id)]
        for k in keys:
            pipe.expire(k, self.ttl)
        pipe.execute()

    # Room State
    def get_room_state(self, room_id: int) -> Optional[str]:
        return self.redis.get(self._k_state(room_id))

    def set_room_state(self, room_id: int, state: str):
        self.redis.set(self._k_state(room_id), state, ex=self.ttl)

    def is_room_locked(self, room_id: int) -> bool:
        return self.redis.get(self._k_locks(room_id)) == '1'

    def set_room_locked(self, room_id: int, locked: bool):
        self.redis.set(self._k_locks(room_id), '1' if locked else '0', ex=self.ttl)

    # Room metadata
    def get_room_metadata(self, room_id: int) -> dict:
        data = self.redis.hgetall(self._k_meta(room_id))
        if data and 'settings' in data:
            data['settings'] = json.loads(data['settings'])
        return data

    def get_host(self, room_id) -> Optional[uuid.UUID]:
        host = self.redis.get(self._k_host(room_id))
        return uuid.UUID(host) if host else None

    def set_host(self, room_id: int, user_id: int):
        self.redis.set(self._k_host(room_id), str(user_id), ex=self.ttl)

    # Participants
    def get_participants(self, room_id) -> Set[uuid.UUID]:
        parts = self.redis.smembers(self._k_parts(room_id))
        return {uuid.UUID(p) for p in parts}

    def get_participant_count(self, room_id: int) -> int:
        return self.redis.scard(self._k_parts(room_id))

    def get_participant_state(self, room_id: int, user_id: int) -> Optional[str]:
        return self.redis.hget(self._k_presence(room_id), str(user_id))

    def set_participant_state(self, room_id: int, user_id: int, state: str):
        self.redis.sadd(self._k_parts(room_id), str(user_id))
        self.redis.hset(self._k_presence(room_id), str(user_id), state)
        
    def remove_participant(self, room_id: int, user_id: int):
        self.redis.srem(self._k_parts(room_id), str(user_id))
        self.redis.hdel(self._k_presence(room_id), str(user_id))

    # Invites
    def create_invite(self, room_id: int, invite_code: str, ttl: int = 3600):
        self.redis.set(self._k_invite(invite_code), room_id, ex=ttl)

    def get_room_by_invite(self, invite_code: str) -> Optional[uuid.UUID]:
        room_id = self.redis.get(self._k_invite(invite_code))
        return uuid.UUID(room_id) if room_id else None

    def revoke_invite(self, invite_code: str):
        self.redis.delete(self._k_invite(invite_code))

    # Cleanup
    def destroy_room(self, room_id: int):
        keys = [self._k_meta(room_id), self._k_state(room_id), self._k_host(room_id), 
                self._k_parts(room_id), self._k_presence(room_id), self._k_locks(room_id)]
        self.redis.delete(*keys)
