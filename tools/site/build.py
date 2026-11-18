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
# 18.11.2026 18:40 («міняй на клієнтські»): the two stock pictures (About Us, Partnerships) gave way to the client's own work — the foyer of
# Collectors Home and the stone island of Room To Breathe. The menu shows nothing that CI has not built.
MENU_PH = ['assets/ph/ch/1450-31.webp', 'assets/ph/ch/1450-09a.webp', 'assets/ph/ch/1450-15.webp', 'assets/ph/us/1530-04.webp', 'assets/ph/rtb/1430-04a.webp', 'assets/ph/us/1530-06a.webp']
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
# claimed. On the page each line is wrapped in <span class="wc"> so that it can be found and replaced when the client sends the final text.
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
# ------------------------------------------------------------------ the rest of the portfolio (16.11 19:33, her word: «тобі треба зробити всі проєкти»)
# Six projects had no page of their own: their tiles opened the client's current site or did not open at all. Each now has its own page,
# built like Collectors Home. Their photographs are still the client's own files, loaded from cidesignbuild.com (as the Portfolio tiles
# already did) until CI sends us the originals; the copy is WORKING COPY in our words, built only on what their page says about that
# project (read 16.11.2026), marked <span class="wc"> so it can be found and replaced. Nothing is claimed beyond their facts.
U21 = 'https://cidesignbuild.com/wp-content/uploads/2021/08/'; U23 = 'https://cidesignbuild.com/wp-content/uploads/2023/'
U24 = 'https://cidesignbuild.com/wp-content/uploads/2024/'; U26 = 'https://cidesignbuild.com/wp-content/uploads/2026/03/'
PIX = {
    'grant': [U21 + x for x in ('444-Grant_001-1.jpg', '444-Grant_004-scaled.jpg', '444-Grant_006.jpg', '444-Grant_008.jpg', '444-Grant_009.jpg', '444-Grant_012.jpg',
                                '444-Grant_013.jpg', '444-Grant_017.jpg', '444-Grant_019.jpg', '444-Grant_021.jpg', '444-Grant_022.jpg', '444-Grant_023.jpg')],
    'deco': [U21 + x for x in ('Deco-Home-01-1.jpg', 'Deco_0004_Photo-1.jpg', 'Deco_0000_5703_011.jpg', 'Deco_0003_Photo-2.jpg', 'Deco_0001_5703_04.jpg',
                               'Deco_0008_5703_014.jpg', 'Deco_0002_5703_01.jpg', 'Deco_0006_5703_019.jpg', 'Deco_0005_5703_021.jpg')],
    'park': [U26 + x for x in ('2107-Kenmore-rev_02-copy-scaled.jpg', '2107-Kenmore-rev_04-copy-scaled.jpg', '2107-Kenmore-rev_03-copy-scaled.jpg', '2107-Kenmore-rev_01-copy-scaled.jpg',
                               '2107-Kenmore-rev_07v2-copy-scaled.jpg', '2107-Kenmore-rev_10-copy-scaled.jpg', '2107-Kenmore-rev_09-copy-scaled.jpg', '2107-Kenmore-rev_06-copy-scaled.jpg',
                               '2107-Kenmore-rev_05-copy-scaled.jpg')],
    'lake': [U24 + x for x in ('02/1618-Sheridan_08rev-scaled.jpg', '02/1618-Sheridan_07rev-scaled.jpg', '03/1618-Sheridan_03rev-1-scaled.jpg', '02/1618-Sheridan_04-scaled.jpg',
                               '02/1618-Sheridan_06rev-scaled.jpg', '02/1618-Sheridan_02rev-scaled.jpg', '02/1618-Sheridan_01v2rev-scaled.jpg', '02/1618-Sheridan_05rev-scaled.jpg')],
    'grand': [U23 + x for x in ('10/201-Grand_001-v2-scaled.jpg', '10/201-Grand_002-scaled.jpg', '10/201-Grand_003-scaled.jpg', '10/201-Grand_004-scaled.jpg', '10/201-Grand_006-v2-scaled.jpg',
                                '10/201-Grand_008-scaled.jpg', '10/201-Grand_009-scaled.jpg', '10/201-Grand_010-scaled.jpg', '10/201-Grand_011-v2-scaled.jpg', '10/201-Grand_012-scaled.jpg',
                                '10/201-Grand_013-scaled.jpg', '10/201-Grand_015-scaled.jpg', '10/201-Grand_016-scaled.jpg', '10/201-Grand_014-1-scaled.jpg', '08/201-Grand_005-scaled.jpg')],
    'wabash': [U23 + '01/' + x for x in ('401-Wabash_002_v2-scaled.jpg', '401-Wabash_001_v2-scaled.jpg', '401-Wabash_003-scaled.jpg', 'table-and-bar-scaled.jpg',
                                         '401-Wabash_010-v2-scaled.jpg', '401-Wabash_008-scaled.jpg', 'vanity-and-powder-scaled.jpg', '401-Wabash_012-scaled.jpg')],
}
KINDS = [('m1', 2), ('rb', 2), ('sw', 1), ('lb', 2), ('m1', 2), ('full', 1), ('lp', 2), ('sw', 1), ('m1', 2), ('rb', 2), ('sw', 1), ('lb', 2)]
def plan_of(pics):
    """the staggered gallery of 16.11 (kinds in order), taking as many photographs as the project has"""
    out = []; i = 0; k = 0
    while i < len(pics):
        kind, n = KINDS[k % len(KINDS)]; k += 1
        if len(pics) - i < n: kind, n = ('sw', 1)
        out.append((kind, pics[i:i + n])); i += n
    return out
def extp(slug, name, lines, loc, bld, facts, draft, pics, tags, seed):
    return dict(slug=slug, name=name, lines=lines, loc=loc, bld=bld, facts=facts, draft=draft, idea='collection', tags=tags, seed=seed,
                set=None, cover=pics[0], card=pics[0], tall=pics[1], cta=pics[-1], gal3=plan_of(pics), gal=[('full', [x]) for x in pics])

PROJ += [
    extp('444-w-grant', '444 W Grant', ['444 W', 'Grant'], 'Lincoln Park · Chicago', 'Residence',
         {'Residence': 'East Lincoln Park · Chicago', 'Size': '12,500 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Space planning / Interior architecture / Full-scope design / Coach house'},
         {'lead': 'A house of 12,500 square feet on a double lot in East Lincoln Park',
          'client': 'Private clients',
          'goal': 'An eight-bedroom house for the next chapter of a family that likes to host, built behind the brick façade the street already knew',
          'concept': 'Symmetry and Sightlines',
          'began': 'The plan was set around symmetry and around the sightlines that end in the private courtyard',
          'narrative': 'The original brick façade was kept, the kitchen was built around a fourteen-foot island with the butler’s pantry beside it, the primary suite was given its own closets and a dual vanity, and the mechanical systems and the whole-home automation were concealed throughout',
          'dec': [('The Courtyard', 'Three sliding door systems open / the main level onto a private courtyard, / so the house looks into itself / rather than onto the street'),
                  ('Kitchen + Pantry', 'A fourteen-foot island with an integrated butcher block / stands at the centre; the butler’s pantry beside it / holds glassware columns and illuminated shelves'),
                  ('The Primary Suite', 'His-and-hers closets, a dual floating vanity / and a steam shower; a coach house on the same lot / was added as a retreat for family')]},
         PIX['grant'], 'chicago ci-turnkey', 1444),
    extp('modern-deco-home', 'Modern Deco Home', ['Modern', 'Deco Home'], 'Gold Coast · Chicago', 'Condominium',
         {'Residence': 'Gold Coast · Chicago', 'Size': '3,380 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Development / Design / Construction / Furnishings'},
         {'lead': 'A high-floor Gold Coast residence of 3,380 square feet, designed, built and furnished to be ready at closing',
          'client': 'CI Design + Build',
          'goal': 'A home delivered complete: designed, built and furnished so that it was ready to live in on the day it changed hands',
          'concept': 'Modern Deco',
          'began': 'The design set modern lines against deco contrast: a burnished black fireplace on white wall panels',
          'narrative': 'Custom detail runs through the entry and the powder room, the casings, the wood doors and the stone counter profiles, and integrated lighting is set to the art CI curated for the rooms',
          'dec': [('The Fireplace Wall', 'A burnished black fireplace stands / against white wall panels: / the contrast the rest of the home is tuned to'),
                  ('Entry + Powder Room', 'A custom wall covering, custom casings / and wood doors give the first rooms / their own character'),
                  ('Art + Lighting', 'Lighting is integrated into the architecture / and set to the works CI curated, / so the art is lit as part of the room')]},
         PIX['deco'], 'chicago ci-turnkey', 5703),
    extp('above-the-park', 'Above the Park', ['Above', 'the Park'], 'Lincoln Park · Chicago', 'Residence',
         {'Residence': 'Lincoln Park · Chicago', 'Size': '5,600 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Living room / Great room / Theater room / Den / Terrace + rooftop'},
         {'lead': 'A turnkey renovation of 5,600 square feet where the rooms open onto the park',
          'client': 'Private clients',
          'goal': 'A partial renovation that ties the living spaces to the terrace and the rooftop, until the boundary between inside and out falls away',
          'concept': 'Living Above the Park',
          'began': 'The work began indoors, in the living room, the great room, the theater room and the den, and carried the same hand outside',
          'narrative': 'The terrace and the rooftop deck were made into furnished rooms with lighting, planted borders, privacy screening and built-in seating, an outdoor kitchen under stone counters and a custom pergola, all of it looking over the park and the city',
          'dec': [('The Terrace', 'Lighting, planted borders and privacy screening / turn the terrace into a room: / built-in seating, and the park beyond it'),
                  ('The Rooftop', 'An outdoor kitchen with stone counters / and a custom pergola stand on the roof, / where the city stands in for the walls'),
                  ('Inside', 'The living room, the great room, the theater room / and the den were renovated together, / so one language runs from the inside out')]},
         PIX['park'], 'chicago ci-turnkey', 2107),
    extp('lakeshore-luxury', 'Lakeshore Luxury', ['Lakeshore', 'Luxury'], 'Wilmette · North Shore', 'Residence',
         {'Residence': 'Wilmette · North Shore', 'Size': '2,200 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Open living + kitchen + dining / Primary suite / Home office / Library'},
         {'lead': 'A turnkey renovation and furnishing of 2,200 square feet near the lake',
          'client': 'Private clients',
          'goal': 'A home that takes its colour from the water and from the owners’ travels, and a plan that is easy to live in',
          'concept': 'Warm Materials, Lake Light',
          'began': 'The building’s existing infrastructure was kept, and the plan was tuned around it',
          'narrative': 'Warm, textured natural materials with touches of blue run through the open living, kitchen and dining space, where lighting and seating mark each zone; the kitchen was built in walnut with decorative hardware, and the owners moved into a home whose furniture already stood in place',
          'dec': [('The Open Plan', 'Living, kitchen and dining share one space; / lighting and seating mark each zone / without a wall between them'),
                  ('The Kitchen', 'Walnut cabinetry with decorative hardware / and a suite of built-in appliances, / set into the plan that was already there'),
                  ('Furnishings', 'The furniture was selected, procured and placed / before the owners arrived: / they moved into a finished home')]},
         PIX['lake'], 'ci-turnkey', 1618),
    extp('contemporary-comfort', 'Contemporary Comfort', ['Contemporary', 'Comfort'], 'River North · Chicago', 'Condominium',
         {'Residence': 'River North · Chicago', 'Size': '3,352 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Two units merged / Primary suite / Home office / Built-in storage'},
         {'lead': 'Two units in a River North high-rise made into one home of 3,352 square feet',
          'client': 'Private clients',
          'goal': 'A warm home of natural materials set against the industrial character of the building',
          'concept': 'Two Units, One Home',
          'began': 'The two adjoining units were merged and replanned as three bedrooms and three bathrooms',
          'narrative': 'The primary suite was given a spa-like bathroom, a generous walk-in closet and a small morning nook; a home office and custom built-in storage run through the plan; and the kitchen turns on an oversized island under a light fixture made for it',
          'dec': [('The Merge', 'Two adjoining units became one residence: / three bedrooms, three bathrooms, / and a plan that reads as one home'),
                  ('The Island', 'An oversized island under a custom fixture / carries both the weekday meal / and the evening the owners host'),
                  ('The Primary Suite', 'A spa-like bathroom, a generous walk-in closet / and a morning nook, set apart / from the rooms that hold guests')]},
         PIX['grand'], 'chicago ci-turnkey', 201),
    extp('sky-high-condo', 'Sky-High Condo', ['Sky-High', 'Condo'], 'Chicago', 'High-rise condominium',
         {'Residence': 'High-rise condominium · Chicago', 'Size': '2,022 sq ft', 'CI Service': 'CI Turnkey', 'Scope': 'Living room / Kitchen + bar / Primary bedroom / En suite'},
         {'lead': 'A full renovation and furnishing of 2,022 square feet above the Chicago River',
          'client': 'Private clients',
          'goal': 'A two-bedroom residence rebuilt around the way its owners host, with the river in every main room',
          'concept': 'Statement Surfaces',
          'began': 'Nearly every surface was replaced, and the main rooms were planned around entertaining',
          'narrative': 'A geometric media wall of custom millwork boxes and backlit onyx anchors the living room, the kitchen and the bar are cut from blue quartzite with a floor-to-ceiling wine store beside them, and the primary bedroom is quieted by a shagreen headboard wall and its own fireplace',
          'dec': [('The Media Wall', 'Millwork boxes of varying depth / and backlit onyx slabs / make the living room’s one bold surface'),
                  ('Kitchen + Bar', 'Blue quartzite runs from the island / through the bar top to the dining table, / with a floor-to-ceiling wine store beside it'),
                  ('The Primary Suite', 'A shagreen headboard wall and angled millwork / keep the bedroom calm; the en suite / is finished in marble-topped vanities')]},
         PIX['wabash'], 'chicago ci-turnkey', 401),
]

# Room To Breathe: the same working copy, from the client's own page for this project (magnolia-house)
PROJ[2].update(idea='collection', draft={
    'lead': 'A turnkey transformation of 4,070 square feet in Lincoln Park',
    'client': 'Private clients',
    'goal': 'A bold, polished home that is still comfortable to live in, with the art collection given the room it needs',
    'concept': 'Room to Breathe',
    'began': 'A heavy, closed staircase divided the main level; it was replaced by a plan that runs the length of the first floor',
    'narrative': 'Millwork and architectural detail do the work of art, plain surfaces leave the collection the spotlight, and sightlines and furnishings mark the zones of one open level',
    'dec': [('The Open Level', 'The closed staircase that split the main floor / was taken out, and the plan now runs / the length of the first level'),
            ('The Kitchen', 'Warm tones and built-in appliances, / set where the open plan brings / the family and its guests together'),
            ('The Living Room', 'A large stone slab above the fireplace, / a statement chandelier and a custom rug / hold the room around the collection')]},
    gal3=plan_of(['1430-01a', '1430-11a', '1430-07', '1430-04a', '1430-05a', '1430-12a', '1430-09a', '1430-10a', '1430-03a', '1430-06', '1430-13', '1430-14', '1430-15']))
# Urban Sanctuary: our own photographs, and no page of the client's to build working copy on — the rows we have no fact for are left out
PROJ[1].update(idea='collection', draft={
    'lead': 'A turnkey renovation and furnishing in the Gold Coast',
    'client': 'Private clients',
    'goal': 'A calm home above the city, designed, built and furnished by one team',
    'concept': 'Quiet Above the City',
    'began': 'The rooms were planned around the light and the view that the floor already had',
    'narrative': 'Architecture, interiors, construction and furnishings were carried by one team, so that the residence was handed over complete',
    'dec': [('The Living Spaces', 'The main rooms were opened to the light / and furnished as one composition'),
            ('Materials', 'Warm, quiet materials throughout, / so that the view stays the brightest thing in the room'),
            ('Furnishings', 'CI selected, procured and installed / every piece in the residence')]},
    gal3=plan_of(['1511-07a', '1511-09', '1511-10', '1511-01a', '1511-02a', '1511-11a', '1511-05a', '1511-04a', '1530-01', '1530-02', '1530-03', '1511-13', '1530-06a', '1511-08a', '1530-04']))

PROJ_MORE = [dict(name='500 W Superior', loc='River North · Chicago', bld='Residence', img='assets/pj/superior.webp'), dict(name='444 W Grant', loc='Lincoln Park · Chicago', bld='Residence', img='assets/pj/grant.webp')]
def ph(set_, name): return name if name.startswith('http') else 'assets/ph/%s/%s.webp' % (set_, name)   # 16.11: a project whose photographs are still on the client's site carries their URLs
def _stamp():
    """one short number for the state of our own css and js, hung on every link to them: a browser that has an older copy fetches the new one
    instead of showing yesterday's page (16.11 22:20: «я не бачу взагалі змін» — her browser was holding the old files)"""
    import hashlib, glob as _g
    h = hashlib.sha1()
    for f in sorted(_g.glob(D + 'css/*.css') + _g.glob(D + 'js/*.js')): h.update(open(f, 'rb').read())
    return h.hexdigest()[:8]
STAMP = _stamp()
def stamp(out): return re.sub(r'((?:href|src)="(?:css|js)/[^"?]+)"', lambda m: m.group(1) + '?v=' + STAMP + '"', out)

# ------------------------------------------------------------------ text
FILL = {'[sales@cidesignbuild.com]': 'info@cidesignbuild.com'}   # the address the client's own site gives
def esc(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"(?<=\w)'(?=\w)", '’', t).replace("'", '’')
    t = t.replace('—', '—')
    # 16.11: a template field we have working copy for is filled with it (marked .dr), never shown as a bracket
    return re.sub(r'\[[^\]]+\]', lambda m: ('<span class="wc">%s</span>' % FILL[m.group(0)]) if m.group(0) in FILL else ('<span class="ph">%s</span>' % m.group(0)), t)
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
def drw(t):
    """working copy: our own stand-in where the client has not sent text yet (her rule of 16.11 13:24 — never a bracketed template
    field). Marked so it can be found and replaced; see WORKING COPY below"""
    return '<span class="wc">%s</span>' % esc(t)
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
    <div>312 279 2776<br><span class="wc">info@cidesignbuild.com</span><br><span class="sqr"><span><a href="faq.html">FAQ</a></span><span><a href="contact.html">Contact</a></span></span></div>
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
    out = stamp(out)
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
def sc_four(kick, h1, ways):
    """Solutions, her word of 16.11 22:48: the four ways are shown the way the home page shows the six parts of CI (the «df2» block) — PANES over
    one photograph, the name set in each in that same hand, and under the pointer the pane fills WHITE while the photograph behind changes to that
    way's own. (22:45: the line of four names at the foot read as a filter — «якось воно дуже шаблонно».)
    The pane's white card carries what the home page's carries: the number, the name again in black, and the way's own one line."""
    o = [sn_open(1.2), '    <div class="sn-full sf-ph" data-s="sc:1>1.06@0-1.2">']
    for i, w in enumerate(ways):
        o.append('      <img class="sf-i%s" data-i="%d" src="%s" alt="">' % (' on' if i == 0 else '', i, w[2]))
    o.append('    </div>')
    o.append('    <p class="lab3 sf-k">%s</p>' % esc(kick))
    o.append('    <h1 class="t60 sf-h">%s</h1>' % brk(h1, 20))
    o.append('    <div class="sf-cells">')
    for i, w in enumerate(ways):
        o.append('      <a class="sf-cell" href="%s" data-i="%d"><span class="sf-nm">%s</span>'
                 '<span class="sf-card"><span class="sf-cn">%02d</span><span class="sf-ct">%s</span><span class="sf-cd">%s</span></span>'
                 '<span class="sf-pm" aria-hidden="true"><i></i><i></i></span></a>' % (w[1], i, esc(w[0]), i + 1, esc(w[0]), esc(w[3])))
    o.append('    </div>')
    return '\n'.join(o + [SN_CLOSE])
# ------------------------------------------------------------------ CI Turnkey (16.11.2026): one door
# Her brief of 23:14 and 23:28: every page its own idea, unpredictable, and all of it in our language. CI Turnkey's idea is ONE DOOR — their own
# line, «hand you the keys to the life waiting on the other side». The machinery is named once and shut behind it; the page is what is on the
# other side; the process is eight thresholds walked through, one after another.
def sc_door(kick, h1, img):
    """the cover: the screen is dark but for a slit of light down the middle; the scroll opens it until the finished room fills the frame.
    The title and the page's name stand on the lower left and stay as the room opens."""
    hb = brk(h1, 18); n = hb.count('<br>') + 1
    return '\n'.join([sn_open(1.7),
        '    <div class="sn-full tkd-ph" data-s="ci:0,49.3,0,49.3>0,0,0,0@.04-1.3"><img src="%s" alt="" data-s="sc:1.16>1@.04-1.45" style="filter:contrast(1.04) brightness(.74)"></div>' % img,
        '    <p class="lab3 sn-k bl" style="--ln:%d"><span class="sn-hi">%s</span></p>' % (n, esc(kick)),
        '    <h1 class="t111 sn-h bl" style="--ln:%d"><span class="sn-hi">%s</span></h1>' % (n, hb),
        SN_CLOSE])
def tk_cover(kick, h1, img, line, order, lines, idea=None):
    """01 — her own frame and scenario (17.11 17:07 `603:742`, 17:12, 17:33, 17:35; re-set by her 19:48 in frame `610:99`): the page's name
    and its title stand at the HEAD of a black screen — the name at 116, the title in the site's 111 (`.t111`: 111 / 95, −8) in three
    centred lines from 190, its first half white and «First Night Home» blue. Under them, in the rest of the screen, turns the tangle — the
    home page's knot, large, and already paying out: the idea, still chaos — and the site's line leaves it straight down. The scroll pulls
    it straight: the words go up and away (they only ever stand on black), the tangle is one line down the middle of the screen, the room
    GROWS OUT OF that line stroke by stroke, and then the line parts in two and the home stands between its halves.
    `line` = the room drafted clean and `order` = the moment the ink reaches each stroke (both tools/site/sketch.py), `lines` = the title's
    lines as (white, blue) halves; the figure is `unfold()` in js/inner.js.
    18.11 09:27 / 16:14, her frame `637:7894`: the page's thought no longer has a black screen of its own. «Коли у нас вже промалювалася
    і проявилася фотографія, у нас іде легке затемнення, і промальовуються лінії горизонтальна, вертикальна, і появляється ось цей
    контент… щоб оце затемнення було практично незамітно.» So the film runs on: the home stands, the picture is graded down a little
    where the words will stand (in the shader, slowly — never a veil laid over it), the page's two centre hairlines are ruled across it,
    and `idea` = (name, the thought's own lines, the paragraph's lines, the button) comes in right of the vertical one: the name at 181,
    the thought in the 60 from 230, the paragraph and the button on the foot."""
    assert nop(' '.join((a + b).strip() for a, b in lines)).lower() == nop(h1).lower(), (lines, h1)
    out = ''; on = False
    for i, (wh, bl) in enumerate(lines):
        if i: out += '<br>'
        if wh:
            if on: out += '</span>'; on = False
            out += esc(wh)
        if bl:
            if not on: out += '<span class="cb">'; on = True
            out += esc(bl)
    if on: out += '</span>'
    return '\n'.join([
        '<section class="film tk-cv" data-fig="unfold" data-len="%s" data-open="0" id="@ID@">' % ('3.6' if idea else '2.4'), '  <div class="stg">',
        '    <div class="tk-cv-ph"><img src="%s" alt=""><img class="tk-cv-ln" src="%s" alt=""><img class="tk-cv-ln" src="%s" alt=""></div>' % (img, line, order),
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc">',
        '      <div class="tk-cv-t"><p class="tk-cv-k rv">%s</p><h1 class="t111 tk-cv-h rv">%s</h1></div>' % (esc(kick), out),
        '    </div>'] + ([
        '    <div class="sc tk-cv-i">',
        '      <p class="tk-cv-k m tk-cv-ik" data-k="2.5 2.66 99 99">%s</p>' % esc(idea[0]),
        '      <h2 class="t60 m tk-cv-ih" data-k="2.56 2.96 99 99">%s</h2>' % '<br>'.join(esc(x) for x in idea[1]),
        '      <p class="t20 m tk-cv-ip" data-k="2.8 3.06 99 99">%s</p>' % ' <br class="bd">'.join(esc(x) for x in idea[2]),
        '      <div class="m tk-cv-ib" data-k="2.92 3.12 99 99">%s</div>' % idea[3],
        '    </div>'] if idea else []) + ['  </div>', '</section>'])
def tk_loose(kick, title, names, leave=True, note=None):
    """04 — the ecosystem, her frame `652:9078` and her idea (18.11.2026 17:37): «У нас отака величезна охапка тексту… щоб текст при
    скролі, можливо, розсипався. Це як метафора, що вам цього не потрібно. Не потрібно про це думати… чи по букві, чи по слову.»
    The frame: the block's name on the left field (`kick` = its two lines), the client's sentence as the title in the 60, sentence
    case, three lines, two inks (`title` = lines of (white, blue)); 220 under it the twenty-two names as one solid mass of the 34
    across the measure, our square between them. Nothing else: the scope handle and «Depending on project scope:» are not in her
    frame («текст бери той, що на макеті»; verify.py: DROP).
    One pinned screen (`loose()` in js/inner.js). The mass stands as drawn — it is the weight of what would have to be managed. On
    the scroll it lets go: the squares that held the names together go first, then the names leave their lines one by one, each on
    its own slow course, turning a little and going out of focus — some pass by the reader, some go off into the depth. They leave
    BY NAME, so that what goes can still be read as it goes. What is left is a clear screen and the sentence. Scrolling back
    gathers the mass again. The type stays in the page throughout."""
    hl = ''
    for i, (wh, bl) in enumerate(title):
        if i: hl += ' <br class="lb">'
        if wh: hl += esc(wh)
        if bl: hl += '<span class="cb">%s</span>' % esc(bl)
    # leave=False (the other solutions, 18.11 18:45): the same screen, not pinned — there the names are what IS included, so they
    # stand; `note` = the client's line over them («Project scope may include:»), in the running 20.
    fs = ''.join('<span>%s</span>' % esc(nop(x)) for x in names)
    return '\n'.join([
        '<section class="film tk-lo%s" data-fig="loose" data-len="%s" data-open="0"%s id="@ID@">' % ('' if leave else ' stay', '2' if leave else '0', '' if leave else ' data-stay'), '  <div class="stg">',
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc tk-lo-s">',
        '      <p class="lab3 rv tk-lo-k">%s</p>' % ' <br class="lb">'.join(esc(x) for x in kick),
        '      <h2 class="t60s rv tk-lo-h">%s</h2>' % hl,
        ] + (['      <p class="t20 rv tk-lo-n">%s</p>' % esc(nop(note))] if note else []) + [
        '      <p class="t34 rv tk-lo-f" data-loose><span class="sqr">%s</span></p>' % fs,
        '    </div>', '  </div>', '</section>'])


def tk_count(kick, title, lead, rows):
    """03 — her frame `643:8641` (18.11 16:13): «Зроби його точно так само, як у мене на макеті… Коли ми проскролюємо, в нас міняється
    інформація. Перший пункт у нас білий, тобто він при наведенні. І справа є ще колонка, там пише 01 і внизу контент… на другий пункт
    цифра буде 02 і контент відповідний.» One pinned screen: the label on the left field, the title from the text line (`title` = its
    lines as (blue, white) halves), the lead under it, and then two columns of 632 between the same two hairlines — the four counts as
    a table (a count is 92 high: the word in the 34, its small caps under it, ONE and what it is beside them), and what the count in
    hand is made of: its number at the head, its content on the foot, in the running 20. The scroll walks the counts one by one; the
    pointer (or the keyboard) takes one in hand. The counts not in hand stand at 26 % — as drawn in her frame.
    rows: (word, small caps, ONE, small caps, wc, content markup).
    18.11 16:56, on the first build: «мені не подобаються оті лінії, вони якісь безсмисляні. Придумай іншу анімацію, елегантнішу,
    мінімалістичнішу і преміальнішу.» The figure of lines gathering into one is gone, and nothing is drawn in the panel at all — her
    frame keeps it empty. What moves now is only what the block already has (`count()` in js/inner.js and the css): the page's own
    white line is ruled along the foot of the count in hand, as far as the scroll has carried it, our square at its tip; the panel's
    number rolls to the next; the content comes in line by line."""
    hl = ''; on = False
    for i, (bl, wh) in enumerate(title):
        if i: hl += '<br>'
        if bl:
            if not on: hl += '<span class="cb">'; on = True
            hl += esc(bl)
        if wh:
            if on: hl += '</span>'; on = False
            hl += esc(wh)
    if on: hl += '</span>'
    rs = ''; ds = ''
    for i, (big, lab, one, ol, wc, det) in enumerate(rows):
        rs += ('<div class="tk-ct-r%s" data-i="%d" tabindex="0"><p class="t34 up a">%s</p><p class="lab3 al">%s</p>'
               '<p class="t34 up b">%s</p><p class="lab3 bl%s">%s</p></div>') % (' on' if i == 0 else '', i, esc(big), esc(lab), esc(one), ' wc' if wc else '', esc(ol))
        ds += '<div class="tk-ct-p%s" data-i="%d"><p class="lab3 n">%02d</p><div class="tk-ct-c">%s</div></div>' % (' on' if i == 0 else '', i, i + 1, det)
    return '\n'.join([
        '<section class="film tk-ct" data-fig="count" data-len="2.7" data-open="0" id="@ID@">', '  <div class="stg">',
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc tk-ct-s">',
        '      <div class="tk-ct-h"><p class="lab3 rv">%s</p><h2 class="t60 rv">%s</h2></div>' % (esc(kick), hl),
        '      <p class="t20 rv tk-ct-l">%s</p>' % (esc(nop(lead)) if isinstance(lead, str) else ' <br class="bd">'.join(esc(nop(x)) if i == len(lead) - 1 else esc(x) for i, x in enumerate(lead))),
        '      <div class="tk-ct-g rv" data-count><div class="tk-ct-t">%s</div><div class="tk-ct-d"><p class="lab3 tk-ct-n" aria-hidden="true"><span>%s</span></p>%s</div></div>' % (
            rs, ''.join('<i>%02d</i>' % (i + 1) for i in range(len(rows))), ds),
        '    </div>', '  </div>', '</section>'])
def tk_items(parts):
    """the content of a count: its items in columns of three, each behind the site's blue square (her frame 643:8641)"""
    return '<ul class="tk-ct-i">%s</ul>' % ''.join('<li style="--k:%d">%s</li>' % (k, esc(x)) for k, x in enumerate(parts))

def tk_team(kick, title, pairs, closer_, img, line, lines2):
    """07 + 08 as ONE film — her frames `644:8972` and `633:428` (18.11 16:15): «На першому макеті у нас є ось такий список. Зверстай його
    точно так само. І зліва внизу у нас є фотографія маленька. Коли ми скролимо, вона буде збільшуватись, ставати на весь екран,
    затемнюватись… І появляється інформація, та, яка в мене на макеті.»
    The first state: the name and the title on the left field (`title` = (blue, white) halves by line), a hairline down the screen at
    851, the five conditions right of it as rows of 78 — the condition in small caps, what CI does about it in the running 20 — the
    closing sentence in the 34 on the foot, and a square of the photograph, 217, in the bottom left corner.
    The scroll: that square GROWS until it is the screen (in the shader, `team()` in js/inner.js: the picture is fitted to the growing
    frame every moment, so it is never stretched), it is graded down, the two centre hairlines are ruled, and the client's sentence
    stands on their crossing — its first half in the 60, set flush right against the vertical line, the rest in the running 20 under
    the horizontal one. `pairs` are the client's own sentences cut at their comma: the comma stays in the page for the reader and the
    checker (class .vh), and is not drawn — as in her frame."""
    hl = ''
    for i, (bl, wh) in enumerate(title):
        if i: hl += '<br>'
        if bl: hl += '<span class="cb">%s</span>' % esc(bl)
        if wh: hl += esc(wh)
    # a row is (the condition, what we do) — the client's sentence cut at its comma, which stays in the page unseen — or, with a third
    # item '', a sentence cut where it has no comma (18.11 18:45, CI Core: «Questions | move internally»)
    rs = ''.join('<div class="tk-ot-r"><p class="lab3 a">%s%s</p><p class="t20 b">%s</p></div>' % (
        esc(r[0]), '<span class="vh">,</span>' if len(r) < 3 else '', esc(nop(r[1]))) for r in pairs)
    return '\n'.join([
        '<section class="film tk-ot" data-fig="team" data-len="3.1" data-open="0" id="@ID@">', '  <div class="stg">',
        '    <div class="sc tk-ot-a">',
        '      <div class="tk-ot-h"><p class="tk-cv-k rv">%s</p><h2 class="t60 rv">%s</h2></div>' % (esc(kick), hl),
        '      <i class="tk-ot-v" aria-hidden="true"></i>',
        '      <div class="tk-ot-g rv">%s</div>' % rs,
        ] + (['      <p class="t34 tk-ot-c">%s</p>' % esc(nop(closer_))] if closer_ else []) + [      # not .rv: it stands on the foot, under the line where reveals begin
        '    </div>',
        '    <div class="tk-ot-ph"><img src="%s" alt=""></div>' % img,
        '    <canvas class="ln" aria-hidden="true"></canvas>',
        '    <div class="sc tk-ot-b">',
        '      <p class="t60 m tk-ot-t" data-k="2.24 2.62 99 99">%s</p>' % '<br>'.join(esc(x) for x in line),
        '      <p class="t20 m tk-ot-p" data-k="2.5 2.78 99 99">%s</p>' % ' <br class="bd">'.join(esc(nop(x)) if i == len(lines2) - 1 else esc(x) for i, x in enumerate(lines2)),
        '    </div>', '  </div>', '</section>'])

def tk_strip(kick, title, stages):
    """10 — her frame `644:8827` (18.11 16:11): the process as a row of squares that runs off the right edge of the screen. The name of
    the block and its title stand centred at the head (`title` = (white, blue) halves by line); under them the eight stages, each a
    square of 470 drawn in our hairline — its number at the head, its name in the 34 a little above the middle, its sentence in the
    running 20 on the foot. The screen is pinned and the scroll carries the row to the left until the eighth stands at the right
    field (`strip()` in js/inner.js). Under the pointer a square takes the frame's gradient (the blue into the dark).
    stages: (name, sentence, wc) — wc marks a sentence adapted from the client's on her word («з такою самою кількістю тексту…
    на кожну карточку свій текст»), so it can be found and replaced."""
    hl = ''
    for i, (wh, bl) in enumerate(title):
        if i: hl += '<br>'
        if wh: hl += esc(wh)
        if bl: hl += '<span class="cb">%s</span>' % esc(bl)
    cs = ''.join('<article class="tk-st-c"><p class="lab3 n">%02d</p><h3 class="t34 up nm">%s</h3><p class="t20 tx%s">%s</p></article>' % (
        i + 1, esc(n), ' wc' if wc else '', esc(nop(t))) for i, (n, t, wc) in enumerate(stages))
    return '\n'.join([
        '<section class="film tk-st" data-fig="strip" data-len="3" data-open="0" id="@ID@">', '  <div class="stg">',
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc tk-st-s">',
        '      <div class="tk-st-h"><p class="tk-cv-k rv">%s</p><h2 class="t60 rv">%s</h2></div>' % (esc(kick), hl),
        '      <div class="tk-st-w"><div class="tk-st-t" data-strip>%s</div></div>' % cs,
        '    </div>', '  </div>', '</section>'])

def tk_slider(title, button, items):
    """11 — her frame `644:8894` (18.11 16:10): the projects as a slider. The title on the left field (`title` = lines of (white, blue,
    white)), the button on its last baseline at the right field; under them one row: the project in hand large in the middle
    (886 : 670) with its name and its line of small caps under it, the one before it and the one after it small either side
    (447 : 278), on the same top line, 20 apart. «По боках стоять плюсики. Це неправильно. Я хочу, щоб ти перемалював стрілку вліво
    і стрілку вправо, щоб наш слайдер працював. І в нашій стилістиці, в стилістиці цих плюсиків» — so the two controls are the cards'
    own mark (a circle of 48 in our hairline) with an arrow drawn of the same bars, on the foot of the large picture at either field.
    The pictures are one WebGL layer (`[data-pjs]` in js/inner.js): on a step each picture travels to its next place and is fitted
    to its frame all the way, the one that leaves closes at the field and the one that arrives opens from it. The <img> elements are
    its textures and its stand-in. items: (name, parts of the small caps, picture, href, focus) — focus = the point of the picture
    kept in the frame (x, y of the picture, 0…1), read from her crops."""
    hl = ''
    for i, (a, b, c) in enumerate(title):
        if i: hl += '<br>'
        hl += esc(a) + ('<span class="cb">%s</span>' % esc(b) if b else '') + esc(c)
    ims = ''.join('<img src="%s" alt="" data-f="%s">' % (im, '%.3f,%.3f' % fo) for n, parts, im, hf, fo in items)
    caps = ''.join('<a class="tk-pj-cp%s" href="%s"><span class="nm h5r">%s</span><span class="lc lab3 sqm">%s</span></a>' % (
        ' on' if i == 0 else '', hf, esc(n), ''.join('<span>%s</span>' % esc(x) for x in parts if x)) for i, (n, parts, im, hf, fo) in enumerate(items))
    ar = '<i></i><i></i><i></i>'
    return '\n'.join([
        '<section class="bk tk-pj" id="@ID@" data-pjs>',
        '  <div class="tk-pj-h"><h2 class="t60 rv">%s</h2><div class="rv tk-pj-b">%s</div></div>' % (hl, button),
        '  <div class="tk-pj-r rv">',
        '    <i class="tk-pj-s l" aria-hidden="true"></i><i class="tk-pj-s c" aria-hidden="true"></i><i class="tk-pj-s r" aria-hidden="true"></i>',
        '    <div class="tk-pj-ph" aria-hidden="true">%s</div>' % ims,
        '    <button class="tk-pj-go l" type="button" tabindex="-1" aria-hidden="true"></button><a class="tk-pj-go c" href="%s" aria-label="%s"></a><button class="tk-pj-go r" type="button" tabindex="-1" aria-hidden="true"></button>' % (items[0][3], esc(items[0][0])),
        '    <button class="tk-pj-a prev" type="button" aria-label="Previous project">%s</button><button class="tk-pj-a next" type="button" aria-label="Next project">%s</button>' % (ar, ar),
        '  </div>',
        '  <div class="tk-pj-c">%s</div>' % caps,
        '</section>'])

def tk_lead(thought, para_, button):
    """02 — the thought of the page, and nothing else on the screen. Everything on the text line: the sentence, the paragraph under it, the button
    under that. (17.11 07:57: «все розкидано, неможливо це читати» — from here on every block of this page begins at the same left edge.)"""
    return ('<section class="bk tk-ld" id="@ID@">\n  <p class="t60s rv tk-ld-h">%s</p>\n'
            '  <p class="t20 rv tk-ld-t" style="--w:475">%s</p>\n  <div class="rv tk-ld-b">%s</div>\n</section>') % (
                thought, esc(nop(para_)), button)
def tk_fit(kick, h1, lead, rows, img, title_lines):
    """04 — the home page's «CI Difference», given to this block on her word (17.11 19:34: «оцей наш нижній блок переробити за принципом
    того, як зроблений дизайн верхнього блоку. А фотографію використай таку, яку ми ще не використовували»). The photograph is ruled
    into the same grid — four columns, a band under the header and two rows of 480 — a condition stands in each cell as a short centred
    name with the site's square at its corner (19:46: not the round plus — «це типа кнопка? куди вона буде переходити?»), and the one
    in hand opens as a white card: its number, its name, and the client's sentence at the foot. The white panel in the lower left corner carries the block's label, its title and the lead. The markup and the classes
    are the home page's own (`.df2*`, css/chapters.css + css/r3.css); only what differs is in css/inner.css (`.tk-df`): seven cells and
    a panel one column wide, since there are seven conditions and not six.
    `rows` = [(the name's lines, the client's sentence)]: a name is a run of the sentence's OWN words, never anything written by us —
    the assert keeps it so."""
    cells = ''
    for i, (nm, sent) in enumerate(rows):
        assert nop(' '.join(nm)).lower() in nop(sent).lower(), (nm, sent)
        n = '<br>'.join(esc(x) for x in nm)
        cells += ('<button style="--k:%d" class="df2-cell c%d%s" type="button" data-i="%d" aria-expanded="%s" aria-label="%s">'
                  '<span class="df2-nm">%s</span><span class="df2-card"><span class="df2-cn">%02d</span><span class="df2-ct">%s</span>'
                  '<span class="df2-cd">%s</span></span><span class="df2-pm" aria-hidden="true"></span></button>') % (
                      i, i + 1, ' on' if i == 3 else '', i, 'true' if i == 3 else 'false', esc(nop(sent)), n, i + 1, n, esc(nop(sent)))
    assert nop(' '.join(title_lines)).lower() == nop(h1).lower(), (title_lines, h1)
    return ('<section class="df2 tk-df' + (' six' if len(rows) == 6 else '') + '" id="@ID@" data-df data-norail aria-label="%s">\n'
            '  <div class="df2-bgw" aria-hidden="true"><div class="df2-bgs"><div class="df2-bg on"><img src="%s" alt="" loading="lazy" decoding="async"></div></div></div>\n'
            '  <div class="df2-body">\n'
            '    <i class="df2-v a" aria-hidden="true"></i><i class="df2-v b" aria-hidden="true"></i><i class="df2-v c" aria-hidden="true"></i>'
            '<i class="df2-h a" aria-hidden="true"></i><i class="df2-h b" aria-hidden="true"></i>\n'
            '    <div class="df2-cells">%s</div>\n'
            '    <div class="df2-panel"><p class="tk-df-k">%s</p><h2 class="df2-big">%s</h2><p class="df2-s1"><b>%s</b></p></div>\n'
            '  </div>\n</section>') % (esc(kick), img, cells, esc(kick), '<br>'.join(esc(x) for x in title_lines), esc(nop(lead)))
def tk_rows(kick, h1, lead, rows, num=True, cls=''):
    """the page's one list (04), and the table of conditions (08): the same row — a number or the first half on the left, the sentence on the
    right, a hairline over each. One shape, read straight down."""
    rs = ''
    for i, r in enumerate(rows):
        a, b = (('%02d' % (i + 1)), r) if num else r
        rs += '<div class="tk-r-r rv"><p class="%s a">%s</p><p class="t20 b">%s</p></div>' % ('lab3' if num else 't20', esc(a), esc(nop(b)))
    return ('<section class="bk tk-rw%s" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '%s  <div class="tk-r-g">%s</div>\n</section>') % (
                cls, esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)),
                '  <p class="t20 rv tk-r-l" style="--w:475">%s</p>\n' % esc(nop(lead)) if lead else '', rs)
def tk_plate(img, line, pos=None):
    """05 — one photograph of the client's own work across the screen, and one sentence on it, on the same left edge as every other block"""
    return ('<section class="tk-pl" id="@ID@">\n  <div class="bnd tk-pl-b"><img src="%s" alt="" loading="lazy"%s></div>\n'
            '  <p class="t34 rv tk-pl-t">%s</p>\n</section>') % (
                img, ' style="object-position:%s"' % pos if pos else '', esc(nop(line)))
def tk_recv(kick, title, lead, para, cap, lines, closer_, img):
    """05 — «What You Receive» on a photograph (18.11.2026 18:29–18:40). On the axis block of 17:01 she said: «він теж дуже
    перевантажений, і не цікавий абсолютно»; then: «повноформатна, широкоформатна фотографія, і на ній розміщений текст… його дуже
    багато, можливо, щось скрутити»; and, on the idea of a crossing that travels to six places in the picture: «роби, щоб було
    красиво і щоб було менше ризиків… щоб ми не втратили суть… і щоб він був зрозумілий і легко сприймався».
    So: one pinned screen on one photograph of the client's own work, and the block's text in THREE STEPS, never all at once —
      1  what changes for you: the name, the title in the 60 (two inks), the lead in the 34, the paragraph in the running 20;
      2  «We manage the intersections», and from it a hairline straight down: the six pairs come to it one after another with the
         scroll, the first word from the left, «with …» from the right, our square where they meet — and stand there complete;
      3  the closing sentence alone, in the 60, sentence case, two inks.
    Nothing in the picture is pointed at (no claim is made about what in this home is which intersection): the picture is the
    finished home, the text stands on its own dark wall, and the camera comes a little closer as the list is set (`recv()` in
    js/inner.js: WebGL, a slow push-in; the lights of the picture taken down a little, no veil).
    `title` = lines of (white, blue); `para` = its own lines; `lines` = the client's sentences, cut after the first word;
    `closer_` = lines of (white, blue)."""
    hl = ''
    for i, (wh, bl) in enumerate(title):
        if i: hl += '<br>'
        if wh: hl += esc(wh)
        if bl: hl += '<span class="cb">%s</span>' % esc(bl)
    rs = ''
    for x in lines:
        a, b = nop(x).split(' ', 1)
        rs += '<div class="tk-rc-r"><p class="t34 a">%s</p><i class="q" aria-hidden="true"></i><p class="t34 b">%s</p></div>' % (esc(a), esc(b))
    cl = ' <br class="lb">'.join(esc(w) + ('<span class="cb">%s</span>' % esc(b) if b else '') for w, b in closer_)
    return '\n'.join([
        '<section class="film tk-rc" data-fig="recv" data-len="3.1" data-open="0" id="@ID@">', '  <div class="stg">',
        '    <div class="tk-rc-ph"><img src="%s" alt=""></div>' % img,
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc tk-rc-s">',
        '      <div class="tk-rc-h"><p class="tk-cv-k rv">%s</p><h2 class="t60 rv">%s</h2>' % (esc(kick), hl),
        '        <p class="t34 rv tk-rc-l">%s</p>' % esc(nop(lead)),
        '        <p class="t20 rv tk-rc-p">%s</p></div>' % ' <br class="bd">'.join(esc(x) for x in para),
        '      <div class="tk-rc-x"><p class="t20 tk-rc-k">%s</p>' % esc(nop(cap)),
        '        <div class="tk-rc-a"><i class="tk-rc-v" aria-hidden="true"></i>%s</div></div>' % rs,
        '      <p class="t60s tk-rc-c">%s</p>' % cl,
        '    </div>', '  </div>', '</section>'])


def tk_calm(kick, h1, big, lines, closer_):
    """07 — the six ways of working as ONE paragraph, not six bullets (16.11 23:58), and the client's closing thought under it. The screen
    carries no heading of its own: the heading of this part of their copy stands over the four counts on screen 03, and repeating it here
    would read as two blocks saying the same thing."""
    hd = ('  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n' % (
        esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)))) if h1 else ''
    return ('<section class="bk tk-cm" id="@ID@">\n%s%s  <p class="t20 rv tk-cm-p" style="--w:475">%s</p>\n'
            '  <p class="t34 rv tk-cm-c">%s</p>\n</section>') % (
                hd, '  <p class="t34 rv tk-cm-b">%s</p>\n' % esc(nop(big)) if big else '',
                esc(nop(' '.join(lines))), blue(nop(closer_), None))
def tk_index(kick, h1, note, items):
    """09 — everything that stands behind one contract, as ONE field of words set apart by the blue square. Its weight is the point, so it is
    set quietly, under the page's smallest heading."""
    return ('<section class="bk tk-ix" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="lab3 rv tk-ix-n">%s</p>\n  <p class="t34 rv tk-ix-f">%s</p>\n</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 24)), esc(nop(note)), sqr(items))
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
    # 16.11: a client's words are never made up, so a quotation the client has not approved is not shown at all (as on the project pages)
    if text.strip().strip('“”"').startswith('['): return ''
    w = esc(who) if who else ''
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
    """the closing block of every page, her frame «09 CTA» (15.11 18:42) and her word of 16.11 19:05: the photograph on the home hero's cross of
    rules, THE TITLE in the lower left quarter, THE DESCRIPTION hung on the right with its foot on the title's foot, the button under the title.
    16.11 22:54: «Чому опис над заголовком? Це повністю по композиції неправильно» — a description NEVER stands above the title; what stands there
    is only a closing phrase of a few words (her word of 19:33 about «Let's begin with yours»), 20 over the title's capitals and the same 26 from
    the horizontal rule as from the vertical one."""
    t = nop(title); lines = _set(CTA_TITLE, t) or brk_lines(t, 22)
    parts = [nop(x) for p in paras for x in p]
    if len(parts) == 1:
        sp = sents(parts[0])
        if len(sp) == 2: parts = [nop(x) for x in sp]
    ps = ''.join('<p class="t20 rv%s">%s</p>' % (' cb' if i else '', '<br class="bd"> '.join(esc(y) for y in (_set(CTA_TEXT, x) or [x]))) for i, x in enumerate(parts))
    st = ';'.join(x for x in ['object-position:%s' % pos if pos else '', 'filter:contrast(1.04) brightness(%s)' % g if g else ''] if x)
    hd = '<h2 class="t60 rv fg-h">%s</h2>' % '<br>'.join(esc(x) for x in lines)
    short = len(parts) == 1 and len(parts[0]) <= 40           # a closing phrase, not a description
    if short:
        return ('<section class="fin gr" id="@ID@">\n  <img src="%s" alt="" loading="lazy"%s>\n  <div class="fg-in"><div class="fg-t">%s</div>%s</div>\n'
                '  <div class="rv fg-b">%s</div>\n</section>' % (img, ' style="%s"' % st if st else '', ps, hd, btn(button[0], button[1])))
    return ('<section class="fin gr" id="@ID@" style="--tl:%d">\n  <img src="%s" alt="" loading="lazy"%s>\n  %s\n'
            '%s  <div class="rv fg-b">%s</div>\n</section>'
            % (len(lines), img, ' style="%s"' % st if st else '', hd,
               '  <div class="fg-t fg-r">%s</div>\n' % ps if ps else '', btn(button[0], button[1])))

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

# ================================================================== CI CORE — one hand (17.11.2026)
# The page's whole argument is the seam between designing and building, so the page's line is VERTICAL (Turnkey's is the horizon), and the
# room is shown twice: as the drawing its lines make, and as the thing itself. The drawings are made from the client's own photographs by
# tools/site/lines.py — nothing is invented: every line in a drawing is a line of that room.
def sc_still(kick, h1, img, br=.72):
    """A cover that does not perform: the client's own room at full bleed, the title at the foot on the left as on every page of ours, and one
    slow settle of the picture. 17.11 12:36: «перший екран мені зовсім не подобається: все дуже дешеве» — a cover earns its level from the
    photograph and the type, not from a trick played on it."""
    hb = brk(h1, 18); ln = hb.count('<br>') + 1
    return '\n'.join([
        '<section class="film co-cv sc-sl" data-fig="glcv" data-gl="still" data-br="%s" data-len=".9" id="@ID@">' % br, '  <div class="stg">',
        '    <div class="co-cv-ph">',
        '      <img class="im on" src="%s" alt="" style="filter:contrast(1.06) brightness(%s)" data-s="sc:1.08&gt;1@0-1.4">' % (img, br),
        '    </div>',
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc">',
        '      <p class="lab3 rv co-cv-k" style="--ln:%d">%s</p>' % (ln, esc(kick)),
        '      <h1 class="t111 rv co-cv-h" style="--ln:%d">%s</h1>' % (ln, hb),
        '    </div>', '  </div>', '</section>'])
def co_cover(kick, h1, img, ln, idea=None):
    """01 — the cover states the thesis before a word of copy: the room stands as a drawing, and the scroll builds it. No stock, no slogan.
    18.11.2026 18:45 («давай займися іншими сторінками» — the other solutions on Turnkey's skeleton): `idea` = (name, the thought's
    lines, the paragraph's lines, the button) stands ON the built photograph, as on Turnkey's cover (her frame 637:7894): the film
    runs on, the title leaves, the page's two centre hairlines are ruled and the thought comes in right of the vertical one."""
    hb = brk(h1, 18); lnn = hb.count('<br>') + 1
    out_ = ' data-s="op:1&gt;0@1.1-1.3"' if idea else ''
    return '\n'.join([
        '<section class="film co-cv%s" data-fig="glcv" data-gl="build" data-br=".72" data-len="%s"%s id="@ID@">' % (' has-i' if idea else '', '2.5' if idea else '1.2', ' data-open="0"' if idea else ''), '  <div class="stg">',
        '    <div class="co-cv-ph">',
        '      <img class="dr" src="%s" alt="" data-s="op:1&gt;0@.16-.84">' % ln,
        '      <img class="im" src="%s" alt="" data-s="op:0&gt;1@.14-.8; sc:1.06&gt;1@0-1.1">' % img, '    </div>',
        '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc">',
        '      <p class="lab3 rv co-cv-k" style="--ln:%d"%s>%s</p>' % (lnn, out_, esc(kick)),
        '      <h1 class="t111 rv co-cv-h" style="--ln:%d"%s>%s</h1>' % (lnn, out_, hb),
        '    </div>'] + ([
        '    <div class="sc tk-cv-i">',
        '      <p class="tk-cv-k m tk-cv-ik" data-k="1.4 1.56 99 99">%s</p>' % esc(idea[0]),
        '      <h2 class="t60 m tk-cv-ih" data-k="1.46 1.86 99 99">%s</h2>' % '<br>'.join(esc(x) for x in idea[1]),
        '      <p class="t20 m tk-cv-ip" data-k="1.7 1.96 99 99">%s</p>' % ' <br class="bd">'.join(esc(x) for x in idea[2]),
        '      <div class="m tk-cv-ib" data-k="1.82 2.02 99 99">%s</div>' % idea[3],
        '    </div>'] if idea else []) + ['  </div>', '</section>'])
def co_seam(kick, h1, lead, ps, strong, img, ln):
    """03 — the page's instrument. One room, drawn on one side of a line and built on the other, and the line follows the pointer: the visitor
    moves the seam themselves and sees that there is nothing behind it. Their own sentence stands under it — «Design understands construction.
    Construction understands design.»"""
    return ('<section class="bk co-sm" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="t20 rv co-sm-l" style="--w:475">%s</p>\n'
            '  <div class="co-sm-g rv" data-seam style="--x:50%%">\n'
            '    <img class="co-sm-dr" src="%s" alt="">\n    <img class="co-sm-im" src="%s" alt="" loading="lazy">\n'
            '    <span class="co-sm-ln" aria-hidden="true"></span>\n  </div>\n'
            '  <p class="t34 rv co-sm-s">%s</p>\n%s</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)), esc(nop(lead)), ln, img,
                blue(' '.join(nop(x) for x in strong), None),
                ''.join('  <p class="t20 rv co-sm-p" style="--w:475">%s</p>\n' % esc(nop(x)) for x in ps))
def co_split(kick, h1, note, left, right, close=None):
    """07 — the connected scope, set as what the page is about: two columns either side of ONE vertical hairline, design on its left and
    construction on its right, so the seam is the block"""
    col = lambda g: ''.join('<li>%s</li>' % esc(x) for x in g)
    return ('<section class="bk co-sp" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="lab3 rv co-sp-n">%s</p>\n  <div class="co-sp-g rv"><ul>%s</ul><i aria-hidden="true"></i><ul>%s</ul></div>\n%s</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 24)), esc(nop(note)), col(left), col(right),
                '  <p class="t20 rv co-sp-c" style="--w:475">%s</p>\n' % esc(nop(close)) if close else '')
def co_roles(kick, h1, ps, lines, strong):
    """06 — «Your role … Our role …»: the two halves of the page's sentence, one either side of the same vertical line"""
    a, b = strong[0], strong[1]
    mid = ''.join('<p class="t20">%s</p>' % esc(nop(x)) for x in lines)
    return ('<section class="bk co-rl" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <div class="co-rl-p rv">%s</div>\n  <div class="co-rl-m rv">%s</div>\n'
            '  <div class="co-rl-g rv"><p class="t34">%s</p><i aria-hidden="true"></i><p class="t34">%s</p></div>\n</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)),
                ''.join('<p class="t20" style="--w:475">%s</p>' % esc(nop(x)) for x in ps), mid, esc(nop(a)), blue(nop(b), None))
def co_band(kick, h1, stages):
    """08 — the six stages as one band, the columns kept apart by the page's own vertical hairlines"""
    cells = ''.join('<div class="co-bd-c rv"><p class="lab3 n">%02d</p><p class="t34 h">%s</p><p class="t20 t">%s</p></div>'
                    % (i + 1, esc(nm), esc(nop(tx))) for i, (nm, tx) in enumerate(stages))
    return ('<section class="bk co-bd" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <div class="co-bd-g">%s</div>\n</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)), cells)

# ================================================================== CI CURATED — the layers (17.11.2026)
# Their own words: «the layers that make a residence feel complete», «Each layer belongs to the same story», «The Final Layers Are Often the
# Most Personal». So the page's device is COMPOSITION: fragments of the client's own rooms arrive and take their places, and the visitor can
# lift any one of them out of the whole. The line is neither the horizon nor the seam here — the pieces themselves hold the grid.
def cu_cover(kick, h1, img, parts):
    """01 — the cover comes together. The same photograph stands on the screen in pieces, and the scroll brings them to their places until the
    room is one picture. Nothing arrives from outside: every fragment is already part of what it will become."""
    hb = brk(h1, 18); ln = hb.count('<br>') + 1
    o = ['<section class="film cu-cv" data-fig="drawn" data-len="1.35" id="@ID@">', '  <div class="stg">', '    <div class="cu-cv-ph">']
    for i, (t, r, b, l, a0) in enumerate(parts):
        o.append('      <img src="%s" alt="" style="clip-path:inset(%s%% %s%% %s%% %s%%)" '
                 'data-s="ci:%s,%s,%s,%s&gt;0,0,0,0@%.2f-%.2f; op:.55&gt;1@%.2f-%.2f">' % (
                     img, t, r, b, l, t, r, b, l, a0, a0 + .62, a0, a0 + .62))
    o += ['    </div>', '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc">',
          '      <p class="lab3 rv cu-cv-k" style="--ln:%d">%s</p>' % (ln, esc(kick)),
          '      <h1 class="t111 rv cu-cv-h" style="--ln:%d">%s</h1>' % (ln, hb), '    </div>', '  </div>', '</section>']
    return '\n'.join(o)
def cu_comp(kick, h1, lead, ps, strong, cells):
    """03 — the page's instrument: a residence composed. Six fragments of the client's own rooms stand on the grid; the pointer on one names it
    and lifts it, and the rest step back. Their own list — «Scale. Comfort. Furniture. Art. Texture. Objects.» — is the composition itself,
    not a line of text."""
    cs = ''
    for i, (nm, im, cl) in enumerate(cells):
        cs += ('<figure class="cu-c %s rv" data-i="%d" tabindex="0"><img src="%s" alt="" loading="lazy">'
               '<p class="lab3">%s</p></figure>') % (cl, i, im, esc(nm))
    return ('<section class="bk cu-cp" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="t34 rv cu-cp-l">%s</p>\n  <div class="cu-cp-g rv" data-comp>%s</div>\n'
            '%s  <p class="t34 rv cu-cp-s">%s</p>\n</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)), esc(nop(lead)), cs,
                ''.join('  <p class="t20 rv cu-cp-p" style="--w:475">%s</p>\n' % esc(nop(x)) for x in ps),
                blue(' '.join(nop(x) for x in strong), None))
def cu_layers(kick, h1, ps, lines, strong):
    """06 — «Furniture is considered against circulation and scale…»: four considerations, each on its own rule, and each rule a shade
    brighter than the one above it — the layers gathering"""
    rs = ''.join('<div class="cu-ly-r rv" style="--i:%d"><p class="t34">%s</p></div>' % (i, esc(nop(x))) for i, x in enumerate(lines))
    return ('<section class="bk cu-ly" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '%s  <div class="cu-ly-g">%s</div>\n  <p class="t34 rv cu-ly-c">%s</p>\n</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)),
                ''.join('  <p class="t20 rv cu-ly-p" style="--w:475">%s</p>\n' % esc(nop(x)) for x in ps),
                rs, blue(nop(strong), None))
def cu_steps(kick, h1, stages):
    """08 — «From Architecture to Atmosphere». The seven stages do not replace one another: they ACCUMULATE. Each arrives as the scroll reaches
    it and stays, on a rule a shade brighter than the one above it, until all seven stand together — which is the page's whole argument,
    «Each layer belongs to the same story». (17.11 12:36: a process set as seven numbered rows is one more list; watched gathering, it is the
    thing the page is about.)"""
    d = .4; t0 = .25; n = len(stages)
    o = ['<section class="film cu-st" data-fig="drawn" data-len="%.2f" id="@ID@">' % (t0 + n * d + .5), '  <div class="stg">',
         '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc">',
         '      <p class="lab3 m cu-st-k" data-k="0 .16 99 99">%s</p>' % esc(kick),
         '      <p class="t60 m cu-st-h" data-k="0 .2 99 99">%s</p>' % '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26))]
    for i, (nm, tx) in enumerate(stages):
        T = t0 + i * d
        o.append('      <div class="m cu-st-r" data-k="%.2f %.2f 99 99" style="--i:%d">'
                 '<p class="lab3 n">%02d</p><p class="t34 h">%s</p><p class="t20 t" style="--w:430">%s</p></div>'
                 % (T, T + .22, i, i + 1, esc(nm), esc(nop(tx))))
    o.append('    </div>\n  </div>\n</section>')
    return '\n'.join(o)

# ================================================================== CI WELLNESS — the invisible (17.11.2026)
# «The environments around us influence daily routines in ways both visible and invisible… Controls can disappear. Technology can integrate.
# Infrastructure can remain behind the architecture.» So the page's device is a room that LOOKS like a room until you ask it a question: the
# client's own nine — light, air, water, sleep, recovery, acoustics, temperature, movement, daily routines — are drawn over it in our own
# hairlines, one at a time, and the room goes back to being a room the moment you let go.
WL_PATHS = [
    ('M 120 40 L 620 880 M 320 30 L 980 820 M 40 200 L 420 900',                                    # light, from the window across the floor
     'M 30 170 C 430 60, 980 270, 1570 120',                                                        # air, along the ceiling
     'M 700 250 C 688 400, 716 520, 702 640 M 430 690 C 600 772, 860 772, 1010 690',                # water, falling and gathering
     'M 290 770 C 520 630, 1090 630, 1320 770',                                                     # sleep, the quiet field
     'M 1190 470 m -150 0 a 150 150 0 1 0 300 0 a 150 150 0 1 0 -300 0',                            # recovery, a circle that closes
     'M 1370 210 A 110 110 0 0 1 1370 390 M 1370 140 A 180 180 0 0 1 1370 460 M 1370 70 A 250 250 0 0 1 1370 530',   # acoustics
     'M 40 620 C 220 556, 400 684, 580 620 S 940 556, 1120 620 S 1480 684, 1570 620',               # temperature
     'M 60 870 C 480 806, 1000 826, 1560 740',                                                      # movement, across the floor
     'M 300 790 C 420 420, 700 300, 900 330 C 1180 370, 1300 560, 1240 760'),                       # daily routines, the loop of a day
][0]
def wl_unseen(kick, h1, lead, names, img, ps, feats):
    """03 — the page's instrument. The room is a room; the pointer on one of the client's nine draws it over the room in a single stroke, and
    lets it go again. Nothing is labelled on the photograph and nothing is faked as a technical plan: these are the qualities of a home, drawn."""
    g = ''.join('<g data-i="%d"><path d="%s"/></g>' % (i, d) for i, d in enumerate(WL_PATHS))
    nm = ''.join('<button class="wl-b lab3%s" data-i="%d" type="button">%s</button>' % (' on' if i == 0 else '', i, esc(n))
                 for i, n in enumerate(names))
    ds = ''
    for i, fs in enumerate(feats):                      # what each quality actually means in a house, in the client's own words
        ds += '<div class="wl-d%s" data-i="%d">%s</div>' % (
            ' on' if i == 0 else '', i,
            ''.join('<div class="wl-d-f"><p class="t34">%s</p><p class="t20" style="--w:475">%s</p></div>' % (esc(a), esc(nop(b)))
                    for a, b in fs))
    return ('<section class="bk wl-un" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="t34 rv wl-un-l">%s</p>\n'
            '  <div class="wl-g rv" data-wl>\n    <img src="%s" alt="" loading="lazy">\n'
            '    <svg class="wl-sv" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">%s</svg>\n  </div>\n'
            '  <div class="wl-nm rv">%s</div>\n  <div class="wl-dd rv">%s</div>\n%s</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)), esc(nop(lead)), img, g, nm, ds,
                ''.join('  <p class="t20 rv wl-un-p" style="--w:475">%s</p>\n' % esc(nop(x)) for x in ps))
def wl_steps(kick, h1, lead, rows):
    """06 — the five steps of the integrated process, read straight down: the step in full ink, what it means beside it, the number quiet.
    One shape five times, so the eye learns it once."""
    rs = ''
    for i, (nm, body) in enumerate(rows):
        rs += ('<div class="wl-s-r rv"><p class="lab3 n">%02d</p><p class="t34 h">%s</p>'
               '<div class="wl-s-t" style="--w:475">%s</div></div>') % (
                   i + 1, esc(nop(nm)), ''.join('<p class="t20">%s</p>' % esc(nop(x)) for x in body))
    return ('<section class="bk wl-st" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="t34 rv wl-st-l">%s</p>\n  <div class="wl-s-g">%s</div>\n</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)), esc(nop(lead)), rs)
def wl_spa(kick, h1, sub, lead, parts, ps):
    """07 — the home spa: their own «Steam. Sauna. Cold therapy. Hydrotherapy. Meditation. Movement. Rest. Lighting. Sound.» set as one row of
    rooms on the page's own rules, because that sentence IS a plan of a room and not a paragraph"""
    cs = ''.join('<div class="wl-sp-c rv"><p class="t34">%s</p></div>' % esc(x) for x in parts)
    return ('<section class="bk wl-sp" id="@ID@">\n  <div class="bk-h"><p class="lab3">%s</p><h2 class="t60">%s</h2></div>\n'
            '  <p class="t34 rv wl-sp-h">%s</p>\n  <p class="t20 rv wl-sp-l" style="--w:475">%s</p>\n'
            '  <div class="wl-sp-g">%s</div>\n%s</section>') % (
                esc(kick), '<br>'.join(esc(x) for x in brk_lines(nop(h1), 26)), esc(nop(sub)), esc(nop(lead)), cs,
                ''.join('  <p class="t34 rv wl-sp-p">%s</p>\n' % esc(nop(x)) for x in ps))

def sc_you(kick, h1, lead, rows, close=None):
    """«Is this you?» — on every one of the four pages this was the page's longest list, seven lines of small type on seven hairlines. It is one
    statement at a time now: the line alone on the screen at the size of a heading, its number beside it, the next arriving as the last leaves.
    (17.11 12:36: «Ти все переважно подав просто списками» — a list of sentences about the reader is not a list, it is a question asked seven
    times.) The scroll is the only control: nothing moves on a timer."""
    d = .54; t0 = .3; n = len(rows)
    o = ['<section class="film sc-yo" data-fig="drawn" data-len="%.2f" id="@ID@">' % (t0 + n * d + .45), '  <div class="stg">',
         '    <canvas class="ln" aria-hidden="true"></canvas>', '    <div class="sc">',
         '      <p class="lab3 m yo-k" data-k="0 .18 99 99">%s</p>' % esc(kick),
         '      <p class="t34 m yo-l" data-k="0 .2 99 99" style="--w:620">%s</p>' % esc(nop(lead))]
    for i, r in enumerate(rows):
        T = t0 + i * d; last = i == n - 1
        k = '%.2f %.2f %s' % (T, T + .18, '99 99' if last else '%.2f %.2f' % (T + d - .14, T + d + .02))
        o.append('      <p class="lab3 m yo-n" data-k="%s">%02d<span class="wc"> / %02d</span></p>' % (k, i + 1, n))
        o.append('      <p class="t60s m yo-t" data-k="%s">%s</p>' % (k, '<br>'.join(esc(x) for x in brk_lines(nop(r), 34))))
    if close:
        T = t0 + n * d
        o.append('      <p class="t20 m yo-c" data-k="%.2f %.2f 99 99" style="--w:475">%s</p>' % (T - .1, T + .12, esc(nop(close))))
    o.append('    </div>\n  </div>\n</section>')
    return '\n'.join(o)
