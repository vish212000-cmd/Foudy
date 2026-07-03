import os
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    return JsonResponse({"status": "healthy", "service": "foudy-backend"})

def health_database(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return JsonResponse({"status": "healthy", "database": "postgresql"})
    except Exception as e:
        return JsonResponse({"status": "unhealthy", "error": str(e)}, status=503)

def health_redis(request):
    try:
        from django.conf import settings
        import urllib.parse
        
        redis_host = "unknown"
        if getattr(settings, 'REDIS_URL', None):
            parsed = urllib.parse.urlparse(settings.REDIS_URL)
            redis_host = parsed.hostname if parsed.hostname else "unknown"
            
        cache.set('health_check', 'ok', timeout=5)
        val = cache.get('health_check')
        if val == 'ok':
            return JsonResponse({"status": "healthy", "redis": "up", "provider_host": redis_host})
        return JsonResponse({"status": "unhealthy", "error": "Redis write/read mismatch", "provider_host": redis_host}, status=503)
    except Exception as e:
        return JsonResponse({"status": "unhealthy", "error": str(e), "provider_host": redis_host if 'redis_host' in locals() else "unknown"}, status=503)

def health_storage(request):
    cloudinary_url = os.environ.get('CLOUDINARY_URL')
    if cloudinary_url:
        return JsonResponse({"status": "healthy", "storage": "cloudinary"})
    return JsonResponse({"status": "unhealthy", "error": "CLOUDINARY_URL missing"}, status=503)

def health_email(request):
    resend_key = os.environ.get('RESEND_API_KEY')
    if resend_key:
        return JsonResponse({"status": "healthy", "email": "resend"})
    return JsonResponse({"status": "unhealthy", "error": "RESEND_API_KEY missing"}, status=503)

def health_version(request):
    is_render = os.environ.get('RENDER', '').lower() == 'true'
    return JsonResponse({
        "status": "healthy",
        "version": os.environ.get('APP_VERSION', '1.0.0'),
        "git_commit": os.environ.get('RENDER_GIT_COMMIT', os.environ.get('GIT_COMMIT', 'unknown')),
        "build_date": os.environ.get('BUILD_DATE', 'unknown'),
        "environment": "production" if is_render else os.environ.get('ENV', 'development'),
        "render_service_id": os.environ.get('RENDER_SERVICE_ID', 'unknown'),
        "render_instance_id": os.environ.get('RENDER_INSTANCE_ID', 'unknown')
    })

def verify_state(request):
    # Only for certification purposes
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({"error": "user_id required"}, status=400)
        
    try:
        from matching.repository import MatchmakingRepository
        from rooms.models import Room, RoomParticipant
        import json
        
        repo = MatchmakingRepository()
        status = repo.get_user_status(user_id)
        
        # Find room for user
        participant = RoomParticipant.objects.filter(user_id=user_id, is_active=True).first()
        room_data = None
        if participant:
            room = participant.room
            room_data = {
                "id": str(room.id),
                "status": room.status,
                "participants": list(room.participants.values_list('user_id', flat=True))
            }
            
        return JsonResponse({
            "redis_status": status,
            "database_room": room_data
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def health_system(request):
    return JsonResponse({
        "status": "healthy",
        "system": "active"
    })
