from asgiref.sync import sync_to_async
from .models import Notification
from typing import Dict, Any
from .dispatcher import NotificationDispatcher

class NotificationService:
    def create_notification(self, user_id: int, notif_type: str, content: str, payload: Dict[str, Any] = None):
        if payload is None:
            payload = {}
            
        notification = Notification.objects.create(
            user_id=user_id,
            type=notif_type,
            content=content,
            payload=payload
        )
        
        # Dispatch to realtime layer
        NotificationDispatcher.send_notification(user_id, notification)
        return notification

    @sync_to_async
    def mark_read_async(self, notification_id: int, user_id: int):
        Notification.objects.filter(id=notification_id, user_id=user_id).update(is_read=True)

    @sync_to_async
    def mark_all_read_async(self, user_id: int):
        Notification.objects.filter(user_id=user_id, is_read=False).update(is_read=True)
