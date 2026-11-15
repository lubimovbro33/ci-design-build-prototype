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
# the team as the client's current site names it (cidesignbuild.com/team, read 15.11); the portraits are that site's own files
TP = 'https://cidesignbuild.com/wp-content/uploads/2026/02/'
TEAM = [('Michael Miller', 'Founder · Principal', 'photo-65-scaled-512x768.jpg'), ('Kelly Adamczyk', 'Senior Designer', 'photo-29-683x1024.jpg'), ('Daniel Bapst', 'Senior Designer', 'photo-24-683x1024.jpg'),
        ('Elena Pellegrino', 'Design Associate', 'photo-42-1-683x1024.jpg'), ('Greg Horen, AIA', 'Project Manager', 'photo-47-683x1024.jpg'), ('Adam Ury', 'Assistant Project Manager', 'photo-11-683x1024.jpg'),
        ('Anthony Aiello', 'Assistant Project Manager', 'photo-14-683x1024.jpg'), ('Pepe Telles', 'Superintendent / Senior Carpenter', 'photo-9-683x1024.jpg'), ('Veronica Velez', 'Controller', 'photo-22-683x1024.jpg')]
def team(h):
    a = h.index('<div class="tm" id="tm">'); b = h.index('</div>\n', h.rindex('</article>', a, h.index('<!-- 08', a)))
    cards = ''.join('<article class="tc" tabindex="0" data-cursor="Flip"><div class="tc-in"><div class="tc-f"><span class="tc-ph lab3">Portrait</span><img class="tc-img" src="%s" alt="%s" loading="lazy" onerror="this.remove()"><div class="tc-nm"><b>%s</b><span class="lab3">%s</span></div></div><div class="tc-b"><b>%s</b><p><span class="ph">[Two or three lines about this person, from the client.]</span></p><i class="sqd"></i></div></div></article>' % (TP + im, nm, nm, tt, nm) for nm, tt, im in TEAM)
    new = '<div class="tm" id="tm">' + cards
    return (h[:a] + new + h[b:], 1) if h[a:b] != new else (h, 0)
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
    if 'css/form.css' not in h: h = h.replace('<link rel="stylesheet" href="css/r3.css">', '<link rel="stylesheet" href="css/r3.css">\n<link rel="stylesheet" href="css/form.css">', 1); n[0] += 1
    if 'js/form.js' not in h: h = h.replace('</body>', '<script src="js/form.js"></script>\n</body>', 1); n[0] += 1
    if f == 'about.html': h, k = team(h); n[0] += k
    open(D + f, 'w').write(h); print(f, 'changed', n[0])
wire('index.html', {})
wire('about.html', {'FAQ': 'faq.html'})
