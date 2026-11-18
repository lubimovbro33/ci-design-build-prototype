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
def wellness_page():
    """CI Wellness — the invisible. 17.11: «Controls can disappear. Technology can integrate. Infrastructure can remain behind the
    architecture.» The cover comes out of the dark into the light (their first quality is light); the third screen is the instrument — the
    client's own nine drawn over one of their rooms in our hairlines, one stroke at a time, and gone again the moment you let go."""
    S = [join_lists(dots_fix(x)) for x in P['wellness']]; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(sc_still(label(S[0]), h1, A + 'us/1511-11a.webp', .66), 'Wellness', 'top')
    # 02 the thought: their two-line lead, the second line in the blue
    lead0 = get(S[0], 'lead')[0][1]
    thought = esc(nop(lead0[0])) + '<br><span class="cb">' + esc(nop(lead0[1])) + '</span>'
    pg.add(tk_lead(thought, ' '.join(ps[1]) + ' ' + ' '.join(ps[2]), btn(a[0], 'contact.html')), 'Idea')
    # 03 the instrument: the client's own nine groups of features, each drawn over one of their rooms
    sec = S[6]; fp = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    h3 = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h3']
    nine = [g[0] for g in P['_feats']]
    feats = [[(g[j], g[j + 1]) for j in range(1, len(g), 2)] for g in P['_feats']]
    pg.add(wl_unseen(label(sec), h_of(sec), fp[0] + ' ' + fp[1], nine, A + 'us/1511-06a.webp', [], feats), 'The Nine')
    # 04 why it matters: luxury's next chapter, and the nine qualities of a home as one line
    sec = S[2]; wp = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    qual = [it[1] for it in sec['items'] if it[0] == 'dots'][0]
    st2 = ' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0])
    pg.add(tk_index(label(sec), h_of(sec), wp[0] + ' ' + wp[1], qual).replace('class="bk tk-ix"', 'class="bk tk-ix wl-qu"', 1).replace(
        '</section>', '  <p class="t20 rv tk-m-l" style="--w:475">%s</p>\n  <p class="t34 rv tk-r-c">%s</p>\n</section>'
        % (esc(nop(wp[2] + ' ' + wp[3])), blue(nop(st2), None)), 1), 'Luxury')
    # 04 what CI Wellness is
    sec = S[1]; ip = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    pg.add(tk_calm(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], ip, ''), 'What It Is')
    # 05 the one list of the page
    sec = S[3]; rows = [' '.join(r[1]) if isinstance(r[1], (list, tuple)) else r[1] for r in get(sec, 'row')]
    cl = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    pg.add(sc_you(h_of(sec), None, get(sec, 'lead')[0][1][0], rows, cl[0]), 'Fit')
    # 06 the five steps, each with what it means
    sec = S[4]
    rows = [(r[1] if isinstance(r[1], str) else ' '.join(r[1]), [' '.join(x) for x in r[2]]) for r in get(sec, 'row')]
    lead4 = get(sec, 'lead')[0][1]
    pg.add(wl_steps(label(sec), h_of(sec), ' '.join(lead4), rows), 'Process')
    # 07 one photograph, and the room that is part of the routine
    pg.add(tk_plate(A + 'us/1511-04a.webp', fp[2]), 'Recovery')
    spa = [x.strip(' .') for x in fp[3].split('.') if x.strip(' .')]        # Steam. Sauna. Cold therapy. …
    pg.add(wl_spa(label(S[6]), h3[0], '', fp[2], spa, [fp[4]]), 'Home Spa')
    # 08 technology that does not announce itself
    sec = S[7]; tp = [it[1] for it in sec['items'] if it[0] == 'p']
    tflat = [' '.join(x) for x in tp]
    pg.add(cu_layers(label(sec), h_of(sec), [get(sec, 'lead')[0][1][0]] + tflat[1:5], tp[0], tflat[5]).replace('class="bk cu-ly"', 'class="bk cu-ly wl-ly"', 1), 'Design')
    # 09 what it touches, and the outcome
    sec = S[8]
    touch = [it[1] for it in sec['items'] if it[0] == 'dots'][0]
    op = [' '.join(it[1]) for it in sec['items'] if it[0] == 'p']
    pg.add(tk_index(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], touch).replace('class="bk tk-ix"', 'class="bk tk-ix wl-ix"', 1).replace(
        '</section>', '  <p class="t20 rv tk-m-l" style="--w:475">%s</p>\n</section>' % esc(nop(' '.join(op))), 1), 'Connected')
    sec = S[9]; o9 = [it[1] for it in sec['items'] if it[0] == 'p']
    st9 = [it[1] for it in sec['items'] if it[0] == 'strong'][0]
    pg.add(cu_layers(label(sec), h_of(sec), [' '.join(o9[1])], o9[0], ' '.join(st9)).replace('class="bk cu-ly"', 'class="bk cu-ly wl-oc"', 1), 'Outcome')
    final_cta(pg, S[10], A + 'us/1511-11a.webp')
    emit('ci-wellness.html', 'CI Wellness', pg, A + 'ch/1450-25a.webp')

def curated_page():
    """CI Curated — the layers. 17.11: their own words give the page its device («the layers that make a residence feel complete», «Each layer
    belongs to the same story»), so the page COMPOSES: the cover's photograph comes together out of its own pieces, and the third screen is a
    residence composed out of six fragments of the client's rooms, any one of which the visitor can lift out of the whole."""
    S = [join_lists(dots_fix(x)) for x in P['curated']]; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add(sc_still(label(S[0]), h1, A + 'rtb/1430-08a.webp', .62), 'Curated', 'top')
    # 02 the thought: their sentence, its last line in the blue
    ln_ = brk_lines(nop(' '.join(ps[0])), 32)
    thought = '<br>'.join(esc(x) for x in ln_[:-1]) + '<br><span class="cb">' + esc(ln_[-1]) + '</span>'
    pg.add(tk_lead(thought, ' '.join(ps[1]) + ' ' + ' '.join(ps[2]) + ' ' + ' '.join(ps[3]), btn(a[0], 'contact.html')), 'Idea')
    # 03 a residence composed — the page's instrument
    sec = S[2]; cp = [it[1] for it in sec['items'] if it[0] == 'p']
    six = [x for x in cp if len(x) > 1]
    flat = [' '.join(x) for x in cp]
    st = [it[1] for it in sec['items'] if it[0] == 'strong'][0]
    names = [x.strip(' .') for x in flat[1].split('.') if x.strip(' .')]        # Scale. Comfort. Furniture. Art. Texture. Objects.
    assert len(names) == 6, names
    imgs = ['ch/1450-23.webp', 'ch/1450-30.webp', 'ch/1450-13.webp', 'ch/1450-11.webp', 'rtb/1430-08a.webp', 'ch/1450-21.webp']
    cls = ['f1', 'f2', 'f3', 'f4', 'f5', 'f6']   # not c1..c6: those are the site's own column classes
    pg.add(cu_comp(label(sec), h_of(sec), get(sec, 'lead')[0][1][0], [flat[0]] + flat[2:], st,
                   list(zip(names, [A + x for x in imgs], cls))), 'Composed')
    # 04 the one list of the page
    sec = S[1]; rows = [' '.join(r[1]) if isinstance(r[1], (list, tuple)) else r[1] for r in get(sec, 'row')]
    pg.add(sc_you(h_of(sec), None, get(sec, 'lead')[0][1][0], rows), 'Fit')
    # 05 one photograph of the client's work, and the sentence the page is built on
    sec = S[7]; wp = [it[1] for it in sec['items'] if it[0] == 'p']
    ws = [x[0] for x in wp if len(x) == 1]; betw = max(wp, key=len)
    wst = ' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0])
    pg.add(tk_plate(A + 'ch/1450-18.webp', ws[0]), 'Complete')
    # 06 the considerations, each on its own rule
    sec = S[5]; lp = [it[1] for it in sec['items'] if it[0] == 'p']
    lsingle = [x[0] for x in lp if len(x) == 1]; four = max(lp, key=len)
    lst = ' '.join([it[1] for it in sec['items'] if it[0] == 'strong'][0])
    pg.add(cu_layers(label(sec), h_of(sec), lsingle, four, lst), 'Layers')
    # 07 what is included, in two quiet columns
    sec = S[4]; ks = [it[1] for it in sec['items'] if it[0] == 'k']
    note = ks[0][0] if isinstance(ks[0], (list, tuple)) else ks[0]
    pg.add(co_split(label(sec), h_of(sec), note, list(ks[1]), list(ks[2])).replace('class="bk co-sp"', 'class="bk co-sp cu-sp"', 1), 'Included')
    # 08 from architecture to atmosphere
    sec = S[6]
    names2 = [x[1] if isinstance(x[1], str) else ' '.join(x[1]) for x in sec['items'] if x[0] == 'h4']
    txts = [x[1][0] if isinstance(x[1], (list, tuple)) else x[1] for x in sec['items'] if x[0] == 'p']
    assert len(names2) == len(txts) == 7, (len(names2), len(txts))
    pg.add(cu_steps(label(sec), h_of(sec), list(zip(names2, txts))), 'Process')
    # 09 why: the four continuities, and their closing line
    pg.add(cu_layers(label(S[7]), h_of(S[7]), ws[1:], betw, wst).replace('class="bk cu-ly"', 'class="bk cu-ly cu-wy"', 1), 'Why')
    # 10 the work itself
    sec = S[8]
    cards = ''.join(pf6_card(q['name'], q['loc'].split(' \u00b7 ') + [q['bld']], ph(q['set'], q['card']), q['slug'] + '.html') for q in PROJ[:3])
    pbt = [x for x in get(sec, 'a') if 'portfolio' in x[1]]
    pg.add(bk(h_of(sec), '    <div class="pf6">%s</div>\n    <div class="rv c1 g50">%s</div>' % (
        cards, btn(pbt[0][2] if pbt else 'View the Portfolio', 'portfolio.html')), hcls=' l0'), 'Projects')
    final_cta(pg, S[10], A + 'ch/1450-19.webp')
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
    idea_t = ['Brings Architecture,', 'Interior Design,', 'Construction, and', 'Project Management', 'Together Under', 'One Team']
    assert ('CI Core ' + ' '.join(idea_t)).lower() == lead0.lower(), lead0
    # 18.11 19:45, on Core's own cover (the room standing as a drawing that fills with the photograph): «чому ми не можемо зробити
    # так, як на Turnkey — там, де лінія малювала скетч, і потім скетч переходив в картинку. Чому ми не можемо взяти такий самий
    # прийом?» — so the cover is Turnkey's film itself (tk_cover / unfold()), with this page's room: the tangle pays out its line,
    # the room grows out of the line stroke by stroke (tools/site/sketch.py, 'us/1511-01a'), the line parts and the home stands.
    pg.add(tk_cover(label(S[0]), h1, A + 'us/1511-01a.webp', L + '1511-01a.webp', L + '1511-01a-g.png',
                    [('Design + Build,', ''), ('', 'Fully Connected')],
                    idea=('CI Core', idea_t, brk_lines(nop(' '.join(ps[1])), 46), btn(a[0], 'contact.html'))), 'Core', 'top')
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
    # 04 what you receive — Core's own block: the seam, and the visitor's hand on it
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
                  'CI offers three ways to work together, led by CI Turnkey, our complete concierge-level experience. Each carries the same standard of quality'], tx
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
           '    <p class="t20 iv-p">CI offers three ways to work together,<br class="bd"> led by CI Turnkey, our complete concierge-level experience.<br class="bd"> Each carries the same standard of quality</p>\n'
           # 16.11 23:01 («якщо тексту тобі не стає, то допиши, але не треба такі обгризки лишати»): the client's two sentences do not fill the
           # screen, so a second thought is written here from what their own pages say of the four ways — marked .wc, to be replaced by their text
           '    <p class="t20 iv-p"><span class="wc">Some clients hand us the whole home;<br class="bd"> others bring an architect, or a residence already built.<br class="bd"> The way changes. The standard does not.</span></p>\n'
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
        o.append('      <div class="m sw-hd" data-k="%s"><p class="lab3 sw-k">%s</p><p class="t60 sw-h nb">%s</p></div>' % (k, esc(tag), brk(nm, 22)))
        o.append('      <div class="m sw-bd" data-k="%s"><p class="t34 sw-l">%s</p>'
                 '<div class="t20s sw-t">%s</div><div class="sw-btn">%s</div></div>'
                 % (k2, esc(lead), ''.join('<p>%s</p>' % esc(nop(x)) for x in ps_), btn(a_[2], href(a_[1]))))
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
    # 16.11 19:33 («тобі треба зробити всі проєкти»): every project of the library has its own page now — nothing opens the client's
    # current site any more, and no tile is dead. 500 W Superior had one photograph and no text anywhere, so its place in her grid is
    # taken by the next project of the client's own portfolio, Modern Deco Home; when CI sends the Superior material it comes back.
    ch_, us_, rtb_ = PROJ[0], PROJ[1], PROJ[2]
    def parts(p): return p['loc'].split(' · ') + [p['bld']]
    # name, location, building, size, link, tags, picture
    LIB = [(q['name'], q['loc'], q['bld'], q.get('facts', {}).get('Size', ''), q['slug'] + '.html', q.get('tags', 'chicago ci-turnkey'),
            ph(q['set'], q['tall'])) for q in PROJ]
    CELL = [('Collectors Home', 3, 1, True), ('444 W Grant', 1, 1, False), ('Modern Deco Home', 1, 2, False), ('Above the Park', 2, 2, False), ('Urban Sanctuary', 4, 2, False),
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
    ORDER = ['Collectors Home', 'Urban Sanctuary', 'Room To Breathe', 'Modern Deco Home', '444 W Grant', 'Above the Park', 'Lakeshore Luxury', 'Contemporary Comfort', 'Sky-High Condo']
    byn = {x[0]: x for x in LIB}; assert sorted(ORDER) == sorted(byn)
    # the gallery shows a project's own picture, the one its card carries; 444 W Grant's is only 1200 wide on the client's site, so that one
    # takes the next picture of the same project until CI sends the files
    gim = {q['name']: ph(q['set'], q['tall'] if q['name'] == '444 W Grant' else q['card']) for q in PROJ}
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
           '    <p class="lab3 wl-k">%s</p>\n    <h1 class="t111 wl-h">%s</h1>\n    <p class="t20 wl-s"><span>%s</span></p>\n  </div>\n</section>'
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
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 rv g4-k">%s</p>\n    <div class="g4-b pj-st rv"><h3 class="lab3 pj-in">%s</h3><p class="t60s">%s</p></div>\n  </div>\n'
           '  <div class="g4 pj-2">\n    <h2 class="lab3 rv g4-k">%s</h2>\n    <dl class="g4-b pj-tb">%s</dl>\n  </div>\n</section>'
           % (esc(label(sec)), esc(goal), wc('goal', ' '.join(gp)), esc(nop(h_of(sec))), ''.join('<div class="rv"><dt class="lab3">%s</dt><dd>%s</dd></div>' % (esc(k), val(k, v)) for k, v in dl)))
    # design vision: the concept at the spine, its paragraphs small in the fourth column; then the first staggered pair
    sec = S[2]; ps_ = [' '.join(it[1]) for it in sec['items'] if it[0] in ('p', 'lead')]; assert len(ps_) == 3 and ps_[0].startswith('The design began with [') and ps_[2].startswith('['), ps_
    pv = [wc('began', nop(ps_[0])), esc(nop(ps_[1])), wc('narrative', nop(ps_[2]))]
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 rv g4-k">%s</p>\n    <h2 class="t60 rv pj-h">%s</h2>\n    <div class="pj-tx">%s</div>\n  </div>\n%s\n</section>'
           % (esc(label(sec)), wc('concept', h_of(sec)), ''.join('<p class="t20 rv">%s</p>' % x for x in pv), rows(PL[:1])), 'Vision')
    # the gallery: staggered on the column lines
    ttl = sub(h_of(S[3])).replace('[', '').replace(']', ''); assert ttl == 'Inside ' + nm, ttl
    pg.add('<section class="bk pj" id="@ID@">\n  <div class="g4">\n    <p class="lab3 rv g4-k">%s</p>\n    <h2 class="t60 rv pj-h">Inside<br>%s</h2>\n  </div>\n%s\n</section>'
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
    pg.add('<section class="nx3" id="@ID@">\n  <p class="lab3 nx3-k">Next project</p>\n  <div class="nx3-m"><h2 class="t60 rv"><a href="%s.html">%s</a></h2><p class="lab3 nx3-l rv">%s</p></div>\n'
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
              'and the clients who notice it most are the ones who never had to chase it.'],
       'sub': 'What it looks like in the home',
       'quote': 'The test of an integrated team is not the first drawing. It is the hundredth decision.',
       'close': 'A home finished this way reads as one idea rather than a set of good parts: the proportions, the materials and the light belong to each other, '
                'because the same people were responsible for all three.'}
# ================================================================== news + article
def news():
    S = P['news']; pg = Pg()
    h1, ps, a = hero(S[0])
    pg.add('<section class="bk hd0" id="@ID@">\n  <p class="lab3 rv c1">%s</p>\n  <h1 class="t111 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <div class="bk-b">\n%s\n%s\n  </div>\n</section>' % (esc(label(S[0])), brk(h1, 20), lead_p(ps[0], w=1240), p20(ps[1:], 'c2')), 'News', 'top')
    chips = ['All CI News', 'Projects', 'Perspectives', 'Partnerships', 'Press', 'CI News']
    ch = ''.join('<button class="chip%s" type="button" data-f="%s">%s</button>' % (' on' if i == 0 else '', 'all' if i == 0 else slug(c), c) for i, c in enumerate(chips))
    rows = ''.join('<a href="article.html" data-tags="%s"><span class="n">%02d</span><span class="t">%s</span><span class="c">%s</span><span class="c">%s</span></a>'
                   % (slug(c), i + 1, drw(h), drw(c), drw(d)) for i, (h, c, d) in enumerate(NEWS_ROWS))
    sec = S[1]; lead = get(sec, 'lead')[0][1][0]; more = get(sec, 'a')[0][2]
    body = '    <p class="t34 rv c1" style="--w:900">%s</p>\n    <div class="chips rv c1 g50" data-filter="nl">%s</div>\n    <div class="lst rv g50" id="nl">%s<p class="none lab3"><span class="wc">No articles under this filter yet</span></p></div>\n    <div class="rv c1">%s</div>' % (blue(lead), ch, rows, btn(more, '#').replace('href="#"', 'href="#" data-noop'))
    pg.add(bk(h_of(sec), body), 'All News')
    emit('news.html', 'News', pg)
news()
def article():
    S = P['article']; pg = Pg()
    sec = S[1]; ks = [it[1][0] for it in sec['items'] if it[0] == 'k']
    head = '<section class="bk hd0" id="@ID@">\n  <p class="lab3 rv c1 mt3"><span class="sqr"><span><a href="news.html">← News</a></span><span>%s</span><span>%s</span></span></p>\n  <h1 class="t60 bk-h rv" style="margin-top:calc(50 * var(--u))">%s</h1>\n  <p class="t34 rv c1" style="--w:900;margin-top:calc(50 * var(--u))">%s</p>\n</section>' % (drw(ART['cat']), drw(ART['date']), drw(ART['head']), drw(ART['lead']))
    pg.add(head, 'Article', 'top')
    body = []; ps_ = list(ART['ps'])
    def fill(t, kind):
        if not t.strip().strip('“”"').startswith('['): return esc(t)      # the client's own text stays as it is
        if kind == 'h3': return drw(ART['sub'])
        if kind == 'lead': return drw(ART['quote'])
        return drw(ps_.pop(0) if ps_ else ART['close'])
    for it in sec['items']:
        if it[0] == 'p': body.append('<div class="t20s rv"><p>%s</p></div>' % fill(it[1][0], 'p'))
        elif it[0] == 'h3': body.append('<p class="h5r rv" style="margin-top:calc(100 * var(--u))">%s</p>' % fill(it[1], 'h3'))
        elif it[0] == 'lead': body.append('<p class="t34 rv">%s</p>' % fill(it[1][0], 'lead'))
    meta = '<p class="lab3 rv mt3">%s</p>' % sqr([ART['date'], ART['cat'], ks[2]])
    share = ks[3].split(' · ')
    sh = '<p class="lab3 rv mt3" style="margin-top:calc(100 * var(--u))"><span>%s</span>%s</p>' % (esc(share[0]), ''.join('<a href="#" data-noop>%s</a>' % esc(x) for x in share[1:]))
    pg.add('<section class="bk" id="@ID@">\n  <div class="art">%s%s%s</div>\n</section>' % (meta, ''.join(body), sh))
    sec = S[3]; a = get(sec, 'a')[0]
    rows = ''.join('<a href="article.html"><span class="n">%02d</span><span class="t">%s</span><span class="c">%s</span><span class="c">%s</span></a>'
                   % (i + 1, drw(h), drw(c), drw(d)) for i, (h, c, d) in enumerate(NEWS_ROWS[1:4]))
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
wellness_page()
curated_page()
core_page()
turnkey_page()   # called here: it uses the project cards defined with the Portfolio page
nq = faq()

print('\n'.join('%-24s %6d bytes' % (k, v) for k, v in OUT.items())); print('faq items', nq)
