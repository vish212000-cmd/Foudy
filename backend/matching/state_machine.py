from enum import Enum
import time

class QueueState(Enum):
    IDLE = "IDLE"
    QUEUED = "QUEUED"
    MATCHING = "MATCHING"
    MATCHED = "MATCHED"
    COOLDOWN = "COOLDOWN"

class QueueStateMachine:
    """
    Manages explicit state transitions for a user in the matchmaking lifecycle.
    """
    
    # Define valid transitions from a given state
    VALID_TRANSITIONS = {
        QueueState.IDLE: [QueueState.QUEUED, QueueState.COOLDOWN],
        QueueState.QUEUED: [QueueState.MATCHING, QueueState.IDLE], # Can leave queue to IDLE
        QueueState.MATCHING: [QueueState.MATCHED, QueueState.QUEUED, QueueState.IDLE], # Can fail match and return to QUEUED, or timeout to IDLE
        QueueState.MATCHED: [QueueState.COOLDOWN, QueueState.IDLE], # Move to cooldown after match ends, or IDLE if skipped
        QueueState.COOLDOWN: [QueueState.IDLE], # Cooldown expires
    }

    @classmethod
    def can_transition(cls, current_state: QueueState, next_state: QueueState) -> bool:
        """
        Validates if a transition from current_state to next_state is allowed.
        """
        if current_state == next_state:
            return True # allow no-op
        return next_state in cls.VALID_TRANSITIONS.get(current_state, [])

    @classmethod
    def validate_transition(cls, current_state: QueueState, next_state: QueueState):
        """
        Raises ValueError if transition is invalid.
        """
        if not cls.can_transition(current_state, next_state):
            raise ValueError(f"Invalid state transition from {current_state.value} to {next_state.value}")
