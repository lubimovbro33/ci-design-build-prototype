import asyncio, json, os, sys
from playwright.async_api import async_playwright

OUT = '/home/claude/fig/out'; os.makedirs(OUT + '/canvas', exist_ok=True)
FIGX = open('/home/claude/fig/figx.js').read()

# key, section, title, kind, element id, progress
FRAMES = [
 ('f01a', '01 Hero + Story', '01.1 Hero', 'pin', 'hpin', 0.0),
 ('f01b', '01 Hero + Story', '01.2 Facade', 'pin', 'hpin', 0.16),
 ('f01c', '01 Hero + Story', '01.3 Three phrases', 'pin', 'hpin', 0.56),
 ('f01d', '01 Hero + Story', '01.4 This is turnkey', 'pin', 'hpin', 0.72),
 ('f01e', '01 Hero + Story', '01.5 Under one roof', 'pin', 'hpin', 1.0),
 ('f02a', '02 Philosophy', '02.1 Building You a Better Life', 'pin', 'philosophy', 0.05),
 ('f02b', '02 Philosophy', '02.2 75% of the day', 'pin', 'philosophy', 0.18),
 ('f02c', '02 Philosophy', '02.3 Life, not a look', 'pin', 'philosophy', 0.30),
 ('f02d', '02 Philosophy', '02.4 How you want to live', 'pin', 'philosophy', 0.80),
 ('f02e', '02 Philosophy', '02.5 Concierge level', 'pin', 'philosophy', 0.90),
 ('f02f', '02 Philosophy', '02.6 Good design', 'pin', 'philosophy', 1.0),
 ('f03a', '03 About', '03.1 One Vision', 'pin', 'about', 0.05),
 ('f03b', '03 About', '03.2 Traditional model', 'pin', 'about', 0.22),
 ('f03c', '03 About', '03.3 Built differently', 'pin', 'about', 0.40),
 ('f03d', '03 About', '03.4 Under one roof', 'pin', 'about', 0.56),
 ('f03e', '03 About', '03.5 Your time', 'pin', 'about', 0.68),
 ('f03f', '03 About', '03.6 20% saved', 'pin', 'about', 0.78),
 ('f03g', '03 About', '03.7 We own everything', 'pin', 'about', 1.0),
 ('f04', '04 Projects', '04 Projects', 'static', 'projects', None),
 ('f05', '05 Difference', '05 Difference', 'static', 'difference', None),
 ('f06', '06 Service Suite', '06 Service Suite', 'static', 'suite', None),
 ('f07a', '07 Approach', '07.1 Designed around how you live', 'pin', 'approach', 0.05),
 ('f07b', '07 Approach', '07.2 Questions', 'pin', 'approach', 0.58),
 ('f07c', '07 Approach', '07.3 The answers', 'pin', 'approach', 0.72),
 ('f07d', '07 Approach', '07.4 Personalized', 'pin', 'approach', 1.0),
 ('f08a', '08 Process', '08.1 The project is complex', 'pin', 'process', 0.15),
 ('f08b', '08 Process', '08.2 Discover', 'pin', 'process', 0.42),
 ('f08c', '08 Process', '08.3 Define', 'pin', 'process', 0.50),
 ('f08d', '08 Process', '08.4 Design', 'pin', 'process', 0.58),
 ('f08e', '08 Process', '08.5 Build', 'pin', 'process', 0.66),
 ('f08f', '08 Process', '08.6 Curate', 'pin', 'process', 0.74),
 ('f08g', '08 Process', '08.7 Deliver', 'pin', 'process', 0.82),
 ('f08h', '08 Process', '08.8 Complete responsibility', 'pin', 'process', 1.0),
 ('f09', '09 Client', '09 Client', 'static', 'client', None),
 ('f10', '10 Reviews', '10 Reviews', 'static', 'reviews', None),
 ('f11', '11 FAQ', '11 FAQ', 'static', 'faq', None),
 ('f12a', '12 CTA', '12.1 Your next chapter', 'pin', 'cta', 0.3),
 ('f12b', '12 CTA', '12.2 Begin your better life', 'pin', 'cta', 1.0),
 ('f13', '13 Footer', '13 Footer', 'static', 'footer', None),
]
only = set(sys.argv[1].split(',')) if len(sys.argv) > 1 and sys.argv[1] != 'all' else None

FORCE = '#hdr{opacity:1!important;transform:none!important} #chap{opacity:1!important;transform:none!important} #cur{display:none!important}'

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        logs = []
        pg.on('pageerror', lambda e: logs.append('ERR ' + str(e)[:300]))
        await pg.goto('http://localhost:8771/index.html', wait_until='load')
        await pg.wait_for_function("window.__intro && window.__intro.state.t > 0.1", timeout=240000)
        await pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
        await pg.evaluate("window.__intro.finish()"); await pg.wait_for_timeout(1500)
        await pg.add_script_tag(content=FIGX)
        await pg.add_style_tag(content=FORCE)
        # trigger all reveals once (scroll through the page)
        H = await pg.evaluate("document.documentElement.scrollHeight")
        for y in range(0, H, 700):
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(60)
        await pg.wait_for_timeout(800)
        for key, sec, title, kind, eid, q in FRAMES:
            if only and key not in only: continue
            if kind == 'pin':
                await pg.evaluate(f"(()=>{{const e=document.getElementById('{eid}');const top=e.getBoundingClientRect().top+scrollY;window.scrollTo(0, top + {q}*(e.offsetHeight-innerHeight));}})()")
                await pg.wait_for_timeout(3200 if key == 'f01a' else 1600)
                root = {'f01a': '#hero', 'f01b': '#hero', 'f01c': '#hero', 'f01d': '#hero', 'f01e': '#hero'}.get(key, f'#{eid} .ch-stage, #{eid} .pr4-stage')
                origin = [0, 0]; clip = [0, 0, 1440, 900]; fw, fh = 1440, 900
            else:
                await pg.evaluate(f"(()=>{{const e=document.getElementById('{eid}');window.scrollTo(0, e.getBoundingClientRect().top+scrollY);}})()")
                await pg.evaluate("document.querySelectorAll('.cl2-rv,.ch-rev .rv-card,.ch-rev .rv-hd,.ch-faq .fq-hd,.ch-faq .qa,#footer').forEach(e=>e.classList.add('in'))")
                if eid == 'projects':
                    await pg.evaluate("document.querySelector('.pj3-tile[data-i=\"0\"]').click()")
                if eid == 'difference':
                    await pg.evaluate("(()=>{const c=document.querySelector('.df2-cell.c1'); c && c.click();})()")
                await pg.wait_for_timeout(1800)
                r = await pg.evaluate(f"(()=>{{const r=document.getElementById('{eid}').getBoundingClientRect();return [r.top,r.height];}})()")
                origin = [0, r[0]]; clip = [0, r[0], 1440, r[0] + r[1]]; fw, fh = 1440, round(r[1])
                root = f'#{eid}'
            roots = root if isinstance(root, list) else [root]
            js_roots = json.dumps(roots)
            data = await pg.evaluate(f"(async()=>{{ const sel={js_roots}; const els=[]; for (const s of sel) document.querySelectorAll(s).forEach(e=>els.push(e)); return await window.__figx({{roots: els, origin: {json.dumps(origin)}, clip: {json.dumps(clip)}}}); }})()")
            hdr = await pg.evaluate("window.__figx({roots:['#hdr'], origin:[0,0], clip:[0,0,1440,900]})")
            rail = await pg.evaluate("window.__figx({roots:['#chap'], origin:[0,0], clip:[0,0,1440,900]})")
            railKey = await pg.evaluate("(()=>{const a=document.querySelector('#chap a.on');return a?a.textContent.replace(/\\s+/g,' ').trim():'none';})()")
            secBg = await pg.evaluate(f"(()=>{{const e=document.querySelector('{roots[0]}');const s=getComputedStyle(document.getElementById('{eid}'));return [s.backgroundColor, s.backgroundImage];}})()")
            # canvases
            for cv in data['canvases']:
                if not cv.get('sel'): continue
                await pg.evaluate(f"(()=>{{const c=document.querySelector('{cv['sel']}');let e=c;while(e){{e.setAttribute('data-keep','');e=e.parentElement;}}}})()")
                await pg.add_style_tag(content=f"body *:not([data-keep]):not({cv['sel']}) {{opacity:0!important}}")
                for i in range(6):
                    await pg.mouse.move(700 + i * 4, 450); await pg.wait_for_timeout(120)
                await pg.wait_for_timeout(600)
                x0, y0 = cv['x'] + origin[0], cv['y'] + origin[1]
                cx0, cy0, cx1, cy1 = max(0, x0), max(0, y0), min(1440, x0 + cv['w']), min(900, y0 + cv['h'])
                await pg.screenshot(path=f"{OUT}/canvas/{key}_{cv['id']}.png", clip={'x': cx0, 'y': cy0, 'width': cx1 - cx0, 'height': cy1 - cy0}, timeout=180000)
                cv['crop'] = [cx0 - origin[0], cy0 - origin[1], cx1 - cx0, cy1 - cy0]
                await pg.evaluate("document.head.lastElementChild.remove(); document.querySelectorAll('[data-keep]').forEach(e=>e.removeAttribute('data-keep'))")
            payload = {'key': key, 'sec': sec, 'title': title, 'kind': kind, 'w': fw, 'h': fh, 'bg': secBg, 'data': data, 'hdr': hdr, 'rail': rail, 'railKey': railKey}
            json.dump(payload, open(f'{OUT}/{key}.json', 'w'))
            await pg.screenshot(path=f'{OUT}/{key}_ref.jpg', type='jpeg', quality=70, timeout=180000, clip={'x': 0, 'y': max(0, origin[1]), 'width': 1440, 'height': min(900, fh)})
            n = len(json.dumps(data['items']))
            print(key, 'items', len(data['items']), 'svgs', len(data['svgs']), 'canv', len(data['canvases']), 'mats', data['mats'], 'bytes', n, 'svgbytes', sum(len(s['g']) for s in data['svgs']), flush=True)
        print('\n'.join(logs[:20]) or 'no errors')
        await b.close()
asyncio.run(main())
