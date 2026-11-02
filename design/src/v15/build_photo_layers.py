"""Hero photos → 2.5D layers like room 1450_34 (src/v15/room_depth.py), but the depth comes from Depth Anything V2 (vitB,
flip-averaged, guided-filter upsampled to the photo). Per photo:
  near layer = things that stand out from their local background (disparity − 25th-percentile of a ~15 %-wide window > .14):
               lamps, chandeliers, branches, dogs, tables… cleaned, holes filled, crumbs dropped, edges feathered;
  background = the photo with the near layer painted out (Telea), depth with the near layer replaced by the local background.
Out (assets/hero/): NAME_dep.png (R = background depth, G = near depth, B = near alpha; D = 1 + v/255·5.5 m),
                    NAME_bg_2560.jpg / NAME_bg_1600.jpg."""
import numpy as np, cv2, sys
from scipy import ndimage
H = '/home/claude/ci-design-build-prototype/design/assets/hero/'
names = ['h1_city', 'h2_kitchen', 'h3_fireplace', 'h4_skyline', 'h5_double']
BOXES = {
  'h1_city':      [(.04, .48, .24, 1.), (.58, .58, .71, .78), (.40, .76, .73, 1.), (.80, .64, .89, .86)],   # lamp + side table, dogs, coffee table, fruit table
  'h2_kitchen':   [(.34, 0., .81, .32), (.40, .32, .86, .73), (.43, .62, .57, .76), (.60, .82, .85, 1.)],   # chandelier, branches + vase, bowls, front chair
  'h3_fireplace': [(.39, .49, .63, 1.)],                                                                    # lamp + side table
  'h4_skyline':   [(.15, .47, .29, .78), (.42, .86, .58, 1.), (.64, .72, .95, .96), (.08, .79, .43, 1.)],  # lamp, little table, coffee table + plant, armchair
  'h5_double':    [(.32, 0., .65, .38), (.13, .76, .86, 1.), (.78, .80, .93, 1.), (.65, .62, .93, .87)],    # chandelier, front sofa, side table, red armchairs
}
ZN, ZF = 2.1, 5.6
def to_z(v): return 1. / (v * (1. / ZN - 1. / ZF) + 1. / ZF)
enc = lambda z: (np.clip((z - 1.) / 5.5, 0, 1) * 255 + .5).astype(np.uint8)
for n in names:
    im = cv2.imread(H + n + '_1600.jpg'); h, w = im.shape[:2]
    d = np.load(n + '_disp.npy'); d = cv2.resize(d, (w, h), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99.5); v = np.clip((d - lo) / (hi - lo), 0, 1).astype(np.float32)
    v = np.clip(cv2.ximgproc.guidedFilter(im, v, 8, 1e-4), 0, 1)
    sw = 400; sh = int(h * sw / w); vs = cv2.resize(v, (sw, sh), interpolation=cv2.INTER_AREA)
    bgv = ndimage.percentile_filter(vs, 25, size=61, mode='nearest'); bgv = cv2.GaussianBlur(bgv, (0, 0), 6)
    bgv = cv2.resize(bgv, (w, h), interpolation=cv2.INTER_CUBIC)
    # near things, picked by hand (boxes in image fractions); inside each box the depth itself splits object / behind (Otsu)
    near = np.zeros((h, w), bool)
    for (x0, y0, x1, y1) in BOXES[n]:
        X0, Y0, X1, Y1 = int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)
        sub = v[Y0:Y1, X0:X1]
        t, _ = cv2.threshold((sub * 255).astype(np.uint8), 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        m = sub > t / 255.
        m = ndimage.binary_opening(m, iterations=2); m = ndimage.binary_fill_holes(m)
        lab, k = ndimage.label(m)
        if k:
            sizes = ndimage.sum(m, lab, range(1, k + 1)); m = np.isin(lab, 1 + np.where(sizes >= .15 * sizes.max())[0])
        near[Y0:Y1, X0:X1] |= m
    near = ndimage.binary_closing(near, iterations=2)
    near = ndimage.binary_dilation(near, iterations=1)
    alpha = cv2.GaussianBlur(near.astype(np.float32), (0, 0), 1.2)               # clean, slightly soft cut-out edge
    # depths
    vb = np.where(near, np.minimum(bgv, v), v)                                   # behind the near things: the local background
    vb = cv2.medianBlur((np.clip(vb, 0, 1) * 255).astype(np.uint8), 21).astype(np.float32) / 255.   # no noise along straight edges
    vb = np.clip(cv2.GaussianBlur(vb, (0, 0), 38), 0, 1)                        # background = large-scale geometry only
    lab, k = ndimage.label(near)                                                 # each object moves (almost) as one piece
    vr = v.copy()
    for i in range(1, k + 1):
        c = lab == i; vr[c] = .75 * np.median(v[c]) + .25 * v[c]
    vn = np.where(near, vr, np.nan)
    idx = ndimage.distance_transform_edt(np.isnan(vn), return_distances=False, return_indices=True)
    vn = vn[idx[0], idx[1]]; vn = np.clip(cv2.GaussianBlur(vn.astype(np.float32), (0, 0), 3), 0, 1)
    out = np.dstack([enc(to_z(vb)), enc(to_z(vn)), (alpha * 255 + .5).astype(np.uint8)])
    out = cv2.resize(out, (1200, int(1200 * h / w)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(H + n + '_dep.png', out[:, :, ::-1], [cv2.IMWRITE_PNG_COMPRESSION, 9])
    # background photo with the near layer painted out (only a band near its edges ever shows)
    for size in ['2560', '1600']:
        big = cv2.imread(H + n + '_' + size + '.jpg'); bh, bw = big.shape[:2]
        hole = cv2.resize(ndimage.binary_dilation(near, iterations=5).astype(np.uint8) * 255, (bw, bh), interpolation=cv2.INTER_NEAREST)
        bg = cv2.inpaint(big, hole, 7, cv2.INPAINT_TELEA)
        cv2.imwrite(H + n + '_bg_' + size + '.jpg', bg, [cv2.IMWRITE_JPEG_QUALITY, 84, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    vis = im.copy(); e = near ^ ndimage.binary_erosion(near, iterations=2); vis[e] = (255, 0, 255)
    cv2.imwrite('/tmp/cut_' + n + '.jpg', cv2.resize(vis, (800, int(800 * h / w))), [cv2.IMWRITE_JPEG_QUALITY, 82])
    print(n, 'near %.3f' % near.mean(), 'z bg %.2f..%.2f' % (to_z(vb).min(), to_z(vb).max()))
