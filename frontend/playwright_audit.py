import sys
import time
from playwright.sync_api import sync_playwright

def main():
    print("Starting Playwright verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("requestfailed", lambda request: print(f"REQUEST FAILED: {request.url} - {request.failure}"))
        page.on("response", lambda response: print(f"RESPONSE: {response.url} - {response.status}"))

        try:
            page.goto("http://localhost:5173/welcome", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)
            
            print("Current URL:", page.url)
            guest_btn = page.locator("button", has_text="Get Started")
            if guest_btn.count() > 0:
                guest_btn.first.click()
                page.wait_for_timeout(3000)
                print("Guest login clicked. New URL:", page.url)

        except Exception as e:
            print(f"Playwright test failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
