# CI site — the pages. Run: python3 pages.py
import os
__file__ = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build.py')
exec(open(__file__).read())
A = 'assets/ph/'
L = 'assets/ln/'

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
# ---------------------------------------------------------------- CI Turnkey: one door (16.11.2026, her brief of 23:14 / 23:28)
def short_of(sec):
    """the one-line paragraphs of a section, in order"""
    return [x[1][0] for x in sec['items'] if x[0] == 'p' and len(x[1]) == 1]
def thought(pg, name, lines, blue_from, paras, button, img, pos=None):
    """The page's thought as its own black screen under the cover (18.11.2026 22:34: «мені не подобається… коли у нас є повноекранна
    фотографія і внизу скролом ще одна повноекранна фотографія… зробимо оцей текст окремим блоком чорним… на весь екран 1080. При
    потребі додай якусь малу фотографію… і вибери, який стиль тексту підійде»). Her own black screen of All Solutions (frame
    658:9256): the name on the left field, the thought from 600 in the 60, sentence case, its second half in the blue (22:32: «дуже
    грузний текст… розбавити світло-синім»), the client's paragraph on the foot, the button on the left field's foot, one small
    photograph in the corner. On CI Turnkey the thought stays on the cover: that is her frame 637:7894, and a black table follows it."""
    pg.add(iv_quiet(name, [(x, 1 if i >= blue_from else 0) for i, x in enumerate(lines)], paras, img, pos, button), 'Idea')

def wellness_page():
    """CI Wellness, thought through again (18.11.2026 22:07, of CI Curated and this page: «вони дуже грузні, дуже некрасиві,
    непривабливі, не цікаві. Я хочу, щоб ти це все ще раз переосмислив, думав метафорами і зробив на рівні з тим, що у нас вже є»).
    The page is about what is FELT and not seen — light, air, water, sleep — so its pictures do not show things, they change:
      cover     Turnkey's film with this page's room (the bath at the window);
      Idea      the thought on its own black screen (22:34);
      Why       the page's own block: A DAY PASSES THROUGH THE ROOM while the client's nine qualities are read one at a time —
                cool and low at dawn, full at noon, warm at dusk, the sun's band crossing the picture (tk_words, mode 'day');
      What      a still black screen (her frame of All Solutions);
      Fit       the seven conditions on the grid;
      Process   five rows that open (the site's own rows): the page stays light and none of the client's text is lost;
      Features  her reference (23:03): the nine groups and the home spa as names in a row on the line, each with its photograph;
      One Team  the nine disciplines as one mass that lets go: «We manage the conversation between disciplines so you do not have
                to» (Turnkey's scatter — here it is this page's own sentence);
      Design    «Controls can disappear. Technology can integrate…» — the three sentences come and go one at a time;
      Outcome   a still black screen.
    A full-screen photograph never follows another (22:34): two sections of the client's order are exchanged for that — «Why
    Wellness Matters» stands before «What CI Wellness Is», «Our Responsibility» before «Wellness Without Compromising Design».
    Every word is the client's. No stock."""
    S = [join_lists(dots_fix(x)) for x in P['wellness']]; pg = Pg()
    h1, ps, a = hero(S[0])
    lead0 = [nop(x) for x in get(S[0], 'lead')[0][1]]
    pg.add(tk_cover(label(S[0]), h1, A + 'ch/1450-25a.webp', L + '1450-25a.webp', L + '1450-25a-g.png',
                    [('Better Living,', ''), ('', 'Designed In')]), 'Wellness', 'top')
    idea_t = ['A beautiful home changes', 'what you see.', 'A considered home can change', 'how you feel inside it']
    assert ' '.join(idea_t) == nop(' '.join(get(S[0], 'lead')[0][1])), lead0
    thought(pg, 'CI Wellness', idea_t, 2, [brk_lines(nop(' '.join(ps[1])), 62), tuple(nop(x) for x in ps[2])], btn(a[0], 'contact.html'), A + 'us/1511-03a.webp', '50% 40%')
    # 03 why it matters — the page's own block: a day passes through the room, one of the client's nine qualities at a time
    sec = S[2]; wp = [it[1] for it in sec['items'] if it[0] == 'p']
    qual = [it[1] for it in sec['items'] if it[0] == 'dots'][0]
    st2 = nop(' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0]))
    assert len(qual) == 9 and len(wp) == 4 and len(wp[2]) == 2, (qual, wp)
    c2 = [('This is how CI is', 0), ('redefining luxury:', 0), ('beyond appearance alone', 1), ('and toward the quality', 1), ('of everyday living', 1)]
    assert ' '.join(x for x, _ in c2) == st2, st2
    assert nop(h_of(sec)) == 'Better Design Should Support a Better Quality of Life', h_of(sec)
    pg.add(tk_words(label(sec), [('Better Design Should', 0), ('Support a Better', 1), ('Quality of Life', 1)], [wp[0][0], wp[1][0]], qual, [wp[2]], c2,
                    A + 'us/1511-11a.webp', mode='day', foot3=[wp[3][0]]), 'Why')
    # 04 what CI Wellness is: a still black screen
    sec = S[1]; ip = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    assert nop(h_of(sec)) == 'The Home as Part of Your Wellbeing' and len(ip) == 5, (h_of(sec), ip)
    pg.add(iv_quiet(label(sec), [('The Home as Part', 0), ('of Your Wellbeing', 1)],
                    [brk_lines(nop(get(sec, 'lead')[0][1][0] + ' ' + ip[0]), 64), brk_lines(nop(' '.join(ip[1:])), 64)], A + 'ch/1450-14.webp', '50% 60%'), 'What It Is')
    # 05 the seven conditions on the grid; a name is a run of its own sentence's words; the section's closing sentence under the lead
    sec = S[3]; rows = [' '.join(r[1]) if isinstance(r[1], (list, tuple)) else r[1] for r in get(sec, 'row')]
    cl = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    # 23.11.2026, the client's notes (site-wide): «Position CI as specialists in high-end interior residential turnkey solutions, rather than
    # ground-up builds» — the first condition read «Planning a new residence or significant renovation»; it speaks of the renovation only now
    NM = [['A Significant', 'Renovation'], ['The Quality', 'of Your Home', 'Environment'], ['Sleep, Recovery,', 'Movement, Light,', 'Air, or Water'], ['Long-Term', 'Living'],
          ['Without', 'Compromising', 'Architecture'], ['A Home Spa,', 'Recovery Suite,', 'Fitness Area'], ['One Team', 'to Coordinate']]
    assert len(NM) == len(rows) == 7 and len(cl) == 1, (len(rows), cl)
    pg.add(tk_fit(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], list(zip(NM, rows)), A + 'us/1511-04a.webp',
                  ['Personalized', 'Around the Way', 'You Want to Live'], tail=cl[0]), 'Fit')
    # 06 the five steps as rows that open
    sec = S[4]
    rows = [(r[1] if isinstance(r[1], str) else ' '.join(r[1]), [' '.join(x) for x in r[2]]) for r in get(sec, 'row')]
    assert len(rows) == 5 and nop(h_of(sec)) == 'Expert Perspective. One Coordinated Team', (len(rows), h_of(sec))
    pg.add(wl_rows(label(sec), [('Expert Perspective.', 0), ('One Coordinated Team', 1)], get(sec, 'lead')[0][1], rows), 'Process')
    # 07 the features: the client's nine groups and the home spa as an index the scroll walks through
    sec = S[6]; fp = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    h3 = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h3']
    assert len(P['_feats']) == 9 and len(fp) == 5 and len(h3) == 1, (len(P['_feats']), fp, h3)
    spa = ['Home Spa + Personalized', 'Wellness Rooms']; assert ' '.join(spa) == h3[0], h3
    states = [(g[0], [(g[k_], g[k_ + 1]) for k_ in range(1, len(g), 2)]) for g in P['_feats']] + [(h3[0], [fp[2], fp[3], fp[4]])]
    assert [x[0] for x in states[:9]] == ['Light', 'Air', 'Water', 'Heat + Recovery', 'Sleep', 'Sound', 'Climate', 'Materials', 'Movement'], [x[0] for x in states]
    # her reference for this screen (23:03, santalarch.com/#services): the names in a row on the line, the photograph of the one in hand under it
    FX = ['us/1511-05a', 'ch/1450-21', 'us/1530-01', 'us/1530-02', 'ch/1450-33', 'ch/1450-30', 'ch/1450-26', 'rtb/1430-14', 'rtb/1430-07', 'rtb/1430-15']
    pg.add(wl_feats(label(sec), [('The Right Solutions,', 0), ('in the Right Home', 1)], [fp[0], fp[1]], states, [A + x + '.webp' for x in FX]), 'Features')
    # 08 our responsibility: the nine disciplines as one mass that lets go — «so you do not have to»
    sec = S[8]
    touch = [it[1] for it in sec['items'] if it[0] == 'dots'][0]
    op = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    assert len(touch) == 9 and len(op) == 3 and nop(h_of(sec)) == 'One Team Connecting Wellness to the Rest of the Home', (touch, op)
    pg.add(tk_loose([label(sec)], [('One Team Connecting', ''), ('Wellness to the ', ''), ('', 'Rest of the Home')], touch, note=get(sec, 'lead')[0][1][0],
                    after=(op[0] + ' ' + op[1], op[2])), 'One Team')
    # 09 wellness without compromising design: the three sentences come and go, one at a time
    sec = S[7]; tp = [it[1] for it in sec['items'] if it[0] == 'p']
    assert [len(x) for x in tp] == [3, 1, 1, 1, 1, 4] and nop(h_of(sec)) == 'Technology Should Support the Home. Not Take It Over', ([len(x) for x in tp], h_of(sec))
    c7 = [('The result should', 0), ('unmistakably feel', 0), ('like a CI home.', 0), ('Not a clinic.', 1), ('Not a commercial spa.', 1), ('Not a technology showroom', 1)]
    assert ' '.join(x for x, _ in c7) == nop(' '.join(tp[5])), tp[5]
    pg.add(tk_words(label(sec), [('Technology Should', 0), ('Support the Home.', 0), ('Not Take It Over', 1)], [get(sec, 'lead')[0][1][0]], tp[0],
                    [tp[1][0], tp[2][0], tp[3][0]], c7, A + 'ch/1450-06.webp', wsmall=True, foot3=[tp[4][0]]), 'Design')
    # 10 the outcome: a still black screen
    sec = S[9]; o9 = [it[1] for it in sec['items'] if it[0] == 'p']
    st9 = [it[1] for it in sec['items'] if it[0] == 'strong'][0]
    assert len(o9[0]) == 4 and len(st9) == 2 and nop(h_of(sec)) == 'A Home That Works Harder for the Life Inside It', (o9, st9)
    pg.add(iv_quiet(label(sec), [('A Home That Works Harder', 0), ('for the Life Inside It', 1)],
                    [tuple(nop(x) for x in o9[0]), tuple([nop(o9[1][0])] + [nop(x) for x in st9])], A + 'rtb/1430-13.webp', '50% 50%'), 'Outcome')
    final_cta(pg, S[10], A + 'ch/1450-29a.webp')
    emit('ci-wellness.html', 'CI Wellness', pg, A + 'ch/1450-25a.webp')

def curated_page():
    """CI Curated on Turnkey's skeleton, thought through again (18.11.2026 22:07, of this page and CI Wellness: «вони дуже грузні,
    дуже некрасиві, непривабливі, не цікаві. Я хочу, щоб ти це все ще раз переосмислив, думав метафорами і зробив на рівні з тим,
    що у нас вже є — головної і попередніх solutions»). The page's own word is LAYERS and its own verb is COMPOSE, so:
      cover     Turnkey's film with this page's room — here the line draws the THINGS (the sofa, the tables, the lamp) before the
                home stands;
      Receive   the page's own block: the room in its evening and ONE LIGHT that travels through it and rests on a piece for each of
                the client's six words — the curator's eye. At the end the whole room is lit: composed, not filled;
      Included  the built side and the curated side of the scope come together into one mass («Design, Build + Curation»);
      Why       the client's four continuities on ONE continuous line across a photograph (the row of Turnkey's block 05, with this
                page's meaning: nothing breaks between what is built and how it is lived in).
    The conditions on the grid, the list and the photograph that becomes the screen, the stages as a row of squares and the projects
    as a slider are the template. Every word is the client's; the testimonial is still a placeholder, so there is none. No stock."""
    S = [join_lists(dots_fix(x)) for x in P['curated']]; pg = Pg()
    h1, ps, a = hero(S[0])
    # 01 the cover, and the page's thought on its photograph: the client's lead cut into the name and the thought, word for word
    lead0 = nop(' '.join(ps[0]))
    idea_t = ['Expands our integrated', 'design-build approach', 'into the layers that make', 'a residence feel complete']
    assert ('CI Curated ' + ' '.join(idea_t)).lower() == lead0.lower(), lead0
    pg.add(tk_cover(label(S[0]), h1, A + 'us/1511-12a.webp', L + '1511-12a.webp', L + '1511-12a-g.png',
                    [('The Home, Considered', ''), ('', 'Beyond Construction')]), 'Curated', 'top')
    thought(pg, 'CI Curated', idea_t, 2, [brk_lines(nop(' '.join(' '.join(x) for x in ps[1:3])), 60), [nop(' '.join(ps[3]))]], btn(a[0], 'contact.html'),
            A + 'us/1530-05.webp', '50% 50%')
    # 02 the conditions on the grid; a name is a run of its own sentence's words
    sec = S[1]; rows = [' '.join(r[1]) if isinstance(r[1], (list, tuple)) else r[1] for r in get(sec, 'row')]
    NM = [['Design and', 'Build Your', 'Residence'], ['Beyond the', 'Permanent', 'Architecture'], ['Expert', 'Furnishing', 'Selection'],
          ['Art Considered', 'Within the', 'Design'], ['A Coherent', 'Visual', 'Language'], ['More', 'Involvement']]
    assert len(NM) == len(rows), (len(NM), len(rows))
    pg.add(tk_fit(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], list(zip(NM, rows)), A + 'ch/1450-05.webp',
                  ['For Clients Who', 'Want a More', 'Complete Design', 'Experience']), 'Fit')
    # 03 what is included (before «What You Receive», as on CI Core: a full-screen photograph never follows another): the two halves of the scope — the client's own two lists — come together into one mass
    sec = S[4]; ks = [it[1] for it in sec['items'] if it[0] == 'k']
    note = ks[0][0] if isinstance(ks[0], (list, tuple)) else ks[0]
    assert nop(h_of(sec)) == 'Design, Build + Curation', h_of(sec)
    pg.add(tk_loose([label(sec)], [('Design, Build', ''), ('', '+ Curation')], list(ks[1]) + list(ks[2]), leave=False, note=note, gather=len(ks[1])), 'Included')
    # 04 what you receive — the page's own block: one light through the room, a piece for each of the client's six words
    sec = S[2]; cp = [it[1] for it in sec['items'] if it[0] == 'p']
    st = [it[1] for it in sec['items'] if it[0] == 'strong'][0]
    six = [x.strip(' .') for x in cp[1][0].split('.') if x.strip(' .')]        # Scale. Comfort. Furniture. Art. Texture. Objects.
    assert six == ['Scale', 'Comfort', 'Furniture', 'Art', 'Texture', 'Objects'] and len(cp[2]) == 3 and len(st) == 2, (six, cp[2], st)
    assert nop(h_of(sec)) == 'A Home With Depth, Not Just a Finished Renovation', h_of(sec)
    cl = [('The goal is not', 0), ('to fill rooms.', 0), ('It is to compose', 1), ('a residence', 1)]
    assert ' '.join(x for x, _ in cl) == nop(' '.join(st)), st
    #                 the whole room      the armchairs       the sofa            the painting        the wall + curtain   the bust + the lamp
    PTS = [(.50, .46, 1.3, .8), (.69, .60, .21, .13), (.44, .74, .50, .17), (.112, .392, .17, .17), (.455, .36, .10, .30), (.885, .50, .12, .21)]
    pg.add(tk_words(label(sec), [('A Home With Depth,', 0), ('Not Just a Finished', 1), ('Renovation', 1)], [get(sec, 'lead')[0][1][0], cp[0][0]],
                    six, [cp[2]], cl, A + 'ch/1450-20a.webp', mode='pool', pts=PTS), 'Receive')
    # 05 our responsibility: the client's sentences as rows, then the photograph becomes the screen and carries the closing line
    sec = S[5]; rp = [it[1] for it in sec['items'] if it[0] == 'p']
    one = [nop(x[0]) for x in rp if len(x) == 1]; four = [nop(x) for x in max(rp, key=len)]
    rst = nop(' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0]))
    assert len(one) == 1 and len(four) == 4, (one, four)
    def up(x): return x[0].upper() + x[1:]
    def cut(x, n): w = x.split(' '); return (' '.join(w[:n]), up(' '.join(w[n:])), '')
    a1, b1 = one[0].split(', ', 1)
    line = ['Each Layer', 'Belongs to the', 'Same Story']
    assert ' '.join(line).lower() == rst.lower(), rst
    pg.add(tk_team(label(sec), [('One Team', ''), ('', 'Managing'), ('', 'Every Stage')], [(a1, up(b1))] + [cut(x, 1) for x in four], None,
                   A + 'us/1530-03.webp', line, []), 'One Team')
    # 06 the seven stages as a row of squares; the sentences are the client's own, as written
    sec = S[6]
    names = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h4']
    txts = [x[1][0] if isinstance(x[1], (list, tuple)) else x[1] for x in sec['items'] if x[0] == 'p']
    assert len(names) == len(txts) == 7, (len(names), len(txts))
    pg.add(tk_strip(label(sec), [('From Architecture', ''), ('to ', 'Atmosphere')], [(n, t_, 0) for n, t_ in zip(names, txts)]), 'Process')
    # 07 why: the four continuities on one continuous line across a photograph; «CI Curated connects them» stands over the line
    sec = S[7]; wp = [it[1] for it in sec['items'] if it[0] == 'p']
    ws = [nop(x[0]) for x in wp if len(x) == 1]; betw = [nop(x) for x in max(wp, key=len)]
    wst = nop(' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0]))
    assert len(ws) == 2 and len(betw) == 4 and betw[0].startswith('There is continuity between '), (ws, betw)
    pairs = [('There is continuity', betw[0][len('There is continuity '):])] + [tuple(x.split(' ', 1)) for x in betw[1:]]
    c7 = [('The result feels', 0), ('collected, personal,', 0), ('and complete,', 0), ('not decorated', 1), ('after the fact', 1)]
    assert ' '.join(x for x, _ in c7) == wst, wst
    pg.add(tk_recv(label(sec), [('Because Completion', 1), ('Changes How', 1), ('a Home Feels', 0)], [], ws[0], ws[1], pairs, c7, A + 'rtb/1430-12a.webp'), 'Why')
    # 08 the work itself, as the slider (the client's three are still placeholders: the same three homes, another one in hand)
    sec = S[8]; pbt = [x for x in get(sec, 'a') if 'portfolio' in x[1]]
    FOC = {'collectors-home': (.528, .652), 'room-to-breathe': (.5, .713), 'urban-sanctuary': (.5, .665)}
    sl = [PROJ[2], PROJ[1], PROJ[0]]
    pg.add(tk_slider([('Projects ', 'Delivered', ''), ('Through CI Curated', '', '')], btn(pbt[0][2] if pbt else 'Explore CI Curated Projects', 'portfolio.html'),
                     [(q['name'], q['loc'].split(' · ') + [q['bld']], ph(q['set'], q['tall']), q['slug'] + '.html', FOC[q['slug']]) for q in sl]), 'Projects')
    final_cta(pg, S[10], A + 'ch/1450-28a.webp')
    emit('ci-curated.html', 'CI Curated', pg, A + 'ch/1450-34.webp')

def core_page():
    """CI Core on Turnkey's skeleton (18.11.2026 18:40–18:45: «це ж шаблонні плюс-мінус сторінки… ми можемо адаптувати всі інші під
    це» — «давай займися іншими сторінками»). The same blocks in the same order as CI Turnkey, with the client's own text of this
    page; two things stay Core's own, so that the pages are one family and not one page four times (her word of 16.11: «кожна сторінка
    повинна бути унікальною… але в нашій стилістиці»):
      (the cover was Core's own until 19:45 — the room standing as a drawing; on her word it is Turnkey's film now, with this page's room;)
      «What You Receive» — the seam between the people who design and the people who build, under the visitor's hand.
    Everything else is the template: the thought on the cover's photograph, the conditions on the grid, what is included as one mass
    (it stands — here the names are what the client gets, nothing leaves), the list and the photograph that becomes the screen, the
    stages as a row of squares, the projects as a slider. FIRST PASS — the names in the grid, the line breaks and the photographs are
    mine, hers to change. No stock anywhere."""
    S = [join_lists(dots_fix(x)) for x in P['core']]; pg = Pg()
    h1, ps, a = hero(S[0])
    # 01 the cover, and the page's thought on its photograph: the client's lead is cut into the name and the thought, word for word
    lead0 = nop(' '.join(ps[0]))
    idea_t = ['Brings architecture,', 'interior design, construction,', 'and project management', 'together under one team']
    assert ('CI Core ' + ' '.join(idea_t)).lower() == lead0.lower(), lead0
    # 18.11 19:45, on Core's own cover (the room standing as a drawing that fills with the photograph): «чому ми не можемо зробити
    # так, як на Turnkey — там, де лінія малювала скетч, і потім скетч переходив в картинку. Чому ми не можемо взяти такий самий
    # прийом?» — so the cover is Turnkey's film itself (tk_cover / unfold()), with this page's room: the tangle pays out its line,
    # the room grows out of the line stroke by stroke (tools/site/sketch.py, 'us/1511-01a'), the line parts and the home stands.
    pg.add(tk_cover(label(S[0]), h1, A + 'us/1511-01a.webp', L + '1511-01a.webp', L + '1511-01a-g.png',
                    [('Design + Build,', ''), ('', 'Fully Connected')]), 'Core', 'top')
    thought(pg, 'CI Core', idea_t, 3, [brk_lines(nop(' '.join(ps[1])), 60)], btn(a[0], 'contact.html'), A + 'ch/1450-12.webp', '50% 50%')
    # 02 the conditions on the grid; a name is a run of its own sentence's words (tk_fit asserts it); which run is our choice
    sec = S[1]; rows = [' '.join(r[1]) if isinstance(r[1], (list, tuple)) else r[1] for r in get(sec, 'row')]
    NM = [['A Significant', 'Renovation'], ['Coordinated', 'From the', 'Beginning'], ['Clear', 'Communication'], ['One Point of', 'Accountability'],
          ['Final Styling', 'Independently'], ['The Permanent', 'Built', 'Environment']]
    assert len(NM) == len(rows), (len(NM), len(rows))
    pg.add(tk_fit(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], list(zip(NM, rows)), A + 'ch/1450-04a.webp',
                  ['For Clients Who', 'Want One Team', 'Responsible for', 'Design + Construction']), 'Fit')
    # 03 what is included: the section's heading as the block's name, its own closing sentence as the title, the seventeen names as
    # one mass under the client's note. On this page the list is what the client receives, so nothing leaves: the two halves of
    # the scope — the design side and the build side, the client's own two lists — come together from either side into one mass.
    sec = S[4]; ks = [it[1] for it in sec['items'] if it[0] == 'k']
    note = ks[0][0] if isinstance(ks[0], (list, tuple)) else ks[0]
    cl = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    assert nop(h_of(sec)) == 'A Connected Design-Build Scope' and nop(cl[0]) == 'Specific scope is defined around the needs of each project', (h_of(sec), cl)
    pg.add(tk_loose(['A Connected', 'Design-Build Scope'], [('Specific scope is defined', ''), ('', 'around the needs'), ('', 'of each project')],
                    list(ks[1]) + list(ks[2]), leave=False, note=note, gather=len(ks[1])), 'Included')
    # 04 what you receive — Core's own block: the drawing becomes the room as the seam crosses the screen, in three steps
    sec = S[2]; cp = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    st = [it[1] for it in sec['items'] if it[0] == 'strong'][0]
    pg.add(co_seam(label(sec), h_of(sec), cp[0], cp[1:], st, A + 'ch/1450-17.webp', L + '1450-17.webp'), 'Receive')
    # 05 our responsibility: five rows in the client's order, then the photograph becomes the screen and carries the two roles
    sec = S[5]; rp = [it[1] for it in sec['items'] if it[0] == 'p']
    one = [nop(x[0]) for x in rp if len(x) == 1]; three = [nop(x) for x in max(rp, key=len)]
    rst = [nop(x) for x in [it[1] for it in sec['items'] if it[0] == 'strong'][0]]
    assert len(one) == 3 and len(three) == 3 and len(rst) == 2, (one, three, rst)
    def up(x): return x[0].upper() + x[1:]
    def cut(x, n): w = x.split(' '); return (' '.join(w[:n]), up(' '.join(w[n:])), '')
    a1, b1 = one[0].split(', ', 1)
    pairs = [(a1, up(b1)), (one[1], one[2], ''), cut(three[0], 1), cut(three[1], 1), cut(three[2], 2)]
    line = ['Your Role Is', 'to Make the', 'Decisions That', 'Shape the Home']; l2 = ['Our role is to manage', 'what it takes to', 'execute them']
    assert ' '.join(line).lower() == rst[0].lower() and ' '.join(l2) == rst[1], rst
    pg.add(tk_team(label(sec), [('One Team', ''), ('', 'Responsible for'), ('', 'Every Stage')], pairs, None, A + 'rtb/1430-08a.webp', line, l2), 'One Team')
    # 06 the six stages as a row of squares; the sentences are the client's own, as written
    sec = S[6]
    names = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h4']
    txts = [x[1][0] if isinstance(x[1], (list, tuple)) else x[1] for x in sec['items'] if x[0] == 'p']
    assert len(names) == len(txts) == 6, (len(names), len(txts))
    pg.add(tk_strip(label(sec), [('From Possibility', ''), ('to ', 'Built'), ('', 'Reality')], [(n, t_, 0) for n, t_ in zip(names, txts)]), 'Process')
    # 07 the work itself, as the slider (the client's three are still placeholders: the same three homes, another one in hand)
    sec = S[7]; pbt = [x for x in get(sec, 'a') if 'portfolio' in x[1]]
    FOC = {'collectors-home': (.528, .652), 'room-to-breathe': (.5, .713), 'urban-sanctuary': (.5, .665)}
    sl = [PROJ[1], PROJ[0], PROJ[2]]
    pg.add(tk_slider([('Built ', 'Through', ''), ('CI Core', '', '')], btn(pbt[0][2] if pbt else 'Explore CI Core Projects', 'portfolio.html'),
                     [(q['name'], q['loc'].split(' · ') + [q['bld']], ph(q['set'], q['tall']), q['slug'] + '.html', FOC[q['slug']]) for q in sl]), 'Projects')
    final_cta(pg, S[9], A + 'ch/1450-31.webp')
    emit('ci-core.html', 'CI Core', pg, A + 'us/1511-01a.webp')

# CI Turnkey, the process as a row of squares (18.11.2026 16:11, her frame 644:8827). The first sentence is hers, as typed in the frame; the
# rest are the client's own sentences for each stage (content.json) brought to about the same length (her card holds 97 characters in
# three lines) and to the same voice — the reader is «you», the words in capitals as she set them. Nothing is claimed that the client's
# sentence does not say; what is added only spells it out. WORKING COPY (.wc on the page), hers and the client's to change.
TK_STAGE = {
    'Discovery': 'Understanding You, Your Home, Lifestyle, Priorities, Collections, Wellness Goals, and Aspirations',
    'Strategy': 'Establishing the Scope, Team, Program, Timeline, and Priorities That Will Guide Your Project',
    'Architecture + Design': 'Developing Your Residence as One Integrated Vision, From the Architecture to the Last Detail',
    'Pre-Construction': 'Technical Documentation, Budgeting, Scheduling, Procurement Strategy, and Team Coordination',
    'Build': 'CI Manages the Physical Transformation of Your Home, Every Trade, Every Phase, Every Detail',
    'Curate': 'Furnishings, Art, Lighting, Textiles, and Finishing Layers Are Developed Alongside the Build',
    'Install': 'Furniture, Artwork, Objects, and Details Move Into Place, Room by Room, Exactly as Planned',
    'Deliver': 'Your Residence Is Completed as a Home, Ready to Live In, Not Handed Over as a Construction Site',
}
def turnkey_page():
    """CI Turnkey — everything divides by one. 17.11 07:57: «Типографія: ужас, все розкидано… Всі стокові фотографії ми забираємо… не вистачає
    ідеї, метафор, і перший екран теж». So: no stock photography anywhere on the page (only the client's own work, and only where a photograph
    is the content); one metaphor, stated on the first screen and spelled out on the third — a project is hundreds of people and thousands of
    decisions, and all of it divides by ONE team; and one typographic order — every block begins at the same left edge, headings at two sizes
    only, running text at 475, so the page is read and not deciphered."""
    S = [join_lists(dots_fix(x)) for x in P['turnkey']]; pg = Pg()
    h1, ps, a = hero(S[0])
    sec4 = S[4]; ks = [it[1] for it in sec4['items'] if it[0] == 'k']
    note = ks[0][0] if isinstance(ks[0], (list, tuple)) else ks[0]
    eco = [x for g in ks[1:] for x in (g if isinstance(g, (list, tuple)) else [g]) if x]
    chain = [x.strip(' .') for x in nop(' '.join(ps[1])).split('.')]
    assert len(chain) == 9 and chain[-1] == 'Project management', chain
    # 01 the residence, and the horizon it retreats below
    # the cover's title is hers. 17.11 17:12 (frame 603:742, «бери текст той, який пише на макеті»): the client's title without its
    # article. 19:48 (frame 610:99, «текст тут змінений, візьми той, що на макеті у мене»): «From Sketch to First Night Home» — the cover
    # now shows exactly that, a sketch becoming the home. The agreed exception to the client's copy on this page; the client's wording
    # stays in content.json and tools/site/verify.py reports it as an EXCEPTION.
    h1 = 'From Sketch to First Night Home'
    # 01 + 02 (18.11 09:27 / 16:14, her frame 637:7894): the page's thought stands ON the cover's photograph, once it is drawn — the name,
    # «The most complete expression of the CI model» in the 60, the client's paragraph and the button. Her wording: the client's sentence
    # «CI Turnkey is the most complete expression of the CI model» is cut into the name and the thought, and its «is» goes (verify.py: EXC).
    assert nop(ps[0][0]) == 'CI Turnkey is the most complete expression of the CI model', ps[0]
    idea_p = ['One team coordinates the complete', 'transformation so you can remain', 'focused on the life waiting at the other', 'side of the project']
    assert ' '.join(idea_p) == nop(' '.join(ps[2])), ps[2]
    pg.add(tk_cover('CI Turnkey', h1, A + 'ch/1450-32.webp', L + '1450-32.webp', L + '1450-32-g.png',
                    [('From Sketch', ''), ('to ', 'First'), ('', 'Night Home')],
                    idea=('CI Turnkey', ['The Most', 'Complete', 'Expression', 'of the CI', 'Model'], idea_p, btn(a[0], 'contact.html'))), 'Turnkey', 'top')
    # 03 the counts — her frame 643:8641 (18.11 16:13). The title is hers («Там текст заголовку відрізняється. Використовуємо те, що в
    # мене на макеті»): «Create a Stunning Home Without Remodel Skills» for the client's «You Shouldn't Have to Become an Expert in
    # Renovation to Create an Extraordinary Home» (verify.py: EXC). What each count is made of stands in the right column, in the
    # client's own words: the nine disciplines, the sentence about people, the sentence about decisions (both from this very block's
    # list of six — block 06 keeps the other four, so nothing is printed twice), and the eight stages by name.
    sec = S[3]; sp = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    six = [x for x in [it[1] for it in sec['items'] if it[0] == 'p'] if len(x) == 6][0]
    st3 = ' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0])
    st8n = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in S[6]['items'] if x[0] == 'h4']
    ppl = [x for x in six if 'coordinate the people behind' in x]; dcs = [x for x in six if 'bring decisions to you' in x]
    assert len(ppl) == 1 and len(dcs) == 1, six
    det = [tk_items(chain),                              # what the nine are: the client's own nine disciplines
           '<p class="t20">%s</p>' % esc(nop(ppl[0])),
           '<p class="t20">%s</p>' % esc(nop(dcs[0])),
           tk_items(st8n)]                               # and the eight stages, by name
    lead3 = ['A major residential project can involve', 'hundreds of people, thousands of decisions,', 'and years of combined expertise']   # her three lines
    assert ' '.join(lead3) == nop(sp[0]), sp[0]
    pg.add(tk_count(label(S[3]), [('Create a Stunning', ''), ('Home', ' Without'), ('', 'Remodel Skills')], lead3, [
        ('Nine', 'disciplines', 'One', 'team', 0, det[0]),
        ('Hundreds', 'of people', 'One', 'point of accountability', 0, det[1]),
        ('Thousands', 'of decisions', 'One', 'conversation at a time', 1, det[2]),
        ('Eight', 'stages', 'One', 'journey', 0, det[3])]), 'Arithmetic')
    # 04 the page's one list
    sec = S[1]; rows = [' '.join(r[1]) if isinstance(r[1], (list, tuple)) else r[1] for r in get(sec, 'row')]
    # the name of each condition in the grid is a run of its own sentence's words (tk_fit asserts it); which run is our choice, hers to change
    NM = [['A Significant', 'Residential', 'Transformation'], ['One Team', 'Responsible'], ['Limited Time'], ['A Highly', 'Personalized', 'Residence'],
          ['Considered', 'Together'], ['A Single Point', 'of Accountability'], ['The Home', 'Finished']]
    assert len(NM) == len(rows), (len(NM), len(rows))
    pg.add(tk_fit(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], list(zip(NM, rows)), A + 'ch/1450-01a.webp',
                  ['For Clients Who', 'Want the Whole', 'Experience', 'Managed']), 'Fit')
    # (the conditions' closing sentence, for 07 One Team)
    sec = S[5]; p5 = [it[1] for it in sec['items'] if it[0] == 'p']
    one5 = [x[0] for x in p5 if len(x) == 1]; whens = max(p5, key=len)
    st5 = ' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0])
    # 04 the ecosystem — her frame 652:9078 (18.11 17:37): the section's heading as the block's name on the field, the client's
    # sentence as the title, the twenty-two names as one mass; «текст бери той, що на макеті» — the label «What's Included» and the
    # client's «Depending on project scope:» are not in it (verify.py: DROP). The mass lets go on the scroll (tk_loose).
    assert nop(h_of(sec4)) == 'The Complete CI Ecosystem' and nop(sp[1]) == 'Your life does not need to revolve around managing all of it', (h_of(sec4), sp[1])
    assert len(eco) == 22 and nop(note) == 'Depending on project scope:', (len(eco), note)
    # 18.11 20:20–20:21: the four sentences and the closing thought of this part of the copy stood as a block of their own (06, no
    # heading) — «непонятно». They follow this block's sentence in the client's text, so they come onto the screen the names have left.
    six7 = [x for x in six if x not in ppl + dcs]   # the other two sentences stand in the counts (02), each beside its own count
    assert len(six7) == 4, six7
    pg.add(tk_loose(['The Complete CI', 'Ecosystem'], [('Your life does not', ''), ('need to ', 'revolve around'), ('', 'managing all of it')], eco,
                    after=(' '.join(six7), st3)), 'Ecosystem')
    # 05 what you receive (17:01: the joints were «громіздкий, неакуратний»; 18:29: the axis on black was «перевантажений, не цікавий»)
    sec = S[2]; pit = [it[1] for it in sec['items'] if it[0] == 'p']
    inter = [x for x in pit if len(x) == 6][0]; short = [x[0] for x in pit if len(x) == 1]
    assert nop(h_of(sec)) == 'Complete Responsibility. Fewer Handoffs' and len(short) == 2, (h_of(sec), short)
    p5l = ['Instead of becoming the central coordinator', 'between separate professionals, you work with one integrated', 'team already communicating internally']
    assert ' '.join(p5l) == nop(short[0]), short[0]
    cl5 = nop(' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0]))
    assert cl5 == 'You see the project as one journey because we manage it as one', cl5
    # 18.11 18:40: on a photograph of the client's own work (the hearth wall of Collectors Home); 20:19: her frames 658:9130 /
    # 658:9201 / 658:9234 over the first version — the type of the first step, the pairs as a row of blocks carried along the
    # horizontal line, the closing sentence in capitals on the crossing. Her frame types «the clients experience»: the client's
    # «the client experience» is kept (a slip of the key, not a change of copy).
    l5 = ['Turnkey should change', 'the client experience']
    assert ' '.join(l5) == nop(get(sec, 'lead')[0][1][0]), get(sec, 'lead')
    c5 = [('You see the', 0), ('project as one', 0), ('journey', 0), ('because we', 1), ('manage it as one', 1)]
    assert ' '.join(t for t, b in c5) == cl5, cl5
    pg.add(tk_recv(label(sec), [('Complete', 1), ('Responsibility.', 1), ('Fewer Handoffs', 0)], l5, short[0], short[1], inter, c5,
                   A + 'ch/1450-22.webp'), 'Receive')
    # 07 the six ways, as one paragraph
    # 07 the conditions and the client's sentence, as one film — her frames 644:8972 and 633:428 (18.11 16:15). The title is hers:
    # «One Team and Complete Responsibility» for the client's «One Team. Complete Responsibility.» (verify.py: EXC)
    pairs = []
    for x in [one5[0]] + list(whens):
        a_, b_ = nop(x).split(', ', 1)
        pairs.append((a_, b_[0].upper() + b_[1:]))
    cl = nop(one5[1]); cut = 'The client should not have to discover'
    assert cl.startswith(cut + ' where'), cl
    rest = cl[len(cut) + 1:]; rest = rest[0].upper() + rest[1:]
    l2 = ['Where one consultant\'s', 'responsibility ends and', 'another begins']
    assert ' '.join(l2) == rest, (l2, rest)
    pg.add(tk_team(label(S[5]), [('One Team', ' and'), ('', 'Complete'), ('', 'Responsibility')], pairs, st5,
                   A + 'ch/1450-23.webp', ['The Client', 'Should Not', 'Have to', 'Discover'], l2), 'One Team')
    # 08 the eight stages as a row of squares — her frame 644:8827 (18.11 16:11): «в карточках тексти маленькі, повторюються. Я хочу,
    # щоб ти з такою самою кількістю тексту написав на кожну карточку свій текст… щоб ти адаптував.» Her own first card is the client's
    # sentence turned to the reader («Understanding You, Your Home…»); the other seven are the client's sentences brought to the same
    # length and the same voice. They are NOT the client's wording any more (verify.py: EXC, one per stage) and carry .wc.
    sec = S[6]
    names = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h4']
    assert names == ['Discovery', 'Strategy', 'Architecture + Design', 'Pre-Construction', 'Build', 'Curate', 'Install', 'Deliver'], names
    pg.add(tk_strip(label(sec), [('One Journey', ''), ('From ', 'Vision to'), ('', 'Home')], [(n, TK_STAGE[n], 0 if n in ('Discovery', 'Curate') else 1) for n in names]), 'Process')   # her own card, and the one sentence that needed nothing
    # 09 the work itself, as a slider — her frame 644:8894 (18.11 16:10). The title is hers: «Projects Delivered by CI Turnkey» for the
    # client's «…Through CI Turnkey» (verify.py: EXC). The project in hand is large in the middle; the focus of each picture is read
    # from her crops (the part of the photograph she kept in the frame).
    sec = S[7]
    pbt = [x for x in get(sec, 'a') if 'portfolio' in x[1]]
    FOC = {'collectors-home': (.528, .652), 'room-to-breathe': (.5, .713), 'urban-sanctuary': (.5, .665)}
    sl = [PROJ[0], PROJ[2], PROJ[1]]                     # in hand, the next (right), and the one before (left) — as in her frame
    pg.add(tk_slider([('Projects ', 'Delivered', ''), ('by CI Turnkey', '', '')], btn(pbt[0][2] if pbt else 'Explore Turnkey Projects', 'portfolio.html'),
                     [(q['name'], q['loc'].split(' · ') + [q['bld']], ph(q['set'], q['tall']), q['slug'] + '.html', FOC[q['slug']]) for q in sl]), 'Projects')
    final_cta(pg, S[9], A + 'ch/1450-29a.webp')
    emit('ci-turnkey.html', 'CI Turnkey', pg, A + 'ch/1450-32.webp')


# ================================================================== solutions (overview): the line becomes each of the four in turn
def solutions():
    S = P['services']; pg = Pg()
    h1, ps, a = hero(S[0])
    # the four ways as panes over one photograph, in the home page's hand: the name in each, and under the pointer the pane fills white while the
    # photograph behind changes (her word of 22:48). Each way's own line is the client's own lead for it.
    W4 = [('CI Turnkey', 'ci-turnkey.html', A + 'ch/1450-24.webp', 'From First Idea to the First Night Home'),
          ('CI Core', 'ci-core.html', A + 'rtb/1430-01a.webp', 'Design + Build, Fully Connected'),
          ('CI Curated', 'ci-curated.html', A + 'ch/1450-34.webp', 'The Home, Considered Beyond Construction'),
          ('CI Wellness', 'ci-wellness.html', A + 'us/1511-06a.webp', 'Better Living, Designed In')]
    assert [nop(get(sec, 'lead')[0][1][0]) for sec in S[1:5]] == [w[3] for w in W4], [nop(get(sec, 'lead')[0][1][0]) for sec in S[1:5]]
    pg.add(sc_four(label(S[0]), h1, W4), 'Solutions', 'top')
    # the page's first thought (16.11 22:58: «Якийсь кусок заголовка, кусок тексту… Незрозуміло»). The intro block set the client's two sentences
    # as a fragment on the text line and another one adrift in the second column. It is now the screen she approved on Portfolio (.iv): the thought
    # large from 600, in lines that alternate in length, the second clause blue; 90 under it the second sentence in the running 20, in three lines.
    tx = [nop(' '.join(x) if isinstance(x, (list, tuple)) else x) for x in ps]
    assert tx == ['Every client, every residence, and every vision is different',
                  'Select the CI solution that aligns with you'], tx   # the client's notes of 23.11.2026: «Replace the support blurb with “Select the CI solution that aligns with you.”»
    # the eyebrow is not the client's copy: it is their own words from the sentence below it («the same standard»), as on Portfolio
    # 18.11.2026 20:39, her frame 658:9256 («перероби цей блок… там, де сірий прямокутник, постав туди фотографію, яку ми ще не
    # використовували»): one screen. The eyebrow on the left field at 158; the thought in the 60 from 600 at 150, in HER three lines
    # (16.11 the same three were «палка» in my setting — this is her own frame, and it stands); the two texts on the foot, 50 from
    # the bottom; and in the right foot corner a square of 427 — a photograph of the client's own work used nowhere else on the
    # site (us/1530-07a: the niche with the picture and the two lamps — «every vision is different»).
    pg.add('<section class="iv ivq" id="@ID@">\n'
           '  <p class="iv-k rv"><span class="wc">The Same Standard</span></p>\n'
           '  <p class="t60s rv ivq-h">Every client, every<br> residence, and<br> <span class="cb">every vision is different</span></p>\n'
           '  <div class="ivq-f">\n'
           '    <p class="t20 iv-p">Select the CI solution that aligns with you</p>\n'
           # 23.11.2026, the client's notes: «Each offering is a holistic, single-source solution from start to finish, delivered by CI alone.
           # Make clear the solutions are tiered to the client's needs.» No wording of theirs for the page, so their own words are set as a
           # sentence (.wc) between the invitation and the floor
           '    <p class="t20 iv-p"><span class="wc">Each is a holistic, single-source solution from start to finish,<br class="bd"> delivered by CI alone and tiered to your needs</span></p>\n'
           # 16.11 23:01 («якщо тексту тобі не стає, то допиши, але не треба такі обгризки лишати»): the client's two sentences do not fill the
           # screen, so a second thought is written here from what their own pages say of the four ways — marked .wc, to be replaced by their text
           '    <p class="t20 iv-p">To holistically create an impact on your life,<br class="bd"> our projects typically begin at $500K</p>\n'   # 23.11.2026: «Feature the $500K project floor in several places across the site» — in place of my filler
           '  </div>\n'
           '  <div class="ivq-ph rv"><img src="%sus/1530-07a.webp" alt="" loading="lazy"></div>\n'
           '</section>' % A)
    N = 4; t0 = .3; d = 1.0
    o = ['<section class="film" data-fig="plan" data-n="4" data-t0="%s" data-d="%s" data-len="%.2f" data-emb="turnkey,core,curated,wellness" id="@ID@">' % (t0, d, t0 + N * d + .6), '  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n    <div class="sc">']
    for i, sec in enumerate(S[1:5]):
        T = t0 + i * d; last = i == N - 1
        k = '%.2f %.2f %s' % (T, T + .14, '99 99' if last else '%.2f %.2f' % (T + d - .12, T + d))
        k2 = '%.2f %.2f %s' % (T + .08, T + .26, '99 99' if last else '%.2f %.2f' % (T + d - .12, T + d))
        tag = label(sec); nm = h_of(sec); lead = get(sec, 'lead')[0][1][0]; ps_ = [it[1][0] for it in sec['items'] if it[0] == 'p']; a_ = get(sec, 'a')[0]
        # 16.11 23:09: «текст розкиданий повністю: заголовок там, другий заголовок там, опис там, кнопка там». One composition now, read in order:
        # the small name and the big one stand on the text line over the line itself; under the line the lead on the same text line, the description
        # beside it at 1040, and the button at the foot of the same column
        # 17.11 12:58: the small word over the name sat on its own anchor, so a name of two lines ate the gap. The two are one block now,
        # hung from the same foot, and the distance between them is a margin — the same for «CI Core» as for «CI Wellness + In-Home Longevity»
        # 18.11.2026 20:50, her frame 605:99 (the first way, drawn over the export of 17.11; «перероби цей блок за таким принципом…
        # акуратно»): the small name and the big one CENTRED at the head of the screen (50 / 95); on the left field a statement in
        # the 24 at 310, what the way consists of at 488, the closing paragraph on the foot; the button centred on the foot; the
        # plan in the middle of the screen. For CI Turnkey she set it herself: the statement is the first paragraph, its ten
        # disciplines stand in two columns of five, «One team, one roof…» is on the foot — and the lead «From First Idea to the
        # First Night Home» is not in this state (it stands on this page's cover). The other three follow the same order with
        # what they have: the lead as the statement, the first paragraph at 488, the second on the foot.
        o.append('      <div class="m sw-hd" data-k="%s"><p class="lab3 ey sw-k">%s</p><p class="t60 sw-h nb">%s</p></div>' % (k, esc(tag), brk(nm, 22)))
        if i == 0:
            # the client's notes of 23.11.2026 replaced CI Turnkey's copy («Our premier offering of concierge-level services. A complete renovation from
            # concept to completion consisting of…»): two sentences now, so her frame's ten disciplines in two columns and the foot line are not there
            assert len(ps_) == 2, ps_
            stmt = ps_[0]; mid = '<div class="t20s sw-t"><p>%s</p></div>' % esc(nop(ps_[1])); foot = ''
        elif nm == 'CI Curated':
            # 23.11.2026, the client's notes: «CI Curated: a hyper-personalized layer for clients who love the bones of their residence and want to
            # make it their own. A beautiful home, made personal, without a gut renovation.» As she did for CI Turnkey, the lead stays on the
            # cover and the statement of this state is the client's own line; who it is for stands under the first paragraph (their words,
            # without «a hyper-personalized layer», which the foot already says: «A highly personalized layer of design»)
            assert len(ps_) == 2, ps_
            pos = get(sec, 'strong')[0][1]; assert len(pos) == 2, pos
            stmt = pos[0]; mid = '<div class="t20s sw-t"><p>%s</p><p>%s</p></div>' % (esc(nop(ps_[0])), esc(nop(pos[1]))); foot = ps_[1]
        else:
            assert len(ps_) == 2, ps_
            stmt = lead; mid = '<div class="t20s sw-t"><p>%s</p></div>' % esc(nop(ps_[0])); foot = ps_[1]
        o.append('      <div class="m sw-bd" data-k="%s"><p class="t34 sw-l">%s</p>%s'
                 '<div class="t20s sw-f"><p>%s</p></div><div class="sw-btn">%s</div></div>'
                 % (k2, esc(nop(stmt)), mid, esc(nop(foot)), btn(a_[2], href(a_[1]))))
        if i == 2:
            # 23.11.2026, the client's notes: «In the Turnkey / Core / Curated graphic, show wellness running through all three. Wellness is in
            # everything.» The plan carries the air of CI Wellness through all three states, in the site's blue (inner.js plan()); beside it, on
            # the right foot, the client's own sentence in the same blue, from the first way until the fourth takes over. In the phone flow it
            # stands once, between CI Curated and CI Wellness
            o.append('      <div class="m sw-wl" data-k="%.2f %.2f %.2f %.2f"><p class="t20s cb">Every CI residence<br class="bd"> includes wellness</p></div>'
                     % (t0 + .1, t0 + .3, t0 + 3 * d - .12, t0 + 3 * d))
    o.append('    </div>\n  </div>\n</section>')
    pg.add('\n'.join(o), 'Four Ways')
    final_cta(pg, S[5], A + 'ch/1450-02a.webp')
    emit('solutions.html', 'Solutions', pg)
solutions()

# ================================================================== broker program
def brokers():
    """The Broker Program, thought through again (18.11.2026 23:09, of this page and Partnerships: «вони не цікаві. Там дуже багато
    просто шматків тексту, незрозуміло, без метафор, без візуалізації… думав метафорами і переробив на дуже високому рівні, акуратно
    і зрозуміло… цікава креативна анімація. Бери за основу сторінки, які ми вже проробили. Але не повторяйся»). The page's own verb
    is SEE («Help Your Clients See What a Property Could Become», «Turn Hesitation Into Vision»), so:
      cover     the page's own (the window in the tower at night) stays;
      Idea      the thought on its own black screen;
      Why       the page's own block: a room OUT OF FOCUS — a property the buyer cannot yet read — comes into focus while the
                client's three hesitations are read one at a time (tk_words, mode 'focus'); then «You introduce more than a
                contractor» stands alone on the sharp room;
      Journey   the five stages from property to move-in as a row of squares;
      How       the five ways CI helps, on the grid over a photograph (the client's own row names);
      Receive   the ten names of what the client's client receives let go, and the cleared screen says «Their path is already
                clear» (Turnkey's scatter, with this page's own sentence);
      Business  a still black screen.
    A full-screen photograph never follows another. Every word is the client's."""
    S = [dots_fix(s) for s in P['brokers']]; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(sc_window(label(S[0]), h1, 'assets/night/tower.jpg', A + 'ch/1450-20a.webp'), 'Brokers', 'top')
    idea = ['Every property holds potential.', 'CI helps your clients see it']
    assert ' '.join(idea) == nop(' '.join(ps[0])), ps[0]
    thought(pg, 'Broker Program', idea, 1, [brk_lines(nop(' '.join(ps[1])), 62), tuple(nop(x) for x in ps[2])], btn(a[0], 'contact.html'), A + 'ch/1450-18.webp', '50% 50%')
    # 03 why — the page's own block: the room comes into focus as the three hesitations pass
    sec = S[1]; wp = [nop(' '.join(it[1])) for it in sec['items'] if it[0] == 'p']
    doubts = [x.strip() for x in wp[0].split('. ')]; s3 = wp[2].split('. ', 1)
    c3 = [('You introduce', 0), ('more than', 1), ('a contractor', 1)]
    assert len(doubts) == 3 and len(s3) == 2 and ' '.join(x for x, _ in c3) == s3[0], (doubts, s3)
    pg.add(tk_words(label(sec), [('Turn Hesitation', 0), ('Into Vision', 1)], [], doubts, [wp[1]], c3, A + 'ch/1450-24.webp', mode='focus', wsmall=True, foot3=[s3[1]]), 'Why')
    # 04 the journey: five stages as a row of squares; the sentences are the client's own
    sec = S[2]
    names = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h4']
    txts = [x[1][0] if isinstance(x[1], (list, tuple)) else x[1] for x in sec['items'] if x[0] == 'p']
    assert len(names) == len(txts) == 5, (names, txts)
    LN = [0, 1, 2, 1, 2]                                                       # who leads: You · CI · Your client · CI · Your client — the subjects of the client's own five sentences
    assert txts[0].startswith('You ') and txts[1].startswith('CI ') and txts[2].startswith('Your client ') and 'CI team' in txts[3] and 'Your client' in txts[4], txts
    pg.add(br_relay(label(sec), [('One Seamless', 0), ('Client Journey', 1)], ['You', 'CI', 'Your client'], [(n, t_, l) for n, t_, l in zip(names, txts, LN)], A + 'us/1511-12a.webp'), 'Journey')
    # 05 how CI helps: the client's five row names on the grid, each opening its sentence
    sec = S[4]; rows = get(sec, 'row')
    NMS = [['Renovation', 'Perspective'], ['A Trusted', 'Next Step'], ['Confidence', 'at Every', 'Decision'], ['Concierge-Level', 'Continuity'], ['A Partner Who', 'Honors the', 'Relationship']]
    assert [' '.join(x) for x in NMS] == [r[1] for r in rows], [r[1] for r in rows]
    pg.add(tk_fit(label(sec), h_of(sec), '', list(zip(NMS, [' '.join(r[2][0]) for r in rows])), A + 'ch/1450-22.webp',
                  ['Help Clients', 'See Beyond What', 'Exists Today'], free=True), 'How')
    # 06 what your clients receive: the ten names stand as one mass and let go — the screen clears and carries «Their path is already clear»
    sec = S[5]; ten = [it[1] for it in sec['items'] if it[0] == 'dots'][0]
    rp = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']; rs = nop(' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0]))
    assert len(ten) == 10 and rs == 'Their path is already clear' and nop(h_of(sec)) == 'One Team, From Keys to Move-In', (ten, rs, h_of(sec))
    pg.add(br_point(label(sec), [('One Team, From', 0), ('Keys to Move-In', 1)], ten, rp[0], rs, A + 'us/1530-04.webp'), 'Receive')
    # 07 why this strengthens your business: a still black screen
    sec = S[6]; bp = [nop(' '.join(it[1])) for it in sec['items'] if it[0] == 'p']
    bs = nop(' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0]))
    assert len(bp) == 3 and nop(h_of(sec)) == 'More Than a Referral. An Extension of Your Client Experience', (bp, h_of(sec))
    pg.add(iv_quiet(label(sec), [('More Than a Referral.', 0), ('An Extension of Your', 1), ('Client Experience', 1)],
                    [brk_lines(bp[0] + ' ' + bp[1], 64), brk_lines(bp[2], 64), (bs,)], A + 'us/1511-10.webp', '50% 40%'), 'Business')
    final_cta(pg, S[-1], A + 'rtb/1430-01a.webp', top=True)
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
def pp_groups(sec):
    """a section of partners: the paragraphs before the first name, then [name, [paragraphs], [closing lines]] for each name, and the link"""
    intro_ = []; groups = []; link = None
    for it in sec['items']:
        if it[0] in ('label', 'h2'): continue
        if it[0] == 'h3': groups.append([it[1], [], []])
        elif it[0] == 'a': link = it
        elif not groups: intro_.append(' '.join(it[1]))
        elif it[0] == 'strong': groups[-1][2] += list(it[1])
        else: groups[-1][1].append(' '.join(it[1]))
    return intro_, groups, link
def partnerships():
    """Partnerships, built to the second storyboard (19.11.2026 09:02: «Ну, давай, збирай, подивимося, як воно працює все»; 08:38, of
    the first one: «якось занадто багато кружечків» — the circle is on the page ONCE, at its end). The page's words are TOGETHER
    and «around every client», so:
      cover      the page's own (one photograph in strips that come together) stays;
      Idea       the thought on its own black screen, as on the other pages;
      Why        ONE full-screen photograph in six parts for two sections of the copy: the parts come into an ordered grid («World-
                 Class Expertise. One Seamless Experience.»), each lights with one of the six benefits, then the seams close;
      How        black, ruled by the two centre lines: a photograph goes from quarter to quarter clockwise, an expert to a quarter
                 («The Right Expertise at the Right Moment»); our square on the crossing;
      Brokers    a full-screen photograph, the names large on it;
      Lifestyle  black: a photograph at the right edge grows wider with each partner («…Expand the Idea of Better Living»);
      Vendors    full-screen photographs that change with the names (water, sleep, light); at the end the type leaves and the
                 picture comes forward («The technology recedes. The experience of home comes forward»);
      Vision     black: the five standards laid down like five samples of material;
      Value      black: the one circle — the eight names round a home, closed on «That is the CI ecosystem».
    A full-screen photograph never follows another; every black screen carries a photograph. Every word is the client's."""
    S = [join_lists(dots_fix(s)) for s in P['partnerships']]; pg = Pg()
    J = lambda ls: ' '.join(x for x, _ in ls)
    W_ = lambda *xs: [A + x + '.webp' for x in xs]
    h1, ps, a = hero(S[0])
    pg.add(sc_strips(label(S[0]), h1, A + 'us/1511-07a.webp', centre=True, lines=[('Better', 0), ('Together', 1)], cross=True), 'Partners', 'top')   # 19.11 11:58–13:24: centred, two lines, «Together» blue, on the two centre lines
    # 02 the thought
    idea = ['Exceptional homes are shaped', 'by exceptional collaboration']
    para_ = ['CI partners with leaders across real estate, wellness, lifestyle,', 'technology, design, and luxury residential products.', 'We bring world-class expertise into every project',
             'while serving as your single point of coordination']
    assert ' '.join(idea) == nop(' '.join(ps[0])) and ' '.join(para_) == nop(' '.join(ps[1])), ps
    thought(pg, 'Partnerships', idea, 1, [para_], None, A + 'ch/1450-23.webp', '62% 42%')
    # 03 why + what it means: one photograph in six parts
    s1, s2 = S[1], S[2]
    w1 = [' '.join(it[1]) for it in s1['items'] if it[0] in ('lead', 'p')]; st1 = nop(' '.join(get(s1, 'strong')[0][1])); st2 = nop(' '.join(get(s2, 'strong')[0][1]))
    t1 = [(['World-Class', 'Expertise'], 0), (['One Seamless', 'Experience'], 1)]; c1 = [('Together, we build', 0), ('a trusted ecosystem', 0), ('around every client', 1)]
    t2 = ['Access', 'Coordination', 'Decisions']; c2 = [('You gain world-class expertise.', 0), ('We manage every detail', 1)]   # 21.11: «Better» stays, the word under it changes
    assert '. '.join(' '.join(ls) for ls, _ in t1) == nop(h_of(s1)) and J(c1) == st1 and '. '.join('Better ' + w_ for w_ in t2) == nop(h_of(s2)) and J(c2) == st2 and len(w1) == 3, (h_of(s1), st1, h_of(s2), st2, w1)
    pg.add(pp_parts(label(s1), (nop(h_of(s1)), t1), w1, c1, label(s2), (nop(h_of(s2)), 'Better', t2), [r[1] for r in get(s2, 'row')], c2, A + 'us/1511-12a.webp'), 'Why')
    # 04 the right expertise at the right moment: four quarters, clockwise
    sec = S[3]; qp = [' '.join(it[1]) for it in get(sec, 'p')]; four = sents(qp[0])
    WHO = ['A broker', 'A wellness expert', 'A technology partner', 'A specialized vendor']
    cq = [('Our partners bring depth.', 0), ('CI orchestrates the whole', 1)]
    assert len(four) == 4 and all(s_.startswith(w_ + ' ') for w_, s_ in zip(WHO, four)) and J(cq) == nop(' '.join(get(sec, 'strong')[0][1])) and nop(h_of(sec)) == 'The Right Expertise at the Right Moment', four
    pg.add(pp_quart(label(sec), [('The Right Expertise', 0), ('at the Right Moment', 1)], get(sec, 'lead')[0][1][0], [(w_, s_[len(w_) + 1:]) for w_, s_ in zip(WHO, four)], qp[1], cq,
                    W_('us/1530-04', 'us/1511-06a', 'ch/1450-16a', 'us/1511-01a')), 'How')
    # the names in their lines (a name is type here: no logos)
    NL = {'Carrie McCormick': ['Carrie', 'McCormick'], "Jameson Sotheby's International Realty": ["Jameson Sotheby's", 'International Realty'], 'The Luxury Bed Collection': ['The Luxury', 'Bed Collection']}
    ring = []
    # 05 the brokers: one full-screen photograph
    sec = S[4]; in_, gs, link = pp_groups(sec); sub = ['From the Property Search', 'to the Finished Home']
    assert not in_ and [g_[0] for g_ in gs] == [' '.join(sub), 'Carrie McCormick', "Jameson Sotheby's International Realty"] and len(gs[0][2]) == 2 and link, gs
    pg.add(pp_names(label(sec), [(h_of(sec), 0)], sub, gs[0][1], gs[0][2], [(NL.get(g_[0], [g_[0]]), g_[1]) for g_ in gs[1:]], W_('rtb/1430-01a'), None, btn(link[2], href(link[1]))), 'Brokers')
    ring += [g_[0] for g_ in gs[1:]]
    # 06 the strategic partners: the photograph grows wider with each
    sec = S[5]; in_, gs, _ = pp_groups(sec); tw = [('Relationships That', 0), ('Expand the Idea', 0), ('of Better Living', 1)]
    assert len(in_) == 3 and [g_[0] for g_ in gs] == ['BIÂN', 'Dr. Alka', 'Lamborghini'] and J(tw) == nop(h_of(sec)), gs
    pg.add(pp_wide(label(sec), tw, in_, [(g_[0], g_[1], ' '.join(g_[2]) if g_[2] else None) for g_ in gs], A + 'ch/1450-22.webp'), 'Lifestyle')
    ring += [g_[0] for g_ in gs]
    # 07 the vendors: three tall photographs in their own light (water | sleep | light), all the type in a black band under them; at the end the band goes down and the pictures take the screen
    sec = S[6]; in_, gs, _ = pp_groups(sec); tv = [('Exceptional Products,', 0), ('Seamlessly Integrated', 1)]
    cv = [('The technology recedes.', 0), ('The experience of home comes forward', 1)]
    assert len(in_) == 2 and [g_[0] for g_ in gs] == ['Hydrology', 'The Luxury Bed Collection', 'Lutron'] and J(cv) == nop(' '.join(gs[-1][2])) and J(tv) == nop(h_of(sec)), gs
    pg.add(pp_trip(label(sec), tv, in_, [(NL.get(g_[0], [g_[0]]), g_[1]) for g_ in gs], W_('ch/1450-27', 'us/1511-02a', 'ch/1450-08a'), cv), 'Vendors')   # photographs no other page shows (their project pages apart)
    ring += [g_[0] for g_ in gs]
    # 08 shared vision: her own plates (the squares of CI Turnkey's process), no photographs
    sec = S[7]; five = get(sec, 'p')[0][1]; ts = [('We Choose Partners', 0), ('the Way We Choose Materials:', 0), ('With Intention', 1)]
    cs = [('Together, we bring exceptional care', 0), ('to every part of the whole', 1)]
    assert len(five) == 5 and J(cs) == nop(' '.join(get(sec, 'strong')[0][1])) and J(ts) == nop(h_of(sec)), five
    # each photograph is chosen for what its standard says (21.11 12:00: «рандомні картинки, які без змісту»):
    #   Quality that endures                 — stone: a basin cut from one block of marble (ch/1450-12)
    #   Expertise that elevates              — a stair: the hardest thing in a house to build, and it goes up (rtb/1430-07)
    #   Long-term thinking                   — the long view: a room that looks out over the city to the horizon (ch/1450-14; us/1530-04 is on every page)
    #   Service centered on the client       — a room built round one person's own things: the collector's dressing room (ch/1450-10a)
    #   Innovation that enriches how you live — light built into the shower wall: technology you live with, not look at (us/1530-02)
    assert five == ['Quality that endures.', 'Expertise that elevates.', 'Long-term thinking.', 'Service centered on the client.', 'Innovation that enriches how you live.'] or [nop(x) for x in five] == ['Quality that endures', 'Expertise that elevates', 'Long-term thinking', 'Service centered on the client', 'Innovation that enriches how you live'], five
    # 12:05: «взагалі картинки не використовувати, просто плашки» — her own plates from CI Turnkey. The track with these photographs is kept (pp_track):
    #   pp_track(label(sec), ts, lead, five, cs, W_('ch/1450-12', 'rtb/1430-07', 'ch/1450-14', 'ch/1450-10a', 'us/1530-02'))
    pg.add(pp_plates(label(sec), ts, get(sec, 'lead')[0][1][0], five, cs), 'Vision')
    # 09 the value of working together: the one circle
    # 21.11 12:17: «щоб була симетрія: білий текст плюс-мінус такий, як і синій, по масиву» — the closing sentence is one line either side of the ring
    sec = S[8]; six = get(sec, 'p')[0][1]; cr = (['That is the'], ['CI ecosystem']); tr = (['A Stronger', 'Network'], ['Around', 'Every Client']); J2 = lambda t: ' '.join(t[0] + t[1])
    assert len(six) == 6 and len(ring) == 8 and J2(cr) == nop(' '.join(get(sec, 'strong')[0][1])) and J2(tr) == nop(h_of(sec)), (six, ring)
    pg.add(pp_ring(label(sec), tr, get(sec, 'lead')[0][1][0], list(zip(six[0::2], six[1::2])), cr, W_('ch/1450-11', 'ch/1450-13', 'ch/1450-03a', 'ch/1450-06')), 'Value')   # round photographs no other page shows
    final_cta(pg, S[-1], A + 'ch/1450-06.webp')            # the ring's last round window opens onto THIS photograph (the same file, the same cut and grade): pp_ring's last image
    pg.add('<div class="pp-hold" id="@ID@" aria-hidden="true"></div>')   # room for the closing block to stay in place after the ring has opened onto it
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
    # 16.11 19:33 («тобі треба зробити всі проєкти»): every project of the library has its own page now — nothing opens the client's
    # current site any more, and no tile is dead. 500 W Superior had one photograph and no text anywhere, so its place in her grid is
    # taken by the next project of the client's own portfolio, Modern Deco Home; when CI sends the Superior material it comes back.
    ch_, us_, rtb_ = PROJ[0], PROJ[1], PROJ[2]
    def parts(p): return p['loc'].split(' · ') + [p['bld']]
    # name, location, building, size, link, tags, picture
    LIB = [(q['name'], q['loc'], q['bld'], q.get('facts', {}).get('Size', ''), q['slug'] + '.html', q.get('tags', 'chicago ci-turnkey'),
            ph(q['set'], q['tall'])) for q in PROJ]
    CELL = [('Collectors Home', 3, 1, True), ('Showpiece Home', 1, 1, False), ('Modern Deco Home', 1, 2, False), ('Above the Park', 2, 2, False), ('Urban Sanctuary', 4, 2, False),
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
    # Explore the Work — the gallery. Her reference htarchitecte.com/en as it really stands (16.11 22:23: «Там все відбувається в межах одного екрану.
    # Горизонтальний скрол» — the grid I had built was that site's other view, reached by its own toggle). Measured off her screenshot:
    # the photographs stand along the FOOT of one screen, all of the same height (0.54 of it), each its own width, 0.056 of the height between them;
    # above them the screen is empty but for the mark and the menu; the row is walked sideways. No names on the row — a name appears only under the
    # pointer (22:14), and every other photograph falls back to grey. Ours: the title and the filters stand in that empty upper half.
    chips = ['All Projects', 'CI Core', 'CI Curated', 'CI Turnkey', 'Wellness', 'Chicago', 'South Florida']
    ORDER = ['Collectors Home', 'Urban Sanctuary', 'Room To Breathe', 'Modern Deco Home', 'Showpiece Home', 'Above the Park', 'Lakeshore Luxury', 'Contemporary Comfort', 'Sky-High Condo']
    byn = {x[0]: x for x in LIB}; assert sorted(ORDER) == sorted(byn)
    # the gallery shows a project's own picture, the one its card carries; Showpiece Home's (444-Grant files) is only 1200 wide on the client's site, so that one
    # takes the next picture of the same project until CI sends the files
    gim = {q['name']: ph(q['set'], q['tall'] if q['name'] == 'Showpiece Home' else q['card']) for q in PROJ}
    def cnt(f): return 9 if f == 'all' else sum(1 for n in ORDER if (' ' + byn[n][5] + ' ').find(' ' + f + ' ') >= 0)
    # a filter the client has no project under is shown, but it is dead and says so — it lights up when CI sends work for it
    ch = ''.join('<button class="chip%s" type="button" data-f="%s"%s>%s</button>' % (
        ' on' if i == 0 else (' off' if cnt('all' if i == 0 else slug(c)) == 0 else ''), 'all' if i == 0 else slug(c),
        ' disabled aria-disabled="true" title="No projects under this filter yet"' if i and cnt(slug(c)) == 0 else '', c) for i, c in enumerate(chips))
    items = ''.join('<a class="gl-it" href="%s" data-tags="%s"><span class="gl-nm lab3">%s</span><span class="gl-im"><img src="%s" alt="%s" loading="lazy"></span></a>' % (
        hr, tg, esc(nm), gim[nm], esc(nm)) for nm, lc, bd, sz, hr, tg, im in [byn[n] for n in ORDER])
    assert nop(h_of(S[3])) == 'Explore the Work', h_of(S[3])
    pg.add('<section class="glx" id="@ID@">\n  <div class="gl-stg">\n'
           '    <div class="gl-hd">\n      <h2 class="t60 gl-h">Explore<br>the Work</h2>\n      <div class="chips" data-gal="gl">%s</div>\n    </div>\n'
           '    <div class="gl-vp"><div class="gl-rail">%s</div></div>\n'
           '    <p class="gl-none lab3"><span class="wc">No projects under this filter yet</span></p>\n  </div>\n</section>' % (ch, items), 'Library')
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
    # each wrapped in <span class="wc"> so that it can be found and replaced (her word of 16.11 13:24: no brackets, no dimming — a stand-in text)
    D = p.get('draft', {})
    def wc(key, tpl): return '<span class="wc">%s</span>' % esc(D[key]) if key in D else esc(tpl)
    cov = ph(p['set'], p['cover'])
    pg.add('<section class="film wl" data-fig="wall" data-len="0" id="@ID@">\n  <div class="stg">\n    <canvas class="ln" aria-hidden="true"></canvas>\n'
           '    <div class="wl-p"><img src="%s" alt="%s"><i class="wl-sh"></i></div>\n'
           '    <p class="lab3 ey wl-k">%s</p>\n    <h1 class="t111 wl-h">%s</h1>\n    <p class="t20 wl-s"><span>%s</span></p>\n  </div>\n</section>'
           % (cov, nm, esc(p['loc']), '<br>'.join(esc(x) for x in p['lines']), wc('lead', ' '.join(get(S[0], 'lead')[0][1]))), 'Project', 'top')
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
    dl = [(k, v) for k, v in dl if k in known or (k == 'Client' and 'client' in D) or not ' '.join(v).strip().startswith('[')]   # 16.11: no bracketed row — a fact we do not have is not shown at all
    def val(k, v):
        if k == 'Client' and 'client' in D: return wc('client', '')
        x = known.get(k, ' '.join(v))
        return '<br>'.join(esc(y) for y in x.split(' / ')) if k == 'Scope' and k in known else esc(x)   # the scope: an item a line
    goal = get(sec, 'h3')[0][1]; gp = [it[1][0] for it in sec['items'] if it[0] == 'p']
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 ey rv g4-k">%s</p>\n    <div class="g4-b pj-st rv"><h3 class="lab3 ey pj-in">%s</h3><p class="t60s">%s</p></div>\n  </div>\n'
           '  <div class="g4 pj-2">\n    <h2 class="lab3 ey rv g4-k">%s</h2>\n    <dl class="g4-b pj-tb">%s</dl>\n  </div>\n</section>'
           % (esc(label(sec)), esc(goal), wc('goal', ' '.join(gp)), esc(nop(h_of(sec))), ''.join('<div class="rv"><dt class="lab3">%s</dt><dd>%s</dd></div>' % (esc(k), val(k, v)) for k, v in dl)))
    # design vision: the concept at the spine, its paragraphs small in the fourth column; then the first staggered pair
    sec = S[2]; ps_ = [' '.join(it[1]) for it in sec['items'] if it[0] in ('p', 'lead')]; assert len(ps_) == 3 and ps_[0].startswith('The design began with [') and ps_[2].startswith('['), ps_
    pv = [wc('began', nop(ps_[0])), esc(nop(ps_[1])), wc('narrative', nop(ps_[2]))]
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 ey rv g4-k">%s</p>\n    <h2 class="t60 rv pj-h">%s</h2>\n    <div class="pj-tx">%s</div>\n  </div>\n%s\n</section>'
           % (esc(label(sec)), wc('concept', h_of(sec)), ''.join('<p class="t20 rv">%s</p>' % x for x in pv), rows(PL[:1])), 'Vision')
    # the gallery: staggered on the column lines
    ttl = sub(h_of(S[3])).replace('[', '').replace(']', ''); assert ttl == 'Inside ' + nm, ttl
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 ey rv g4-k">%s</p>\n    <h2 class="t60 rv pj-h">Inside<br>%s</h2>\n  </div>\n%s\n</section>'
           % (esc(label(S[3])), esc(nm), rows(PL[1:])), 'Gallery')
    # behind the design: hundreds of strokes become one line; the three decisions are the client's placeholders
    sec = S[4]; rws = get(sec, 'row'); ld = get(sec, 'lead'); q0 = [(.75, .95, 1.35, 1.5), (1.5, 1.65, 1.95, 2.1), (2.1, 2.25, 2.6, 2.75)]
    assert len(rws) == 3 and ld, rws
    dd = D.get('dec'); names = [d_[0] for d_ in dd] if dd else [x[1] for x in rws]
    dec = ''.join('      <p class="t20 m p-cbr" data-k="%s %s %s %s">%s</p>\n' % (q0[i] + (('<span class="wc"><span class="dn">%s</span><br> %s</span>' % (esc(dd[i][0]), '<br class="bd"> '.join(esc(y) for y in dd[i][1].split(' / ')))) if dd else '%s<br> %s' % (esc(x[1]), esc('[%s]' % ' '.join(x[2][0]))),)) for i, x in enumerate(rws))
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
    pg.add('<section class="nx3" id="@ID@">\n  <p class="lab3 ey nx3-k">Next project</p>\n  <div class="nx3-m"><h2 class="t60 rv"><a href="%s.html">%s</a></h2><p class="lab3 nx3-l rv">%s</p></div>\n'
           '  <div class="nx3-b rv">%s</div>\n  <a class="nx3-i cd rv" href="%s.html" tabindex="-1" aria-hidden="true"><span class="im"><img src="%s" alt="" loading="lazy"></span></a>\n</section>'
           % (nxt['slug'], '<br>'.join(esc(x) for x in nxt['lines']), sqr(nxt['loc'].split(' · ') + [nxt['bld']]), btn('Explore', nxt['slug'] + '.html'), nxt['slug'], ph(nxt['set'], nxt['card'])))
    final_cta(pg, S[6], ph(p['set'], p['cta']), top=p.get('top', False))
    emit(p['slug'] + '.html', nm, pg, cov)
for i, p in enumerate(PROJ): (project_collection if p.get('idea') == 'collection' else project_old)(p, PROJ[(i + 1) % len(PROJ)])

# 16.11 19:50 (her rule of 13:24, now for the whole site): where the client has not sent text, we write a stand-in ourselves —
# never a bracketed template field. The six entries below, the article and its three «More» rows are OURS, built on what CI itself
# says it does (their own copy and their own site); every one of them is marked <span class="wc"> so it can be found and replaced.
# The months are stand-ins too: no event, no claim is made beyond what the client has already published.
NEWS_ROWS = [('Why One Team Changes the Outcome', 'Perspectives', 'November 2026'),
             ('Collectors Home on the Fifty-Fifth Floor', 'Projects', 'October 2026'),
             ('What Wellness Looks Like When It Is Built In', 'Perspectives', 'October 2026'),
             ('How a Property Becomes a Home', 'Partnerships', 'September 2026'),
             ('Procurement Is a Design Decision', 'Perspectives', 'September 2026'),
             ('An Open First Floor in Lincoln Park', 'Projects', 'August 2026')]
ART = {'head': 'Why One Team Changes the Outcome', 'cat': 'Perspectives', 'date': 'November 2026',
       'lead': 'When the people who design a home are the people who build it, the decisions stop being handed over and start adding up.',
       'ps': ['A renovation of any size is a long sequence of decisions, and most of them depend on a decision made earlier. '
              'Where design, construction and procurement sit in different firms, each of those dependencies becomes a handoff, and every handoff is a place where the intent can thin out.',
              'Under one roof the same team carries the drawing into the field. A material is chosen knowing what it costs to install, '
              'a lighting plan is drawn knowing where the millwork lands, and a delivery date is set by the people who will be standing in the room when it arrives.',
              'That is also why the schedule holds: nothing waits for a translation between firms. CI puts the saving at about a fifth of the project time, '
              'and the clients who notice it most are the ones who never had to chase it.',
              'It shows in small things first: a stone seam that lands on a cabinet line, a switch where a hand expects it, '
              'a delivery that arrives the week the room is ready for it.'],   # 21.11: a fourth, so the closing paragraph is not set twice
       'sub': 'What it looks like in the home',
       'quote': 'The test of an integrated team is not the first drawing. It is the hundredth decision.',
       'close': 'A home finished this way reads as one idea rather than a set of good parts: the proportions, the materials and the light belong to each other, '
                'because the same people were responsible for all three.'}
# ================================================================== news + article
NEWS_IMG = ['us/1511-08a', 'ch/1450-10a', 'rtb/1430-03a', 'rtb/1430-09a', 'ch/1450-07a', 'rtb/1430-06']   # stand-ins with the working copy: the client's work, photographs shown only on their project pages
NT_PAT = [1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0]                                                           # the grid's rhythm, four columns: 2·1·1 / 1·1·2 / 2·2 / 1·2·1 (the same list is in js/inner.js)
NEWS_CATS = ['Projects', 'Perspectives', 'Partnerships', 'Press', 'CI News']
def news():
    """The blog, on her two references (21.11.2026 10:47). primeasialeather.com/highlights: «сподобалося, як показані ці фільтри. Можна в
    нашій стилістиці зробити таку кнопку якусь прикольну і отак само показати… І також мені подобається там сітка. Але там не наша
    стилістика, заокруглені карточки — потрібно все в нашій робити.» studiodado.com/blog: «подобається загальний вайб».
    Read in the browser. PrimeAsia: a grid of four columns in which a tile takes two columns or one in a changing rhythm, small tiles
    standing at the head of their row, the picture 5 : 6, the title under it; the filter is ONE button fixed on the foot of the screen in
    the middle, a column wide, that opens UPWARD into a list of tick-boxes and keeps its label on the foot. Studio Dado: a very large
    title across the page, tall sharp-cornered photographs, a lot of air. Ours: the same grid on our fields (50, gaps 25, rows 150 apart),
    square corners, the card's line in our small caps with the blue square; the filter is our white block (the square in its corner, the
    label on its foot) that grows upward, a plus that becomes a minus, square tick-boxes. It stands where the chapter rail stands on
    other pages (the rail is not shown here). Every article is working copy (.wc); the photographs are stand-ins from the client's work."""
    S = P['news']; pg = Pg()
    h1, ps, a = hero(S[0])
    # THE HEAD, rebuilt 21.11.2026 11:20–11:21. Of the first build (name, title, the lead, a paragraph at another edge, then «All CI News» and the
    # lead once more): «Що це за рандом із тексту? Він весь розкиданий, не зібраний, просто якась шапка тексту» and «ти там лишив all news, потім
    # project, перспективи… це ці фільтри? Для чого ти їх там лишив, якщо в нас є вже внизу ця кнопка». So the head is THREE things on ONE edge —
    # the name, the title, one sentence (the client's paragraph, in the 34, its second line blue) — and the pictures begin under it. The client's
    # two leads («Projects. Perspectives. Partnerships. Press…») are not set: their words are the filter's own options (verify.py: DROP);
    # «All CI News» is the filter's label and a heading for readers that is not drawn.
    # 21.11 11:42, of that head: «заголовок можна дати в дві лінії: The Latest одна, From CI в іншій. Опис — нашим 20-м стилем, меншим.
    # Не можна робити такі величезні ширини тексту.» So: the title in her two lines; the sentence is reading text (the 20) in the 421 column.
    hl = ['The Latest', 'From CI']; assert ' '.join(hl) == nop(h1), h1
    pg.add('<section class="nw-h" id="@ID@">\n  <p class="lab3 ey rv">%s</p>\n  <h1 class="t111 rv">%s</h1>\n  <p class="t20 nw-st rv">%s</p>\n</section>' % (esc(label(S[0])), '<br>'.join(esc(x) for x in hl), esc(nop(ps[1][0]))), 'News', 'top')
    assert len(NEWS_IMG) == len(NEWS_ROWS)
    tiles = ''.join('<a class="cd nt%s" href="article.html" data-tags="%s"><span class="im"><img src="%s" alt="" loading="lazy"></span><span class="nt-m lab3"><span class="nt-c">%s</span><span class="nt-d">%s</span></span><span class="nt-t">%s</span></a>'
                    % (' b' if NT_PAT[i % len(NT_PAT)] else '', slug(c), A + NEWS_IMG[i] + '.webp', drw(c), drw(d), drw(h)) for i, (h, c, d) in enumerate(NEWS_ROWS))
    sec = S[1]; more = get(sec, 'a')[0][2]; allt = h_of(sec)
    flt = ('<div class="nf" data-list="nl"><div class="nf-p" id="nf-p"><div><div class="nf-i">%s</div></div></div>'
           '<button class="nf-b" type="button" aria-expanded="false" aria-controls="nf-p"><span class="t">%s</span><i class="pl" aria-hidden="true"></i><i class="nq" aria-hidden="true"></i></button></div>'
           % (''.join('<button type="button" role="checkbox" aria-checked="false" data-f="%s"><i class="bx" aria-hidden="true"></i><span>%s</span></button>' % (slug(c), c) for c in NEWS_CATS), esc(allt)))
    pg.add('<section class="nw-g" id="@ID@">\n  <h2 class="vh">%s</h2>\n  <div class="ng" id="nl">%s<p class="none lab3"><span class="wc">No articles under this filter yet</span></p></div>\n  <div class="nw-more rv">%s</div>\n  %s\n</section>'
           % (esc(allt), tiles, btn(more, '#').replace('href="#"', 'href="#" data-noop'), flt), 'All News')
    emit('news.html', 'News', pg)
news()
def article():
    """The article, on her reference gkc.ca/en/news/design-futures (21.11.2026 10:48: «У нас є теж така стилістика з такими лініями.
    Думаю, що можна плюс-мінус так оформити. Але не забувай, що це повинно бути в нашій стилістиці»). Read in the browser: the headline
    alone at the upper left of a tall quiet head; on the foot of the head a line of small caps (the category at the left field, the date
    from the page's middle) standing on a hairline the whole width; under it the page is cut by ONE vertical hairline in its middle —
    a tall picture in the left half, the text in the right half; then three pictures across; then «Other articles» as rows between
    hairlines with a small picture at the head of each row. Ours: black, our hairline (30 % white), our sizes; the picture of the left
    half stays in place while the text is read."""
    S = P['article']; pg = Pg()
    sec = S[1]; ks = [it[1][0] for it in sec['items'] if it[0] == 'k']
    head = ('<section class="ar-h" id="@ID@">\n  <p class="lab3 ey rv"><a href="news.html">← News</a></p>\n  <h1 class="t60 rv">%s</h1>\n'
            '  <div class="ar-m lab3"><span class="ar-c">%s</span><span class="ar-d"><span>%s</span><span>%s</span></span></div>\n</section>') % (drw(ART['head']), drw(ART['cat']), drw(ART['date']), esc(ks[2]))
    pg.add(head, 'Article', 'top')
    body = ['<p class="t34 rv">%s</p>' % drw(ART['lead'])]; ps_ = list(ART['ps'])
    def fill(t, kind):
        if not t.strip().strip('“”"').startswith('['): return esc(t)      # the client's own text stays as it is
        if kind == 'h3': return drw(ART['sub'])
        if kind == 'lead': return drw(ART['quote'])
        return drw(ps_.pop(0) if ps_ else ART['close'])
    for it in sec['items']:
        if it[0] == 'p': body.append('<div class="t20s rv"><p>%s</p></div>' % fill(it[1][0], 'p'))
        elif it[0] == 'h3': body.append('<p class="h5r rv" style="margin-top:calc(100 * var(--u))">%s</p>' % fill(it[1], 'h3'))
        elif it[0] == 'lead': body.append('<p class="t34 rv">%s</p>' % fill(it[1][0], 'lead'))
    share = ks[3].split(' · ')
    sh = '<p class="lab3 rv mt3" style="margin-top:calc(100 * var(--u))"><span>%s</span>%s</p>' % (esc(share[0]), ''.join('<a href="#" data-noop>%s</a>' % esc(x) for x in share[1:]))
    pg.add('<section class="ar-b" id="@ID@">\n  <div class="ar-l"><div class="ar-ph"><img src="%s" alt=""></div></div>\n  <div class="art">%s%s</div>\n</section>' % (A + NEWS_IMG[0] + '.webp', ''.join(body), sh))
    pg.add('<section class="ar-3" id="@ID@">%s</section>' % ''.join('<div><img src="%s" alt="" loading="lazy"></div>' % x for x in [A + y + '.webp' for y in ('rtb/1430-05a', 'us/1511-13', 'rtb/1430-10a')]))
    sec = S[3]; a = get(sec, 'a')[0]
    rows = ''.join('<a href="article.html"><span class="im"><img src="%s" alt="" loading="lazy"></span><span class="t">%s</span><span class="c">%s</span><span class="c">%s</span></a>'
                   % (A + NEWS_IMG[i + 1] + '.webp', drw(h), drw(c), drw(d)) for i, (h, c, d) in enumerate(NEWS_ROWS[1:4]))
    pg.add(bk(h_of(sec), '    <div class="lst wi rv">%s</div>\n    <div class="rv c1">%s</div>' % (rows, btn(a[2], 'news.html'))), 'More')
    final_cta(pg, S[4], A + 'ch/1450-32.webp', g=.55)
    emit('article.html', 'Article', pg)
article()

# ================================================================== contact
FORM = [('Name', 'text', 'name', True), ('Email', 'email', 'email', True), ('Phone', 'tel', 'phone', False), ('Primary Residence / Project Location', 'text', 'location', False),
        ('Property Status', ['I own the property', 'Under contract', 'Considering a property', 'Searching']),
        ('Project Type', ['Full-home renovation', 'Partial renovation', 'New residence', 'Furnishing a completed home', 'Wellness integration']),
        ('CI Service of Interest', ['CI Turnkey', 'CI Core', 'CI Curated', 'CI Wellness', 'Not sure yet']),
        ('Target Timeline', ['As soon as possible', 'Within 3 months', '3–6 months', '6–12 months', 'Not sure yet']),
        ('How Did You Hear About CI?', ['Referral', 'Broker / Real estate agent', 'Instagram', 'Google search', 'Press / Media', 'Other']),
        ('Tell Us About Your Project', 'area', 'project', False)]
def contact():
    """Contact, rebuilt 21.11.2026 14:34: «Перший, другий, третій блок не подобається. Думай метафорами. Дивися, щоб у блоці була якась
    домінанта. Другий блок — взагалі немає за що оку зачепитися. Типографія дуже-дуже погана по композиції. Перероби, думаючи
    метафорами, спираючись на наші попередні сторінки.» One metaphor and one dominant for each block, each from a component the site
    already has:
      1 «Let's Begin Your Next Chapter» — THE ROOM THAT IS WAITING. The cover of Partnerships (sc_strips: the title centred in two
        lines on the two centre lines, the second blue) on the client's own photograph of a room in morning light (no stock).
        Under it the page's thought as her black screen (thought()): «Every CI home begins with a conversation» — and the
        photograph is TWO CHAIRS TURNED TO EACH OTHER (us/1511-13).
      2 «Tell Us About Your Vision» — THE BLANK PAGE. The form itself stands on the page: the site's white sheet (the pop-up's
        right half, css/form.css) is the right half of the screen, ruled with the fields; the name, the title and the three
        paragraphs stay in the left half while the sheet is read. Dominant: the sheet. (Before: a title, a button and loose text.)
      3 «CI Design + Build» — THE CALLING CARD. One white card on the crossing of the two centre lines: the name, the studio,
        the telephone, the address for letters, the markets, the social pages. Dominant: the card. (Before: a table of rows.)
    The stock lounge and the stock team photograph are gone from the page."""
    S = P['contact']; pg = Pg()
    h1, ps, a = hero(S[0])
    hl = [("Let's Begin", 0), ('Your Next Chapter', 1)]; assert ' '.join(x for x, _ in hl) == nop(h1).replace('’', "'"), h1
    hl = [(nop(h1)[:len("Let's Begin")], 0), (nop(h1)[len("Let's Begin") + 1:], 1)]
    pg.add(sc_strips(label(S[0]), h1, A + 'ch/1450-17.webp', g=.6, centre=True, lines=hl, cross=True), 'Contact', 'top')
    idea = ['Every CI home begins', 'with a conversation']; assert ' '.join(idea) == nop(ps[0][0]), ps[0]
    thought(pg, 'Contact', idea, 1, [brk_lines(nop(' '.join(ps[1])), 62)], btn(a[0], '#inquiry'), A + 'us/1511-13.webp', '50% 90%')
    sec = S[1]; ps_ = [it[1][0] for it in sec['items'] if it[0] == 'p']; h2 = nop(h_of(sec)); assert h2 == 'Tell Us About Your Vision', h2
    sub = '<a class="r3btn" href="contact.html" data-form><span class="t">%s</span><i class="ln lv" aria-hidden="true"></i><i class="ln lh" aria-hidden="true"></i><i class="sqd" aria-hidden="true"></i></a>' % '<br>'.join(esc(x) for x in ['Submit', 'Project Inquiry'])
    pg.add('<section class="ct-f" id="@ID@">\n  <div class="ct-f-l"><div class="ct-f-s">\n    <p class="lab3 ey rv">%s</p>\n    <h2 class="t60 rv">%s</h2>\n    <div class="ct-f-p rv">%s</div>\n  </div></div>\n'
           '  <div class="fmi" data-form-inline><div class="fmi-fb">%s</div></div>\n</section>'
           % (esc(label(sec)), 'Tell Us About<br>Your Vision', ''.join('<p class="t20">%s</p>' % esc(nop(x)) for x in ps_), sub), 'Inquiry', 'inquiry')
    dl = get(sec, 'dl')[0][1]; rows = ''
    for k, v in dl:
        if k == 'Social': val = '<br>'.join('<a href="#" data-noop>%s</a>' % esc(x) for x in v[0].split(' · '))
        elif k == 'Phone': val = '<a href="tel:+1%s">%s</a>' % (re.sub(r'\D', '', v[0]), esc(v[0]))
        else: val = '<br>'.join(esc(x) for x in v)
        rows += '<div class="ct-%s"><dt class="lab3">%s</dt><dd>%s</dd></div>' % (slug(k), esc(k), val)
    labs = [it[1] for it in sec['items'] if it[0] == 'label']
    pg.add('<section class="ct-c" id="@ID@">\n  <p class="lab3 ey rv">%s</p>\n  <div class="ct-card rv"><i class="nq" aria-hidden="true"></i><h3 class="t34 up">%s</h3><dl class="ct-dl">%s</dl></div>\n</section>'
           % (esc(labs[1] if len(labs) > 1 else 'Contact Information'), esc(get(sec, 'h3')[0][1]), rows), 'Studio')
    auto(pg, S[2], proc='cells', n=4)
    final_cta(pg, S[3], A + 'ch/1450-24.webp', None, 'contact.html')
    emit('contact.html', 'Contact', pg, A + 'ch/1450-17.webp')
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
    pg.add('<section class="bk hd0" id="@ID@">\n  <p class="lab3 ey rv c1">FAQ</p>\n  <h1 class="t60 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <div class="bk-b">\n    <div class="rws">\n      %s\n    </div>\n  </div>\n</section>' % (title, '\n      '.join(r)), 'FAQ', 'top')
    pg.add(cta('Your Next Chapter Starts With a Conversation', [], ('Begin Building Your Better Life', 'contact.html'), A + 'ch/1450-29a.webp'), 'Contact')
    emit('faq.html', 'FAQ', pg)
    return len(items)
wellness_page()
curated_page()
core_page()
turnkey_page()   # called here: it uses the project cards defined with the Portfolio page
nq = faq()

print('\n'.join('%-24s %6d bytes' % (k, v) for k, v in OUT.items())); print('faq items', nq)
