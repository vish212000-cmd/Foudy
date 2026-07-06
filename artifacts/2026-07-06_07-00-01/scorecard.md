FOUDY Production Certification
==============================

Certification Framework: v1.1.0
Certification ID: 20260706-070001

Commit:
b49e7c3dba62e67f32fa8571d7b0b0af9301c760

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

Certification Started:  2026-07-06T07:00:01.056654Z
Certification Finished: 2026-07-06T07:01:16.447136Z
Total Duration:         75.4s

Deployment ........ PASS
Landing Page ...... PASS
Guest Login ....... PASS
Profile ........... PASS
Queue Join ........ PASS
Queue Wait ........ PASS
Match Found ....... ERROR
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
Python Version:  UNKNOWN
Django Version:  UNKNOWN

Overall

Result: NO-GO

Failure Type\n\n✓ Infrastructure\n☐ Deployment\n☐ Backend\n☐ Frontend\n☐ Database\n☐ Redis\n☐ WebSocket\n☐ WebRTC\n✓ Test Framework\n☐ Selector Drift\n☐ Configuration\n☐ Performance\n
Release Approved: NO

Exit Code: 3
