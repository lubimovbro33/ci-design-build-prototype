"""CI Core — the drawing that is already the building.
From a photograph of the client's own work, the room's own lines: a light blur to drop the texture of fabrics and books, a Sobel for the
structure, a threshold, and white on black at the site's own weight. Nothing is invented — every line in the drawing is a line of the room.
Run: python3 tools/site/lines.py   (writes design/assets/ln/<name>.webp)"""
import os, sys
from PIL import Image, ImageFilter
import numpy as np
SRC = 'design/assets/ph'; OUT = 'design/assets/ln'
WANT = ['ch/1450-24', 'ch/1450-17', 'us/1511-01a', 'rtb/1430-08a', 'ch/1450-31']   # CI Turnkey's cover (ch/1450-32) is drafted by tools/site/sketch.py
WIDE = {}
KX = np.array([[-1., 0, 1], [-2, 0, 2], [-1, 0, 1]]); KY = KX.T
def conv(a, k):
    p = np.pad(a, 1, mode='edge'); o = np.zeros_like(a)
    for i in range(3):
        for j in range(3):
            o += k[i, j] * p[i:i + a.shape[0], j:j + a.shape[1]]
    return o
def draw(path, w=1800, blur=1.5, thr=.11, top=.46):
    im = Image.open(path).convert('L')
    h = int(im.size[1] * w / im.size[0])
    im = im.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(im).astype(float)
    g = np.hypot(conv(a, KX), conv(a, KY)); g /= max(1e-6, g.max())
    e = np.clip((g - thr) / (top - thr), 0, 1) ** .85
    return Image.fromarray((e * 255).astype('uint8')).convert('L')
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for n in WANT:
        p = os.path.join(SRC, n + '.webp')
        if not os.path.exists(p): print('missing', p); continue
        d = draw(p, w=WIDE.get(n, 1800))
        o = os.path.join(OUT, n.split('/')[-1] + '.webp')
        d.save(o, quality=86, method=6)
        print(o, d.size, os.path.getsize(o) // 1024, 'kB')
