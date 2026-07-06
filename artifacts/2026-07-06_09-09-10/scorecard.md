FOUDY Production Certification
==============================

Certification Framework: v1.1.0
Certification ID: 20260706-090910

Commit:
cb8e77af8406bff5459bc305cabb29abdc6d6475

Environment:
production

Service:
Render

Frontend:
https://foudy.online

Backend:
https://foudy.onrender.com

WebSocket:
wss://foudy.onrender.com

Certification Started:  2026-07-06T09:09:10.430707Z
Certification Finished: 2026-07-06T09:09:47.112465Z
Total Duration:         36.7s

Deployment ........ PASS
Landing Page ...... PASS
Guest Login ....... PASS
Profile ........... PASS
Queue Join ........ PASS
Queue Wait ........ PASS
Match Found ....... FAIL
Room Creation ..... BLOCKED
WebSocket ......... BLOCKED
Offer ............. BLOCKED
Answer ............ BLOCKED
ICE Connected ..... BLOCKED
Remote Track ...... BLOCKED
Cleanup ........... BLOCKED

Performance

Landing Page ........... N/A ms
Guest Login ............ N/A ms
Profile ................ N/A ms
Queue Join ............. N/A ms
Queue Wait ............. N/A ms
Match Found ............ N/A ms
Room Creation .......... N/A ms
WS Handshake ........... N/A ms
Offer .................. N/A ms
Answer ................. N/A ms
ICE Connected .......... N/A ms
Remote Video ........... N/A ms

Retries
WebSocket Connect ...... 0

Console Errors ......... 0
Network 500 ............ 0
React Errors ........... 0

Runtime Details
Python Version:  3.12.0
Django Version:  6.0.6

Overall

Result: NO-GO

Failure Type\n\n☐ Infrastructure\n☐ Deployment\n☐ Backend\n☐ Frontend\n☐ Database\n☐ Redis\n☐ WebSocket\n☐ WebRTC\n☐ Test Framework\n☐ Selector Drift\n☐ Configuration\n☐ Performance\n
Release Approved: NO

Exit Code: 1
