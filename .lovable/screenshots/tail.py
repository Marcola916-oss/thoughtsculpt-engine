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
        await page.wait_for_timeout(600)
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
                return True
        except: pass
    return False

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport=VP, locale="pt-PT")
        page = await ctx.new_page()

        # Fast path through funnel
        await page.goto(BASE, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)
        await click_text(page, ["Aceitar tudo"]); await page.wait_for_timeout(300)
        await click_text(page, ["Descobrir","Começar"]); await page.wait_for_timeout(1000)
        await page.locator('input[type="text"]').first.fill("Ana Teste")
        await click_text(page, ["Feminino"]); await page.wait_for_timeout(300)
        await click_text(page, ["Continuar"]); await page.wait_for_timeout(1000)
        for q in range(8):
            await page.wait_for_timeout(700)
            try: await page.locator('button').nth(2).click(timeout=3000)
            except: pass
            await page.wait_for_timeout(700)
        await page.wait_for_timeout(1000)
        await page.locator('input[type="email"]').fill("teste@mindreset.dev")
        await page.locator('input[type="checkbox"]').first.check(force=True)
        await click_text(page, ["Ver o meu arquétipo"])
        await page.wait_for_timeout(6000)
        for _ in range(45):
            await page.wait_for_timeout(2000)
            if await page.locator('text=/ACUMULADOR|STATUS|EVASIVO|HEDONISTA/').count() > 0: break
        await page.wait_for_timeout(2000)
        await click_text(page, ["Quero acessar meu protocolo"])
        await page.wait_for_timeout(2500)
        # Now on Sales/VSL

        # Exit-intent via real mouseleave event on documentElement
        print("[7b] Exit-intent — dispatching event")
        await page.evaluate("""
          const evt = new MouseEvent('mouseleave', {bubbles:true, cancelable:true, clientY:-5, clientX:400});
          document.documentElement.dispatchEvent(evt);
        """)
        await page.wait_for_timeout(1500)
        await shot(page, "07b-exit-intent")
        # Close modal
        try:
            await page.keyboard.press("Escape")
        except: pass
        await page.wait_for_timeout(500)

        # Click sales CTA → checkout stub
        await click_text(page, ["Ver o meu protocolo agora"])
        await page.wait_for_timeout(2500)

        # 8 — Checkout stub (offer monolith)
        for f in OUT.glob("08-checkout-*.png"): f.unlink()
        await stacked(page, "08-checkout", max_steps=6)

        # 8b — Click "Desbloquear" and screenshot whatever happens (Stripe error or redirect)
        print("[8b] Attempting Stripe redirect")
        try:
            await click_text(page, ["Desbloquear protocolo", "Desbloquear", "Unlock", "Odblokuj"])
            await page.wait_for_timeout(4000)
            await shot(page, "08b-stripe-attempt")
        except Exception as e:
            print("  stripe err", e)
            await shot(page, "08b-stripe-attempt")

        # 9 — Thank you
        print("[9] Obrigado")
        await page.goto(BASE + "/obrigado?order_id=demo-test-preview", wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(2500)
        for f in OUT.glob("09-obrigado-*.png"): f.unlink()
        await stacked(page, "09-obrigado", max_steps=6)

        await browser.close()
        print("DONE")

asyncio.run(main())
