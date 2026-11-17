"""Parts of the client's photographs used as pictures of their own (17.11.2026).
`ch/1450-32-w` — the WINDOW of CI Turnkey's cover photograph (the bedroom of Collectors Home): the opening itself, its transom bar
included. It is the last state of the process's drawing on that page — the wall drawn stage by stage, and at «Deliver» the evening
city stands in its window — so the page ends in the window it began with. The drawing's opening has this crop's proportions exactly
(js/inner.js, the [data-pr] module: PANE), so the photograph is neither stretched nor cut again.
Run: python3 tools/site/crops.py"""
import os
from PIL import Image
SRC = 'design/assets/ph'
CROPS = {'ch/1450-32-w': ('ch/1450-32', (.4445, .095, .7275, .745))}   # name: (photograph, x0 y0 x1 y1 of it)
if __name__ == '__main__':
    for name, (src, (x0, y0, x1, y1)) in CROPS.items():
        im = Image.open(os.path.join(SRC, src + '.webp')).convert('RGB'); W, H = im.size
        c = im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
        out = os.path.join(SRC, name + '.webp'); c.save(out, quality=88, method=6)
        print(out, c.size, round(c.size[0] / c.size[1], 4), os.path.getsize(out) // 1024, 'kB')
