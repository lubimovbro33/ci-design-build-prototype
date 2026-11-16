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
def _stamp():
    """the same short number for the state of our css and js that the generated pages carry, so no browser keeps an older copy"""
    import hashlib, glob
    h = hashlib.sha1()
    for f in sorted(glob.glob(D + 'css/*.css') + glob.glob(D + 'js/*.js')): h.update(open(f, 'rb').read())
    return h.hexdigest()[:8]
STAMP = _stamp()
# the team as the client's current site names it (cidesignbuild.com/team, read 15.11); the portraits are that site's own files
TP = 'https://cidesignbuild.com/wp-content/uploads/2026/02/'
# 16.11 19:50, her rule again: a field the client has not filled carries working copy, never a bracket. These lines say what the
# ROLE does at CI (nothing personal is invented about a real person); they are marked <span class="wc"> for replacement.
BIO = {
    'Michael Miller': 'Leads CI from the first conversation to the final walkthrough, and holds design and construction to one standard.',
    'Kelly Adamczyk': 'Carries a residence from the concept through the documentation, keeping plan, materials and light in one language.',
    'Daniel Bapst': 'Works the interiors and their details, from millwork and stone to the furnishings that finish the rooms.',
    'Elena Pellegrino': 'Develops drawings, schedules and selections, and keeps the design file in step with the build.',
    'Greg Horen, AIA': 'Runs the project day to day: budget, schedule, trades, and the decisions each stage needs.',
    'Adam Ury': 'Keeps submittals, deliveries and the site moving, so the schedule holds.',
    'Anthony Aiello': 'Coordinates trades and inspections on site, and tracks what each room needs next.',
    'Pepe Telles': 'Builds and supervises in the field, where the drawings meet the house.',
    'Veronica Velez': 'Keeps the numbers of every project clear: budgets, invoices, and what has been committed.',
}
TEAM = [('Michael Miller', 'Founder · Principal', 'photo-65-scaled-512x768.jpg'), ('Kelly Adamczyk', 'Senior Designer', 'photo-29-683x1024.jpg'), ('Daniel Bapst', 'Senior Designer', 'photo-24-683x1024.jpg'),
        ('Elena Pellegrino', 'Design Associate', 'photo-42-1-683x1024.jpg'), ('Greg Horen, AIA', 'Project Manager', 'photo-47-683x1024.jpg'), ('Adam Ury', 'Assistant Project Manager', 'photo-11-683x1024.jpg'),
        ('Anthony Aiello', 'Assistant Project Manager', 'photo-14-683x1024.jpg'), ('Pepe Telles', 'Superintendent / Senior Carpenter', 'photo-9-683x1024.jpg'), ('Veronica Velez', 'Controller', 'photo-22-683x1024.jpg')]
def sq(t):
    """items of a line are set apart by the blue square (.sqr in css/r3.css), never by a dot — the designer, 16.11"""
    ps = [x.strip() for x in t.split(' · ')]
    return t if len(ps) < 2 else '<span class="sqr">%s</span>' % ''.join('<span>%s</span>' % x for x in ps)
def nodots(h, f):
    """index.html and about.html are written by hand: stop if a dot separator stands in their text"""
    for i, t in enumerate(re.split(r'(<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>|<title>.*?</title>|<[^>]+>)', h, flags=re.S)):
        if i % 2 == 0 and re.search('[\u00b7\u2022\u2219\u22c5]', t): raise SystemExit('%s: a dot between items — set it as a .sqr row: %r' % (f, t.strip()[:80]))
def team(h):
    a = h.index('<div class="tm" id="tm">'); b = h.index('</div>\n', h.rindex('</article>', a, h.index('<!-- 08', a)))
    cards = ''.join('<article class="tc" tabindex="0" data-cursor="Flip"><div class="tc-in"><div class="tc-f"><span class="tc-ph lab3">Portrait</span><img class="tc-img" src="%s" alt="%s" loading="lazy" onerror="this.remove()"><div class="tc-nm"><b>%s</b><span class="lab3">%s</span></div></div><div class="tc-b"><b>%s</b><p><span class="wc">%s</span></p><i class="sqd"></i></div></div></article>' % (TP + im, nm, nm, sq(tt), nm, BIO[nm]) for nm, tt, im in TEAM)
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
    nodots(h, f)
    h = re.sub(r'((?:href|src)="(?:css|js)/[^"?]+)(\?v=[a-f0-9]+)?"', lambda m: m.group(1) + '?v=' + STAMP + '"', h)   # the same version on our own files as the generated pages carry
    open(D + f, 'w').write(h); print(f, 'changed', n[0])
wire('index.html', {})
wire('about.html', {'FAQ': 'faq.html'})
