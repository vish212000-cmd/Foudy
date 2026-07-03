import time
import requests
import subprocess
import sys

def check_version():
    try:
        r = requests.get('https://foudy.onrender.com/health/version/', timeout=5)
        data = r.json()
        return data.get('git_commit')
    except:
        return 'unknown'

print("Polling for deployment...")
while True:
    commit = check_version()
    if commit != 'unknown':
        print(f"Deployment detected! Commit: {commit}")
        break
    print("Still unknown...")
    time.sleep(10)

print("Running test_ws_prod.py...")
result = subprocess.run([sys.executable, 'test_ws_prod.py'], capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
