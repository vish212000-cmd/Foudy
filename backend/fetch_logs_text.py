import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        print("Navigating...")
        await page.goto("https://github.com/vish212000-cmd/Foudy/actions/runs/28843873650/job/85543682469", wait_until="networkidle")
        await page.wait_for_timeout(5000) # Wait extra time for logs to load
        text = await page.evaluate("document.body.innerText")
        with open("page_text.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Text saved to page_text.txt")
        await browser.close()

asyncio.run(main())
