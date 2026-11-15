import json, os, shutil, zlib, base64
from PIL import Image
SITE = '/home/claude/ci-design-build-prototype/design'
DST = '/home/claude/figx19/design/_fig'; shutil.rmtree(DST, ignore_errors=True); os.makedirs(DST, exist_ok=True)
OUTD = '/home/claude/fig/out19/portfolio'
def esc_json(o):
    s = json.dumps(o, ensure_ascii=True, separators=(',', ':'))
    s = s.replace('&', '\\u0026').replace('<', '\\u003c').replace('>', '\\u003e')
    while '  ' in s: s = s.replace('  ', ' \\u0020')
    return s
rasters = set(); files = []
def empty_png(p):
    try: return Image.open(p).getbbox() is None
    except Exception: return True
def walk(items, key, canv):
    out = []
    for it in items:
        if it['k'] == 'g': it['ch'] = walk(it['ch'], key, canv)
        if it['k'] == 'i':
            if it['src'].startswith('__canvas/'):
                cid = it['src'].split('/')[1].split('.')[0]; cv = canv.get(cid); src = f'{OUTD}/canvas/{key}_{cid}.png'
                if not (cv and cv.get('crop')) or not os.path.exists(src) or empty_png(src): continue      # an empty canvas is not a layer
                it['x'], it['y'], it['w'], it['h'] = cv['crop']; it['src'] = f'canvas/{key}_{cid}.png'; it['fit'] = 'stretch'
                shutil.copy(src, f'{DST}/canvas__{key}_{cid}.png'); files.append(f'canvas__{key}_{cid}.png')
            else: rasters.add(it['src'])
        if it.get('img'): rasters.add(it['img']['src'])
        out.append(it)
    return out
M = json.load(open(f'{OUTD}/manifest.json'))
TB = {'pb00': '01 Cover · 1', 'pb01': '02 Cover · 2', 'pb02': '03 Intro + Signature CI Residences · 1', 'pb03': '04 Signature CI Residences · 2', 'pb04': '05 Signature CI Residences · 3',
      'pb05': '06 Every Home Unique · 1', 'pb06': '07 Every Home Unique · 2 + Explore the Work · 1', 'pb07': '08 Explore the Work · 2', 'pb08': '09 CTA', 'pb09': '10 Footer'}
HDR = None
for key in M['A'] + M['B']:
    P = json.load(open(f'{OUTD}/{key}.json')); d = P['data']; canv = {c['id']: c for c in d['canvases']}
    items = walk(d['items'], key, canv)
    payload = {'key': key, 'sec': P['sec'], 'title': TB.get(key, P['title']), 'w': P['w'], 'h': P['h'], 'bg': P['bg'], 'items': items, 'styles': d['styles']}
    for part in ('hdr', 'rail'):
        if P.get(part):
            pi = walk(P[part]['items'], key, {}); payload[part] = {'items': pi, 'styles': P[part]['styles']}
    if key == 'pa00': HDR = payload.get('hdr')
    if key == 'pb00' and HDR: payload['hdr'] = HDR          # the cover of the screen set carries the header too
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{P["w"]}" height="{P["h"]}" viewBox="0 0 {P["w"]} {P["h"]}">']
    for s in d['svgs']: svg.append(s['g'])
    svg.append(f'<text id="__payload" x="0" y="-20" font-family="Inter" font-size="2" fill="#000">{esc_json(payload)}</text></svg>')
    open(f'{DST}/{key}.svg', 'w').write(''.join(svg)); files.append(f'{key}.svg')
imgs = []
for r in sorted(rasters):
    p = r.split('?')[0]; src = os.path.join(SITE, p)
    if not os.path.exists(src): print('MISSING', r); continue
    base = p.replace('/', '__'); stem, ext = os.path.splitext(base)
    im = Image.open(src)
    if ext.lower() in ('.png',) and im.mode in ('RGBA', 'LA', 'P'):
        if max(im.size) > 2400: im.thumbnail((2400, 2400))
        im.save(f'{DST}/{stem}.png'); imgs.append(stem + '.png')
    else:
        im = im.convert('RGB')
        if max(im.size) > 2400: im.thumbnail((2400, 2400))
        im.save(f'{DST}/{stem}.jpg', quality=88); imgs.append(stem + '.jpg')
    print(' ', imgs[-1], im.size, os.path.getsize(f'{DST}/{imgs[-1]}') // 1024, 'KB')
B = open('/home/claude/fig/builder19.js', 'rb').read()
b64 = base64.b64encode(zlib.compress(B, 9)[2:-4]).decode()
open(f'{DST}/__builder19.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><text id="__builder19" x="0" y="5" font-family="Inter" font-size="2">{b64}</text></svg>')
svgs = ['__builder19.svg'] + [f for f in files if f.endswith('.svg')]; imgs += [f for f in files if f.startswith('canvas__')]
json.dump({'svgs': svgs, 'imgs': imgs, 'A': M['A'], 'B': M['B']}, open(f'{DST}/index.json', 'w'))
tot = sum(os.path.getsize(f'{DST}/{f}') for f in svgs + imgs)
print(len(svgs), 'svgs', len(imgs), 'images', round(tot / 1e6, 2), 'MB')
print(sorted(((os.path.getsize(f'{DST}/{f}') // 1024, f) for f in svgs), reverse=True)[:6])
