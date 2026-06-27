from django.db import models
from core.models import BaseModel
from django.conf import settings

class Profile(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.CharField(max_length=160, blank=True)
    interests = models.JSONField(default=list, blank=True)
    keywords = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    country = models.CharField(max_length=2, blank=True)
    gender_preference = models.CharField(max_length=20, blank=True)
    privacy_settings = models.JSONField(default=dict, blank=True)
    notification_settings = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)

    @property
    def completion_score(self):
        score = 0
        if self.avatar: score += 10
        if self.display_name: score += 15
        if self.interests: score += 25
        if self.keywords: score += 15
        if self.languages: score += 15
        if self.country: score += 10
        if self.bio: score += 10
        return score

    def __str__(self):
        return f"Profile of {self.user.email}"
