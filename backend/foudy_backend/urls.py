from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.views import health_check, health_database, health_redis, health_storage, health_system, health_email, health_version
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('health/database/', health_database, name='health_database'),
    path('health/redis/', health_redis, name='health_redis'),
    path('health/storage/', health_storage, name='health_storage'),
    path('health/email/', health_email, name='health_email'),
    path('health/version/', health_version, name='health_version'),
    path('health/system/', health_system, name='health_system'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/users/', include('profiles.urls')),
    path('api/v1/matching/', include('matching.urls')),
    path('api/v1/moderation/', include('moderation.urls')),
    path('api/v1/chat/', include('chat.urls')),
    path('api/v1/rooms/', include('rooms.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
