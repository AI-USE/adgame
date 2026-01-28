
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Check Home Page
        await page.goto("http://localhost:3000")
        await page.wait_for_selector("h1")
        await page.screenshot(path="/home/jules/verification/game_home.png", full_page=True)
        print("Captured game_home.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
