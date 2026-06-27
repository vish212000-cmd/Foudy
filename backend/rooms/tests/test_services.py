from django.test import TestCase
from django.contrib.auth import get_user_model
from rooms.services.room import RoomService
from rooms.models import Room, RoomParticipant
import time

User = get_user_model()

class RoomServiceTests(TestCase):
    def setUp(self):
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
