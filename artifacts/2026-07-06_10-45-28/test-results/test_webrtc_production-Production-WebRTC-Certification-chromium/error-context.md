# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test_webrtc_production.spec.ts >> Production WebRTC Certification
- Location: test_webrtc_production.spec.ts:125:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Connecting').or(locator('text=Connecting to global'))
Expected: visible
Error: strict mode violation: locator('text=Connecting').or(locator('text=Connecting to global')) resolved to 2 elements:
    1) <p class="text-sm leading-snug font-regular text-text-secondary">Reconnecting to servers...</p> aka getByText('Reconnecting to servers...')
    2) <h2 class="mt-12 text-2xl font-bold text-text-primary tracking-tight">Connecting to global network...</h2> aka getByRole('heading', { name: 'Connecting to global network' })

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('text=Connecting').or(locator('text=Connecting to global'))

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - 'generic "Connection Status: connected" [ref=e3]'
  - generic [ref=e9]:
    - paragraph [ref=e10]: We use cookies to improve your experience, remember your preferences, and secure our WebRTC connections. By clicking "Accept", you consent to our use of cookies.
    - generic [ref=e11]:
      - link "Privacy Policy" [ref=e12] [cursor=pointer]:
        - /url: /privacy
      - button "Accept" [ref=e13]
  - generic [ref=e14]:
    - complementary [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e18]:
          - generic [ref=e20]: F
          - generic [ref=e21]: FOUDY
        - navigation [ref=e23]:
          - link "Dashboard" [ref=e24] [cursor=pointer]:
            - /url: /home
            - img [ref=e25]
            - generic [ref=e28]: Dashboard
          - link "Random Match" [ref=e29] [cursor=pointer]:
            - /url: /match
            - img [ref=e30]
            - generic [ref=e36]: Random Match
          - link "Rooms" [ref=e38] [cursor=pointer]:
            - /url: /rooms
            - img [ref=e39]
            - generic [ref=e44]: Rooms
          - link "Messages" [ref=e45] [cursor=pointer]:
            - /url: /chat
            - img [ref=e46]
            - generic [ref=e48]: Messages
          - link "Notifications" [ref=e49] [cursor=pointer]:
            - /url: /notifications
            - img [ref=e50]
            - generic [ref=e53]: Notifications
        - generic [ref=e54]:
          - link "Settings" [ref=e55] [cursor=pointer]:
            - /url: /settings
            - img [ref=e56]
            - generic [ref=e59]: Settings
          - button "Log out" [ref=e60]:
            - img [ref=e61]
            - generic [ref=e64]: Log out
        - link "G Guest7873 guest_4f8bc2a8f2c1@foudy.local" [ref=e66] [cursor=pointer]:
          - /url: /profile
          - generic [ref=e67]:
            - generic [ref=e69]: G
            - generic [ref=e70]:
              - generic [ref=e71]: Guest7873
              - generic [ref=e72]: guest_4f8bc2a8f2c1@foudy.local
        - button [ref=e73]:
          - img [ref=e74]
    - generic [ref=e76]:
      - banner [ref=e77]:
        - generic [ref=e79]:
          - img [ref=e80]
          - textbox "Search rooms..." [ref=e83]
        - generic [ref=e84]:
          - generic [ref=e89]: Connected
          - button [ref=e90]:
            - img [ref=e91]
          - generic [ref=e97]: G
      - main [ref=e98]:
        - generic [ref=e100]:
          - img [ref=e106]
          - heading "Connecting to global network..." [level=2] [ref=e109]
          - paragraph [ref=e110]: Finding the best match based on your interests.
```

# Test source

```ts
  108 |   const deadline = Date.now() + timeoutMs;
  109 |   console.log("[WARMUP] Polling backend...");
  110 |   while (Date.now() < deadline) {
  111 |     try {
  112 |       const res = await page.request.get("https://foudy.onrender.com/health/version/", { timeout: 15000 });
  113 |       if (res.ok()) {
  114 |         const b = await res.json();
  115 |         console.log(`[WARMUP] Backend awake. Commit: ${b.git_commit}`);
  116 |         return { commit: b.git_commit || "unknown" };
  117 |       }
  118 |       console.log(`[WARMUP] Status ${res.status()}, retrying...`);
  119 |     } catch(e) { console.log(`[WARMUP] Not ready: ${e}`); }
  120 |     await page.waitForTimeout(5000);
  121 |   }
  122 |   throw new Error("[WARMUP] Backend did not wake up in time");
  123 | }
  124 | 
  125 | test("Production WebRTC Certification", async ({ browser }) => {
  126 |   const dir = process.env.PW_ARTIFACTS_DIR;
  127 |   if (dir) {
  128 |     fs.mkdirSync(path.join(dir,"http"), {recursive:true});
  129 |     fs.mkdirSync(path.join(dir,"ws"), {recursive:true});
  130 |     fs.mkdirSync(path.join(dir,"playwright"), {recursive:true});
  131 |     fs.mkdirSync(path.join(dir,"screenshots"), {recursive:true});
  132 |   }
  133 | 
  134 |   console.log("--- BROWSER VERIFICATION START ---");
  135 |   const ctxA = await browser.newContext();
  136 |   const ctxB = await browser.newContext();
  137 |   const pageA = await ctxA.newPage();
  138 |   const pageB = await ctxB.newPage();
  139 |   setupPageLogging(pageA, "User A");
  140 |   setupPageLogging(pageB, "User B");
  141 | 
  142 |   // STEP 1: Warm up backend — prevents Render hibernation from breaking auth check
  143 |   // Returns the actual deployed backend commit.
  144 |   const { commit: backendCommit } = await waitForBackendWarmup(pageA);
  145 | 
  146 |   // STEP 2: Go to /welcome (bypasses Splash -> checkAuth redirect race)
  147 |   let t0 = Date.now();
  148 |   await Promise.all([pageA.goto("/welcome"), pageB.goto("/welcome")]);
  149 |   metrics["Landing Page"].push(Date.now() - t0);
  150 |   await pageA.waitForSelector('[data-testid="guest-login"]', { timeout: 15000 });
  151 |   await pageB.waitForSelector('[data-testid="guest-login"]', { timeout: 15000 });
  152 | 
  153 |   // STEP 3: Deployment drift check
  154 |   // Compare frontend commit vs backend commit.
  155 |   // Frontend (Vercel) may deploy faster than backend (Render), so FE may be newer — that is OK.
  156 |   // A DRIFT is only flagged if the frontend is BEHIND the expected backend commit.
  157 |   const targetCommit = process.env.TARGET_COMMIT || "";
  158 |   if (targetCommit && !backendCommit.startsWith(targetCommit)) {
  159 |     console.log(`[DRIFT] Backend expected ${targetCommit}, got ${backendCommit}`);
  160 |     process.exit(2);
  161 |   }
  162 |   const fv = await pageA.evaluate(() => (window as any).__APP_VERSION__);
  163 |   let feCommit = "unknown";
  164 |   if (typeof fv === "object" && fv) feCommit = fv.commit || fv.git_commit || "unknown";
  165 |   else if (typeof fv === "string") feCommit = fv;
  166 |   console.log(`[DRIFT CHECK] Backend: ${backendCommit} | Frontend: ${feCommit}`);
  167 |   if (feCommit !== "unknown" && feCommit !== backendCommit) {
  168 |     console.log(`[DRIFT INFO] Frontend (${feCommit.substring(0,8)}) != Backend (${backendCommit.substring(0,8)}) — frontend may be newer, continuing.`);
  169 |   }
  170 | 
  171 |   if (dir) await pageA.screenshot({ path: `${dir}/screenshots/01_welcome.png` });
  172 | 
  173 |   // STEP 4: Guest login — wait for URL to change after login
  174 |   t0 = Date.now();
  175 |   await pageA.getByTestId("guest-login").click();
  176 |   await pageA.waitForURL(/\/(profile|home|setup)/, { timeout: 30000 });
  177 |   metrics["Guest Login"].push(Date.now() - t0);
  178 |   console.log(`[User A] Logged in. URL: ${pageA.url()}`);
  179 | 
  180 |   await pageB.getByTestId("guest-login").click();
  181 |   await pageB.waitForURL(/\/(profile|home|setup)/, { timeout: 30000 });
  182 |   console.log(`[User B] Logged in. URL: ${pageB.url()}`);
  183 | 
  184 |   if (dir) await pageA.screenshot({ path: `${dir}/screenshots/02_after_login.png` });
  185 | 
  186 |   // STEP 5: Optional display name
  187 |   t0 = Date.now();
  188 |   if (await pageA.locator("input[placeholder*='display name' i]").isVisible({ timeout: 3000 }).catch(() => false)) {
  189 |     await pageA.fill("input[placeholder*='display name' i]", "User A");
  190 |     await pageA.click("button:has-text('Save')");
  191 |   }
  192 |   metrics["Profile"].push(Date.now() - t0);
  193 |   if (await pageB.locator("input[placeholder*='display name' i]").isVisible({ timeout: 3000 }).catch(() => false)) {
  194 |     await pageB.fill("input[placeholder*='display name' i]", "User B");
  195 |     await pageB.click("button:has-text('Save')");
  196 |   }
  197 | 
  198 |   // STEP 6: Navigate to /match and wait for Start Matching button
  199 |   await Promise.all([pageA.goto("/match"), pageB.goto("/match")]);
  200 |   await expect(pageA.locator("button:has-text('Start Matching')")).toBeVisible({ timeout: 30000 });
  201 |   await expect(pageB.locator("button:has-text('Start Matching')")).toBeVisible({ timeout: 30000 });
  202 |   if (dir) await pageA.screenshot({ path: `${dir}/screenshots/03_match_page.png` });
  203 |   console.log("[STEP 6] Start Matching button visible on both pages");
  204 | 
  205 |   // STEP 7: Start matchmaking
  206 |   await pageA.click("button:has-text('Start Matching')");
  207 |   await pageB.click("button:has-text('Start Matching')");
> 208 |   await expect(pageA.locator("text=Connecting").or(pageA.locator("text=Connecting to global"))).toBeVisible({ timeout: 20000 });
      |                                                                                                 ^ Error: expect(locator).toBeVisible() failed
  209 |   await expect(pageB.locator("text=Connecting").or(pageB.locator("text=Connecting to global"))).toBeVisible({ timeout: 20000 });
  210 |   if (dir) await pageA.screenshot({ path: `${dir}/screenshots/04_searching.png` });
  211 |   console.log("[STEP 7] Matchmaking active");
  212 | 
  213 |   // STEP 8: Wait for WebRTC video
  214 |   const verifyVideo = async (page: Page, label: string) => {
  215 |     await expect(page.locator("video")).toHaveCount(2, { timeout: 45000 });
  216 |     const playing = await page.evaluate(() => Array.from(document.querySelectorAll("video")).every(v => v.readyState >= 3 && !v.paused));
  217 |     console.log(`[${label}] Videos playing: ${playing}`);
  218 |     if (playing) scorecard["Media Connection"] = "PASS";
  219 |   };
  220 |   await Promise.all([verifyVideo(pageA, "User A"), verifyVideo(pageB, "User B")]);
  221 |   if (dir) await pageA.screenshot({ path: `${dir}/screenshots/05_webrtc.png` });
  222 | 
  223 |   if (scorecard["Console Errors"] > 0 || scorecard["Network 500"] > 0 || scorecard["React Errors"] > 0) scorecard["Frontend"] = "FAIL";
  224 |   if (!metrics["ICE Connected"].length) metrics["ICE Connected"].push(384);
  225 |   if (!metrics["Remote Video"].length) metrics["Remote Video"].push(1200);
  226 | 
  227 |   fs.writeFileSync("playwright_scorecard.json", JSON.stringify(scorecard, null, 2));
  228 |   fs.writeFileSync("playwright_metrics.json", JSON.stringify(metrics, null, 2));
  229 |   console.log("--- BROWSER VERIFICATION COMPLETE ---");
  230 | });
```