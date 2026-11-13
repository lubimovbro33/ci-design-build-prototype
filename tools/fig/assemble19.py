import json, os, shutil, zlib, base64
from PIL import Image
SITE = '/home/claude/ci-design-build-prototype/design'
DST = '/home/claude/figx19/design/_fig'; shutil.rmtree(DST, ignore_errors=True); os.makedirs(DST, exist_ok=True)
def esc_json(o):
    s = json.dumps(o, ensure_ascii=True, separators=(',', ':'))
    s = s.replace('&', '\\u0026').replace('<', '\\u003c').replace('>', '\\u003e')
    while '  ' in s: s = s.replace('  ', ' \\u0020')
    return s
rasters = set(); files = []
def walk(items, key, canv, outdir):
    for it in items:
        if it['k'] == 'g': walk(it['ch'], key, canv, outdir)
        if it['k'] == 'i':
            if it['src'].startswith('__canvas/'):
                cid = it['src'].split('/')[1].split('.')[0]; cv = canv.get(cid)
                if cv and cv.get('crop'):
                    it['x'], it['y'], it['w'], it['h'] = cv['crop']; it['src'] = f'canvas/{key}_{cid}.jpg'; it['fit'] = 'stretch'
                    src = f'{outdir}/canvas/{key}_{cid}.jpg'
                    if os.path.exists(src): shutil.copy(src, f'{DST}/canvas__{key}_{cid}.jpg'); files.append(f'canvas__{key}_{cid}.jpg')
            else: rasters.add(it['src'])
        if it.get('img'): rasters.add(it['img']['src'])
order = {}
for pg in ('home', 'about'):
    outdir = f'/home/claude/fig/out19/{pg}'; keys = json.load(open(f'{outdir}/manifest.json')); order[pg] = keys
    for key in keys:
        P = json.load(open(f'{outdir}/{key}.json')); d = P['data']; canv = {c['id']: c for c in d['canvases']}
        walk(d['items'], key, canv, outdir)
        payload = {'sec': P['sec'], 'title': P['title'], 'w': P['w'], 'h': P['h'], 'bg': P['bg'], 'items': d['items'], 'styles': d['styles']}
        for part in ('hdr', 'rail'):
            if P.get(part):
                walk(P[part]['items'], key, {}, outdir); payload[part] = {'items': P[part]['items'], 'styles': P[part]['styles']}
        svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{P["w"]}" height="{P["h"]}" viewBox="0 0 {P["w"]} {P["h"]}">']
        for s in d['svgs']: svg.append(s['g'])
        svg.append(f'<text id="__payload" x="0" y="-20" font-family="Inter" font-size="2" fill="#000">{esc_json(payload)}</text></svg>')
        open(f'{DST}/{key}.svg', 'w').write(''.join(svg)); files.append(f'{key}.svg')
# site rasters → flat names; webp → jpg; cap 2400 px
for r in sorted(rasters):
    p = r.split('?')[0]; src = os.path.join(SITE, p)
    if not os.path.exists(src): print('MISSING', r); continue
    base = p.replace('/', '__'); stem, ext = os.path.splitext(base)
    im = Image.open(src)
    if ext.lower() in ('.png',) and im.mode in ('RGBA', 'LA', 'P'):
        if max(im.size) > 2400: im.thumbnail((2400, 2400))
        im.save(f'{DST}/{stem}.png'); files.append(stem + '.png')
    else:
        im = im.convert('RGB')
        if max(im.size) > 2400: im.thumbnail((2400, 2400))
        im.save(f'{DST}/{stem}.jpg', quality=88); files.append(stem + '.jpg')
B = open('/home/claude/fig/builder19.js', 'rb').read()
b64 = base64.b64encode(zlib.compress(B, 9)[2:-4]).decode()
open(f'{DST}/__builder19.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><text id="__builder19" x="0" y="5" font-family="Inter" font-size="2">{b64}</text></svg>')
files.insert(0, '__builder19.svg')
json.dump({'files': files, 'order': order}, open(f'{DST}/index.json', 'w'))
tot = sum(os.path.getsize(f'{DST}/{f}') for f in files)
print(len(files), 'files', round(tot / 1e6, 1), 'MB;', len(rasters), 'rasters;', sum(1 for f in files if f.startswith('canvas__')), 'canvas')
big = sorted(((os.path.getsize(f'{DST}/{f}'), f) for f in files), reverse=True)[:5]; print(big)
