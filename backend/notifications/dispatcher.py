from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification

class NotificationDispatcher:
    def __init__(self, consumer):
        self.consumer = consumer
        self.channel_layer = get_channel_layer()
        self.service = NotificationService()

    async def dispatch(self, user_id, event, payload):
        """
        Handle incoming requests from the frontend (e.g. mark as read)
        """
        if event == "notification.mark_read":
            notification_id = payload.get("notification_id")
            if notification_id:
                # Need to run sync db calls via sync_to_async or offload
                await self.service.mark_read_async(notification_id, user_id)
                return {"event": "notification.marked_read", "payload": {"id": notification_id}}
                
        elif event == "notification.mark_all_read":
            await self.service.mark_all_read_async(user_id)
            return {"event": "notification.all_marked_read", "payload": {}}

        return {"event": "notification.error", "payload": {"message": "Unknown event"}}

    @staticmethod
    def send_notification(user_id: int, notification: Notification):
        """
        Push notification from backend to user via WebSocket.
        """
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                "type": "realtime_event",
                "event": {
                    "event": "notification.new",
                    "payload": {
                        "id": notification.id,
                        "type": notification.type,
                        "content": notification.content,
                        "payload": notification.payload,
                        "created_at": str(notification.created_at)
                    }
                }
            }
        )

# Avoiding circular imports
from .services import NotificationService
