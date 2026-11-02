"""Ink/pencil line art, dark version (user 19:53–19:55: cleaner, but a touch of pencil, thinner lines).
Contours of the L0-flattened image (Canny → traced → smoothed) are drawn as thin strokes at 3× supersampling; every stroke is
drawn twice — a main line and a fainter, slightly jittered second pass — then broken up by paper grain. Fills: the flattened
tone, quantised and pressed into a dark range. Optional: window rectangles (facade map) drawn the same pencil way.
usage: pencil.py SRC OUT WIDTH lo hi lambda minlen [--facade]"""
import cv2, numpy as np, sys
from scipy import ndimage
src, out, W = sys.argv[1], sys.argv[2], int(sys.argv[3])
lo, hi, lam, minlen = float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6]), int(sys.argv[7])
facade = '--facade' in sys.argv
rng = np.random.default_rng(7)
im = cv2.imread(src, cv2.IMREAD_UNCHANGED); alpha = im[:, :, 3] if im.ndim == 3 and im.shape[2] == 4 else None
im = im[:, :, :3]; h, w = im.shape[:2]; H = int(round(h * W / w))
sm = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
L0 = cv2.ximgproc.l0Smooth(sm, None, lam, 2.0)
g = cv2.cvtColor(L0, cv2.COLOR_BGR2GRAY)
SS = 3; cv = np.zeros((H * SS, W * SS), np.float32)
def stroke(pts, val, jit=.55):
    P = (pts * SS * 16).astype(np.int32).reshape(-1, 1, 2)
    layer = np.zeros_like(cv); cv2.polylines(layer, [P], False, val, thickness=1, lineType=cv2.LINE_AA, shift=4)
    q = pts + rng.normal(0, jit, (1, 2)) + rng.normal(0, .18, pts.shape)        # the second, looser pass
    Q = (q * SS * 16).astype(np.int32).reshape(-1, 1, 2)
    cv2.polylines(layer, [Q], False, val * .45, thickness=1, lineType=cv2.LINE_AA, shift=4)
    np.maximum(cv, layer, out=cv)
e = cv2.Canny(g, lo, hi, L2gradient=True)
if facade:                                                        # pane edges come from the measured map, not from Canny
    G = '/home/claude/ci-design-build-prototype/design/assets/v15/gl/'
    r = cv2.imread(G + 'facade_win.png')[:, :, 2]
    pane = cv2.resize((r > 0).astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST)
    e[ndimage.binary_dilation(pane > 0, iterations=7)] = 0
cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
k = 5
for c in cs:
    if len(c) < minlen: continue
    p = c[:, 0, :].astype(np.float32)
    pad = np.concatenate([p[:1].repeat(k // 2, 0), p, p[-1:].repeat(k // 2, 0)])
    p = np.stack([np.convolve(pad[:, i], np.ones(k) / k, mode='valid') for i in range(2)], 1)
    stroke(p, .62 if facade else 1.)
if facade:
    lab, n = ndimage.label(r > 0); kx = W / r.shape[1]
    for sl in ndimage.find_objects(lab):
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if (x1 - x0) < 6 or (y1 - y0) < 12: continue
        X0, Y0, X1, Y1 = [v * kx for v in (x0 - .5, y0 - .5, x1 - .5, y1 - .5)]
        ov = 2.2                                                  # pencil overshoot at the corners
        for (a, b) in [((X0 - ov, Y0), (X1 + ov, Y0)), ((X1, Y0 - ov), (X1, Y1 + ov)), ((X1 + ov, Y1), (X0 - ov, Y1)), ((X0, Y1 + ov), (X0, Y0 - ov))]:
            stroke(np.array([a, b], np.float32), 1.)
        ins = 2.6 * kx
        rect = np.array([(X0 + ins, Y0 + ins), (X1 - ins, Y0 + ins), (X1 - ins, Y1 - ins), (X0 + ins, Y1 - ins), (X0 + ins, Y0 + ins)], np.float32)
        stroke(rect, .45, .3)
ln = cv2.resize(cv, (W, H), interpolation=cv2.INTER_AREA)
ln = np.clip(ln * 3.1, 0, 1)                                      # thin, but present
grain = cv2.GaussianBlur(rng.random((H, W)).astype(np.float32), (0, 0), .8)
grain = (grain - grain.mean()) / (grain.std() + 1e-6)
ln = np.clip(ln * (.82 + .16 * grain), 0, 1)                      # pencil breaks up on the paper
tone = g.astype(np.float32) / 255.
fill = 16 + np.round(tone * 5) / 5 * 16 + grain * 1.6             # dark fills with a little tooth
res = fill + (230 - fill) * ln
res = np.clip(res, 0, 255).astype(np.uint8)
res = cv2.cvtColor(res, cv2.COLOR_GRAY2BGR)
if alpha is not None:
    res = np.dstack([res, cv2.resize(alpha, (W, H), interpolation=cv2.INTER_AREA)])
cv2.imwrite(out, res, [cv2.IMWRITE_JPEG_QUALITY, 82] if out.endswith('.jpg') else [cv2.IMWRITE_WEBP_QUALITY, 90])
print('ok', out, res.shape)
