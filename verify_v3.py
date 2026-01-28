import asyncio
from playwright.async_api import async_playwright
import time
import os

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # 1. Test "Check Rank"
        await page.goto("http://localhost:3000")
        await page.fill("#nickname-input", "NonExistent")
        await page.click("#check-rank-btn")
        await asyncio.sleep(1)
        result = await page.text_content("#rank-check-result")
        print(f"Rank check (empty): {result}")

        # 2. Test Admin Dummy Nickname
        await page.goto("http://localhost:3000/admin.html")
        await page.fill("#admin-password", "admin")
        await page.click("#login-btn")

        await page.fill("#dummy-nickname", "SuperPlayer")
        await page.fill("#dummy-score", "50")
        await page.click("#add-dummy-btn")
        await asyncio.sleep(1)

        # Check if nickname appears in table
        rows = await page.text_content("#ranking-table")
        if "SuperPlayer" in rows:
            print("Admin Dummy Nickname: SUCCESS")
        else:
            print("Admin Dummy Nickname: FAILED")

        # 3. Test "Check Rank" again with existing player
        await page.goto("http://localhost:3000")
        await page.fill("#nickname-input", "SuperPlayer")
        await page.click("#check-rank-btn")
        await asyncio.sleep(1)
        result = await page.text_content("#rank-check-result")
        print(f"Rank check (existing): {result}")

        # 4. Check Daily Limit logic (manual code check usually, but let's see if button exists)
        check_btn = await page.query_selector("#check-rank-btn")
        if check_btn:
            print("Check Rank Button exists")

        await browser.close()

if __name__ == "__main__":
    os.system("kill $(lsof -t -i :3000) 2>/dev/null || true")
    os.system("npm start > server_verify_v3.log 2>&1 &")
    time.sleep(3)
    asyncio.run(verify())
    os.system("kill $(lsof -t -i :3000)")
