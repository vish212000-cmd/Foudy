import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from .repository import RedisPresenceRepository, PresenceState
from .heartbeat import HeartbeatService
from .presence_manager import PresenceManager
from .recovery import SessionRecovery
from signaling.dispatcher import SignalingEventDispatcher
from chat.dispatcher import MessageDispatcher
from rooms.dispatcher import RoomEventDispatcher
from rooms.dispatcher_group import GroupEventDispatcher
from notifications.dispatcher import NotificationDispatcher

class RealtimeGateway(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get("user")
        if not self.user or self.user.is_anonymous:
            await self.close()
            return
            
        self.user_id = self.user.id
        self.connection_id = str(uuid.uuid4())
        self.group_name = f"user_{self.user_id}"

        # Initialize services
        self.presence_manager = PresenceManager()
        self.heartbeat_service = HeartbeatService()
        self.recovery_service = SessionRecovery()
        self.signaling_dispatcher = SignalingEventDispatcher()
        self.chat_dispatcher = MessageDispatcher()
        self.room_dispatcher = RoomEventDispatcher(self)
        self.group_dispatcher = GroupEventDispatcher(self)
        self.notification_dispatcher = NotificationDispatcher(self)

        # Add to channels group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()

        # Handle presence
        is_new_online = self.presence_manager.handle_connect(self.user_id, self.connection_id)
        if is_new_online:
            # In a full system, we might broadcast presence.online to friends here
            pass

        # Send initial state
        await self.send_json({
            "event": "presence.update",
            "payload": {"state": self.presence_manager.repo.get_state(self.user_id)}
        })

    async def disconnect(self, close_code):
        if hasattr(self, 'user_id'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            
            is_last_offline = self.presence_manager.handle_disconnect(self.user_id, self.connection_id)
            if is_last_offline:
                # Could broadcast presence.offline
                pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            event = data.get('event')
            
            if event == 'heartbeat':
                self.heartbeat_service.process_heartbeat(self.user_id)
                await self.send_json({"event": "heartbeat.ack"})
                
            elif event == 'session.resume':
                success, state, payload = self.recovery_service.attempt_recovery(self.user_id)
                if success:
                    await self.send_json({
                        "event": "session.resume.success",
                        "payload": {"state": state, "data": payload}
                    })
                else:
                    await self.send_json({"event": "session.resume.failed"})

            elif event and event.startswith('signaling.'):
                response = self.signaling_dispatcher.dispatch(self.user_id, event, data.get('payload', {}))
                await self.send_json(response)
                
            elif event and event.startswith('chat.'):
                response = self.chat_dispatcher.dispatch(self.user_id, event, data.get('payload', {}))
                await self.send_json(response)
                
            elif event and event.startswith('room.'):
                await self.room_dispatcher.dispatch(event, data.get('payload', {}))
                
            elif event and event.startswith('group.'):
                await self.group_dispatcher.dispatch(self.user_id, event, data.get('payload', {}))
                
            elif event and event.startswith('notification.'):
                response = await self.notification_dispatcher.dispatch(self.user_id, event, data.get('payload', {}))
                await self.send_json(response)

        except json.JSONDecodeError:
            pass

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))
        
    # Standard group message handler (e.g. from matching engine)
    async def realtime_event(self, event):
        await self.send_json({
            "event": event["event"],
            "payload": event["payload"]
        })

    async def broadcast_message(self, event):
        await self.send_json(event["message"])
