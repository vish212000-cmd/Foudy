import subprocess
import json
import os
import shutil

def run_playwright_tests(scorecard: dict, metrics: dict, artifacts_dir: str):
    print("--- RUNNING E2E BROWSER CERTIFICATION ---")
    
    # We will pass the artifacts_dir to Playwright so it can write its trace/video there
    env = os.environ.copy()
    env["PW_ARTIFACTS_DIR"] = artifacts_dir

    try:
        result = subprocess.run(
            "npx playwright test test_webrtc_production.spec.ts --project=chromium",
            cwd="c:\\personal\\projects\\foudy\\frontend",
            capture_output=True,
            text=True,
            env=env,
            shell=True
        )
        print(result.stdout)
        if result.stderr:
            print(result.stderr)

        # Load Playwright's local scorecard
        pw_scorecard_path = "c:\\personal\\projects\\foudy\\frontend\\playwright_scorecard.json"
        if os.path.exists(pw_scorecard_path):
            with open(pw_scorecard_path, "r") as f:
                pw_scorecard = json.load(f)
                scorecard.update(pw_scorecard)
                
        # Load Playwright's local metrics
        pw_metrics_path = "c:\\personal\\projects\\foudy\\frontend\\playwright_metrics.json"
        if os.path.exists(pw_metrics_path):
            with open(pw_metrics_path, "r") as f:
                pw_metrics = json.load(f)
                metrics.update(pw_metrics)
                
        # Copy trace files into the artifacts directory
        # Playwright creates a test-results folder by default
        test_results_dir = "c:\\personal\\projects\\foudy\\frontend\\test-results"
        if os.path.exists(test_results_dir):
            shutil.copytree(test_results_dir, os.path.join(artifacts_dir, "test-results"), dirs_exist_ok=True)
            
        if result.returncode != 0:
            try:
                print("❌ Playwright certification failed.")
            except:
                print("Playwright certification failed.")
            
            if result.returncode == 2:
                scorecard["Exit Code"] = 2
                scorecard["Failure Classification"] = ["Frontend", "Deployment Drift"]
            elif scorecard.get("Exit Code", 1) == 0:
                scorecard["Exit Code"] = 1
                
            return False
            
        try:
            print("✅ Playwright browser verification passed.")
        except:
            print("Playwright browser verification passed.")
        return True
    except Exception as e:
        try:
            print(f"❌ Error running Playwright: {e}")
        except:
            print(f"Error running Playwright: {e}")
        scorecard["Failure Classification"] = ["Infrastructure", "Test Framework"]
        return False
