"""CI Turnkey's cover — the room as a drawing of itself, drafted clean (17.11.2026 19:48).
«Скетч я хочу, щоб ти трохи почистив. Там якісь трошки брудні моменти є, зроби його професійнішим.»

The first drawing was a Sobel of the photograph (tools/site/lines.py): every edge at the strength of its contrast — fat where the window
meets the sky, a rash of specks where a fabric has a weave, two lines for one. A drawing made by a hand has ONE pen. So here the room's
lines are taken from the photograph as STROKES, and the picture is drawn again from them:

  1  the photograph is evened out (CLAHE lifts what stands in the dark) and its textures are flattened (mean shift): the weave of the
     curtains, the nap of the cushions and the grain of the wall are not lines;
  2  its edges are found once, one pixel wide (Canny), and traced into strokes from end to end and from joint to joint;
  3  what is built is ruled — a stroke that is straight within a pixel and a half becomes a straight line between its corners; what is
     soft keeps its curve, smoothed along itself; specks and stubs go;
  4  the curtains keep only their long folds, the city only its outlines;
  5  everything is drawn with one pen, in two weights of ink: the room's structure, and the detail inside it.

Nothing is invented: every stroke lies on an edge of the photograph, so the home arrives exactly inside its own drawing.

The second file is the ORDER in which the drawing draws itself (`-g.png`): the line of the cover stands down the middle of the screen, and
the room grows out of it — each stroke starts where the ink reaches it and runs along itself, so the drawing branches out of the line
instead of being uncovered. It is the travel time from the middle column along the strokes (cheap on ink, dear across the paper).

Run: python3 tools/site/sketch.py   (writes design/assets/ln/<name>.webp and design/assets/ln/<name>-g.png)"""
import os, sys
import numpy as np
import cv2
from PIL import Image
from skimage.morphology import skeletonize
from skimage.graph import MCP_Geometric
from scipy import ndimage as ndi

SRC = 'design/assets/ph'; OUT = 'design/assets/ln'
WANT = {
    'ch/1450-32': dict(
        w=1280, out=2560,
        folds=[(.300, .035, .440, .80), (.736, .035, .875, .82)],     # the curtains: x0, y0, x1, y1 of the photograph
        city=(.450, .275, .729, .742),                                 # what stands beyond the glass
        fold_pass=dict(blur=2.8, lo=7, hi=18),
        city_pass=dict(blur=1.5, lo=12, hi=30, speck=30),
        quiet=[(.0, .0, .305, .57, 150)],                              # the padded wall and the wall by the lamp: x0, y0, x1, y1, the least length
        ruled_only=[(.42, .0, .77, .083, 9999)],                       # the pocket over the window, lost in the dark: no line at all
    ),
}

def edges(bgr, o):
    """one-pixel edges of the photograph with its textures flattened"""
    L = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)[:, :, 0].astype(np.float32) / 255.
    L = L ** o.get('gam', .6)                                     # what stands in the dark is lifted evenly: no local gain, so no grain
    g = (L * 255).astype(np.uint8)
    for _ in range(o.get('bil', 2)): g = cv2.bilateralFilter(g, 0, o.get('bs', 22), o.get('bd', 4))
    g = cv2.GaussianBlur(g, (0, 0), o.get('blur', 2.0))           # a weave, a nap, a grain are finer than this; an edge of the room is not
    e = cv2.Canny(g, o.get('lo', 9), o.get('hi', 24), L2gradient=True) > 0
    return e, g

def graph(sk):
    """the skeleton as strokes: lists of (x, y) from an end or a joint to the next"""
    H, W = sk.shape
    ys, xs = np.nonzero(sk); n = len(ys)
    idx = -np.ones((H + 2, W + 2), np.int64); idx[ys + 1, xs + 1] = np.arange(n)
    O = [(-1, 0), (1, 0), (0, -1), (0, 1)]; D = [(-1, -1), (-1, 1), (1, -1), (1, 1)]
    nb = [[] for _ in range(n)]
    for k in range(n):
        y, x = ys[k] + 1, xs[k] + 1
        orth = [(dy, dx) for dy, dx in O if idx[y + dy, x + dx] >= 0]
        for dy, dx in orth: nb[k].append(int(idx[y + dy, x + dx]))
        for dy, dx in D:
            j = idx[y + dy, x + dx]
            if j < 0: continue
            if (dy, 0) in orth or (0, dx) in orth: continue      # a diagonal that an orthogonal step already makes is not a branch
            nb[k].append(int(j))
    deg = np.array([len(a) for a in nb])
    node = deg != 2
    used = set(); strokes = []
    def walk(a, b):
        path = [a, b]; used.add((min(a, b), max(a, b)))
        while not node[b]:
            c = [j for j in nb[b] if j != path[-2]]
            if not c: break
            c = c[0]; e = (min(b, c), max(b, c))
            if e in used: break
            used.add(e); path.append(c); b = c
        return path
    for a in np.nonzero(node)[0]:
        for b in nb[a]:
            if (min(a, b), max(a, b)) not in used: strokes.append(walk(int(a), b))
    for a in range(n):                                            # rings without a joint
        if node[a]: continue
        for b in nb[a]:
            if (min(a, b), max(a, b)) not in used:
                node[a] = True; strokes.append(walk(a, b)); node[a] = False
    return [np.stack([xs[p], ys[p]], 1).astype(np.float64) for p in strokes], deg

def length(p): return float(np.hypot(*np.diff(p, axis=0).T).sum()) if len(p) > 1 else 0.

def soften(p, s, pin=True):
    """a stroke smoothed along itself, its ends where they were (pin) or left free"""
    if len(p) < 5: return p
    q = np.stack([ndi.gaussian_filter1d(p[:, 0], s, mode='nearest'), ndi.gaussian_filter1d(p[:, 1], s, mode='nearest')], 1)
    if not pin: return q
    k = min(len(p) // 2, int(3 * s))
    for i in range(k):                                            # ease back to the true ends, so joints stay joined
        t = i / max(1, k); q[i] = p[i] * (1 - t) + q[i] * t; q[-1 - i] = p[-1 - i] * (1 - t) + q[-1 - i] * t
    return q

def rdp(p, eps):
    if len(p) < 3: return p
    a, b = p[0], p[-1]; d = b - a; L = np.hypot(*d)
    dist = np.hypot(*(p - a).T) if L < 1e-9 else np.abs(d[0] * (p[:, 1] - a[1]) - d[1] * (p[:, 0] - a[0])) / L
    i = int(dist.argmax())
    if dist[i] <= eps: return np.stack([a, b])
    return np.concatenate([rdp(p[:i + 1], eps)[:-1], rdp(p[i:], eps)])

def square(r, short=9., long=22.):
    """a ruled stroke's corners: the edge finder rounds a corner into a chamfer — two long runs joined by a short one; a draughtsman
    draws the corner, so the chamfer is replaced by the point where the two runs meet"""
    r = [np.array(x, float) for x in r]; i = 1
    while i < len(r) - 2:
        a, b, c, d = r[i - 1], r[i], r[i + 1], r[i + 2]
        u, v = b - a, d - c; lu, lv = np.hypot(*u), np.hypot(*v)
        if np.hypot(*(c - b)) < short and lu > long and lv > long:
            cr = u[0] * v[1] - u[1] * v[0]
            if abs(cr) > .5 * lu * lv:                             # the runs really turn (more than thirty degrees)
                t = ((c[0] - a[0]) * v[1] - (c[1] - a[1]) * v[0]) / cr
                r[i:i + 2] = [a + u * t]; continue
        i += 1
    # a hook at an end — a few pixels turning away from a long run — is where the edge finder lost the edge, not a line of the room;
    # and a jog — a short step between two runs that go the same way — is one run
    for _ in range(2):
        if len(r) >= 3 and np.hypot(*(r[1] - r[0])) < short and np.hypot(*(r[2] - r[1])) > long: r = r[1:]
        if len(r) >= 3 and np.hypot(*(r[-1] - r[-2])) < short and np.hypot(*(r[-2] - r[-3])) > long: r = r[:-1]
    i = 1
    while i < len(r) - 2:
        a, b, c, d = r[i - 1], r[i], r[i + 1], r[i + 2]
        u, v = b - a, d - c; lu, lv = np.hypot(*u), np.hypot(*v)
        if np.hypot(*(c - b)) < short and lu > long and lv > long and abs(u[0] * v[1] - u[1] * v[0]) < .14 * lu * lv and u @ v > 0:
            del r[i:i + 2]; continue
        i += 1
    return np.stack(r)

def joined(lines, gap=34., off=2.6, ang=.035):
    """ruled lines that lie on one line and nearly touch are one line: a wall does not stop where the photograph loses it for a moment"""
    L = [np.array(x, float) for x in lines]; again = True
    while again:
        again = False
        for i in range(len(L)):
            for j in range(i + 1, len(L)):
                a, b = L[i], L[j]; u = a[1] - a[0]; lu = np.hypot(*u); v = b[1] - b[0]; lv = np.hypot(*v)
                if lu < 1 or lv < 1: continue
                if abs(u[0] * v[1] - u[1] * v[0]) > ang * lu * lv: continue
                n = np.array([-u[1], u[0]]) / lu
                if max(abs((b[0] - a[0]) @ n), abs((b[1] - a[0]) @ n)) > off: continue
                t = np.array([0., lu, (b[0] - a[0]) @ u / lu, (b[1] - a[0]) @ u / lu])
                if max(t[2:].min() - lu, 0 - t[2:].max()) > gap: continue
                pts = np.stack([a[0], a[1], b[0], b[1]]); k0, k1 = int(t.argmin()), int(t.argmax())
                L[i] = np.stack([pts[k0], pts[k1]]); del L[j]; again = True; break
            if again: break
    return L

def frac(p, r, W, H):
    """how much of a stroke lies in a rectangle of the photograph"""
    return float(((p[:, 0] >= r[0] * W) & (p[:, 0] <= r[2] * W) & (p[:, 1] >= r[1] * H) & (p[:, 1] <= r[3] * H)).mean())

def traced(bgr, o):
    """one pass: the edges at one fineness, as strokes with their length, their free ends and the contrast they stand on"""
    e, g = edges(bgr, o)
    lab, n = ndi.label(e, structure=np.ones((3, 3)))
    size = ndi.sum(e, lab, np.arange(n + 1))
    e = e & (size[lab] >= o.get('speck', 40))                     # specks: an edge of fewer pixels than this is not a line of the room
    sk = skeletonize(e)
    S, deg = graph(sk)
    mag = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3))
    lab, n = ndi.label(sk, structure=np.ones((3, 3))); whole = ndi.sum(sk, lab, np.arange(n + 1))
    out = []
    for p in S:
        free = [deg_at(sk, p[0]), deg_at(sk, p[-1])].count(1)
        out.append((p, length(p), free, float(mag[p[:, 1].astype(int), p[:, 0].astype(int)].mean()), float(whole[lab[int(p[0][1]), int(p[0][0])]])))
    return out, e

def hanging(p, o):
    """a fold of a curtain: only the parts of the stroke that hang — its hooks and its turns are the weave's, not the fold's"""
    q = soften(p, 2.0); d = np.diff(q, axis=0)
    d = np.stack([ndi.uniform_filter1d(d[:, 0], 7, mode='nearest'), ndi.uniform_filter1d(d[:, 1], 7, mode='nearest')], 1)
    ok = np.abs(d[:, 1]) >= 1.7 * np.abs(d[:, 0])
    out = []; i = 0
    while i < len(ok):
        if not ok[i]: i += 1; continue
        j = i
        while j < len(ok) and ok[j]: j += 1
        piece = p[i:j + 1]
        if np.ptp(piece[:, 1]) >= o.get('foldmin', 56): out.append(piece)
        i = j
    return out

def strokes_of(path, o):
    im = Image.open(path).convert('RGB')
    w = o['w']; h = int(round(im.size[1] * w / im.size[0]))
    bgr = cv2.cvtColor(np.asarray(im.resize((w, h), Image.LANCZOS)), cv2.COLOR_RGB2BGR)
    folds = o.get('folds', []); city = o.get('city')
    out = []
    # the room: what is built is ruled, what is soft is drawn
    S, e = traced(bgr, o)
    med = float(np.median([s[3] for s in S])) if S else 0.
    ruled = []
    for p, L, free, st, comp in S:
        if city and frac(p, city, w, h) >= .9: continue
        if any(frac(p, r, w, h) >= .7 for r in folds):
            sp = np.ptp(p, axis=0)
            if sp[1] >= 2.5 * sp[0] or L < o.get('across', 70): continue       # the folds come from their own pass; what crosses a curtain must be long
        if free and L < o.get('stub', 9): continue                # a stub hanging off a joint
        if free == 2 and L < o.get('lone', 34): continue          # a short stroke on its own
        if free == 2 and L < o.get('faint', 64) and st < med: continue          # and a longer one, if nothing much stands behind it
        if any(frac(p, z[:4], w, h) >= .7 and comp < z[4] for z in o.get('quiet', [])): continue   # a plain surface: only what is long, or joined to something long
        ch = p[-1] - p[0]; cl = np.hypot(*ch)
        dev = np.abs(ch[0] * (p[:, 1] - p[0][1]) - ch[1] * (p[:, 0] - p[0][0])).max() / max(cl, 1e-6)
        axis = min(abs(ch[0]), abs(ch[1])) <= .07 * cl          # within four degrees of level or plumb
        if axis and cl >= 48 and dev <= o.get('rule', 3.6):      # a level or a plumb line of the room is ruled, even where the photograph wavers
            ruled.append(np.stack([p[0], p[-1]])); continue
        if any(frac(p, z[:4], w, h) >= .7 for z in o.get('ruled_only', [])): continue    # here only what can be ruled is a line
        r = rdp(p, 1.5)
        if len(r) - 1 <= max(1, L / 55.): out.append((square(r), 1.0 if L >= 60 else .8, 'built'))
        else: out.append((soften(p, 2.6), .92 if L >= 80 else .7, 'soft'))
    for r in joined(ruled):
        if any(frac(r, z[:4], w, h) >= .7 and np.hypot(*(r[1] - r[0])) < z[4] for z in o.get('ruled_only', [])): continue
        out.append((r, 1.0, 'built'))
    # the curtains: at a coarser fineness, and only what hangs; of two folds side by side, the longer
    if folds:
        S, _ = traced(bgr, dict(o, **o.get('fold_pass', {})))
        F = []
        for p, L, free, st, comp in S:
            if not any(frac(p, r, w, h) >= .7 for r in folds): continue
            F += hanging(p, o)
        F.sort(key=lambda q: -np.ptp(q[:, 1])); kept = []
        for q in F:
            x = q[:, 0].mean(); y0, y1 = q[:, 1].min(), q[:, 1].max()
            if any(abs(x - kx) < o.get('foldgap', 7.5) and min(y1, k1) - max(y0, k0) > .4 * (y1 - y0) for kx, k0, k1 in kept): continue
            kept.append((x, y0, y1)); out.append((soften(q, 8.0, pin=False), .5, 'fold'))
    # the city beyond the glass: finer, and ruled — buildings are
    if city:
        S, _ = traced(bgr, dict(o, **o.get('city_pass', {})))
        for p, L, free, st, comp in S:
            if frac(p, city, w, h) < .9 or L < o.get('citymin', 30): continue
            sp = np.ptp(p, axis=0)
            if min(sp) <= 3 and L < 72: continue                  # a dash: one column of windows, one floor
            r = square(rdp(p, 1.4), 7., 12.)
            if L < 70 and len(r) > 5: continue                    # a short stroke that turns and turns is a window's glare, not a building
            out.append((r, .55, 'city'))
    return out, (w, h), e

def deg_at(sk, pt):
    x, y = int(pt[0]), int(pt[1]); H, W = sk.shape
    y0, y1, x0, x1 = max(0, y - 1), min(H, y + 2), max(0, x - 1), min(W, x + 2)
    return int(sk[y0:y1, x0:x1].sum()) - 1

def render(S, size, out_w, pen=2.6, ss=2):
    w, h = size; k = out_w / w * ss; W, H = int(round(w * k)), int(round(h * k))
    hi = np.zeros((H, W), np.float32)
    for wt in sorted(set(s[1] for s in S)):
        layer = np.zeros((H, W), np.uint8)
        for p, a, _ in S:
            if a != wt: continue
            pts = np.round((p + .5) * k * 16).astype(np.int32).reshape(-1, 1, 2)
            cv2.polylines(layer, [pts], False, 255, thickness=max(1, int(round(pen * ss))), lineType=cv2.LINE_AA, shift=4)
        hi = np.maximum(hi, layer.astype(np.float32) / 255. * wt)
    lo = cv2.resize(hi, (out_w, int(round(h * out_w / w))), interpolation=cv2.INTER_AREA)
    return np.clip(lo, 0, 1)

def order(ink, o):
    """when the ink reaches each point: travel time from the middle column, cheap along the strokes and dear across the paper"""
    h, w = ink.shape
    on = cv2.dilate((ink > .25).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    cost = np.where(on, 1.0, o.get('paper', 7.0))
    seeds = [(y, w // 2) for y in range(h)]
    T, _ = MCP_Geometric(cost, fully_connected=True).find_costs(seeds)
    t = T / np.percentile(T[on], 99.6)
    t = np.clip(t, 0, 1) ** o.get('gamma', .8)
    # the paper beside a stroke takes the stroke's own moment, so a line is never drawn late at its edges
    d, (iy, ix) = ndi.distance_transform_edt(~on, return_indices=True)
    t = t[iy, ix]
    return cv2.GaussianBlur(t.astype(np.float32), (0, 0), .8)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n, o in WANT.items():
        p = os.path.join(SRC, n + '.webp')
        if not os.path.exists(p): print('missing', p); continue
        S, size, _ = strokes_of(p, o)
        ink = render(S, size, o['out'])
        name = os.path.join(OUT, n.split('/')[-1])
        Image.fromarray((ink * 255).round().astype('uint8')).save(name + '.webp', quality=90, method=6)
        small = cv2.resize(ink, size, interpolation=cv2.INTER_AREA)
        t = order(small, o)
        Image.fromarray((t * 255).round().astype('uint8')).save(name + '-g.png', optimize=True)
        print(name, len(S), 'strokes', os.path.getsize(name + '.webp') // 1024, 'kB +', os.path.getsize(name + '-g.png') // 1024, 'kB')
