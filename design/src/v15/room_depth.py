"""Hand-built depth map for room 1450_34 (assets/v15/room_2k.jpg), distance in metres from the camera.
Painted far → near on a 1200x864 grid (= the photo at half size), then near layers dilated a little and blurred
so the displaced mesh stretches on the background side of an edge, not through the object.
Output: assets/v15/gl/room_depth.png 1200x864 RGB: R = room depth without the near furniture, G = near-furniture depth,
B = near-furniture alpha; D = 1.0 + v/255 * 5.5 m. Plus room_bg_{2k,1k}.jpg = the photo with the near furniture painted out."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 864
D = np.full((H, W), 3.5, np.float32)          # the doorway wall
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
K, YH = 1280., 380.                           # floor: D = K / (y - YH)

def poly_mask(pts):
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255); return np.array(m) > 127
def ell_mask(cx, cy, rx, ry):
    return ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2 <= 1
def rect(x0, y0, x1, y1):
    return (xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1)
def floor_d():
    return K / np.maximum(yy - YH, 1.)

# ---- through the doorway (opening 328..800 x 98..725): one smooth far zone — no little steps inside it,
#      because a depth step under a straight line (wine-wall frame, wires, back-room door) bends that line
op = rect(328, 98, 800, 725)
D[op] = 5.4 + (xx[op] - 328) / 472 * .2                                 # cellar + back wall, gently deeper to the right
ceil = rect(328, 98, 800, 150); D[ceil] = np.minimum(D[ceil], 3.8 + (yy[ceil] - 98) / 52 * 1.6)
m = op & (yy >= 560); D[m] = np.minimum(D[m], np.clip(floor_d()[m], 3.7, 5.6))   # floor / rug, meets the far zone smoothly
m = poly_mask([(515, 500), (800, 494), (800, 532), (515, 530)]); D[m] = 4.5   # table top
m = poly_mask([(726, 530), (800, 530), (800, 682), (744, 682), (726, 600)]); D[m] = 4.45   # table base
m = poly_mask([(398, 512), (420, 497), (522, 497), (542, 520), (542, 697), (398, 697)]); D[m] = 3.95   # front-left chair
m = poly_mask([(590, 540), (606, 524), (736, 524), (752, 540), (752, 716), (590, 716)]); D[m] = 3.85   # front-right chair

# ---- the doorway frame and our wall
m = rect(800, 72, 853, 770); D[m] = 3.72 - (xx[m] - 800) / 53 * .22    # right reveal (faces left)
m = rect(305, 62, 330, 730); D[m] = 3.5                                  # left jamb
m = rect(305, 62, 856, 99); D[m] = 3.5                                   # lintel
m = rect(905, 0, 950, 800); D[m] = 3.5 - (xx[m] - 905) / 45 * .4        # pilaster side face
m = rect(950, 0, 1076, 800); D[m] = 3.1                                  # nearer wall
m = rect(1076, 0, 1200, 864); D[m] = 2.85 - (xx[m] - 1076) / 124 * .15  # curtain
m = rect(0, 0, 305, 700); D[m] = 3.45                                    # bar shelving wall
m = rect(78, 522, 306, 700); D[m] = 3.25                                 # bar cabinet + counter

# ---- our floor (below the base line of each wall)
base = np.select([xx < 800, xx < 853, xx < 905, xx < 950, xx < 1076],
                 [725 + 0 * xx, 725 + (xx - 800) / 53 * 40, 745 + 0 * xx, 745 + (xx - 905) / 45 * 30, 792 + 0 * xx], 842)
m = (yy > base) & (xx >= 305); D[m] = np.minimum(D[m], np.clip(floor_d()[m], 2.5, 3.75)) if False else np.clip(floor_d()[m], 2.5, 3.75)

# ---- our floor also runs under the bar cabinet / sofa (it is what shows when the sofa slides)
m = (yy > 700) & (xx < 305); D[m] = np.clip(floor_d()[m], 2.5, 3.75)
Dbg = D.copy()                                                           # the room without the near furniture

# ---- near things → their own layer (sofa, lamp, coffee table), cut out with GrabCut from rough polygons
import cv2
from scipy import ndimage
lamp = poly_mask([(0, 468), (9, 452), (24, 443), (42, 440), (60, 443), (73, 452), (82, 468), (84, 576), (44, 576), (44, 690), (24, 690), (24, 576), (0, 576)])
sofa = poly_mask([(0, 690), (40, 660), (100, 650), (160, 622), (215, 622), (262, 676), (360, 678), (368, 700), (378, 750),
                  (420, 758), (428, 716), (440, 710), (470, 745), (482, 770), (500, 775), (590, 781), (655, 820), (697, 864), (0, 864)])
table = ell_mask(688, 800, 98, 21) | rect(698, 812, 713, 864) | rect(764, 812, 780, 864) | rect(630, 724, 692, 800) | ell_mask(705, 779, 24, 11)
Dn = np.full((H, W), np.nan, np.float32)
Dn[lamp] = 2.7
Dn[sofa] = 1.35 + 1.3 * np.clip(xx[sofa] / 700, 0, 1)                  # the sofa runs away from us, into the room
Dn[table] = 2.4                                                          # coffee table, glass, bowl (in front of the sofa's far end)
poly = lamp | sofa | table
photo = np.array(Image.open('/tmp/room_view.jpg').convert('RGB'))
gc = np.full((H, W), cv2.GC_BGD, np.uint8)
dil = ndimage.binary_dilation(poly, iterations=10); ero = ndimage.binary_erosion(poly, iterations=8)
gc[dil] = cv2.GC_PR_BGD; gc[poly] = cv2.GC_PR_FGD; gc[ero] = cv2.GC_FGD
bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(photo[:, :, ::-1].copy(), gc, None, bgm, fgm, 6, cv2.GC_INIT_WITH_MASK)
near = ((gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD))
near = ndimage.binary_opening(near, iterations=1); near = ndimage.binary_fill_holes(near)
lab, n = ndimage.label(near); sizes = ndimage.sum(near, lab, range(1, n + 1))
near = np.isin(lab, 1 + np.where(sizes > 150)[0])                       # drop crumbs
near |= ero | rect(698, 812, 713, 864) | rect(764, 812, 780, 864) | rect(630, 724, 692, 800)   # never lose the core / table legs / glass
alpha = ndimage.gaussian_filter(near.astype(np.float32), .8)
# near depth everywhere = depth of the nearest near-object pixel (so its mesh does not bend at the cut-out edge)
known = ~np.isnan(Dn)
idx = ndimage.distance_transform_edt(~known, return_distances=False, return_indices=True)
Dn = Dn[idx[0], idx[1]]
Dn = ndimage.gaussian_filter(Dn, 2)
Dbg = ndimage.gaussian_filter(Dbg, 3)

enc = lambda d: (np.clip((d - 1.) / 5.5, 0, 1) * 255 + .5).astype(np.uint8)
out = np.dstack([enc(Dbg), enc(Dn), (alpha * 255 + .5).astype(np.uint8)])
Image.fromarray(out, 'RGB').save('/home/claude/ci-design-build-prototype/design/assets/v15/gl/room_depth.png', optimize=True)

# ---- background photo with the near furniture painted out (only a band near its edges ever shows)
base = '/home/claude/ci-design-build-prototype/design/assets/v15/'
big = cv2.imread(base + 'room_2k.jpg')
hole = cv2.resize(ndimage.binary_dilation(near, iterations=7).astype(np.uint8) * 255, (big.shape[1], big.shape[0]), interpolation=cv2.INTER_NEAREST)
bg = cv2.inpaint(big, hole, 9, cv2.INPAINT_TELEA)
cv2.imwrite(base + 'gl/room_bg_2k.jpg', bg, [cv2.IMWRITE_JPEG_QUALITY, 88])
cv2.imwrite(base + 'gl/room_bg_1k.jpg', cv2.resize(bg, (1400, 1008), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 88])

o = photo.copy(); edge = near ^ ndimage.binary_erosion(near, iterations=2); o[edge] = [255, 0, 255]
Image.fromarray(o).save('/tmp/near_cut.jpg', quality=88)
Image.fromarray(cv2.resize(bg, (1200, 864))[:, :, ::-1]).save('/tmp/room_bg_prev.jpg', quality=85)
print('ok', near.mean())
