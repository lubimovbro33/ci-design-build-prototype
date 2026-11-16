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
    if 'slug' in p: return '<a class="cd rv%s" href="%s.html"><span class="im"><img src="%s" alt="%s" loading="lazy"></span><span class="nm h5r">%s</span><span class="lc lab3">%s</span></a>' % (
        ' tall' if tall else '', p['slug'], ph(p['set'], p['tall'] if tall else p['card']), p['name'], p['name'], sqr(p['loc'].split(' · ') + [p['bld']]))
    return '<div class="cd rv"><span class="im"><img src="%s" alt="%s" loading="lazy"></span><span class="nm h5r">%s</span><span class="lc lab3">%s</span></div>' % (p['img'], p['name'], p['name'], sqr(p['loc'].split(' · ') + [p['bld']]))
def sq_line(parts):
    """one line of small caps, its parts set apart by blue squares (her caption of 15.11). The square is drawn before each part and the line's left
    edge is clipped by its width, so a line never begins or ends with a square, however it wraps"""
    return '<span class="lc lab3 sqm">%s</span>' % ''.join('<span>%s</span>' % esc(x) for x in parts if x)
def pf6_card(name, parts, img, href=None, big=False, ext=False, pos=None, cell=None):
    """a card of the Signature grid (her frame «04 Signature CI Residences · 2», 15.11): the photograph, the name 20 under it,
    and one line of small caps under the name — its parts separated by blue squares"""
    st = ' style="object-position:%s"' % pos if pos else ''
    inner = '<span class="im"><img src="%s" alt="%s" loading="lazy"%s%s></span><span class="nm h5r">%s</span>%s' % (
        img, name, st, ' onerror="this.remove()"' if ext else '', esc(name), sq_line(parts))
    cls = 'cd rv' + (' big' if big else '') + ('" style="--c:%d;--r:%d' % cell if cell else '')   # cell = (column, row) on the reference grid (.pf7)
    if href: return '<a class="%s" href="%s"%s>%s</a>' % (cls, href, ' target="_blank" rel="noopener"' if href.startswith('http') else '', inner)
    return '<div class="%s">%s</div>' % (cls, inner)
def portfolio():
    S = P['portfolio']; pg = Pg()
    h1, ps, a = hero(S[0])
    # THE ONE EXCEPTION to "the client's copy word for word" (her decision, 15.11.2026 18:15: «В цьому випадку одному ми зробимо виключення.
    # Перепиши текст такий, як у макеті»): the cover's title is the designer's, as in her frame «01 Cover · 1» of the Portfolio export.
    # The client's title (2nd round) stays in content.json: «Homes as Unique as the People Who Live in Them». verify.py lists it as an exception.
    h1 = 'Homes Made for Unique Lives'
    pg.add(sc_letters(label(S[0]), h1, A + 'rtb/1430-08a.webp', lines=['Homes', 'Made', 'for Unique', 'Lives'], place='cc', zoom=True), 'Portfolio', 'top')
    # The page's first thought — her frame of 15.11 21:09 (drawn in a spare frame of her working page, `529:907`): a screen of its own, the content in
    # the middle of its height. A small line on the left field (an eyebrow), the thought large from 600 — 60 / 52 in sentence case, the first clause
    # light, the rest blue, in her four lines — and 90 under it the second sentence in the running 20, in her three lines.
    # THE EYEBROW IS NOT THE CLIENT'S COPY: her frame holds a leftover («The traditional»); until she names one, it reads «A True Reflection» —
    # the client's own words from the sentence below.
    tx = [nop(' '.join(x) if isinstance(x, (list, tuple)) else x) for x in ps]
    assert tx == ['Every CI home begins with you: your routines, your collections, your ambitions, your way of living',
                  'Explore residences brought to life through one integrated team, each a true reflection of the people who call it home'], tx
    pg.add('<section class="iv" id="@ID@">\n  <div class="iv-c">\n    <p class="iv-k rv">A True Reflection</p>\n'
           '    <p class="t60s rv">Every CI home begins<br class="bd"> with you: <span class="cb">your routines, your<br class="bd"> collections, your ambitions,<br class="bd"> your way of living</span></p>\n'
           '    <p class="t20 rv iv-p">Explore residences brought to life through<br class="bd"> one integrated team, each a true reflection of<br class="bd"> the people who call it home</p>\n  </div>\n</section>')
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
    # The grid after her reference of 16.11 12:42 (a studio's «Our projects» page; «взяти точно таку сітку»): four columns, near-square tiles one
    # column wide, a large landscape tile two columns wide, and cells left empty on purpose —
    #   row 1:  S  ·  [ B ]        row 2:  S  S  ·  S        row 3:  ·  ·  S  S
    # The reference shows seven tiles; we have nine, so a fourth row repeats the first one mirrored:  [ B ]  ·  S.
    # CELL = name → (column, row, large). The order below is the order on phones (the lead project first).
    CELL = [('Collectors Home', 3, 1, True), ('444 W Grant', 1, 1, False), ('500 W Superior', 1, 2, False), ('Above the Park', 2, 2, False), ('Urban Sanctuary', 4, 2, False),
            ('Lakeshore Luxury', 3, 3, False), ('Contemporary Comfort', 4, 3, False), ('Room To Breathe', 1, 4, True), ('Sky-High Condo', 4, 4, False)]
    by = dict((x[0], x) for x in LIB); wide = {'Collectors Home': ph(ch_['set'], ch_['card']), 'Room To Breathe': ph(rtb_['set'], rtb_['card'])}   # a large tile is landscape
    assert len(LIB) == 9 and sorted(by) == sorted(c[0] for c in CELL)
    cards = []
    for nm, c, r, big in CELL:
        _, lc, bd, sz, hr, tg, im = by[nm]; im = wide.get(nm, im) if big else im
        cards.append(pf6_card(nm, lc.split(' · ') + [bd], im, hr, big=big, ext=im.startswith('http'), cell=(c, r)))
    pg.add(bk(h_of(S[1]), '    <div class="pf7">%s</div>' % ''.join(cards), hcls=' l0', lines=['Signature', 'CI Residences']), 'Projects')
    # Every Home Unique — her notes of 15.11: 18:45 («дуже одноманітно: там лінії, там лінії»), 18:59 («не просто забрати лінії… думай метафорично»),
    # 19:54 (the abstract contours: «я не зрозуміла суть… Перероби»), and her choice at 20:00 between two sketches: THE KEY (film "key" in inner.js).
    # One blank — the CI standard; six cuts — the six steps, a name under each; how deep each cut goes is the home's own, no two keys alike. The scene
    # is set on the centre (her word of 15.11 20:11: «давай зробимо центральну виключку. Зроби заголовок і текст оцей по центру екрана»): the title
    # centred at the top, the key in the middle, the text centred at the foot in the running 20; at the end the closing thought takes the text's place.
    # The title stands in two lines, by sense (three lines — Every Home / Unique. One / CI Standard — were tried on her word at 20:27 and rejected at 20:32). The steps stand in the page as a list for readers that do not draw (and for the copy check).
    sec = S[2]; rows = get(sec, 'row'); ps_ = [it[1][0] for it in sec['items'] if it[0] == 'p']; out = get(sec, 'lead')
    assert nop(h_of(sec)) == 'Every Home Unique. One CI Standard', h_of(sec)
    assert nop(ps_[0]) == 'Every residence speaks its own architectural language, because every client lives differently', ps_[0]
    cl = nop(out[0][1][0]); assert cl == 'The result feels effortless, as if your home could only ever have been yours', cl
    st6 = [nop(r[1]) for r in rows]; assert len(st6) == 6 and all(len(x.split(' ')) == 2 for x in st6), st6
    # 16.11 18:27: a centred block is broken for rhythm (line lengths alternate: 196 / 329 / 226 / 289 in the real face), not sentence by sentence
    lead = '<br class="bd"> '.join([esc('Every residence speaks'), esc('its own architectural language, because'), esc('every client lives differently.'), '<span class="cb">%s</span>' % esc(nop(ps_[1]))])
    pg.add('<section class="film" data-fig="key" data-len="4" id="@ID@">\n  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">\n'
           '      <h2 class="t60 m p-ct" data-k="-1 -.5 99 99">Every Home Unique.<br>One CI Standard</h2>\n'
           '      <p class="t20 m p-cb" data-k="-1 -.5 2.85 3.0">%s</p>\n'
           '      <p class="t34 m p-cb" data-k="3.05 3.35 99 99">The result feels effortless,<br class="bd"> <span class="cb">as if your home could only<br class="bd"> ever have been yours</span></p>\n'
           '      <ol class="vh" data-steps>%s</ol>\n    </div>\n  </div>\n</section>' % (lead, ''.join('<li>%s</li>' % esc(x) for x in st6)), 'Approach')
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
    # the closing block: one composition for the whole site now (cta() in build.py); the words and her title column are hers
    fs = S[4]; fa = get(fs, 'a'); fps = [it[1][0] for it in fs['items'] if it[0] in ('p', 'lead')]
    assert nop(h_of(fs)) == 'Turn Inspiration Into Something Entirely Your Own' and len(fps) == 2, (h_of(fs), fps)
    final_cta(pg, fs, A + 'rtb/1430-13.webp')
    emit('portfolio.html', 'Portfolio', pg, A + 'rtb/1430-08a.webp')
portfolio()

def project_old(p, nxt):
    """the project page as it was before 15.11 21:29 (the client's template, plainly): still used by the projects whose own idea is not drawn yet"""
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

def project_collection(p, nxt):
    """«Collectors Home». The page's composition follows her reference of 16.11 13:04 (a developer's project page: «взяти як приклад по композиції,
    по сітці, по розстановці контенту… як бреф заповнено… не копіювати»), set on our black ground, in our type and on our four columns:
    - cover: the photograph lights up pane by pane (kept: she liked it), the name bottom left; NOTHING is transformed — the page simply scrolls on
      (every passage that turned the cover into a small picture was refused on 15.11);
    - a thin vertical line — the spine — runs down the page in the gap before the second column; the first column holds only the blocks' small
      names; everything else hangs to the right of the spine;
    - overview: The Goal as one large paragraph with its small name set into the first line's indent, then The Brief as a compact table with rules:
      the fact's name at the spine, its value from the third column;
    - Design Vision: the concept as a heading at the spine, its paragraphs small in the fourth column;
    - photographs stand staggered on the column lines, not in a grid: a landscape on the right, a portrait at the spine lower down; a tall one
      running off the right edge with a small one beside it; a wide one from the spine; a wide one off the left edge; each numbered (the collection);
    - testimonial: the quotation large on the left, a tall photograph to the right edge;
    - Why the Details Matter (film "many"), the next project and the call to action are as before.
    Nothing is invented: what the client has not written stays their placeholder. The Goal stands above The Brief (in the template it is below)."""
    S = P['project']; pg = Pg(); nm = p['name']
    def sub(t): return t.replace('[Project Name]', nm)
    # the client's template has unfilled fields; on this page they carry working copy (PROJ[0]['draft'], see build.py — NOT the client's text),
    # each wrapped in <span class="dr"> so that it can be found and replaced (her word of 16.11 13:24: no brackets, no dimming — a stand-in text)
    D = p.get('draft', {})
    def dr(key, tpl): return '<span class="dr">%s</span>' % esc(D[key]) if key in D else esc(tpl)
    cov = ph(p['set'], p['cover'])
    pg.add('<section class="film wl" data-fig="wall" data-len="0" id="@ID@">\n  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n'
           '    <div class="wl-p"><img src="%s" alt="%s"><i class="wl-sh"></i></div>\n'
           '    <p class="lab3 wl-k">%s</p>\n    <h1 class="t111 wl-h">%s</h1>\n    <p class="t20 wl-s"><span>%s</span></p>\n  </div>\n</section>'
           % (cov, nm, esc(p['loc']), '<br>'.join(esc(x) for x in p['lines']), dr('lead', ' '.join(get(S[0], 'lead')[0][1]))), 'Project', 'top')
    # the pictures of the page, numbered through (the collection)
    PL = p['gal3']; total = sum(len(fs) for k, fs in PL) + (1 if p.get('quote') else 0); n = [0]   # + the testimonial's photograph, when there is a testimonial
    def fig(f, cls):
        n[0] += 1
        return '<figure class="gi %s rv"><span class="im"><img src="%s" alt="%s" loading="lazy"></span><span class="lc lab3 nn">%02d <i>/ %02d</i></span></figure>' % (cls, ph(p['set'], f), nm, n[0], total)
    def rows(plan):
        o = []
        for kind, fs in plan:
            if kind == 'm1': o.append('  <div class="pg pg-m1">%s%s</div>' % (fig(fs[0], 'rl'), fig(fs[1], 'sp')))          # landscape right, portrait at the spine below it
            elif kind == 'rb': o.append('  <div class="pg pg-rb">%s%s</div>' % (fig(fs[0], 'sm'), fig(fs[1], 'rbp')))        # small at the spine, tall off the right edge
            elif kind == 'sw': o.append('  <div class="pg">%s</div>' % fig(fs[0], 'sw'))                                     # wide from the spine
            elif kind == 'lb': o.append('  <div class="pg pg-lb">%s%s</div>' % (fig(fs[0], 'lbw'), fig(fs[1], 'sm lo')))     # wide off the left edge, small on the right lower
            elif kind == 'lp': o.append('  <div class="pg pg-lp">%s%s</div>' % (fig(fs[0], 'lbp'), fig(fs[1], 'sm')))        # tall off the left edge, small on the right
            elif kind == 'full': o.append('  <div class="pg">%s</div>' % fig(fs[0], 'fu'))                                   # across the fields
            else: raise ValueError(kind)
        return '\n'.join(o)
    # overview: The Goal large, The Brief as a table
    sec = S[1]; dl = get(sec, 'dl')[0][1]; known = {'Residence': p['bld'] + ' · ' + p['loc']}; known.update(p.get('facts', {}))
    if 'Size' in known: dl = [dl[0], dl[1], ['Size', ['']]] + dl[2:]
    def val(k, v):
        if k == 'Client' and 'client' in D: return dr('client', '')
        x = known.get(k, ' '.join(v))
        return '<br>'.join(esc(y) for y in x.split(' / ')) if k == 'Scope' and k in known else esc(x)   # the scope: an item a line
    goal = get(sec, 'h3')[0][1]; gp = [it[1][0] for it in sec['items'] if it[0] == 'p']
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 rv g4-k">%s</p>\n    <div class="g4-b pj-st rv"><h3 class="lab3 pj-in">%s</h3><p class="t60s">%s</p></div>\n  </div>\n'
           '  <div class="g4 pj-2">\n    <h2 class="lab3 rv g4-k">%s</h2>\n    <dl class="g4-b pj-tb">%s</dl>\n  </div>\n</section>'
           % (esc(label(sec)), esc(goal), dr('goal', ' '.join(gp)), esc(nop(h_of(sec))), ''.join('<div class="rv"><dt class="lab3">%s</dt><dd>%s</dd></div>' % (esc(k), val(k, v)) for k, v in dl)))
    # design vision: the concept at the spine, its paragraphs small in the fourth column; then the first staggered pair
    sec = S[2]; ps_ = [' '.join(it[1]) for it in sec['items'] if it[0] in ('p', 'lead')]; assert len(ps_) == 3 and ps_[0].startswith('The design began with [') and ps_[2].startswith('['), ps_
    pv = [dr('began', nop(ps_[0])), esc(nop(ps_[1])), dr('narrative', nop(ps_[2]))]
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 rv g4-k">%s</p>\n    <h2 class="t60 rv pj-h">%s</h2>\n    <div class="pj-tx">%s</div>\n  </div>\n%s\n</section>'
           % (esc(label(sec)), dr('concept', h_of(sec)), ''.join('<p class="t20 rv">%s</p>' % x for x in pv), rows(PL[:1])), 'Vision')
    # the gallery: staggered on the column lines
    ttl = sub(h_of(S[3])).replace('[', '').replace(']', ''); assert ttl == 'Inside ' + nm, ttl
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 rv g4-k">%s</p>\n    <h2 class="t60 rv pj-h">Inside<br>%s</h2>\n  </div>\n%s\n</section>'
           % (esc(label(S[3])), esc(nm), rows(PL[1:])), 'Gallery')
    # behind the design: hundreds of strokes become one line; the three decisions are the client's placeholders
    sec = S[4]; rws = get(sec, 'row'); ld = get(sec, 'lead'); q0 = [(.75, .95, 1.35, 1.5), (1.5, 1.65, 1.95, 2.1), (2.1, 2.25, 2.6, 2.75)]
    assert len(rws) == 3 and ld, rws
    dd = D.get('dec'); names = [d_[0] for d_ in dd] if dd else [x[1] for x in rws]
    dec = ''.join('      <p class="t20 m p-cbr" data-k="%s %s %s %s">%s</p>\n' % (q0[i] + (('<span class="dr"><span class="dn">%s</span><br> %s</span>' % (esc(dd[i][0]), '<br class="bd"> '.join(esc(y) for y in dd[i][1].split(' / ')))) if dd else '%s<br> %s' % (esc(x[1]), esc('[%s]' % ' '.join(x[2][0]))),)) for i, x in enumerate(rws))
    lead = [nop(x) for x in ld[0][1]]
    pg.add('<section class="film" data-fig="many" data-len="3.8" id="@ID@">\n  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">\n'
           '      <h2 class="t60 m p-ctl" data-k="-1 -.5 99 99">%s</h2>\n%s      <p class="t34 m p-cbr" data-k="3.0 3.3 99 99">%s<br class="bd"> <span class="cb">%s</span></p>\n'
           '      <ol class="vh" data-steps>%s</ol>\n    </div>\n  </div>\n</section>' % ('Why the Details<br>Matter', dec, esc(lead[0] + ('.' if len(lead) > 1 else '')), '<br class="bd"> '.join(esc(x) for x in ['The success of the home comes', 'from making them feel like one idea']), ''.join('<li>%s</li>' % html.escape(x, quote=False) for x in names)), 'Details')
    assert nop(h_of(sec)) == 'Why the Details Matter' and ' '.join(lead[1:]) == 'The success of the home comes from making them feel like one idea', (h_of(sec), lead)
    # testimonial: the quotation large on the left, a tall photograph to the right edge — ONLY when a real, approved one exists (p['quote'] =
    # (text, who)); a client's words are never made up, so until then the block is not on the page
    if p.get('quote'):
        pg.add('<section class="bk" id="@ID@">\n  <div class="pq">\n    <div class="pq-t"><p class="t60s rv">%s</p><p class="lab3 rv pq-w">%s</p></div>\n    %s\n  </div>\n</section>' % (esc(p['quote'][0]), esc(p['quote'][1]), fig(p['qphoto'], 'pq-i')))
    assert n[0] == total, (n[0], total)
    # the next project: its name and its photograph side by side on the grid
    # 16.11 18:33, her frame «18 Next project» (567:2689): a whole screen — the label in the top left corner, the name and its line of
    # places on the left field in the middle of the height, the button «Explore» in the bottom left corner, the photograph on the right
    # half of the screen from edge to edge
    pg.add('<section class="nx3" id="@ID@">\n  <p class="lab3 nx3-k">Next project</p>\n  <div class="nx3-m"><h2 class="t60 rv"><a href="%s.html">%s</a></h2><p class="lab3 nx3-l rv">%s</p></div>\n'
           '  <div class="nx3-b rv">%s</div>\n  <a class="nx3-i cd rv" href="%s.html" tabindex="-1" aria-hidden="true"><span class="im"><img src="%s" alt="" loading="lazy"></span></a>\n</section>'
           % (nxt['slug'], '<br>'.join(esc(x) for x in nxt['lines']), sqr(nxt['loc'].split(' · ') + [nxt['bld']]), btn('Explore', nxt['slug'] + '.html'), nxt['slug'], ph(nxt['set'], nxt['card'])))
    final_cta(pg, S[6], ph(p['set'], p['cta']), top=p.get('top', False))
    emit(p['slug'] + '.html', nm, pg, cov)
for i, p in enumerate(PROJ): (project_collection if p.get('idea') == 'collection' else project_old)(p, PROJ[(i + 1) % len(PROJ)])

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
    head = '<section class="bk hd0" id="@ID@">\n  <p class="lab3 rv c1 mt3"><span class="sqr"><span><a href="news.html">← News</a></span><span><span class="ph">[Category]</span></span><span><span class="ph">[Date]</span></span></span></p>\n  <h1 class="t60 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <p class="t34 rv c1" style="--w:900;margin-top:calc(50 * var(--u))">%s</p>\n</section>' % (esc(h_of(S[0], 'h1')), esc(get(S[0], 'lead')[0][1][0]))
    pg.add(head, 'Article', 'top')
    body = []
    for it in sec['items']:
        if it[0] == 'p': body.append('<div class="t20s rv"><p>%s</p></div>' % esc(it[1][0]))
        elif it[0] == 'h3': body.append('<p class="h5r rv" style="margin-top:calc(100 * var(--u))">%s</p>' % esc(it[1]))
        elif it[0] == 'lead': body.append('<p class="t34 rv">%s</p>' % esc(it[1][0]))
    meta = '<p class="lab3 rv mt3">%s</p>' % sqr(ks[:3])
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
        if k == 'Social': val = sqr(['<a href="#" data-noop>%s</a>' % esc(x) for x in v[0].split(' · ')], raw=True)
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
