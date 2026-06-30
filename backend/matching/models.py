from django.db import models
from core.models import BaseModel
from django.conf import settings

class MatchQueue(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='match_queues')
    score = models.IntegerField(default=0)
    preferences = models.JSONField(default=dict)
    matched_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    def __str__(self):
        return f"Queue entry for {self.user}"

    class Meta:
        indexes = [
            models.Index(fields=['is_active', 'score', 'created_at']),
        ]
