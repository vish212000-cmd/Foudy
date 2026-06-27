from typing import Optional
from rooms.repositories.redis_repo import RedisRoomRepository
from rooms.repositories.room_repo import RoomRepository

class ParticipantManager:
    def __init__(self):
        self.redis_repo = RedisRoomRepository()
        self.db_repo = RoomRepository()

    def mark_joining(self, room_id: int, user_id: int) -> None:
        self.redis_repo.set_participant_state(room_id, user_id, 'JOINING')
        self.db_repo.update_participant_status(room_id, user_id, 'JOINING')

    def mark_active(self, room_id: int, user_id: int) -> None:
        self.redis_repo.set_participant_state(room_id, user_id, 'ACTIVE')
        self.db_repo.update_participant_status(room_id, user_id, 'ACTIVE')

    def mark_disconnected(self, room_id: int, user_id: int) -> None:
        self.redis_repo.set_participant_state(room_id, user_id, 'DISCONNECTED')
        self.db_repo.update_participant_status(room_id, user_id, 'DISCONNECTED')

    def mark_reconnecting(self, room_id: int, user_id: int) -> None:
        self.redis_repo.set_participant_state(room_id, user_id, 'RECONNECTING')
        self.db_repo.update_participant_status(room_id, user_id, 'RECONNECTING')

    def mark_left(self, room_id: int, user_id: int) -> None:
        self.redis_repo.remove_participant(room_id, user_id)
        self.db_repo.update_participant_status(room_id, user_id, 'LEFT')

    def mark_removed(self, room_id: int, user_id: int) -> None:
        self.redis_repo.remove_participant(room_id, user_id)
        self.db_repo.update_participant_status(room_id, user_id, 'REMOVED')
