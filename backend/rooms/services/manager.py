from rooms.repositories.redis_repo import RedisRoomRepository
from rooms.repositories.room_repo import RoomRepository

class RoomManager:
    """Orchestrates DB and Redis room state synchronization."""
    def __init__(self):
        self.redis_repo = RedisRoomRepository()
        self.db_repo = RoomRepository()

    def create_synced_room(self, host_user, max_participants: int, settings: dict):
        # 1. Create in DB to get the ID and permanent record
        db_room = self.db_repo.create_room(host_user, max_participants, settings)
        
        # 2. Push to Redis for Realtime presence
        self.redis_repo.create_room(db_room.id, host_user.id, max_participants, settings)
        
        return db_room

    def sync_room_state(self, room_id: int, state: str):
        self.redis_repo.set_room_state(room_id, state)
        self.db_repo.update_status(room_id, state)

    def sync_room_lock(self, room_id: int, locked: bool):
        self.redis_repo.set_room_locked(room_id, locked)
        self.sync_room_state(room_id, 'LOCKED' if locked else 'ACTIVE')
