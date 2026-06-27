from .repository import RedisPresenceRepository

class HeartbeatService:
    def __init__(self):
        self.repo = RedisPresenceRepository()

    def process_heartbeat(self, user_id: int):
        """
        Refreshes TTL for the user.
        If user was DISCONNECTED but heartbeats again, mark them ONLINE or recover session.
        """
        current_state = self.repo.get_state(user_id)
        
        if current_state == self.repo.OFFLINE:
            # Recreate state if somehow deleted but ping arrived
            self.repo.set_state(user_id, self.repo.ONLINE)
        elif current_state == self.repo.DISCONNECTED:
            # We missed some disconnections but they are back
            self.repo.set_state(user_id, self.repo.ONLINE)
        else:
            self.repo.refresh_ttl(user_id)
