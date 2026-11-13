import asyncio, sys, json
from playwright.async_api import async_playwright
sys.path.insert(0,'/home/claude/fig'); from gfroute import gf
URL=sys.argv[1]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':1920,'height':1080}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)[:200]))
        await gf(pg)
        await pg.add_init_script('try{ Object.defineProperty(window,"WebGL2RenderingContext",{value:undefined}); }catch(e){}')
        await pg.goto(URL,wait_until='load')
        try:
            await pg.wait_for_function("window.__intro",timeout=200000); await pg.wait_for_timeout(500); await pg.evaluate("window.__intro.finish()")
        except Exception as e: print('intro?',str(e)[:80])
        await pg.wait_for_timeout(1500)
        r=await pg.evaluate("""(()=>{const out=[];for(const s of document.querySelectorAll('body > *, main > *')){if(!s.id&&!s.className)continue;const cs=getComputedStyle(s);if(cs.display==='none')continue;
          const st=[...s.querySelectorAll('*')].filter(e=>getComputedStyle(e).position==='sticky').map(e=>(e.id?'#'+e.id:'.'+String(e.className).split(' ')[0])+':'+e.offsetHeight).slice(0,3);
          out.push([s.tagName.toLowerCase()+(s.id?'#'+s.id:'')+'.'+String(s.className).split(' ').slice(0,2).join('.'),Math.round(s.getBoundingClientRect().top+scrollY),s.offsetHeight,cs.position,st.join(' '),s.style.cssText.slice(0,40)]);}
          return {H:document.documentElement.scrollHeight,out};})()""")
        print(json.dumps(r,indent=0)); print('errors',errs[:3])
        await b.close()
asyncio.run(main())
