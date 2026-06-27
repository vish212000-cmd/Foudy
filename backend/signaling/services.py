from typing import Dict, Any, Optional
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .manager import PeerSessionManager, PeerSessionState, IllegalStateTransition

class UnauthorizedSignalingError(Exception):
    pass

class InvalidSignalingPayload(Exception):
    pass

class SignalingService:
    """
    Core business logic for routing WebRTC signaling messages between peers.
    """
    def __init__(self):
        self.manager = PeerSessionManager()
        self.repo = self.manager.repo
        
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

    def _validate_and_get_session(self, user_id: int, payload: Dict[str, Any]) -> Dict[str, Any]:
        match_id = payload.get("matchId")
        if not match_id:
            raise InvalidSignalingPayload("Missing matchId")
            
        session = self.repo.get_session(match_id)
        if not session:
            # For simplicity, if session doesn't exist, we assume it's created by the first offer.
            # In production, matchmaking engine creates this. We allow creation if it's an offer.
            raise UnauthorizedSignalingError("Match session does not exist.")
            
        if str(user_id) not in (session["user_a_id"], session["user_b_id"]):
            raise UnauthorizedSignalingError("User does not belong to this match.")
            
        return session

    def process_event(self, user_id: int, event_type: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Processes a signaling event. Returns an ACK dict if successful.
        """
        correlation_id = payload.get("correlationId")
        match_id = payload.get("matchId")
        version = payload.get("version", "1.0")
        
        if not correlation_id or not match_id:
            raise InvalidSignalingPayload("Missing correlationId or matchId")

        # Duplicate detection (Replay protection)
        if self.repo.is_message_processed(match_id, correlation_id):
            # Already processed, just ack
            return {"status": "ok", "correlationId": correlation_id, "duplicate": True}

        # Initialize session lazily on OFFER for this phase if it doesn't exist
        # Normally matchmaking worker creates it, but we handle lazy init for testing
        if event_type == "signaling.offer":
            session = self.repo.get_session(match_id)
            if not session:
                target_user = payload.get("targetUserId")
                if not target_user:
                    raise InvalidSignalingPayload("Missing targetUserId for initial offer")
                self.manager.get_or_create_session(match_id, user_id, target_user)
                session = self.repo.get_session(match_id)
        else:
            session = self._validate_and_get_session(user_id, payload)

        target_user_id = session["user_b_id"] if str(user_id) == session["user_a_id"] else session["user_a_id"]

        try:
            if event_type == "signaling.offer":
                self.manager.transition_state(match_id, PeerSessionState.NEGOTIATING)
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.answer":
                self.manager.transition_state(match_id, PeerSessionState.CONNECTED)
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.ice_candidate":
                # ICE can happen anytime after CREATED
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.renegotiate":
                self.manager.transition_state(match_id, PeerSessionState.RENEGOTIATING)
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.disconnect":
                self.manager.transition_state(match_id, PeerSessionState.DISCONNECTED)
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.resume":
                # Assuming success sets it back to CONNECTED
                self.manager.transition_state(match_id, PeerSessionState.CONNECTED)
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.error":
                self.manager.transition_state(match_id, PeerSessionState.FAILED)
                self._route_message(target_user_id, event_type, payload)
                
            elif event_type == "signaling.media_update":
                # Purely a signaling hook for hardware lifecycle, no state change
                self._route_message(target_user_id, event_type, payload)
            else:
                raise InvalidSignalingPayload(f"Unknown event type {event_type}")
                
        except IllegalStateTransition as e:
            raise InvalidSignalingPayload(str(e))
            
        return {"status": "ok", "correlationId": correlation_id}
