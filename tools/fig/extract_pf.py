# Portfolio page → payloads for Figma. Two sets: A = the page as one canvas (cover + each section at its natural height),
# B = the page screen by screen (the cover's two states + the flow cut into 1920 × 1080 slices; section ends close a slice).
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, '/home/claude/fig'); from gfroute import gf
VW, VH = 1920, 1080
OUT = '/home/claude/fig/out19/portfolio'; os.makedirs(OUT + '/canvas', exist_ok=True)
FIGX = open('/home/claude/fig/figx19.js').read()
URL = 'http://localhost:8771/portfolio.html?fx=19'
FORCE = '#hdr{opacity:1!important;transform:none!important} #chap{opacity:1!important;transform:none!important} #cur,#mn,.fmo{display:none!important} .grain{display:none!important}'
SECN = {'top': '01 Cover', 's2': '02 Intro', 's3': '03 Signature CI Residences', 's4': '04 Every Home Unique', 's5': '05 Explore the Work', 's6': '06 CTA', 'footer': '07 Footer'}

async def capture(pg, key, sec, title, kind, ids, origin, clip, fw, fh, first):
    roots = '[' + ','.join(f"document.getElementById('{i}')" for i in ids) + ']'
    data = await pg.evaluate(f"(async()=>{{ return await window.__figx({{roots:{roots}, origin:{json.dumps(origin)}, clip:{json.dumps(clip)}}}); }})()")
    hdr = await pg.evaluate(f"window.__figx({{roots:['#hdr'], origin:[0,0], clip:[0,0,{VW},{VH}]}})") if first else None
    rail = await pg.evaluate(f"window.__figx({{roots:['#chap'], origin:[0,{VH - 120}], clip:[0,{VH - 120},{VW},{VH}]}})") if first else None
    secBg = await pg.evaluate(f"(()=>{{const s=getComputedStyle(document.getElementById('{ids[0]}'));return [s.backgroundColor, s.backgroundImage];}})()")
    for cv in data['canvases']:
        if not cv.get('sel'): continue
        await pg.evaluate(f"(()=>{{const c=document.querySelector('{cv['sel']}');let e=c;while(e){{e.setAttribute('data-keep','');e=e.parentElement;}}}})()")
        await pg.add_style_tag(content=f"body *:not([data-keep]):not({cv['sel']}) {{opacity:0!important}} html, body, [data-keep] {{background:transparent!important}}")
        await pg.wait_for_timeout(500)
        x0, y0 = cv['x'] + origin[0], cv['y'] + origin[1]
        cx0, cy0, cx1, cy1 = max(0, x0), max(0, y0), min(VW, x0 + cv['w']), min(VH, y0 + cv['h'])
        if cx1 - cx0 > 2 and cy1 - cy0 > 2:
            await pg.screenshot(path=f"{OUT}/canvas/{key}_{cv['id']}.png", type='png', omit_background=True, clip={'x': cx0, 'y': cy0, 'width': cx1 - cx0, 'height': cy1 - cy0}, timeout=240000)
            cv['crop'] = [cx0 - origin[0], cy0 - origin[1], cx1 - cx0, cy1 - cy0]
        await pg.evaluate("document.head.lastElementChild.remove(); document.querySelectorAll('[data-keep]').forEach(e=>e.removeAttribute('data-keep'))")
    payload = {'key': key, 'sec': sec, 'title': title, 'kind': kind, 'w': fw, 'h': fh, 'bg': secBg, 'data': data, 'hdr': hdr, 'rail': rail}
    json.dump(payload, open(f'{OUT}/{key}.json', 'w'))
    await pg.screenshot(path=f'{OUT}/{key}_ref.jpg', type='jpeg', quality=60, timeout=240000, clip={'x': 0, 'y': max(0, origin[1]), 'width': VW, 'height': min(VH, fh)})
    print(key, '|', title, '| items', len(data['items']), 'svgs', len(data['svgs']), 'canv', len(data['canvases']), 'warn', (data.get('warn') or [])[:3], flush=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': VW, 'height': VH}); logs = []
        pg.on('pageerror', lambda e: logs.append('ERR ' + str(e)[:200]))
        await gf(pg)
        await pg.goto(URL, wait_until='load'); await pg.wait_for_timeout(2500)
        await pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
        await pg.add_script_tag(content=FIGX); await pg.add_style_tag(content=FORCE)
        await pg.evaluate("document.querySelectorAll('canvas').forEach((c,i)=>{ if(!c.id) c.id='figcv'+i; })")
        H = await pg.evaluate("document.documentElement.scrollHeight")
        for y in range(0, H, 400):
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(800)
        bad = await pg.evaluate("[...document.querySelectorAll('img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src'))")
        print('images not loaded:', bad)
        T = {}
        for i in SECN:
            T[i] = await pg.evaluate(f"(()=>{{const r=document.getElementById('{i}').getBoundingClientRect();return [Math.round(r.top+scrollY), Math.round(r.height)];}})()")
        H = await pg.evaluate("document.documentElement.scrollHeight"); print('H', H, T, flush=True)
        MA = []; MB = []
        async def go(y, wait=1500):
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(wait)
        # ---------- A: the canvas
        await go(0, 2500)
        await capture(pg, 'pa00', SECN['top'], '01 Cover', 'pin', ['top'], [0, 0], [0, 0, VW, VH], VW, VH, True); MA.append('pa00')
        for n, i in enumerate(['s2', 's3', 's4', 's5', 's6', 'footer']):
            top, h = T[i]; await go(top)
            r = await pg.evaluate(f"(()=>{{const r=document.getElementById('{i}').getBoundingClientRect();return [r.top,r.height];}})()")
            key = f'pa{n + 1:02d}'
            await capture(pg, key, SECN[i], SECN[i], 'static', [i], [0, r[0]], [0, r[0], VW, r[0] + r[1]], VW, round(r[1]), False); MA.append(key)
        # ---------- B: screen by screen
        await go(0, 2500)
        await capture(pg, 'pb00', SECN['top'], '01 Cover · 1', 'pin', ['top'], [0, 0], [0, 0, VW, VH], VW, VH, False); MB.append('pb00')
        await go(T['top'][1] - VH, 2500)
        await capture(pg, 'pb01', SECN['top'], '01 Cover · 2', 'pin', ['top'], [0, 0], [0, 0, VW, VH], VW, VH, False); MB.append('pb01')
        a, bnd = T['s2'][0], T['s4'][0]            # intro + residences: slices closed at the section's end
        n = max(1, round((bnd - a) / VH)); sl = [(bnd - VH * (n - k), bnd - VH * (n - k - 1)) for k in range(n)]
        a2, b2 = T['s4'][0], T['s6'][0]            # the process + the library: slices from the top, the last one shorter
        y = a2
        while y < b2 - 1: sl.append((y, min(y + VH, b2))); y += VH
        sl.append((T['s6'][0], T['s6'][0] + T['s6'][1])); sl.append((T['footer'][0], H))
        ids_all = ['s2', 's3', 's4', 's5', 's6', 'footer']
        for k, (y0, y1) in enumerate(sl):
            ids = [i for i in ids_all if T[i][0] < y1 - 1 and T[i][0] + T[i][1] > y0 + 1]
            await go(min(y0, H - VH))
            off = await pg.evaluate("scrollY"); oy = y0 - off
            key = f'pb{k + 2:02d}'; title = f'{k + 3:02d} ' + ' + '.join(SECN[i][3:] for i in ids)
            await capture(pg, key, title, title, 'static', ids, [0, oy], [0, oy, VW, oy + (y1 - y0)], VW, round(y1 - y0), False); MB.append(key)
        json.dump({'A': MA, 'B': MB, 'tops': T, 'H': H, 'slices': sl}, open(f'{OUT}/manifest.json', 'w'))
        print('\n'.join(logs[:10]) or 'no errors')
        await b.close()
asyncio.run(main())
