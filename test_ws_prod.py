import asyncio
import websockets
import requests
import json

API_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws"

def get_token():
    res = requests.post(f"{API_URL}/api/v1/auth/guest/")
    if res.status_code in [200, 201]:
        data = res.json()
        if 'access_token' in data:
            return data['access_token']
        elif 'tokens' in data:
            return data['tokens']['access']
        elif 'token' in data:
            return data['token']
        elif 'access' in data:
            return data['access']
    print("Guest Login failed", res.text)
    return None

async def test_ws():
    print("Getting token...")
    token = get_token()
    if not token:
        return
        
    print(f"Connecting to {WS_URL}?token=...")
    try:
        async with websockets.connect(f"{WS_URL}?token={token}") as websocket:
            print("Connected successfully!")
            await asyncio.sleep(2)
            print("Connection stable!")
    except Exception as e:
        print(f"WebSocket connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_ws())
