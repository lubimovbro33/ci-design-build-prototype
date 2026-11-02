"""Photo → ink line art (dark): L0 smoothing flattens texture, Canny finds region contours, contours are traced, smoothed and
redrawn as anti-aliased strokes (2× supersampled); flat fills from the smoothed tone, compressed into a dark range.
usage: lineart.py SRC OUT WIDTH [canny_lo canny_hi l0_lambda]"""
import cv2, numpy as np, sys, time
src, out, W = sys.argv[1], sys.argv[2], int(sys.argv[3])
lo, hi, lam = (float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else (18, 46, .012)
clahe = len(sys.argv) > 7 and sys.argv[7] == 'clahe'
minlen = int(sys.argv[8]) if len(sys.argv) > 8 else 22
thick = float(sys.argv[9]) if len(sys.argv) > 9 else 1.15
im = cv2.imread(src, cv2.IMREAD_UNCHANGED); alpha = im[:, :, 3] if im.ndim == 3 and im.shape[2] == 4 else None
im = im[:, :, :3]; h, w = im.shape[:2]; H = int(round(h * W / w))
sm = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
if clahe:
    lab = cv2.cvtColor(sm, cv2.COLOR_BGR2LAB); lab[:, :, 0] = cv2.createCLAHE(2.5, (8, 8)).apply(lab[:, :, 0]); sm = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
L0 = cv2.ximgproc.l0Smooth(sm, None, lam, 2.0)
g = cv2.cvtColor(L0, cv2.COLOR_BGR2GRAY)
e = cv2.Canny(g, lo, hi, L2gradient=True)
cs, _ = cv2.findContours(e, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
SS = 2; canvas = np.zeros((H * SS, W * SS), np.uint8)
k = 5
for c in cs:
    if len(c) < minlen: continue
    p = c[:, 0, :].astype(np.float32)
    if len(p) > k:                                            # moving-average smoothing along the stroke
        pad = np.concatenate([p[:1].repeat(k // 2, 0), p, p[-1:].repeat(k // 2, 0)])
        p = np.stack([np.convolve(pad[:, i], np.ones(k) / k, mode='valid') for i in range(2)], 1)
    pts = np.round(p * SS * 16).astype(np.int32).reshape(-1, 1, 2)
    cv2.polylines(canvas, [pts], False, 255, thickness=max(1, int(round(thick * SS))), lineType=cv2.LINE_AA, shift=4)
ln = cv2.resize(canvas, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
ln = np.clip(ln * 1.35, 0, 1)
tone = g.astype(np.float32) / 255.
q = np.round(tone * 5) / 5
fill = 15 + q * 30                                             # flat dark fills: #0f … #2d
res = fill + (238 - fill) * ln
res = np.clip(res, 0, 255).astype(np.uint8)
res = cv2.cvtColor(res, cv2.COLOR_GRAY2BGR)
if alpha is not None:
    a = cv2.resize(alpha, (W, H), interpolation=cv2.INTER_AREA)
    res = np.dstack([res, a])
cv2.imwrite(out, res)
print('ok', out, res.shape)
