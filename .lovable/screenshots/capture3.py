# Just re-run the tail: from reveal onward
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("/dev-server/.lovable/screenshots")
BASE = "http://localhost:8080"
VP = {"width": 1440, "height": 1800}

async def stacked(page, name, max_steps=15):
    await page.evaluate("window.scrollTo(0,0)")
    await page.wait_for_timeout(700)
    total = await page.evaluate("document.documentElement.scrollHeight")
    vh = VP["height"]
    n = min(max_steps, max(1, -(-total // vh)))
    for i in range(n):
        await page.evaluate(f"window.scrollTo(0,{i*vh})")
        await page.wait_for_timeout(700)
        await page.screenshot(path=str(OUT / f"{name}-{i+1:02d}.png"))
        print(f"  {name}-{i+1:02d}.png (y={i*vh}/{total})")

async def shot(page, name):
    await page.screenshot(path=str(OUT / f"{name}.png"))
    print(f"  {name}.png")

async def click_text(page, texts, timeout=2500):
    for t in texts:
        try:
            loc = page.get_by_role("button", name=t, exact=False)
            if await loc.count() > 0:
                await loc.first.click(timeout=timeout)
                print(f"  clicked '{t}'")
                return True
        except: pass
    print(f"  ⚠ no button matched {texts[:2]}")
    return False

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport=VP, locale="pt-PT")
        page = await ctx.new_page()

        # Fast-track through the funnel again
        await page.goto(BASE, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)
        # cookies
        await click_text(page, ["Aceitar tudo", "Accept"])
        await page.wait_for_timeout(400)
        # Hero CTA
        await click_text(page, ["Começar", "Descobrir", "Iniciar"])
        await page.wait_for_timeout(1000)
        # Identity
        await page.locator('input[type="text"], input:not([type="email"]):not([type="checkbox"])').first.fill("Ana Teste")
        await click_text(page, ["Feminino"])
        await page.wait_for_timeout(300)
        await click_text(page, ["Continuar"])
        await page.wait_for_timeout(1000)
        # Quiz 8x — same heuristic as v2 (nth(2))
        for q in range(8):
            await page.wait_for_timeout(800)
            try:
                await page.locator('button').nth(2).click(timeout=3000)
            except Exception as e:
                print(f"  q{q+1} click err", e)
            await page.wait_for_timeout(800)
        # Email
        await page.wait_for_timeout(1000)
        await page.locator('input[type="email"]').fill("teste@mindreset.dev")
        await page.locator('input[type="checkbox"]').first.check(force=True)
        await page.wait_for_timeout(300)
        await click_text(page, ["Ver o meu arquétipo"])
        # Wait loader → reveal
        await page.wait_for_timeout(6000)
        # Wait for archetype text
        for _ in range(45):
            await page.wait_for_timeout(2000)
            if await page.locator('text=/ACUMULADOR|STATUS|EVASIVO|HEDONISTA/').count() > 0:
                print("  reveal loaded")
                break
        await page.wait_for_timeout(2000)

        # 6. REVEAL — capture full page
        print("[6] Reveal — full capture")
        # Delete previous reveal shots
        for f in OUT.glob("06-reveal-*.png"): f.unlink()
        await stacked(page, "06-reveal", max_steps=10)

        # Click "Quero acessar meu protocolo" → sales/vsl
        clicked = await click_text(page, ["Quero acessar meu protocolo", "acessar meu protocolo", "Quero acessar", "protocolo"])
        if not clicked:
            # Try clicking a sticky/last visible primary button
            try:
                await page.locator('button:has-text("PROTOCOLO"), button:has-text("Protocolo")').first.click()
                print("  clicked PROTOCOLO fallback")
            except: pass
        await page.wait_for_timeout(2500)

        # 7. SALES / VSL — long page
        print("[7] Sales/VSL — full capture")
        for f in OUT.glob("07-sales-*.png"): f.unlink()
        await stacked(page, "07-sales", max_steps=20)

        # Trigger exit-intent while on sales
        await page.evaluate("window.scrollTo(0, 1200)")
        await page.wait_for_timeout(600)
        try:
            await page.mouse.move(700, 900)
            await page.wait_for_timeout(400)
            await page.mouse.move(700, 2, steps=8)
            await page.wait_for_timeout(2000)
            await shot(page, "07b-exit-intent")
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(400)
        except Exception as e: print("exit err", e)

        # Click main sales CTA — "Ver o meu protocolo agora" or bottom sticky
        clicked = await click_text(page, ["Ver o meu protocolo agora", "Ver o meu protocolo", "Quero o meu protocolo", "Get instant", "Adquirir"])
        if not clicked:
            # sticky bottom bar has a button too
            try:
                # click any visible primary red button
                await page.locator('button:has-text("PROTOCOLO"), button[data-cursor], a[data-cursor]').first.click()
            except: pass
        await page.wait_for_timeout(2500)

        # 8. CHECKOUT
        print("[8] Checkout")
        for f in OUT.glob("08-checkout-*.png"): f.unlink()
        await stacked(page, "08-checkout", max_steps=6)

        await browser.close()
        print("DONE tail")

asyncio.run(main())
