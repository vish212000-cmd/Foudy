import time
import redis
from django.conf import settings

def get_redis_client() -> redis.Redis:
    redis_url = settings.CHANNEL_LAYERS['default']['CONFIG']['hosts'][0]
    return redis.from_url(redis_url)

class ChatRepository:
    """
    Volatile Redis store for Chat rate-limiting and deduplication.
    No message history is persisted.
    """
    def __init__(self):
        self.redis = get_redis_client()
        self.rate_limit_prefix = "foudy:chat:ratelimit:"
        self.dedup_prefix = "foudy:chat:dedup:"
        self.ttl = 86400

    def check_rate_limit(self, user_id: int, max_messages: int = 5, window_seconds: int = 2) -> bool:
        """
        Returns True if the user is within limits, False if rate limited.
        Implements a simple token bucket / rolling window using Redis INCR and EXPIRE.
        """
        key = f"{self.rate_limit_prefix}{user_id}:{int(time.time() / window_seconds)}"
        count = self.redis.incr(key)
        if count == 1:
            self.redis.expire(key, window_seconds + 1)
        
        return count <= max_messages

    def is_message_processed(self, correlation_id: str) -> bool:
        """
        Duplicate detection using a Redis set.
        Returns True if already processed.
        """
        if not correlation_id:
            return False
            
        key = f"{self.dedup_prefix}{correlation_id}"
        is_new = self.redis.set(key, "1", nx=True, ex=3600)  # Keep deduplication key for 1 hour
        return not is_new
