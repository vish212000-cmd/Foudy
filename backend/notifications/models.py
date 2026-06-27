from django.db import models
from core.models import BaseModel
from django.conf import settings

class Notification(BaseModel):
    class Type(models.TextChoices):
        MATCH = 'MATCH', 'Match Found'
        MATCH_CANCELLED = 'MATCH_CANCELLED', 'Match Cancelled'
        ROOM_INVITE = 'ROOM_INVITE', 'Room Invite'
        ROOM_JOINED = 'ROOM_JOINED', 'Room Joined'
        ROOM_CLOSED = 'ROOM_CLOSED', 'Room Closed'
        HOST_CHANGED = 'HOST_CHANGED', 'Host Changed'
        PARTICIPANT_JOINED = 'PARTICIPANT_JOINED', 'Participant Joined'
        PARTICIPANT_LEFT = 'PARTICIPANT_LEFT', 'Participant Left'
        RECONNECT_SUCCESS = 'RECONNECT_SUCCESS', 'Reconnect Success'
        RECONNECT_FAILED = 'RECONNECT_FAILED', 'Reconnect Failed'
        MEDIA_PERMISSION_REQUIRED = 'MEDIA_PERMISSION_REQUIRED', 'Media Permission Required'
        USER_BLOCKED = 'USER_BLOCKED', 'User Blocked'
        USER_REPORTED = 'USER_REPORTED', 'User Reported'
        SYSTEM_NOTICE = 'SYSTEM_NOTICE', 'System Notice'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=50, choices=Type.choices)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    payload = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.type} Notification for {self.user}"

class NotificationSettings(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_settings')
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    sound_enabled = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Settings for {self.user}"
