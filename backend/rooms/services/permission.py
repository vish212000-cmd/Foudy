from typing import Optional
from django.contrib.auth import get_user_model
from rooms.repositories.redis_repo import RedisRoomRepository
from moderation.services import ModerationRedisClient

User = get_user_model()

class RoomPermissionError(Exception):
    def __init__(self, message: str, code: int = 403):
        self.message = message
        self.code = code
        super().__init__(self.message)

class RoomPermissionService:
    def __init__(self):
        self.redis_repo = RedisRoomRepository()
        self.moderation_client = ModerationRedisClient()

    def check_can_join(self, room_id: int, user_id: int):
        state = self.redis_repo.get_room_state(room_id)
        if not state or state in ['CLOSING', 'CLOSED', 'DESTROYED']:
            raise RoomPermissionError("Room is no longer active", 404)

        if self.redis_repo.is_room_locked(room_id):
            raise RoomPermissionError("Room is locked")

        meta = self.redis_repo.get_room_metadata(room_id)
        max_parts = int(meta.get('max_participants', 10))
        current_parts = self.redis_repo.get_participant_count(room_id)
        
        if current_parts >= max_parts:
            # Check if user is already in the room (reconnecting)
            if self.redis_repo.get_participant_state(room_id, user_id) is None:
                raise RoomPermissionError("Room is full")

        # Check moderation blocks
        # 1. User cannot be blocked by the host
        host_id = self.redis_repo.get_host(room_id)
        if host_id and self.moderation_client.is_blocked(host_id, user_id):
            raise RoomPermissionError("You cannot join this room")

        # 2. User cannot join if they block the host
        if host_id and self.moderation_client.is_blocked(user_id, host_id):
            raise RoomPermissionError("You cannot join this room")
            
        return True

    def require_host(self, room_id: int, user_id: int):
        host_id = self.redis_repo.get_host(room_id)
        if host_id != user_id:
            raise RoomPermissionError("Host privileges required")
        return True
