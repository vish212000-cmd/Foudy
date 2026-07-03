import asyncio
import websockets
import requests
import json

API_URL = "https://foudy.onrender.com"
WS_URL = "wss://foudy.onrender.com/ws/"

def get_token(user_label):
    res = requests.post(f"{API_URL}/api/v1/auth/guest/")
    if res.status_code in [200, 201]:
        data = res.json()
        if 'access_token' in data:
            token = data['access_token']
        elif 'tokens' in data:
            token = data['tokens']['access']
        elif 'token' in data:
            token = data['token']
        elif 'access' in data:
            token = data['access']
        else:
            print(f"{user_label} - Guest Login failed: Unknown token format", data)
            return None
        print(f"{user_label} - Successfully authenticated as Guest.")
        return token
    print(f"{user_label} - Guest Login failed", res.text)
    return None

async def user_client(user_label, token, is_second_user=False):
    print(f"{user_label} - Connecting to WebSocket...")
    try:
        async with websockets.connect(f"{WS_URL}?token={token}") as ws:
            print(f"{user_label} - [101 Switching Protocols] Connected successfully!")
            
            # Wait a moment for connection to stabilize
            await asyncio.sleep(1)
            
            print(f"{user_label} - Joining queue...")
            await ws.send(json.dumps({
                "event": "room.join_queue",
                "payload": {}
            }))
            
            match_found = False
            
            # Listen for events
            while True:
                try:
                    message_str = await asyncio.wait_for(ws.recv(), timeout=10.0)
                    msg = json.loads(message_str)
                    print(f"{user_label} - RECEIVED: {msg['event']}")
                    
                    if msg['event'] == "room.match_found":
                        match_found = True
                        print(f"{user_label} - MATCH FOUND! Room ID: {msg['payload'].get('room_id')}")
                        break
                        
                except asyncio.TimeoutError:
                    print(f"{user_label} - Timeout waiting for match_found event.")
                    break
                    
            return match_found
            
    except Exception as e:
        print(f"{user_label} - WebSocket error: {e}")
        return False

async def main():
    token_a = get_token("User A")
    token_b = get_token("User B")
    
    if not token_a or not token_b:
        print("Failed to get tokens. Exiting.")
        return
        
    print("\n--- Starting E2E Matchmaking Test ---\n")
    
    # Run both clients concurrently
    results = await asyncio.gather(
        user_client("User A", token_a),
        user_client("User B", token_b, is_second_user=True)
    )
    
    print("\n--- Test Results ---")
    if all(results):
        print("✅ SUCCESS: Both users received 'room.match_found' event!")
    else:
        print("❌ FAILED: One or more users did not receive the match event.")

if __name__ == "__main__":
    asyncio.run(main())
