from django.db import models
from core.models import BaseModel
from django.conf import settings
from rooms.models import Room

class Message(BaseModel):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages_sent')
    content = models.TextField()
    is_edited = models.BooleanField(default=False)

    def __str__(self):
        return f"Msg from {self.sender} in {self.room}"
