from django.db import models
from core.models import BaseModel
from django.conf import settings

class SessionLog(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='session_logs')
    session_duration_seconds = models.IntegerField(default=0)
    device_info = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"SessionLog {self.id} for {self.user}"
