from typing import Dict, Any, Optional
from rooms.repositories.redis_repo import RedisRoomRepository

class GroupCallManager:
    """Manages the FSM and core lifecycle of a group call inside a room."""
    
    VALID_STATES = [
        'INITIALIZING', 'JOINING', 'NEGOTIATING', 'CONNECTED',
        'ACTIVE', 'PARTICIPANT_JOINING', 'PARTICIPANT_LEAVING',
        'RECONNECTING', 'ENDING', 'ENDED', 'ERROR'
    ]

    def __init__(self):
        self.redis_repo = RedisRoomRepository()

    def set_state(self, room_id: int, state: str) -> None:
        if state not in self.VALID_STATES:
            raise ValueError(f"Invalid group call state: {state}")
        # Store group state as a specific field in the room hash
        self.redis_repo.set_room_state(room_id, state)

    def get_state(self, room_id: int) -> Optional[str]:
        # Using existing room state abstraction
        state = self.redis_repo.get_room_state(room_id)
        if state and state in self.VALID_STATES:
            return state
        return None

    def initialize_call(self, room_id: int) -> None:
        self.set_state(room_id, 'INITIALIZING')
        
    def mark_active(self, room_id: int) -> None:
        self.set_state(room_id, 'ACTIVE')

    def end_call(self, room_id: int) -> None:
        self.set_state(room_id, 'ENDING')
        # Here we would trigger cleanup
        self.set_state(room_id, 'ENDED')
