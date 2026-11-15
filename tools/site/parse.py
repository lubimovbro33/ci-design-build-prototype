# The client-edited prototype (2nd round) → structured content, word for word.
import re, json, html
from html.parser import HTMLParser

class Node:
    def __init__(s, tag, attrs, parent): s.tag, s.attrs, s.parent, s.kids = tag, dict(attrs), parent, []
    def cls(s): return (s.attrs.get('class') or '').split()
VOID = {'br', 'img', 'input', 'hr', 'meta', 'link'}
class T(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.root = Node('root', [], None); s.cur = s.root
    def handle_starttag(s, t, a):
        n = Node(t, a, s.cur); s.cur.kids.append(n)
        if t not in VOID: s.cur = n
    def handle_endtag(s, t):
        c = s.cur
        while c is not s.root and c.tag != t: c = c.parent
        if c is not s.root: s.cur = c.parent
    def handle_data(s, d): s.cur.kids.append(d)

def txt(n, br=' '):
    if isinstance(n, str): return n
    if n.tag == 'br': return br
    if n.tag in ('script', 'style', 'svg'): return ''
    return ''.join(txt(k, br) for k in n.kids)
def clean(t): return re.sub(r'[ \t\r\n]+', ' ', t).strip()
def lines(n): return [clean(x) for x in txt(n, '\n').split('\n') if clean(x)]
def find(n, pred, out=None):
    out = [] if out is None else out
    for k in n.kids:
        if isinstance(k, str): continue
        if pred(k): out.append(k)
        find(k, pred, out)
    return out
def has(n, c): return c in n.cls()
def inside(n, c):
    p = n.parent
    while p is not None:
        if c in p.cls() or p.tag == c: return True
        p = p.parent
    return False

def section(sec):
    S = {'cls': ' '.join(sec.cls()), 'id': sec.attrs.get('id', ''), 'items': []}
    it = S['items']
    def walk(n):
        for k in n.kids:
            if isinstance(k, str): continue
            c = k.cls(); t = k.tag
            if t in ('script', 'style', 'svg') or 'tag' in c: continue
            if 'ph' in c or 'img' in c and not find(k, lambda x: x.tag in ('h2', 'h3', 'p')): continue
            if 'row' in c:
                h = find(k, lambda x: x.tag == 'h4'); ps = find(k, lambda x: x.tag == 'p')
                it.append(['row', clean(txt(h[0])) if h else '', [lines(p) for p in ps]]); continue
            if 'eyebrow' in c:
                it.append(['label', re.sub(r'^\d+\s*(/\s*\d+)?\s*', '', clean(txt(k))), clean(txt(k))]); continue
            if t in ('h1', 'h2', 'h3', 'h4'): it.append([t, clean(txt(k))]); continue
            if t == 'p':
                ls = lines(k); strong = bool(find(k, lambda x: x.tag == 'strong')) and clean(txt(k)) == clean(''.join(txt(x) for x in find(k, lambda x: x.tag == 'strong')))
                kind = 'lead' if 'lead' in c else 'k' if 'k' in c else 'quote' if 'quote' in c or 'q' in c else 'strong' if strong else 'p'
                if ls: it.append([kind, ls]); continue
            if t == 'blockquote': it.append(['quote', lines(k)]); continue
            if t == 'a' and (('btn' in c) or 'cta' in c or 'link' in c or k.attrs.get('href', '').startswith('#')):
                tx = clean(txt(k))
                if tx: it.append(['a', k.attrs.get('href', ''), tx]); continue
            if t == 'dl':
                dts = find(k, lambda x: x.tag == 'dt'); dds = find(k, lambda x: x.tag == 'dd')
                it.append(['dl', [[clean(txt(a)), lines(b)] for a, b in zip(dts, dds)]]); continue
            if t == 'form':
                f = []
                for lab in find(k, lambda x: x.tag == 'label'):
                    opts = [clean(txt(o)) for o in find(lab, lambda x: x.tag == 'option')]
                    name = clean(''.join(x if isinstance(x, str) else (txt(x) if x.tag not in ('select', 'input', 'textarea') else '') for x in lab.kids))
                    kind = 'select' if opts else 'textarea' if find(lab, lambda x: x.tag == 'textarea') else 'input'
                    f.append([name, kind, opts])
                btn = find(k, lambda x: x.tag == 'button')
                it.append(['form', f, clean(txt(btn[0])) if btn else '']); continue
            if 'chip' in c or 'filter' in c and t in ('button', 'span'):
                it.append(['chip', clean(txt(k))]); continue
            walk(k)
    walk(sec)
    return S

src = open('/home/claude/proto-r2/index.html').read()
ids = re.findall(r'<div class="page" id="(p-[a-z]+)">', src)
P = {}
for i, pid in enumerate(ids):
    a = src.index('<div class="page" id="%s">' % pid); b = src.index('<div class="page" id="%s">' % ids[i + 1]) if i + 1 < len(ids) else src.index('</main>') if '</main>' in src[a:] else len(src)
    t = T(); t.feed(src[a:b])
    P[pid[2:]] = [section(s) for s in find(t.root, lambda x: x.tag == 'section')]
# wellness features (built by script in the prototype)
m = re.search(r'feats=(\[.*?\])\s*,\s*fh2', src, re.S)
P['_feats'] = json.loads(m.group(1))
json.dump(P, open('content.json', 'w'), ensure_ascii=False, indent=1)
for k, v in P.items():
    if k.startswith('_'): continue
    print(k, len(v), 'sections;', sum(len(s['items']) for s in v), 'items')
