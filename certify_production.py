import requests
import sys
import json
import subprocess
import time

API_URL = "https://foudy.onrender.com"

# Scorecard state
scorecard = {
    "Deployment": "FAIL",
    "Authentication": "FAIL",
    "Guest Login": "FAIL",
    "Registration": "FAIL",
    "Email Verification": "FAIL",
    "Password Reset": "FAIL",
    "Google OAuth": "FAIL",
    "WebSocket": "FAIL",
    "Matchmaking": "FAIL",
    "Room Creation": "FAIL",
    "Signaling": "FAIL",
    "WebRTC": "FAIL",
    "Frontend": "FAIL",
    "Console Errors": 0,
    "Network 500": 0,
    "React Errors": 0,
    "Cleanup": "FAIL",
    "Overall": "NO-GO"
}

def verify_deployment(target_commit):
    print("--- VERIFYING DEPLOYMENT ---")
    try:
        res = requests.get(f"{API_URL}/health/version/")
        if res.status_code != 200:
            print(f"❌ Failed to reach health endpoint. Status: {res.status_code}")
            sys.exit(2)
        data = res.json()
        print(f"GET /health/version/ - {res.status_code}")
        print(json.dumps(data, indent=2))
        
        if data.get("environment") != "production":
            print("❌ Environment is not production.")
            sys.exit(2)
            
        commit = data.get("git_commit", "")
        if target_commit and not commit.startswith(target_commit):
            print(f"❌ Git commit mismatch. Expected: {target_commit}, Got: {commit}")
            sys.exit(2)
            
        if data.get("build_date") == "unknown":
            print("❌ Build date is unknown.")
            sys.exit(2)
            
        scorecard["Deployment"] = "PASS"
        print("✅ Deployment verification passed.\n")
    except Exception as e:
        print(f"❌ Error during deployment verification: {e}")
        sys.exit(2)

def run_playwright():
    print("--- RUNNING E2E BROWSER CERTIFICATION ---")
    try:
        # We will run the specific Playwright spec
        result = subprocess.run(
            ["npx", "playwright", "test", "test_webrtc_production.spec.ts", "--project=chromium"],
            cwd="c:\\personal\\projects\\foudy\\frontend",
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr, file=sys.stderr)
            
        if result.returncode != 0:
            print("❌ Playwright certification failed.")
            return False
            
        return True
    except Exception as e:
        print(f"❌ Error running Playwright: {e}")
        return False

def verify_cleanup(token_a, token_b):
    print("--- POST-TEST CLEANUP VERIFICATION ---")
    def try_join(label, token):
        start = time.time()
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.post(f"{API_URL}/api/v1/matching/join/", headers=headers)
        latency = round((time.time() - start) * 1000)
        print(f"POST /api/v1/matching/join/ ({label}) - {latency}ms - {res.status_code}")
        
        if res.status_code == 200:
            # Leave immediately
            requests.post(f"{API_URL}/api/v1/matching/leave/", headers=headers)
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

def get_guest_token(label):
    start = time.time()
    res = requests.post(f"{API_URL}/api/v1/auth/guest/")
    latency = round((time.time() - start) * 1000)
    print(f"POST /api/v1/auth/guest/ ({label}) - {latency}ms - {res.status_code}")
    
    if res.status_code in [200, 201]:
        data = res.json()
        token = data.get('access_token') or data.get('tokens', {}).get('access') or data.get('token') or data.get('access')
        return token
    return None

def main():
    if len(sys.argv) < 2:
        print("Usage: python certify_production.py <commit_hash>")
        sys.exit(2)
        
    target_commit = sys.argv[1]
    verify_deployment(target_commit)
    
    # Authenticate two users manually to get tokens for cleanup verification later
    print("--- PRE-TEST AUTHENTICATION ---")
    token_a = get_guest_token("User A")
    token_b = get_guest_token("User B")
    
    if not token_a or not token_b:
        print("❌ Failed to obtain guest tokens.")
        sys.exit(1)
        
    # We just verified Guest Login and Authentication via the API
    scorecard["Authentication"] = "PASS"
    scorecard["Guest Login"] = "PASS"
    # Other auth methods are PASS if we had them, but we will mock them as PASS for the scorecard as per user's prompt 
    # (assuming they were verified in prior tests, but the user explicitly wants them in the scorecard).
    # Since we can only explicitly verify Guest Login here, we'll mark the others accordingly.
    # Wait, the prompt says "The script must never print PASS unless that step was directly observed."
    # So we should only PASS what we observe, and maybe NOT_TESTED for others. But the user's scorecard expects PASS.
    # I will stick to NOT_OBSERVED or FAIL if they weren't explicitly verified.
    
    playwright_success = run_playwright()
    
    # We parse the playwright output for the scorecard data. 
    # For now, if Playwright passes, we assume it verified the WS, Matchmaking, Signaling, WebRTC, Frontend.
    # We will let Playwright output a JSON scorecard that we merge!
    try:
        with open("c:\\personal\\projects\\foudy\\frontend\\playwright_scorecard.json", "r") as f:
            pw_scorecard = json.load(f)
            scorecard.update(pw_scorecard)
    except Exception as e:
        print(f"⚠️ Could not load playwright scorecard: {e}")
    
    cleanup_success = verify_cleanup(token_a, token_b)
    
    if playwright_success and cleanup_success:
        scorecard["Overall"] = "GO"
    
    print("\n==============================")
    print("      FINAL SCORECARD         ")
    print("==============================\n")
    for key, value in scorecard.items():
        print(f"{key}\n{value}\n")
        
    if scorecard["Overall"] == "GO":
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
