import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, '/home/claude/fig'); from gfroute import gf

PAGE = sys.argv[1]                      # home | about
ONLY = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None   # section ids
VW, VH = 1920, 1080
OUT = f'/home/claude/fig/out19/about3'; os.makedirs(OUT + '/canvas', exist_ok=True)
FIGX = open('/home/claude/fig/figx19.js').read()
URL = 'http://localhost:8771/' + ('index.html' if PAGE == 'home' else 'about.html') + '?fx=19'
NAMES = {
 'hpin': '01 Hero + Story', 'philosophy': '02 Philosophy', 'about': '03 About', 'projects': '04 Projects', 'difference': '05 Difference',
 'suite': '06 Service Suite', 'approach': '07 Approach', 'process': '08 Process', 'client': '09 Client', 'reviews': '10 Reviews',
 'faq': '11 FAQ', 'cta': '12 CTA', 'footer': '13 Footer',
}
ANAMES = {'a-top': '01 Cover', 'a-story': '02 Built by Listening', 'a-why': '03 Taking the Stress', 'a-model': '04 One Team', 'a-standard': '05 Quality', 'a-you': '06 For the Life', 'a-team': '07 One Vision. One Team.', 'a-exp': '08 Seamless Experience', 'a-principles': '09 What Guides Us', 'a-cta': '10 CTA'}
FORCE = '#hdr{opacity:1!important;transform:none!important} #chap{opacity:1!important;transform:none!important} #cur,#mn{display:none!important} .grain{display:none!important}'

SIG = """(root)=>{const out=new Set();const vw=innerWidth,vh=innerHeight;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const t=n.textContent.replace(/\\s+/g,' ').trim();if(t.length<2)continue;const el=n.parentElement;if(!el)continue;const r=el.getBoundingClientRect();
  if(r.bottom<2||r.top>vh-2||r.right<2||r.left>vw-2||r.width<1||r.height<1)continue;let op=1,e=el,ok=true;
  while(e&&e!==document.body){const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'){ok=false;break;}op*=parseFloat(cs.opacity);e=e.parentElement;}
  if(!ok||op<0.5)continue;const c=getComputedStyle(el).color.match(/[\\d.]+/g);if(c&&c.length===4&&+c[3]<0.3)continue;out.add(t.slice(0,48));}
 return [...out];}"""

CLAR = """(root)=>{const vw=innerWidth,vh=innerHeight;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n,good=0,bad=0;
 while((n=w.nextNode())){const t=n.textContent.trim();if(t.length<2)continue;const el=n.parentElement;if(!el)continue;const r=el.getBoundingClientRect();
  if(r.bottom<2||r.top>vh-2||r.right<2||r.left>vw-2||r.width<1||r.height<1)continue;let op=1,e=el,blur=false,hid=false,clipBad=false;
  while(e&&e!==document.body){const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'){hid=true;break;}op*=parseFloat(cs.opacity);
   if(cs.filter&&cs.filter!=='none'&&/blur/.test(cs.filter))blur=true;
   if(e!==el&&(cs.overflow==='hidden'||cs.overflowY==='hidden'||cs.overflowX==='hidden'||cs.clipPath!=='none')){const q=e.getBoundingClientRect();if(r.top<q.top-1||r.bottom>q.bottom+1||r.left<q.left-1||r.right>q.right+1){const iy=Math.max(0,Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top));if(iy>1&&iy<r.height-1)clipBad=true;}}
   e=e.parentElement;}
  if(hid||op<0.05)continue;if(op>=0.97&&!blur&&!clipBad)good++;else bad++;}
 return good-2*bad;}"""

def jac(a, b):
    a, b = set(a), set(b)
    if not a and not b: return 1.0
    if not a or not b: return 0.0
    return len(a & b) / min(len(a), len(b))

async def capture(pg, key, sec, title, kind, eid, origin, clip, fw, fh, first):
    data = await pg.evaluate(f"(async()=>{{ return await window.__figx({{roots:[document.getElementById('{eid}')], origin:{json.dumps(origin)}, clip:{json.dumps(clip)}}}); }})()")
    hdr = await pg.evaluate(f"window.__figx({{roots:['#hdr'], origin:[0,0], clip:[0,0,{VW},{VH}]}})") if first else None
    rail = await pg.evaluate(f"window.__figx({{roots:['#chap'], origin:[0,{VH - 120}], clip:[0,{VH - 120},{VW},{VH}]}})") if first else None
    secBg = await pg.evaluate(f"(()=>{{const s=getComputedStyle(document.getElementById('{eid}'));return [s.backgroundColor, s.backgroundImage];}})()")
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
    await pg.screenshot(path=f'{OUT}/{key}_ref.jpg', type='jpeg', quality=55, timeout=240000, clip={'x': 0, 'y': max(0, origin[1]), 'width': VW, 'height': min(VH, fh)})
    print(key, title, 'items', len(data['items']), 'svgs', len(data['svgs']), 'canv', len(data['canvases']), flush=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': VW, 'height': VH}); logs = []
        pg.on('pageerror', lambda e: logs.append('ERR ' + str(e)[:200]))
        await gf(pg)
        await pg.add_init_script('try{ Object.defineProperty(window,"WebGL2RenderingContext",{value:undefined}); }catch(e){}')
        await pg.goto(URL, wait_until='load')
        if PAGE == 'home':
            await pg.wait_for_function("window.__intro", timeout=300000); await pg.wait_for_timeout(600)
            await pg.evaluate("window.__intro.finish()")
        await pg.wait_for_timeout(2500)
        await pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')")
        await pg.add_script_tag(content=FIGX); await pg.add_style_tag(content=FORCE)
        await pg.evaluate("document.querySelectorAll('canvas').forEach((c,i)=>{ if(!c.id) c.id='figcv'+i; })")
        H = await pg.evaluate("document.documentElement.scrollHeight")
        for y in range(0, H, 600):
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(50)
        await pg.wait_for_timeout(800)
        IDS = list(ANAMES.keys())
        starts = [await pg.evaluate(f"window.__ab3.y('{i}', 0)") for i in IDS]
        span = await pg.evaluate("document.getElementById('ab3').offsetHeight - innerHeight"); top = 0
        print('scene starts', [round(x) for x in starts], 'span', span, flush=True)
        eid = 'st'; first = True; manifest = []
        # beats from the film's own timing: every text moment gets a frame at the point where it stands whole
        MOM = await pg.evaluate("""(()=>[...document.querySelectorAll('#st .sc')].map(s=>({id:s.id,len:+s.getAttribute('data-len'),k:[...s.querySelectorAll('.m[data-k]')].map(m=>m.getAttribute('data-k').trim().split(/ +/).map(Number))})))()""")
        cand = []
        for sci, sc in enumerate(MOM):
            sc['id'] = IDS[sci]; qs = set()
            for k in sc['k']:
                hi = min(k[2], sc['len'] - 0.45); qs.add(round(min(sc['len'] - 0.45, k[1] + min(0.25, max(0.02, (hi - k[1]) / 2))), 2))
            qs.add(round(sc['len'] - 0.45, 2))
            if sc['id'] == 'a-top': qs.add(0)                   # the cover itself: its title is not a .m moment, so it has no beat of its own
            if sc['id'] == 'a-team': qs.update([4.7, 5.9])      # the team's cards: the strip at its start and at its end
            prev = -9
            for q in sorted(qs):
                if q - prev < 0.12 or q < 0 or q > sc['len']: continue
                prev = q; cand.append((sc['id'], q))
        got = []
        for sid, q in cand:
            y = await pg.evaluate(f"window.__ab3.y('{sid}', {q})"); y = min(span, max(0, y))
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(500)
            sg = set(await pg.evaluate(f"({SIG})(document.getElementById('{eid}'))"))
            if not sg: continue
            got.append([sid, q, y, sg])
        ref = []
        for i, g in enumerate(got):
            nx = got[i + 1] if i + 1 < len(got) else None
            if ref and ref[-1][1] == g[3]: continue                       # the same words as the frame before
            if nx and nx[0] == g[0] and g[3] < nx[3]: continue            # a step of a reveal: the fuller frame follows
            ref.append((g[2], g[3]))
        print('candidates', len(cand), 'with text', len(got), 'beats', len(ref), flush=True)
        cnt = {}
        for bi, (y, sg) in enumerate(ref):
            si = max(i for i, st in enumerate(starts) if st <= y + 1) if y + 1 >= starts[0] else 0
            cnt[si] = cnt.get(si, 0) + 1
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(1500)
            key = f'b{si:02d}{chr(96 + cnt[si])}'; sec = ANAMES[IDS[si]]; title = f'{sec} · {cnt[si]}'
            await capture(pg, key, sec, title, 'pin', eid, [0, 0], [0, 0, VW, VH], VW, VH, first)
            manifest.append(key); first = False
        ft = await pg.evaluate("(()=>{const e=document.getElementById('footer'); return Math.round(e.getBoundingClientRect().top+scrollY)})()")
        await pg.evaluate(f"window.scrollTo(0,{ft})"); await pg.wait_for_timeout(1500)
        r = await pg.evaluate("(()=>{const r=document.getElementById('footer').getBoundingClientRect();return [r.top,r.height];})()")
        await capture(pg, 'b99', '11 Footer', '11 Footer', 'static', 'footer', [0, r[0]], [0, r[0], VW, r[0] + r[1]], VW, round(r[1]), False)
        manifest.append('b99')
        json.dump(manifest, open(f'{OUT}/manifest.json', 'w'))
        print('\n'.join(logs[:10]) or 'no errors')
        await b.close()
asyncio.run(main())
