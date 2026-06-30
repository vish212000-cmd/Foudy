from celery import shared_task
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger('foudy')

@shared_task
def cleanup_expired_sessions():
    """
    Periodic task to clean up old revoked sessions to save space.
    """
    logger.info("Running cleanup_expired_sessions task")
    from accounts.models import UserSession
    # Delete sessions older than 30 days that are revoked
    thirty_days_ago = timezone.now() - timedelta(days=30)
    deleted, _ = UserSession.objects.filter(is_revoked=True, created_at__lt=thirty_days_ago).delete()
    logger.info(f"Deleted {deleted} expired sessions.")
