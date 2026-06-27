from django.db import models
from core.models import BaseModel
from django.conf import settings

class Report(BaseModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        REVIEWED = 'REVIEWED', 'Reviewed'
        DISMISSED = 'DISMISSED', 'Dismissed'

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_submitted')
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_received')
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    def __str__(self):
        return f"Report by {self.reporter} against {self.reported_user}"

class Block(BaseModel):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocks_initiated')
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocks_received')

    class Meta:
        unique_together = ('blocker', 'blocked')
        indexes = [
            models.Index(fields=['blocker']),
            models.Index(fields=['blocked']),
        ]

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"

class AuditLog(BaseModel):
    class Action(models.TextChoices):
        BLOCK = 'BLOCK', 'Block'
        UNBLOCK = 'UNBLOCK', 'Unblock'
        REPORT = 'REPORT', 'Report'
        SESSION_TERMINATED = 'SESSION_TERMINATED', 'Session Terminated'
        
    action = models.CharField(max_length=50, choices=Action.choices)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_actions')
    target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_targets')
    details = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.action} by {self.actor} on {self.target} at {self.created_at}"
