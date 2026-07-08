import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://localhost:8080"
VP = {"width": 375, "height": 667}  # iPhone SE / mobile low-end
UA = "Mozilla/5.0 (Linux; Android 9; SM-G610F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36"

# lang code -> (locale, folder-name, cookie-accept text, gender text, continue text, see-archetype text, unlock text)
LANGS = {
    "ar": {
        "locale": "ar-SA",
        "accept": ["قبول", "موافق"],
        "start":  ["ابدأ", "اكتشف", "اكتشاف"],
        "female": ["أنثى"],
        "continue":["متابعة", "استمر"],
        "email_cta":["شاهد", "عرض", "اعرض"],
        "unlock":["افتح","إفتح"],
        "name":"سارة",
    },
    "pl": {
        "locale":"pl-PL",
        "accept":["Zaakceptuj","Akceptuj"],
        "start":["Rozpocznij","Odkryj","Zacznij"],
        "female":["Kobieta"],
        "continue":["Kontynuuj","Dalej"],
        "email_cta":["Zobacz","Pokaż"],
        "unlock":["Odblokuj"],
        "name":"Anna",
    },
    "ro": {
        "locale":"ro-RO",
        "accept":["Acceptă","Accept"],
        "start":["Începe","Descoperă"],
        "female":["Femeie","Feminin"],
        "continue":["Continuă","Continuare"],
        "email_cta":["Vezi","Arată"],
        "unlock":["Deblochează"],
        "name":"Ana",
    },
}

async def shot(page, out, name):
    await page.screenshot(path=str(out / f"{name}.png"))
    print(f"  {name}.png")

async def stacked(page, out, name, max_steps=10):
    await page.evaluate("window.scrollTo(0,0)")
    await page.wait_for_timeout(500)
    total = await page.evaluate("document.documentElement.scrollHeight")
    vh = VP["height"]
    n = min(max_steps, max(1, -(-total // vh)))
    for i in range(n):
        await page.evaluate(f"window.scrollTo(0,{i*vh})")
        await page.wait_for_timeout(450)
        await page.screenshot(path=str(out / f"{name}-{i+1:02d}.png"))
    await page.evaluate("window.scrollTo(0,0)")

async def click_texts(page, texts):
    for t in texts:
        try:
            loc = page.get_by_role("button", name=t, exact=False)
            if await loc.count() > 0:
                await loc.first.click(timeout=2000)
                return True
        except: pass
    # fallback: any element with text
    for t in texts:
        try:
            loc = page.locator(f'text=/{t}/i')
            if await loc.count() > 0:
                await loc.first.click(timeout=2000)
                return True
        except: pass
    return False

async def run_lang(pw, lang_code):
    L = LANGS[lang_code]
    root = Path(f"/dev-server/.lovable/screenshots/mobile-low/{lang_code}")
    root.mkdir(parents=True, exist_ok=True)
    for f in root.glob("*.png"): f.unlink()

    browser = await pw.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
    ctx = await browser.new_context(
        viewport=VP, locale=L["locale"], user_agent=UA,
        device_scale_factor=2, is_mobile=True, has_touch=True,
    )
    page = await ctx.new_page()

    # Preseed language in localStorage
    await page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
    await page.evaluate(f"localStorage.setItem('mindreset_lang','{lang_code}'); localStorage.setItem('mindreset_cookie_consent','essential');")
    await page.goto(BASE, wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(1500)

    print(f"\n=== {lang_code.upper()} ===")
    # 1. Landing
    await stacked(page, root, "01-landing", max_steps=12)

    # Dismiss cookie banner if present
    await click_texts(page, L["accept"])
    await page.wait_for_timeout(400)

    # 2. Identidade
    await click_texts(page, L["start"])
    await page.wait_for_timeout(1200)
    await shot(page, root, "02-identidade")
    try:
        await page.locator('input[type="text"]:not([type="email"])').first.fill(L["name"])
    except Exception as e: print("name err", e)
    await click_texts(page, L["female"])
    await page.wait_for_timeout(300)
    await shot(page, root, "02b-identidade-preenchida")
    await click_texts(page, L["continue"])
    await page.wait_for_timeout(1200)

    # 3. Quiz 1-8
    for q in range(1, 9):
        await page.wait_for_timeout(600)
        await shot(page, root, f"03-quiz-{q:02d}")
        try:
            buttons = page.locator('main button, section button')
            cnt = await buttons.count()
            clicked = False
            for i in range(cnt):
                b = buttons.nth(i)
                try:
                    txt = (await b.inner_text()).strip()
                    if len(txt) > 15:
                        await b.click(); clicked = True; break
                except: pass
            if not clicked:
                await page.locator('button').nth(2).click()
        except Exception as e: print("q err", e)
        await page.wait_for_timeout(800)

    # 4. Email
    await page.wait_for_timeout(1000)
    await shot(page, root, "04-email")
    try:
        await page.locator('input[type="email"]').fill("teste@mindreset.dev")
        cb = page.locator('input[type="checkbox"]').first
        if await cb.count() > 0: await cb.check(force=True)
    except Exception as e: print("email err", e)
    await page.wait_for_timeout(300)
    await shot(page, root, "04b-email-preenchido")
    if not await click_texts(page, L["email_cta"]):
        try: await page.locator('button:visible').last.click()
        except: pass

    # 5. Loader
    await page.wait_for_timeout(1500)
    await shot(page, root, "05-loader")
    await page.wait_for_timeout(4000)
    await shot(page, root, "05b-loader-mid")
    await page.wait_for_timeout(4000)
    await shot(page, root, "05c-loader-late")

    # 6. Reveal
    for i in range(45):
        await page.wait_for_timeout(2000)
        analyzing = await page.locator('text=/analisan|analyzing|analizuję|analizez|جارٍ التحليل/i').count()
        html = (await page.content()).lower()
        if analyzing == 0 and any(k in html for k in ["acumulador","hedonista","evasiv","status","archetype","arqu","aro","seeker","hoard","المدخر"]):
            print(f"  reveal after {(i+1)*2}s"); break
    await page.wait_for_timeout(2000)
    await stacked(page, root, "06-reveal", max_steps=10)

    # 7. Sales
    await click_texts(page, ["Quero", "Continuar", "Ver oferta", "Chcę", "Vreau", "أريد"])
    await page.wait_for_timeout(2500)
    await stacked(page, root, "07-sales", max_steps=20)

    # Exit intent
    try:
        await page.evaluate("""
          const evt = new MouseEvent('mouseleave', {bubbles:true, cancelable:true, clientY:-5, clientX:100});
          document.documentElement.dispatchEvent(evt);
        """)
        await page.wait_for_timeout(1500)
        await shot(page, root, "07b-exit-intent")
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(400)
    except Exception as e: print("exit err", e)

    # 8. Checkout
    await click_texts(page, ["Ver o meu protocolo", "protocolo", "Chcę", "Vreau", "أريد", "Odblokuj", "Deblochează", "افتح"])
    await page.wait_for_timeout(2500)
    await stacked(page, root, "08-checkout", max_steps=6)

    # 8b Stripe
    await click_texts(page, L["unlock"] + ["DESBLOQUEAR","Unlock"])
    await page.wait_for_timeout(5000)
    await shot(page, root, "08b-stripe-attempt")

    # 9 Thank you
    await page.goto(BASE + "/obrigado?order_id=demo-test-preview", wait_until="networkidle", timeout=20000)
    await page.wait_for_timeout(2000)
    await stacked(page, root, "09-obrigado", max_steps=5)

    # Legals
    for p, n in [("/privacy","10-privacy"), ("/terms","11-terms")]:
        try:
            await page.goto(BASE + p, wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(600)
            await stacked(page, root, n, max_steps=8)
        except Exception as e: print(p, e)

    try:
        await page.goto(BASE + "/nao-existe-xyz", wait_until="networkidle", timeout=10000)
        await page.wait_for_timeout(500)
        await shot(page, root, "12-404")
    except: pass

    await browser.close()

async def main():
    langs = sys.argv[1:] or ["ar","pl","ro"]
    async with async_playwright() as pw:
        for lc in langs:
            try:
                await run_lang(pw, lc)
            except Exception as e:
                print(f"LANG {lc} FAIL: {e}")

asyncio.run(main())
