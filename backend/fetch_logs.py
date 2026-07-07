import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating...")
        await page.goto("https://github.com/vish212000-cmd/Foudy/actions/runs/28843873650/job/85543682469")
        print("Waiting for log lines...")
        try:
            await page.wait_for_selector(".js-line-content", timeout=15000)
            logs = await page.evaluate("() => Array.from(document.querySelectorAll('.js-line-content')).map(e => e.innerText).join('\\n')")
            with open("job_logs.txt", "w", encoding="utf-8") as f:
                f.write(logs)
            print("Logs saved to job_logs.txt")
        except Exception as e:
            print("Failed to get logs:", str(e))
        await browser.close()

asyncio.run(main())
