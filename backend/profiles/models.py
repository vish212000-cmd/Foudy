from django.db import models
from core.models import BaseModel
from django.conf import settings

class Profile(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    preferences = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"Profile of {self.user.email}"
