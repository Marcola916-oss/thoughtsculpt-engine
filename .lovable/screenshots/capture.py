import asyncio, os, sys
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("/dev-server/.lovable/screenshots")
OUT.mkdir(parents=True, exist_ok=True)
BASE = "http://localhost:8080"
VP = {"width": 1440, "height": 1800}

async def scroll_shots(page, name, steps=None):
    """Take stacked viewport-sized screenshots covering full page height."""
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(600)
    total = await page.evaluate("document.documentElement.scrollHeight")
    vh = VP["height"]
    n = max(1, -(-total // vh))  # ceil
    if steps: n = min(n, steps)
    for i in range(n):
        y = i * vh
        await page.evaluate(f"window.scrollTo(0, {y})")
        await page.wait_for_timeout(500)
        p = OUT / f"{name}-{i+1:02d}.png"
        await page.screenshot(path=str(p))
        print("  saved", p.name, "y=", y, "/", total)
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)

async def shot(page, name):
    p = OUT / f"{name}.png"
    await page.screenshot(path=str(p))
    print("saved", p.name)

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport=VP, locale="pt-PT")
        page = await ctx.new_page()
        page.on("console", lambda m: None)

        # 1. LANDING
        print("[1] Landing")
        await page.goto(BASE, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)
        await scroll_shots(page, "01-landing")

        # 2. IDENTIDADE
        print("[2] Identidade")
        # Click Hero Start button
        try:
            await page.get_by_role("button").filter(has_text="").first.click(timeout=3000)
        except Exception:
            pass
        # Better: find the hero CTA — look for large primary button
        # Try to find any button that triggers stage change; the Hero has handleStart
        # Attempt via text patterns
        for pat in ["Começar", "Iniciar", "Descobrir", "Start", "Descobre", "Continuar"]:
            try:
                loc = page.get_by_role("button", name=pat, exact=False)
                if await loc.count() > 0:
                    await loc.first.click()
                    break
            except Exception:
                continue
        await page.wait_for_timeout(1200)
        await shot(page, "02-identidade")

        # Fill name + gender
        try:
            await page.locator('input[type="text"], input:not([type])').first.fill("Ana Teste")
            await page.wait_for_timeout(300)
            # click a gender button (first of three)
            btns = page.locator('button:has-text("F"), button:has-text("M"), button[aria-label]')
            # simpler: click buttons in the identity card
            gender_btns = await page.locator('button').all()
            # Just click Continue after filling: identity has 3 gender buttons before Continue
        except Exception as e:
            print("name fill err", e)

        # Try clicking gender buttons by common labels
        for pat in ["Feminino", "Masculino", "Female", "Male", "Kobieta", "Mężczyzna", "Femeie"]:
            try:
                loc = page.get_by_role("button", name=pat, exact=False)
                if await loc.count() > 0:
                    await loc.first.click()
                    break
            except: pass
        await page.wait_for_timeout(400)
        await shot(page, "02b-identidade-filled")

        # Continue to quiz
        for pat in ["Continuar", "Continue", "Kontynuuj", "Continuă", "متابعة", "Avançar"]:
            try:
                loc = page.get_by_role("button", name=pat, exact=False)
                if await loc.count() > 0:
                    await loc.first.click()
                    break
            except: pass
        await page.wait_for_timeout(1000)

        # 3. QUIZ 1-8
        for q in range(1, 9):
            print(f"[3.{q}] Quiz {q}")
            await page.wait_for_timeout(600)
            await shot(page, f"03-quiz-{q:02d}")
            # click first option
            try:
                opts = page.locator('[role="button"], button').filter(has_text="")
                # QuizOption is a button; click first option button
                option_buttons = await page.locator('button[data-cursor], button').all()
                # Click a heuristic: first big option
                await page.locator('button').nth(2).click(timeout=2000)
            except Exception as e:
                print("quiz click err", e)
                # Try any button in the quiz card
                try:
                    await page.get_by_role("button").nth(1).click()
                except: pass
            await page.wait_for_timeout(800)

        # 4. EMAIL
        print("[4] Email")
        await page.wait_for_timeout(1000)
        await shot(page, "04-email")
        try:
            await page.locator('input[type="email"]').fill("teste@mindreset.dev")
            await page.wait_for_timeout(300)
            await shot(page, "04b-email-filled")
        except Exception as e:
            print("email fill err", e)
        for pat in ["Continuar", "Continue", "Kontynuuj", "Continuă", "متابعة", "Descobrir", "Revelar"]:
            try:
                loc = page.get_by_role("button", name=pat, exact=False)
                if await loc.count() > 0:
                    await loc.first.click()
                    break
            except: pass

        # 5. LOADER
        print("[5] Loader")
        await page.wait_for_timeout(1500)
        await shot(page, "05-loader")
        await page.wait_for_timeout(3000)
        await shot(page, "05b-loader-mid")

        # 6. REVEAL (wait up to 60s)
        print("[6] Reveal — waiting")
        for _ in range(30):
            await page.wait_for_timeout(2000)
            txt = await page.content()
            if "reveal" in txt.lower() or "arquétipo" in txt.lower() or "arché" in txt.lower():
                # heuristic — take shot and break when loader gone
                loader = await page.locator('text=/analis/i').count()
                if loader == 0:
                    break
        await page.wait_for_timeout(2000)
        await scroll_shots(page, "06-reveal")

        # Continue to VSL / Sales
        for pat in ["Continuar", "Continue", "Ver oferta", "Descobrir", "Revelar", "Ver plano", "Kontynuuj"]:
            try:
                loc = page.get_by_role("button", name=pat, exact=False)
                if await loc.count() > 0:
                    await loc.first.click()
                    break
            except: pass
        await page.wait_for_timeout(2000)

        # 7. SALES / VSL
        print("[7] Sales")
        await scroll_shots(page, "07-sales")

        # Exit intent — move mouse to top to trigger
        try:
            await page.mouse.move(700, 800)
            await page.wait_for_timeout(400)
            await page.mouse.move(700, 5)
            await page.wait_for_timeout(1500)
            await shot(page, "07b-exit-intent")
        except: pass
        # Close any modal
        try:
            await page.keyboard.press("Escape")
        except: pass

        # 8. CHECKOUT — try to click a CTA
        for pat in ["Comprar", "Checkout", "Continuar", "Adquirir", "Get", "Reservar", "Buy"]:
            try:
                loc = page.get_by_role("button", name=pat, exact=False)
                if await loc.count() > 0:
                    await loc.first.click()
                    break
            except: pass
        await page.wait_for_timeout(2000)
        await scroll_shots(page, "08-checkout")

        # 9. THANK YOU
        print("[9] Thank you")
        await page.goto(BASE + "/obrigado?order_id=test-preview", wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(1500)
        await scroll_shots(page, "09-obrigado")

        # 10. Extras: privacy, terms
        for path, name in [("/privacy", "10-privacy"), ("/terms", "11-terms")]:
            try:
                await page.goto(BASE + path, wait_until="networkidle", timeout=15000)
                await page.wait_for_timeout(800)
                await scroll_shots(page, name)
            except Exception as e:
                print(path, e)

        await browser.close()
        print("DONE")

asyncio.run(main())
