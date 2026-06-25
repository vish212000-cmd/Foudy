from django.db import models
from core.models import BaseModel
from django.conf import settings

class Notification(BaseModel):
    class Type(models.TextChoices):
        MATCH = 'MATCH', 'Match'
        SYSTEM = 'SYSTEM', 'System'
        MESSAGE = 'MESSAGE', 'Message'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=Type.choices)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    payload = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.type} Notification for {self.user}"
