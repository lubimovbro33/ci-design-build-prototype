// In-page extractor: DOM (rendered at 1440) -> compact layout tree for the Figma builder.
window.__X = function(rootSel, opts){
  opts = opts || {};
  const STY = [], STYK = {}, COL = [], COLK = {};
  const R = v => Math.round(v * 10) / 10;
  const pf = v => parseFloat(v) || 0;
  function rgba(c){ const m = c && c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); const a = p.length > 3 ? p[3] : 1; if (a < 0.004) return null; return [R(p[0]/255*1000)/1000, R(p[1]/255*1000)/1000, R(p[2]/255*1000)/1000, R(a*1000)/1000]; }
  function colIdx(c){ const k = JSON.stringify(c); if (!(k in COLK)) { COLK[k] = COL.length; COL.push(c); } return COLK[k]; }
  function styIdx(cs, role){
    const fam = /Trade Gothic/i.test(cs.fontFamily) ? 'TG' : (/mono/i.test(cs.fontFamily) ? 'M' : 'S');
    const w = (parseInt(cs.fontWeight) || 400) >= 600 ? 700 : 400;
    const fs = R(pf(cs.fontSize)), lh = cs.lineHeight === 'normal' ? 0 : R(pf(cs.lineHeight)), ls = R(pf(cs.letterSpacing) || 0);
    const tc = cs.textTransform === 'uppercase' ? 'U' : (cs.textTransform === 'lowercase' ? 'L' : '');
    const it = cs.fontStyle === 'italic' ? 1 : 0;
    const k = [fam, w, fs, lh, ls, tc, it].join('|');
    if (!(k in STYK)) { STYK[k] = STY.length; STY.push({f: fam, w, s: fs, lh, ls, tc, it, role: role || ''}); }
    else if (role && !STY[STYK[k]].role) STY[STYK[k]].role = role;
    return STYK[k];
  }
  const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = el.getBoundingClientRect(); return r.width > 0.5 || r.height > 0.5 || cs.display === 'contents'; };
  const INLINE = new Set(['B','STRONG','I','EM','SMALL','SPAN','BR','A','SUP','SUB','U','LABEL','CODE']);
  function boxy(cs){ return !!(rgba(cs.backgroundColor) || pf(cs.borderTopWidth) || pf(cs.borderRightWidth) || pf(cs.borderBottomWidth) || pf(cs.borderLeftWidth) || pf(cs.paddingTop) || pf(cs.paddingLeft) || (cs.backgroundImage && cs.backgroundImage !== 'none')); }
  function inlineOnly(el){
    for (const c of el.childNodes){
      if (c.nodeType === 3) continue;
      if (c.nodeType !== 1) continue;
      if (!vis(c) && c.tagName !== 'BR') continue;
      if (!INLINE.has(c.tagName)) return false;
      const cs = getComputedStyle(c);
      if (cs.display !== 'inline' && c.tagName !== 'BR') return false;
      if (boxy(cs) || cs.position === 'absolute') return false;
      if (!inlineOnly(c)) return false;
    }
    return true;
  }
  function hasText(el){ return (el.innerText || el.textContent || '').trim().length > 0; }
  function role(el){
    const c = el.classList, t = el.tagName;
    if (/^H[1-6]$/.test(t)) return t;
    for (const k of ['eyebrow','lead','stat','quote','cite','display','k','n','small','pill']) if (c.contains(k)) return k[0].toUpperCase() + k.slice(1);
    if (el.closest('.body')) return 'Body';
    if (t === 'LABEL') return 'Label';
    return 'Text';
  }
  const ROLE_NAME = {H1:'H1',H2:'H2',H3:'H3',H4:'H4',Eyebrow:'Eyebrow',Lead:'Lead',Stat:'Stat',Quote:'Quote',Cite:'Cite',Display:'Display',K:'Label',N:'Number',Small:'Small',Pill:'Pill',Body:'Paragraph',Label:'Label',Text:'Text'};
  function runsOf(el){
    const runs = [];
    function rec(n){
      if (n.nodeType === 3){ const cs = getComputedStyle(n.parentElement); if (!vis(n.parentElement)) return; let s = n.textContent.replace(/[\s ]+/g, m => m.includes(' ') ? ' ' : ' '); if (s) runs.push([s, styIdx(cs, role(el)), colIdx(rgba(cs.color) || [0,0,0,0]), cs.textDecorationLine === 'line-through' ? 1 : 0]); return; }
      if (n.nodeType !== 1) return;
      if (n.tagName === 'BR'){ runs.push(['\n', null, null, 0]); return; }
      if (!vis(n)) return;
      for (const c of n.childNodes) rec(c);
    }
    for (const c of el.childNodes) rec(c);
    // collapse spaces around line breaks + trim
    let out = [];
    for (const r of runs){ if (r[1] === null){ if (out.length){ out[out.length-1][0] = out[out.length-1][0].replace(/ +$/,''); out[out.length-1][0] += '\n'; } continue; } out.push(r); }
    // merge adjacent identical styles, trim leading spaces after \n
    const m = [];
    for (const r of out){ const last = m[m.length-1]; if (last && last[1] === r[1] && last[2] === r[2] && last[3] === r[3]) last[0] += r[0]; else m.push(r.slice()); }
    for (let i = 0; i < m.length; i++){ m[i][0] = m[i][0].replace(/ {2,}/g, ' '); if (i === 0 || /\n$/.test(m[i-1][0])) m[i][0] = m[i][0].replace(/^ +/, ''); m[i][0] = m[i][0].replace(/ +\n/g, '\n').replace(/\n +/g, '\n'); }
    if (m.length){ m[m.length-1][0] = m[m.length-1][0].replace(/[ \n]+$/, ''); }
    return m.filter(r => r[0].length);
  }
  function gradientFills(bi, w, h){
    const out = []; if (!bi || bi === 'none') return out;
    const re = /linear-gradient\((.*?)\)(?=,\s*(?:linear|url|radial)|$)/g; let m;
    while ((m = re.exec(bi))){
      let parts = m[1].split(/,(?![^(]*\))/).map(s => s.trim()); let ang = 180;
      if (/deg$/.test(parts[0])) { ang = parseFloat(parts[0]); parts.shift(); } else if (/^to /.test(parts[0])) { const d = parts.shift(); ang = {'to bottom':180,'to top':0,'to right':90,'to left':270}[d] || 180; }
      const stops = parts.map((p, i) => { const cm = p.match(/rgba?\([^)]+\)|#[0-9a-f]+/i); const pm = p.match(/(-?[\d.]+)%\s*$/); return [pm ? parseFloat(pm[1]) / 100 : i / Math.max(1, parts.length - 1), rgba(cm ? (cm[0].startsWith('#') ? hex(cm[0]) : cm[0]) : 'rgba(0,0,0,0)') || [0,0,0,0]]; });
      out.push({t:'L', a: ang, s: stops});
    }
    return out;
  }
  function hex(h){ h = h.replace('#',''); if (h.length === 3) h = h.split('').map(x=>x+x).join(''); return 'rgb(' + parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) + ',' + parseInt(h.slice(4,6),16) + ')'; }
  function deco(el, cs, node, rect){
    const f = []; const bg = rgba(cs.backgroundColor); if (bg) f.push({t:'S', c: colIdx(bg)});
    f.push(...gradientFills(cs.backgroundImage, rect.width, rect.height).map(g => ({t:'L', a:g.a, s:g.s.map(s => [s[0], colIdx(s[1])])})));
    if (f.length) node.fills = f;
    const bw = [pf(cs.borderTopWidth), pf(cs.borderRightWidth), pf(cs.borderBottomWidth), pf(cs.borderLeftWidth)];
    if (bw.some(x => x > 0)){ const sides = ['Top','Right','Bottom','Left']; let bc = null; for (let i=0;i<4;i++) if (bw[i] > 0){ bc = rgba(cs['border'+sides[i]+'Color']); if (bc) break; } if (bc) node.st = {c: colIdx(bc), w: bw.map(R), d: cs.borderTopStyle === 'dashed' || cs.borderLeftStyle === 'dashed' ? 1 : 0}; }
    const rr = pf(cs.borderTopLeftRadius); if (rr) node.r = Math.min(R(rr), R(Math.min(rect.width, rect.height) / 2));
    const op = pf(cs.opacity); if (cs.opacity !== '' && op < 0.999) node.op = R(op * 100) / 100;
    if (cs.overflow === 'hidden' || cs.overflowX === 'hidden') node.clip = 1;
  }
  function padOf(cs){ return [pf(cs.paddingTop), pf(cs.paddingRight), pf(cs.paddingBottom), pf(cs.paddingLeft)].map(R); }
  function nm(el){
    const map = {g12:'Grid', stack:'Stack', btns:'Buttons', body:'Body', index:'Index', row:'Row', card:'Card', steps:'Steps', principles:'Principles', elements:'Elements', timeline:'Timeline', filters:'Filters', journey:'Journey', kv:'Key values', form:'Form', mform:'Form', faq:'FAQ', cols:'Columns', fine:'Fine print', lbl:'Caption block', 'top-lbl':'Top labels', overlap:'Panel', 'big-q':'Questions', marquee:'Marquee', strip:'Strip', rubric:'Rubric', f:'Field', phone:'Phone', actions:'Actions', meta:'Meta', svc:'Services', links:'Links', foot:'Foot', bar:'Bar', left:'Left', right:'Right', wm:'Wordmark', quote:'Quote'};
    for (const c of el.classList) if (map[c]) return map[c];
    const t = el.tagName.toLowerCase();
    return ({details:'FAQ item', summary:'Question', dl:'Key values', ul:'List', li:'Item', nav:'Nav', form:'Form', label:'Field', blockquote:'Quote', figure:'Figure', a:'Link'})[t] || (el.classList[0] ? el.classList[0] : 'Frame');
  }
  // ---------- main walker ----------
  function walk(el, pr){
    if (el.nodeType !== 1) return null;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return null;
    if (el.matches('.tag, .proto, script, style, template, [hidden]')) return null;
    if (cs.display === 'contents'){ const ch = [...el.children].map(c => walk(c, pr)).filter(Boolean); return ch.length === 1 ? ch[0] : (ch.length ? {t:'F', n:nm(el), contents: ch} : null); }
    const rect = el.getBoundingClientRect();
    if (rect.width < 0.5 && rect.height < 0.5) return null;
    const box = {x: R(rect.left + scrollX), y: R(rect.top + scrollY), w: R(rect.width), h: R(rect.height)};
    const abs = (cs.position === 'absolute' || cs.position === 'fixed');
    let node;
    // components
    if (el.tagName === 'IMG'){
      node = {t:'P', n:'Logo', src: (el.getAttribute('alt') || 'img'), ...box};
    } else if (el.classList.contains('btn')){
      const light = !!el.closest('.light, .overlap:not(.dark)') && !el.closest('.overlap.dark');
      node = {t:'I', c:'Button', v:{Style: el.classList.contains('txt') ? 'Text' : (el.classList.contains('solid') ? 'Solid' : 'Outline'), Size: el.classList.contains('sm') ? 'S' : 'M', Theme: light ? 'Light' : 'Dark'}, txt:{Label: el.textContent.replace(/\s+/g,' ').trim()}, ...box};
    } else if (el.classList.contains('img') && !el.querySelector(':scope > *')){
      const cap = el.classList.contains('nocap') ? '' : (el.getAttribute('data-cap') || '');
      node = {t:'I', c:'Image', v:{}, txt: cap ? {Caption: cap} : {}, bool:{'Show caption': !!cap}, ...box};
    } else if (el.tagName === 'HR'){
      node = {t:'R', n:'Divider', ...box, fills:[{t:'S', c: colIdx(rgba(cs.backgroundColor) || rgba(cs.borderTopColor) || [0.5,0.5,0.5,0.3])}]};
    } else if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)){
      node = {t:'F', n: el.tagName === 'TEXTAREA' ? 'Textarea' : (el.tagName === 'SELECT' ? 'Select' : 'Input'), l:'H', ...box, pad: padOf(cs), ca:'CENTER'};
      deco(el, cs, node, rect);
      const ph = el.tagName === 'SELECT' ? (el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : '') : (el.value || el.getAttribute('placeholder') || '');
      if (ph) node.ch = [{t:'T', n:'Placeholder', runs:[[ph, styIdx(cs,'Field'), colIdx(rgba(cs.color) || [0.6,0.6,0.6,1]).valueOf(), 0]], ...box, ws:'FILL', al:'LEFT', ph:1}];
      if (el.tagName === 'SELECT') (node.ch = node.ch || []).push({t:'T', n:'Chevron', runs:[['▾', styIdx(cs,'Field'), colIdx(rgba(cs.color) || [0.6,0.6,0.6,1]), 0]], x:box.x, y:box.y, w:10, h:box.h, ws:'HUG'});
    } else if (el.childElementCount === 0 || inlineOnly(el)){
      if (!hasText(el) && !boxy(cs)) return null;
      const runs = runsOf(el);
      if (!runs.length && !boxy(cs)) return null;
      const tn = {t:'T', n: ROLE_NAME[role(el)] || 'Text', runs, ...box, al: ({center:'CENTER', right:'RIGHT', end:'RIGHT', justify:'JUSTIFIED'})[cs.textAlign] || 'LEFT'};
      if (pf(cs.webkitTextStrokeWidth) > 0){ const sc = rgba(cs.webkitTextStrokeColor); if (sc) tn.tst = [colIdx(sc), R(pf(cs.webkitTextStrokeWidth))]; }
      // pseudo ::after content on summary (faq +)
      if (el.tagName === 'SUMMARY'){ const a = getComputedStyle(el, '::after'); if (a.content && a.content !== 'none'){ node = {t:'F', n:'Question', l:'H', ...box, pa:'SPACE_BETWEEN', ca:'MIN', gap: pf(cs.columnGap) || 20, ch:[Object.assign(tn, {ws:'FILL'}), {t:'T', n:'Toggle', runs:[[a.content.replace(/^"|"$/g,''), styIdx(a,'Toggle'), colIdx(rgba(a.color)), 0]], ...box, ws:'HUG'}]}; } }
      if (!node){
        if (boxy(cs) || el.classList.contains('pill')){
          node = {t:'F', n: nm(el) === 'Frame' ? (el.classList.contains('pill') ? 'Pill' : 'Chip') : nm(el), l:'H', ...box, pad: padOf(cs), ca:'CENTER', pa: cs.textAlign === 'center' ? 'CENTER' : 'MIN', ch: runs.length ? [Object.assign(tn, {ws:'HUG'})] : []};
          deco(el, cs, node, rect);
        } else node = tn;
      }
    } else {
      // container
      node = {t:'F', n: nm(el), ...box};
      deco(el, cs, node, rect);
      const pad = padOf(cs); if (pad.some(v => v)) node.pad = pad;
      const kids = [];
      for (const c of el.childNodes){
        if (c.nodeType === 3){ const s = c.textContent.replace(/\s+/g,' ').trim(); if (s){ const rg = document.createRange(); rg.selectNodeContents(c); const rr = rg.getBoundingClientRect(); kids.push({t:'T', n:'Text', runs:[[s, styIdx(cs, role(el)), colIdx(rgba(cs.color) || [0,0,0,1]), 0]], x:R(rr.left+scrollX), y:R(rr.top+scrollY), w:R(rr.width), h:R(rr.height), al:'LEFT'}); } continue; }
        const k = walk(c, el); if (!k) continue;
        if (k.contents) kids.push(...k.contents); else kids.push(k);
      }
      // ::after summary / journey icons etc. ignored
      node.ch = kids;
      const disp = cs.display;
      const flow = kids.filter(k => !k.abs);
      if (/flex/.test(disp)){
        const row = !/column/.test(cs.flexDirection);
        node.l = row ? 'H' : 'V';
        node.gap = R(pf(row ? cs.columnGap : cs.rowGap));
        if (cs.flexWrap === 'wrap'){ node.wrap = 1; node.cgap = R(pf(row ? cs.rowGap : cs.columnGap)); }
        node.pa = ({center:'CENTER', 'flex-end':'MAX', end:'MAX', 'space-between':'SPACE_BETWEEN', right:'MAX'})[cs.justifyContent] || 'MIN';
        node.ca = ({center:'CENTER', 'flex-end':'MAX', end:'MAX', baseline:'BASELINE', 'last baseline':'BASELINE'})[cs.alignItems] || 'MIN';
        node.stretch = (cs.alignItems === 'normal' || cs.alignItems === 'stretch') ? 1 : 0;
        node.grow = [...el.children].filter(c => vis(c)).map(c => pf(getComputedStyle(c).flexGrow));
      } else if (/grid/.test(disp)){
        const tracks = cs.gridTemplateColumns.split(' ').map(pf).filter(v => v > 0);
        const cg = R(pf(cs.columnGap)), rg = R(pf(cs.rowGap));
        if (tracks.length <= 1){ node.l = 'V'; node.gap = rg; node.stretch = 1; }
        else {
          node.l = 'G'; node.gcols = tracks.map(R); node.cg = cg; node.rg = rg;
          // place children by geometry
          const x0 = box.x + pf(cs.paddingLeft) + pf(cs.borderLeftWidth);
          const starts = []; let acc = x0; for (const t of tracks){ starts.push(acc); acc += t + cg; }
          const ends = starts.map((s,i) => s + tracks[i]);
          const rowsY = [];
          for (const k of flow){
            let cs0 = 0, best = 1e9; starts.forEach((s,i) => { const d = Math.abs(k.x - s); if (d < best){ best = d; cs0 = i; } });
            let ce = cs0, b2 = 1e9; ends.forEach((e,i) => { const d = Math.abs(k.x + k.w - e); if (i >= cs0 && d < b2){ b2 = d; ce = i; } });
            k.gc = [0, cs0, ce - cs0 + 1];
            let ri = rowsY.findIndex(y => Math.abs(y - k.y) < 3); if (ri < 0){ rowsY.push(k.y); ri = rowsY.length - 1; } k.gc[0] = ri;
          }
          // normalise row order by y
          const order = rowsY.map((y,i) => [y,i]).sort((a,b) => a[0]-b[0]).map(p => p[1]);
          for (const k of flow){ k.gc[0] = order.indexOf(k.gc[0]); }
          node.grows = rowsY.length;
          node.ca = ({center:'CENTER', end:'MAX', 'flex-end':'MAX'})[cs.alignItems] || 'MIN';
        }
      } else {
        node.l = 'V'; node.block = 1;
      }
      if (cs.textAlign === 'center' && node.l === 'V') node.ca = 'CENTER';
    }
    if (abs) node.abs = 1;
    if (el.matches('section, footer, header')){ const tg = el.querySelector(':scope > .tag'); if (tg) node.label = tg.textContent.trim(); }
    if (el.matches('.hero')){ const b = getComputedStyle(el, '::before'); const g = gradientFills(b.backgroundImage, rect.width, rect.height).map(g => ({t:'L', a:g.a, s:g.s.map(s => [s[0], colIdx(s[1])])})); if (g.length) node.fills = (node.fills || []).concat(g); }
    // min-height (hero)
    if (pf(cs.minHeight) > 0) node.minh = R(pf(cs.minHeight));
    if (el.matches('section, footer') && !node.n.match(/Section/)) node.sec = 1;
    // text max-width marker
    if (node.t === 'T' || node.t === 'F'){ const mw = cs.maxWidth; if (mw && mw !== 'none') node.mw = R(pf(mw)); }
    node.el = el.tagName + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
    return node;
  }
  const roots = [...document.querySelectorAll(rootSel)];
  const tree = roots.map(r => walk(r, null)).filter(Boolean);
  return {tree, styles: STY, colors: COL};
};
