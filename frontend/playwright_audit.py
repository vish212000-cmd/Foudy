import sys
import time
from playwright.sync_api import sync_playwright

def main():
    print("Starting Playwright verification...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(f"Page Error: {err}"))
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type in ['error'] else None)

        try:
            page.goto("http://localhost:5173/welcome", timeout=15000)
            page.wait_for_load_state("networkidle", timeout=15000)

            print("Current URL:", page.url)
            print("Attempting guest login (Get Started)...")
            guest_btn = page.locator("button", has_text="Get Started")
            if guest_btn.count() > 0:
                guest_btn.first.click()
                page.wait_for_timeout(3000)
                print("Guest login clicked. New URL:", page.url)

            if "setup" in page.url:
                print("At setup page, continuing...")
                continue_btn = page.locator("button", has_text="Continue to Foudy")
                if continue_btn.count() > 0:
                    continue_btn.first.click()
                    page.wait_for_timeout(3000)
                    print("Setup complete. New URL:", page.url)

            print("Checking Sidebar links...")
            links = ["Dashboard", "Random Match", "Rooms", "Messages", "Notifications", "Settings", "Log out"]
            for link in links:
                btn = page.locator(f"text=\"{link}\"")
                if btn.count() > 0:
                    print(f"Clicking {link}...")
                    btn.first.click()
                    page.wait_for_timeout(1000)
                    print(f"  URL after {link}:", page.url)
                else:
                    print(f"Could not find link: {link}")

            print("\nVerification Complete!")
            if errors:
                print("Captured Errors:")
                for e in errors:
                    print(e)
            else:
                print("No console errors detected!")

        except Exception as e:
            print(f"Playwright test failed: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    main()
