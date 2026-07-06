import sys
import os
from datetime import datetime
from deployment import verify_deployment
from auth import authenticate_guests
from webrtc import run_playwright_tests
from cleanup import verify_cleanup
from report import generate_report
import traceback

scorecard = {
    "Deployment": "FAIL",
    "Authentication": "FAIL",
    "Guest Login": "FAIL",
    "Registration": "FAIL",
    "Password Reset": "FAIL",
    "Google OAuth": "FAIL",
    "WebSocket Handshake": "FAIL",
    "Matchmaking": "FAIL",
    "Room Creation": "FAIL",
    "WebRTC Signaling": "FAIL",
    "Media Connection": "FAIL",
    "Frontend": "FAIL",
    "Cleanup": "FAIL",
    
    "Console Errors": 0,
    "Network 500": 0,
    "React Errors": 0,
    "WebSocket Disconnects": 0,
    "WebSocket Retries": 0,
    
    "Overall Result": "NO-GO",
    "Exit Code": 1,
    "Start Time": datetime.utcnow()
}

metrics = {}

def create_artifacts_dir():
    timestamp = datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")
    artifacts_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts", timestamp))
    os.makedirs(artifacts_dir, exist_ok=True)
    os.makedirs(os.path.join(artifacts_dir, "http"), exist_ok=True)
    os.makedirs(os.path.join(artifacts_dir, "ws"), exist_ok=True)
    os.makedirs(os.path.join(artifacts_dir, "playwright", "screenshots"), exist_ok=True)
    os.makedirs(os.path.join(artifacts_dir, "logs"), exist_ok=True)
    return artifacts_dir

def main():
    if len(sys.argv) < 2:
        print("Usage: python certification/certify_production.py <commit_hash>")
        sys.exit(4) # 4 = Configuration failure
        
    target_commit = sys.argv[1]
    os.environ["TARGET_COMMIT"] = target_commit
    artifacts_dir = create_artifacts_dir()
    print(f"Artifacts will be saved to: {artifacts_dir}")
    
    try:
        # 1. Deployment
        verify_deployment(target_commit, scorecard, artifacts_dir)
        
        # 2. Authentication (API test)
        token_a, token_b = authenticate_guests(scorecard, metrics)
        if not token_a or not token_b:
            scorecard["Exit Code"] = 1
            generate_report(scorecard, metrics, artifacts_dir)
            sys.exit(1)
            
        # 3. WebRTC E2E & Browser Console (Playwright)
        pw_success = run_playwright_tests(scorecard, metrics, artifacts_dir)
        
        # 4. Cleanup (API check ensuring queues are empty)
        cleanup_success = verify_cleanup(token_a, token_b, scorecard)
        
        if scorecard.get("Exit Code") == 2:
            # Drift detected inside playwright
            generate_report(scorecard, metrics, artifacts_dir)
            sys.exit(2)
        
        if pw_success and cleanup_success:
            critical_passed = (
                scorecard["Deployment"] == "PASS" and
                scorecard["Guest Login"] == "PASS" and
                scorecard["Matchmaking"] == "PASS" and
                scorecard["WebRTC Signaling"] == "PASS" and
                scorecard["Media Connection"] == "PASS" and
                scorecard["Frontend"] == "PASS" and
                scorecard["Cleanup"] == "PASS"
            )
            if critical_passed:
                scorecard["Overall Result"] = "GO"
                scorecard["Exit Code"] = 0
                
    except Exception as e:
        print(f"INFRASTRUCTURE/TEST FRAMEWORK ERROR: {e}")
        traceback.print_exc()
        scorecard["Exit Code"] = 3
        scorecard["Failure Classification"] = ["Infrastructure", "Test Framework"]
        
    generate_report(scorecard, metrics, artifacts_dir)
    sys.exit(scorecard["Exit Code"])

if __name__ == "__main__":
    main()
