import urllib.request
import time
import json

URL = "https://foudy.onrender.com/health/version/"

print("Checking deployment version...")
try:
    req = urllib.request.Request(URL, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as response:
        data = json.loads(response.read().decode())
        print(f"Status: {data['status']}")
        print(f"Git Commit: {data.get('git_commit')}")
        print(f"Build Date: {data.get('build_date')}")
except Exception as e:
    print(f"Error fetching URL (likely 502/503 during deploy): {e}")
