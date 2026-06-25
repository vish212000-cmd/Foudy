from typing import Any

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
