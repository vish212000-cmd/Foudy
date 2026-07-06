import requests
import time
from utils import with_retry

API_URL = "https://foudy.onrender.com"

@with_retry(max_retries=3, base_delay=1.0)
def post_guest_login():
    return requests.post(f"{API_URL}/api/v1/auth/guest/", timeout=10.0)

def authenticate_guests(scorecard: dict, metrics: dict):
    print("--- AUTHENTICATION ---")
    
    def get_token(label):
        start = time.time()
        res = post_guest_login()
        latency = round((time.time() - start) * 1000)
        print(f"POST /api/v1/auth/guest/ ({label}) - {latency}ms - {res.status_code}")
        
        # Track latency
        if "Authentication Latency" not in metrics:
            metrics["Authentication Latency"] = []
        metrics["Authentication Latency"].append(latency)
        
        if res.status_code in [200, 201]:
            data = res.json()
            token = data.get('access_token') or data.get('tokens', {}).get('access') or data.get('token') or data.get('access')
            return token
        return None

    token_a = get_token("User A")
    token_b = get_token("User B")
    
    if token_a and token_b:
        scorecard["Authentication"] = "PASS"
        scorecard["Guest Login"] = "PASS"
        print("✅ Guest Authentication passed.\n")
        return token_a, token_b
    else:
        print("❌ Failed to authenticate guests.")
        return None, None
