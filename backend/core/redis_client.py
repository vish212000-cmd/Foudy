import logging
import redis
from django.conf import settings

logger = logging.getLogger('foudy.redis')

_redis_client = None

def get_redis_client(decode_responses=True):
    """
    Returns a lazily-initialized Redis client based on settings.REDIS_URL.
    Validates the scheme and safely returns None if invalid, to prevent app crashes.
    """
    global _redis_client
    if _redis_client is not None and getattr(_redis_client, '_decode_responses', None) == decode_responses:
        return _redis_client
        
    redis_url = getattr(settings, 'REDIS_URL', None)
    
    if not redis_url:
        logger.warning("REDIS_URL is missing or empty. Redis features will be degraded.")
        return None
        
    if not (redis_url.startswith('redis://') or redis_url.startswith('rediss://')):
        logger.warning(f"REDIS_URL has an invalid scheme. Must start with redis:// or rediss://. Found: {redis_url}")
        return None
        
    try:
        client = redis.Redis.from_url(redis_url, decode_responses=decode_responses)
        # Hack to cache the decoding config for reuse check
        client._decode_responses = decode_responses
        
        # Only cache the default one
        if decode_responses:
            _redis_client = client
            
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Redis client: {e}")
        return None
