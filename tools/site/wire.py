# CI site — wires the links of the homepage and About to the real pages (by the link's own text), and gives their menus the same photographs.
import re
import os
HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.normpath(os.path.join(HERE, '..', '..', 'design')) + '/'
MAP = {'About Us': 'about.html', 'Portfolio': 'portfolio.html', 'Solutions': 'solutions.html', 'Broker Program': 'broker-program.html', 'Partnerships': 'partnerships.html', 'News': 'news.html',
       'Contact': 'contact.html', 'All Solutions': 'solutions.html', 'CI Turnkey': 'ci-turnkey.html', 'CI Core': 'ci-core.html', 'CI Curated': 'ci-curated.html', 'CI Wellness': 'ci-wellness.html',
       'Begin Your Better Life': 'contact.html', 'Discover CI Design + Build': 'about.html', 'Explore CI Turnkey': 'ci-turnkey.html', 'Explore CI Core': 'ci-core.html',
       'Explore CI Curated': 'ci-curated.html', 'Explore CI Wellness': 'ci-wellness.html', 'View the Portfolio': 'portfolio.html', 'Start a Conversation': 'contact.html'}
MENU_PH = ['assets/ph/of/team3.webp', 'assets/ph/ch/1450-09a.webp', 'assets/ph/ch/1450-15.webp', 'assets/ph/us/1530-04.webp', 'assets/ph/of/materials.webp', 'assets/ph/us/1530-06a.webp']
def text(x): return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', x)).strip()
def wire(f, extra):
    h = open(D + f).read(); n = [0]; m_ = dict(MAP); m_.update(extra)
    def fix(m):
        t = text(m.group(2)); to = m_.get(t)
        if to is None: return m.group(0)
        a = re.sub(r'href="[^"]*"', 'href="%s"' % to, m.group(1), count=1)
        if a != m.group(1): n[0] += 1
        return '<a' + a + '>' + m.group(2) + '</a>'
    h = re.sub(r'<a\b([^>]*)>(.*?)</a>', fix, h, flags=re.S)
    # the header's Solutions is a link now
    h2 = h.replace('<button type="button"><span class="t">Solutions</span></button>', '<a href="solutions.html"><span class="t">Solutions</span></a>')
    if h2 != h: n[0] += 1; h = h2
    # the menu's photographs
    a = h.index('<div class="mn-ph"'); b = h.index('</div>', a)
    imgs = ''.join('<img%s data-src="%s" alt="">' % (' class="on"' if i == 0 else '', s) for i, s in enumerate(MENU_PH))
    blk = h[a:b]; new = blk[:blk.index('>') + 1] + '\n    ' + imgs + '\n  '
    if new != blk: n[0] += 1; h = h[:a] + new + h[b:]
    open(D + f, 'w').write(h); print(f, 'changed', n[0])
wire('index.html', {})
wire('about.html', {'FAQ': 'faq.html'})
