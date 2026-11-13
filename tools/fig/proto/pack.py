import json, sys, os, re, base64, html
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
def svg(name, text):
    t = html.escape(text, quote=False)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><text id="{name}" x="0" y="20" font-size="10">{t}</text></svg>'
def put(fname, name, text):
    open(f'{OUT}/{fname}', 'w', encoding='ascii').write(svg(name, text))
files = []
for spec in sys.argv[2:]:
    kind, path, name = spec.split(':')
    if kind == 'lib':
        src = open(path).read()
        one = ' '.join(l.strip() for l in src.splitlines() if l.strip())
        one = ''.join(c if ord(c) < 128 else '\\u%04x' % ord(c) for c in one)
        put(name + '.svg', name, one); files.append(name + '.svg')
    elif kind == 'json':
        d = json.load(open(path))
        put(name + '.svg', name, json.dumps(d, ensure_ascii=True, separators=(',', ':'))); files.append(name + '.svg')
print(files)
