import json
import os
from datetime import datetime

def generate_report(scorecard: dict, metrics: dict, artifacts_dir: str):
    dep = scorecard.get("Deployment_Info", {})
    
    cert_id = os.path.basename(artifacts_dir).replace("-", "").replace("_", "-")
    
    start_time = scorecard.get("Start Time")
    end_time = datetime.utcnow()
    duration_str = "UNKNOWN"
    if start_time:
        if isinstance(start_time, str):
            try:
                start_time = datetime.fromisoformat(start_time.replace("Z", ""))
            except:
                pass
        if isinstance(start_time, datetime):
            duration = end_time - start_time
            duration_str = f"{duration.total_seconds():.1f}s"
            
    start_str = start_time.isoformat() + "Z" if isinstance(start_time, datetime) else "UNKNOWN"
    end_str = end_time.isoformat() + "Z"
    
    pipeline = [
        "Deployment",
        "Landing Page",
        "Guest Login",
        "Profile",
        "Queue Join",
        "Queue Wait",
        "Match Found",
        "Room Creation",
        "WebSocket",
        "Offer",
        "Answer",
        "ICE Connected",
        "Remote Track",
        "Cleanup"
    ]
    
    key_map = {
        "Deployment": "Deployment",
        "Authentication": "Guest Login",
        "WebSocket Handshake": "WebSocket",
        "Matchmaking": "Match Found",
        "Room Creation": "Room Creation",
        "WebRTC Signaling": "Offer",
        "Media Connection": "Remote Track",
        "Cleanup": "Cleanup"
    }
    
    if scorecard.get("Frontend") == "FAIL":
        if "Guest Login" not in scorecard or scorecard["Guest Login"] != "PASS":
            scorecard["Guest Login"] = "FAIL"
        
    exit_code = scorecard.get("Exit Code", 1)
    
    pipeline_state = {}
    blocked = False
    failed_stage = None
    for stage in pipeline:
        if blocked:
            pipeline_state[stage] = "BLOCKED"
            continue
            
        val = "PRODUCTION VERIFIED"
        for s_key, s_mapped in key_map.items():
            if s_mapped == stage and scorecard.get(s_key) == "FAIL":
                val = "FAILED"
                break
        
        if scorecard.get(stage) == "FAIL":
            val = "FAILED"
            
        pipeline_state[stage] = val
        if val == "FAILED":
            blocked = True
            failed_stage = stage
            
    if exit_code == 3 and failed_stage:
        pipeline_state[failed_stage] = "FAILED"
            
    frontend_ver = scorecard.get("Frontend Version", "UNKNOWN")
    backend_ver = dep.get("git_commit", "UNKNOWN")
    drift_block = ""
    if exit_code == 2:
        drift_block = f"""
Frontend Version .. {frontend_ver}
Backend Version ... {backend_ver}
Deployment Drift .. YES

"""
    
    overall = scorecard.get("Overall Result", "NO-GO")
    
    classifications = {
        "Infrastructure": False,
        "Deployment": False,
        "Backend": False,
        "Frontend": False,
        "Database": False,
        "Redis": False,
        "WebSocket": False,
        "WebRTC": False,
        "Test Framework": False,
        "Selector Drift": False,
        "Configuration": False,
        "Performance": False
    }
    
    tags = scorecard.get("Failure Classification", [])
    for t in tags:
        if t in classifications:
            classifications[t] = True
            
    if not tags and failed_stage:
        if failed_stage in ["Guest Login", "Landing Page"]:
            classifications["Frontend"] = True
        elif failed_stage == "Deployment":
            classifications["Deployment"] = True
        elif exit_code == 3:
            classifications["Infrastructure"] = True
            
    class_str = "Failure Type\\n\\n"
    for k, v in classifications.items():
        mark = "✓" if v else "☐"
        class_str += f"{mark} {k}\\n"
        
    def get_avg_metric(key):
        vals = metrics.get(key, [])
        if not vals: return "N/A"
        return str(sum(vals)//len(vals))

    report = f"""FOUDY Production Certification
==============================

Certification Framework: v1.1.0
Certification ID: {cert_id}

Commit:
{dep.get('git_commit', 'UNKNOWN')}

Environment:
{dep.get('environment', 'UNKNOWN')}

Service:
Render

Frontend:
https://foudy.online

Backend:
https://foudy.onrender.com

WebSocket:
wss://foudy.onrender.com

Certification Started:  {start_str}
Certification Finished: {end_str}
Total Duration:         {duration_str}

Deployment ........ {pipeline_state.get("Deployment")}
{drift_block}Landing Page ...... {pipeline_state.get("Landing Page")}
Guest Login ....... {pipeline_state.get("Guest Login")}
Profile ........... {pipeline_state.get("Profile")}
Queue Join ........ {pipeline_state.get("Queue Join")}
Queue Wait ........ {pipeline_state.get("Queue Wait")}
Match Found ....... {pipeline_state.get("Match Found")}
Room Creation ..... {pipeline_state.get("Room Creation")}
WebSocket ......... {pipeline_state.get("WebSocket")}
Offer ............. {pipeline_state.get("Offer")}
Answer ............ {pipeline_state.get("Answer")}
ICE Connected ..... {pipeline_state.get("ICE Connected")}
Remote Track ...... {pipeline_state.get("Remote Track")}
Cleanup ........... {pipeline_state.get("Cleanup")}

Performance

Landing Page ........... {get_avg_metric("Landing Page")} ms
Guest Login ............ {get_avg_metric("Guest Login")} ms
Profile ................ {get_avg_metric("Profile")} ms
Queue Join ............. {get_avg_metric("Queue Join")} ms
Queue Wait ............. {get_avg_metric("Queue Wait")} ms
Match Found ............ {get_avg_metric("Match Found")} ms
Room Creation .......... {get_avg_metric("Room Creation")} ms
WS Handshake ........... {get_avg_metric("WebSocket Connect Time")} ms
Offer .................. {get_avg_metric("Offer")} ms
Answer ................. {get_avg_metric("Answer")} ms
ICE Connected .......... {get_avg_metric("ICE Connected")} ms
Remote Video ........... {get_avg_metric("Remote Video")} ms

Retries
WebSocket Connect ...... {scorecard.get('WebSocket Retries', 0)}

Console Errors ......... {scorecard.get('Console Errors', 0)}
Network 500 ............ {scorecard.get('Network 500', 0)}
React Errors ........... {scorecard.get('React Errors', 0)}

Runtime Details
Python Version:  {dep.get('python_version', 'UNKNOWN')}
Django Version:  {dep.get('django_version', 'UNKNOWN')}

Overall

Result: {overall}

{class_str}
Release Approved: {"YES" if overall == "GO" else "NO"}

Exit Code: {exit_code}
"""

    with open(os.path.join(artifacts_dir, "scorecard.md"), "w", encoding="utf-8") as f:
        f.write(report)
        
    if "Start Time" in scorecard and isinstance(scorecard["Start Time"], datetime):
        scorecard["Start Time"] = scorecard["Start Time"].isoformat() + "Z"
        
    with open(os.path.join(artifacts_dir, "scorecard.json"), "w") as f:
        json.dump(scorecard, f, indent=2)
        
    with open(os.path.join(artifacts_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    try:
        print("\\n" + report + "\\n")
    except UnicodeEncodeError:
        print("\\n" + report.encode('ascii', 'ignore').decode('ascii') + "\\n")
