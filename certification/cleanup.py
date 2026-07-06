import requests
import time
from utils import with_retry

API_URL = "https://foudy.onrender.com"

@with_retry(max_retries=3, base_delay=1.0)
def post_join_queue(token):
    headers = {"Authorization": f"Bearer {token}"}
    return requests.post(f"{API_URL}/api/v1/matching/join/", headers=headers, timeout=10.0)

@with_retry(max_retries=3, base_delay=1.0)
def post_leave_queue(token):
    headers = {"Authorization": f"Bearer {token}"}
    return requests.post(f"{API_URL}/api/v1/matching/leave/", headers=headers, timeout=10.0)

def verify_cleanup(token_a: str, token_b: str, scorecard: dict):
    print("--- POST-TEST CLEANUP VERIFICATION ---")
    
    def try_join(label, token):
        start = time.time()
        res = post_join_queue(token)
        latency = round((time.time() - start) * 1000)
        print(f"POST /api/v1/matching/join/ ({label}) - {latency}ms - {res.status_code}")
        
        if res.status_code == 200:
            post_leave_queue(token)
            return True
        return False

    success_a = try_join("User A", token_a)
    success_b = try_join("User B", token_b)
    
    if success_a and success_b:
        scorecard["Cleanup"] = "PASS"
        print("✅ Cleanup verified: No orphaned queue state.")
        return True
    else:
        print("❌ Cleanup failed: One or both users received an error on re-join.")
        return False
