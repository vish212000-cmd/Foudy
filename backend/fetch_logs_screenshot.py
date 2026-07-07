import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating...")
        await page.goto("https://github.com/vish212000-cmd/Foudy/actions/runs/28843873650/job/85543682469", wait_until="networkidle")
        await page.screenshot(path="../artifacts/github_job.png")
        print("Screenshot saved.")
        await browser.close()

asyncio.run(main())
