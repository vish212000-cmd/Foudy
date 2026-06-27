from django.db import models
from core.models import BaseModel
from django.conf import settings

class Room(BaseModel):
    class Status(models.TextChoices):
        CREATED = 'CREATED', 'Created'
        WAITING = 'WAITING', 'Waiting'
        ACTIVE = 'ACTIVE', 'Active'
        LOCKED = 'LOCKED', 'Locked'
        FULL = 'FULL', 'Full'
        CLOSING = 'CLOSING', 'Closing'
        CLOSED = 'CLOSED', 'Closed'
        DESTROYED = 'DESTROYED', 'Destroyed'
        
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    max_participants = models.IntegerField(default=10)
    closed_at = models.DateTimeField(null=True, blank=True)
    settings = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Room {self.id} ({self.status})"

class RoomParticipant(BaseModel):
    class Role(models.TextChoices):
        HOST = 'HOST', 'Host'
        MEMBER = 'MEMBER', 'Member'

    class Status(models.TextChoices):
        INVITED = 'INVITED', 'Invited'
        JOINING = 'JOINING', 'Joining'
        WAITING = 'WAITING', 'Waiting'
        ACTIVE = 'ACTIVE', 'Active'
        LEFT = 'LEFT', 'Left'
        REMOVED = 'REMOVED', 'Removed'
        DISCONNECTED = 'DISCONNECTED', 'Disconnected'
        RECONNECTING = 'RECONNECTING', 'Reconnecting'
        
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_participations')
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INVITED)
    joined_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('room', 'user')

    def __str__(self):
        return f"{self.user} in {self.room}"
