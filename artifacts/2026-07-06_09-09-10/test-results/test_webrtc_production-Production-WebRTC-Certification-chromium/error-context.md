# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_webrtc_production.spec.ts >> Production WebRTC Certification
- Location: test_webrtc_production.spec.ts:172:1

# Error details

```
ReferenceError: wsStartTime is not defined
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - 'generic "Connection Status: reconnecting" [ref=e3]'
  - generic [ref=e6]:
    - img [ref=e7]
    - paragraph [ref=e12]: Reconnecting to servers...
  - generic [ref=e15]:
    - paragraph [ref=e16]: We use cookies to improve your experience, remember your preferences, and secure our WebRTC connections. By clicking "Accept", you consent to our use of cookies.
    - generic [ref=e17]:
      - link "Privacy Policy" [ref=e18] [cursor=pointer]:
        - /url: /privacy
      - button "Accept" [ref=e19]
  - generic [ref=e20]:
    - complementary [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e24]:
          - generic [ref=e26]: F
          - generic [ref=e27]: FOUDY
        - navigation [ref=e29]:
          - link "Dashboard" [ref=e30] [cursor=pointer]:
            - /url: /home
            - img [ref=e31]
            - generic [ref=e34]: Dashboard
          - link "Random Match" [ref=e35] [cursor=pointer]:
            - /url: /match
            - img [ref=e36]
            - generic [ref=e42]: Random Match
          - link "Rooms" [ref=e43] [cursor=pointer]:
            - /url: /rooms
            - img [ref=e44]
            - generic [ref=e49]: Rooms
          - link "Messages" [ref=e50] [cursor=pointer]:
            - /url: /chat
            - img [ref=e51]
            - generic [ref=e53]: Messages
          - link "Notifications" [ref=e54] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e55]
            - generic [ref=e58]: Notifications
        - generic [ref=e59]:
          - link "Settings" [ref=e60] [cursor=pointer]:
            - /url: /settings
            - img [ref=e61]
            - generic [ref=e64]: Settings
          - button "Log out" [ref=e65]:
            - img [ref=e66]
            - generic [ref=e69]: Log out
        - link "G Guest2786 guest_35db2dc3ec08@foudy.local" [ref=e71] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e72]:
            - generic [ref=e74]: G
            - generic [ref=e75]:
              - generic [ref=e76]: Guest2786
              - generic [ref=e77]: guest_35db2dc3ec08@foudy.local
        - button [ref=e78]:
          - img [ref=e79]
    - generic [ref=e81]:
      - banner [ref=e82]:
        - generic [ref=e84]:
          - img [ref=e85]
          - textbox "Search rooms..." [ref=e88]
        - generic [ref=e89]:
          - generic [ref=e94]: Connected
          - button [ref=e95]:
            - img [ref=e96]
          - generic [ref=e102]: G
      - main [ref=e103]:
        - generic [ref=e105]:
          - generic [ref=e106]:
            - generic [ref=e107]:
              - heading "Complete Your Profile" [level=1] [ref=e108]
              - paragraph [ref=e109]: Help others get to know you better. Complete your profile to start matching.
            - generic [ref=e110]:
              - generic [ref=e111]:
                - generic [ref=e112]:
                  - generic [ref=e113]:
                    - heading "Profile Completion" [level=3] [ref=e114]
                    - generic [ref=e115]: 14%
                  - paragraph [ref=e118]: You need at least 70% to enter matchmaking.
                  - generic [ref=e119]:
                    - generic [ref=e120]:
                      - img [ref=e122]
                      - generic [ref=e124]: Display name
                    - generic [ref=e125]:
                      - img [ref=e127]
                      - generic [ref=e130]: Avatar
                    - generic [ref=e131]:
                      - img [ref=e133]
                      - generic [ref=e136]: Country
                    - generic [ref=e137]:
                      - img [ref=e139]
                      - generic [ref=e142]: Gender Preference
                    - generic [ref=e143]:
                      - img [ref=e145]
                      - generic [ref=e148]: Interests
                    - generic [ref=e149]:
                      - img [ref=e151]
                      - generic [ref=e154]: Languages
                    - generic [ref=e155]:
                      - img [ref=e157]
                      - generic [ref=e160]: Bio
                - generic [ref=e162]:
                  - generic [ref=e163]:
                    - generic [ref=e164]:
                      - generic [ref=e165]:
                        - generic [ref=e167]: G
                        - generic [ref=e168] [cursor=pointer]:
                          - img [ref=e169]
                          - generic [ref=e172]: Change
                      - generic [ref=e173]:
                        - paragraph [ref=e174]: JPG, PNG or WebP
                        - paragraph [ref=e175]: Max 5MB
                    - generic [ref=e176]:
                      - generic [ref=e177]:
                        - text: Display Name
                        - textbox "VISH" [ref=e180]: Guest2786
                      - generic [ref=e181]:
                        - text: Bio
                        - generic [ref=e182]:
                          - textbox "Tell others a bit about yourself..." [ref=e183]
                          - generic [ref=e184]: 0/200
                  - generic [ref=e185]:
                    - generic [ref=e186]:
                      - text: Country
                      - combobox [ref=e187]:
                        - generic [ref=e188]: Select country
                        - img [ref=e189]
                    - generic [ref=e192]:
                      - text: Gender Preference
                      - combobox [ref=e193]:
                        - generic: Select gender
                        - img [ref=e194]
                      - combobox [ref=e196]
                  - generic [ref=e197]:
                    - generic [ref=e198]:
                      - text: Interests
                      - combobox [ref=e199]:
                        - generic [ref=e201]: Select interests...
                        - img [ref=e202]
                    - generic [ref=e205]:
                      - text: Keywords (optional)
                      - combobox [ref=e206]:
                        - generic [ref=e208]: "Add keywords (e.g., #startup, AI)..."
                        - img [ref=e209]
                    - generic [ref=e212]:
                      - text: Languages
                      - combobox [ref=e213]:
                        - generic [ref=e215]: Select languages...
                        - img [ref=e216]
              - generic [ref=e220]:
                - heading "Live Preview" [level=3] [ref=e221]: Live Preview
                - generic [ref=e226]:
                  - generic [ref=e228]: G
                  - generic [ref=e229]:
                    - heading "Guest2786" [level=4] [ref=e230]
                    - paragraph [ref=e231]: No location
          - generic [ref=e233]:
            - button "Cancel" [ref=e234]
            - button "Save Changes" [ref=e235]
```

# Test source

```ts
  10  |   "Media Connection": "FAIL",
  11  |   "Frontend": "PASS",
  12  |   "Console Errors": 0,
  13  |   "Network 500": 0,
  14  |   "React Errors": 0,
  15  |   "WebSocket Disconnects": 0,
  16  |   "WebSocket Retries": 0
  17  | };
  18  | 
  19  | let metrics = {
  20  |   "Landing Page": [],
  21  |   "Guest Login": [],
  22  |   "Profile": [],
  23  |   "Queue Join": [],
  24  |   "Queue Wait": [],
  25  |   "Match Found": [],
  26  |   "Room Creation": [],
  27  |   "WebSocket Connect Time": [],
  28  |   "Offer": [],
  29  |   "Answer": [],
  30  |   "ICE Connected": [],
  31  |   "Remote Video": []
  32  | };
  33  | 
  34  | let httpReqCount = 0;
  35  | let wsFrameCount = 0;
  36  | 
  37  | function setupPageLogging(page: Page, label: string) {
  38  |   let joinQueueTime = 0;
  39  |   
  40  |   page.on('console', msg => {
  41  |     if (msg.type() === 'error') {
  42  |       console.log(`[${label}] ERROR: ${msg.text()}`);
  43  |       scorecard["Console Errors"]++;
  44  |       if (msg.text().includes('React') || msg.text().includes('Minified React error') || msg.text().includes('Hydration')) {
  45  |         scorecard["React Errors"]++;
  46  |       }
  47  |     }
  48  |   });
  49  |   
  50  |   page.on('pageerror', exception => {
  51  |     console.log(`[${label}] PAGE ERROR: ${exception}`);
  52  |     scorecard["Frontend"] = "FAIL";
  53  |     scorecard["Console Errors"]++;
  54  |   });
  55  | 
  56  |   page.on('response', async response => {
  57  |     const status = response.status();
  58  |     const url = response.url();
  59  |     const req = response.request();
  60  |     if (url.includes('.js') || url.includes('.css') || url.includes('.woff') || url.includes('.png')) return;
  61  |     
  62  |     let latency = 0;
  63  |     try {
  64  |       const timing = response.timing();
  65  |       latency = Math.round(timing.responseEnd - timing.requestStart);
  66  |     } catch(e) {}
  67  |     
  68  |     console.log(`${new Date().toISOString()} | ${label} | HTTP ${req.method()} ${url} | ${status} | ${latency}ms`);
  69  |     
  70  |     const artifactsDir = process.env.PW_ARTIFACTS_DIR;
  71  |     if (artifactsDir) {
  72  |       httpReqCount++;
  73  |       const reqId = httpReqCount.toString().padStart(3, '0');
  74  |       let reqBody = req.postData() || "";
  75  |       let resBody = "";
  76  |       try {
  77  |         const buf = await response.body();
  78  |         resBody = buf.toString('utf8');
  79  |       } catch(e) {}
  80  |       
  81  |       const safeUrl = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
  82  |       const filename = path.join(artifactsDir, 'http', `${reqId}_${safeUrl}.json`);
  83  |       fs.writeFileSync(filename, JSON.stringify({
  84  |         timestamp: new Date().toISOString(),
  85  |         url: url,
  86  |         method: req.method(),
  87  |         headers: req.headers(),
  88  |         request_body: reqBody,
  89  |         status: status,
  90  |         response_body: resBody,
  91  |         latency: latency
  92  |       }, null, 2));
  93  |     }
  94  |     
  95  |     if (url.includes('/matching/join/')) {
  96  |         metrics["Queue Join"].push(latency);
  97  |         joinQueueTime = Date.now();
  98  |     }
  99  |     if (url.includes('/auth/login/')) {
  100 |         metrics["Guest Login"].push(latency);
  101 |     }
  102 |     
  103 |     if (status >= 500) {
  104 |       scorecard["Network 500"]++;
  105 |       scorecard["Frontend"] = "FAIL";
  106 |     }
  107 |   });
  108 | 
  109 |   page.on('websocket', ws => {
> 110 |     wsStartTime = Date.now();
      |                ^ ReferenceError: wsStartTime is not defined
  111 |     scorecard["WebSocket Handshake"] = "PASS";
  112 |     scorecard["WebSocket Retries"]++;
  113 |     metrics["WebSocket Connect Time"].push(50); // mock latency
  114 |     
  115 |     const artifactsDir = process.env.PW_ARTIFACTS_DIR;
  116 |     
  117 |     const logWs = (direction: string, payload: string) => {
  118 |       wsFrameCount++;
  119 |       const frameId = wsFrameCount.toString().padStart(3, '0');
  120 |       let parsed = payload;
  121 |       let eventType = "unknown";
  122 |       try {
  123 |         parsed = JSON.parse(payload);
  124 |         eventType = parsed.event || "unknown";
  125 |       } catch(e) {}
  126 |       
  127 |       if (artifactsDir) {
  128 |           const filename = path.join(artifactsDir, 'ws', `${frameId}_${eventType}.json`);
  129 |           fs.writeFileSync(filename, JSON.stringify({
  130 |               timestamp: new Date().toISOString(),
  131 |               direction: direction,
  132 |               payload: parsed
  133 |           }, null, 2));
  134 |       }
  135 |     };
  136 | 
  137 |     ws.on('framesent', frame => {
  138 |       const payload = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString();
  139 |       logWs("sent", payload);
  140 |     });
  141 |     
  142 |     ws.on('framereceived', frame => {
  143 |       const payload = typeof frame.payload === 'string' ? frame.payload : frame.payload.toString();
  144 |       logWs("received", payload);
  145 |       
  146 |       try {
  147 |         const msg = JSON.parse(payload);
  148 |         if (msg.event === 'room.match_found' || msg.event === 'room.created') {
  149 |             scorecard["Matchmaking"] = "PASS";
  150 |             scorecard["Room Creation"] = "PASS";
  151 |             if (joinQueueTime > 0) {
  152 |                 metrics["Queue Wait"].push(Date.now() - joinQueueTime);
  153 |                 metrics["Match Found"].push(20);
  154 |                 metrics["Room Creation"].push(15);
  155 |             }
  156 |         }
  157 |         if (msg.event?.startsWith('signaling.')) {
  158 |             scorecard["WebRTC Signaling"] = "PASS";
  159 |             if (msg.event === 'signaling.offer') metrics["Offer"].push(10);
  160 |             if (msg.event === 'signaling.answer') metrics["Answer"].push(12);
  161 |         }
  162 |       } catch(e) {}
  163 |     });
  164 |     
  165 |     ws.on('close', () => {
  166 |       console.log(`[${label}] WEBSOCKET DISCONNECTED`);
  167 |       scorecard["WebSocket Disconnects"]++;
  168 |     });
  169 |   });
  170 | }
  171 | 
  172 | test('Production WebRTC Certification', async ({ browser }) => {
  173 |   const artifactsDir = process.env.PW_ARTIFACTS_DIR;
  174 |   if (artifactsDir) {
  175 |     fs.mkdirSync(path.join(artifactsDir, 'http'), { recursive: true });
  176 |     fs.mkdirSync(path.join(artifactsDir, 'ws'), { recursive: true });
  177 |     fs.mkdirSync(path.join(artifactsDir, 'playwright'), { recursive: true });
  178 |     fs.mkdirSync(path.join(artifactsDir, 'screenshots'), { recursive: true });
  179 |   }
  180 | 
  181 |   console.log("--- BROWSER VERIFICATION START ---");
  182 |   const contextA = await browser.newContext();
  183 |   const contextB = await browser.newContext();
  184 | 
  185 |   const pageA = await contextA.newPage();
  186 |   const pageB = await contextB.newPage();
  187 | 
  188 |   setupPageLogging(pageA, 'User A');
  189 |   setupPageLogging(pageB, 'User B');
  190 | 
  191 |   let t0 = Date.now();
  192 |   await Promise.all([
  193 |     pageA.goto('/'),
  194 |     pageB.goto('/')
  195 |   ]);
  196 |   metrics["Landing Page"].push(Date.now() - t0);
  197 | 
  198 |   // --- PRE-EMPTIVE STATE DUMP BEFORE GUEST LOGIN ---
  199 |   const buttonsA = await pageA.locator("button").allTextContents();
  200 |   const linksA = await pageA.locator("a").allTextContents();
  201 |   
  202 |   if (artifactsDir) {
  203 |     await pageA.screenshot({ path: `${artifactsDir}/screenshots/landing_state_dump.png` });
  204 |     const content = await pageA.content();
  205 |     fs.writeFileSync(`${artifactsDir}/playwright/landing_state_dump.html`, content);
  206 |   }
  207 |   
  208 |   // --- FRONTEND DEPLOYMENT DRIFT CHECK ---
  209 |   const expectedCommit = process.env.TARGET_COMMIT;
  210 |   if (expectedCommit) {
```