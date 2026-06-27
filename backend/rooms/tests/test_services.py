from django.test import TestCase
from django.contrib.auth import get_user_model
from rooms.services.room import RoomService
from rooms.models import Room, RoomParticipant
from unittest.mock import patch
User = get_user_model()

class FakeRedis:
    _shared_data = {}
    def __init__(self, *args, **kwargs):
        self.data = self._shared_data
    def pipeline(self): return self
    def hset(self, k, key=None, value=None, mapping=None):
        if k not in self.data: self.data[k] = {}
        if mapping: self.data[k].update({str(x): str(y) for x, y in mapping.items()})
        if key: self.data[k][str(key)] = str(value)
    def set(self, k, v, ex=None): self.data[k] = str(v)
    def sadd(self, k, *v):
        if k not in self.data: self.data[k] = set()
        for x in v: self.data[k].add(str(x))
    def expire(self, k, ttl): pass
    def execute(self): pass
    def get(self, k): return self.data.get(k)
    def exists(self, k): return k in self.data
    def hgetall(self, k): return self.data.get(k, {})
    def hget(self, k, k2): return self.data.get(k, {}).get(str(k2))
    def smembers(self, k): return self.data.get(k, set())
    def sismember(self, k, v): return str(v) in self.data.get(k, set())
    def scard(self, k): return len(self.data.get(k, set()))
    def srem(self, k, v):
        if k in self.data and str(v) in self.data[k]: self.data[k].remove(str(v))
    def hdel(self, k, k2):
        if k in self.data and str(k2) in self.data[k]: del self.data[k][str(k2)]
    def delete(self, *keys):
        for k in keys: self.data.pop(k, None)
    @classmethod
    def from_url(cls, *args, **kwargs):
        return cls()

class RoomServiceTests(TestCase):
    def setUp(self):
        FakeRedis._shared_data.clear()
        self.redis_patcher = patch('rooms.repositories.redis_repo.redis.Redis.from_url', side_effect=FakeRedis.from_url)
        self.mock_redis = self.redis_patcher.start()
        self.addCleanup(self.redis_patcher.stop)
        
        self.host = User.objects.create_user(email='host@example.com', password='pwd')
        self.user2 = User.objects.create_user(email='user2@example.com', password='pwd')
        self.service = RoomService()

    def test_create_room(self):
        room = self.service.create_room(self.host, max_participants=5)
        self.assertEqual(room.max_participants, 5)
        self.assertEqual(room.status, 'CREATED')
        
        # Check DB participant
        part = RoomParticipant.objects.get(room=room, user=self.host)
        self.assertEqual(part.role, 'HOST')
        self.assertEqual(part.status, 'ACTIVE')
        
        # Check Redis
        redis_host = self.service.redis_repo.get_host(room.id)
        self.assertEqual(redis_host, self.host.id)
        
        state = self.service.redis_repo.get_room_state(room.id)
        self.assertEqual(state, 'CREATED')

    def test_join_leave_room(self):
        room = self.service.create_room(self.host)
        
        # User 2 joins
        self.service.join_room(room.id, self.user2)
        parts = self.service.redis_repo.get_participants(room.id)
        self.assertIn(self.user2.id, parts)
        self.assertEqual(self.service.redis_repo.get_participant_state(room.id, self.user2.id), 'ACTIVE')
        
        # User 2 leaves
        self.service.leave_room(room.id, self.user2.id)
        parts = self.service.redis_repo.get_participants(room.id)
        self.assertNotIn(self.user2.id, parts)
