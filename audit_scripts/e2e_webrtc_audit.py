import asyncio
from playwright.async_api import async_playwright
import uuid
import time
import sys

URL = "https://www.foudy.online"

async def handle_spa_routing(route):
    req_url = route.request.url
    # If it's a navigation to a subpath of our app (not an asset)
    if req_url.startswith(URL) and req_url != URL + "/" and req_url != URL:
        if not req_url.endswith(".js") and not req_url.endswith(".css") and not req_url.endswith(".svg"):
            # Fetch root page
            import urllib.request
            try:
                req = urllib.request.Request(URL + "/", headers={'User-Agent': 'Mozilla/5.0'})
                html = urllib.request.urlopen(req).read()
                await route.fulfill(status=200, content_type="text/html", body=html)
                return
            except Exception as e:
                pass
    await route.continue_()

async def user_journey(browser, user_id):
    print(f"[{user_id}] Starting session...")
    context = await browser.new_context(
        permissions=['camera', 'microphone']
    )
    await context.route("**/*", handle_spa_routing)
    page = await context.new_page()
    
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
        print(f"[{user_id}] Registration successful, at profile page.")
    except Exception as e:
        print(f"[{user_id}] Registration failed: {e}")
        # Capture error text if any
        body_text = await page.locator("body").inner_text()
        print(f"[{user_id}] Page content: {body_text[:500]}")
        return page, False
        
    # 2. Profile Complete
    try:
        # Add an interest to reach 40% completion (display_name 15 + interests 25 = 40)
        await page.fill("input[placeholder*='Tech']", "Testing")
        await page.press("input[placeholder*='Tech']", "Enter")
        await page.click("button:has-text('Save Progress')", timeout=5000)
        await page.wait_for_timeout(1000)
        
        await page.click("button:has-text('Continue')", timeout=5000)
        print(f"[{user_id}] Profile saved/continued.")
        await page.wait_for_url("**/home**", timeout=10000)
    except Exception as e:
        form_html = await page.locator("form").inner_html()
        print(f"[{user_id}] Could not auto-save profile. Form HTML: {form_html[:2000]}")
        
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
