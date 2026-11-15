# every sentence of the client's copy (2nd round) must stand on its page, word for word (closing periods aside)
import json, re, html
import os
HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.normpath(os.path.join(HERE, '..', '..', 'design')) + '/'
P = json.load(open(os.path.join(HERE, 'content.json')))
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
EXC = {('portfolio', 'Homes as Unique as the People Who Live in Them'): ('Homes Made for Unique Lives', 'the designer, 15.11.2026: the cover of Portfolio as in her frame')}
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
