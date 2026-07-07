import asyncio
import websockets
import requests
import json
import logging

logging.basicConfig(level=logging.INFO)

async def test_ws():
    res1 = requests.post('https://foudy.onrender.com/api/v1/auth/guest/')
    t1 = res1.json().get('access_token') or res1.json().get('tokens', {}).get('access')
    
    res2 = requests.post('https://foudy.onrender.com/api/v1/auth/guest/')
    t2 = res2.json().get('access_token') or res2.json().get('tokens', {}).get('access')
    
    async def join_and_listen(t, name):
        try:
            ws_url = f'wss://foudy.onrender.com/ws?token={t}'
            async with websockets.connect(ws_url, ping_interval=None) as ws:
                print(f'{name} Connected!')
                
                print(f'{name} Joining queue...')
                r = requests.post('https://foudy.onrender.com/api/v1/matching/join/', headers={'Authorization': f'Bearer {t}'})
                print(f'{name} join status: {r.status_code}')
                
                # Keep sending heartbeats
                async def heartbeat():
                    while True:
                        await asyncio.sleep(10)
                        await ws.send(json.dumps({'event': 'heartbeat'}))
                        print(f'{name} Sent heartbeat')
                
                asyncio.create_task(heartbeat())
                
                while True:
                    msg = await ws.recv()
                    print(f'{name} Received: {msg}')
                    data = json.loads(msg)
                    if data.get('event') == 'match.found':
                        payload = data.get("payload", {})
                        print(f'{name} Match found! Payload: {payload}')
                        break
        except Exception as e:
            print(f'{name} Error: {e}')

    await asyncio.gather(
        join_and_listen(t1, 'User1'),
        join_and_listen(t2, 'User2')
    )

asyncio.run(test_ws())
