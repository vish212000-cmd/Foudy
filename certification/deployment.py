import requests
import sys
import json
from utils import with_retry

API_URL = "https://foudy.onrender.com"

@with_retry(max_retries=3, base_delay=1.0)
def fetch_health():
    return requests.get(f"{API_URL}/health/version/", timeout=10.0)

def verify_deployment(target_commit: str, scorecard: dict, artifacts_dir: str):
    print("--- VERIFYING DEPLOYMENT ---")
    try:
        res = fetch_health()
        if res.status_code != 200:
            print(f"❌ Failed to reach health endpoint. Status: {res.status_code}")
            scorecard["Exit Code"] = 2
            sys.exit(2)
        
        data = res.json()
        print(f"GET /health/version/ - {res.status_code}")
        print(json.dumps(data, indent=2))
        
        with open(f"{artifacts_dir}/deployment.json", "w") as f:
            json.dump(data, f, indent=2)
            
        scorecard["Deployment_Info"] = data
        
        if data.get("environment") != "production":
            print("❌ Environment is not production.")
            scorecard["Exit Code"] = 2
            sys.exit(2)
            
        commit = data.get("git_commit", "")
        if target_commit and not commit.startswith(target_commit):
            print(f"❌ Git commit mismatch. Expected: {target_commit}, Got: {commit}")
            scorecard["Exit Code"] = 2
            sys.exit(2)
            
        # Warning metadata (does not exit)
        warnings = []
        if data.get("build_date") == "unknown":
            warnings.append("build_date")
        if data.get("build_number") == "unknown":
            warnings.append("build_number")
        if data.get("git_branch") == "unknown":
            warnings.append("git_branch")
        if data.get("ci_provider") == "unknown":
            warnings.append("ci_provider")
            
        if warnings:
            print(f"⚠️  Missing metadata fields (warnings only): {', '.join(warnings)}")
            
        scorecard["Deployment"] = "PASS"
        print("✅ Deployment verification passed.\n")
    except Exception as e:
        print(f"❌ Error during deployment verification: {e}")
        scorecard["Exit Code"] = 3
        sys.exit(3)  # Infrastructure unavailable
