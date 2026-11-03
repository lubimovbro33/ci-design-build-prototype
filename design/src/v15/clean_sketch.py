"""Clean line drawing (user 03.11 08:40): straight, neat, uniform lines like the gold window outline; few details; no pencil.
modes:
  facade  — the outer rectangle of every window (panes merged) from the measured window map + the facade's own edges (alpha)
  lines   — straight segments only (Fast Line Detector on an L0-flattened image), snapped when near-vertical/horizontal,
            short ones dropped; for the city, the window unit and the interiors
usage: clean.py MODE SRC OUT WIDTH [min_len] [lambda] [lw]"""
import cv2, numpy as np, sys
from scipy import ndimage
mode, src, out, W = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
minlen = float(sys.argv[5]) if len(sys.argv) > 5 else 60
lam = float(sys.argv[6]) if len(sys.argv) > 6 else .03
lw = float(sys.argv[7]) if len(sys.argv) > 7 else 1.8
im = cv2.imread(src, cv2.IMREAD_UNCHANGED); alpha = im[:, :, 3] if im.ndim == 3 and im.shape[2] == 4 else None
h, w = im.shape[:2]; H = int(round(h * W / w))
SS = 4; cv = np.zeros((H * SS, W * SS), np.uint8)
def seg(p0, p1, val=255, t=lw):
    a = (int(round(p0[0] * SS * 16)), int(round(p0[1] * SS * 16))); b = (int(round(p1[0] * SS * 16)), int(round(p1[1] * SS * 16)))
    cv2.line(cv, a, b, val, thickness=max(1, int(round(t * SS))), lineType=cv2.LINE_AA, shift=4)
if mode == 'facade':
    G = '/home/claude/ci-design-build-prototype/design/assets/v15/gl/'
    r = cv2.imread(G + 'facade_win.png')[:, :, 2] > 0
    k = W / r.shape[1]
    grp = ndimage.binary_closing(r, structure=np.ones((5, 23)))            # panes of one window → one opening
    lab, n = ndimage.label(grp)
    for sl in ndimage.find_objects(lab):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if (x1 - x0) < 8 or (y1 - y0) < 16: continue
        X0, Y0, X1, Y1 = [v * k for v in (x0 - .5, y0 - .5, x1 - .5, y1 - .5)]
        for a, b in [((X0, Y0), (X1, Y0)), ((X1, Y0), (X1, Y1)), ((X1, Y1), (X0, Y1)), ((X0, Y1), (X0, Y0))]: seg(a, b)
    if alpha is not None:                                                    # the facade's own edges (the bay cut, the corner)
        a = cv2.resize(alpha, (W, H), interpolation=cv2.INTER_AREA) > 127
        cs, _ = cv2.findContours(a.astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        for c in cs:
            if cv2.arcLength(c, True) < 200: continue
            p = cv2.approxPolyDP(c, 2.5, True)[:, 0, :].astype(np.float32)
            for i in range(len(p)):
                q0, q1 = p[i], p[(i + 1) % len(p)]
                if q0[0] <= 1 and q1[0] <= 1 or q0[1] <= 1 and q1[1] <= 1 or q0[1] >= H - 2 and q1[1] >= H - 2: continue   # not the texture border
                seg(q0, q1)
elif mode == 'skyline':                                                      # the city as clean tower outlines
    img = cv2.resize(im[:, :, :3], (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
    lum = cv2.GaussianBlur(img @ np.array([.114, .587, .299], np.float32), (0, 0), 1.2)
    lights = lum > .30
    lights = ndimage.binary_opening(lights, iterations=1)
    dens = cv2.boxFilter(lights.astype(np.float32), -1, (9, 41))          # lit facades are dense with lights
    city = dens > .06
    top = np.full(W, H, np.float32)
    for x in range(W):
        ys = np.where(city[:, x])[0]
        if len(ys): top[x] = ys[0]
    top = ndimage.median_filter(top, size=15)
    # rectilinear: piecewise-constant runs
    runs = []; x0 = 0
    for x in range(1, W + 1):
        if x == W or abs(top[x] - np.median(top[x0:x])) > 10:
            runs.append((x0, x, float(np.median(top[x0:x])))); x0 = x
    changed = True                                                          # fewer details: narrow runs merge into a neighbour
    while changed and len(runs) > 2:
        changed = False
        i = min(range(len(runs)), key=lambda j: runs[j][1] - runs[j][0])
        if runs[i][1] - runs[i][0] >= 26: break
        if i == 0: j = 1
        elif i == len(runs) - 1: j = i - 1
        else: j = i - 1 if abs(runs[i - 1][2] - runs[i][2]) <= abs(runs[i + 1][2] - runs[i][2]) else i + 1
        a0 = min(runs[i][0], runs[j][0]); a1 = max(runs[i][1], runs[j][1])
        y = runs[j][2] if (runs[j][1] - runs[j][0]) >= (runs[i][1] - runs[i][0]) else runs[i][2]
        lo_, hi_ = min(i, j), max(i, j); runs[lo_:hi_ + 1] = [(a0, a1, y)]; changed = True
    base = H - 1
    for i, (a0, a1, y) in enumerate(runs):
        if y >= H - 4: continue
        seg((a0, y), (a1, y))
        if i + 1 < len(runs):
            y2 = runs[i + 1][2]
            if abs(y2 - y) > 22:                                             # a tower edge: down from the higher roof
                yt, yb = min(y, y2), max(y, y2)
                ye = min(base, yb + (H - yb) * .45); n_ = 10                   # the edge fades out downwards
                for q in range(n_):
                    ya = yt + (ye - yt) * q / n_; yb2 = yt + (ye - yt) * (q + 1) / n_
                    seg((a1, ya), (a1, yb2), int(170 * (1 - max(0, (ya - yb) / max(1, ye - yb)))) if ya > yb else 170)
    L = runs
elif mode == 'poly':                                                         # region outlines, straightened (city, interiors)
    img = cv2.resize(im[:, :, :3], (W, H), interpolation=cv2.INTER_AREA)
    L0 = cv2.ximgproc.l0Smooth(img, None, lam, 2.0)
    g = cv2.cvtColor(L0, cv2.COLOR_BGR2GRAY)
    e = cv2.Canny(g, 14, 40, L2gradient=True)
    cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    nseg = 0
    for c in cs:
        if cv2.arcLength(c, False) < minlen: continue
        p = cv2.approxPolyDP(c, 2.2, False)[:, 0, :].astype(np.float32)
        for i in range(len(p) - 1):
            x0, y0 = p[i]; x1, y1 = p[i + 1]; dx, dy = x1 - x0, y1 - y0
            if np.hypot(dx, dy) < 14: continue
            if abs(dx) < abs(dy) * .12: x0 = x1 = (x0 + x1) / 2
            elif abs(dy) < abs(dx) * .12: y0 = y1 = (y0 + y1) / 2
            seg((x0, y0), (x1, y1)); nseg += 1
    L = [0] * nseg
else:
    img = cv2.resize(im[:, :, :3], (W, H), interpolation=cv2.INTER_AREA)
    L0 = cv2.ximgproc.l0Smooth(img, None, lam, 2.0)
    g = cv2.cvtColor(L0, cv2.COLOR_BGR2GRAY)
    fld = cv2.ximgproc.createFastLineDetector(length_threshold=int(minlen), distance_threshold=1.5, canny_th1=10, canny_th2=30, canny_aperture_size=3, do_merge=True)
    L = fld.detect(g)
    L = [] if L is None else L.reshape(-1, 4)
    for x0, y0, x1, y1 in L:
        dx, dy = x1 - x0, y1 - y0
        if abs(dx) < abs(dy) * .08: x0 = x1 = (x0 + x1) / 2
        elif abs(dy) < abs(dx) * .08: y0 = y1 = (y0 + y1) / 2
        seg((x0, y0), (x1, y1))
ln = cv2.resize(cv, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
res = 17 + (226 - 17) * np.clip(ln * 1.15, 0, 1)
res = cv2.cvtColor(np.clip(res, 0, 255).astype(np.uint8), cv2.COLOR_GRAY2BGR)
if alpha is not None: res = np.dstack([res, cv2.resize(alpha, (W, H), interpolation=cv2.INTER_AREA)])
cv2.imwrite(out, res, [cv2.IMWRITE_JPEG_QUALITY, 85] if out.endswith('.jpg') else [cv2.IMWRITE_WEBP_QUALITY, 92])
print('ok', out, res.shape, (len(L) if mode != 'facade' else n))
