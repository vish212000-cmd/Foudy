from .repository import PeerRepository, PeerSessionState
from typing import Optional, Dict, Any

class IllegalStateTransition(Exception):
    pass

class PeerSessionManager:
    """
    Manages the lifecycle of a WebRTC PeerSession and enforces valid state transitions.
    """
    
    # Valid transitions from each state
    VALID_TRANSITIONS = {
        PeerSessionState.CREATED: [PeerSessionState.NEGOTIATING, PeerSessionState.CLOSED],
        PeerSessionState.NEGOTIATING: [PeerSessionState.CONNECTED, PeerSessionState.FAILED, PeerSessionState.CLOSED],
        PeerSessionState.CONNECTED: [PeerSessionState.RENEGOTIATING, PeerSessionState.DISCONNECTED, PeerSessionState.CLOSED],
        PeerSessionState.RENEGOTIATING: [PeerSessionState.CONNECTED, PeerSessionState.FAILED, PeerSessionState.CLOSED],
        PeerSessionState.DISCONNECTED: [PeerSessionState.RENEGOTIATING, PeerSessionState.CLOSED, PeerSessionState.FAILED],
        PeerSessionState.FAILED: [PeerSessionState.CLOSED],
        PeerSessionState.CLOSED: []
    }

    def __init__(self):
        self.repo = PeerRepository()

    def get_or_create_session(self, match_id: int, user_a_id: int, user_b_id: int) -> Dict[str, Any]:
        session = self.repo.get_session(match_id)
        if not session:
            self.repo.create_session(match_id, user_a_id, user_b_id)
            session = self.repo.get_session(match_id)
        return session

    def transition_state(self, match_id: int, new_state: str) -> bool:
        session = self.repo.get_session(match_id)
        if not session:
            return False
            
        current_state = session.get('state')
        if current_state == new_state:
            return True # Already in target state
            
        allowed = self.VALID_TRANSITIONS.get(current_state, [])
        if new_state not in allowed:
            raise IllegalStateTransition(f"Cannot transition from {current_state} to {new_state}")
            
        self.repo.update_state(match_id, new_state)
        return True

    def mark_negotiating(self, match_id: int):
        self.transition_state(match_id, PeerSessionState.NEGOTIATING)
        
    def mark_connected(self, match_id: int):
        self.transition_state(match_id, PeerSessionState.CONNECTED)
        
    def mark_failed(self, match_id: int):
        self.transition_state(match_id, PeerSessionState.FAILED)
        
    def close_session(self, match_id: int):
        self.transition_state(match_id, PeerSessionState.CLOSED)
