import urllib.request
import time
import json

URL = "https://foudy.onrender.com/health/redis/"

print("Waiting for Render deployment to finish and Redis health to pass...")
while True:
    try:
        req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            print(f"Status: {data['status']}")
            if data['status'] == 'healthy':
                print("SUCCESS: Redis is healthy!")
                break
            else:
                print(f"Still unhealthy: {data.get('error')}")
    except Exception as e:
        print(f"Error fetching URL (likely 502/503 during deploy): {e}")
    time.sleep(15)
