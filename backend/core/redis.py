from typing import Any

class RedisTTL:
    HOUR = 3600
    DAY = 86400
    WEEK = 604800
    
    CHAT_DEDUP = HOUR
    MATCHING_ORPHAN = HOUR
    MATCHING_LOCK = 10
    MODERATION_BLOCK_CACHE = DAY
    MODERATION_REPORT_RL = HOUR
    MODERATION_REPORT_DUP = DAY
    ROOM_MEDIA_STATE = DAY
    ROOM_QUALITY_SCORE = DAY
    
    AUTH_RESET_TOKEN = 900 # 15 mins
    AUTH_VERIFY_TOKEN = DAY

class RedisNamespaces:
    # Matchmaking
    @staticmethod
    def match_queue_user(user_id: Any) -> str:
        return f"foudy:matchmaking:user:{user_id}"

    # Rooms
    @staticmethod
    def room_state(room_id: Any) -> str:
        return f"foudy:room:{room_id}:state"
        
    @staticmethod
    def room_participants(room_id: Any) -> str:
        return f"foudy:room:{room_id}:participants"

    # Chat
    @staticmethod
    def chat_typing(room_id: Any, user_id: Any) -> str:
        return f"foudy:chat:room:{room_id}:typing:{user_id}"

    # Rate Limiting
    @staticmethod
    def rate_limit(action: str, ip: str) -> str:
        return f"foudy:rate_limit:{action}:{ip}"
        
    # Auth
    @staticmethod
    def auth_reset_token(token: str) -> str:
        return f"foudy:auth:reset:{token}"
        
    @staticmethod
    def auth_verify_token(token: str) -> str:
        return f"foudy:auth:verify:{token}"
