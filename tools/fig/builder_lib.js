let page, IMW = {};
const imgHash = (src) => IMW[src.replace(/\//g, '__').replace(/\.(webp|jpe?g|png)$/i, '')];
const WI = { 100: 'Thin', 200: 'ExtraLight', 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold', 800: 'ExtraBold', 900: 'Black' };
function fontOf(k) {
  if (k === 'TG') return { family: 'Encode Sans Expanded', style: 'Regular' };
  if (k === 'TGB') return { family: 'Encode Sans Expanded', style: 'Bold' };
  const w = Math.round((parseInt(k.slice(1)) || 400) / 100) * 100, it = /i$/.test(k);
  if (k[0] === 'M') return { family: 'IBM Plex Mono', style: (WI[w] || 'Regular') + (it ? ' Italic' : '') };
  let s = (WI[w] || 'Regular').replace('SemiBold', 'Semi Bold').replace('ExtraBold', 'Extra Bold').replace('ExtraLight', 'Extra Light');
  if (it) s = s === 'Regular' ? 'Italic' : s + ' Italic';
  return { family: 'Inter', style: s };
}
const loaded = new Set();
async function loadFonts(styles) { for (const s of styles) { const f = fontOf(s.f), key = f.family + f.style; if (!loaded.has(key)) { await figma.loadFontAsync(f); loaded.add(key); } } }
const col = (c) => ({ r: c[0], g: c[1], b: c[2] });
function paintsOf(it, w, h) {
  const out = [];
  for (const f of (it.f || [])) {
    if (f.t === 'S') out.push({ type: 'SOLID', color: col(f.c), opacity: f.c[3] });
    else if (f.t === 'L') {
      const th = f.a * Math.PI / 180, dx = Math.sin(th), dy = -Math.cos(th), L = Math.abs(w * dx) + Math.abs(h * dy);
      const X0 = w / 2 - dx * L / 2, Y0 = h / 2 - dy * L / 2, DX = dx * L, DY = dy * L, D2 = DX * DX + DY * DY || 1;
      const T = [[w * DX / D2, h * DY / D2, -(X0 * DX + Y0 * DY) / D2], [-w * DY / D2, h * DX / D2, 0.5 - (-X0 * DY + Y0 * DX) / D2]];
      out.push({ type: 'GRADIENT_LINEAR', gradientTransform: T, gradientStops: f.s.map(([p, c]) => ({ position: Math.max(0, Math.min(1, p)), color: { r: c[0], g: c[1], b: c[2], a: c[3] } })) });
    } else if (f.t === 'R') {
      const cx = f.cx * w, cy = f.cy * h, rx = Math.max(1, f.rx), ry = Math.max(1, f.ry);
      const T = [[w / (2 * rx), 0, 0.5 - cx / (2 * rx)], [0, h / (2 * ry), 0.5 - cy / (2 * ry)]];
      out.push({ type: 'GRADIENT_RADIAL', gradientTransform: T, gradientStops: f.s.map(([p, c]) => ({ position: Math.max(0, Math.min(1, p)), color: { r: c[0], g: c[1], b: c[2], a: c[3] } })) });
    }
  }
  if (it.img) { const h2 = imgHash(it.img.src); if (h2) out.push({ type: 'IMAGE', imageHash: h2, scaleMode: /contain/.test(it.img.size) ? 'FIT' : 'FILL' }); }
  return out;
}
function deco(node, it, w, h) {
  if (it.r) { node.topLeftRadius = it.r[0]; node.topRightRadius = it.r[1]; node.bottomRightRadius = it.r[2]; node.bottomLeftRadius = it.r[3]; }
  if (it.b) {
    node.strokes = [{ type: 'SOLID', color: col(it.b.c), opacity: it.b.c[3] }]; node.strokeAlign = 'INSIDE';
    const [t, r, b, l] = it.b.w; if (t === r && r === b && b === l) node.strokeWeight = t; else { node.strokeTopWeight = t; node.strokeRightWeight = r; node.strokeBottomWeight = b; node.strokeLeftWeight = l; }
    if (it.b.d) node.dashPattern = it.b.d;
  }
  const fx = [];
  for (const s of (it.sh || [])) fx.push({ type: s.in ? 'INNER_SHADOW' : 'DROP_SHADOW', color: { r: s.c[0], g: s.c[1], b: s.c[2], a: s.c[3] }, offset: { x: s.x, y: s.y }, radius: s.b, spread: s.s, visible: true, blendMode: 'NORMAL' });
  if (it.bb) fx.push({ type: 'BACKGROUND_BLUR', radius: it.bb * 2, visible: true });
  if (it.blur) fx.push({ type: 'LAYER_BLUR', radius: it.blur * 2, visible: true });
  if (fx.length) node.effects = fx;
  if (it.op != null && it.op < 0.999) node.opacity = it.op;
  if (it.bm) node.blendMode = it.bm;
}
const sz = (v) => Math.max(0.01, v);
let ctx; // {styles, root(imported), made:[]}
async function mk(items, parent, px, py) {
  const made = [];
  for (const it of items) {
    let n = null;
    if (it.k === 'g') {
      const needFrame = it.clip || it.f || it.b || it.sh || it.r || it.bb || it.img || it.bm || it.blur;
      if (needFrame) {
        n = figma.createFrame(); parent.appendChild(n); n.name = it.n; n.x = it.x - px; n.y = it.y - py; n.resize(sz(it.w), sz(it.h));
        n.fills = paintsOf(it, it.w, it.h); n.clipsContent = !!it.clip; deco(n, it, it.w, it.h);
        await mk(it.ch, n, it.x, it.y);
      } else {
        const kids = await mk(it.ch, parent, px, py);
        if (kids.length) { n = figma.group(kids, parent); n.name = it.n; if (it.op != null && it.op < 0.999) n.opacity = it.op; }
      }
    } else if (it.k === 'b') {
      n = figma.createRectangle(); parent.appendChild(n); n.name = it.n; n.x = it.x - px; n.y = it.y - py; n.resize(sz(it.w), sz(it.h));
      n.fills = paintsOf(it, it.w, it.h); deco(n, it, it.w, it.h);
    } else if (it.k === 'i') {
      n = figma.createRectangle(); parent.appendChild(n); n.x = it.x - px; n.y = it.y - py; n.resize(sz(it.w), sz(it.h));
      const h = imgHash(it.src); n.name = it.src.split('/').pop().replace(/\.\w+$/, '');
      if (h) {
        const p = { type: 'IMAGE', imageHash: h, scaleMode: 'FILL' };
        if (it.fit === 'cover' && it.crop) { const [dw, dh, ox, oy] = it.crop; p.scaleMode = 'CROP'; p.imageTransform = [[it.w / dw, 0, -ox / dw], [0, it.h / dh, -oy / dh]]; }
        else if (it.fit === 'contain') p.scaleMode = 'FIT';
        else if (it.fit === 'stretch') { p.scaleMode = 'CROP'; p.imageTransform = [[1, 0, 0], [0, 1, 0]]; }
        if (it.flt) { const f = {}; if (it.flt.sat != null) f.saturation = it.flt.sat; if (it.flt.exp != null) f.exposure = it.flt.exp; if (it.flt.con != null) f.contrast = it.flt.con; p.filters = f; }
        n.fills = [p];
      } else { n.fills = [{ type: 'SOLID', color: { r: .3, g: .3, b: .3 } }]; n.name = '[missing] ' + it.src; }
      deco(n, Object.assign({}, it, { blur: it.flt && it.flt.blur }), it.w, it.h);
    } else if (it.k === 't') {
      const S = ctx.styles; n = figma.createText(); parent.appendChild(n);
      const s0 = S[it.runs[0][1]];
      n.fontName = fontOf(s0.f); n.characters = it.runs.map(r => r[0]).join('');
      let i = 0;
      for (const [txt, si] of it.runs) {
        const s = S[si], a = i, b = i + txt.length; i = b; if (b <= a) continue;
        n.setRangeFontName(a, b, fontOf(s.f)); n.setRangeFontSize(a, b, Math.max(1, s.s));
        n.setRangeFills(a, b, [{ type: 'SOLID', color: col(s.c), opacity: s.c[3] }]);
        n.setRangeLetterSpacing(a, b, { unit: 'PIXELS', value: s.ls || 0 });
        if (s.tt) n.setRangeTextCase(a, b, s.tt === 'uppercase' ? 'UPPER' : s.tt === 'lowercase' ? 'LOWER' : s.tt === 'capitalize' ? 'TITLE' : 'ORIGINAL');
        if (s.u) n.setRangeTextDecoration(a, b, 'UNDERLINE'); else if (s.st) n.setRangeTextDecoration(a, b, 'STRIKETHROUGH');
      }
      n.lineHeight = { unit: 'PIXELS', value: it.lh };
      if (it.auto) n.textAutoResize = 'WIDTH_AND_HEIGHT';
      else { n.resize(sz(it.w), sz(it.h)); n.textAutoResize = 'HEIGHT'; n.textAlignHorizontal = it.al === 'C' ? 'CENTER' : it.al === 'R' ? 'RIGHT' : 'LEFT'; }
      n.x = it.x - px; n.y = it.y - py; n.name = it.n; if (it.op != null && it.op < 0.999) n.opacity = it.op;
      if (it.vert) { const W0 = n.width; n.rotation = 90; n.x = it.x - px; n.y = it.y - py + W0; }
    } else if (it.k === 's') {
      const d = ctx.root.findOne(x => x.name === it.id && x.parent === ctx.root);
      if (d) {
        const ox = d.x, oy = d.y; parent.appendChild(d); d.x = ox - px; d.y = oy - py; d.name = it.n; if (it.op != null && it.op < 0.999) d.opacity = it.op;
        for (const t of d.findAllWithCriteria({ types: ['TEXT'] })) {
          const m = t.name.match(/__ls_(-?[\d.]+)/);
          const fn = t.fontName; if (fn !== figma.mixed && !loaded.has(fn.family + fn.style)) { try { await figma.loadFontAsync(fn); loaded.add(fn.family + fn.style); } catch (e) { } }
          if (m) { try { t.letterSpacing = { unit: 'PIXELS', value: parseFloat(m[1]) }; } catch (e) { } }
          t.name = t.characters.slice(0, 40);
        }
        for (const v of d.findAll(x => /^d\d+_/.test(x.name))) v.name = v.name.replace(/^d\d+_/, '').replace(/__ls_.*$/, '');
        n = d;
      }
    }
    if (n) made.push(n);
  }
  return made;
}
function bounds(items) { let y0 = 1e9, y1 = -1e9; const walk = (a) => { for (const it of a) { if (it.k === 'g') walk(it.ch); y0 = Math.min(y0, it.y); y1 = Math.max(y1, it.y + (it.h || 0)); } }; walk(items); return [y0, y1]; }
async function compFor(name, part, compSec, useY0) {
  let c = page.findOne(n => n.type === 'COMPONENT' && n.name === name); if (c) return c;
  await loadFonts(part.styles);
  let [y0, y1] = bounds(part.items); if (!useY0) y0 = 0;
  c = figma.createComponent(); c.name = name; c.fills = []; c.clipsContent = false; c.resize(1440, Math.max(1, Math.ceil(y1 - y0)));
  compSec.appendChild(c);
  const keep = ctx; ctx = { styles: part.styles, root: null }; await mk(part.items, c, 0, y0); ctx = keep;
  c.x = 80; c.y = 120 + compSec.children.filter(x => x !== c).reduce((a, x) => Math.max(a, x.y + x.height + 60 - 120), 0);
  fitSec(compSec);
  return c;
}
function fitSec(s) { let w = 0, h = 0; for (const c of s.children) { w = Math.max(w, c.x + c.width); h = Math.max(h, c.y + c.height); } s.resizeWithoutConstraints(Math.max(400, w + 80), Math.max(300, h + 80)); }
function sectionFor(name) {
  let s = page.children.find(n => n.type === 'SECTION' && n.name === name);
  if (!s) { s = figma.createSection(); s.name = name; page.appendChild(s); s.fills = [{ type: 'SOLID', color: { r: .11, g: .11, b: .11 } }]; }
  return s;
}
async function buildOne(rootId) {
  const root = await figma.getNodeByIdAsync(rootId);
  const pn = root.findOne(n => n.type === 'TEXT' && n.name === '__payload');
  const P = JSON.parse(pn.characters); pn.remove();
  ctx = { styles: P.styles, root };
  await loadFonts(P.styles); await loadFonts(P.hdr.styles); await loadFonts(P.rail.styles);
  const sec = sectionFor(P.sec);
  const prev = sec.children.filter(n => n.type === 'FRAME');
  const F = figma.createFrame(); sec.appendChild(F); F.name = P.title; F.resize(P.w, P.h); F.clipsContent = true;
  const bg = P.bg && P.bg[0] && P.bg[0].match(/[\d.]+/g); const bgOk = bg && (bg.length < 4 || parseFloat(bg[3]) > 0);
  F.fills = [{ type: 'SOLID', color: bgOk ? { r: bg[0] / 255, g: bg[1] / 255, b: bg[2] / 255 } : { r: 0, g: 0, b: 0 } }];
  F.x = 80 + prev.reduce((a, x) => Math.max(a, x.x + x.width + 80 - 80), 0); F.y = 120;
  await mk(P.items, F, 0, 0);
  const compSec = sectionFor('00 Components');
  const hN = await compFor('Header', P.hdr, compSec, false); const hi = hN.createInstance(); F.appendChild(hi); hi.x = 0; hi.y = 0; hi.name = 'Header';
  const rk = P.railKey === 'none' ? 'none' : P.railKey.replace(/^(\d+)/, '$1 ');
  const rN = await compFor('Rail · ' + rk, P.rail, compSec, true); const ri = rN.createInstance(); F.appendChild(ri); ri.x = 0; ri.y = P.h - rN.height; ri.name = 'Rail';
  root.remove(); fitSec(sec);
  return { frame: F.id, name: P.title, sec: sec.name };
}

async function run(ids) {
  page = await figma.getNodeByIdAsync('207:98'); await figma.setCurrentPageAsync(page);
  for (const n of page.children) if (/^(assets__|canvas__)/.test(n.name) && n.fills && n.fills[0] && n.fills[0].type === 'IMAGE') IMW[n.name.replace(/\.(webp|jpe?g|png)$/i, '')] = n.fills[0].imageHash;
  const out = []; for (const id of ids) { try { out.push(await buildOne(id)); } catch (e) { out.push({ id, err: String(e).slice(0, 300) }); } }
  return out;
}
