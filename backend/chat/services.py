from typing import Dict, Any, Optional
import html
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from signaling.repository import PeerRepository
from .repository import ChatRepository

class ChatError(Exception):
    def __init__(self, message: str, code: int = 400):
        super().__init__(message)
        self.code = code

class ChatService:
    """
    Core business logic for volatile 1:1 chat routing.
    """
    MAX_MESSAGE_LENGTH = 1000

    def __init__(self):
        self.peer_repo = PeerRepository()
        self.chat_repo = ChatRepository()

    def _route_message(self, target_user_id: str, event: str, payload: Dict[str, Any]):
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"user_{target_user_id}",
                {
                    "type": "realtime_event",
                    "event": event,
                    "payload": payload
                }
            )

    def _validate_session(self, user_id: int, payload: Dict[str, Any]) -> str:
        """
        Returns the target user ID if valid.
        """
        match_id = payload.get("matchId")
        if not match_id:
            raise ChatError("Missing matchId")

        session = self.peer_repo.get_session(match_id)
        if not session:
            raise ChatError("Match session does not exist or has expired.", code=403)
            
        if str(user_id) not in (session["user_a_id"], session["user_b_id"]):
            raise ChatError("User does not belong to this match.", code=403)
            
        return session["user_b_id"] if str(user_id) == session["user_a_id"] else session["user_a_id"]

    def process_event(self, user_id: int, event_type: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        correlation_id = payload.get("correlationId")
        if not correlation_id:
            raise ChatError("Missing correlationId")

        # Deduplication
        if self.chat_repo.is_message_processed(correlation_id):
            return {"status": "ok", "correlationId": correlation_id, "duplicate": True}

        # Rate Limiting
        if not self.chat_repo.check_rate_limit(user_id):
            raise ChatError("Rate limit exceeded. Please slow down.", code=429)

        target_user_id = self._validate_session(user_id, payload)

        if event_type == "chat.message":
            content = payload.get("content", "")
            if not content:
                raise ChatError("Message content cannot be empty.")
            
            if len(content) > self.MAX_MESSAGE_LENGTH:
                raise ChatError(f"Message exceeds maximum length of {self.MAX_MESSAGE_LENGTH}.")

            # XSS Protection
            escaped_content = html.escape(content)
            
            payload["content"] = escaped_content
            payload["senderId"] = str(user_id)
            payload["timestamp"] = int(time.time() * 1000)
            
            self._route_message(target_user_id, event_type, payload)

        elif event_type in ["chat.typing", "chat.typing_stop"]:
            payload["senderId"] = str(user_id)
            self._route_message(target_user_id, event_type, payload)

        elif event_type == "chat.delivered":
            # Pass delivery ack back to sender
            self._route_message(target_user_id, event_type, payload)
            
        else:
            raise ChatError(f"Unknown chat event type {event_type}")

        return {"status": "ok", "correlationId": correlation_id}
