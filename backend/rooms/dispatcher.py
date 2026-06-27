import uuid
from datetime import datetime
from realtime.services import BaseEventDispatcher

class RoomEventDispatcher(BaseEventDispatcher):
    def __init__(self, consumer):
        super().__init__(consumer)

    def _build_payload(self, room_id: int, event_name: str, data: dict):
        return {
            "version": "1.0",
            "correlationId": str(uuid.uuid4()),
            "roomId": room_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "event": event_name,
            "data": data
        }

    async def broadcast_to_room(self, room_id: int, event_name: str, data: dict):
        payload = self._build_payload(room_id, event_name, data)
        await self.consumer.channel_layer.group_send(
            f"room_{room_id}",
            {
                "type": "broadcast_message",
                "message": payload
            }
        )

    async def dispatch(self, action: str, data: dict):
        # We define simple actions for the consumer to handle if needed
        pass
