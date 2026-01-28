import asyncio
from playwright.async_api import async_playwright
import time
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Start Game
        await page.goto("http://localhost:3000")
        await page.fill("#nickname-input", "Tester1")
        await page.click("#start-btn")

        # Check if game started
        await asyncio.sleep(1)
        choices = await page.query_selector_all(".choice-btn")
        print(f"Initial choices: {len(choices)}")

        # 2. Check terms link
        terms_link = await page.query_selector("a[href='terms.html']")
        if terms_link:
            print("Terms link found")

        # 3. Test Ranking Tie-break
        # Login to admin
        await page.goto("http://localhost:3000/admin.html")
        await page.fill("#admin-password", "admin")
        await page.click("#login-btn")

        # Add two dummy players with same score
        # Player A achieved score 10 now
        await page.fill("#dummy-score", "10")
        await page.click("#add-dummy-btn")
        await asyncio.sleep(0.5)
        # Player B achieves score 10 later (not possible to wait long, but they are added sequentially)
        await page.fill("#dummy-score", "10")
        await page.click("#add-dummy-btn")
        await asyncio.sleep(1)

        await page.screenshot(path="admin_ranking.png")
        print("Captured admin ranking screenshot")

        # 4. Check email list visibility
        await page.click("#refresh-emails-btn")
        await asyncio.sleep(0.5)
        await page.screenshot(path="admin_emails.png")
        print("Captured admin emails screenshot")

        # 5. Check game fluctuation (via API logic)
        # We can't easily play through many rounds to see bonus trigger without hacking the session
        # But we can verify the Bonus indicator exists in HTML
        await page.goto("http://localhost:3000")
        bonus = await page.query_selector("#bonus-indicator")
        if bonus:
            print("Bonus indicator exists in DOM")

        await browser.close()

if __name__ == "__main__":
    # Start server in background
    os.system("kill $(lsof -t -i :3000) 2>/dev/null || true")
    os.system("npm start > server_verify.log 2>&1 &")
    time.sleep(3)
    asyncio.run(verify())
    os.system("kill $(lsof -t -i :3000)")
