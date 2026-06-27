from rooms.repositories.redis_repo import RedisRoomRepository
from rooms.repositories.room_repo import RoomRepository

class RoomLifecycleManager:
    def __init__(self):
        self.redis_repo = RedisRoomRepository()
        self.db_repo = RoomRepository()

    def handle_host_disconnect(self, room_id: int):
        # Called when the host disconnects from the websocket.
        # Strategy: Mark host as DISCONNECTED. Do NOT immediately transfer host or close.
        # Give them a TTL to reconnect. If they don't, the room state machine will close it later.
        host_id = self.redis_repo.get_host(room_id)
        if host_id:
            self.redis_repo.set_participant_state(room_id, host_id, 'DISCONNECTED')
            # The actual scheduled task for orphan cleanup would run separately via Celery or similar,
            # sweeping rooms where the host has been DISCONNECTED for > 30s.

    def cleanup_room(self, room_id: int):
        # Graceful room destruction
        self.redis_repo.set_room_state(room_id, 'CLOSING')
        
        # Persist final state to DB
        self.db_repo.close_room(room_id)
        
        # Clear redis cache
        self.redis_repo.destroy_room(room_id)
