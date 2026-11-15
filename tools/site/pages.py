# CI site — the pages. Run: python3 pages.py
import os
__file__ = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build.py')
exec(open(__file__).read())
A = 'assets/ph/'

def dots_fix(sec):
    """a paragraph of words separated by " · " becomes a row of words with squares between them"""
    for it in sec['items']:
        if it[0] in ('p', 'lead', 'k') and len(it[1]) == 1 and it[1][0].count(' · ') >= 3: it[0] = 'dots'; it[1] = [x.strip() for x in it[1][0].split(' · ')]
    return sec
def join_lists(sec):
    """several short pairs of lines read as one list"""
    out = [];
    for it in sec['items']:
        if it[0] == 'p' and len(it[1]) > 1 and out and out[-1][0] == 'p' and len(out[-1][1]) > 1: out[-1][1] = out[-1][1] + it[1]
        else: out.append(it)
    sec['items'] = out; return sec

# ================================================================== the four solutions
def solution(key, fname, name, scene, bnd, band_after, cta_img, picks, proc='film', st=True, pre=None):
    S = [join_lists(dots_fix(s)) for s in P[key]]; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(scene(label(S[0]), h1, ps), name.replace('CI ', ''), 'top')
    pg.add(intro(ps if st else ps[1:], (a[0], 'contact.html') if a else None, statement=st))
    for sec in S[1:-1]:
        if not sec['items']: continue
        lb = label(sec)
        if key == 'wellness' and lb == 'The Integrated Wellness Process':
            rows = get(sec, 'row'); intro_ = [it[1] for it in sec['items'] if it[0] in ('p', 'lead')]
            items = []
            for r in rows:
                ps_ = [' '.join(p) for p in r[2]]; half = (len(ps_) + 1) // 2
                items.append((r[1], [''.join('<p>%s</p>' % esc(nop(x)) for x in ps_[:half]), ''.join('<p>%s</p>' % esc(nop(x)) for x in ps_[half:])]))
            pg.add(acc_block(h_of(sec), blue(' '.join(intro_[0]), intro_[0]) if intro_ else None, items), rail_of(lb))
        elif key == 'wellness' and lb == 'Wellness Features + Systems':
            ps_ = [it[1] for it in sec['items'] if it[0] == 'p']; items = []
            for f in P['_feats']:
                fts = ['<div class="ft"><b>%s</b><p>%s</p></div>' % (esc(f[j]), esc(nop(f[j + 1]))) for j in range(1, len(f), 2)]; half = (len(fts) + 1) // 2
                items.append((f[0], [''.join(fts[:half]), ''.join(fts[half:])]))
            h3 = get(sec, 'h3')[0][1]; sp = ps_[2:]
            items.append((h3, ['<p>%s</p>' % esc(nop(' '.join(sp[0]))), ''.join('<p>%s</p>' % esc(nop(' '.join(x))) for x in sp[1:])]))
            pg.add(acc_block(h_of(sec), blue(' '.join(ps_[0] + ps_[1]), [ps_[0][0], ps_[1][0]]), items), rail_of(lb))
        else: auto(pg, sec, picks, proc=proc, n=4)
        if band_after == lb and bnd: pg.add(band(bnd))
    final_cta(pg, S[-1], cta_img)
    emit(fname, name, pg, pre)

SEG_CORE = open(os.path.join(HERE, 'seg_core.txt')).read().strip()
solution('turnkey', 'ci-turnkey.html', 'CI Turnkey',
         lambda k, h, ps: sc_track(k, h, ('From First Idea', 'to the First Night Home'), blue(' '.join(ps[0]), ps[0]), [A + 'of/plans_w.webp', A + 'of/materials.webp', A + 'ch/1450-01a.webp', A + 'ch/1450-32.webp']),
         A + 'ch/1450-20a.webp', 'What You Receive', A + 'ch/1450-29a.webp', ['1450-09a', '1511-09', '1430-11a'], proc='film', st=False)
solution('core', 'ci-core.html', 'CI Core', lambda k, h, ps: sc_draw(k, h, A + 'rtb/1430-04a.webp', SEG_CORE, 1.4214),
         A + 'of/plans_w.webp', 'What You Receive', A + 'ch/1450-04a.webp', ['1450-03a', '1511-08a', '1430-07'], proc='rows')
solution('curated', 'ci-curated.html', 'CI Curated', lambda k, h, ps: sc_triptych(k, h, [A + 'ch/1450-08a.webp', A + 'ch/1450-15.webp', A + 'ch/1450-18.webp']),
         A + 'ch/1450-23.webp', 'What You Receive', A + 'ch/1450-31.webp', ['1450-08a', '1530-06a', '1430-10a'], proc='cells')
solution('wellness', 'ci-wellness.html', 'CI Wellness', lambda k, h, ps: sc_dawn(k, h, A + 'ch/1450-25a.webp'),
         A + 'us/1511-01a.webp', 'Why Wellness Matters to CI', A + 'us/1511-06a.webp', None, pre=A + 'ch/1450-25a.webp')

# ================================================================== solutions (overview): the line becomes each of the four in turn
def solutions():
    S = P['services']; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(sc_columns(label(S[0]), h1, [('CI Turnkey', 'ci-turnkey.html', A + 'ch/1450-33.webp'), ('CI Core', 'ci-core.html', A + 'rtb/1430-05a.webp'), ('CI Curated', 'ci-curated.html', A + 'ch/1450-15.webp'), ('CI Wellness', 'ci-wellness.html', A + 'ch/1450-26.webp')]), 'Solutions', 'top')
    pg.add(intro(ps))
    N = 4; t0 = .3; d = 1.0
    o = ['<section class="film" data-fig="steps" data-n="4" data-t0="%s" data-d="%s" data-len="%.2f" data-emb="turnkey,core,curated,wellness" id="@ID@">' % (t0, d, t0 + N * d + .6), '  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">']
    for i, sec in enumerate(S[1:5]):
        T = t0 + i * d; last = i == N - 1
        k = '%.2f %.2f %s' % (T, T + .14, '99 99' if last else '%.2f %.2f' % (T + d - .12, T + d))
        k2 = '%.2f %.2f %s' % (T + .08, T + .26, '99 99' if last else '%.2f %.2f' % (T + d - .12, T + d))
        tag = label(sec); nm = h_of(sec); lead = get(sec, 'lead')[0][1][0]; ps_ = [it[1][0] for it in sec['items'] if it[0] == 'p']; a_ = get(sec, 'a')[0]
        o.append('      <p class="lab3 m p-tl" data-k="%s">%s</p>' % (k, esc(tag)))
        o.append('      <p class="t60 m p-al nb" data-k="%s">%s</p>' % (k, brk(nm, 22)))
        o.append('      <p class="t34 m p-um" data-k="%s" style="--w:430">%s</p>' % (k, esc(lead)))
        o.append('      <div class="t20s m p-ur" data-k="%s" style="--w:430">%s</div>' % (k2, ''.join('<p>%s</p>' % esc(nop(x)) for x in ps_)))
        o.append('      <div class="m p-bm" data-k="%s">%s</div>' % (k2, btn(a_[2], href(a_[1]))))
    o.append('    </div>\n  </div>\n</section>')
    pg.add('\n'.join(o), 'Four Ways')
    final_cta(pg, S[5], A + 'ch/1450-02a.webp')
    emit('solutions.html', 'Solutions', pg)
solutions()

# ================================================================== broker program
def brokers():
    S = [dots_fix(s) for s in P['brokers']]; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(sc_window(label(S[0]), h1, 'assets/night/tower.jpg', A + 'ch/1450-20a.webp'), 'Brokers', 'top')
    pg.add(intro(ps, (a[0], 'contact.html')))
    for sec in S[1:-1]:
        if not sec['items']: continue
        auto(pg, sec, proc='cells', n=5)
        if label(sec) == 'From Property to Finished Home': pg.add(band(A + 'us/1511-12a.webp'))
    final_cta(pg, S[-1], A + 'ch/1450-28a.webp', top=True)
    emit('broker-program.html', 'Broker Program', pg, 'assets/night/tower.jpg')
brokers()

# ================================================================== partnerships
def partners_block(sec):
    h2 = h_of(sec); items = [it for it in sec['items'] if it[0] not in ('label', 'h2')]
    intro = []; groups = []; cur = None; link = None
    for it in items:
        if it[0] == 'h3': cur = [it[1], []]; groups.append(cur)
        elif it[0] == 'a': link = it
        elif cur is None: intro.append(it)
        else: cur[1].append(it)
    o = []
    if intro:
        o.append('    <p class="t34 rv c1" style="--w:900">%s</p>' % blue(' '.join(intro[0][1])))
        if len(intro) > 1: o.append(p20([x[1] for x in intro[1:]], 'c2 g50'))
    rows = []; n = 0
    for nm, its in groups:
        if nm.startswith('From the Property'):   # a sub-heading with its own lead-in, not a partner
            ps_ = [x for x in its if x[0] == 'p']; st = [x for x in its if x[0] == 'strong']
            o.append('    <p class="t34 rv c1" style="--w:900">%s</p>' % blue(nm + '. ' + ' '.join(ps_[0][1]), [nm, ' '.join(ps_[0][1])]))
            o.append(p20([x[1] for x in ps_[1:]], 'c2 g50'))
            for s_ in st: o.append(closer(s_[1]))
            continue
        n += 1
        d = ''.join('<p>%s</p>' % esc(nop(' '.join(x[1]))) for x in its if x[0] == 'p') + ''.join('<span class="cl">%s</span>' % esc(nop(' '.join(x[1]))) for x in its if x[0] == 'strong')
        rows.append('<div class="rw d rv"><span class="n">%02d</span><span class="t">%s</span><div class="dsc">%s</div></div>' % (n, esc(nm), d))
    o.append('    <div class="rws">\n      ' + '\n      '.join(rows) + '\n    </div>')
    if h2 == 'Broker Partnerships': o.append('    <div class="dots rv c1"><span>Property</span><i></i><span>Possibility</span><i></i><span>Home</span></div>')
    if link: o.append('    <div class="rv c1">%s</div>' % btn(link[2], href(link[1])))
    return bk(h2, '\n'.join(o))
def partnerships():
    S = [join_lists(dots_fix(s)) for s in P['partnerships']]; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(sc_strips(label(S[0]), h1, A + 'us/1511-07a.webp'), 'Partners', 'top')
    pg.add(intro(ps))
    for sec in S[1:-1]:
        lb = label(sec)
        if lb in ('Partnerships in Practice', 'Strategic + Lifestyle Partners', 'Preferred Vendors + Technology Partners'): pg.add(partners_block(sec), rail_of(lb))
        else: auto(pg, sec)
        if lb == 'Preferred Vendors + Technology Partners': pg.add(band(A + 'ch/1450-22.webp'))
    final_cta(pg, S[-1], A + 'ch/1450-06.webp')
    emit('partnerships.html', 'Partnerships', pg, A + 'us/1511-07a.webp')
partnerships()

# ================================================================== portfolio + projects
def pf_card(p, tall=False):
    if 'slug' in p: return '<a class="cd rv%s" href="%s.html"><span class="im"><img src="%s" alt="%s" loading="lazy"></span><span class="nm h5r">%s</span><span class="lc lab3">%s <span style="color:var(--blue)">■</span> %s</span></a>' % (
        ' tall' if tall else '', p['slug'], ph(p['set'], p['tall'] if tall else p['card']), p['name'], p['name'], p['loc'], p['bld'])
    return '<div class="cd rv"><span class="im"><img src="%s" alt="%s" loading="lazy"></span><span class="nm h5r">%s</span><span class="lc lab3">%s <span style="color:var(--blue)">■</span> %s</span></div>' % (p['img'], p['name'], p['name'], p['loc'], p['bld'])
def sq_line(parts):
    """one line of small caps, its parts set apart by blue squares (her caption of 15.11). The square is drawn before each part and the line's left
    edge is clipped by its width, so a line never begins or ends with a square, however it wraps"""
    return '<span class="lc lab3 sqm">%s</span>' % ''.join('<span>%s</span>' % esc(x) for x in parts if x)
def pf6_card(name, parts, img, href=None, big=False, ext=False, pos=None):
    """a card of the Signature grid (her frame «04 Signature CI Residences · 2», 15.11): the photograph, the name 20 under it,
    and one line of small caps under the name — its parts separated by blue squares"""
    st = ' style="object-position:%s"' % pos if pos else ''
    inner = '<span class="im"><img src="%s" alt="%s" loading="lazy"%s%s></span><span class="nm h5r">%s</span>%s' % (
        img, name, st, ' onerror="this.remove()"' if ext else '', esc(name), sq_line(parts))
    cls = 'cd rv' + (' big' if big else '')
    if href: return '<a class="%s" href="%s"%s>%s</a>' % (cls, href, ' target="_blank" rel="noopener"' if href.startswith('http') else '', inner)
    return '<div class="%s">%s</div>' % (cls, inner)
def portfolio():
    S = P['portfolio']; pg = Pg()
    h1, ps, a = hero(S[0])
    # THE ONE EXCEPTION to "the client's copy word for word" (her decision, 15.11.2026 18:15: «В цьому випадку одному ми зробимо виключення.
    # Перепиши текст такий, як у макеті»): the cover's title is the designer's, as in her frame «01 Cover · 1» of the Portfolio export.
    # The client's title (2nd round) stays in content.json: «Homes as Unique as the People Who Live in Them». verify.py lists it as an exception.
    h1 = 'Homes Made for Unique Lives'
    pg.add(sc_letters(label(S[0]), h1, A + 'rtb/1430-08a.webp', lines=['Homes', 'Made', 'for Unique', 'Lives'], place='cc'), 'Portfolio', 'top')
    pg.add(intro(ps))
    # Signature CI Residences — her grid, exactly as her frame «04 Signature CI Residences · 2» (15.11 18:29; 19:28: «на макеті там немає чотирьох
    # маленьких, тільки дві вгорі. Зроби так, як на макеті»): four columns across the whole container (fields 50, gutters 48); a block is ONE LARGE card
    # (two columns, 886 : 1112) and TWO SMALL ones (419 : 525) at the top beside it — nothing under the small ones; the next block is its mirror.
    # All the projects of the library: nine = three blocks (large left, large right, large left). The large cards are the three projects with our own
    # photographs. Where there is no photograph of ours, the picture is the client's own, loaded from their site.
    EXT = 'https://cidesignbuild.com/portfolio-item/'; UP = 'https://cidesignbuild.com/wp-content/uploads/'
    ch_, us_, rtb_ = PROJ[0], PROJ[1], PROJ[2]; sup_, grant_ = PROJ_MORE[0], PROJ_MORE[1]
    def parts(p): return p['loc'].split(' · ') + [p['bld']]
    # name, location, building, size, link, tags, picture
    LIB = [('Collectors Home', 'Streeterville · Chicago', 'One Bennett Park', '5,130 sq ft', 'collectors-home.html', 'chicago ci-turnkey', ph(ch_['set'], ch_['tall'])),
           ('444 W Grant', 'Lincoln Park · Chicago', 'Residence', '', None, 'chicago', grant_['img']),
           ('500 W Superior', 'River North · Chicago', 'Residence', '', None, 'chicago', sup_['img']),
           ('Above the Park', 'Lincoln Park · Chicago', 'Residence', '5,600 sq ft', EXT + 'above-the-park/', 'chicago ci-turnkey', UP + '2026/03/2107-Kenmore-rev_02-copy-1536x1043.jpg'),
           ('Lakeshore Luxury', 'Wilmette · North Shore', 'Residence', '2,200 sq ft', EXT + 'lakeshore-luxury/', 'ci-turnkey', UP + '2024/03/1618-Sheridan_03rev-1-1536x1002.jpg'),
           ('Urban Sanctuary', 'Gold Coast · Chicago', '900 North Michigan', '', 'urban-sanctuary.html', 'chicago', ph(us_['set'], us_['tall'])),
           ('Room To Breathe', 'Lincoln Park · Chicago', 'Residence', '4,070 sq ft', 'room-to-breathe.html', 'chicago ci-turnkey', ph(rtb_['set'], rtb_['tall'])),
           ('Contemporary Comfort', 'River North · Chicago', 'Condominium', '3,352 sq ft', EXT + 'contemporary-comfort-condo/', 'chicago ci-turnkey', UP + '2023/10/201-Grand_001-v2-1536x1200.jpg'),
           ('Sky-High Condo', 'Chicago', 'High-rise condominium', '2,022 sq ft', EXT + 'sky-highcondo/', 'chicago ci-turnkey', UP + '2023/01/401-Wabash_002_v2-1536x1026.jpg')]
    BIG = {'Collectors Home', 'Urban Sanctuary', 'Room To Breathe'}
    assert len(LIB) == 9 and [nm in BIG for nm, *_ in LIB] == [True, False, False, False, False, True, True, False, False]
    cards = [pf6_card(nm, lc.split(' · ') + [bd], im, hr, big=nm in BIG, ext=im.startswith('http')) for nm, lc, bd, sz, hr, tg, im in LIB]
    pg.add(bk(h_of(S[1]), '    <div class="pf6">%s</div>' % ''.join(cards), hcls=' l0', lines=['Signature', 'CI Residences']), 'Projects')
    # Every Home Unique — her notes of 15.11: 18:45 («дуже одноманітно: там лінії, там лінії») and 18:59 («не просто забрати лінії… думай метафорично»).
    # The block is a figure, not a list (film "life" in inner.js): at the centre a life — a closed line that is never the same twice; around it six
    # contours of the one pen, a step of the process each, named on the line itself; the innermost is the life (Discover deeply), the outermost is
    # the home (Deliver completely). The home changes with the life, the six steps stay — «Every Home Unique. One CI Standard». The scene follows her
    # corner principle: the figure in the middle, the title top left (under the logo), the text bottom right in the running 20; at the end the closing
    # thought takes the text's place. The steps stand in the page as a list for readers that do not draw (and for the copy check).
    sec = S[2]; rows = get(sec, 'row'); ps_ = [it[1][0] for it in sec['items'] if it[0] == 'p']; out = get(sec, 'lead')
    assert nop(h_of(sec)) == 'Every Home Unique. One CI Standard', h_of(sec)
    assert nop(ps_[0]) == 'Every residence speaks its own architectural language, because every client lives differently', ps_[0]
    cl = nop(out[0][1][0]); assert cl == 'The result feels effortless, as if your home could only ever have been yours', cl
    st6 = [nop(r[1]) for r in rows]; assert len(st6) == 6 and all(len(x.split(' ')) == 2 for x in st6), st6
    lead = '%s<br class="bd"> %s<br class="bd"> <span class="cb">%s</span>' % (esc('Every residence speaks its own architectural language,'), esc('because every client lives differently.'), esc(nop(ps_[1])))
    pg.add('<section class="film" data-fig="life" data-len="4" id="@ID@">\n  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">\n'
           '      <h2 class="t60 m p-ctl" data-k="-1 -.5 99 99">Every Home Unique.<br>One CI Standard</h2>\n'
           '      <p class="t20 m p-cbr" data-k="-1 -.5 2.85 3.0">%s</p>\n'
           '      <p class="t34 m p-cbr" data-k="3.05 3.35 99 99">The result feels effortless,<br class="bd"> <span class="cb">as if your home could only<br class="bd"> ever have been yours</span></p>\n'
           '      <ol class="vh" data-life>%s</ol>\n    </div>\n  </div>\n</section>' % (lead, ''.join('<li>%s</li>' % esc(x) for x in st6)), 'Approach')
    # Explore the Work — the library as an index on the same four columns, no rules: the title in the first column; in the other three the filters and,
    # under them, the nine projects three to a row — a name and its small caps, as under the photographs
    chips = ['All Projects', 'CI Core', 'CI Curated', 'CI Turnkey', 'Wellness', 'Chicago', 'South Florida']
    ch = ''.join('<button class="chip%s" type="button" data-f="%s">%s</button>' % (' on' if i == 0 else '', 'all' if i == 0 else slug(c), c) for i, c in enumerate(chips))
    ORDER = ['Collectors Home', 'Urban Sanctuary', 'Room To Breathe', '500 W Superior', '444 W Grant', 'Above the Park', 'Lakeshore Luxury', 'Contemporary Comfort', 'Sky-High Condo']
    byn = {x[0]: x for x in LIB}; assert sorted(ORDER) == sorted(byn)
    rows_ = ''.join('<a %s data-tags="%s"><span class="nm h5r"><span>%s</span></span>%s</a>' % (
        ('href="%s" target="_blank" rel="noopener"' % hr if hr and hr.startswith('http') else 'href="%s"' % hr) if hr else 'href="#" data-noop', tg, esc(nm), sq_line(lc.split(' · ')) + sq_line([bd, sz]))
        for nm, lc, bd, sz, hr, tg, im in [byn[n] for n in ORDER])
    assert nop(h_of(S[3])) == 'Explore the Work', h_of(S[3])
    pg.add('<section class="bk" id="@ID@">\n  <div class="lib4">\n    <h2 class="t60 rv">Explore<br>the Work</h2>\n    <div class="lib-r">\n      <div class="chips rv" data-filter="lib">%s</div>\n'
           '      <div class="ix3 rv" id="lib">%s<p class="none lab3"><span class="ph">[Projects for this filter are to be assigned by CI]</span></p></div>\n    </div>\n  </div>\n</section>' % (ch, rows_), 'Library')
    # the closing block as her frame «09 CTA» (15.11 18:42)
    fs = S[4]; fa = get(fs, 'a'); fps = [it[1][0] for it in fs['items'] if it[0] in ('p', 'lead')]
    assert nop(h_of(fs)) == 'Turn Inspiration Into Something Entirely Your Own' and len(fps) == 2, (h_of(fs), fps)
    assert fps[0] == 'Inspiration is where it starts. Your life is what shapes it.' and fps[1] == 'Every CI home begins with a conversation about you: how you live, and how you want to live next.', fps
    pg.add(cta_grid(['Turn', 'Inspiration', 'Into', 'Something', 'Entirely', 'Your Own'],
                    [['Inspiration is where it starts.', 'Your life is what shapes it.'], ['Every CI home begins with a', 'conversation about you: how you live,', 'and how you want to live next.']],
                    (fa[0][2], 'contact.html') if fa else ('Begin Your Better Life', 'contact.html'), A + 'rtb/1430-13.webp'), 'Contact')
    emit('portfolio.html', 'Portfolio', pg, A + 'rtb/1430-08a.webp')
portfolio()

def project(p, nxt):
    S = P['project']; pg = Pg(); nm = p['name']
    def sub(t): return t.replace('[Project Name]', nm)
    cov = ph(p['set'], p['cover'])
    pg.add(sc_curtain(p['loc'], nm, cov, p.get('g', .72)), 'Project', 'top')
    pg.add(intro([get(S[0], 'lead')[0][1]]))
    # the brief
    sec = S[1]; dl = get(sec, 'dl')[0][1]; known = {'Residence': p['bld'] + ' · ' + p['loc']}; known.update(p.get('facts', {}))
    if 'Size' in known: dl = [dl[0], dl[1], ['Size', ['']]] + dl[2:]
    rows = ''.join('<div class="rv"><dt>%s</dt><dd>%s</dd></div>' % (esc(k), esc(known.get(k, ' '.join(v)))) for k, v in dl)
    goal = get(sec, 'h3')[0][1]; gp = [it[1][0] for it in sec['items'] if it[0] == 'p']
    pg.add(bk(h_of(sec), '    <dl class="dlt">%s</dl>\n    <div class="g2">\n      <p class="t34 rv" style="--w:430">%s</p>\n      <div class="t20s rv" style="--w:475">%s</div>\n    </div>' % (rows, esc(goal), ''.join('<p>%s</p>' % esc(x) for x in gp))), 'Brief')
    # design vision
    sec = S[2]; ps_ = [it[1] for it in sec['items'] if it[0] in ('p', 'lead')]
    pg.add(text_block(h_of(sec), [['p', x] for x in ps_]), 'Vision')
    # gallery: wide pictures whole, tall ones in pairs
    g = ''.join('<div class="gr %s rv">%s</div>' % (k, ''.join('<figure><img src="%s" alt="%s" loading="lazy"></figure>' % (ph(p['set'], f), nm) for f in fs)) for k, fs in p['gal'])
    pg.add(bk(sub(h_of(S[3])).replace('[', '').replace(']', ''), '    <div class="gal">%s</div>' % g), 'Gallery')
    # behind the design: the client's template, its guidance kept as placeholders
    sec = S[4]; rows = get(sec, 'row'); ld = get(sec, 'lead')
    r = ''.join('<div class="rw d rv"><span class="n">%02d</span><span class="t">%s</span><div class="dsc"><p><span class="ph">[%s]</span></p></div></div>' % (i + 1, esc(x[1]), esc(' '.join(x[2][0]))) for i, x in enumerate(rows))
    pg.add(bk(h_of(sec), '    <div class="rws">%s</div>\n%s' % (r, closer(ld[0][1]) if ld else '')), 'Details')
    q = get(S[5], 'quote'); w = [it for it in S[5]['items'] if it[0] == 'p']
    pg.add(quote_block(q[0][1][0], w[0][1][0] if w else None))
    # the next project
    pg.add('<section class="bk" id="@ID@">\n  <div class="lst rv"><a href="%s.html"><span class="n">Next project</span><span class="t">%s</span><span class="c">%s</span><span class="c">%s</span></a></div>\n</section>' % (nxt['slug'], nxt['name'], nxt['loc'], nxt['bld']))
    final_cta(pg, S[6], ph(p['set'], p['cta']), top=p.get('top', False))
    emit(p['slug'] + '.html', nm, pg, cov)
for i, p in enumerate(PROJ): project(p, PROJ[(i + 1) % len(PROJ)])

# ================================================================== news + article
def news():
    S = P['news']; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add('<section class="bk hd0" id="@ID@">\n  <p class="lab3 rv c1">%s</p>\n  <h1 class="t111 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <div class="bk-b">\n%s\n%s\n  </div>\n</section>' % (esc(label(S[0])), brk(h1, 20), lead_p(ps[0], w=1240), p20(ps[1:], 'c2')), 'News', 'top')
    chips = ['All CI News', 'Projects', 'Perspectives', 'Partnerships', 'Press', 'CI News']
    ch = ''.join('<button class="chip%s" type="button" data-f="%s">%s</button>' % (' on' if i == 0 else '', 'all' if i == 0 else slug(c), c) for i, c in enumerate(chips))
    rows = ''.join('<a href="article.html" data-tags=""><span class="n">%02d</span><span class="t"><span class="ph">[Article Headline]</span></span><span class="c"><span class="ph">[Category]</span></span><span class="c"><span class="ph">[Date]</span></span></a>' % (i + 1) for i in range(6))
    sec = S[1]; lead = get(sec, 'lead')[0][1][0]; more = get(sec, 'a')[0][2]
    body = '    <p class="t34 rv c1" style="--w:900">%s</p>\n    <div class="chips rv c1 g50" data-filter="nl">%s</div>\n    <div class="lst rv g50" id="nl">%s<p class="none lab3"><span class="ph">[Articles in this category will appear here]</span></p></div>\n    <div class="rv c1">%s</div>' % (blue(lead), ch, rows, btn(more, '#').replace('href="#"', 'href="#" data-noop'))
    pg.add(bk(h_of(sec), body), 'All News')
    emit('news.html', 'News', pg)
news()
def article():
    S = P['article']; pg = Pg()
    sec = S[1]; ks = [it[1][0] for it in sec['items'] if it[0] == 'k']
    head = '<section class="bk hd0" id="@ID@">\n  <p class="lab3 rv c1 mt3"><a href="news.html">← News</a><span style="color:var(--blue)">■</span><span class="ph">[Category]</span><span style="color:var(--blue)">■</span><span class="ph">[Date]</span></p>\n  <h1 class="t60 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <p class="t34 rv c1" style="--w:900;margin-top:calc(50 * var(--u))">%s</p>\n</section>' % (esc(h_of(S[0], 'h1')), esc(get(S[0], 'lead')[0][1][0]))
    pg.add(head, 'Article', 'top')
    body = []
    for it in sec['items']:
        if it[0] == 'p': body.append('<div class="t20s rv"><p>%s</p></div>' % esc(it[1][0]))
        elif it[0] == 'h3': body.append('<p class="h5r rv" style="margin-top:calc(100 * var(--u))">%s</p>' % esc(it[1]))
        elif it[0] == 'lead': body.append('<p class="t34 rv">%s</p>' % esc(it[1][0]))
    meta = '<p class="lab3 rv mt3">%s</p>' % '<span style="color:var(--blue)">■</span>'.join('<span>%s</span>' % esc(x) for x in ks[:3])
    share = ks[3].split(' · ')
    sh = '<p class="lab3 rv mt3" style="margin-top:calc(100 * var(--u))"><span>%s</span>%s</p>' % (esc(share[0]), ''.join('<a href="#" data-noop>%s</a>' % esc(x) for x in share[1:]))
    pg.add('<section class="bk" id="@ID@">\n  <div class="art">%s%s%s</div>\n</section>' % (meta, ''.join(body), sh))
    sec = S[3]; a = get(sec, 'a')[0]
    rows = ''.join('<a href="article.html"><span class="n">%02d</span><span class="t"><span class="ph">[Article Headline]</span></span><span class="c"><span class="ph">[Category]</span></span><span class="c"><span class="ph">[Date]</span></span></a>' % (i + 1) for i in range(3))
    pg.add(bk(h_of(sec), '    <div class="lst rv">%s</div>\n    <div class="rv c1">%s</div>' % (rows, btn(a[2], 'news.html'))), 'More')
    final_cta(pg, S[4], A + 'ch/1450-32.webp', g=.55)
    emit('article.html', 'Article', pg)
article()

# ================================================================== contact
FORM = [('Name', 'text', 'name', True), ('Email', 'email', 'email', True), ('Phone', 'tel', 'phone', False), ('Primary Residence / Project Location', 'text', 'location', False),
        ('Property Status', ['I own the property', 'Under contract', 'Considering a property', 'Searching']),
        ('Project Type', ['Full-home renovation', 'Partial renovation', 'New residence', 'Furnishing a completed home', 'Wellness integration']),
        ('CI Service of Interest', ['CI Turnkey', 'CI Core', 'CI Curated', 'CI Wellness (add-on)', 'Not sure yet']),
        ('Target Timeline', ['As soon as possible', 'Within 3 months', '3–6 months', '6–12 months', 'Not sure yet']),
        ('How Did You Hear About CI?', ['Referral', 'Broker / Real estate agent', 'Instagram', 'Google search', 'Press / Media', 'Other']),
        ('Tell Us About Your Project', 'area', 'project', False)]
def contact():
    S = P['contact']; pg = Pg()
    h1, ps, a = hero(S[0])
    # here the opening does go into the line: the line becomes a voice — every CI home begins with a conversation
    pg.add(cover(label(S[0]), h1, ps, A + 'of/lounge_w.webp', (a[0], 'contact.html'), 'voice'), 'Contact', 'top')
    sec = S[1]; ps_ = [it[1][0] for it in sec['items'] if it[0] == 'p']
    body = '    <p class="t34 rv c1" style="--w:1000">%s</p>\n    <div class="g2">\n      <div class="rv"><a class="r3btn" href="contact.html" data-form><span class="t">%s</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></a></div>\n      <div class="t20s rv" style="--w:475"><p>%s</p><p>%s</p></div>\n    </div>' % (
        blue(ps_[0]), '<br>'.join(esc(x) for x in ['Submit', 'Project Inquiry']), esc(nop(ps_[1])), esc(nop(ps_[2])))
    pg.add(bk(h_of(sec), body), 'Inquiry', 'inquiry')
    dl = get(sec, 'dl')[0][1]; rows = ''
    for k, v in dl:
        if k == 'Social': val = ' <span style="color:var(--blue)">■</span> '.join('<a href="#" data-noop>%s</a>' % esc(x) for x in v[0].split(' · '))
        elif k == 'Phone': val = '<a href="tel:+1%s">%s</a>' % (re.sub(r'\D', '', v[0]), esc(v[0]))
        else: val = '<br>'.join(esc(x) for x in v)
        rows += '<div class="rv"><dt>%s</dt><dd>%s</dd></div>' % (esc(k), val)
    pg.add(bk(get(sec, 'h3')[0][1], '    <dl class="dlt">%s</dl>' % rows), 'Studio')
    pg.add(band(A + 'of/team.webp', '50% 0%', g=.86))
    auto(pg, S[2], proc='cells', n=4)
    final_cta(pg, S[3], A + 'ch/1450-24.webp', None, 'contact.html')
    emit('contact.html', 'Contact', pg, A + 'of/lounge_w.webp')
contact()

# ================================================================== faq — the homepage's questions and answers, as they stand there
def faq():
    a = INDEX.index('id="faqList"'); b = INDEX.index('</section>', a); blk = INDEX[a:b]
    title = re.search(r'<h2 class="ch-title one">(.*?)</h2>', INDEX[INDEX.rfind('<section', 0, a):a], re.S).group(1)
    qa = re.findall(r'<span class="t">(.*?)</span>.*?<div class="ain">(.*?)</div></div></div></div>', blk, re.S)
    items = []
    for q, an in qa:
        ps_ = re.findall(r'<p class="p">(.*?)</p>', an, re.S)
        items.append((html.unescape(q), ['<p>%s</p>' % x for x in ps_[:1]] + (['<p>%s</p>' % x for x in ps_[1:]] if len(ps_) > 1 else [''])))
    pg = Pg()
    r = []
    for i, (q, cols) in enumerate(items):
        r.append('<div class="qa rv%s"><button class="qh" type="button" aria-expanded="%s"><span class="n">%02d</span><span class="t">%s</span><span class="pl"></span></button><div class="ab"><div><div class="ain">%s</div></div></div></div>' % (
            ' open' if i == 0 else '', 'true' if i == 0 else 'false', i + 1, html.escape(q, quote=False), ''.join('<div>%s</div>' % c for c in cols)))
    pg.add('<section class="bk hd0" id="@ID@">\n  <p class="lab3 rv c1">FAQ</p>\n  <h1 class="t60 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <div class="bk-b">\n    <div class="rws">\n      %s\n    </div>\n  </div>\n</section>' % (title, '\n      '.join(r)), 'FAQ', 'top')
    pg.add(cta('Your Next Chapter Starts With a Conversation', [], ('Begin Your Better Life', 'contact.html'), A + 'ch/1450-29a.webp'), 'Contact')
    emit('faq.html', 'FAQ', pg)
    return len(items)
nq = faq()

print('\n'.join('%-24s %6d bytes' % (k, v) for k, v in OUT.items())); print('faq items', nq)
