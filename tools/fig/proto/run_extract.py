import asyncio, json, sys
from playwright.async_api import async_playwright
SRC = sys.argv[1]; OUT = sys.argv[2]; TR = sys.argv[3] if len(sys.argv) > 3 else None
PAGES = ["home","about","wellness","services","turnkey","core","curated","portfolio","project","brokers","partnerships","news","article","contact"]
async def main():
    js = open('/home/claude/fig/proto/extract.js').read()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.goto('file://' + SRC, wait_until='load')
        await pg.wait_for_timeout(800)
        await pg.add_script_tag(content=js)
        if TR:
            await pg.add_script_tag(content=open(TR).read())
        res = {}
        for k in PAGES:
            await pg.evaluate("k => { location.hash = '#' + k; }", k)
            await pg.wait_for_timeout(250)
            await pg.evaluate("() => { document.querySelectorAll('.page.active details').forEach((d,i) => { d.open = (i === 0); }); window.scrollTo(0,0); if (window.__TR) window.__TR(document.querySelector('.page.active')); }")
            await pg.wait_for_timeout(150)
            res[k] = await pg.evaluate("() => window.__X('.page.active > section')")
        # header (solid + transparent states), footer, menu
        await pg.evaluate("() => { location.hash = '#home'; }"); await pg.wait_for_timeout(200)
        if TR: await pg.evaluate("() => { window.__TR(document.getElementById('top')); window.__TR(document.querySelector('footer')); window.__TR(document.getElementById('menu')); }")
        res['_header'] = await pg.evaluate("() => window.__X('#top')")
        res['_footer'] = await pg.evaluate("() => window.__X('footer')")
        await pg.evaluate("() => { document.getElementById('menu').classList.add('open'); }"); await pg.wait_for_timeout(200)
        res['_menu'] = await pg.evaluate("() => window.__X('#menu')")
        await pg.evaluate("() => { document.getElementById('svcList').hidden = false; document.getElementById('svcToggle').classList.add('open'); }"); await pg.wait_for_timeout(100)
        res['_menu_svc'] = await pg.evaluate("() => window.__X('#menu')")
        await b.close()
    json.dump(res, open(OUT,'w'), ensure_ascii=False)
asyncio.run(main())
