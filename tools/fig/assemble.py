import json, os, glob, re, shutil
OUT = '/home/claude/fig/out'; DST = '/home/claude/ci-design-build-prototype/design/_fig'
os.makedirs(DST + '/svg', exist_ok=True); os.makedirs(DST + '/canvas', exist_ok=True)
rasters = set()
def walk(items, key, canv):
    for it in items:
        if it['k'] == 'g': walk(it['ch'], key, canv)
        if it['k'] == 'i':
            if it['src'].startswith('__canvas/'):
                cid = it['src'].split('/')[1].split('.')[0]; cv = canv.get(cid)
                if cv and cv.get('crop'):
                    it['x'], it['y'], it['w'], it['h'] = cv['crop']; it['src'] = f'canvas/{key}_{cid}.png'; it['fit'] = 'stretch'
            rasters.add(it['src'])
        if it.get('img'): rasters.add(it['img']['src'])
def esc_json(o):
    s = json.dumps(o, ensure_ascii=True, separators=(',', ':'))
    s = s.replace('&', '\\u0026').replace('<', '\\u003c').replace('>', '\\u003e')
    while '  ' in s: s = s.replace('  ', ' \\u0020')
    return s
keys = []
for f in sorted(glob.glob(OUT + '/f*.json')):
    P = json.load(open(f)); key = P['key']; d = P['data']
    canv = {c['id']: c for c in d['canvases']}
    walk(d['items'], key, canv); walk(P['hdr']['items'], key, {}); walk(P['rail']['items'], key, {})
    for c in d['canvases']:
        src = f"{OUT}/canvas/{key}_{c['id']}.png"
        if os.path.exists(src): shutil.copy(src, f"{DST}/canvas/{key}_{c['id']}.png")
    payload = {'sec': P['sec'], 'title': P['title'], 'w': P['w'], 'h': P['h'], 'bg': P['bg'], 'items': d['items'], 'styles': d['styles'],
               'hdr': {'items': P['hdr']['items'], 'styles': P['hdr']['styles']}, 'rail': {'items': P['rail']['items'], 'styles': P['rail']['styles']}, 'railKey': P['railKey']}
    W, H = P['w'], P['h']
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
    for s in d['svgs']: svg.append(s['g'])
    svg.append(f'<text id="__payload" x="0" y="-20" font-family="Inter" font-size="2" fill="#000">{esc_json(payload)}</text></svg>')
    open(f'{DST}/svg/{key}.svg', 'w').write(''.join(svg))
    keys.append(key)
rasters = sorted(r for r in rasters if not r.startswith('canvas/'))
json.dump({'keys': keys, 'rasters': rasters}, open('/home/claude/fig/manifest.json', 'w'), indent=1)
print(len(keys), 'frames;', len(rasters), 'site rasters')
for r in rasters: print(' ', r)
print('canvas pngs', len(os.listdir(DST + '/canvas')))
print('svg sizes KB', {k: os.path.getsize(f'{DST}/svg/{k}.svg') // 1024 for k in keys})
