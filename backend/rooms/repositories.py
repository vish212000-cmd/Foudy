from core.repositories import BaseRepository
from rooms.models import Room
from typing import List

class RoomRepository(BaseRepository[Room]):
    def __init__(self):
        super().__init__(Room)

    def get_active_rooms(self) -> List[Room]:
        return list(self.model_class.objects.filter(status=Room.Status.ACTIVE))
