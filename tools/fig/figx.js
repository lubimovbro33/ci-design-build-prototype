// figx — DOM → Figma payload extractor (runs in the page). window.__figx(opts) → payload
(function () {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'HEAD']);
  const R = (v) => Math.round(v * 100) / 100;
  const pf = (v) => parseFloat(v) || 0;

  function rgba(str) {
    if (!str) return null;
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);
    const a = p.length > 3 ? p[3] : 1;
    if (a <= 0.003) return null;
    return [R(p[0] / 255), R(p[1] / 255), R(p[2] / 255), R(a)];
  }
  function splitTop(s) { // split by top-level commas
    const out = []; let d = 0, cur = '';
    for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; }
    if (cur.trim()) out.push(cur.trim()); return out;
  }
  function stops(parts) {
    const st = []; let n = parts.length;
    parts.forEach((p, i) => {
      const c = rgba(p) || (/(transparent)/.test(p) ? [0, 0, 0, 0] : null);
      const cm = p.match(/rgba?\([^)]*\)/); const rest = cm ? p.replace(cm[0], '').trim() : p.replace('transparent', '').trim();
      const pos = rest.match(/(-?[\d.]+)%/);
      let col = c; if (!col) { const z = p.match(/rgba?\([^)]*\)/); col = z ? (rgba(z[0]) || [0, 0, 0, 0]) : [0, 0, 0, 0]; }
      st.push({ c: col, p: pos ? pf(pos[1]) / 100 : null });
    });
    if (st.length && st[0].p == null) st[0].p = 0; if (st.length && st[st.length - 1].p == null) st[st.length - 1].p = 1;
    for (let i = 1; i < st.length - 1; i++) if (st[i].p == null) { let j = i; while (st[j].p == null) j++; const a = st[i - 1].p, b = st[j].p; for (let k = i; k < j; k++) st[k].p = a + (b - a) * (k - i + 1) / (j - i + 1); }
    return st.map(s => [R(s.p), s.c]);
  }
  function gradient(g, w, h) {
    let m = g.match(/^(repeating-)?(linear|radial)-gradient\((.*)\)$/s); if (!m) return null;
    const kind = m[2]; let parts = splitTop(m[3]);
    if (kind === 'linear') {
      let ang = 180; const f = parts[0];
      if (/deg|turn|rad/.test(f) && !/rgb/.test(f)) { ang = /turn/.test(f) ? pf(f) * 360 : /rad/.test(f) ? pf(f) * 180 / Math.PI : pf(f); parts.shift(); }
      else if (/^to /.test(f)) { const t = f.slice(3); const M = { top: 0, right: 90, bottom: 180, left: 270, 'top right': 45, 'right top': 45, 'bottom right': 135, 'right bottom': 135, 'bottom left': 225, 'left bottom': 225, 'top left': 315, 'left top': 315 }; ang = M[t] ?? 180; parts.shift(); }
      return { t: 'L', a: R(ang), s: stops(parts) };
    }
    // radial: [shape size] [at x y]
    let cx = 0.5, cy = 0.5, f = parts[0], rx = null, ry = null;
    if (!/rgb|transparent/.test(f)) {
      parts.shift();
      const at = f.match(/at\s+([^\s]+)(?:\s+([^\s]+))?/);
      const pos = (v, L) => v == null ? 0.5 : /%/.test(v) ? pf(v) / 100 : /px/.test(v) ? pf(v) / L : ({ left: 0, top: 0, center: 0.5, right: 1, bottom: 1 }[v] ?? 0.5);
      if (at) { cx = pos(at[1], w); cy = pos(at[2] ?? 'center', h); }
      const sz = f.replace(/at\s.*$/, '').trim().split(/\s+/).filter(x => /px|%/.test(x));
      if (sz.length) { rx = /%/.test(sz[0]) ? pf(sz[0]) / 100 * w : pf(sz[0]); ry = sz[1] ? (/%/.test(sz[1]) ? pf(sz[1]) / 100 * h : pf(sz[1])) : rx; }
      if (/circle/.test(f) && !sz.length) { const X = Math.max(cx, 1 - cx) * w, Y = Math.max(cy, 1 - cy) * h; rx = ry = /closest-side/.test(f) ? Math.min(Math.min(cx, 1 - cx) * w, Math.min(cy, 1 - cy) * h) : Math.hypot(X, Y); }
      if (rx == null && /closest-side/.test(f)) { rx = Math.min(cx, 1 - cx) * w; ry = Math.min(cy, 1 - cy) * h; }
    }
    if (rx == null) { const X = Math.max(cx, 1 - cx) * w, Y = Math.max(cy, 1 - cy) * h; rx = X * Math.SQRT2; ry = Y * Math.SQRT2; }
    return { t: 'R', cx: R(cx), cy: R(cy), rx: R(rx), ry: R(ry), s: stops(parts) };
  }
  function shadows(s) {
    if (!s || s === 'none') return [];
    return splitTop(s).map(x => {
      const c = rgba((x.match(/rgba?\([^)]*\)/) || [''])[0]); const nums = x.replace(/rgba?\([^)]*\)/, '').trim().split(/\s+/).filter(v => /px|^0$/.test(v)).map(pf);
      if (!c) return null; return { in: /inset/.test(x) ? 1 : 0, x: nums[0] || 0, y: nums[1] || 0, b: nums[2] || 0, s: nums[3] || 0, c };
    }).filter(Boolean);
  }
  const BM = { multiply: 'MULTIPLY', screen: 'SCREEN', overlay: 'OVERLAY', 'soft-light': 'SOFT_LIGHT', 'hard-light': 'HARD_LIGHT', darken: 'DARKEN', lighten: 'LIGHTEN', 'color-dodge': 'COLOR_DODGE', 'color-burn': 'COLOR_BURN', difference: 'DIFFERENCE', exclusion: 'EXCLUSION', luminosity: 'LUMINOSITY', color: 'COLOR', saturation: 'SATURATION', hue: 'HUE' };
  function filt(f) {
    if (!f || f === 'none') return null; const o = {};
    for (const m of f.matchAll(/(\w[\w-]*)\(([^)]*)\)/g)) {
      const v = /%/.test(m[2]) ? pf(m[2]) / 100 : pf(m[2]);
      if (m[1] === 'grayscale') o.sat = -Math.min(1, v); else if (m[1] === 'saturate') o.sat = Math.max(-1, Math.min(1, v - 1));
      else if (m[1] === 'brightness') o.exp = Math.max(-1, Math.min(1, (v - 1) * 0.9)); else if (m[1] === 'contrast') o.con = Math.max(-1, Math.min(1, v - 1));
      else if (m[1] === 'blur') o.blur = pf(m[2]); else if (m[1] === 'sepia') o.sep = v;
    }
    return Object.keys(o).length ? o : null;
  }
  function radii(cs, w, h) {
    const one = (v, L) => { const p = v.split(' ')[0]; return /%/.test(p) ? pf(p) / 100 * L : pf(p); };
    const r = [one(cs.borderTopLeftRadius, w), one(cs.borderTopRightRadius, w), one(cs.borderBottomRightRadius, w), one(cs.borderBottomLeftRadius, w)].map(v => R(Math.min(v, Math.min(w, h) / 2)));
    return r.some(v => v > 0) ? r : null;
  }
  function fontKey(cs) {
    const f = cs.fontFamily; const w = parseInt(cs.fontWeight) || 400;
    if (/TG Ext/.test(f)) return w >= 600 ? 'TGB' : 'TG';
    if (/Plex Mono|mono/i.test(f)) return 'M' + w;
    return 'I' + w + (cs.fontStyle === 'italic' ? 'i' : '');
  }
  function name(el) {
    if (el.id && !/^(v15|ph\d|pt\d)/.test(el.id)) return (el.className && typeof el.className === 'string' && el.className.trim() ? el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase()) + '#' + el.id;
    const c = (typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '').trim();
    return c ? c.split(/\s+/).slice(0, 2).join('.') : el.tagName.toLowerCase();
  }
  function bgUrl(cs) { const m = (cs.backgroundImage || '').match(/url\("?([^")]+)"?\)/); return m ? m[1] : null; }
  const imgSize = {};
  async function preload(urls) { await Promise.all([...new Set(urls)].map(u => new Promise(res => { const i = new Image(); i.onload = () => { imgSize[u] = [i.naturalWidth, i.naturalHeight]; res(); }; i.onerror = res; i.src = u; }))); }
  function rel(u) { try { const x = new URL(u, location.href); return x.pathname.replace(/^\//, ''); } catch (e) { return u; } }

  // ---------- pseudo materialisation ----------
  function materialize(root) {
    if (!document.getElementById('__np')) { const s = document.createElement('style'); s.id = '__np'; s.textContent = '[data-np]::before,[data-np]::after{content:none!important}'; document.head.appendChild(s); }
    const els = [root, ...root.querySelectorAll('*')];
    const jobs = [];
    for (const el of els) {
      if (el.namespaceURI === 'http://www.w3.org/2000/svg' || /^(IMG|CANVAS|INPUT|BR|VIDEO)$/.test(el.tagName)) continue;
      for (const which of ['::before', '::after']) {
        const cs = getComputedStyle(el, which);
        if (!cs.content || cs.content === 'none' || cs.content === 'normal' || cs.display === 'none') continue;
        const sp = document.createElement('span'); sp.setAttribute('data-pseudo', which);
        for (let i = 0; i < cs.length; i++) { const p = cs[i]; if (/^(transition|animation|content|will-change)/.test(p)) continue; sp.style.setProperty(p, cs.getPropertyValue(p)); }
        sp.style.transition = 'none'; sp.style.animation = 'none';
        const m = cs.content.match(/^"(.*)"$/s); sp.textContent = m ? m[1].replace(/\\([0-9a-f]{1,6}) ?/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1') : '';
        jobs.push([el, which, sp]);
      }
    }
    for (const [el, which, sp] of jobs) { el.setAttribute('data-np', ''); if (which === '::before') el.insertBefore(sp, el.firstChild); else el.appendChild(sp); }
    return jobs.length;
  }
  function unmaterialize() { document.querySelectorAll('[data-pseudo]').forEach(e => e.remove()); document.querySelectorAll('[data-np]').forEach(e => e.removeAttribute('data-np')); }

  // ---------- svg serialisation ----------
  const SVGP = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'font-size', 'text-anchor', 'dominant-baseline', 'stop-color', 'stop-opacity'];
  let svgN = 0;
  function serializeSvg(svg, clip, origin) {
    const id = 'd' + (++svgN); const pre = id + '_';
    const root = svg.getScreenCTM(); if (!root) return null;
    const out = [];
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    function walk(n, depth) {
      if (n.nodeType === 3) { return esc(n.nodeValue); }
      if (n.nodeType !== 1) return '';
      const tag = n.tagName; if (/^(script|style|title|desc|metadata|foreignObject)$/i.test(tag)) return '';
      const cs = getComputedStyle(n);
      const isDef = n.closest('defs, clipPath, mask, linearGradient, radialGradient, pattern, symbol, marker');
      if (!isDef && (cs.display === 'none' || cs.visibility === 'hidden' || pf(cs.opacity) < 0.01)) return '';
      const attrs = {};
      for (const a of n.attributes) { if (/^(class|style|data-|pathLength|vector-effect|aria-)/.test(a.name)) continue; attrs[a.name] = a.value; }
      if (n.id) attrs.id = pre + n.id;
      for (const k of ['fill', 'stroke', 'clip-path', 'mask', 'marker-start', 'marker-end', 'href', 'xlink:href']) if (attrs[k] && /url\(#|^#/.test(attrs[k])) attrs[k] = attrs[k].replace(/#([\w-]+)/, '#' + pre + '$1');
      if (n === svg) {
        for (const k of ['width', 'height', 'viewBox', 'preserveAspectRatio', 'x', 'y', 'xmlns']) delete attrs[k];
      }
      if (!isDef && n !== svg) {
        for (const p of SVGP) { let v = cs.getPropertyValue(p); if (v == null || v === '') continue; if (/url\(/.test(v)) { const m = v.match(/url\("?#?([^")]+)"?\)/); v = m ? 'url(#' + pre + m[1].replace(/^.*#/, '') + ')' : 'none'; } attrs[p] = v.replace(/px/g, ''); }
        if (/^(text|tspan)$/.test(tag)) {
          const fk = fontKey(cs); attrs['font-family'] = fk.startsWith('TG') ? 'Encode Sans Expanded' : fk.startsWith('M') ? 'IBM Plex Mono' : 'Inter';
          attrs['font-weight'] = fk === 'TGB' ? '700' : String(parseInt(cs.fontWeight) || 400);
          const ls = pf(cs.letterSpacing); if (ls) attrs.id = (attrs.id || (pre + 't' + (++svgN))) + '__ls_' + R(ls);
          if (cs.textTransform === 'uppercase') attrs['data-up'] = '1';
        }
        // transforms from CSS (incl. transform-origin)
        if (cs.transform && cs.transform !== 'none' && !attrs.transform) {
          const m = new DOMMatrix(cs.transform); const o = cs.transformOrigin.split(' ').map(pf);
          let ox = o[0] || 0, oy = o[1] || 0; if (cs.transformBox === 'fill-box' && n.getBBox) { try { const b = n.getBBox(); ox += b.x; oy += b.y; } catch (e) { } }
          const M = new DOMMatrix().translate(ox, oy).multiply(m).translate(-ox, -oy);
          attrs.transform = `matrix(${R(M.a * 1000) / 1000},${R(M.b * 1000) / 1000},${R(M.c * 1000) / 1000},${R(M.d * 1000) / 1000},${R(M.e)},${R(M.f)})`;
        } else if (cs.transform && cs.transform !== 'none' && attrs.transform) { /* attribute already present: keep */ }
        // non-scaling stroke & draw-on dashes
        const ctm = n.getScreenCTM && n.getScreenCTM();
        const sc = ctm ? Math.sqrt(Math.abs(ctm.a * ctm.d - ctm.b * ctm.c)) : 1;
        const ve = cs.vectorEffect === 'non-scaling-stroke' || n.getAttribute('vector-effect') === 'non-scaling-stroke';
        if (attrs['stroke-width'] && ve && sc > 0) attrs['stroke-width'] = String(R(pf(attrs['stroke-width']) / sc * 1000) / 1000);
        const pl = n.getAttribute('pathLength');
        const da = cs.strokeDasharray;
        if (pl && da && da !== 'none' && n.getTotalLength) {
          const L = n.getTotalLength(); const k = L / pf(pl); let arr = da.split(/[ ,]+/).map(pf); const offS = cs.strokeDashoffset; let off = /%/.test(offS) ? pf(offS) / 100 * pf(pl) : pf(offS); if (ve && sc > 0) { arr = arr.map(v => v / sc); if (!/%/.test(offS)) off = off / sc; }
          // visible fraction on [0, pl]
          const per = arr.length % 2 ? arr.concat(arr) : arr; const P = per.reduce((a, b) => a + b, 0) || 1; let vis = 0; const N = 200; let first = -1, last = -1;
          for (let i = 0; i < N; i++) { const s = (i + 0.5) / N * pf(pl); let q = ((s + off) % P + P) % P; let on = true; for (const d of per) { if (q < d) break; q -= d; on = !on; } if (on) { vis++; if (first < 0) first = i; last = i; } }
          const fr = vis / N;
          if (fr < 0.02) return '';
          if (fr > 0.97) delete attrs['stroke-dasharray'];
          else if (vis === last - first + 1) { const a0 = first / N * L, a1 = (last + 1) / N * L; attrs['stroke-dasharray'] = a0 > 1 ? `0 ${R(a0)} ${R(a1 - a0)} ${R(L * 3)}` : `${R(a1)} ${R(L * 3)}`; }
          else attrs['stroke-dasharray'] = arr.map(v => R(v * k)).join(' ');
        } else if (da && da !== 'none') {
          let arr = da.split(/[ ,]+/).map(pf); if (ve && sc > 0) arr = arr.map(v => v / sc); attrs['stroke-dasharray'] = arr.map(R).join(' ');
        }
        if (attrs['stroke-dasharray'] === 'none') delete attrs['stroke-dasharray'];
        delete attrs['stroke-dashoffset'];
        if (attrs.opacity === '1') delete attrs.opacity;
        if (tag === 'image') { return ''; }
      }
      let inner = ''; for (const c of n.childNodes) inner += walk(c, depth + 1);
      if (/^(text|tspan)$/.test(tag) && attrs['data-up']) { inner = inner.toUpperCase(); }
      delete attrs['data-up'];
      if (n === svg) return inner;
      if ((tag === 'g') && !inner.trim()) return '';
      const at = Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
      return `<${tag}${at ? ' ' + at : ''}>${inner}</${tag}>`;
    }
    const body = walk(svg, 0);
    if (!body.trim()) return null;
    const M = new DOMMatrix([root.a, root.b, root.c, root.d, root.e - origin[0], root.f - origin[1]]);
    const r = svg.getBoundingClientRect();
    const cs = getComputedStyle(svg);
    const ovf = cs.overflow !== 'visible';
    let clipDef = '', clipAttr = '';
    if (ovf) { clipDef = `<clipPath id="${pre}clip"><rect x="${R(r.left - origin[0])}" y="${R(r.top - origin[1])}" width="${R(r.width)}" height="${R(r.height)}"/></clipPath>`; }
    const g = `<g id="${id}">${clipDef ? '<defs>' + clipDef + '</defs>' : ''}<g transform="matrix(${R(M.a * 10000) / 10000},${R(M.b * 10000) / 10000},${R(M.c * 10000) / 10000},${R(M.d * 10000) / 10000},${R(M.e)},${R(M.f)})">${body}</g></g>`;
    return { id, g, x: R(r.left - origin[0]), y: R(r.top - origin[1]), w: R(r.width), h: R(r.height) };
  }

  // ---------- main ----------
  window.__figx = async function (opts) {
    svgN = 0;
    const roots = opts.roots.map(s => typeof s === 'string' ? document.querySelector(s) : s).filter(Boolean);
    const origin = opts.origin || [0, 0];
    const clip0 = opts.clip; // [x0,y0,x1,y1] in viewport coords
    let mats = 0; for (const r of roots) mats += materialize(r);
    // preload bg images
    const urls = []; for (const r of roots) for (const e of [r, ...r.querySelectorAll('*')]) { const u = bgUrl(getComputedStyle(e)); if (u) urls.push(u); }
    await preload(urls);
    const styles = [], skey = {}; const svgs = [], canvases = [], warn = [];
    const st = (o) => { const k = JSON.stringify(o); if (!(k in skey)) { skey[k] = styles.length; styles.push(o); } return skey[k]; };
    const inter = (a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])];
    const vis = (r, c) => r.width > 0.5 && r.height > 0.5 && r.right > c[0] && r.bottom > c[1] && r.left < c[2] && r.top < c[3];
    const box = (r) => ({ x: R(r.left - origin[0]), y: R(r.top - origin[1]), w: R(r.width), h: R(r.height) });
    const isInlineEl = (cs) => (cs.display === 'inline') && !/absolute|fixed/.test(cs.position) && cs.float === 'none';

    function zsort(arr) {
      const key = (e) => { const c = getComputedStyle(e); if (c.position === 'static') return 0; const z = parseInt(c.zIndex); return isNaN(z) ? 1 : z < 0 ? z - 1 : z === 0 ? 1 : 1 + z; };
      return arr.map((e, i) => [key(e), i, e]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(x => x[2]);
    }
    function paints(el, cs, r) {
      const p = {};
      const fills = [];
      const bgc = rgba(cs.backgroundColor);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        const layers = splitTop(bi).reverse();
        if (bgc) fills.push({ t: 'S', c: bgc });
        for (const L of layers) { if (/gradient/.test(L)) { const g = gradient(L, r.width, r.height); if (g) fills.push(g); } }
      } else if (bgc) fills.push({ t: 'S', c: bgc });
      if (fills.length) p.f = fills;
      const bw = [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].map(pf);
      const bc = [cs.borderTopColor, cs.borderRightColor, cs.borderBottomColor, cs.borderLeftColor].map(rgba);
      const bs = [cs.borderTopStyle, cs.borderRightStyle, cs.borderBottomStyle, cs.borderLeftStyle];
      const sides = bw.map((w, i) => (w > 0 && bc[i] && bs[i] !== 'none' && bs[i] !== 'hidden') ? w : 0);
      if (sides.some(v => v > 0)) { const ci = sides.findIndex(v => v > 0); p.b = { w: sides.map(R), c: bc[ci] }; if (/dashed|dotted/.test(bs[ci])) p.b.d = bs[ci] === 'dotted' ? [sides[ci], sides[ci]] : [sides[ci] * 3, sides[ci] * 2]; }
      const rr = radii(cs, r.width, r.height); if (rr) p.r = rr;
      const sh = shadows(cs.boxShadow); if (sh.length) p.sh = sh;
      const bf = cs.backdropFilter || cs.webkitBackdropFilter; if (bf && /blur/.test(bf)) p.bb = pf(bf.match(/blur\(([^)]*)\)/)[1]);
      const u = bgUrl(cs); if (u) p.img = { src: rel(u), n: imgSize[u] || null, size: cs.backgroundSize, pos: cs.backgroundPosition };
      return p;
    }

    function textBlock(el, cs, r, clip, opMul) {
      const segs = []; let any = false;
      const blockLH = cs.lineHeight === 'normal' ? pf(cs.fontSize) * 1.2 : pf(cs.lineHeight);
      const pre = /pre/.test(cs.whiteSpace);
      const extraBoxes = [];
      function segStyle(ecs, op) {
        let c = rgba(ecs.color) || [0, 0, 0, 0]; if (c[3] === 0 && pf(ecs.webkitTextStrokeWidth) > 0) c = rgba(ecs.webkitTextStrokeColor) || c;
        const o = { f: fontKey(ecs), s: R(pf(ecs.fontSize)), ls: R(pf(ecs.letterSpacing) || 0), c: [c[0], c[1], c[2], R(c[3] * op)] };
        if (ecs.textTransform && ecs.textTransform !== 'none') o.tt = ecs.textTransform;
        if (/underline/.test(ecs.textDecorationLine)) o.u = 1; if (/line-through/.test(ecs.textDecorationLine)) o.st = 1;
        return st(o);
      }
      function walk(node, ncs, op) {
        for (const ch of node.childNodes) {
          if (ch.nodeType === 3) { if (ch.nodeValue) { segs.push([ch.nodeValue, segStyle(ncs, op)]); if (ch.nodeValue.trim()) any = true; } continue; }
          if (ch.nodeType !== 1 || SKIP.has(ch.tagName)) continue;
          if (ch.tagName === 'BR') { segs.push(['\u2028', -1]); continue; }
          const ccs = getComputedStyle(ch);
          if (ccs.display === 'none') continue;
          const ib = /^inline-(block|flex)$/.test(ccs.display) && !/absolute|fixed/.test(ccs.position) && ![...ch.querySelectorAll('*')].some(x => !/^(inline|inline-block)$/.test(getComputedStyle(x).display)) && !(rgba(ccs.backgroundColor) || pf(ccs.borderTopWidth) || pf(ccs.borderLeftWidth)) && ch.textContent.trim();
          if ((isInlineEl(ccs) || ib) && ch.namespaceURI !== 'http://www.w3.org/2000/svg' && !/^(IMG|CANVAS)$/.test(ch.tagName)) {
            const cop = pf(ccs.opacity); if (cop < 0.05 || ccs.visibility === 'hidden') { continue; }
            const pb = paints(ch, ccs, ch.getBoundingClientRect());
            if (pb.f || pb.b) for (const rr of ch.getClientRects()) if (vis(rr, clip)) extraBoxes.push(Object.assign({ k: 'b', n: name(ch), op: R(opMul * cop) }, box(rr), pb));
            walk(ch, ccs, op * cop);
          } else nonInline.push(ch);
        }
      }
      const nonInline = [];
      walk(el, cs, 1);
      if (!any) return { item: null, nonInline, extraBoxes };
      // whitespace
      let out = [];
      for (const [t, s] of segs) { let v = t; if (s !== -1 && !pre) v = v.replace(/[ \t\n\r\f]+/g, ' '); out.push([v, s]); }
      // collapse spaces across segment boundaries and trim around breaks
      let txt = '', map = [];
      for (const [t, s] of out) for (const ch of t) {
        const prev = txt[txt.length - 1];
        if (!pre && ch === ' ' && (txt.length === 0 || prev === ' ' || prev === '\u2028')) continue;
        if (ch === '\u2028' && prev === ' ') { txt = txt.slice(0, -1); map.pop(); }
        txt += ch; map.push(s);
      }
      while (txt.endsWith(' ')) { txt = txt.slice(0, -1); map.pop(); }
      txt = txt.replace(/\u2028/g, '\n');
      // runs
      const runs = []; let cur = null;
      for (let i = 0; i < txt.length; i++) { let s = map[i]; if (s === -1) s = cur ? cur[1] : (map.find(v => v !== -1) ?? 0); if (!cur || cur[1] !== s) { cur = [txt[i], s]; runs.push(cur); } else cur[0] += txt[i]; }
      // geometry
      const rg = document.createRange(); rg.selectNodeContents(el);
      const rects = [...rg.getClientRects()].filter(x => x.width > 0.5 && x.height > 0.5);
      if (!rects.length) return { item: null, nonInline, extraBoxes };
      const tops = []; for (const x of rects) if (!tops.some(t => Math.abs(t - x.top) < Math.max(3, blockLH * 0.4))) tops.push(x.top);
      const lines = tops.length;
      const u = rects.reduce((a, x) => ({ l: Math.min(a.l, x.left), t: Math.min(a.t, x.top), r: Math.max(a.r, x.right), b: Math.max(a.b, x.bottom) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
      const first = rects.reduce((a, x) => x.top < a.top - 1 ? x : a, rects[0]);
      const y = first.top - (blockLH - first.height) / 2;
      const pl = pf(cs.paddingLeft) + pf(cs.borderLeftWidth), pr = pf(cs.paddingRight) + pf(cs.borderRightWidth);
      const al = cs.textAlign === 'center' ? 'C' : (cs.textAlign === 'right' || cs.textAlign === 'end') ? 'R' : 'L';
      const it = { k: 't', n: name(el), y: R(y - origin[1]), lh: R(blockLH), lines, runs, op: R(opMul) };
      const hasNL = txt.includes('\n');
      if (/^vertical/.test(cs.writingMode)) { it.vert = 1; it.auto = 1; it.x = R(r.left - origin[0]); it.y = R(r.top - origin[1]); it.w = R(r.height); it.h = R(r.width); it.lines = 1; return { item: it, nonInline, extraBoxes }; }
      if (lines === 1 && !hasNL) { it.x = R(u.l - origin[0]); it.auto = 1; it.w = R(u.r - u.l); }
      else {
        let x0 = r.left + pl, w = r.width - pl - pr;
        if (/nowrap|pre$/.test(cs.whiteSpace)) { it.auto = 1; x0 = u.l; w = u.r - u.l; }
        const pad = Math.max(2, w * 0.012);
        if (al === 'C') { x0 -= pad / 2; } else if (al === 'R') { x0 -= pad; }
        it.x = R(x0 - origin[0]); it.w = R(w + pad); it.al = al;
      }
      it.h = R(Math.max(lines * blockLH, u.b - y));
      return { item: it, nonInline, extraBoxes };
    }

    function visit(el, clip, opMul, depth) {
      if (SKIP.has(el.tagName) || el.id === 'cur' || el.hasAttribute('data-figx-skip')) return [];
      const cs = getComputedStyle(el);
      if (cs.display === 'none') return [];
      const op = pf(cs.opacity); if (op < 0.01) return [];
      const r = el.getBoundingClientRect();
      const hidden = cs.visibility === 'hidden';
      const myOp = opMul * op;
      if (el.tagName === 'svg' || el instanceof SVGSVGElement) {
        if (hidden || !vis(r, clip)) return [];
        const s = serializeSvg(el, clip, origin); if (!s) return [];
        s.op = R(myOp); svgs.push(s); return [{ k: 's', id: s.id, n: name(el), x: s.x, y: s.y, w: s.w, h: s.h, op: R(myOp) }];
      }
      if (el.tagName === 'CANVAS') {
        if (hidden || !vis(r, clip)) return [];
        const id = 'cv' + canvases.length; canvases.push(Object.assign({ id, sel: el.id ? '#' + el.id : null }, box(r)));
        return [Object.assign({ k: 'i', n: name(el), src: '__canvas/' + id + '.png', fit: 'stretch', op: R(myOp) }, box(r))];
      }
      if (el.tagName === 'IMG') {
        if (hidden || !vis(r, clip) || !el.naturalWidth) return [];
        const bw = el.offsetWidth || r.width, bh = el.offsetHeight || r.height, s = r.width / bw;
        const fit = cs.objectFit; const nw = el.naturalWidth, nh = el.naturalHeight;
        const it = Object.assign({ k: 'i', n: name(el) || 'img', src: rel(el.currentSrc || el.src), nat: [nw, nh], op: R(myOp) }, box(r));
        if (fit === 'cover' || fit === 'contain') {
          const k = fit === 'cover' ? Math.max(bw / nw, bh / nh) : Math.min(bw / nw, bh / nh); const dw = nw * k, dh = nh * k;
          const pos = cs.objectPosition.split(' '); const P = (v, free) => /%/.test(v) ? free * pf(v) / 100 : pf(v);
          const ox = P(pos[0] || '50%', bw - dw), oy = P(pos[1] || '50%', bh - dh);
          it.fit = fit; it.crop = [R(dw * s), R(dh * s), R(ox * s), R(oy * s)];
        } else it.fit = 'stretch';
        const f = filt(cs.filter); if (f) it.flt = f; const rr = radii(cs, r.width, r.height); if (rr) it.r = rr;
        if (BM[cs.mixBlendMode]) it.bm = BM[cs.mixBlendMode];
        return [it];
      }
      if (el.namespaceURI === 'http://www.w3.org/2000/svg') return [];
      // clip region for children
      let cclip = clip; let clips = /hidden|clip/.test(cs.overflowX) || /hidden|clip/.test(cs.overflowY);
      let cbox = [r.left, r.top, r.right, r.bottom];
      const cp = cs.clipPath && cs.clipPath.match(/^inset\(([^)]*)\)/);
      if (cp) {
        const v = cp[1].replace(/round.*$/, '').trim().split(/\s+/); const q = [v[0], v[1] ?? v[0], v[2] ?? v[0], v[3] ?? v[1] ?? v[0]];
        const L = (x, len) => /%/.test(x) ? pf(x) / 100 * len : pf(x);
        const ci = [r.left + L(q[3], r.width), r.top + L(q[0], r.height), r.right - L(q[1], r.width), r.bottom - L(q[2], r.height)];
        if (ci[2] - ci[0] < 0.5 || ci[3] - ci[1] < 0.5) return [];
        if (ci[0] > r.left + 0.5 || ci[1] > r.top + 0.5 || ci[2] < r.right - 0.5 || ci[3] < r.bottom - 0.5) { clips = true; cbox = ci; }
      } else if (cs.clipPath && cs.clipPath !== 'none') warn.push('clip-path ' + name(el) + ' ' + cs.clipPath.slice(0, 40));
      if (clips) cclip = inter(clip, cbox);
      if (clips && (cclip[2] <= cclip[0] || cclip[3] <= cclip[1])) return [];
      const p = hidden ? {} : paints(el, cs, r);
      const hasPaint = !!(p.f || p.b || p.sh || p.bb || p.img);
      // text?
      let kids = [];
      const tb = (!hidden && !isInlineEl(cs)) ? textBlock(el, cs, r, cclip, 1) : null;
      const childOp = 1; // children get opacity relative to this element when grouped; resolved below
      if (tb && tb.item) {
        tb.extraBoxes.forEach(b => kids.push(b));
        kids.push(tb.item);
        for (const ch of zsort(tb.nonInline)) kids.push(...visit(ch, cclip, 1, depth + 1));
      } else {
        for (const ch of zsort([...el.children])) kids.push(...visit(ch, cclip, 1, depth + 1));
        if (hidden) { /* children may still be visible */ }
      }
      // filter text items fully outside clip
      kids = kids.filter(k => { if (k.k !== 't') return true; const y0 = k.y + origin[1], y1 = y0 + k.h, x0 = k.x + origin[0], x1 = x0 + (k.w || 0);
        if (x0 > cclip[2] || x1 < cclip[0]) return false; const vh = Math.min(y1, cclip[3]) - Math.max(y0, cclip[1]); return vh > Math.min(k.h * 0.25, 12); });
      const named = typeof el.className === 'string' && el.className.trim() && !el.hasAttribute('data-pseudo');
      const visibleBox = vis(r, clip);
      const blend = BM[cs.mixBlendMode];
      const eff = filt(cs.filter);
      const self = Object.assign({ n: name(el) }, box(clips ? { left: cbox[0], top: cbox[1], width: cbox[2] - cbox[0], height: cbox[3] - cbox[1] } : r), p);
      if (blend) self.bm = blend; if (eff && eff.blur) self.blur = eff.blur;
      const makeGroup = (clips && kids.length) || (hasPaint && kids.length) || (named && kids.length >= 2 && depth > 0) || (kids.length && (op < 0.99 || blend));
      if (makeGroup) {
        const g = Object.assign(self, { k: 'g', clip: clips ? 1 : 0, ch: kids, op: R(opMul * op) });
        if (!visibleBox && !clips) { /* bounds outside view: still fine */ }
        return [g];
      }
      const res = [];
      if (hasPaint && visibleBox) res.push(Object.assign(self, { k: 'b', op: R(myOp) }));
      for (const k of kids) { k.op = R((k.op ?? 1) * myOp); res.push(k); }
      return res;
    }

    const items = [];
    for (const r of roots) items.push(...visit(r, clip0, 1, 0));
    unmaterialize();
    return { items, styles, svgs, canvases, mats, warn };
  };
})();
