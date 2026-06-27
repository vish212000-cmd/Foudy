from typing import Optional, List
from rooms.repositories.redis_repo import RedisRoomRepository

class ParticipantCoordinator:
    """Coordinates participant joins, state, and max capacity limits."""
    
    MAX_PARTICIPANTS = 6
    
    VALID_STATES = [
        'JOINING', 'CONNECTED', 'MUTED', 'CAMERA_OFF',
        'SCREEN_SHARING_READY', 'DISCONNECTED', 'RECONNECTING', 'LEFT'
    ]

    def __init__(self):
        self.redis_repo = RedisRoomRepository()

    def check_capacity(self, room_id: int) -> bool:
        participants = self.redis_repo.get_participants(room_id)
        return len(participants) < self.MAX_PARTICIPANTS

    def set_participant_state(self, room_id: int, user_id: int, state: str) -> None:
        if state not in self.VALID_STATES:
            raise ValueError(f"Invalid participant state: {state}")
        self.redis_repo.set_participant_state(room_id, user_id, state)

    def get_participant_state(self, room_id: int, user_id: int) -> Optional[str]:
        return self.redis_repo.get_participant_state(room_id, user_id)

    def get_active_participants(self, room_id: int) -> List[int]:
        # Return all users not in LEFT or DISCONNECTED
        all_p = self.redis_repo.get_participants(room_id)
        active = []
        for user_id, state in all_p.items():
            if state not in ['LEFT', 'DISCONNECTED']:
                active.append(int(user_id))
        return active
