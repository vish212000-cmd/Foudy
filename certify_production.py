import asyncio
import websockets
import requests
import json
import time
import sys

API_URL = "https://foudy.onrender.com"
WS_URL = "wss://foudy.onrender.com/ws/"
EXPECTED_COMMIT = "unknown" # To be set by script later if needed, but we will check it starts with what we pushed

def verify_deployment(target_commit=None):
    print("--- VERIFYING DEPLOYMENT ---")
    try:
        res = requests.get(f"{API_URL}/health/version/")
        if res.status_code != 200:
            print(f"❌ Failed to reach health endpoint. Status: {res.status_code}")
            sys.exit(1)
        data = res.json()
        print("GET /health/version/")
        print(json.dumps(data, indent=2))
        
        if data.get("environment") != "production":
            print("❌ Environment is not production.")
            sys.exit(1)
            
        commit = data.get("git_commit", "")
        if target_commit and not commit.startswith(target_commit):
            print(f"❌ Git commit mismatch. Expected: {target_commit}, Got: {commit}")
            sys.exit(1)
            
        if data.get("build_date") == "unknown":
            print("⚠️ Build date is unknown, but proceeding as other checks passed.")
            
        print("✅ Deployment verification passed.\n")
        return commit
    except Exception as e:
        print(f"❌ Error during deployment verification: {e}")
        sys.exit(1)

def verify_state(user_id):
    try:
        res = requests.get(f"{API_URL}/health/verify-state/?user_id={user_id}")
        return res.json()
    except Exception:
        return {}

def get_guest_token(label):
    print(f"{label} - Authenticating via Guest Login...")
    res = requests.post(f"{API_URL}/api/v1/auth/guest/")
    if res.status_code in [200, 201]:
        data = res.json()
        # Find token depending on how the endpoint formats it
        token = data.get('access_token') or data.get('tokens', {}).get('access') or data.get('token') or data.get('access')
        user_id = data.get('user', {}).get('id')
        if token and user_id:
            print(f"{label} - SUCCESS (User ID: {user_id})")
            return token, user_id
    print(f"{label} - FAILED")
    sys.exit(1)

async def run_client(label, token, user_id, start_event, state_updates, role="caller"):
    print(f"{label} - Connecting to WebSocket {WS_URL}...")
    headers = []
    
    try:
        # Connect to websocket
        async with websockets.connect(f"{WS_URL}?token={token}", extra_headers=headers) as ws:
            print(f"{label} - 101 Switching Protocols. Handshake successful!")
            
            # Wait for both to be ready
            await start_event.wait()
            
            print(f"{label} - Joining queue...")
            await ws.send(json.dumps({
                "event": "room.join_queue",
                "payload": {}
            }))
            
            # Check state right after joining
            await asyncio.sleep(0.5)
            state = verify_state(user_id)
            print(f"{label} - Redis State after join: {state.get('redis_status')}")
            
            room_id = None
            matched = False
            
            # Listen for messages
            while True:
                try:
                    message_str = await asyncio.wait_for(ws.recv(), timeout=15.0)
                    print(f"\n{label} <- {message_str}")
                    msg = json.loads(message_str)
                    
                    if msg['event'] == 'room.match_found' or msg['event'] == 'room.created':
                        matched = True
                        room_id = msg['payload'].get('room_id')
                        print(f"{label} - Match event received! Room: {room_id}")
                        
                        # Wait a bit then check state
                        await asyncio.sleep(1)
                        state = verify_state(user_id)
                        print(f"{label} - Redis State after match: {state.get('redis_status')}")
                        print(f"{label} - Database Room ID: {state.get('database_room', {}).get('id')}")
                        print(f"{label} - Database Room Status: {state.get('database_room', {}).get('status')}")
                        
                        if role == "caller":
                            # Simulate sending offer
                            offer_payload = {
                                "event": "signaling.offer",
                                "payload": {
                                    "room_id": room_id,
                                    "sdp": "v=0\r\no=- 4611731400430051336 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n",
                                    "type": "offer"
                                }
                            }
                            print(f"{label} -> signaling.offer")
                            await ws.send(json.dumps(offer_payload))
                            
                    elif msg['event'] == 'signaling.offer' and role == "answerer":
                        # Simulate sending answer
                        answer_payload = {
                            "event": "signaling.answer",
                            "payload": {
                                "room_id": room_id,
                                "sdp": "v=0\r\no=- 4611731400430051337 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n",
                                "type": "answer"
                            }
                        }
                        print(f"{label} -> signaling.answer")
                        await ws.send(json.dumps(answer_payload))
                        
                        # Simulate sending ICE candidate
                        ice_payload = {
                            "event": "signaling.candidate",
                            "payload": {
                                "room_id": room_id,
                                "candidate": {"candidate":"candidate:1 1 UDP 2122260223 192.168.1.1 50000 typ host","sdpMid":"0","sdpMLineIndex":0}
                            }
                        }
                        print(f"{label} -> signaling.candidate")
                        await ws.send(json.dumps(ice_payload))
                        break # We're done
                        
                    elif msg['event'] == 'signaling.answer' and role == "caller":
                        # Simulate sending ICE candidate
                        ice_payload = {
                            "event": "signaling.candidate",
                            "payload": {
                                "room_id": room_id,
                                "candidate": {"candidate":"candidate:2 1 UDP 2122260223 192.168.1.2 50001 typ host","sdpMid":"0","sdpMLineIndex":0}
                            }
                        }
                        print(f"{label} -> signaling.candidate")
                        await ws.send(json.dumps(ice_payload))
                        break # We're done
                        
                except asyncio.TimeoutError:
                    print(f"{label} - Timeout waiting for websocket messages.")
                    break
            
            # Wait briefly to let the other client finish
            await asyncio.sleep(2)
            print(f"{label} - Closing connection.")
            return True
            
    except Exception as e:
        print(f"{label} - WebSocket exception: {e}")
        return False

async def main():
    target_commit = sys.argv[1] if len(sys.argv) > 1 else None
    
    # 1. Verify Deployment
    verify_deployment(target_commit)
    
    # 2. Get tokens for two distinct users
    print("--- AUTHENTICATION ---")
    token_a, user_a = get_guest_token("User A")
    token_b, user_b = get_guest_token("User B")
    
    print("\n--- WEBSOCKET & MATCHMAKING ---")
    start_event = asyncio.Event()
    
    # We create the tasks, then set the event to let them both join queue at the same time
    task_a = asyncio.create_task(run_client("User A", token_a, user_a, start_event, {}, role="caller"))
    task_b = asyncio.create_task(run_client("User B", token_b, user_b, start_event, {}, role="answerer"))
    
    # Start!
    start_event.set()
    
    await asyncio.gather(task_a, task_b)
    
    print("\n--- VERIFYING FINAL STATE ---")
    # Wait for disconnect to process
    await asyncio.sleep(2)
    state_a = verify_state(user_a)
    state_b = verify_state(user_b)
    print(f"User A final Redis state (should be IDLE/None): {state_a.get('redis_status')}")
    print(f"User B final Redis state (should be IDLE/None): {state_b.get('redis_status')}")

if __name__ == "__main__":
    asyncio.run(main())
