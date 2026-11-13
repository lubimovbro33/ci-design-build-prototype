import json, sys, statistics, re
SRC, OUTDIR, LANG = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(SRC))
import os; os.makedirs(OUTDIR, exist_ok=True)
# ---------- global style / colour tables ----------
GS, GSK, GC, GCK = [], {}, [], {}
def gstyle(s):
    k = (s['f'], s['w'], round(s['s'], 1), s['tc'], s['it'])
    if k not in GSK: GSK[k] = len(GS); GS.append(dict(s, roles={}))
    r = s.get('role') or 'Text'; GS[GSK[k]]['roles'][r] = GS[GSK[k]]['roles'].get(r, 0) + 1
    return GSK[k]
def gcol(c):
    k = tuple(c)
    if k not in GCK: GCK[k] = len(GC); GC.append(list(c))
    return GCK[k]
def remap(n, sm, cm):
    if n.get('t') == 'T':
        n['runs'] = [[r[0], sm[r[1]], cm[r[2]], r[3]] for r in n['runs']]
    for f in n.get('fills', []):
        if f['t'] == 'S': f['c'] = cm[f['c']]
        else: f['s'] = [[s[0], cm[s[1]]] for s in f['s']]
    if 'st' in n: n['st']['c'] = cm[n['st']['c']]
    for c in n.get('ch', []): remap(c, sm, cm)
VIS = lambda n: any(k in n for k in ('fills', 'st', 'r', 'op', 'clip'))
def lh_of(n):
    try: return max(GS[r[1]]['lh'] or GS[r[1]]['s'] * 1.25 for r in n['runs'])
    except Exception: return 20
def single_line(n): return n['h'] <= lh_of(n) * 1.45
def is_chip(n): return n.get('t') == 'F' and n.get('l') == 'H' and len(n.get('ch', [])) <= 2 and all(c['t'] == 'T' for c in n.get('ch', [])) and n['w'] < 400
NAMEMAP = {'wrap': 'Container'}
def nice_name(n, plt):
    nm = n.get('n') or 'Frame'
    el = n.get('el', '')
    if nm in ('Frame', 'div', 'Link', 'a', 'span') or nm == el.split('.')[0].lower():
        if n.get('t') == 'F':
            nm = 'Column' if plt == 'G' else ({'V': 'Stack', 'H': 'Row', 'G': 'Grid'}.get(n.get('l'), 'Frame'))
    return NAMEMAP.get(nm, nm)
def norm(n, plt=None, pbox=None):
    """returns normalised node (layout-ready)"""
    if n['t'] == 'F':
        kids = n.get('ch', [])
        # image card: gray placeholder with absolute caption blocks -> bottom-aligned stack
        if '.img' in n.get('el', '') and kids:
            n['l'] = 'V'; n['block'] = 0
            tops = [k for k in kids if 'top-lbl' in k.get('el', '')]; bots = [k for k in kids if 'top-lbl' not in k.get('el', '')]
            for k in kids: k.pop('abs', None)
            n['ch'] = tops + bots; kids = n['ch']
            n['pa'] = 'SPACE_BETWEEN' if tops and bots else ('MIN' if tops else 'MAX')
            n['gap'] = 0; n['pad'] = [0, 0, 0, 0]; n['card'] = 1
            if tops: tops[0]['_padfix'] = 1
        flow = [k for k in kids if not k.get('abs')]
        L = n.get('l')
        if L == 'V' and n.get('block'):
            fs = sorted(flow, key=lambda k: (k['y'], k['x']))
            if len(fs) >= 2 and all(abs(k['y'] - fs[0]['y']) < 3 for k in fs):
                L = n['l'] = 'H'; fs = sorted(flow, key=lambda k: k['x'])
                gaps = [fs[i+1]['x'] - fs[i]['x'] - fs[i]['w'] for i in range(len(fs)-1)]
                n['gap'] = round(statistics.median(gaps), 1); n['ca'] = 'MIN'
            else:
                n['ch'] = fs + [k for k in kids if k.get('abs')]
                gaps = [round(fs[i+1]['y'] - fs[i]['y'] - fs[i]['h'], 1) for i in range(len(fs)-1)]
                if gaps and max(gaps) - min(gaps) > 1.5:
                    # split by the largest gap into sub-stacks (keeps per-group spacing exact)
                    def split(items):
                        if len(items) < 2: return items[0] if items else None, None
                        g = [round(items[i+1]['y'] - items[i]['y'] - items[i]['h'], 1) for i in range(len(items)-1)]
                        if max(g) - min(g) <= 1.5: return None, max(0, statistics.median(g))
                        big = max(g); groups, cur = [], [items[0]]
                        for i, gg in enumerate(g):
                            if gg >= big - 1.5: groups.append(cur); cur = [items[i+1]]
                            else: cur.append(items[i+1])
                        groups.append(cur)
                        out = []
                        for gr in groups:
                            if len(gr) == 1: out.append(gr[0])
                            else:
                                _, sg = split(gr)
                                x0 = min(k['x'] for k in gr); y0 = gr[0]['y']; x1 = max(k['x'] + k['w'] for k in gr); y1 = max(k['y'] + k['h'] for k in gr)
                                sub = {'t': 'F', 'n': 'Group', 'l': 'V', 'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0, 'ch': gr, 'block': 1, 'el': 'group'}
                                out.append(sub)
                        return out, big
                    res, big = split(fs)
                    n['ch'] = res + [k for k in kids if k.get('abs')]
                    n['gap'] = big
                else:
                    n['gap'] = round(statistics.median(gaps), 1) if gaps else 0
            n.pop('block', None)
            kids = n['ch']; flow = [k for k in kids if not k.get('abs')]
        # padding from geometry (top/bottom for V, left/right from css)
        css = n.get('pad', [0, 0, 0, 0])
        if flow:
            x0 = min(k['x'] for k in flow); y0 = min(k['y'] for k in flow); x1 = max(k['x'] + k['w'] for k in flow); y1 = max(k['y'] + k['h'] for k in flow)
            bw = n.get('st', {}).get('w', [0, 0, 0, 0])
            if L == 'V':
                pad = [y0 - n['y'], css[1] + bw[1], n['y'] + n['h'] - y1, x0 - n['x'] if not n.get('ca') == 'CENTER' else css[3] + bw[3]]
                if n.get('card'): pad = [0, 0, 0, 0]
            elif L == 'H':
                pad = [css[0] + bw[0], (n['x'] + n['w'] - x1) if n.get('pa') not in ('SPACE_BETWEEN',) and not any(g for g in n.get('grow', [])) else css[1] + bw[1], css[2] + bw[2], x0 - n['x']]
                if is_chip(n): pad = [css[0] + bw[0], css[1] + bw[1], css[2] + bw[2], css[3] + bw[3]]
            else:
                pad = [y0 - n['y'], css[1] + bw[1], n['y'] + n['h'] - y1, css[3] + bw[3]]
            n['pad'] = [round(max(0, v), 1) for v in pad]
        else:
            n['pad'] = [round(v, 1) for v in css]
        inner = n['w'] - n['pad'][1] - n['pad'][3]
        # children
        newk = []
        for k in kids:
            k2 = norm(k, L, n)
            if k2 is None: continue
            # sizing
            if k2.get('abs'): k2['ws'] = 'FIXED'; k2['hs'] = 'FIXED'; k2['ax'] = round(k['x'] - n['x'], 1); k2['ay'] = round(k['y'] - n['y'], 1)
            else:
                t = k2['t']
                hug_like = (t == 'I' and k2.get('c') == 'Button') or is_chip(k2)
                if L == 'V':
                    k2['ws'] = 'HUG' if hug_like else ('FILL' if abs(k2['w'] - inner) <= 2 or (n.get('stretch') and t != 'T') else ('HUG' if t == 'T' and single_line(k2) and n.get('ca') == 'CENTER' else 'FIXED'))
                elif L == 'H':
                    gi = kids.index(k) if k in kids else 0
                    grow = n.get('grow', [])
                    if t == 'T': k2['ws'] = 'HUG' if single_line(k2) else 'FIXED'
                    elif hug_like: k2['ws'] = 'HUG'
                    else: k2['ws'] = 'FIXED'
                    if grow and gi < len(grow) and grow[gi] > 0 and not hug_like: k2['ws'] = 'FILL'
                elif L == 'G':
                    gc = k.get('gc', [0, 0, 1]); tr = n['gcols']; cw = sum(tr[gc[1]:gc[1] + gc[2]]) + n.get('cg', 0) * (gc[2] - 1)
                    k2['gc'] = gc
                    k2['ws'] = 'HUG' if hug_like else ('FILL' if abs(k2['w'] - cw) <= 3 else ('HUG' if t == 'T' and single_line(k2) else 'FIXED'))
                else:
                    k2['ws'] = 'FIXED'
                if t in ('F', 'T'): k2['hs'] = 'HUG'
                if t == 'F' and (k2.get('card') or (not k2.get('ch') and k2.get('fills'))): k2['hs'] = 'FIXED'
                if t in ('R',) or (t == 'I' and k2.get('c') == 'Image'): k2['hs'] = 'FIXED'
                if t == 'I' and k2.get('c') == 'Button': k2['hs'] = 'HUG'
                if L == 'H' and n.get('stretch') and t == 'F': k2['hs'] = 'FILL'
            newk.append(k2)
        n['ch'] = newk
        # absorb single non-visual container child (e.g. .wrap, grid cell holding one stack)
        flow2 = [k for k in n['ch'] if not k.get('abs')]
        if len(flow2) == 1 and len(n['ch']) == 1 and flow2[0]['t'] == 'F' and not VIS(flow2[0]) and flow2[0].get('l') in ('V', 'H', 'G') and not flow2[0].get('abs'):
            c = flow2[0]
            pad = [c['y'] - n['y'] + c['pad'][0], n['x'] + n['w'] - c['x'] - c['w'] + c['pad'][1], n['y'] + n['h'] - c['y'] - c['h'] + c['pad'][2], c['x'] - n['x'] + c['pad'][3]]
            for key in ('l', 'gap', 'pa', 'ca', 'wrap', 'cgap', 'gcols', 'cg', 'rg', 'grows', 'stretch', 'grow'):
                if key in c: n[key] = c[key]
                else: n.pop(key, None)
            if n.get('sec') and n.get('minh') and 'hero' in n.get('el', ''): n['pa'] = 'MAX'
            n['pad'] = [round(max(0, v), 1) for v in pad]; n['ch'] = c['ch']
            if n.get('n') in ('Frame', 'Column', 'Stack') and c.get('n') not in ('Container', 'wrap', 'Frame'): n['n'] = c['n']
        n['n'] = nice_name(n, plt)
        if n['n'] == 'Container': n['n'] = 'Stack'
        for k in ('el', 'block', 'grow', 'contents'): n.pop(k, None)
        return n
    if n['t'] == 'T':
        n['n'] = n.get('n') or 'Text'
        n.pop('el', None); return n
    n.pop('el', None)
    return n
def page_payload(key, title, ext):
    sm = [gstyle(s) for s in ext['styles']]; cm = [gcol(c) for c in ext['colors']]
    secs = []
    for s in ext['tree']:
        remap(s, sm, cm)
        s2 = norm(s, None, None)
        s2['ws'] = 'FIXED'; s2['hs'] = 'HUG'
        if s2.get('minh') and s2['h'] <= s2['minh'] + 2: s2['hs'] = 'FIXED'; s2['pa'] = 'MAX' if s2.get('l') == 'V' else s2.get('pa')
        lab = s.get('label')
        s2['n'] = lab if lab else ('Image band' if not s2.get('ch') or (len(s2['ch']) == 1 and s2['ch'][0].get('c') == 'Image') else s2['n'])
        secs.append(s2)
    return {'key': key, 'title': title, 'lang': LANG, 'secs': secs}
TITLES = {'home': '01 Home', 'about': '02 About', 'services': '03 Solutions (Services)', 'turnkey': '03.1 CI Turnkey', 'core': '03.2 CI Core', 'curated': '03.3 CI Curated', 'wellness': '03.4 CI Wellness', 'portfolio': '04 Portfolio', 'project': '04.1 Project page', 'brokers': '05 Broker Program', 'partnerships': '06 Partnerships', 'news': '07 News', 'article': '07.1 Article', 'contact': '08 Contact'}
out = {}
for k, ext in D.items():
    if k.startswith('_'): continue
    out[k] = page_payload(k, TITLES.get(k, k), ext)
for k in ('_header', '_footer', '_menu', '_menu_svc'):
    ext = D[k]; sm = [gstyle(s) for s in ext['styles']]; cm = [gcol(c) for c in ext['colors']]
    t = ext['tree'][0]; remap(t, sm, cm); t2 = norm(t, None, None); t2['ws'] = 'FIXED'; t2['hs'] = 'FIXED' if k.startswith('_menu') or k == '_header' else 'HUG'
    out[k] = {'key': k, 'title': {'_header': 'Header', '_footer': 'Footer', '_menu': 'Menu (open)', '_menu_svc': 'Menu (open, services)'}[k], 'lang': LANG, 'secs': [t2]}
# style names (by size / weight / case — a designer's ramp, not CSS classes)
def cat(s):
    sz, b, up = s['s'], s['w'] >= 700, s['tc'] == 'U'
    if sz >= 100: return 'Display', 'Wordmark' + (' Bold' if b else '')
    if up and b: return 'Heading', ('H1' if sz >= 55 else 'H2' if sz >= 30 else 'H3' if sz >= 17 else 'H4')
    if up and not b: return ('Display', 'Wordmark') if sz >= 100 else (('Title', 'Title') if sz >= 15 else ('Label', 'Label'))
    if sz >= 40: return 'Display', 'Stat' + (' Bold' if b else '')
    if sz >= 20: return 'Lead', 'Lead' + (' Bold' if b else '')
    if sz >= 15.5: return 'Lead', 'Lead S' + (' Bold' if b else '')
    return 'Body', 'Body' + (' Bold' if b else '')
names = {}
for s in GS:
    g, r = cat(s)
    nm = f"{g}/{r} · {round(s['s'], 1):g}"
    if nm in names: names[nm] += 1; nm = f"{nm} / lh {round(s['lh']):g}"
    else: names[nm] = 1
    s['name'] = nm
    s.pop('roles', None)
json.dump({'styles': GS, 'colors': GC}, open(f'{OUTDIR}/tables.json', 'w'))
for k, v in out.items(): json.dump(v, open(f'{OUTDIR}/{k}.json', 'w'))
print(len(GS), 'styles', len(GC), 'colors')
for k, v in out.items(): print(k, len(json.dumps(v)))
