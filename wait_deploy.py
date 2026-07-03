import requests
import time
import sys

TARGET_COMMIT = "a6aeef89"
MAX_RETRIES = 60

print(f"Waiting for commit {TARGET_COMMIT} to be deployed...")
for i in range(MAX_RETRIES):
    try:
        res = requests.get('https://foudy.onrender.com/health/version/')
        data = res.json()
        commit = data.get('git_commit', '')
        if commit and commit.startswith(TARGET_COMMIT):
            print(f"\n✅ Deployment verified! Commit: {commit}")
            print(json.dumps(data, indent=2))
            sys.exit(0)
        
        sys.stdout.write(f"\rCurrent commit: {commit} (Waiting...) [{i}/{MAX_RETRIES}]")
        sys.stdout.flush()
    except Exception as e:
        sys.stdout.write(f"\rError checking version: {e}")
        sys.stdout.flush()
    
    time.sleep(10)

print("\n❌ Timeout waiting for deployment.")
sys.exit(1)
