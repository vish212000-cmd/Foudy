import asyncio
from playwright.async_api import async_playwright
import uuid
import time
import sys

URL = "https://www.foudy.online"

async def handle_proxy(route):
    req_url = route.request.url
    
    if req_url.startswith("https://foudy.onrender.com") or req_url.startswith("wss://"):
        await route.continue_()
        return

    if req_url.startswith(URL):
        local_url = req_url.replace(URL, "http://localhost:4173")
        import urllib.request
        try:
            req = urllib.request.Request(local_url)
            with urllib.request.urlopen(req) as response:
                content = response.read()
                headers = dict(response.getheaders())
                await route.fulfill(status=response.status, headers=headers, body=content)
            return
        except Exception as e:
            # SPA fallback
            try:
                req = urllib.request.Request("http://localhost:4173/")
                with urllib.request.urlopen(req) as response:
                    content = response.read()
                    headers = dict(response.getheaders())
                    await route.fulfill(status=200, headers=headers, body=content)
                return
            except Exception:
                pass
                
    await route.continue_()

async def user_journey(browser, user_id):
    print(f"[{user_id}] Starting session...")
    context = await browser.new_context(
        permissions=['camera', 'microphone']
    )
    # Intercept all requests to proxy frontend and let backend pass
    await context.route("**/*", handle_proxy)
    page = await context.new_page()
    
    page.on("response", lambda response: print(f"[{user_id}] Response {response.status} from {response.url}") if not response.ok else None)
    
    # 1. Registration
    print(f"[{user_id}] Navigating to {URL}/register...")
    await page.goto(URL + "/register", timeout=60000)
    
    try:
        await page.wait_for_selector("input[type='email']", timeout=10000)
    except Exception as e:
        print(f"[{user_id}] Failed to find email input. Page content:")
        body = await page.locator("body").inner_text()
        print(f"[{user_id}] {body[:1000]}")
        raise e
        
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    pwd = "StrongPassword123!"
    
    print(f"[{user_id}] Registering as {email}...")
    # Fill out the form
    await page.fill("input[type='text']", f"User_{user_id}")
    await page.fill("input[type='email']", email)
    await page.fill("input[type='password']", pwd)
    await page.click("button[type='submit']")
    
    try:
        await page.wait_for_url("**/profile**", timeout=15000)
        token = await page.evaluate("localStorage.getItem('token')")
        print(f"[{user_id}] Registration successful, at profile page. Token: {token[:20] if token else 'NONE'}")
    except Exception as e:
        print(f"[{user_id}] Registration failed: {e}")
        # Capture error text if any
        body_text = await page.locator("body").inner_text()
        print(f"[{user_id}] Page content: {body_text[:500]}")
        return page, False
        
    # 2. Profile Complete
    try:
        # Fill Display Name just in case it's empty
        display_name_input = page.locator("input").nth(1)
        try:
            await display_name_input.fill("Tester")
        except:
            pass
            
        # Fill any other text inputs (like Interests)
        inputs = await page.locator("input[type='text']").all()
        for i, inp in enumerate(inputs):
            try:
                await inp.fill(f"TestTag")
                await inp.press("Enter")
            except:
                pass
                
        await page.click("button:has-text('Save Progress')", timeout=5000)
        await page.wait_for_timeout(1000)
        
        await page.click("button:has-text('Continue')", timeout=5000)
        print(f"[{user_id}] Profile saved/continued.")
        await page.wait_for_url("**/home**", timeout=10000)
    except Exception as e:
        form_html = await page.locator("body").inner_html()
        print(f"[{user_id}] Could not auto-save profile. Form HTML len: {len(form_html)}")
        with open(f"{user_id}_profile_html.txt", "w", encoding="utf-8") as f:
            f.write(form_html)
        
    # 3. Matchmaking
    try:
        print(f"[{user_id}] Starting matchmaking...")
        await page.goto(f"{URL}/match")
        await page.click("button:has-text('Start Matching')", timeout=5000)
    except Exception as e:
        print(f"[{user_id}] Matchmaking error: {e}")
        return page, False
        
    print(f"[{user_id}] Waiting in queue...")
    return page, True

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=[
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream"
        ])
        
        # Start both users
        task_a = user_journey(browser, "UserA")
        task_b = user_journey(browser, "UserB")
        
        results = await asyncio.gather(task_a, task_b)
        page_a, success_a = results[0]
        page_b, success_b = results[1]
        
        if not success_a or not success_b:
            print("Failed to reach matchmaking queue.")
            await browser.close()
            sys.exit(1)
            
        print("Both users in queue. Waiting for match...")
        
        # Wait for match URL
        try:
            await page_a.wait_for_url("**/chat**", timeout=30000)
            await page_b.wait_for_url("**/chat**", timeout=30000)
            print("MATCH FOUND! Both users in chat.")
        except Exception as e:
            print(f"Match not found within timeout: {e}")
            await browser.close()
            sys.exit(1)
            
        # Verify WebRTC (video elements)
        videos_a = await page_a.locator("video").count()
        print(f"[UserA] Video elements found: {videos_a}")
        if videos_a < 2:
            print("[UserA] ERROR: Did not find local and remote video.")
            
        # Chat
        try:
            await page_a.fill("input[placeholder*='message']", "Hello from A!")
            await page_a.keyboard.press("Enter")
            time.sleep(2)
            
            chat_text = await page_b.locator("body").inner_text()
            if "Hello from A!" in chat_text:
                print("Chat works!")
            else:
                print("Chat message not received.")
        except Exception as e:
            print(f"Chat error: {e}")
            
        await browser.close()
        print("E2E Test Complete.")

if __name__ == "__main__":
    asyncio.run(main())
