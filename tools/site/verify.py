# every sentence of the client's copy (2nd round) must stand on its page, word for word (closing periods aside)
import json, re, html
import os
HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.normpath(os.path.join(HERE, '..', '..', 'design')) + '/'
RAW = open(os.path.join(HERE, 'content.json'), encoding='utf-8').read()
for _a, _b in json.load(open(os.path.join(HERE, 'dashes.json'), encoding='utf-8'))['pairs']: RAW = RAW.replace(_a, _b)   # 16.11: the agreed changes of punctuation (no dashes where the grammar lets them go)
P = json.loads(RAW)
MAPF = {'services': ['solutions.html'], 'turnkey': ['ci-turnkey.html'], 'core': ['ci-core.html'], 'curated': ['ci-curated.html'], 'wellness': ['ci-wellness.html'], 'portfolio': ['portfolio.html'],
        'project': ['collectors-home.html'], 'brokers': ['broker-program.html'], 'partnerships': ['partnerships.html'], 'news': ['news.html'], 'article': ['article.html'], 'contact': ['contact.html']}
def norm(t):
    t = html.unescape(t); t = t.replace(' ', ' ').replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    t = re.sub(r'\s+', ' ', t).strip().lower()
    return re.sub(r'[.\s]+$', '', t)
def page_text(f):
    h = open(D + f).read(); a = h.index('<main'); b = h.index('</main>'); m = h[a:b]
    m = re.sub(r'<br[^>]*>', ' ', m); m = re.sub(r'</(p|li|h1|h2|h3|div|span|dt|dd|a|button|label)>', ' ', m); m = re.sub(r'<[^>]+>', '', m)
    return ' ' + norm(m).replace('.', '') + ' '
# agreed exceptions: (page key, the client's text) → the text that stands on the page instead, and who decided
EXC = {('portfolio', 'Homes as Unique as the People Who Live in Them'): ('Homes Made for Unique Lives', 'the designer, 15.11.2026: the cover of Portfolio as in her frame'),
       ('turnkey', 'From First Idea to the First Night Home'): ('From Sketch to First Night Home', 'the designer, 17.11.2026 19:48: the cover of CI Turnkey as in her frame 610:99'),
       # 18.11.2026, her frames on the page «CI Turnkey · 1920 (з коду) · 18.11» — every time her word was «якщо текст відрізняється від клієнтського, роби так, як у мене на макеті»
       ('turnkey', 'CI Turnkey is the most complete expression of the CI model.'): ('The Most Complete Expression of the CI Model', 'the designer, 18.11.2026 09:27 / 16:14, frame 637:7894: the name stands over the thought as its label, the «is» goes'),
       ('turnkey', "You Shouldn't Have to Become an Expert in Renovation to Create an Extraordinary Home"): ('Create a Stunning Home Without Remodel Skills', 'the designer, 18.11.2026 16:13, frame 643:8641'),
       ('turnkey', 'One Team. Complete Responsibility.'): ('One Team and Complete Responsibility', 'the designer, 18.11.2026 16:15, frame 644:8972'),
       ('turnkey', 'Projects Delivered Through CI Turnkey'): ('Projects Delivered by CI Turnkey', 'the designer, 18.11.2026 16:10, frame 644:8894'),
       # the stages of the process, frame 644:8827, 16:11: «на кожну карточку свій текст… щоб кількість тексту була плюс-мінус така, як у мене» — the first is hers as typed,
       # the others are the client's sentences brought to its length and voice (TK_STAGE in pages.py; working copy, .wc on the page)
       ('turnkey', 'Understanding the client, residence, lifestyle, priorities, collections, wellness goals, and aspirations.'): ('Understanding You, Your Home, Lifestyle, Priorities, Collections, Wellness Goals, and Aspirations', 'the designer, 18.11.2026 16:11, frame 644:8827: her own card'),
       ('turnkey', 'Establishing scope, team, program, timeline, and project priorities.'): ('Establishing the Scope, Team, Program, Timeline, and Priorities That Will Guide Your Project', 'adapted on the designer\'s word, 18.11.2026 16:11'),
       ('turnkey', 'Developing the residence as one integrated vision.'): ('Developing Your Residence as One Integrated Vision, From the Architecture to the Last Detail', 'adapted on the designer\'s word, 18.11.2026 16:11'),
       ('turnkey', 'Technical documentation, budgeting, scheduling, procurement strategy, and coordination.'): ('Technical Documentation, Budgeting, Scheduling, Procurement Strategy, and Team Coordination', 'adapted on the designer\'s word, 18.11.2026 16:11'),
       ('turnkey', 'The residence is completed as a home, not handed over as a construction site.'): ('Your Residence Is Completed as a Home, Ready to Live In, Not Handed Over as a Construction Site', 'adapted on the designer\'s word, 18.11.2026 16:11')}
tot = miss = 0
for k, fs in MAPF.items():
    T = ''.join(page_text(f) for f in fs)
    for si, s in enumerate(P[k]):
        for it in s['items']:
            texts = []
            if it[0] == 'label': continue
            if it[0] in ('h1', 'h2', 'h3', 'h4'): texts = [it[1]]
            elif it[0] in ('lead', 'p', 'k', 'strong', 'quote'): texts = it[1]
            elif it[0] == 'row': texts = [it[1]] + [x for p in it[2] for x in p]
            elif it[0] == 'a': texts = [it[2]] if not it[2].startswith('[') else []
            elif it[0] == 'dl': texts = [x for dt, dd in it[1] for x in [dt] + dd]
            for t in texts:
                for part in ([t] if ' · ' not in t else t.split(' · ')):
                    n = norm(part).replace('.', ''); tot += 1
                    if k == 'project': n = n.replace('[project name]', 'collectors home')
                    if (k, part) in EXC:
                        r, why = EXC[(k, part)]; ok = norm(r).replace('.', '') in T
                        print('%s %-13s s%-2d %-6s «%s» stands for «%s» (%s)' % ('EXCEPTION' if ok else 'MISSING EXCEPTION', k, si, it[0], r, part, why)); miss += 0 if ok else 1; continue
                    if n and n not in T: miss += 1; print('MISSING %-13s s%-2d %-6s %s' % (k, si, it[0], part[:110]))
# the wellness features
T = page_text('ci-wellness.html')
for f in P['_feats']:
    for x in f:
        n = norm(x).replace('.', ''); tot += 1
        if n not in T: miss += 1; print('MISSING feat', x[:100])
print('checked', tot, 'missing', miss)
