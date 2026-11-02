"""The facade as an architectural ink drawing: every window pane from the measured window map (facade_win.png) is redrawn as a
crisp rectangle with an inner line (frame + glass), on top of the contour line art of the facade (lineart.py, sparse settings)
for pilasters, cornices and stone breaks. Dark version: ivory lines on #111 fills. Keeps the facade's alpha (window bay cut)."""
import cv2, numpy as np, subprocess
from scipy import ndimage
G = '/home/claude/ci-design-build-prototype/design/assets/v15/gl/'
OUT_W = 2600
subprocess.run(['python3', 'lineart.py', G + 'facade_2x.webp', '/tmp/fac_base.png', str(OUT_W), '10', '30', '.024', 'no', '46', '1.35'], check=True)
base = cv2.imread('/tmp/fac_base.png', cv2.IMREAD_UNCHANGED); H, W = base.shape[:2]
win = cv2.imread(G + 'facade_win.png')[:, :, ::-1]; r = win[:, :, 0]
k = W / r.shape[1]
SS = 2; cv = np.zeros((H * SS, W * SS), np.uint8)
lab, n = ndimage.label(r > 0)
for sl in ndimage.find_objects(lab):
    y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
    if (x1 - x0) < 6 or (y1 - y0) < 12: continue
    X0, Y0, X1, Y1 = [int(round(v * k * SS * 16)) for v in (x0 - .5, y0 - .5, x1 - .5, y1 - .5)]
    cv2.rectangle(cv, (X0, Y0), (X1, Y1), 255, thickness=int(1.5 * SS), lineType=cv2.LINE_AA, shift=4)
    ins = int(round(2.6 * k * SS * 16))
    cv2.rectangle(cv, (X0 + ins, Y0 + ins), (X1 - ins, Y1 - ins), 150, thickness=int(1 * SS), lineType=cv2.LINE_AA, shift=4)
vec = cv2.resize(cv, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
vec = np.clip(vec * 1.3, 0, 1)
g = base[:, :, 0].astype(np.float32)
fill = 17.
lines_base = np.clip((g - 15) / (238 - 15), 0, 1) * (g > 50)
ln = np.maximum(vec, lines_base * .75)
res = fill + (236 - fill) * ln
# panes a touch darker than the stone
pane = cv2.resize((r > 0).astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)
res = res - pane * 6 * (1 - ln)
out = np.dstack([np.clip(res, 0, 255).astype(np.uint8)] * 3 + [base[:, :, 3]])
cv2.imwrite(G + 'facade_sk.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 90])
cv2.imwrite('/tmp/facade_sk_prev.jpg', cv2.resize(out[:, :, :3], (1300, int(1300 * H / W))))
print('ok', out.shape)
