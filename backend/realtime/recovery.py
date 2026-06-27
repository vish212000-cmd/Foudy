from typing import Tuple, Optional, Dict, Any
from .repository import RedisPresenceRepository, PresenceState
# We will inspect matching repository safely
try:
    from matching.repository import QueueRepository, QueueState
except ImportError:
    QueueRepository = None
    QueueState = None

class SessionRecovery:
    def __init__(self):
        self.presence_repo = RedisPresenceRepository()
        self.matching_repo = QueueRepository() if QueueRepository else None

    def attempt_recovery(self, user_id: int) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Checks if the user had an active session (SEARCHING, MATCHED, IN_ROOM) before disconnecting.
        Returns (success, state_restored, payload)
        """
        # First check Matchmaking state
        if self.matching_repo:
            match_data = self.matching_repo.get_user_state(user_id)
            if match_data:
                m_state = match_data.get('state')
                if m_state == QueueState.QUEUED.value or m_state == QueueState.MATCHING.value:
                    self.presence_repo.set_state(user_id, PresenceState.MATCHING)
                    return True, PresenceState.MATCHING, {"status": "MATCHING"}
                elif m_state == QueueState.MATCHED.value:
                    self.presence_repo.set_state(user_id, PresenceState.IN_ROOM)
                    return True, PresenceState.IN_ROOM, {"status": "MATCHED"}

        # If we have a room system in the future, check here for IN_ROOM

        # No active session found
        self.presence_repo.set_state(user_id, PresenceState.ONLINE)
        return False, None, None
