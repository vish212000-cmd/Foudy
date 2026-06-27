from rooms.repositories.redis_repo import RedisRoomRepository
import json

class GroupRecoveryService:
    """Handles host reassignment, ICE restarts, and disconnects."""
    
    def __init__(self):
        self.redis_repo = RedisRoomRepository()

    def handle_host_disconnect(self, room_id: int, current_host_id: int) -> int:
        """Assigns a new host if the current host disconnects. Returns new host id or None."""
        participants = self.redis_repo.get_participants(room_id)
        active_ids = [int(uid) for uid, state in participants.items() if state not in ['LEFT', 'DISCONNECTED']]
        
        if not active_ids:
            return None
            
        new_host = active_ids[0]
        self.redis_repo.set_host(room_id, new_host)
        return new_host

    def cleanup_resources(self, room_id: int):
        """Cleans up all group call specific keys."""
        # This could delete media states, quality states, etc.
        keys = self.redis_repo.redis.keys(f"room:{room_id}:media:*")
        keys.extend(self.redis_repo.redis.keys(f"room:{room_id}:quality"))
        if keys:
            self.redis_repo.redis.delete(*keys)
