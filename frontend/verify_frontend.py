import asyncio
from playwright.async_api import async_playwright
import traceback

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        errors = []
        console_logs = []
        network_500s = []

        # Listen for console errors
        page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}") if msg.type in ['error', 'warning'] else None)
        
        # Listen for unhandled exceptions
        page.on("pageerror", lambda err: errors.append(f"PageError: {err}"))
        
        # Listen for HTTP 500s and WS errors
        page.on("response", lambda res: network_500s.append(f"HTTP {res.status}: {res.url}") if res.status >= 500 else None)
        
        try:
            print("Navigating to https://foudy.online...")
            await page.goto("https://foudy.online/")
            await page.wait_for_load_state("networkidle")
            print("Successfully loaded.")

            # Click guest login
            print("Clicking 'Continue as Guest'...")
            # We look for a button that contains the text 'Guest'
            guest_button = page.locator("button:has-text('Guest')").first
            if await guest_button.is_visible():
                await guest_button.click()
            else:
                print("Could not find Guest button. Attempting alternative selectors...")
                # try clicking a link if it's a link
                guest_link = page.locator("a:has-text('Guest')").first
                if await guest_link.is_visible():
                    await guest_link.click()

            # Wait for navigation to matchmaking or setup
            print("Waiting for page change...")
            await page.wait_for_timeout(3000)

            # Check if we are on profile setup page
            if "setup" in page.url or "profile" in page.url:
                print(f"On profile setup page: {page.url}. Completing profile...")
                # Fill out some basic fields if possible, or just submit
                continue_btn = page.locator("button:has-text('Continue'), button:has-text('Save')").first
                if await continue_btn.is_visible():
                    await continue_btn.click()
                await page.wait_for_timeout(2000)

            print(f"Current URL: {page.url}")

            # Now try to join matching
            print("Looking for Join Queue button...")
            join_btn = page.locator("button:has-text('Join'), button:has-text('Find'), button:has-text('Start')").first
            
            if await join_btn.is_visible():
                print("Clicking Join button...")
                await join_btn.click()
                await page.wait_for_timeout(3000)
                
                # Check for UI updates (e.g. status changing to 'Waiting' or 'Searching')
                print("Looking for Searching/Waiting state...")
                waiting_text = page.locator("text=Searching").first
                if not await waiting_text.is_visible():
                    waiting_text = page.locator("text=Waiting").first
                
                if await waiting_text.is_visible():
                    print("UI correctly updated to show waiting state.")
                else:
                    print("UI did not show waiting state immediately. Let's wait longer...")
                    await page.wait_for_timeout(3000)

                try:
                    # Now try to leave
                    print("Looking for Leave/Cancel button...")
                    leave_btn = page.locator("button:has-text('Leave'), button:has-text('Cancel'), button:has-text('Stop')").first
                    if await leave_btn.is_visible():
                        print("Clicking Leave button...")
                        await leave_btn.click(timeout=5000)
                        await page.wait_for_timeout(2000)
                        print("Left queue.")
                    else:
                        print("Leave button not found.")
                except Exception as e:
                    print(f"Error clicking leave: {e}")
            else:
                print("Join button not found.")
                
            print("\n==============================")
            print("FRONTEND VERIFICATION RESULTS:")
            print("==============================")
            print(f"Total PageErrors: {len(errors)}")
            for e in errors:
                print(f" - {e}")
            
            print(f"Total Console Errors/Warnings: {len(console_logs)}")
            for c in console_logs:
                print(f" - {c}")
                
            print(f"Total Network 500s: {len(network_500s)}")
            for n in network_500s:
                print(f" - {n}")

        except Exception as e:
            print("Exception during Playwright test:")
            traceback.print_exc()
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
