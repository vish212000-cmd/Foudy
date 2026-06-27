import logging
from typing import Dict, Any
from .services import SignalingService, UnauthorizedSignalingError, InvalidSignalingPayload

logger = logging.getLogger(__name__)

class SignalingEventDispatcher:
    """
    Parses and routes raw WebSocket JSON events to the SignalingService.
    Generates ACKs or ERRORs based on the service response.
    """
    def __init__(self):
        self.service = SignalingService()
        
    def dispatch(self, user_id: int, event: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns a dictionary response to be sent back to the sender (ACK or NACK).
        """
        try:
            ack = self.service.process_event(user_id, event, payload)
            return {
                "event": "signaling.ack",
                "payload": ack
            }
        except UnauthorizedSignalingError as e:
            return {
                "event": "signaling.error",
                "payload": {
                    "code": 403,
                    "message": str(e),
                    "correlationId": payload.get("correlationId")
                }
            }
        except InvalidSignalingPayload as e:
            return {
                "event": "signaling.error",
                "payload": {
                    "code": 400,
                    "message": str(e),
                    "correlationId": payload.get("correlationId")
                }
            }
        except Exception as e:
            logger.exception("Internal signaling error")
            return {
                "event": "signaling.error",
                "payload": {
                    "code": 500,
                    "message": "Internal server error",
                    "correlationId": payload.get("correlationId")
                }
            }
