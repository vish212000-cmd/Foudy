from typing import Optional
from rooms.services.manager import RoomManager
from rooms.services.participant import ParticipantManager
from rooms.services.permission import RoomPermissionService
from rooms.services.lifecycle import RoomLifecycleManager
from rooms.repositories.redis_repo import RedisRoomRepository

class RoomService:
    """High-level orchestration of room business logic."""
    def __init__(self):
        self.manager = RoomManager()
        self.participants = ParticipantManager()
        self.permissions = RoomPermissionService()
        self.lifecycle = RoomLifecycleManager()
        self.redis_repo = RedisRoomRepository()

    def create_room(self, host_user, max_participants: int = 10, settings: dict = None):
        if settings is None:
            settings = {}
        room = self.manager.create_synced_room(host_user, max_participants, settings)
        self.participants.mark_active(room.id, host_user.id)
        return room

    def join_room(self, room_id: int, user):
        self.permissions.check_can_join(room_id, user.id)
        self.participants.mark_joining(room_id, user.id)
        # Assuming connection is established quickly after, we move them to ACTIVE
        self.participants.mark_active(room_id, user.id)

    def leave_room(self, room_id: int, user_id: int):
        self.participants.mark_left(room_id, user_id)
        
        # If the user leaving is the host, trigger host disconnect strategy
        host_id = self.redis_repo.get_host(room_id)
        if host_id == user_id:
            self.lifecycle.cleanup_room(room_id)

    def kick_participant(self, room_id: int, host_id: int, target_user_id: int):
        self.permissions.require_host(room_id, host_id)
        if host_id == target_user_id:
            raise ValueError("Host cannot kick themselves.")
            
        self.participants.mark_removed(room_id, target_user_id)

    def toggle_lock(self, room_id: int, host_id: int, locked: bool):
        self.permissions.require_host(room_id, host_id)
        self.manager.sync_room_lock(room_id, locked)

    def transfer_host(self, room_id: int, current_host_id: int, new_host_id: int):
        self.permissions.require_host(room_id, current_host_id)
        if self.redis_repo.get_participant_state(room_id, new_host_id) is None:
            raise ValueError("New host must be an active participant.")
            
        self.redis_repo.set_host(room_id, new_host_id)

    def handle_disconnect(self, room_id: int, user_id: int):
        self.participants.mark_disconnected(room_id, user_id)
        host_id = self.redis_repo.get_host(room_id)
        if host_id == user_id:
            self.lifecycle.handle_host_disconnect(room_id)
