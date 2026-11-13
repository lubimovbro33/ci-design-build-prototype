import asyncio, json
from playwright.async_api import async_playwright
JS = r"""
() => {
  const INLINE = new Set(['B','STRONG','I','EM','SMALL','SPAN','BR','A','SUP','SUB','U','LABEL','CODE']);
  const out = new Set(), caps = new Set();
  const norm = s => s.replace(/\s+/g,' ').replace(/> </g,'><').trim();
  function inlineOnly(el){ for (const c of el.children){ if (!INLINE.has(c.tagName)) return false; if (!inlineOnly(c)) return false; } return true; }
  document.querySelectorAll('body *').forEach(el => {
    if (el.closest('script,style,.proto')) return;
    if (el.matches('[data-cap]')) caps.add(el.getAttribute('data-cap'));
    if (el.matches('[placeholder]')) caps.add(el.getAttribute('placeholder'));
    if (/^(SCRIPT|STYLE|SVG|IMG|BR|INPUT|TEXTAREA)$/.test(el.tagName)) return;
    if (el.parentElement && INLINE.has(el.tagName) && inlineOnly(el.parentElement) && el.parentElement !== document.body) return;
    if (!inlineOnly(el)) { for (const c of el.childNodes) if (c.nodeType === 3 && c.textContent.trim()) out.add(norm(c.textContent)); return; }
    const h = norm(el.innerHTML); if (h && el.textContent.trim()) out.add(h);
  });
  return {leaf: [...out], caps: [...caps]};
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.goto('file:///home/claude/ci-design-build-prototype/index.html', wait_until='load'); await pg.wait_for_timeout(600)
        r = await pg.evaluate(JS); await b.close()
    json.dump(r, open('strings_en.json','w'), ensure_ascii=False, indent=0)
    L = r['leaf']; print(len(L), sum(len(x) for x in L), len(r['caps']), sum(len(x) for x in r['caps']))
    import re
    tagged = [x for x in L if '<' in x]; print('with tags', len(tagged)); print(tagged[:15])
asyncio.run(main())
