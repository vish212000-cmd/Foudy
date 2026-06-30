import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foudy_backend.settings')

django_asgi_app = get_asgi_application()

try:
    from core.shutdown import register_shutdown_handlers
    register_shutdown_handlers()
except ImportError:
    pass

from realtime.middleware import JWTAuthMiddleware
import realtime.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            realtime.routing.websocket_urlpatterns
        )
    ),
})
