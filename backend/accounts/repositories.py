from core.repositories import BaseRepository
from accounts.models import User
from typing import Optional

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    def get_by_email(self, email: str) -> Optional[User]:
        try:
            return self.model_class.objects.get(email=email)
        except self.model_class.DoesNotExist:
            return None
