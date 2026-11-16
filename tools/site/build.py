# CI site — builds every inner page from the client-edited copy (content.json, 2nd round) in the homepage's system.
# Usage: python3 tools/site/pages.py  → writes design/*.html (the inner pages); python3 tools/site/wire.py wires the links of index.html and about.html;
# python3 tools/site/verify.py checks the copy against content.json (the client's 2nd-round copy, parsed by parse.py from the single-file prototype).
import json, re, html, os, sys
HERE = os.path.dirname(os.path.abspath(globals().get('__file__', 'tools/site/build.py')))
D = os.path.normpath(os.path.join(HERE, '..', '..', 'design')) + '/'
RAW = open(os.path.join(HERE, 'content.json'), encoding='utf-8').read()
for _a, _b in json.load(open(os.path.join(HERE, 'dashes.json'), encoding='utf-8'))['pairs']: RAW = RAW.replace(_a, _b)   # 16.11: the agreed changes of punctuation (no dashes where the grammar lets them go)
P = json.loads(RAW)

FILE = {'home': 'index.html', 'about': 'about.html', 'services': 'solutions.html', 'turnkey': 'ci-turnkey.html', 'core': 'ci-core.html', 'curated': 'ci-curated.html',
        'wellness': 'ci-wellness.html', 'portfolio': 'portfolio.html', 'brokers': 'broker-program.html', 'partnerships': 'partnerships.html', 'news': 'news.html',
        'article': 'article.html', 'contact': 'contact.html', 'faq': 'faq.html'}
NAV = [('About Us', 'about.html'), ('Portfolio', 'portfolio.html'), ('Solutions', 'solutions.html'), ('Broker Program', 'broker-program.html'), ('Partnerships', 'partnerships.html'), ('News', 'news.html')]
LINKS = dict(NAV); LINKS.update({'FAQ': 'faq.html', 'Contact': 'contact.html', 'All Solutions': 'solutions.html', 'CI Turnkey': 'ci-turnkey.html', 'CI Core': 'ci-core.html',
                                  'CI Curated': 'ci-curated.html', 'CI Wellness': 'ci-wellness.html'})
MENU_PH = ['assets/ph/of/team3.webp', 'assets/ph/ch/1450-09a.webp', 'assets/ph/ch/1450-15.webp', 'assets/ph/us/1530-04.webp', 'assets/ph/of/materials.webp', 'assets/ph/us/1530-06a.webp']
PROJ = [
    dict(slug='collectors-home', name='Collectors Home', loc='Streeterville · Chicago', bld='One Bennett Park', facts={'Residence': 'One Bennett Park, 55th floor · Streeterville · Chicago', 'Size': '5,130 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Space reconfiguration / Wine cellar / Primary bathroom / Millwork + stone / Home automation / Furnishings + art'}, set='ch', cover='1450-20a', card='1450-24', tall='1450-09a', cta='1450-31', g=.7,
         gal=[('full', ['1450-24']), ('pair', ['1450-15', '1450-09a']), ('duo', ['1450-02a', '1450-03a']), ('full', ['1450-22']), ('duor', ['1450-10a', '1450-05']), ('pair', ['1450-08a', '1450-16a']),
              ('full', ['1450-32']), ('duo', ['1450-25a', '1450-26']), ('pair', ['1450-12', '1450-11']), ('full', ['1450-34'])]),
    dict(slug='urban-sanctuary', name='Urban Sanctuary', loc='Gold Coast · Chicago', bld='900 North Michigan', set='us', cover='1511-12a', card='1511-07a', tall='1511-09', cta='1511-06a', g=.66,
         gal=[('full', ['1511-07a']), ('pair', ['1511-09', '1511-10']), ('duo', ['1511-01a', '1511-02a']), ('full', ['1511-11a']), ('duor', ['1511-05a', '1511-04a']), ('pair', ['1530-01', '1530-02']),
              ('full', ['1530-03']), ('pair', ['1511-13', '1530-06a']), ('pair', ['1511-08a', '1530-04'])]),
    dict(slug='room-to-breathe', name='Room To Breathe', loc='Lincoln Park · Chicago', bld='Residence', facts={'Residence': 'Lincoln Park · Chicago', 'Size': '4,070 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Open-plan first floor / Kitchen / Living room / Fireplace wall'}, set='rtb', cover='1430-08a', card='1430-01a', tall='1430-11a', cta='1430-13', top=True, g=.56,
         gal=[('full', ['1430-01a']), ('pair', ['1430-07', '1430-11a']), ('duo', ['1430-04a', '1430-05a']), ('full', ['1430-12a']), ('pair', ['1430-09a', '1430-10a']), ('pair', ['1430-03a', '1430-06']),
              ('full', ['1430-13']), ('pair', ['1430-14', '1430-15'])]),
]
# the project pages of 15.11 (her word of 21:29): the name's own lines for the cover that is flown through, a seed for the home's own key, and the gallery
# on the Portfolio grid — 'blk' = one large + two small (portrait pictures), 'blkr' = its mirror (small, small, large), 'full' = a wide picture across
# WORKING COPY for the unfilled fields of the client's project template on «Collectors Home» — NOT text the client has approved for this page.
# Her words of 16.11: 13:24 «Давай напишемо поки що текст, якийсь заглушку… Ми не можемо давати ось так шаблонно», 13:28 «Можеш взяти інформацію з їхнього
# теперішнього сайту?» — so every line below is built on what the client's CURRENT site says about this project
# (https://cidesignbuild.com/portfolio-item/collectors-home/, read 16.11.2026): the 55th floor of One Bennett Park, 5,130 sq ft, a turnkey renovation and
# furnishing; the floor plan reconfigured for a custom, climate-controlled wine cellar; the primary bathroom redone in custom stonework and tailored
# millwork; bespoke millwork and stone through the public spaces; home automation customized with Digital Living (lighting, window treatments, speakers,
# media); Porter Teleo hand-painted wallpaper and a Nicholas Hernandez sculpture in the dining room; a bespoke E Studio Furnishings sectional; an Erden
# rug; CI curated and installed all furnishings, art and accessories. The wording is ours (their page is not copied); nothing beyond those facts is
# claimed. On the page each line is wrapped in <span class="dr"> so that it can be found and replaced when the client sends the final text.
# The testimonial is NOT written: a client's words cannot be made up, and their page has none — its block stays off the page until a real, approved
# one exists (put it in PROJ[0]['quote'] = (text, who)).
DRAFT_CH = {
    'lead': 'A turnkey renovation and furnishing on the 55th floor of One Bennett Park',
    'client': 'Private collectors',
    'goal': 'A full transformation of the residence, made to reflect both the elegance of the building and the taste of its owners',
    'concept': 'Cohesion and Quiet Drama',
    'began': 'The design began with millwork and stone: bespoke details that carry warmth and texture from one room to the next',
    'narrative': 'The floor plan was reconfigured to add a custom, climate-controlled wine cellar, the primary bathroom was rebuilt in custom stonework and tailored millwork, and one automation system runs lighting, window treatments, speakers and media',
    'dec': [('The Wine Cellar', 'The existing floor plan was reconfigured / to make room for a custom, / climate-controlled wine cellar, so the collection / has a place of its own within the home'),
            # ' / ' = a line break on wide screens (16.11 18:27: the lines of a block alternate in length; measured in the real face)
            ('Millwork + Stone', 'Bespoke millwork and stone details / run through the public spaces and the primary bathroom, / tying the rooms together with warmth and texture'),
            ('Art + Furnishings', 'Hand-painted Porter Teleo wallpaper / and a sculpture by Nicholas Hernandez set the dining room; / a bespoke sectional from E Studio Furnishings / anchors the living area. CI curated and installed every piece')]}
PROJ[0].update(lines=['Collectors', 'Home'], seed=1450, idea='collection', qphoto='1450-18', draft=DRAFT_CH,
               gal3=[('m1', ['1450-24', '1450-09a']), ('rb', ['1450-14', '1450-15']), ('sw', ['1450-22']), ('lb', ['1450-32', '1450-12']), ('m1', ['1450-25a', '1450-26']), ('full', ['1450-34']),
                     ('lp', ['1450-16a', '1450-08a']), ('sw', ['1450-02a']), ('m1', ['1450-05', '1450-10a'])],   # the staggered plan of 16.11: kind → files (landscape / portrait as the kind needs)
               gal2=[('blk', ['1450-09a', '1450-15', '1450-14']), ('full', ['1450-24']), ('blkr', ['1450-12', '1450-26', '1450-16a']), ('full', ['1450-22']),
    ('blk', ['1450-08a', '1450-13', '1450-18']), ('full', ['1450-25a']), ('blkr', ['1450-11', '1450-27', '1450-10a']), ('full', ['1450-32']), ('blk', ['1450-30', '1450-19', '1450-21']), ('full', ['1450-34'])])
PROJ[1].update(lines=['Urban', 'Sanctuary'], seed=1511, gal2=[('blk', ['1511-09', '1511-08a', '1511-13']), ('full', ['1511-07a']), ('blkr', ['1511-03a', '1511-02a', '1511-10']), ('full', ['1511-01a']),
    ('blk', ['1530-04', '1530-05', '1511-14a']), ('full', ['1530-03']), ('blkr', ['1530-01', '1530-02', '1511-05a']), ('full', ['1511-11a']), ('full', ['1511-04a'])])
PROJ[2].update(lines=['Room To', 'Breathe'], seed=1430, gal2=[('blk', ['1430-11a', '1430-03a', '1430-05a']), ('full', ['1430-01a']), ('blkr', ['1430-06', '1430-07', '1430-10a']), ('full', ['1430-04a']),
    ('blk', ['1430-14', '1430-15', '1430-09a']), ('full', ['1430-12a'])])
PROJ_MORE = [dict(name='500 W Superior', loc='River North · Chicago', bld='Residence', img='assets/pj/superior.webp'), dict(name='444 W Grant', loc='Lincoln Park · Chicago', bld='Residence', img='assets/pj/grant.webp')]
def ph(set_, name): return 'assets/ph/%s/%s.webp' % (set_, name)

# ------------------------------------------------------------------ text
def esc(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"(?<=\w)'(?=\w)", '’', t).replace("'", '’')
    t = t.replace('—', '—')
    return re.sub(r'\[[^\]]+\]', lambda m: '<span class="ph">%s</span>' % m.group(0), t)
def sqr(parts, raw=False):
    """one row of items set apart by the blue square (.sqr in css/r3.css). 16.11, the designer: items of a line are never set apart by a small dot —
    a square 8 x 8 of the blue, 10 from the word before it and 10 before the next. `raw`: the parts are markup already"""
    return '<span class="sqr">%s</span>' % ''.join('<span>%s</span>' % (x if raw else esc(x)) for x in parts if x)
SQ_SPLIT = re.compile('\\s*[\u00b7\u2022\u2219\u22c5]\\s*')
def squares(out, fname):
    """the last gate before a page is written: a text "A · B" (the client's documents and our own data use the dot as a plain-text separator)
    becomes a .sqr row; a dot standing alone between two elements cannot be set that way — the template has to be written with sqr()"""
    parts = re.split(r'(<!--.*?-->|<script\b.*?</script>|<style\b.*?</style>|<title>.*?</title>|<[^>]+>)', out, flags=re.S)
    for i in range(0, len(parts), 2):
        t = parts[i]
        if not SQ_SPLIT.search(t): continue
        items = SQ_SPLIT.split(t)
        if any(not x.strip() for x in items): raise SystemExit('%s: a dot between two elements — write that line with sqr(): %r' % (fname, t[:80]))
        lead = t[:len(t) - len(t.lstrip())]; trail = t[len(t.rstrip()):]
        parts[i] = lead + sqr([x.strip() for x in items], raw=True) + trail
    return ''.join(parts)
def nop(t):
    t = t.strip()
    if t.endswith('.') and not t.endswith('..') and not re.search(r'\[[^\]]*\.\]$', t): t = t[:-1]
    if re.search(r'\.[”"]$', t): t = t[:-2] + t[-1]
    return t
def sents(t): return [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z“\[])', t.strip()) if x.strip()]
def blue(t, lines=None, maxc=54):
    """white first half, blue second half — the homepage's statements; the client's own line breaks are kept when the lines fit"""
    if lines and len(lines) > 1:
        sep = '<br>' if all(len(x) <= maxc for x in lines) and len(lines) <= 3 else ' '
        return esc(lines[0]) + sep + '<span class="cb">' + sep.join(esc(x) for x in lines[1:-1] + [nop(lines[-1])]) + '</span>'
    t = nop(t); s = sents(t)
    if len(s) >= 2:
        sep = '<br>' if all(len(x) <= maxc for x in s) and len(s) <= 3 else ' '
        return esc(s[0]) + sep + '<span class="cb">' + sep.join(esc(x) for x in s[1:]) + '</span>'
    for sep in (' — ', ': ', '—'):
        i = t.find(sep)
        if 12 < i < len(t) - 12:
            a, b = (t[:i + 1], t[i + 1:]) if sep == ': ' else (t[:i], t[i:])
            return esc(a.rstrip()) + ('' if sep == '—' else ' ') + '<span class="cb">' + esc(b.strip()) + '</span>'
    return esc(t)
SMALL = {'a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'and', 'or', 'but', 'is', 'it', 'we', 'our', 'your', 'you', 'with', 'from', 'as', 'so', '+', '—', 'if', 'into', 'than', 'that'}
def _wrap(t, maxc):
    """balanced lines by sense: no line ends on a small word, no single short word left over"""
    import math
    w = t.split(); n = len(w)
    if n < 2 or (len(t) <= maxc and (n < 5 or len(t) <= maxc * .6)): return [t]
    L = [len(x) for x in w]
    def ln(i, j): return sum(L[i:j]) + (j - i - 1)
    best = None; lo = max(2 if len(t) > maxc * .6 else 1, math.ceil(len(t) / maxc))
    for k in range(lo, min(n, lo + 2) + 1):
        avg = len(t) / k; INF = 1e18
        dp = [[INF] * (k + 1) for _ in range(n + 1)]; pv = [[0] * (k + 1) for _ in range(n + 1)]; dp[0][0] = 0
        for j in range(1, n + 1):
            for c in range(1, k + 1):
                for i in range(c - 1, j):
                    l = ln(i, j)
                    if l > maxc or dp[i][c - 1] >= INF: continue
                    cost = (l - avg) ** 2
                    lastw = w[j - 1].lower().strip('.,:;')
                    if j < n and lastw in SMALL: cost += 320
                    if j < n and w[j - 1][-1] in ',;': cost -= 90
                    if j == n and j - i == 1 and l < 7: cost += 260
                    if dp[i][c - 1] + cost < dp[j][c]: dp[j][c] = dp[i][c - 1] + cost; pv[j][c] = i
        if dp[n][k] < INF:
            score = dp[n][k] + (k - lo) * 150
            if best is None or score < best[0]:
                cuts = []; j = n
                for c in range(k, 0, -1): i = pv[j][c]; cuts.append((i, j)); j = i
                best = (score, cuts[::-1])
    if not best: return [t]
    return [' '.join(w[i:j]) for i, j in best[1]]
def brk_lines(t, maxc):
    t = nop(t)
    parts = [x for x in re.split(r'(?<=[.?!:])\s+', t) if x]
    if len(parts) > 1 and len(t) > 14:
        lines = []
        for x in parts: lines += [x] if len(x) <= maxc else _wrap(x, maxc)
        if len(lines) <= 4: return lines
    return _wrap(t, maxc)
def brk(t, maxc, tgt=None): return '<br>'.join(esc(x) for x in brk_lines(t, maxc))
def btn(label, href, cls=''):
    w = label.split(); lines = []
    if len(w) <= 2: lines = [' '.join(w)] if len(label) <= 12 else w
    else:
        cur = ''
        for x in w:
            if cur and len(cur) + 1 + len(x) > 13: lines.append(cur); cur = x
            else: cur = (cur + ' ' + x).strip()
        lines.append(cur)
        if len(lines) > 3: lines = [' '.join(w[:len(w) // 2]), ' '.join(w[len(w) // 2:])]
    return '<a class="r3btn%s" href="%s"><span class="t">%s</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></a>' % (cls, href, '<br>'.join(esc(x) for x in lines))
def href(h):
    """#turnkey → ci-turnkey.html"""
    k = h.lstrip('#')
    return FILE.get(k, '#')
def slug(t): return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')

# ------------------------------------------------------------------ shell
ABOUT = open(D + 'about.html').read()
INDEX = open(D + 'index.html').read()
def menu(cur):
    nav = ''.join('    <a href="%s"%s><i class="sq"></i><span class="t">%s</span></a>\n' % (h, ' aria-current="page"' if h == cur else '', t) for t, h in NAV)
    imgs = ''.join('<img%s data-src="%s" alt="">' % (' class="on"' if i == 0 else '', s) for i, s in enumerate(MENU_PH))
    return '''<div class="cur" id="cur" aria-hidden="true"><span class="cd"><span class="cl">DRAG</span></span></div>

<!-- MENU: the left half is the list, the right half is a photograph that follows the pointer -->
<div class="mn" id="mn" aria-hidden="true">
  <div class="mn-ph" aria-hidden="true">
    %s
  </div>
  <nav class="mn-nav" aria-label="Menu">
%s  </nav>
  <div class="mn-ft">
    <div>215 W Huron Street<br>Suite 1<br>Chicago, IL 60654</div>
    <div>312 279 2776<br><span class="ph">[sales@cidesignbuild.com]</span><br><span class="sqr"><span><a href="faq.html">FAQ</a></span><span><a href="contact.html">Contact</a></span></span></div>
    <div class="mn-soc"><a href="#" data-noop>Instagram</a><a href="#" data-noop>LinkedIn</a><a href="#" data-noop>Pinterest</a><a href="#" data-noop>Facebook</a></div>
  </div>
</div>

<header class="hdr" id="hdr">
  <div class="hdr-in">
    <div class="cell">
      <nav class="nav lab" aria-label="Main">
%s      </nav>
    </div>
    <div class="cell c" id="wmCell"><a class="wm" href="index.html"><img src="assets/brand/logo-white.png" alt="CI Design + Build"></a></div>
    <div class="cell r meta-r">
      <a class="cta-blk" href="contact.html"><span class="t">Begin<br>Your<br>Better Life</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></a>
      <button class="menu-sq" type="button" aria-label="Menu"><i></i><i></i><span class="ms-tr" aria-hidden="true"><span></span></span></button>
    </div>
  </div>
</header>
''' % (imgs, nav, ''.join('        <a href="%s"><span class="t">%s</span></a>\n' % (h, t) for t, h in NAV))
def footer():
    a = INDEX.rfind('<footer'); b = INDEX.rfind('</footer>') + 9; f = INDEX[a:b]
    def fix(m):
        t = re.sub(r'<[^>]+>', '', m.group(2)).strip()
        if t in LINKS: return '<a%shref="%s"%s>%s</a>' % (m.group(1), LINKS[t], m.group(3), m.group(2))
        return m.group(0)
    f = re.sub(r'<a([^>]*?)href="[^"]*"([^>]*)>(.*?)</a>', lambda m: fixa(m), f, flags=re.S)
    return f
def fixa(m):
    inner = m.group(3); t = re.sub(r'<[^>]+>', '', inner).strip()
    if 'ft-logo' in m.group(1) + m.group(2): return '<a%shref="index.html"%s>%s</a>' % (m.group(1), m.group(2), inner)
    if t in LINKS: return '<a%shref="%s"%s>%s</a>' % (m.group(1), LINKS[t], m.group(2), inner)
    if t in ('Instagram', 'LinkedIn', 'Pinterest', 'Facebook'): return '<a%shref="#" data-noop%s>%s</a>' % (m.group(1), m.group(2), inner)
    return m.group(0)
def page(fname, title, body, rail, preload=None):
    head = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%s — CI Design + Build</title>
<meta name="robots" content="noindex">
%s<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zalando+Sans:wght@400;600;700&family=Zalando+Sans+Expanded:wght@400;500;600;700&family=Zalando+Sans+SemiExpanded:wght@400;700&display=swap">
<link rel="stylesheet" href="css/site.css">
<link rel="stylesheet" href="css/chapters.css">
<link rel="stylesheet" href="css/type.css">
<link rel="stylesheet" href="css/polish.css">
<link rel="stylesheet" href="css/v10.css">
<link rel="stylesheet" href="css/r3.css">
<link rel="stylesheet" href="css/inner.css">
<link rel="stylesheet" href="css/form.css">
<script>(function(){var d=document.documentElement,m=window.matchMedia,c=m&&m('(pointer: coarse)').matches;if(c||/[?&]lite/.test(location.search))d.classList.add('lite');})();</script>
</head>
<body class="inr ready">
''' % (html.escape(title), '<link rel="preload" as="image" href="%s" fetchpriority="high">\n' % preload if preload else '')
    r = ''.join('  <a href="#%s" data-ch="%s"><span>%02d</span><span class="t">%s</span><i></i></a>\n' % (i, i, k + 1, html.escape(l)) for k, (i, l) in enumerate(rail))
    out = head + menu(fname) + '\n<main id="main">\n' + body + '</main>\n\n' + footer() + '\n\n<div class="grain on" aria-hidden="true"></div>\n<nav class="chap mono" id="chap" aria-label="Chapters">\n' + r + '</nav>\n\n<script src="js/v10.js"></script>\n<script src="js/inner.js"></script>\n<script src="js/form.js"></script>\n</body>\n</html>\n'
    out = squares(out, fname)
    open(D + fname, 'w').write(out)
    return len(out)

# ------------------------------------------------------------------ blocks
class Pg:
    def __init__(s): s.h = []; s.rail = []; s.n = 0
    def add(s, htmls, rail=None, id_=None):
        s.n += 1; i = id_ or 's%d' % s.n
        s.h.append(htmls.replace('@ID@', i))
        if rail: s.rail.append((i, rail))
    def body(s): return '\n'.join(s.h)

def cover(kick, h1, paras, img, button=None, emb='', pos=None, g=None):
    """the photograph closes into the line; the page's first words hang from it"""
    hb = brk(h1, 18); l3 = {2: ' l3', 3: ' l4'}.get(hb.count('<br>'), '')
    o = ['<section class="film" data-fig="cover" data-len="%s" data-emb="%s" id="@ID@">' % ('2.5' if paras else '1.5', emb), '  <div class="stg">']
    st = ';'.join(x for x in ['object-position:%s' % pos if pos else '', 'filter:contrast(1.04) brightness(%s)' % g if g else ''] if x)
    if img: o.append('    <div class="pic"><img src="%s" alt=""%s></div>' % (img, ' style="%s"' % st if st else ''))
    o.append('    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">')
    o.append('      <h1 class="t111 cv-h%s"><span class="cv-hi">%s</span></h1>' % (l3, hb))
    if kick: o.append('      <p class="lab3 cv-k%s"><span class="cv-hi">%s</span></p>' % (l3, esc(kick)))
    if paras:
        first = paras[0]; rest = paras[1:]
        o.append('      <p class="t34 m p-al" data-k="1.0 1.35 99 99" style="--w:1240">%s</p>' % blue(' '.join(first), first))
        if rest: o.append('      <div class="t20s m p-ur" data-k="1.15 1.5 99 99" style="--w:430">%s</div>' % ''.join('<p>%s</p>' % '<br>'.join(esc(nop(x)) if i == len(p) - 1 else esc(x) for i, x in enumerate(p)) for p in rest))
    if button: o.append('      <div class="m p-ul" data-k="1.3 1.6 99 99">%s</div>' % btn(button[0], button[1]))
    o.append('    </div>\n  </div>\n</section>')
    return '\n'.join(o)

# ------------------------------------------------------------------ scenes: every page opens in its own way
def UU(n): return 'calc(%s * var(--u))' % n
def sn_open(length, cls='', attrs=''):
    return '<section class="film%s" data-fig="scene" data-len="%s"%s id="@ID@">\n  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>' % (cls, length, attrs)
SN_CLOSE = '  </div>\n</section>'
def sn_title(h1, kick, scrub='', style='', maxc=18, hidden=False):
    hb = brk(h1, maxc); l = {2: ' l3', 3: ' l4'}.get(hb.count('<br>'), '')
    sa = (' data-s="%s"' % scrub if scrub else '') + (' style="%s"' % style if style else '')
    o = '    <%s class="t111 sn-h%s"%s%s><span class="sn-hi">%s</span></%s>' % ('p' if hidden else 'h1', l, sa, ' aria-hidden="true"' if hidden else '', hb, 'p' if hidden else 'h1')
    if kick and not hidden: o += '\n    <p class="lab3 sn-k%s"%s><span class="sn-hi">%s</span></p>' % (l, sa.replace('top:' + UU(150), 'top:' + UU(100)), esc(kick))
    return o
def sc_columns(kick, h1, cols):
    """Solutions: four strips, one for each way; they rise to the full height under the title"""
    o = [sn_open(1.5), sn_title(h1, kick, style='top:' + UU(150), maxc=20)]
    for i, (nm, hr, img) in enumerate(cols):
        o.append('    <a class="sn-col" href="%s" style="left:%s;--i:%d" data-s="ty:0>-620@%.2f-%.2f"><img src="%s" alt=""><span class="nm h5r">%s</span></a>' % (hr, UU(421 + i * 368.5), i, .05 + i * .14, .7 + i * .14, img, esc(nm)))
    return '\n'.join(o + [SN_CLOSE])
def sc_track(kick, h1, parts, statement, imgs):
    """Turnkey: one track from the first idea to the first night home; it pans sideways"""
    a, b = parts
    o = [sn_open(2.9, ' trk'), '    <div class="sn-trk" data-track="0.05 2.75">',
         '      <div class="tk-t a" style="width:%s"><p class="lab3">%s</p><h1 class="t111" aria-label="%s">%s</h1></div>' % (UU(1280), esc(kick), html.escape(nop(h1)), brk(a, 18)),
         '      <figure class="tk-i" style="width:%s"><img src="%s" alt=""></figure>' % (UU(900), imgs[0]),
         '      <div class="tk-t" style="width:%s"><p class="t34" style="--w:620">%s</p></div>' % (UU(920), statement),
         '      <figure class="tk-i" style="width:%s"><img src="%s" alt=""></figure>' % (UU(640), imgs[1]),
         '      <div style="width:%s"></div>' % UU(150),
         '      <figure class="tk-i" style="width:%s"><img src="%s" alt=""></figure>' % (UU(1150), imgs[2]),
         '      <div class="tk-t" style="width:%s"><p class="t111" aria-hidden="true">%s</p></div>' % (UU(1300), brk(b, 18)),
         '      <figure class="tk-i" style="width:100vw"><img src="%s" alt="" style="filter:contrast(1.04) brightness(.8)"></figure>' % imgs[3],
         '    </div>']
    return '\n'.join(o + [SN_CLOSE])
def sc_draw(kick, h1, img, seg, ar, g=.66):
    """Core: the drawing draws itself and becomes the photograph (design + build)"""
    o = [sn_open(2.0, '', ' data-seg="%s" data-ar="%s"' % (seg, ar)),
         '    <div class="sn-full" data-s="op:0>1@.95-1.7" style="opacity:0"><img src="%s" alt="" style="filter:contrast(1.04) brightness(%s)"></div>' % (img, g),
         sn_title(h1, kick)]
    o[0] = o[0].replace('<canvas class="ln" aria-hidden="true"></canvas>', '<canvas class="ln" aria-hidden="true" style="z-index:3"></canvas>')
    return '\n'.join(o + [SN_CLOSE])
def sc_triptych(kick, h1, imgs):
    """Curated: three tall pictures move at their own speeds — layers"""
    spec = [(421, 300, -260), (904, 140, -430), (1387, 430, -150)]
    o = [sn_open(1.4)]
    for (x, y, d), im in zip(spec, imgs):
        o.append('    <figure class="sn-img" style="left:%s;top:%s;width:%s;height:%s" data-s="ty:0>%d@0-1.5"><img src="%s" alt="" style="filter:contrast(1.04) brightness(.66)"></figure>' % (UU(x), UU(y), UU(458), UU(1010), d, im))
    return '\n'.join(o + [sn_title(h1, kick), SN_CLOSE])
def sc_dawn(kick, h1, img):
    """Wellness: the picture comes out of the dark into the light"""
    return '\n'.join([sn_open(1.5), '    <div class="sn-full"><img src="%s" alt="" data-s="br:.1>.8@0-1.25;sc:1.1>1@0-1.25" style="filter:contrast(1.04) brightness(.1)"></div>' % img, sn_title(h1, kick), SN_CLOSE])
def sc_letters(kick, h1, img, lines=None, place='cc', zoom=False):
    """Portfolio: the photograph is seen through the letters of the title, then whole.
    lines: the title set in its own lines; place: 'cc' — centred in the middle of the screen, the page's name centred one step above it
    (her frame «01 Cover · 1» of the Portfolio export, 15.11 17:56); 'bl' — a column in the bottom left corner (her frame of 17:18).
    zoom (her word of 15.11 20:25, «міняй ефект на першому екрані, той, що ти радив»): the cover is flown through — the letters open out of the
    site's line when the page arrives, and the scroll flies into a stroke of the first word until the photograph is whole. The title is said once,
    in the letters: no white title comes back onto the photograph (her word of 15.11 21:24 — «дивно, коли ми повторюємо заголовок»); the photograph
    takes the site's usual grade and the page scrolls on. (The second, hidden title stays in the markup: it is the phones' title.) The picture of the letters is drawn on the film's canvas by inner.js (zfDraw); the markup stays the page's own."""
    if lines:
        assert ' '.join(lines) == nop(h1), (lines, h1)
        hb = '<br>'.join(esc(x) for x in lines); n = len(lines)
        t = '    <h1 style="color:#FFFFFF;--ln:%d" class="t111 sn-h %s"><span class="sn-hi">%s</span></h1>' % (n, place, hb)
        dup = '    <p class="t111 sn-h %s"%s style="opacity:0;--ln:%d" aria-hidden="true"><span class="sn-hi">%s</span></p>' % (place, '' if zoom else ' data-s="op:0>1@.75-1.35"', n, hb)
        kk = '    <p class="lab3 sn-k %s" style="--ln:%d"><span class="sn-hi">%s</span></p>' % (place, n, esc(kick))
    else:
        t = sn_title(h1, None).replace('<h1 ', '<h1 style="color:#FFFFFF" ')
        dup = sn_title(h1, None, scrub='' if zoom else 'op:0>1@.75-1.35', style='opacity:0', hidden=True)
        kk = '    <p class="lab3 sn-k l3"><span class="sn-hi">%s</span></p>' % esc(kick)
    if zoom:
        return '\n'.join(["<script>document.documentElement.className += ' zfjs';</script>", sn_open(1.5, cls=' zf'),
                          '    <div class="sn-full"><img src="%s" alt="" data-s="sc:1.18>1@0-1.3;br:1>.78@.9-1.3" style="filter:contrast(1.04) brightness(1)"></div>' % img,
                          '    <div class="sn-mask">\n  ' + t + '\n    </div>', dup, kk, SN_CLOSE])
    return '\n'.join([sn_open(1.6), '    <div class="sn-full"><img src="%s" alt="" data-s="sc:1.18>1@0-1.4;br:1>.62@.55-1.35" style="filter:contrast(1.04) brightness(1)"></div>' % img,
                      '    <div class="sn-mask" data-s="op:1>0@.55-1.35">\n  ' + t + '\n    </div>', dup, kk, SN_CLOSE])
def sc_curtain(kick, h1, img, g=.72):
    """a project: the photograph stays, the page comes over it"""
    return '\n'.join([sn_open(0, ' crt'), '    <div class="sn-full"><img src="%s" alt="" data-s="sc:1>1.1@0-1.6;br:%s>.4@.1-1.4" style="filter:contrast(1.04) brightness(%s)"></div>' % (img, g, g), sn_title(h1, kick), SN_CLOSE])
def sc_window(kick, h1, img_out, img_in):
    """Brokers: a window in the tower opens into the finished home"""
    return '\n'.join([sn_open(1.7), '    <div class="sn-full"><img src="%s" alt="" style="object-position:50%% 40%%"></div>' % img_out,
                      '    <div class="sn-full" data-s="ci:48.1,2.6,6.5,72.2>0,0,0,0@.15-1.3" style="clip-path:inset(48.1%% 2.6%% 6.5%% 72.2%%)"><img src="%s" alt="" data-s="sc:1.22>1@.15-1.3" style="filter:contrast(1.04) brightness(.9)"></div>' % img_in,
                      sn_title(h1, kick, scrub='op:1>0@.6-1.0'), SN_CLOSE])
def sc_strips(kick, h1, img, g=.7):
    """Partnerships: one photograph in strips that come together"""
    off = [(-70, -150), (-35, 120), (0, -80), (35, 160), (70, -110)]; o = [sn_open(1.5)]
    for i, (dx, dy) in enumerate(off):
        o.append('    <div class="sn-strip" style="clip-path:inset(0 %d%% 0 %d%%)" data-s="tx:%d>0@0-1.15;ty:%d>0@0-1.15"><img src="%s" alt="" style="filter:contrast(1.04) brightness(%s)"></div>' % (80 - i * 20, i * 20, dx, dy, img, g))
    return '\n'.join(o + [sn_title(h1, kick), SN_CLOSE])
def sc_split(kick, h1, img, lead):
    """Contact: the words on the left, the studio on the right"""
    return '\n'.join([sn_open(.7), '    <figure class="sn-img ct" style="left:%s;right:0;top:0;height:100%%"><img src="%s" alt="" data-s="sc:1.12>1@0-1" style="filter:contrast(1.04) brightness(.8)"></figure>' % (UU(1160), img),
                      sn_title(h1, kick), '    <p class="t34 sn-lead" style="--w:640">%s</p>' % lead, SN_CLOSE])
def intro(ps, button=None, statement=True):
    """after the opening: the page's first thought on the text line, the text in columns, the button"""
    ps = list(ps); o = []
    if statement and ps: o.append(lead_p(ps.pop(0), w=1240))
    b = btn(button[0], button[1]) if button else ''
    if ps and b: o.append('    <div class="g2">\n      <div class="rv">%s</div>\n      <div class="t20s rv" style="--w:475">%s</div>\n    </div>' % (b, ''.join(para(p) for p in ps)))
    elif ps: o.append(p20(ps, 'c2'))
    elif b: o.append('    <div class="rv c1">%s</div>' % b)
    return '<section class="bk" id="@ID@">\n  <div class="bk-b" style="margin-top:0">\n%s\n  </div>\n</section>' % '\n'.join(o)
def cells_block(title, intro_, steps, n, note=None):
    """steps as cells of a grid"""
    o = []
    if intro_: o.append(lead_p(intro_[0]))
    o.append('    <div class="stps" style="--n:%d">%s</div>' % (n, ''.join('<div class="stp rv"><span class="t">%s</span>%s</div>' % (esc(nop(nm)), '<p class="dsc">%s</p>' % esc(nop(ds)) if ds else '') for nm, ds in steps)))
    if note: o.append(closer(note))
    return bk(title, '\n'.join(o))

def steps_film(title, steps, intro=None, outro=None, d=.55):
    """a journey on the line: the square walks from mark to mark; one step on the stage at a time"""
    N = len(steps); t0 = .8 if intro else .35; ln = t0 + N * d + (.9 if outro else .5)
    o = ['<section class="film" data-fig="steps" data-n="%d" data-t0="%s" data-d="%s" data-len="%.2f" id="@ID@">' % (N, t0, d, ln), '  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">']
    o.append('      <h2 class="t60 m p-tl" data-k="-1 -.5 99 99">%s</h2>' % brk(title, 24))
    if intro: o.append('      <p class="t34 m p-bl" data-k="-1 -.5 %.2f %.2f" style="--w:1000">%s</p>' % (t0 - .2, t0 - .04, intro))
    for i, (nm, ds) in enumerate(steps):
        T = t0 + i * d; last = i == N - 1
        k = '%.2f %.2f %s' % (T, T + .12, '99 99' if last else '%.2f %.2f' % (T + d - .1, T + d))
        o.append('      <p class="t60 m p-al nb" data-k="%s">%s</p>' % (k, brk(nm, 24)))
        if ds: o.append('      <p class="t34 m p-um" data-k="%s" style="--w:860">%s</p>' % (k, esc(nop(ds))))
    if outro:
        T = t0 + N * d + .05
        o.append('      <p class="t34 m p-bm" data-k="%.2f %.2f 99 99" style="--w:860">%s</p>' % (T, T + .3, outro))
    o.append('    </div>\n  </div>\n</section>')
    return '\n'.join(o)

def bk(title, inner, cls='', hcls='', lines=None):
    """lines: the title in its own lines (they must read as the title)"""
    if lines: assert ' '.join(lines) == nop(title), (lines, title)
    hb = '<br>'.join(esc(x) for x in lines) if lines else brk(title, 32)
    return '<section class="bk%s" id="@ID@">\n  <h2 class="t60 bk-h rv%s">%s</h2>\n  <div class="bk-b">\n%s\n  </div>\n</section>' % (cls, hcls, hb, inner)
def para(lines):
    return '<p>%s</p>' % '<br>'.join([esc(x) for x in lines[:-1]] + [esc(nop(lines[-1]))])
def p20(paras, cls='c2', w=475):
    return '    <div class="t20s rv %s" style="--w:%d">%s</div>' % (cls, w, ''.join(para(p) for p in paras))
def lns(lines, cls=''):
    return '<ul class="lns rv%s">%s</ul>' % (cls, ''.join('<li>%s</li>' % esc(nop(x)) for x in lines))
def lead_p(lines, cls='c1', w=1000):
    return '    <p class="t34 rv %s" style="--w:%d">%s</p>' % (cls, w, blue(' '.join(lines), lines if len(lines) > 1 else None))
def closer(lines, cls='c1'):
    return '    <p class="t34 rv %s" style="--w:1000">%s</p>' % (cls, blue(' '.join(lines), lines) if len(lines) > 1 else '<span class="cb">%s</span>' % esc(nop(lines[0])))
def dots_row(words, cls='c1'):
    return '    <div class="dots rv %s">%s</div>' % (cls, sqr(words))
def text_block(title, items, lead_first=True):
    """the first short thought on the text line; small text and parallel lines in columns; the closing thought under them"""
    its = [it for it in items]; lead = None
    if lead_first and its and its[0][0] in ('lead', 'p') and len(' '.join(its[0][1])) <= 165: lead = its.pop(0)[1]
    paras = []; lists = []; closers = []; dots = []
    for it in its:
        k = it[0]
        if k in ('lead', 'p'): (lists if len(it[1]) >= 3 else paras).append(it[1])
        elif k == 'k': lists.append(it[1])
        elif k == 'strong': closers.append(it[1])
        elif k == 'dots': dots.append(it[1])
    o = []
    if lead: o.append(lead_p(lead))
    for d in dots: o.append(dots_row(d))
    if paras and lists:
        o.append('    <div class="g2">\n      <div class="t20s rv" style="--w:430">%s</div>\n      <div>%s</div>\n    </div>' % (''.join(para(p) for p in paras), ''.join(lns(l) for l in lists)))
    elif lists: o.append('    <div class="c2" style="margin-right:calc(50 * var(--u))">%s</div>' % ''.join(lns(l) for l in lists))
    elif paras:
        if len(paras) > 2:
            half = (len(paras) + 1) // 2
            # the longer half goes left
            tot = [sum(len(' '.join(x)) for x in paras[:i]) for i in range(len(paras) + 1)]; half = min(range(1, len(paras)), key=lambda i: abs(tot[i] - (tot[-1] - tot[i])))
            o.append('    <div class="g2 r">\n      <div class="t20s rv" style="--w:430">%s</div>\n      <div class="t20s rv" style="--w:380">%s</div>\n    </div>' % (''.join(para(p) for p in paras[:half]), ''.join(para(p) for p in paras[half:])))
        else: o.append(p20(paras, 'c2'))
    for c in closers: o.append(closer(c))
    return bk(title, '\n'.join(o))
def rows_block(title, intro, rows, note=None, descs=False):
    o = []
    if intro:
        o.append(lead_p(intro[0]))
        if len(intro) > 1: o.append(p20(intro[1:], 'c2 g50'))
    r = []
    for i, (nm, ps) in enumerate(rows):
        if descs and ps: r.append('<div class="rw d rv"><span class="n">%02d</span><span class="t">%s</span><div class="dsc">%s</div></div>' % (i + 1, esc(nop(nm)), ''.join(para(p) for p in ps)))
        else: r.append('<div class="rw rv"><span class="n">%02d</span><span class="t">%s</span></div>' % (i + 1, esc(nop(nm))))
    o.append('    <div class="rws">\n      ' + '\n      '.join(r) + '\n    </div>')
    if note: o.append(closer(note))
    return bk(title, '\n'.join(o))
def cols_block(title, intro, lists, note=None):
    cols = ''.join('<ul class="lns sm rv">%s</ul>' % ''.join('<li>%s</li>' % esc(x) for x in l) for l in lists)
    o = ['    <div class="g3">\n      <p class="t34 rv" style="--w:430">%s</p>\n      %s\n    </div>' % (esc(intro) if intro else '', cols.replace('<ul class="lns sm rv">', '<ul class="lns sm rv" style="margin-right:calc(50 * var(--u))">', 1))]
    if note: o.append('    <p class="t34 rv c2" style="--w:860"><span class="cb">%s</span></p>' % esc(nop(note)))
    return bk(title, '\n'.join(o))
def acc_block(title, intro, items, note=None):
    """rows that open: the name on the text line, the detail under it in two columns"""
    o = []
    if intro: o.append('    <p class="t34 rv c1" style="--w:900">%s</p>' % intro)
    r = []
    for i, (nm, cols) in enumerate(items):
        r.append('<div class="qa rv%s"><button class="qh" type="button" aria-expanded="%s"><span class="n">%02d</span><span class="t">%s</span><span class="pl"></span></button><div class="ab"><div><div class="ain">%s</div></div></div></div>' % (
            ' open' if i == 0 else '', 'true' if i == 0 else 'false', i + 1, esc(nop(nm)), ''.join('<div>%s</div>' % c for c in cols)))
    o.append('    <div class="rws">\n      ' + '\n      '.join(r) + '\n    </div>')
    if note: o.append(closer(note))
    return bk(title, '\n'.join(o))
def proj_cards(title, picks, link=None):
    c = ''.join('<a class="cd rv" href="%s.html"><span class="im"><img src="%s" alt="%s" loading="lazy"></span><span class="nm h5r">%s</span><span class="lc lab3">%s</span></a>' % (
        p['slug'], ph(p['set'], pk), p['name'], p['name'], p['loc']) for p, pk in zip(PROJ, picks))
    o = ['    <div class="cards">%s</div>' % c]
    if link: o.append('    <div class="rv c1">%s</div>' % btn(link[0], link[1]))
    return bk(title, '\n'.join(o))
def quote_block(text, who=None):
    w = sqr(['<span class="ph">[Client name]</span>', '<span class="ph">[Project]</span>'], raw=True) if who is None else esc(who)
    return '<section class="bk" id="@ID@">\n  <p class="t34 rv c1" style="--w:1000">%s</p>\n  <p class="lab3 rv c1" style="margin-top:calc(50 * var(--u))">%s</p>\n</section>' % (esc(text), w)
def band(img, pos=None, g=None):
    st = ';'.join(x for x in ['object-position:%s' % pos if pos else '', 'filter:contrast(1.04) brightness(%s)' % g if g else ''] if x)
    return '<div class="bnd"><img src="%s" alt="" loading="lazy"%s></div>' % (img, ' style="%s"' % st if st else '')
# ------------------------------------------------------------------ the closing block before the footer
# 16.11 19:05, the designer, pointing at her frame «19 CTA» (567:2702) and at the foot of the Portfolio page: «У нас є стилістика на
# сторінці портфоліо… Зроби таку саму верстку… Це нехай буде в нас загальна стилістика під CTA-блок, там, перед футером… там є лінії
# на фото, як розставлений текст, який саме текст». So every page's closing block is now the one she drew for Portfolio («09 CTA»,
# 15.11): the photograph full bleed with the cross of hairlines on it (394 / 395), the title in a narrow column in the lower left
# quarter, the page's thoughts in the running text (20) on the right with their foot on the title's foot, the button under the title.
# Each page keeps its own copy from the client. The lines below are broken for rhythm (16.11 18:27), measured in the real faces.
CTA_TITLE = {
    'Turn Inspiration Into Something Entirely Your Own': ['Turn', 'Inspiration', 'Into', 'Something', 'Entirely', 'Your Own'],
    'Your Home Will Have a Different Story': ['Your Home', 'Will Have', 'a Different', 'Story'],
    'Your Next Chapter Starts With a Conversation': ['Your Next', 'Chapter Starts', 'With a', 'Conversation'],
    'Your Time Is Valuable. So Is the Way You Live': ['Your Time Is', 'Valuable.', 'So Is the Way', 'You Live'],
    'Great Design Needs Great Execution': ['Great', 'Design Needs', 'Great', 'Execution'],
    'The Final Layers Are Often the Most Personal': ['The Final', 'Layers', 'Are Often', 'the Most', 'Personal'],
    'What If Your Home Could Support More of What Matters to You?': ['What If Your', 'Home', 'Could Support', 'More of', 'What Matters', 'to You?'],
    "Let's Build More Than Homes Together": ["Let's Build", 'More', 'Than Homes', 'Together'],
    'Bring the Right People Together From the Beginning': ['Bring the Right', 'People', 'Together From', 'the Beginning'],
    'A Better Life Starts With a Better Home': ['A Better', 'Life Starts', 'With a', 'Better Home'],
}
CTA_TEXT = {
    'Inspiration is where it starts. Your life is what shapes it': ['Inspiration is where it starts.', 'Your life is what shapes it'],
    'Every CI home begins with a conversation about you: how you live, and how you want to live next': ['Every CI home begins with a', 'conversation about you: how you live,', 'and how you want to live next'],
    'You do not need to know whether you need Core, Curated, or Turnkey before contacting us': ['You do not need to know whether', 'you need Core, Curated,', 'or Turnkey before contacting us'],
    'Let us manage the complexity required to create something extraordinary': ['Let us manage the complexity required', 'to create something extraordinary'],
    'Let’s create a home that feels complete because every part belongs': ['Let’s create a home that feels complete', 'because every part belongs'],
    'Let’s begin with how you want to live, and design from there': ['Let’s begin with how you want to live,', 'and design from there'],
    'When your client finds a property with potential, bring CI into the conversation': ['When your client finds', 'a property with potential, bring CI', 'into the conversation'],
    'Together, we’ll turn it into the home they’ve envisioned': ['Together, we’ll turn it into the home', 'they’ve envisioned'],
    'Whether you’re starting with a property, a design idea, or a new vision for how you want to live, CI builds the team around you':
        ['Whether you’re starting', 'with a property, a design idea, or a new', 'vision for how you want', 'to live, CI builds the team around you'],
}
def _set(d, t):
    """the client's copy writes an apostrophe both ways (' and ’) — one key finds either"""
    for k in (t, t.replace('’', "'"), t.replace("'", '’')):
        if k in d: return d[k]
    return None
def cta(title, paras, button, img, pos=None, top=False, g=None):
    t = nop(title); lines = _set(CTA_TITLE, t) or brk_lines(t, 22)
    parts = [nop(x) for p in paras for x in p]
    if len(parts) == 1:
        sp = sents(parts[0])
        if len(sp) == 2: parts = [nop(x) for x in sp]
    ps = ''.join('<p class="t20 rv%s">%s</p>' % (' cb' if i else '', '<br class="bd"> '.join(esc(y) for y in (_set(CTA_TEXT, x) or [x]))) for i, x in enumerate(parts))
    st = ';'.join(x for x in ['object-position:%s' % pos if pos else '', 'filter:contrast(1.04) brightness(%s)' % g if g else ''] if x)
    # 16.11 19:33: the description stands above the title, 20 over its letters; the group's first letters keep the same distance
    # from the horizontal line and from the vertical one (26), so it sits square in the rectangle the cross makes
    return ('<section class="fin gr" id="@ID@">\n  <img src="%s" alt="" loading="lazy"%s>\n  <div class="fg-in">%s<h2 class="t60 rv fg-h">%s</h2></div>\n'
            '  <div class="rv fg-b">%s</div>\n</section>'
            % (img, ' style="%s"' % st if st else '', '<div class="fg-t">%s</div>' % ps if ps else '',
               '<br>'.join(esc(x) for x in lines), btn(button[0], button[1])))

# ------------------------------------------------------------------ generic section → block
RAIL = {'What You Receive': 'Receive', 'The Turnkey Experience': 'Experience', "What's Included": 'Included', 'Our Responsibility': 'One Team', 'Client Testimonial': None,
        'Build a Better Life': 'Contact', 'Final CTA': 'Contact', 'Final Statement': 'Contact', 'Why Choose CI Curated?': 'Why', 'What CI Wellness Is': 'Idea',
        'Why Wellness Matters to CI': 'Why', 'Wellness Features + Systems': 'Features', 'Wellness Without Compromising Design': 'Design', 'The Outcome': 'Outcome',
        'Why Brokers Partner With CI': 'Why', 'From Property to Finished Home': 'Journey', 'How CI Helps You Close More Deals': 'How', 'What Your Clients Receive': 'Clients',
        'Why This Strengthens Your Business': 'Business', 'Why This Partnership Model Matters': 'Model', 'What This Means for Our Clients': 'Clients', 'How We Work Together': 'How',
        'Partnerships in Practice': 'Brokers', 'Strategic + Lifestyle Partners': 'Lifestyle', 'Preferred Vendors + Technology Partners': 'Vendors', 'Shared Vision': 'Vision',
        'The Value of Working Together': 'Value', 'Featured Projects': 'Projects', 'Our Approach Behind Every Project': 'Approach', 'Project Library': 'Library',
        'Begin Your Better Life': 'Inquiry', 'Contact Information': 'Studio', 'What Happens Next?': 'Next', 'Project Overview': 'Brief', 'Design Vision': 'Vision',
        'Project Gallery': 'Gallery', 'Behind the Design': 'Details', 'The Client Experience': None, 'The Integrated Wellness Process': 'Process'}
def rail_of(label):
    if label in RAIL: return RAIL[label]
    if re.match(r'Is CI .* Right for You\?', label): return 'Fit'
    if re.search(r'Process$', label): return 'Process'
    if re.match(r'Featured CI', label): return 'Projects'
    return label
def get(sec, kind): return [it for it in sec['items'] if it[0] == kind]
def label(sec):
    l = get(sec, 'label'); return l[0][1] if l else ''
def h_of(sec, tag='h2'):
    h = get(sec, tag); return h[0][1] if h else ''
def auto(pg, sec, picks=None, film=True, card_link=None, proc='film', n=4):
    lb = label(sec); r = rail_of(lb); h2 = h_of(sec); items = [it for it in sec['items'] if it[0] not in ('label', 'h2')]
    # a name (h4) with the paragraphs under it is a row
    it2 = []
    for it in items:
        if it[0] == 'h4': it2.append(['row', it[1], []])
        elif it2 and it2[-1][0] == 'row' and it[0] == 'p' and any(x[0] == 'h4' for x in items) and not it2[-1][2]: it2[-1][2].append(it[1])
        else: it2.append(it)
    items = it2
    rows = [it for it in items if it[0] == 'row']
    if not items and not h2: return
    if any(it[0] == 'a' and it[2].startswith('[Project') for it in items):
        a = [x for x in get(sec, 'a') if not x[2].startswith('[Project')]; pg.add(proj_cards(h2, picks, (a[0][2], 'portfolio.html') if a else None), r); return
    if len(items) == 1 and items[0][0] in ('p', 'quote') and items[0][1][0].startswith('“'):
        pg.add(quote_block(items[0][1][0])); return
    if rows:
        i0 = items.index(rows[0]); i1 = items.index(rows[-1])
        intro = [it[1] for it in items[:i0] if it[0] in ('p', 'lead')]; note = [it[1] for it in items[i1 + 1:] if it[0] in ('p', 'strong', 'lead')]
        has_d = any(r_[2] for r_ in rows)
        if has_d and proc == 'cells' and re.search(r'Process|What Happens Next|From Property', lb):
            pg.add(cells_block(h2, intro, [(r_[1], ' '.join(' '.join(p) for p in r_[2])) for r_ in rows], n, note[0] if note else None), r); return
        if has_d and film and proc == 'film' and re.search(r'Process|What Happens Next|From Property', lb):
            st = [(r_[1], ' '.join(' '.join(p) for p in r_[2])) for r_ in rows]
            pg.add(steps_film(h2, st, intro=blue(' '.join(intro[0]), intro[0] if len(intro[0]) > 1 else None) if intro else None,
                              outro='<span class="cb">%s</span>' % esc(nop(' '.join(note[0]))) if note else None), r); return
        pg.add(rows_block(h2, intro, [(r_[1], r_[2]) for r_ in rows], note[0] if note else None, descs=has_d), r); return
    ks = [it for it in items if it[0] == 'k']
    if ks:
        intro = [k for k in ks if len(k[1]) == 1]; lists = [k[1] for k in ks if len(k[1]) > 1]; note = [it[1][0] for it in items if it[0] == 'p']
        pg.add(cols_block(h2, intro[0][1][0] if intro else '', lists, note[0] if note else None), r); return
    pg.add(text_block(h2, items), r)
def final_cta(pg, sec, img, pos=None, to='contact.html', top=False, g=None):
    a = get(sec, 'a'); ps = [it[1] for it in sec['items'] if it[0] in ('p', 'lead')]
    pg.add(cta(h_of(sec), ps, (a[0][2], to) if a else ('Begin Your Better Life', to), img, pos, top, g), 'Contact')
def hero(sec):
    lb = get(sec, 'label'); kick = lb[0][1] if lb else ''
    if not kick:
        ps0 = [it for it in sec['items'] if it[0] == 'p']
    h1 = h_of(sec, 'h1'); ps = [it[1] for it in sec['items'] if it[0] in ('p', 'lead')]; a = get(sec, 'a')
    return h1, ps, (a[0][2], a[0][1]) if a else None

OUT = {}
# the rail holds eight chapters at most (it is cut at 1440 otherwise): the minor ones are passed without a mark
RAIL_SKIP = {'ci-wellness.html': {'Why', 'Design', 'One Team'}, 'partnerships.html': {'Model', 'How', 'Value'}, 'ci-turnkey.html': {'Experience'}, 'ci-curated.html': {'Included'}}
def emit(fname, title, pg, preload=None):
    rail = [(i, l) for i, l in pg.rail if l not in RAIL_SKIP.get(fname, ())]
    OUT[fname] = page(fname, title, pg.body(), rail, preload)
