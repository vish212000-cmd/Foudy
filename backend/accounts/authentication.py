from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.core.cache import cache
from .models import UserSession

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        session_id = validated_token.get('session_id')
        
        if session_id:
            cache_key = f"foudy:session_revoked:{session_id}"
            is_revoked = cache.get(cache_key)
            
            if is_revoked is None:
                try:
                    session = UserSession.objects.get(id=session_id)
                    is_revoked = session.is_revoked
                    # Cache the active status for 60 seconds to balance security and performance
                    cache.set(cache_key, is_revoked, 60)
                except UserSession.DoesNotExist:
                    raise AuthenticationFailed('Invalid session')
            
            if is_revoked:
                raise AuthenticationFailed('Session has been revoked')
                
        return user
