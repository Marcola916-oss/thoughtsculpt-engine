import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("/dev-server/.lovable/screenshots")
OUT.mkdir(parents=True, exist_ok=True)
# Wipe stale
for f in OUT.glob("*.png"): f.unlink()

BASE = "http://localhost:8080"
VP = {"width": 1440, "height": 1800}

async def stacked(page, name, max_steps=8):
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
    await page.evaluate("window.scrollTo(0,0)")
    await page.wait_for_timeout(300)

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
        except Exception:
            continue
    return False

async def dismiss_cookies(page):
    for t in ["Aceitar tudo", "Accept all", "Zaakceptuj", "Acceptă", "قبول"]:
        try:
            loc = page.get_by_role("button", name=t, exact=False)
            if await loc.count() > 0:
                await loc.first.click(timeout=1500)
                await page.wait_for_timeout(400)
                return
        except: pass

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport=VP, locale="pt-PT")
        page = await ctx.new_page()

        # 1. LANDING
        print("[1] Landing"); 
        await page.goto(BASE, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(1500)
        await stacked(page, "01-landing", max_steps=8)
        await dismiss_cookies(page)
        await page.wait_for_timeout(400)

        # 2. IDENTIDADE — click Hero CTA
        print("[2] Identidade")
        await click_text(page, ["Começar", "Descobrir", "Iniciar", "Start"])
        await page.wait_for_timeout(1200)
        await shot(page, "02-identidade")
        # Fill name
        try:
            await page.locator('input[type="text"], input:not([type="email"]):not([type="checkbox"])').first.fill("Ana Teste")
        except Exception as e: print("name err", e)
        # Click a gender button — identity has 3 buttons in a row
        await click_text(page, ["Feminino", "Female", "Kobieta", "Femeie", "أنثى"])
        await page.wait_for_timeout(400)
        await shot(page, "02b-identidade-preenchida")
        # Continue
        await click_text(page, ["Continuar", "Continue", "Kontynuuj", "Continuă", "متابعة"])
        await page.wait_for_timeout(1200)

        # 3. QUIZ 1-8
        for q in range(1, 9):
            print(f"[3.{q}] Quiz {q}")
            await page.wait_for_timeout(700)
            await shot(page, f"03-quiz-{q:02d}")
            # click first quiz option (they use <button> with A/B/C/D letters)
            try:
                # try clicking option A container
                clicked = False
                for sel in ['button:has-text("Guardo")', 'button:has-text("A")']:
                    pass
                # heuristic: click 3rd button on page (back=1, +A/B/C/D). Use index 2
                buttons = page.locator('main button, section button')
                cnt = await buttons.count()
                for i in range(cnt):
                    b = buttons.nth(i)
                    txt = (await b.inner_text()).strip()
                    if len(txt) > 15:  # option text is long
                        await b.click()
                        clicked = True
                        break
                if not clicked:
                    await page.locator('button').nth(2).click()
            except Exception as e:
                print("  quiz click err", e)
            await page.wait_for_timeout(900)

        # 4. EMAIL
        print("[4] Email")
        await page.wait_for_timeout(1200)
        await shot(page, "04-email")
        try:
            await page.locator('input[type="email"]').fill("teste@mindreset.dev")
        except Exception as e: print("email fill err", e)
        # Check the privacy checkbox
        try:
            cb = page.locator('input[type="checkbox"]').first
            if await cb.count() > 0:
                await cb.check(force=True)
        except Exception as e: print("cb err", e)
        await page.wait_for_timeout(400)
        await shot(page, "04b-email-preenchido")
        # Click "Ver o meu arquétipo agora"
        clicked = await click_text(page, ["Ver o meu arquétipo", "Ver arquétipo", "See my", "Zobacz", "Vezi", "شاهد"])
        if not clicked:
            # Fallback: click the last visible button
            try: await page.locator('button:visible').last.click()
            except: pass
        
        # 5. LOADER
        print("[5] Loader"); await page.wait_for_timeout(1500)
        await shot(page, "05-loader")
        await page.wait_for_timeout(4000)
        await shot(page, "05b-loader-mid")
        await page.wait_for_timeout(4000)
        await shot(page, "05c-loader-late")

        # 6. REVEAL — wait up to 90s
        print("[6] Reveal — waiting for backend")
        for i in range(45):
            await page.wait_for_timeout(2000)
            html = await page.content()
            low = html.lower()
            # detect reveal by presence of archetype code words or absence of loader percentage
            if any(k in low for k in ["acumulador", "status seeker", "evasivo", "hedonista", "archetype", "arquétipo", "aro"]):
                # check no analyzing indicator
                analyzing = await page.locator('text=/analisan|analyzing|analizuję|analizez|جارٍ التحليل/i').count()
                if analyzing == 0:
                    print(f"  reveal detected after {(i+1)*2}s")
                    break
        await page.wait_for_timeout(2000)
        await stacked(page, "06-reveal", max_steps=6)

        # Continue to VSL/Sales
        await click_text(page, ["Continuar", "Ver oferta", "Ver plano", "Continue", "Descobrir"])
        await page.wait_for_timeout(2000)

        # 7. SALES / VSL
        print("[7] Sales")
        await stacked(page, "07-sales", max_steps=15)

        # Exit intent — jerk cursor to top
        try:
            await page.mouse.move(700, 900)
            await page.wait_for_timeout(400)
            await page.mouse.move(700, 5, steps=5)
            await page.wait_for_timeout(2000)
            await shot(page, "07b-exit-intent")
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(400)
        except Exception as e: print("exit err", e)

        # 8. CHECKOUT
        print("[8] Checkout")
        await click_text(page, ["Adquirir", "Comprar", "Ver oferta", "Continuar", "Reservar", "Buy"])
        await page.wait_for_timeout(2500)
        await stacked(page, "08-checkout", max_steps=4)

        # 9. THANK YOU
        print("[9] Obrigado")
        await page.goto(BASE + "/obrigado?order_id=test-preview&session_id=cs_test", wait_until="networkidle", timeout=20000)
        await page.wait_for_timeout(2000)
        await stacked(page, "09-obrigado", max_steps=4)

        # 10 Extras
        for path, name in [("/privacy", "10-privacy"), ("/terms", "11-terms")]:
            try:
                await page.goto(BASE + path, wait_until="networkidle", timeout=15000)
                await page.wait_for_timeout(700)
                await stacked(page, name, max_steps=6)
            except Exception as e: print(path, e)

        # 11 404
        try:
            await page.goto(BASE + "/nao-existe-xyz", wait_until="networkidle", timeout=10000)
            await page.wait_for_timeout(600)
            await shot(page, "12-404")
        except Exception as e: print("404", e)

        await browser.close()
        print("DONE")

asyncio.run(main())
