import os
import django
import asyncio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'foudy_backend.settings')
django.setup()

from channels.testing import WebsocketCommunicator
from foudy_backend.asgi import application
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

from asgiref.sync import sync_to_async

User = get_user_model()

@sync_to_async
def get_test_user():
    user, _ = User.objects.get_or_create(
        email='ws_tester@foudy.com', 
        defaults={'password': 'testpassword'}
    )
    return user

async def run_test():
    # Setup test user
    user = await get_test_user()
    token = AccessToken.for_user(user)
    
    print("Testing connection...")
    communicator = WebsocketCommunicator(
        application, 
        f"/ws/realtime/?token={str(token)}"
    )
    
    connected, subprotocol = await communicator.connect()
    assert connected, "WebSocket failed to connect"
    
    print("Testing presence...")
    response = await communicator.receive_json_from()
    assert response["event"] == "presence.update", "Expected presence.update"
    
    print("Testing heartbeat...")
    await communicator.send_json_to({"event": "heartbeat"})
    response = await communicator.receive_json_from()
    assert response["event"] == "heartbeat.ack", "Expected heartbeat.ack"
    
    print("Testing signaling...")
    await communicator.send_json_to({"event": "signaling.offer", "payload": {}})
    response = await communicator.receive_json_from()
    assert response["event"] == "signaling.error", "Expected signaling.error for invalid payload"
    
    await communicator.disconnect()
    print("All tests passed!")

if __name__ == "__main__":
    asyncio.run(run_test())
