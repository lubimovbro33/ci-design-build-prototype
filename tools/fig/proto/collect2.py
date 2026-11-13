import asyncio, json, re
from playwright.async_api import async_playwright
JS = r"""
() => {
  const out = [], seen = new Set();
  const add = s => { s = s.replace(/[\s ]+/g,' ').trim(); if (s && !seen.has(s)) { seen.add(s); out.push(s); } };
  const pages = ["home","about","wellness","services","turnkey","core","curated","portfolio","project","brokers","partnerships","news","article","contact"];
  const roots = [document.getElementById('top'), document.getElementById('menu')].concat(pages.map(p => document.getElementById('p-' + p))).concat([document.querySelector('footer')]);
  for (const r of roots){
    const w = document.createTreeWalker(r, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())){
      if (n.nodeType === 3){ if (n.parentElement.closest('script,style,.tag')) continue; add(n.textContent); }
      else { for (const a of ['data-cap','placeholder']) if (n.hasAttribute(a)) add(n.getAttribute(a)); }
    }
  }
  return out;
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.goto('file:///home/claude/ci-design-build-prototype/index.html', wait_until='load'); await pg.wait_for_timeout(600)
        L = await pg.evaluate(JS); await b.close()
    keep = re.compile(r'^[\d\s.,·%+×\-—–/:()#&]+$|^(CI|CI Turnkey|CI Core|CI Curated|CI Wellness|CI Design \+ Build|/CI|DSGN|BIÂN|Lutron|Hydrology|Lamborghini|Dr\. Alka|Carrie McCormick|Jameson Sotheby\'s International Realty|The Luxury Bed Collection|312 279 2776)$')
    todo = [s for s in L if not keep.match(s)]
    json.dump({'all': L, 'todo': todo}, open('tr_src.json','w'), ensure_ascii=False)
    print(len(L), len(todo), sum(len(s) for s in todo))
    with open('tr_src.txt','w') as f:
        for i,s in enumerate(todo): f.write(f'{i}|{s}\n')
asyncio.run(main())
