import secrets
import string
from typing import Optional
from rooms.repositories.redis_repo import RedisRoomRepository

class InviteService:
    def __init__(self):
        self.redis_repo = RedisRoomRepository()

    def generate_invite_code(self, length: int = 10) -> str:
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    def create_invite(self, room_id: int, ttl: int = 86400) -> str:
        code = self.generate_invite_code()
        self.redis_repo.create_invite(room_id, code, ttl=ttl)
        return code

    def validate_invite(self, invite_code: str) -> Optional[int]:
        return self.redis_repo.get_room_by_invite(invite_code)

    def revoke_invite(self, invite_code: str) -> None:
        self.redis_repo.revoke_invite(invite_code)
