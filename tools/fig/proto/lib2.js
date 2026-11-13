var __P = (function () {
  var FAM = { EN: 'Encode Sans Expanded' };
  var T = null, LANG = 'EN', SMAP = {}, COMP = {}, LOGO = null, PFX = 'Prototype/', CA = {};
  function fontFor(st) {
    var fam = FAM.EN;
    return { family: fam, style: st.w >= 700 ? 'Bold' : 'Regular' };
  }
  function paint(ci) {
    var c = T.colors[ci];
    if (!c || c[3] < 0.004) return null;
    return { type: 'SOLID', color: { r: c[0], g: c[1], b: c[2] }, opacity: Math.round(c[3] * 1000) / 1000 };
  }
  function grad(f, w, h) {
    var th = f.a * Math.PI / 180, dx = Math.sin(th), dy = -Math.cos(th), Lh = Math.abs(w * dx) + Math.abs(h * dy) || 1;
    var X0 = w / 2 - dx * Lh / 2, Y0 = h / 2 - dy * Lh / 2, DX = dx * Lh, DY = dy * Lh, D2 = DX * DX + DY * DY || 1;
    var M = [[w * DX / D2, h * DY / D2, -(X0 * DX + Y0 * DY) / D2], [-w * DY / D2, h * DX / D2, 0.5 - (-X0 * DY + Y0 * DX) / D2]];
    return { type: 'GRADIENT_LINEAR', gradientTransform: M, gradientStops: f.s.map(function (s) { var c = T.colors[s[1]] || [0, 0, 0, 0]; return { position: Math.max(0, Math.min(1, s[0])), color: { r: c[0], g: c[1], b: c[2], a: c[3] } }; }) };
  }
  function fillsOf(n) {
    var out = [];
    (n.fills || []).forEach(function (f) { if (f.t === 'S') { var p = paint(f.c); if (p) out.push(p); } else out.push(grad(f, n.w || 100, n.h || 100)); });
    return out;
  }
  function deco(node, n) {
    node.fills = fillsOf(n);
    if (n.st) {
      var p = paint(n.st.c);
      if (p) {
        node.strokes = [p]; node.strokeAlign = 'INSIDE';
        var w = n.st.w;
        if (w[0] === w[1] && w[1] === w[2] && w[2] === w[3]) node.strokeWeight = w[0];
        else { node.strokeTopWeight = w[0]; node.strokeRightWeight = w[1]; node.strokeBottomWeight = w[2]; node.strokeLeftWeight = w[3]; }
        if (n.st.d) node.dashPattern = [4, 4];
      }
    }
    if (n.r) node.cornerRadius = n.r;
    if (n.op != null && n.op < 0.999) node.opacity = n.op;
    if ('clipsContent' in node) node.clipsContent = !!n.clip;
  }
  async function loadFonts() {
    var fams = [FAM.EN, 'Inter'];
    for (var i = 0; i < fams.length; i++) { await figma.loadFontAsync({ family: fams[i], style: 'Regular' }); await figma.loadFontAsync({ family: fams[i], style: 'Bold' }); }
  }
  async function init(tables, lang) {
    T = tables; LANG = lang || 'EN';
    await loadFonts();
    var ts = await figma.getLocalTextStylesAsync();
    SMAP = {};
    ts.forEach(function (s) { SMAP[s.name] = s; });
    return true;
  }
  async function ensureStyles() {
    var made = 0;
    for (var i = 0; i < T.styles.length; i++) {
      var st = T.styles[i], nm = PFX + st.name, s = SMAP[nm];
      if (!s) { s = figma.createTextStyle(); s.name = nm; SMAP[nm] = s; made++; }
      s.fontName = fontFor(st); s.fontSize = Math.max(1, st.s);
      s.lineHeight = st.lh ? { unit: 'PIXELS', value: st.lh } : { unit: 'AUTO' };
      s.letterSpacing = { unit: 'PIXELS', value: st.ls || 0 };
      s.textCase = st.tc === 'U' ? 'UPPER' : 'ORIGINAL';
    }
    var extra = [['Button/Button M', 10.9, 0.87], ['Button/Button S', 9.9, 0.79], ['Label/Caption', 9, 1.6]];
    extra.forEach(function (e) {
      var nm = PFX + e[0], s = SMAP[nm];
      if (!s) { s = figma.createTextStyle(); s.name = nm; SMAP[nm] = s; made++; }
      s.fontName = { family: FAM.EN, style: 'Regular' }; s.fontSize = e[1]; s.lineHeight = { unit: 'PERCENT', value: 120 }; s.letterSpacing = { unit: 'PIXELS', value: e[2] }; s.textCase = 'UPPER';
    });
    return made;
  }
  function sid(i) { return SMAP[PFX + T.styles[i].name]; }
  function xs(name) { return SMAP[PFX + name]; }
  async function text(n, parent) {
    var t = figma.createText();
    parent.appendChild(t);
    var runs = n.runs || [];
    if (!runs.length) { t.remove(); return null; }
    var first = T.styles[runs[0][1]];
    t.fontName = fontFor(first);
    t.characters = runs.map(function (r) { return r[0]; }).join('');
    var a = 0, sameStyle = runs.every(function (r) { return r[1] === runs[0][1]; });
    for (var i = 0; i < runs.length; i++) {
      var r = runs[i], b = a + r[0].length;
      if (b > a) {
        var s = sid(r[1]);
        if (s && !sameStyle) await t.setRangeTextStyleIdAsync(a, b, s.id);
        var p = paint(r[2]);
        t.setRangeFills(a, b, p ? [p] : []);
        if (r[3]) t.setRangeTextDecoration(a, b, 'STRIKETHROUGH');
      }
      a = b;
    }
    if (sameStyle && sid(runs[0][1])) await t.setTextStyleIdAsync(sid(runs[0][1]).id);
    if (n.tst) { var sp = paint(n.tst[0]); if (sp) { t.strokes = [sp]; t.strokeWeight = n.tst[1]; t.strokeAlign = 'OUTSIDE'; } }
    t.name = n.n || 'Text';
    t.textAlignHorizontal = n.al || 'LEFT';
    return t;
  }
  function inAL(p) { return p && 'layoutMode' in p && p.layoutMode !== 'NONE'; }
  function place(node, n, parent) {
    var al = inAL(parent);
    if (n.abs && al) { node.layoutPositioning = 'ABSOLUTE'; node.x = n.ax || 0; node.y = n.ay || 0; return; }
    if (parent.layoutMode === 'GRID' && n.gc) {
      try { node.setGridChildPosition(n.gc[0], n.gc[1]); if (n.gc[2] > 1) node.gridColumnSpan = n.gc[2]; } catch (e) {}
      try { node.gridChildVerticalAlign = CA[parent.id] === 'MAX' ? 'MAX' : (CA[parent.id] === 'CENTER' ? 'CENTER' : 'MIN'); node.gridChildHorizontalAlign = 'MIN'; } catch (e) {}
    }
  }
  function sizeIt(node, n, parent) {
    var al = inAL(parent) && !n.abs;
    var w = Math.max(1, n.w || 1), h = Math.max(1, n.h || 1);
    if (node.type === 'TEXT') {
      if (!al) { node.resize(w, h); node.textAutoResize = 'HEIGHT'; return; }
      if (n.ws === 'HUG') { node.textAutoResize = 'WIDTH_AND_HEIGHT'; return; }
      if (n.ws === 'FILL') { node.layoutSizingHorizontal = 'FILL'; node.textAutoResize = 'HEIGHT'; return; }
      node.resize(w + 1, h); node.textAutoResize = 'HEIGHT'; return;
    }
    if (n.ws === 'FIXED' || !al || n.hs === 'FIXED') node.resize(n.ws === 'HUG' && al ? node.width : w, h);
    if (al) {
      try { node.layoutSizingHorizontal = n.ws || 'FIXED'; } catch (e) { node.layoutSizingHorizontal = 'FIXED'; }
      try { node.layoutSizingVertical = n.hs || 'HUG'; } catch (e) { node.layoutSizingVertical = 'FIXED'; }
    } else if (n.hs === 'HUG' && inAL(node)) { try { node.layoutSizingVertical = 'HUG'; } catch (e) {} }
  }
  function variantOf(set, props) {
    var key = Object.keys(props).map(function (k) { return k + '=' + props[k]; });
    return set.children.find(function (c) { return key.every(function (kv) { return c.name.indexOf(kv) >= 0; }); }) || set.defaultVariant;
  }
  function propKey(set, name) {
    var defs = set.componentPropertyDefinitions;
    return Object.keys(defs).find(function (k) { return k.split('#')[0] === name; });
  }
  async function mk(n, parent) {
    var node = null;
    if (n.t === 'T') {
      node = await text(n, parent);
      if (!node) return null;
      place(node, n, parent); sizeIt(node, n, parent);
      return node;
    }
    if (n.t === 'R') {
      node = figma.createRectangle(); parent.appendChild(node); node.name = n.n || 'Divider';
      node.resize(Math.max(1, n.w), Math.max(0.5, n.h)); node.fills = fillsOf(n);
      place(node, n, parent); sizeIt(node, n, parent); return node;
    }
    if (n.t === 'P') {
      if (!LOGO) return null;
      node = LOGO.createInstance(); parent.appendChild(node); node.name = 'Logo';
      node.rescale(Math.max(1, n.h) / node.height);
      place(node, n, parent); if (inAL(parent) && !n.abs) { node.layoutSizingHorizontal = 'FIXED'; node.layoutSizingVertical = 'FIXED'; }
      return node;
    }
    if (n.t === 'I') {
      var set = COMP[n.c];
      if (!set) return null;
      var comp = set.type === 'COMPONENT_SET' ? variantOf(set, n.v || {}) : set;
      node = comp.createInstance(); parent.appendChild(node);
      var props = {};
      Object.keys(n.txt || {}).forEach(function (k) { var pk = propKey(set, k); if (pk) props[pk] = n.txt[k]; });
      Object.keys(n.bool || {}).forEach(function (k) { var pk = propKey(set, k); if (pk) props[pk] = !!n.bool[k]; });
      if (Object.keys(props).length) node.setProperties(props);
      place(node, n, parent);
      if (n.c === 'Image') { node.resize(Math.max(1, n.w), Math.max(1, n.h)); if (inAL(parent) && !n.abs) { node.layoutSizingHorizontal = n.ws === 'HUG' ? 'FIXED' : (n.ws || 'FIXED'); node.layoutSizingVertical = 'FIXED'; } }
      return node;
    }
    if (n.t === 'F') {
      var L = n.l;
      if (L === 'V' || L === 'H') node = figma.createAutoLayout(L === 'V' ? 'VERTICAL' : 'HORIZONTAL');
      else { node = figma.createFrame(); if (L === 'G') node.layoutMode = 'GRID'; }
      parent.appendChild(node);
      node.name = n.n || 'Frame';
      deco(node, n);
      var pad = n.pad || [0, 0, 0, 0];
      if (L) { node.paddingTop = pad[0]; node.paddingRight = pad[1]; node.paddingBottom = pad[2]; node.paddingLeft = pad[3]; }
      if (L === 'V' || L === 'H') {
        node.itemSpacing = Math.max(0, n.gap || 0);
        node.primaryAxisAlignItems = n.pa || 'MIN';
        var ca = n.ca || 'MIN'; if (ca === 'BASELINE' && L !== 'H') ca = 'MIN';
        node.counterAxisAlignItems = ca;
        if (n.wrap && L === 'H') { node.layoutWrap = 'WRAP'; node.counterAxisSpacing = n.cgap || n.gap || 0; }
      }
      if (L === 'G') {
        var cols = n.gcols.length, rows = Math.max(1, n.grows || 1);
        node.gridColumnCount = cols; node.gridRowCount = rows;
        node.gridColumnSizes = n.gcols.map(function (v) { return { type: 'FLEX', value: Math.max(0.01, v) }; });
        var rs = []; for (var i = 0; i < rows; i++) rs.push({ type: 'HUG' }); node.gridRowSizes = rs;
        node.gridColumnGap = n.cg || 0; node.gridRowGap = n.rg || 0;
        CA[node.id] = n.ca;
      }
      place(node, n, parent);
      node.resize(Math.max(1, n.w), Math.max(1, n.h));
      if (inAL(parent) && !n.abs) {
        try { node.layoutSizingHorizontal = n.ws || 'FIXED'; } catch (e) { node.layoutSizingHorizontal = 'FIXED'; }
      }
      var ch = n.ch || [];
      for (var j = 0; j < ch.length; j++) await mk(ch[j], node);
      if (inAL(parent) && !n.abs) {
        try { node.layoutSizingVertical = n.hs || 'HUG'; } catch (e) { node.layoutSizingVertical = 'FIXED'; }
      } else if (L && n.hs === 'HUG') { try { node.layoutSizingVertical = 'HUG'; } catch (e) {} }
      return node;
    }
    return null;
  }
  async function findComps(pageId) {
    var pg = await figma.getNodeByIdAsync(pageId);
    COMP = {};
    if (pg) { await pg.loadAsync(); pg.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }).forEach(function (c) { if (c.type === 'COMPONENT_SET' || c.parent.type !== 'COMPONENT_SET') COMP[c.name] = c; }); }
    LOGO = await figma.getNodeByIdAsync('82:205');
    return Object.keys(COMP);
  }
  async function addSecs(F, secs) {
    for (var i = 0; i < secs.length; i++) {
      var s = secs[i], node = await mk(s, F);
      if (node) { node.layoutSizingHorizontal = 'FILL'; if (s.hs === 'FIXED') { node.resize(1440, s.minh || s.h); node.layoutSizingVertical = 'FIXED'; } }
    }
  }
  function newPage(title, page, x, y) {
    var F = figma.createAutoLayout('VERTICAL');
    page.appendChild(F);
    F.name = title; F.x = x; F.y = y;
    F.fills = [{ type: 'SOLID', color: { r: 29 / 255, g: 29 / 255, b: 29 / 255 } }];
    F.resize(1440, 900); F.primaryAxisSizingMode = 'AUTO'; F.counterAxisSizingMode = 'FIXED'; F.clipsContent = true;
    return F;
  }
  return { init: init, ensureStyles: ensureStyles, mk: mk, addSecs: addSecs, newPage: newPage, findComps: findComps, xs: xs, fontFor: fontFor, paint: paint, comps: function () { return COMP; }, setComp: function (k, v) { COMP[k] = v; }, fam: FAM, T: function () { return T; } };
})();
