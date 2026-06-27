import logging
from typing import Dict, Any
from .services import ChatService, ChatError

logger = logging.getLogger(__name__)

class MessageDispatcher:
    """
    Parses and routes raw WebSocket JSON events to the ChatService.
    Generates ACKs or ERRORs based on the service response.
    """
    def __init__(self):
        self.service = ChatService()
        
    def dispatch(self, user_id: int, event: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns a dictionary response to be sent back to the sender (ACK or ERROR).
        """
        try:
            ack = self.service.process_event(user_id, event, payload)
            return {
                "event": "chat.ack",
                "payload": ack
            }
        except ChatError as e:
            return {
                "event": "chat.error",
                "payload": {
                    "code": e.code,
                    "message": str(e),
                    "correlationId": payload.get("correlationId")
                }
            }
        except Exception as e:
            logger.exception("Internal chat error")
            return {
                "event": "chat.error",
                "payload": {
                    "code": 500,
                    "message": "Internal server error",
                    "correlationId": payload.get("correlationId")
                }
            }
