import os
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

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

@api_view(['GET'])
@permission_classes([AllowAny])
def health_version(request):
    import sys
    import django
    
    commit = os.environ.get("RENDER_GIT_COMMIT", "unknown")
    build_date = os.environ.get("BUILD_DATE", "unknown")
    environment = os.environ.get("DJANGO_ENV", os.environ.get("ENVIRONMENT", "production" if "RENDER" in os.environ else "development"))
    service_id = os.environ.get("RENDER_SERVICE_ID", "unknown")
    instance_id = os.environ.get("RENDER_INSTANCE_ID", "unknown")
    
    git_branch = os.environ.get("RENDER_GIT_BRANCH", "unknown")
    build_number = os.environ.get("BUILD_NUMBER", "unknown")
    ci_provider = os.environ.get("CI_PROVIDER", "unknown")
    workflow_run = os.environ.get("WORKFLOW_RUN", "unknown")
    
    return Response({
        "status": "healthy",
        "version": "1.0.0",
        "git_commit": commit,
        "git_branch": git_branch,
        "build_number": build_number,
        "build_date": build_date,
        "ci_provider": ci_provider,
        "workflow_run": workflow_run,
        "environment": environment,
        "render_service_id": service_id,
        "render_instance_id": instance_id,
        "python_version": sys.version.split()[0],
        "django_version": django.get_version()
    })


def health_system(request):
    return JsonResponse({
        "status": "healthy",
        "system": "active"
    })
