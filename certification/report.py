import json
import os
from datetime import datetime

def generate_report(scorecard: dict, metrics: dict, artifacts_dir: str):
    dep = scorecard.get("Deployment_Info", {})
    
    cert_id = os.path.basename(artifacts_dir).replace("-", "").replace("_", "-")
    
    # Calculate duration
    start_time = scorecard.get("Start Time")
    end_time = datetime.utcnow()
    duration_str = "UNKNOWN"
    if start_time:
        duration = end_time - start_time
        duration_str = f"{duration.total_seconds():.1f}s"
        
    start_str = start_time.isoformat() + "Z" if start_time else "UNKNOWN"
    end_str = end_time.isoformat() + "Z"
    
    # Define pipeline order
    pipeline = [
        "Deployment",
        "Landing Page",
        "Guest Login",
        "Profile",
        "Queue",
        "WebSocket",
        "Matchmaking",
        "Room",
        "WebRTC",
        "Cleanup"
    ]
    
    # Map scorecard keys to pipeline
    key_map = {
        "Deployment": "Deployment",
        "Authentication": "Guest Login",
        "WebSocket Handshake": "WebSocket",
        "Matchmaking": "Matchmaking",
        "Room Creation": "Room",
        "Media Connection": "WebRTC",
        "Cleanup": "Cleanup"
    }
    
    # Special logic for frontend failure inside playwright
    if scorecard.get("Frontend") == "FAIL":
        scorecard["Guest Login"] = "FAIL"
        
    pipeline_state = {}
    blocked = False
    failed_stage = None
    for stage in pipeline:
        if blocked:
            pipeline_state[stage] = "BLOCKED"
            continue
            
        # Find corresponding scorecard value
        val = "PASS" # Default if not explicitly failed
        for s_key, s_mapped in key_map.items():
            if s_mapped == stage and scorecard.get(s_key) == "FAIL":
                val = "FAIL"
                break
        
        # Check explicit stages
        if scorecard.get(stage) == "FAIL":
            val = "FAIL"
            
        pipeline_state[stage] = val
        if val == "FAIL":
            blocked = True
            failed_stage = stage
            
    overall = scorecard.get("Overall Result", "NO-GO")
    exit_code = scorecard.get("Exit Code", 1)
    
    # Classifications
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
    
    # Check provided tags
    tags = scorecard.get("Failure Classification", [])
    for t in tags:
        if t in classifications:
            classifications[t] = True
            
    # Auto-classify based on failed stage if tags empty
    if not tags and failed_stage:
        if failed_stage in ["Guest Login", "Landing Page"]:
            classifications["Frontend"] = True
        elif failed_stage == "Deployment":
            classifications["Deployment"] = True
        elif failed_stage == "WebSocket":
            classifications["WebSocket"] = True
        elif failed_stage == "WebRTC":
            classifications["WebRTC"] = True
            
    class_str = "Failure Type\\n\\n"
    for k, v in classifications.items():
        mark = "✓" if v else "☐"
        class_str += f"{mark} {k}\\n"

    report = f"""FOUDY Production Certification
==============================

Certification Framework: v1.0.0
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
Landing Page ...... {pipeline_state.get("Landing Page")}
Guest Login ....... {pipeline_state.get("Guest Login")}
Profile ........... {pipeline_state.get("Profile")}
Queue ............. {pipeline_state.get("Queue")}
WebSocket ......... {pipeline_state.get("WebSocket")}
Matchmaking ....... {pipeline_state.get("Matchmaking")}
Room .............. {pipeline_state.get("Room")}
WebRTC ............ {pipeline_state.get("WebRTC")}
Cleanup ........... {pipeline_state.get("Cleanup")}

Performance

Guest Login ............ {metrics.get('Authentication Latency', [0])[0]} ms
Queue Join ............. {metrics.get('Queue Join Latency', [0])[0]} ms
Matchmaking ............ {metrics.get('Matchmaking Latency', [0])[0]} ms
WebSocket Connect ...... {metrics.get('WebSocket Connect Time', [0])[0]} ms
ICE Connected .......... {metrics.get('ICE Connection Time', [0])[0]} ms
Remote Video ........... {metrics.get('Time to First Remote Video Frame', [0])[0]} ms

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

    # Save Markdown report
    with open(os.path.join(artifacts_dir, "certification_report.md"), "w") as f:
        f.write(report)
        
    # Save JSON scorecard
    # We must stringify datetime objects before json dump
    if "Start Time" in scorecard:
        scorecard["Start Time"] = scorecard["Start Time"].isoformat() + "Z"
        
    with open(os.path.join(artifacts_dir, "certification_scorecard.json"), "w") as f:
        json.dump(scorecard, f, indent=2)

    print("\\n" + report + "\\n")
