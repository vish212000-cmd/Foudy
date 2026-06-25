from django.db import models
from core.models import BaseModel
from django.conf import settings

class Room(BaseModel):
    class Status(models.TextChoices):
        WAITING = 'WAITING', 'Waiting'
        ACTIVE = 'ACTIVE', 'Active'
        CLOSED = 'CLOSED', 'Closed'
        
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.WAITING)
    closed_at = models.DateTimeField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Room {self.id} ({self.status})"

class RoomParticipant(BaseModel):
    class Role(models.TextChoices):
        HOST = 'HOST', 'Host'
        MEMBER = 'MEMBER', 'Member'
        
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_participations')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('room', 'user')

    def __str__(self):
        return f"{self.user} in {self.room}"
