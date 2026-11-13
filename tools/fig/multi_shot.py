import asyncio, sys
from playwright.async_api import async_playwright
from PIL import Image
sys.path.insert(0,'/home/claude/fig'); from gfroute import gf
W,H=int(sys.argv[1]),int(sys.argv[2]); OUT=sys.argv[3]
SHOTS=[(s.split('@')[0],float(s.split('@')[1])) for s in sys.argv[4].split(',')] if len(sys.argv)>4 else [('#philosophy .ch-pin',.02),('#philosophy .ch-pin',.5),('#about .ch-pin',.08),('#about .ch-pin',.7),('#projects',0),('#suite',0),
       ('#approach .ch-pin',.05),('#approach .ch-pin',.6),('#process .ch-pin',.03),('#process .ch-pin',.55),('#client',.1),('#reviews',0),('#faq',0),('#cta .ch-pin',.97),('#footer',0)]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width':W,'height':H})
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await gf(pg)
        await pg.add_init_script('try{ Object.defineProperty(window,"WebGL2RenderingContext",{value:undefined}); }catch(e){}')
        await pg.goto('http://localhost:8771/index.html?v=t1', wait_until='load')
        try:
            await pg.wait_for_function("window.__intro", timeout=200000); await pg.wait_for_timeout(600); await pg.evaluate("window.__intro.finish()")
        except Exception as e: print('intro', e)
        await pg.wait_for_timeout(1200); await pg.add_style_tag(content="#cur{display:none!important}")
        files=[]
        for i,(sel,q) in enumerate(SHOTS):
            o = await pg.evaluate(f"(()=>{{const e=document.querySelector('{sel}'); if(!e) return null; const r=e.getBoundingClientRect(); return [r.top+scrollY, e.offsetHeight]}})()")
            if not o: print('missing', sel); continue
            y = o[0] + q*max(0,o[1]-H) + (60 if q==0 else 0)
            await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(1300)
            n=f'/tmp/ms{i}.png'; await pg.screenshot(path=n); files.append(n)
        cols=3; rows=(len(files)+cols-1)//cols; tw=640; th=int(tw*H/W)
        m=Image.new('RGB',(tw*cols,th*rows))
        for i,n in enumerate(files): m.paste(Image.open(n).resize((tw,th)),((i%cols)*tw,(i//cols)*th))
        m.save(OUT); print('errors', errs[:3])
        await b.close()
asyncio.run(main())
