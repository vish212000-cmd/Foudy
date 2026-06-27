from typing import Optional
from .repository import RedisPresenceRepository, PresenceState

class PresenceManager:
    """
    Validates explicit transitions between presence states and updates the repository.
    """
    def __init__(self):
        self.repo = RedisPresenceRepository()

    def update_presence(self, user_id: int, new_state: str) -> bool:
        current_state = self.repo.get_state(user_id)
        
        # Valid state transitions
        valid_transitions = {
            PresenceState.OFFLINE: [PresenceState.ONLINE, PresenceState.RECONNECTING],
            PresenceState.ONLINE: [
                PresenceState.OFFLINE, 
                PresenceState.AWAY, 
                PresenceState.MATCHING, 
                PresenceState.IN_ROOM,
                PresenceState.IN_CALL,
                PresenceState.DISCONNECTED
            ],
            PresenceState.AWAY: [
                PresenceState.ONLINE, 
                PresenceState.OFFLINE,
                PresenceState.DISCONNECTED
            ],
            PresenceState.MATCHING: [
                PresenceState.ONLINE, 
                PresenceState.IN_ROOM, 
                PresenceState.IN_CALL,
                PresenceState.DISCONNECTED
            ],
            PresenceState.IN_ROOM: [
                PresenceState.ONLINE, 
                PresenceState.IN_CALL,
                PresenceState.DISCONNECTED
            ],
            PresenceState.IN_CALL: [
                PresenceState.ONLINE, 
                PresenceState.IN_ROOM,
                PresenceState.DISCONNECTED
            ],
            PresenceState.DISCONNECTED: [
                PresenceState.RECONNECTING, 
                PresenceState.OFFLINE,
                PresenceState.ONLINE
            ],
            PresenceState.RECONNECTING: [
                PresenceState.ONLINE, 
                PresenceState.OFFLINE,
                PresenceState.DISCONNECTED,
                PresenceState.IN_ROOM,
                PresenceState.IN_CALL
            ]
        }

        allowed = valid_transitions.get(current_state, [])
        if new_state in allowed or current_state == new_state:
            self.repo.set_state(user_id, new_state)
            return True
        return False

    def handle_connect(self, user_id: int, connection_id: str):
        is_first = self.repo.add_connection(user_id, connection_id)
        if is_first:
            self.update_presence(user_id, PresenceState.ONLINE)
        return is_first

    def handle_disconnect(self, user_id: int, connection_id: str):
        is_last = self.repo.remove_connection(user_id, connection_id)
        if is_last:
            self.repo.set_state(user_id, PresenceState.DISCONNECTED)
        return is_last
