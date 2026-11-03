"""Trace a photo's architecture as a few clean straight lines (v8 · chapter 05 'the drawing lies exactly on the built room').

L0 smoothing flattens textures, the fast line detector finds straight edges; only long ones stay, near-axis ones are snapped,
collinear neighbours merge, the strongest N are kept. Output: JSON {w, h, lines:[[x1,y1,x2,y2,strength],...]} in image px,
plus a preview PNG (white lines on black and over the darkened photo).
usage: trace_lines.py in.jpg out.json [N=110] [minlen_frac=.06]
"""
import sys, json, math
import cv2, numpy as np

src, dst = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 110
MINF = float(sys.argv[4]) if len(sys.argv) > 4 else .06
img = cv2.imread(src); h0, w0 = img.shape[:2]
S = 1400 / max(h0, w0); img = cv2.resize(img, (round(w0 * S), round(h0 * S)), interpolation=cv2.INTER_AREA)
h, w = img.shape[:2]
L0 = cv2.ximgproc.l0Smooth(img, None, .012, 2.0)
gray = cv2.cvtColor(L0, cv2.COLOR_BGR2GRAY)
fld = cv2.ximgproc.createFastLineDetector(length_threshold=int(MINF * max(w, h)), distance_threshold=1.41, canny_th1=12, canny_th2=36, canny_aperture_size=3, do_merge=True)
segs = fld.detect(gray)
segs = [] if segs is None else segs.reshape(-1, 4).tolist()
# contrast across each line = how strong an edge it is
def strength(x1, y1, x2, y2):
    L = math.hypot(x2 - x1, y2 - y1); nx, ny = -(y2 - y1) / L, (x2 - x1) / L; acc = 0; n = 0
    for t in np.linspace(.1, .9, 9):
        px, py = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
        a = gray[int(np.clip(py + ny * 3, 0, h - 1)), int(np.clip(px + nx * 3, 0, w - 1))]
        b = gray[int(np.clip(py - ny * 3, 0, h - 1)), int(np.clip(px - nx * 3, 0, w - 1))]
        acc += abs(int(a) - int(b)); n += 1
    return acc / n
out = []
for x1, y1, x2, y2 in segs:
    L = math.hypot(x2 - x1, y2 - y1); ang = math.degrees(math.atan2(y2 - y1, x2 - x1)) % 180
    if ang < 2.5 or ang > 177.5: ym = (y1 + y2) / 2; y1 = y2 = ym                      # snap near-horizontal
    elif abs(ang - 90) < 2.5: xm = (x1 + x2) / 2; x1 = x2 = xm                           # snap near-vertical
    out.append([x1, y1, x2, y2, L * (8 + strength(x1, y1, x2, y2))])
out.sort(key=lambda r: -r[4])
keep = []
for r in out:                                                                              # drop near-duplicates
    x1, y1, x2, y2 = r[:4]; mx, my = (x1 + x2) / 2, (y1 + y2) / 2; a = math.atan2(y2 - y1, x2 - x1)
    dup = False
    for k in keep:
        kx1, ky1, kx2, ky2 = k[:4]; ka = math.atan2(ky2 - ky1, kx2 - kx1)
        da = abs(math.sin(a - ka)); kL = math.hypot(kx2 - kx1, ky2 - ky1)
        d = abs((kx2 - kx1) * (ky1 - my) - (kx1 - mx) * (ky2 - ky1)) / max(kL, 1e-6)
        t = ((mx - kx1) * (kx2 - kx1) + (my - ky1) * (ky2 - ky1)) / max(kL * kL, 1e-6)
        if da < .05 and d < 6 and -.1 < t < 1.1: dup = True; break
    if not dup: keep.append(r)
    if len(keep) >= N: break
mx = max(k[4] for k in keep) if keep else 1
res = {'w': w, 'h': h, 'lines': [[round(k[0], 1), round(k[1], 1), round(k[2], 1), round(k[3], 1), round(k[4] / mx, 3)] for k in keep]}
json.dump(res, open(dst, 'w'))
pv = np.zeros((h, w * 2, 3), np.uint8); dark = (img * .35).astype(np.uint8); pv[:, w:] = dark
for x1, y1, x2, y2, s in res['lines']:
    c = int(110 + 145 * s)
    for off in (0, w): cv2.line(pv, (int(x1) + off, int(y1)), (int(x2) + off, int(y2)), (c, c, c), 1, cv2.LINE_AA)
cv2.imwrite(dst.replace('.json', '_pv.jpg'), cv2.resize(pv, (pv.shape[1] // 2, pv.shape[0] // 2), interpolation=cv2.INTER_AREA))
print(dst, len(res['lines']))
