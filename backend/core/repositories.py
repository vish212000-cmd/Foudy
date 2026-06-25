from typing import TypeVar, Generic, Optional
from django.db.models import Model

T = TypeVar('T', bound=Model)

class BaseRepository(Generic[T]):
    def __init__(self, model_class: type[T]):
        self.model_class = model_class

    def get_by_id(self, id) -> Optional[T]:
        try:
            return self.model_class.objects.get(id=id)
        except self.model_class.DoesNotExist:
            return None

    def save(self, instance: T) -> T:
        instance.save()
        return instance

    def delete(self, instance: T) -> None:
        instance.delete()
