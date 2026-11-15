# line drawing registered to a photograph: LSD segments, the longest ones, per-mille of the picture, left to right.  python3 seg.py photo.webp [n]
import cv2, sys, numpy as np
im = cv2.imread(sys.argv[1]); N = int(sys.argv[2]) if len(sys.argv) > 2 else 240
h0, w0 = im.shape[:2]; sc = 1600 / w0; im = cv2.resize(im, (1600, round(h0 * sc))); h, w = im.shape[:2]
g = cv2.GaussianBlur(cv2.cvtColor(im, cv2.COLOR_BGR2GRAY), (0, 0), 1.2)
L = cv2.createLineSegmentDetector(0).detect(g)[0].reshape(-1, 4)
ln = np.hypot(L[:, 2] - L[:, 0], L[:, 3] - L[:, 1]); L = L[ln > 46]; ln = ln[ln > 46]
L = L[np.argsort(-ln)][:N]
L = L[np.argsort((L[:, 0] + L[:, 2]) / 2)]
out = []
for x1, y1, x2, y2 in L: out += [round(x1 / w * 1000), round(y1 / h * 1000), round(x2 / w * 1000), round(y2 / h * 1000)]
print(','.join(map(str, out))); print('%.4f' % (w0 / h0), len(L), file=sys.stderr)
