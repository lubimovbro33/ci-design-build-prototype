"""CI Turnkey — the order in which a drawing becomes its photograph (17.11.2026 17:35: «хочеться проявлення зі скетча на нашу фотографію
якесь поприкольніше, тому що просто якесь таке засвіт, не дуже воно виглядає»).
The photograph is divided into the things it is made of — a panel of the wall, a pane of the window, a fold of the curtain, a pillow, a
building of the city — by a graph segmentation of the picture itself (Felzenszwalb), and every such cell is given a moment, 0..1, written
into a grey map the size of the picture (design/assets/ln/<name>-o.png). The cover's shader reads the map and lets the photograph into the
drawing one cell at a time: the sketch is not faded into the photograph, it is filled in with it, as a drawing is coloured — and in the
order a home is made: from the ground up. The front that rises through the picture is therefore never a straight edge; it is made of the
shapes of the things themselves.
Run: python3 tools/site/cells.py"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.segmentation import felzenszwalb
PH = 'design/assets/ph'; LN = 'design/assets/ln'
WANT = {'ch/1450-32': dict(w=1280, scale=260, sigma=1.1, min_size=160, seed=7, jit=.16)}
def cells(name, w, scale, sigma, min_size, seed, jit):
    im = Image.open(os.path.join(PH, name + '.webp')).convert('RGB')
    h = int(round(im.size[1] * w / im.size[0])); a = np.asarray(im.resize((w, h), Image.LANCZOS)).astype(float) / 255
    lab = felzenszwalb(a, scale=scale, sigma=sigma, min_size=min_size)
    lab = ndi.median_filter(lab, size=3)                                   # the cells' edges, without their fringe
    ids = np.unique(lab); n = len(ids)
    yy = np.tile(np.arange(h)[:, None], (1, w)) / (h - 1.0)
    cy = ndi.mean(yy, lab, ids)                                            # where each thing stands, top 0 … foot 1
    rnd = np.random.RandomState(seed).rand(n)
    tc = (1 - cy) + jit * (rnd - .5)                                       # from the ground up, never quite a rule
    tc = (tc - tc.min()) / max(1e-6, tc.max() - tc.min())
    tm = np.zeros(int(ids.max()) + 1); tm[ids] = tc
    out = np.round(tm[lab] * 255).astype('uint8')                          # one flat value to a thing; the shader adds each point's own height,
                                                                           # so a large thing is not switched on, it rises too (and without 8-bit steps)
    o = os.path.join(LN, name.split('/')[-1] + '-o.png'); Image.fromarray(out).save(o, optimize=True)
    return n, (w, h), os.path.getsize(o) // 1024, 'kB'
if __name__ == '__main__':
    for k, o in WANT.items(): print(k, cells(k, **o))
