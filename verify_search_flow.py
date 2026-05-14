import asyncio
from playwright.async_api import async_playwright
import json

async def run_verification():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        # Home Page
        print("Navigating to home page...")
        await page.goto('http://localhost:3000', wait_until='networkidle')
        try:
            await page.wait_for_selector('h1:has-text("VersaTemple")', timeout=10000)
        except Exception as e:
            print(f"Selector failed, content was: {await page.content()[:1000]}")
            raise e
        await page.screenshot(path='1_home.png')
        print("Home page verified.")

        # Search Wizard - Step 1
        print("Starting search...")
        await page.click('text="Cerca casa"')
        await page.wait_for_selector('text="Informazioni di base"')
        await page.screenshot(path='2_search_step1.png')

        # Fill Step 1
        await page.fill('label:has-text("Quante persone fanno parte del nucleo familiare?") + input', '3')
        await page.fill('label:has-text("Quante persone lavorano?") + input', '2')
        await page.fill('label:has-text("Quante camere da letto stai cercando?") + input', '2')

        await page.click('button:has-text("Avanti")')

        # Step 2: Workplaces
        await page.wait_for_selector('text="Posti di lavoro"')
        # Fill Eircodes
        inputs = await page.query_selector_all('input[placeholder*="Es:"]')
        await inputs[0].fill('D02 XW14') # Silicon Docks
        await inputs[1].fill('D18 X631') # Sandyford

        await page.screenshot(path='3_search_step2.png')
        await page.click('button:has-text("Avanti")')

        # Step 3: Priorities
        await page.wait_for_selector('text="Priorità e Servizi"')
        # Select some priorities (clicking 1 for high priority)
        # We need to find the 1 buttons for schools and hospitals
        priority_rows = await page.query_selector_all('div.flex.items-center.justify-between.p-4')

        # Row 0: schools
        buttons_schools = await priority_rows[0].query_selector_all('button')
        await buttons_schools[0].click() # Priority 1

        # Row 1: hospitals
        buttons_hospitals = await priority_rows[1].query_selector_all('button')
        await buttons_hospitals[0].click() # Priority 1

        await page.screenshot(path='4_search_step3.png')
        await page.click('button:has-text("Trova la mia casa")')

        # Results Page
        print("Waiting for results...")
        # Increased timeout for scraping
        await page.wait_for_selector('h1:has-text("I tuoi abbinamenti")', timeout=60000)
        print("Results page loaded!")

        # Wait a bit for images/map
        await asyncio.sleep(5)
        await page.screenshot(path='5_results.png')

        # Scroll to see more
        await page.mouse.wheel(0, 500)
        await asyncio.sleep(1)
        await page.screenshot(path='6_results_scrolled.png')

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run_verification())
