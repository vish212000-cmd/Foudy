import requests
import sys
import json
from utils import with_retry

API_URL = "https://foudy.onrender.com"

@with_retry(max_retries=3, base_delay=1.0)
def fetch_health():
    return requests.get(f"{API_URL}/health/version/", timeout=10.0)

def get_deployment_metadata(scorecard: dict):
    try:
        res = fetch_health()
        if res.status_code != 200:
            print(f"❌ Failed to reach health endpoint. Status: {res.status_code}")
            scorecard["Exit Code"] = 2
            sys.exit(2)
            print(f"Failed to reach health endpoint. Status: {res.status_code}".encode('utf-8', 'replace').decode('ascii', 'replace'))
            scorecard["Exit Code"] = 2
            scorecard["Failure Classification"] = ["Infrastructure"]
            scorecard["Deployment"] = "FAIL"
            return None
        return res.json()
    except requests.exceptions.RequestException as e:
        print(f"Error checking version: {e}".encode('utf-8', 'replace').decode('ascii', 'replace'))
        scorecard["Deployment"] = "FAIL"
        return None

def verify_deployment(target_commit: str, scorecard: dict, artifacts_dir: str):
    print("--- VERIFYING DEPLOYMENT ---")
    try:
        data = get_deployment_metadata(scorecard)
        if not data:
            return False
            
        with open(f"{artifacts_dir}/deployment.json", "w") as f:
            json.dump(data, f, indent=2)
            
        scorecard["Deployment_Info"] = data
        
        # Verify Critical Fields
        commit = data.get("git_commit", "unknown")
        env = data.get("environment", "unknown")
        
        critical_errors = []
        if not commit.startswith(target_commit):
            critical_errors.append(f"Commit mismatch: Expected {target_commit}, got {commit}")
        if env != "production":
            critical_errors.append(f"Environment mismatch: Expected production, got {env}")
            
        if critical_errors:
            msg = "CRITICAL DEPLOYMENT ERRORS:\n" + "\n".join(critical_errors)
            print(msg.encode('utf-8', 'replace').decode('ascii', 'replace'))
            scorecard["Deployment"] = "FAIL"
            scorecard["Exit Code"] = 2
            scorecard["Failure Classification"] = ["Deployment"]
            return False
            
        # Check warnings
        warnings = []
        if data.get("build_date") == "unknown":
            warnings.append("build_date")
        if data.get("render_service_id") == "unknown":
            warnings.append("render_service_id")
            
        if warnings:
            print(f"Missing metadata fields (warnings only): {', '.join(warnings)}".encode('utf-8', 'replace').decode('ascii', 'replace'))
            
        scorecard["Deployment"] = "PASS"
        return True
        
    except Exception as e:
        print(f"Error during deployment verification: {e}".encode('utf-8', 'replace').decode('ascii', 'replace'))
        scorecard["Deployment"] = "FAIL"
        scorecard["Exit Code"] = 3
        scorecard["Failure Classification"] = ["Infrastructure"]
        return False
