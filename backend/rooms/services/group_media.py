from typing import Dict, Optional
from rooms.repositories.redis_repo import RedisRoomRepository

class MediaCoordinator:
    """Coordinates media states (mute/unmute) across a group."""
    def __init__(self):
        self.redis_repo = RedisRoomRepository()

    def set_media_state(self, room_id: int, user_id: int, media_type: str, enabled: bool):
        """media_type: 'audio' | 'video'"""
        key = f"room:{room_id}:media:{user_id}"
        self.redis_repo.redis.hset(key, media_type, '1' if enabled else '0')
        self.redis_repo.redis.expire(key, 86400)

    def get_media_state(self, room_id: int, user_id: int) -> Dict[str, bool]:
        key = f"room:{room_id}:media:{user_id}"
        data = self.redis_repo.redis.hgetall(key)
        return {
            'audio': data.get(b'audio') == b'1',
            'video': data.get(b'video') == b'1'
        }

class QualityMonitor:
    """Monitors quality constraints. Handled mostly on frontend via getStats, backend just routes."""
    def __init__(self):
        self.redis_repo = RedisRoomRepository()
        
    def report_quality(self, room_id: int, user_id: int, quality_score: int):
        # 1-100 score
        key = f"room:{room_id}:quality"
        self.redis_repo.redis.hset(key, str(user_id), str(quality_score))
        self.redis_repo.redis.expire(key, 86400)
