/* CI · inner pages (15.11.2026). Vanilla, no deps. One script for every page after the homepage and About.
   Films: a pinned stage scrubbed by the scroll (.film[data-fig]) — "cover": the photograph closes into the site's one white line;
   "steps": a journey on the line, the square walks from mark to mark. Times are in "screens" (data-len, data-k="in0 in1 out0 out1").
   "key": the line opens into a key — one blank, six cuts, a step each; no two keys are cut alike (Portfolio, 15.11).
   "many": hundreds of strokes become the one line (a project's «Why the Details Matter», 15.11).
   "wall": the cover photograph grows smaller and hangs on the wall as a picture, the wall text beside it («Collectors Home», 15.11).
   Flow: blocks reveal once as they arrive, photographs open out of a line (.bnd), rows open (.qa), chips filter lists, the form checks itself.
   The shell (cursor, smooth wheel, header logo, chapter rail, footer street) is the homepage's. */
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var qs = function(s, r){ return (r || document).querySelector(s); };
  var qsa = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
  function c01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sg(p, a, b){ return c01((p - a) / (b - a)); }
  function eo(t){ return 1 - Math.pow(1 - t, 3); }
  function eio(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function sm(a, b, x){ var t = c01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v){ return Math.round(v * 10) / 10; }
  var mm = window.matchMedia;
  var reduced = mm && mm('(prefers-reduced-motion: reduce)').matches;
  var coarse = mm && mm('(pointer: coarse)').matches;
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ------------------------------------------------------------------ typograph: no hanging short words, the last two words tied */
  (function(){
    var SHORT; try { SHORT = new RegExp('(?<=^|[\\s(“"])(a|an|the|of|to|in|on|at|by|for|and|or|but|is|it|we|our|your|you|with|from|as|so|no|not|one|CI|—|–|\\+)\\s+(?=\\S)', 'gi'); } catch (e) { return; }
    qsa('.film p.t34, .film .t20s p, .film p.t20, .bk p.t34, .bk .t20s p, .bk .dsc p, .bk .ain p, .fin p.t34').forEach(function(n){
      var tw = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), t, last = null;
      while ((t = tw.nextNode())){ t.nodeValue = t.nodeValue.replace(SHORT, function(m, w){ return w + '\u00A0'; }).replace(/\s+(—|–)/g, '\u00A0$1'); if (/\S/.test(t.nodeValue)) last = t; }
      if (last) last.nodeValue = last.nodeValue.replace(/\s+(\S+\s*)$/, '\u00A0$1');
    });
  })();

  /* ------------------------------------------------------------------ text moments: the words come one after another; titles focus in through a blur */
  function split(node){
    var out = [];
    (function walk(n){
      [].slice.call(n.childNodes).forEach(function(c){
        if (c.nodeType === 3){
          var parts = c.nodeValue.split(/([ \t\n\r]+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){ if (!p) return; if (/^[ \t\n\r]+$/.test(p)){ frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = p; frag.appendChild(w); out.push(w); });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(node);
    return out;
  }
  function Moment(node){
    var o = {el: node, words: [], kin: -1, kout: -1, blur: /\bt60\b|\bt111\b/.test(node.className), box: !!node.querySelector('a, .v')};
    var k = (node.getAttribute('data-k') || '0 0 99 99').trim().split(/\s+/).map(parseFloat);
    o.a = k[0]; o.b = k[1]; o.c = k[2]; o.d = k[3];
    if (!o.box) o.words = split(node);
    return o;
  }
  function setMoment(o, kin, kout){
    kin = Math.round(kin * 1000) / 1000; kout = Math.round(kout * 1000) / 1000;
    if (kin === o.kin && kout === o.kout) return;
    var st = o.el.style;
    if (kout !== o.kout || (kin > 0) !== (o.kin > 0)){
      var vis = kin > 0 && kout < 1;
      st.visibility = vis ? 'visible' : 'hidden';
      st.opacity = vis ? (1 - eo(kout)).toFixed(3) : 0;
      st.transform = kout > 0 ? 'translateY(' + (-eo(kout) * 18).toFixed(1) + 'px)' : '';
      st.filter = kout > 0 && o.blur ? 'blur(' + (kout * 8).toFixed(1) + 'px)' : '';
    }
    if (kin !== o.kin){
      if (o.box){ if (kout <= 0){ st.opacity = eo(kin).toFixed(3); st.transform = kin >= 1 ? '' : 'translateY(' + ((1 - eo(kin)) * 26).toFixed(1) + 'px)'; } }
      else {
        var N = o.words.length, S = Math.min(1.4, .25 + N * .035);
        for (var j = 0; j < N; j++){
          var q = c01(kin * (1 + S) - (j / Math.max(1, N - 1)) * S), e = eo(q), w = o.words[j].style;
          w.opacity = e.toFixed(3);
          w.transform = e >= 1 ? '' : 'translateY(' + ((1 - e) * .5).toFixed(3) + 'em)';
          if (o.blur) w.filter = e >= 1 ? '' : 'blur(' + ((1 - e) * 9).toFixed(1) + 'px)';
        }
      }
    }
    o.kin = kin; o.kout = kout;
  }
  function runMoment(o, q){ setMoment(o, sg(q, o.a, o.b), o.c >= 90 ? 0 : sg(q, o.c, o.d)); }

  /* ------------------------------------------------------------------ the shell: cursor (the buttons' square) */
  var cur = $('cur');
  if (cur && !coarse){
    var tx = 0, ty = 0, curLab = qs('.cl', cur), cSq = qs('.cd', cur), CS = {x: 0, y: 0, s: 8, r: 0}, cTgt = null, cDown = false, cFirst = true, pvx = 0;
    var PRESS = 'a,button,[data-cursor]';
    window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; if (cFirst){ cFirst = false; CS.x = tx; CS.y = ty; } cur.classList.add('on'); });
    document.documentElement.addEventListener('mouseleave', function(){ cur.classList.remove('on'); });
    window.addEventListener('pointerdown', function(){ cDown = true; }); window.addEventListener('pointerup', function(){ cDown = false; });
    document.addEventListener('pointerover', function(e){ var t = e.target.closest && e.target.closest(PRESS); if (!t) return; cTgt = t; cur.classList.add('link');
      var l = t.getAttribute('data-cursor'); if (l){ curLab.textContent = l; cur.classList.add('lab'); } });
    document.addEventListener('pointerout', function(e){ var t = e.target.closest && e.target.closest(PRESS); if (!t) return; var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(PRESS);
      if (to === t) return; if (cTgt === t) cTgt = null; cur.classList.remove('link', 'lab'); });
    (function curLoop(){
      var x = tx, y = ty, sz = 8, dock = null, lab = cur.classList.contains('lab');
      if (lab) sz = 72;
      else if (cTgt && cTgt.isConnected){ dock = cTgt.querySelector(':scope > .sqd'); if (dock){ var r = dock.getBoundingClientRect(); if (r.width){ x = r.left + r.width / 2; y = r.top + r.height / 2; sz = r.width; } else dock = null; } if (!dock) sz = 16; }
      if (cDown) sz *= .7;
      var k = dock ? .2 : .24, nx = CS.x + (x - CS.x) * k, v = nx - CS.x; CS.x = nx; CS.y += (y - CS.y) * k; CS.s += (sz - CS.s) * .2;
      pvx += (Math.max(-18, Math.min(18, v * 1.4)) - pvx) * .15; CS.r = dock || lab ? CS.r * .8 : pvx;
      cSq.style.width = cSq.style.height = CS.s.toFixed(2) + 'px';
      cSq.style.transform = 'translate3d(' + (CS.x - CS.s / 2).toFixed(1) + 'px,' + (CS.y - CS.s / 2).toFixed(1) + 'px,0) rotate(' + CS.r.toFixed(2) + 'deg)';
      requestAnimationFrame(curLoop); })();
  }

  /* the header button's label rolls through a blur on hover (the homepage's) */
  qsa('.hdr .cta-blk .t').forEach(function(t){
    var lines = t.innerHTML.split(/<br\s*\/?>/i).map(function(l){ return l.replace(/<[^>]*>/g, ''); });
    t.parentNode.setAttribute('aria-label', lines.join(' '));
    t.innerHTML = lines.map(function(l, i){ return '<span class="bl" style="--i:' + i + '"><span class="bo" aria-hidden="true">' + l + '</span><span class="bn" aria-hidden="true">' + l + '</span></span>'; }).join('');
  });

  /* smooth wheel (lerp), as on the homepage */
  var smw = {t: 0, c: 0, on: false};
  if (!reduced && !coarse){
    window.addEventListener('wheel', function(e){
      if (e.ctrlKey) return; e.preventDefault();
      if (document.documentElement.classList.contains('mn-open')) return;
      var d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      d = Math.max(-140, Math.min(140, d));
      if (!smw.on){ smw.on = true; smw.c = smw.t = window.scrollY; }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      smw.t = Math.max(0, Math.min(max, smw.t + d * 1.15));
    }, {passive: false});
    window.addEventListener('scroll', function(){ if (!smw.on || Math.abs(window.scrollY - smw.c) > 2){ smw.c = smw.t = window.scrollY; smw.on = false; } });
  }
  function smoothStep(){ if (!smw.on) return; var d = smw.t - smw.c; if (Math.abs(d) < .3){ smw.on = false; return; } smw.c += d * .11; smw.c = Math.round(smw.c * 100) / 100; window.scrollTo(0, smw.c); smw.c = window.scrollY; }
  function smoothTo(y){ if (reduced || coarse){ window.scrollTo(0, y); return; } smw.on = true; smw.c = window.scrollY; smw.t = y; }

  /* the logo eases down to ×0.609 over the first half-screen, as on the homepage */
  var wmCell = $('wmCell'), LOGO_S = 81 / 133, logoK = -1;
  function updateLogo(y, vh){
    if (!wmCell) return;
    var p = c01(y / (vh * .5)), t = 1 - (1 - LOGO_S) * eio(p);
    if (logoK < 0) logoK = t; else logoK += (t - logoK) * .2;
    if (Math.abs(t - logoK) < .0005) logoK = t;
    var v = logoK.toFixed(4); if (v !== wmCell.__k){ wmCell.__k = v; wmCell.style.transform = 'scale(' + v + ')'; }
  }

  /* chapter rail: lit up to where the reader is; each item reads what is under it (photos and dark → white, light cards → ink) */
  var chap = $('chap'), chapLinks = chap ? qsa('a', chap) : [], chapSecs = chapLinks.map(function(a){ return $(a.getAttribute('data-ch')); }), chapOn = -1, chapN = 0;
  function updateChap(y, vh){
    if (!chap) return;
    var ftr = $('footer'), ftop = ftr ? ftr.getBoundingClientRect().top : 1e9;
    /* a block whose cards run to its very foot (CI Turnkey's Fit grid) is seen without the rail while it holds the screen: the rail
       would lie on the last line of its cards (17.11 21:38 — «не потрібно лишати відступи… карточки мають прилягати») */
    var held = false; for (var h = 0; h < NORAIL.length; h++){ var nr = NORAIL[h].getBoundingClientRect(); if (nr.top < vh * .5 && nr.bottom > vh - 44 && nr.bottom < vh * 1.5){ held = true; break; } }
    chap.classList.toggle('show', y > vh * .6 && ftop > vh * .92 && !held);
    var idx = 0, tops = chapSecs.map(function(s){ return s.getBoundingClientRect().top + y; });
    for (var i = 0; i < tops.length; i++) if (y + 2 >= tops[i]) idx = i;
    var next = idx + 1 < tops.length ? tops[idx + 1] : document.documentElement.scrollHeight - vh;
    var p = c01((y - tops[idx]) / Math.max(1, next - tops[idx]));
    if (idx !== chapOn){ chapOn = idx; chapLinks.forEach(function(a, k){ a.classList.toggle('on', k === idx); }); }
    chapLinks.forEach(function(a, k){ var v = k < idx ? 1 : k > idx ? 0 : p, s = v.toFixed(4); if (a.__p !== s){ a.__p = s; a.style.setProperty('--p', s); a.classList.toggle('st', v > 0); } });
  }
  function rgbL(s){ var m = s && s.match(/[\d.]+/g); if (!m || (m.length > 3 && +m[3] < .5)) return -1; return (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; }
  function under(x, y){
    var stk = document.elementsFromPoint(x, y);
    for (var i = 0; i < stk.length; i++){
      var e = stk[i]; if ((chap && chap.contains(e)) || (cur && cur.contains(e))) continue;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .5) continue;
      var t = e.tagName; if (t === 'IMG' || t === 'VIDEO') return 0; if (t === 'CANVAS') continue;
      var l = rgbL(cs.backgroundColor); if (l >= 0) return l;
    }
    return 0;
  }
  var NORAIL = qsa('[data-norail]');
  /* the header over a light card: the logo and the menu square take ink, the white button gets a hairline — read, like the rail, from
     what lies under them (the Fit grid's cards now run to the very top of the block, under the header) */
  var hdrEl = $('hdr'), hdrMark = hdrEl && qs('.wm img', hdrEl), hdrMenu = hdrEl && qs('.menu-sq', hdrEl), hdrN = 0;
  function underHdr(x, y){
    var stk = document.elementsFromPoint(x, y);
    for (var i = 0; i < stk.length; i++){
      var e = stk[i]; if (hdrEl.contains(e) || (chap && chap.contains(e)) || (cur && cur.contains(e))) continue;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .5) continue;
      var t = e.tagName; if (t === 'IMG' || t === 'VIDEO') return 0; if (t === 'CANVAS') continue;
      var l = rgbL(cs.backgroundColor); if (l >= 0) return l;
    }
    return 0;
  }
  function hdrInk(){
    if (!hdrEl || !hdrMark || !hdrMenu || (hdrN++ & 3)) return;
    var a = hdrMark.getBoundingClientRect(), b = hdrMenu.getBoundingClientRect();
    var l = a.width ? underHdr(a.left + a.width / 2, a.top + a.height / 2) > .6 : false, r = b.width ? underHdr(b.left + b.width / 2, b.top + b.height / 2) > .6 : false;
    if (l !== hdrEl._l){ hdrEl._l = l; hdrEl.classList.toggle('lt-l', l); }
    if (r !== hdrEl._r){ hdrEl._r = r; hdrEl.classList.toggle('lt-r', r); }
  }
  function chapInk(){
    if (!chapLinks.length || (chapN++ & 3)) return; var y = window.innerHeight - 18;
    for (var i = 0; i < chapLinks.length; i++){ var r = chapLinks[i].getBoundingClientRect(); if (!r.width) continue; var lt = under(r.left + Math.min(r.width / 2, 60), y) > .6; if (lt !== chapLinks[i]._lt){ chapLinks[i]._lt = lt; chapLinks[i].classList.toggle('lt', lt); } }
  }


  /* ================================================================== the frame */
  var W = 0, H = 0, U = 1, DPR = 1, MID = 0, SQ = 8, SP = .8, g = null, dirty = true;
  function xl(X){ return X * U; }
  function xr(X){ return W - (1920 - X) * U; }
  function xm(X){ return W / 2 + (X - 960) * U; }
  /* scenes: every page opens in its own way — the elements of an opening are scrubbed by the scroll.
     data-s="prop:from>to@q0-q1; …"  props: tx ty (in u), sc, op, br (brightness), ci (clip inset, four %) */
  function Scrub(el){
    var tw = (el.getAttribute('data-s') || '').split(';').map(function(x){ var m = x.trim().match(/^(\w+):([^>]+)>([^@]+)(?:@([-\d.]+)-([-\d.]+))?$/); if (!m) return null;
      return {p: m[1], a: m[2].split(',').map(parseFloat), b: m[3].split(',').map(parseFloat), q0: m[4] == null ? 0 : +m[4], q1: m[5] == null ? 1 : +m[5]}; }).filter(Boolean);
    return {el: el, tw: tw, mv: tw.some(function(w){ return w.p === 'tx' || w.p === 'ty' || w.p === 'sc'; }), key: ''};
  }
  function runScrub(o, q){
    var tx = 0, ty = 0, sc = 1, st = o.el.style, i, key = '';
    for (i = 0; i < o.tw.length; i++){ var w = o.tw[i], k = eio(sg(q, w.q0, w.q1)), v0 = w.a[0] + (w.b[0] - w.a[0]) * k;
      if (w.p === 'tx') tx += v0 * U; else if (w.p === 'ty') ty += v0 * U; else if (w.p === 'sc') sc *= v0;
      else { var ky = w.p + k.toFixed(4); if (o['_' + i] === ky) continue; o['_' + i] = ky;
        if (w.p === 'op'){ st.opacity = v0.toFixed(3); st.visibility = v0 <= .001 ? 'hidden' : 'visible'; }
        else if (w.p === 'br') st.filter = 'contrast(1.04) brightness(' + v0.toFixed(3) + ')';
        else if (w.p === 'ci') clip(o.el, k >= 1 && w.b.join('') === '0000' ? 'none' : 'inset(' + w.a.map(function(a, j){ return (a + (w.b[j] - a) * k).toFixed(3) + '%'; }).join(' ') + ')'); } }
    if (o.mv){ key = tx.toFixed(1) + ',' + ty.toFixed(1) + ',' + sc.toFixed(4); if (key !== o.key){ o.key = key; st.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')'; } }
  }
  var FILMS = qsa('.film').map(function(e){
    var cv = qs('.ln', e);
    return {el: e, cv: cv, g: cv.getContext('2d'), fig: e.getAttribute('data-fig'), len: +e.getAttribute('data-len'), ms: qsa('.m', e).map(Moment), pic: qs('.pic', e), h1: qs('.cv-h', e), kick: qs('.cv-k', e),
            n: +e.getAttribute('data-n') || 0, emb: (e.getAttribute('data-emb') || '').split(','), t0: +e.getAttribute('data-t0') || .9, d: +e.getAttribute('data-d') || .55, q: -9, on: null,
            sc: qsa('[data-s]', e).map(Scrub), trk: qs('[data-track]', e), cur: e.classList.contains('crt'), seg: (function(){ var d = e.getAttribute('data-seg'); return d ? d.split(',').map(Number) : null; })(), ar: +e.getAttribute('data-ar') || 1.42,
            zf: e.classList.contains('zf'), zm: null, seed: +e.getAttribute('data-seed') || 0, cap: e.getAttribute('data-cap') || '', names: qsa('[data-steps] li', e).map(function(li){ var x = li.textContent.trim(), i = x.indexOf(' '); return i < 0 ? [x, ''] : [x.slice(0, i), x.slice(i + 1)]; }), cw: 0, ch: 0, tv: 0};
  });
  var BANDS = qsa('.bnd').map(function(e){ return {el: e, img: qs('img', e), k: -1}; });
  function layout(){
    W = window.innerWidth; H = window.innerHeight; U = W >= H ? Math.min(W / 1920, H / 1080) : Math.max(W / 1920, W / 900);
    DPR = Math.min(2, window.devicePixelRatio || 1); MID = Math.round(H / 2) + .5; SQ = Math.max(5, 8 * U);
    FILMS.forEach(function(f){ f.el.style.height = Math.round(f.len * SP * H + H) + 'px'; f.cv.width = Math.round(W * DPR); f.cv.height = Math.round(H * DPR); });
    FILMS.forEach(function(f){ if (f.zf) f.zm = null; });
    FILMS.forEach(function(f){ if (f.fig !== 'key' && f.fig !== 'many') return; var flow = getComputedStyle(f.cv).position !== 'absolute'; f.cw = flow ? f.cv.clientWidth : 0; f.ch = flow ? f.cv.clientHeight : 0;
      if (flow){ f.cv.width = Math.round(f.cw * DPR); f.cv.height = Math.round(f.ch * DPR); } });
    dirty = false;
    if (GL) GL.layout();
    qsa('#ftCity').forEach(function(v){ var mtx = v.getScreenCTM && v.getScreenCTM(); if (mtx && mtx.a) v.style.setProperty('--ds', Math.max(mtx.a, .05).toFixed(4)); });
  }
  window.addEventListener('resize', function(){ dirty = true; });
  window.addEventListener('load', function(){ dirty = true; });

  /* anchors on this page: a film opens a little into itself, where its title already stands */
  qsa('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){ var id = a.getAttribute('href').slice(1); if (!id){ e.preventDefault(); return; } var t = $(id); if (!t) return; e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY, op = t.getAttribute('data-open'); if (t.classList.contains('film') && t.getAttribute('data-fig') !== 'cover') y += (op == null ? .7 : +op) * SP * H; smoothTo(y); });
  });

  /* the pen */
  var LW = 1.5;
  function ink(a, lw, dash){ g.strokeStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.lineWidth = lw || LW; g.setLineDash(dash || []); }
  function seg(x1, y1, x2, y2){ g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  function sq(x, y, a, s){ if (a <= 0) return; s = s || SQ; g.fillStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s)); }
  function clip(e, v){ if (e.__c === v) return; e.__c = v; e.style.clipPath = v; e.style.webkitClipPath = v; }

  /* the line, and what it becomes for a page (amounts 0…1 by name; several can be on the way in and out at once) */
  function theLine(al, E, t, x0, x1){
    if (al <= 0) return;
    E = E || {}; x0 = x0 == null ? -10 : x0; x1 = x1 == null ? W + 10 : x1;
    var wv = (E.wellness || 0), vo = (E.voice || 0), co = (E.core || 0), cg = (E.converge || 0), xj = xm(960), i;
    /* the main line; where two (or five) lines run into it, it begins at their meeting point */
    var lead = Math.max(co, cg), xs = lead > 0 ? Math.max(x0, x0 + (xj - x0) * lead) : x0;
    ink(al);
    if (wv > 0 || vo > 0){
      g.beginPath();
      for (i = 0; i <= 260; i++){
        var x = xs + (x1 - xs) * i / 260, xu = x / U, y = MID;
        if (wv > 0) y += wv * 15 * U * Math.sin(xu / 150 - t * .5);
        if (vo > 0){ var e = c01((x - xl(160)) / (xr(1760) - xl(160))), env = Math.pow(Math.sin(Math.PI * e), 1.2), md = (.5 + .5 * Math.sin(xu / 330 - t * .45)) * (.62 + .38 * Math.sin(xu / 137 + t * .8 + 1.7));
          y += vo * env * md * U * (64 * Math.sin(xu / 92 + t * 1.05) + 32 * Math.sin(xu / 41 - t * 1.6 + 1.3) + 14 * Math.sin(xu / 19 + t * 2.3 + .4)); }
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    } else seg(xs, MID, x1, MID);
    /* Core — design and build, two lines that become one */
    if (co > 0){ ink(al); [-1, 1].forEach(function(s){ g.beginPath(); g.moveTo(x0, MID + s * 70 * U * co); g.bezierCurveTo(x0 + (xj - x0) * .55, MID + s * 70 * U * co, x0 + (xj - x0) * .6, MID, xj, MID); g.stroke(); }); sq(xj, MID, al * co); }
    /* partners — many lines run into one */
    if (cg > 0){ [-2, -1, 0, 1, 2].forEach(function(s){ ink(al * (s ? .62 : 1), s ? 1 : LW); g.beginPath(); g.moveTo(x0, MID + s * 46 * U * cg); g.bezierCurveTo(x0 + (xj - x0) * .5, MID + s * 46 * U * cg, x0 + (xj - x0) * .62, MID, xj, MID); g.stroke(); }); sq(xj, MID, al * cg); }
    /* Curated — the layers laid over what was built */
    if (E.curated > 0){ var c = E.curated; [[14, .62], [28, .45], [42, .3]].forEach(function(l, k){ var d = c01(c * 1.6 - k * .3); if (d <= 0) return; ink(al * l[1], 1); seg(xj, MID - l[0] * U, xj + (x1 - xj) * eo(d), MID - l[0] * U); }); }
    /* Turnkey — one unbroken line, from the first idea to the first night home */
    if (E.turnkey > 0){ sq(50 * U + SQ / 2, MID, al * E.turnkey); sq(W - 50 * U - SQ / 2, MID, al * E.turnkey); }
  }

  /* ---------- film: the cover — the photograph closes into the line */
  function cover(f, q, t){
    if (f.pic){
      var k = eio(sg(q, .1, 1.0));
      if (k >= 1 || q < -1.2){ if (f.pic.__v !== 0){ f.pic.__v = 0; f.pic.style.visibility = 'hidden'; } }
      else { if (f.pic.__v !== 1){ f.pic.__v = 1; f.pic.style.visibility = 'visible'; } clip(f.pic, 'inset(' + (k * 50).toFixed(3) + '% 0)'); }
    }
    var o = 1 - eo(sg(q, .08, .5));
    [f.h1, f.kick].forEach(function(h){ if (!h || h.__o === o) return; h.__o = o; h.style.opacity = o.toFixed(3); h.style.visibility = o > 0 ? 'visible' : 'hidden';
      h.style.transform = o < 1 ? 'translateY(' + (-(1 - o) * 26 * U).toFixed(1) + 'px)' : ''; h.style.filter = o < 1 ? 'blur(' + ((1 - o) * 10).toFixed(1) + 'px)' : ''; });
    var E = {}; if (f.emb[0]) E[f.emb[0]] = eio(sg(q, 1.0, 1.7));
    theLine(f.pic ? sg(q, .82, 1.0) : 1, E, t);
  }
  /* ---------- film: steps — a journey on the line; the square walks from mark to mark */
  function rx(u){ return u <= 960 ? u * U : W - (1920 - u) * U; }
  function ry(v){ return MID + (v - 540) * U; }
  function pth(pts, close){
    g.beginPath();
    for (var i = 0; i < pts.length; i += 2){ var x = rx(pts[i]), y = ry(pts[i + 1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    if (close) g.closePath();
    g.stroke();
  }
  function rct(a, b, c, d){ pth([a, b, c, b, c, d, a, d], true); }
  /* a polyline drawn up to a fraction of its own length: the room draws itself as the block arrives */
  function pthF(pts, fr){
    if (fr >= .999) return pth(pts);
    if (fr <= .001) return;
    var L = 0, i, s = [], x1, y1, x2, y2, d;
    for (i = 0; i < pts.length - 2; i += 2){
      x1 = rx(pts[i]); y1 = ry(pts[i + 1]); x2 = rx(pts[i + 2]); y2 = ry(pts[i + 3]);
      d = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); s.push([x1, y1, x2, y2, d]); L += d;
    }
    var want = L * fr, acc = 0;
    g.beginPath(); g.moveTo(s[0][0], s[0][1]);
    for (i = 0; i < s.length; i++){
      if (acc + s[i][4] <= want){ g.lineTo(s[i][2], s[i][3]); acc += s[i][4]; }
      else { var k = (want - acc) / s[i][4]; g.lineTo(s[i][0] + (s[i][2] - s[i][0]) * k, s[i][1] + (s[i][3] - s[i][1]) * k); break; }
    }
    g.stroke();
  }
  /* ================================================================== Solutions: the four ways own the layers of one plan (17.11.2026 15:10)
     «На головній стилістика нашого плану була прекрасна… з оцими променями світла воно було дуже красиво. Зараз ти зробив трошки
     шаблонненько.» She is right, and the fault was the hand, not the idea: a flat elevation with a sofa in it is the language of a furniture
     catalogue. We already have a home drawn in our own hand — the plan of the philosophy chapter on the home page, walls as double hairlines
     broken for the glazing, doors with their swing, quiet furniture, and the sun reaching in through every window it can see.
     So this block draws THAT HOME, the same one, and the four ways own its layers:
       CI Core      the plan itself — walls, openings, partitions, doors. Drawn, and empty.
       CI Curated   the same plan with the furniture arriving in every room.
       CI Turnkey   all of it, with the evening lamps lit and the keys left on the table in the foyer.
       CI Wellness  the light: a shaft through every window the sun can see, moving with the hour, and the air along the rooms.
     Same house on both pages, same hand, and the light comes back where it belongs. */
  var PLN = (function(){
    var W = 1000, H = 640, T = 14;
    var WIN = {n: [[590, 730]], s: [[60, 280], [380, 520], [560, 680], [770, 960]],
               e: [[60, 170], [300, 420], [460, 580]], w: [[50, 190], [330, 560]]};
    var DRX = {n: [[400, 470]]};
    var INT = [[0,240,70,240],[270,240,340,240],[540,240,600,240],[660,240,800,240],[860,240,1000,240],
               [300,0,300,150],[300,210,300,240],[560,0,560,60],[560,120,560,240],[770,0,770,240],
               [330,240,330,300],[330,560,330,640],[710,240,710,470],[710,530,710,640]];
    var DRS = [[400,T,400,T+70,470,T,0],[300,150,360,150,300,210,1],[600,240,600,180,660,240,1],
               [800,240,800,180,860,240,1],[710,470,770,470,710,530,1]];
    var FUR = [['r',846,392,126,168,6],['l',846,420,972,420],['r',946,400,20,30,3],['r',946,522,20,30,3],['r',820,368,156,216,0],
               ['r',420,420,220,44,8],['r',420,464,44,110,8],['c',560,520,34],['r',400,400,260,196,0],
               ['r',686,300,24,140,0],['r',100,380,150,120,60],
               ['r',90,90,150,56,4],['l',T+26,T,T+26,230],['l',T,T+26,300,T+26],
               ['r',610,150,110,50,3],['l',574,20,574,200],['l',740,30,760,30],
               ['c',430,130,30],['l',316,60,316,120],['l',544,140,544,200],['l',470,226,530,226],
               ['r',880,40,92,52,22],['r',790,150,60,60,0],['l',970,120,970,220]];
    for (var i = 0; i < 3; i++){ FUR.push(['r',118+i*44,356,26,18,4]); FUR.push(['r',118+i*44,506,26,18,4]); }
    FUR.push(['r',76,425,18,30,4]); FUR.push(['r',256,425,18,30,4]);
    for (var k = 0; k < 6; k++) FUR.push(['l',574,30+k*30,594,30+k*30]);
    var LAMP = [[175,440,150],[520,480,190],[900,470,120],[165,118,110]];
    var wins = [];
    WIN.n.forEach(function(r){ wins.push({a:[r[0],0], b:[r[1],0], n:[0,-1]}); });
    WIN.s.forEach(function(r){ wins.push({a:[r[0],H], b:[r[1],H], n:[0,1]}); });
    WIN.e.forEach(function(r){ wins.push({a:[W,r[0]], b:[W,r[1]], n:[1,0]}); });
    WIN.w.forEach(function(r){ wins.push({a:[0,r[0]], b:[0,r[1]], n:[-1,0]}); });
    function side(key, len){
      var cuts = (WIN[key] || []).concat(DRX[key] || []).slice().sort(function(a, b){ return a[0] - b[0]; }), out = [], x = 0;
      cuts.forEach(function(c){ out.push([x, c[0]]); x = c[1]; });
      out.push([x, len]); return out;
    }
    return {W: W, H: H, T: T, WIN: WIN, INT: INT, DRS: DRS, FUR: FUR, LAMP: LAMP, wins: wins, side: side};
  })();
  /* the house itself, drawn once and used by both pages: Solutions gives its layers to the four ways, CI Turnkey's cover lights it room by
     room on the first night. X and Y are passed in, so the same plan can hug the right field on one page and stand in the middle on another. */
  function planDraw(X, Y, o){
    var P = PLN, i;
    function L(x1, y1, x2, y2){ g.beginPath(); g.moveTo(X(x1), Y(y1)); g.lineTo(X(x2), Y(y2)); g.stroke(); }
    var UN = X(1) - X(0);
    function R(x, y, w, h, r){
      r = Math.min(r || 0, w / 2, h / 2);
      g.beginPath();
      if (!r){ g.rect(X(x), Y(y), w * UN, h * UN); }
      else {
        var rr = r * UN;
        g.moveTo(X(x) + rr, Y(y));
        g.lineTo(X(x + w) - rr, Y(y)); g.quadraticCurveTo(X(x + w), Y(y), X(x + w), Y(y) + rr);
        g.lineTo(X(x + w), Y(y + h) - rr); g.quadraticCurveTo(X(x + w), Y(y + h), X(x + w) - rr, Y(y + h));
        g.lineTo(X(x) + rr, Y(y + h)); g.quadraticCurveTo(X(x), Y(y + h), X(x), Y(y + h) - rr);
        g.lineTo(X(x), Y(y) + rr); g.quadraticCurveTo(X(x), Y(y), X(x) + rr, Y(y));
        g.closePath();
      }
      g.stroke();
    }
    function C(x, y, r){ g.beginPath(); g.arc(X(x), Y(y), r * UN, 0, 6.2832); g.stroke(); }
    /* the sun, reaching in through every window it can see */
    if (o.light > .004){
      var th = (o.hour - 6) / 12 * Math.PI, sx = -Math.cos(th), sy = -Math.sin(th);
      var elev = Math.max(0, Math.sin(th)), LEN = 220 + 420 * (1 - elev);
      g.save(); g.beginPath(); g.rect(X(P.T), Y(P.T), (P.W - 2 * P.T) * UN, (P.H - 2 * P.T) * UN); g.clip();
      P.wins.forEach(function(w){
        var kk = -(sx * w.n[0] + sy * w.n[1]), a = o.light * Math.max(0, kk) * (.55 + .45 * elev);
        if (a < .012) return;
        var mx = (w.a[0] + w.b[0]) / 2, my = (w.a[1] + w.b[1]) / 2;
        var gr = g.createLinearGradient(X(mx), Y(my), X(mx + sx * LEN), Y(my + sy * LEN));
        gr.addColorStop(0, 'rgba(255,255,255,' + (a * .22).toFixed(3) + ')');
        gr.addColorStop(.55, 'rgba(255,255,255,' + (a * .075).toFixed(3) + ')');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath();
        g.moveTo(X(w.a[0]), Y(w.a[1])); g.lineTo(X(w.b[0]), Y(w.b[1]));
        g.lineTo(X(w.b[0] + sx * LEN), Y(w.b[1] + sy * LEN)); g.lineTo(X(w.a[0] + sx * LEN), Y(w.a[1] + sy * LEN));
        g.closePath(); g.fill();
      });
      g.restore();
    }
    /* the lamps of the evening */
    if (o.lamp > .004){
      P.LAMP.forEach(function(l, k){
        var a = o.lamp * (o.lampK ? o.lampK(k) : 1) * .16;
        if (a < .004) return;
        var r = l[2] * (o.lampR || 1) * UN, gr = g.createRadialGradient(X(l[0]), Y(l[1]), 0, X(l[0]), Y(l[1]), r);
        gr.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(X(l[0]), Y(l[1]), r, 0, 6.2832); g.fill();
      });
    }
    /* the walls: two hairlines with the openings cut out of them */
    var dp = o.dp == null ? 1 : o.dp;
    ink(o.wall * dp, LW);
    P.side('n', P.W).forEach(function(r){ L(r[0], 0, r[1], 0); L(Math.max(P.T, r[0]), P.T, Math.min(P.W - P.T, r[1]), P.T); });
    P.side('s', P.W).forEach(function(r){ L(r[0], P.H, r[1], P.H); L(Math.max(P.T, r[0]), P.H - P.T, Math.min(P.W - P.T, r[1]), P.H - P.T); });
    P.side('e', P.H).forEach(function(r){ L(P.W, r[0], P.W, r[1]); L(P.W - P.T, Math.max(P.T, r[0]), P.W - P.T, Math.min(P.H - P.T, r[1])); });
    P.side('w', P.H).forEach(function(r){ L(0, r[0], 0, r[1]); L(P.T, Math.max(P.T, r[0]), P.T, Math.min(P.H - P.T, r[1])); });
    P.INT.forEach(function(sg_){ L(sg_[0], sg_[1], sg_[2], sg_[3]); });
    /* the glazing in every opening, the jambs of the entry, and the doors with their swing */
    if (o.win > .004){
      ink(o.win, 1);
      P.wins.forEach(function(w){
        var tx = -w.n[0] * P.T, ty = -w.n[1] * P.T;
        L(w.a[0], w.a[1], w.a[0] + tx, w.a[1] + ty); L(w.b[0], w.b[1], w.b[0] + tx, w.b[1] + ty);
        L(w.a[0] + tx * .35, w.a[1] + ty * .35, w.b[0] + tx * .35, w.b[1] + ty * .35);
        L(w.a[0] + tx * .65, w.a[1] + ty * .65, w.b[0] + tx * .65, w.b[1] + ty * .65);
      });
      L(400, 0, 400, P.T); L(470, 0, 470, P.T);
      P.DRS.forEach(function(d){
        L(d[0], d[1], d[2], d[3]);
        var r = Math.sqrt((d[2] - d[0]) * (d[2] - d[0]) + (d[3] - d[1]) * (d[3] - d[1])) * UN;
        var a0 = Math.atan2(Y(d[3]) - Y(d[1]), X(d[2]) - X(d[0])), a1 = Math.atan2(Y(d[5]) - Y(d[1]), X(d[4]) - X(d[0]));
        ink(o.win * .5, 1); g.beginPath(); g.arc(X(d[0]), Y(d[1]), r, a0, a1, !d[6]); g.stroke(); ink(o.win, 1);
      });
    }
    /* the furniture, quiet */
    if (o.fur > .004){
      ink(o.fur, 1);
      P.FUR.forEach(function(it){
        if (it[0] === 'r') R(it[1], it[2], it[3], it[4], it[5]);
        else if (it[0] === 'c') C(it[1], it[2], it[3]);
        else L(it[1], it[2], it[3], it[4]);
      });
    }
    /* the keys, left on the table in the foyer */
    if (o.keys > .004){
      ink(o.keys, 1);
      C(466, 118, 9); L(474, 118, 500, 118); L(492, 118, 492, 128); L(500, 118, 500, 130);
    }
  }
  /* ================================================================== CI Turnkey's cover: from the tangle to the home (17.11.2026, her own scenario)
     17:07, her frame 603:742: «Внизу від того тексту буде йти наша лінія… ми скролимо, і лінія розходиться і промальовує нашу картинку.
     Потім перехід в реалістичну картинку.» 17:12: the words stand on black only. 17:33: «щоб лінія починалася трошки нижче заголовка і
     йшла вниз… щоб вона була така закручена, як у нас на головній. Ідея — це завжди щось хаотичне, а потім ми це структуруємо в результат».
     19:48, her frame 610:99 — the words now stand at the HEAD of the screen, in the site's 111, and say «From Sketch to First Night Home»;
     «лінію я хочу більш закручену, як у нас на головній… візьми це за референс, трошки її видозмінь… зараз та, що є, якась маленька,
     скручена, непонятна. Потім щоб видно було, що з цієї лінії виростає наш скетч… Скетч почисти, зроби його професійнішим. І ефект,
     коли замальовується скетч на фотографію, перевір, чи він підходить нам по ефектах. Все має бути consistent.»
     So the cover is four states of ONE line, and nothing on it is done by anything but that line:
       the idea      the home page's knot — a real one, turning, its strand breaking where it passes behind itself — but large, in the
                     whole of the screen under the words, and already paying out: its last turns loosen and it leaves straight down;
       the line      the scroll pulls it straight: the words leave upward as on any page and the loose end goes up after them, until the
                     tangle is one line down the middle of the screen;
       the sketch    the room grows OUT OF that line. Every stroke of the drawing begins where the ink reaches it and runs along itself
                     (tools/site/sketch.py gives each point the moment it is reached from the middle column), the pen's tip a little
                     brighter than the ink behind it — so the drawing branches from the line instead of being uncovered beside it;
       the home      the line parts in two, to the left and to the right, and the home stands between its halves. One straight front
                     under a hairline — the way a picture arrives everywhere on this site. (The mosaic of cells it replaces was the
                     only place where a picture came in pieces: she doubted it, and it did not belong.) Just behind the line the
                     drawing's ink still lies on the photograph, and is given up within a hand's width.
     Chaos, a line, a structure, a result: «From Sketch to First Night Home». */
  var TANG = (function(){ var N = 600, P = [], i, a = .35, ct = Math.cos(1.0), st = Math.sin(1.0);
    for (i = 0; i <= N; i++){ var s = i / N, b = 1 - sm(.46, 1, s), r = 2 + .9 * Math.cos(5 * a);
      var x = r * Math.cos(2 * a) / 2.9, y = r * Math.sin(2 * a) / 2.9, z = -.9 * Math.sin(5 * a) / 2.9;
      P.push([b * x, b * (y * ct - z * st), b * (y * st + z * ct), 1.5 * Math.pow(sg(s, .3, 1), 1.7)]);   /* the knot at the home page's tilt, what is left of it, and how far down the line it has let go */
      a += Math.PI * 2 * 2.2 / N * (.1 + .9 * b); }                             /* as it loosens it also turns more slowly: no hook where it meets the line */
    return P; })();
  function unfold(f, q, t){
    if (f.glo === undefined){
      var box = qs('.tk-cv-ph', f.el);
      f.glo = box ? GL2.make(box, glCoverFS(GLSH.room, .93), qsa('img', box)) : null;
      f.tx = qs('.tk-cv-t', f.el); f.ph = box && qs('img', box);
    }
    var o = f.glo, i, k;
    function room(grow, x1, x2, home, dim){
      if (!o){                                                              /* no WebGL: the photograph's own element, and only once the words have gone */
        if (f.ph){ var a = H >= W ? 1 : sm(.5, 1.3, q).toFixed(3) + (dim > 0 ? ' ' + dim.toFixed(2) : '');
          if (f.ph.__a !== a){ f.ph.__a = a; f.ph.style.visibility = 'visible'; f.ph.style.opacity = parseFloat(a); f.ph.style.filter = dim > 0 ? 'brightness(' + (1 - .4 * dim).toFixed(3) + ')' : ''; } }
        return;
      }
      if (!o.ready) return;
      o.size(); o.set1('uA', grow); o.set2('uB', x1, x2); o.set1('uQ', home); o.set1('uF', dim || 0); o.set1('uTime', (t * 60) | 0); o.draw();
    }
    if (H >= W){ room(1, -1, 2, 1, 0); return; }                               /* phones: the words, the line, then the room — in the flow (css) */
    /* the tangle and its line come once, when the screen is first seen: drawn in one stroke, by the clock */
    f.dp = Math.max(Math.min(1, (f.dp || 0) + Math.min(.05, Math.max(0, t - (f.tl || t)) / 1.9)), sg(q, 0, .06)); f.tl = t;
    var dp = f.dp, sh = Math.min(H * 1.3, q * SP * H * 1.5);                /* the page seems to scroll on: the words leave upward */
    if (f.tx){
      var vis = sh < H * .72 ? 1 : 0, tf = 'translate3d(0,' + (-sh).toFixed(1) + 'px,0)';
      if (f.tx.__t !== tf){ f.tx.__t = tf; f.tx.style.transform = tf; }
      if (f.tx.__v !== vis){ f.tx.__v = vis; f.tx.style.visibility = vis ? 'visible' : 'hidden'; }
    }
    /* the tangle fills what the words leave of the screen: from 55 under the title down to the foot (the 58 px floor over the rail),
       where it has become the line */
    var top = 530 * U, foot = H - Math.max(58, 50 * U), RK = Math.min(190 * U, (foot - top) / 2.75), KX = W / 2, KY = top + RK, FP = 7.5 / 2.9;
    var e = sm(0, 1, sg(q, .06, .42)), e2 = e * e * (3 - 2 * e);
    var grow = sg(q, .46, 1.18), sp = eio(sg(q, 1.28, 2.08)), dist = sp * (W / 2 + 10), xL = W / 2 - dist, xR = W / 2 + dist;
    /* 18.11, her frame 637:7894: once the home stands, its light goes down a little — slowly, over most of a screen of scroll, so that it
       is never seen happening — and the page's two centre hairlines are ruled across it: the horizontal from the left field, then the
       vertical from the head. The words arrive as the film's moments (.tk-cv-i). */
    var dim = sm(2.12, 3.02, q);
    room(grow, sp > 0 ? xL / W : 2, sp > 0 ? xR / W : 2, sg(q, 1.28, 2.12), dim);   /* not parted yet: no home at all, not even a hair of it */
    g.lineCap = 'butt'; g.lineJoin = 'round';
    if (sp <= 0){
      var N = TANG.length - 1, yJ = KY + TANG[N][3] * RK, yT = Math.max(-10, 535 * U - sh);   /* where the tangle meets its line, and the loose end, which follows the words up */
      /* the line the tangle lets go of: straight down, off the foot of the screen */
      var nd = eo(sg(dp, 0, .8)) * N, tl = eo(sg(dp, .72, 1));
      if (tl > 0){ ink(1, LW); seg(KX, yJ - 1, KX, lerp(yJ, H + 10, tl)); }
      if (e2 >= 1){ ink(1, LW); seg(KX, yT, KX, yJ); }
      else {
        /* the tangle: one strand, turning; where it passes behind itself it breaks. The scroll pulls it out into the line */
        var ay = (reduced ? 0 : t * .34) + q * 5.2, wb = reduced ? 0 : .2 * Math.sin(t * .23), ca = Math.cos(ay), sa = Math.sin(ay), cw = Math.cos(wb), sw = Math.sin(wb), S = [];
        for (i = 0; i <= N; i++){ var p = TANG[i], y = p[1] * cw - p[2] * sw, zz = p[1] * sw + p[2] * cw, x = p[0] * ca + zz * sa, z = -p[0] * sa + zz * ca;
          var fp = FP / (FP - z), kx = KX + x * RK * fp, ky = KY + (y * fp + p[3]) * RK;
          S.push([kx + (KX - kx) * e2, ky + (lerp(yT, yJ, i / N) - ky) * e2, z * (1 - e2)]); }
        var CH = 4, runs = [];
        for (i = 0; i < N; i += CH) if (i <= nd) runs.push([i, (S[i][2] + S[Math.min(N, i + CH)][2]) / 2]);
        runs.sort(function(a, b){ return a[1] - b[1]; });
        for (var j = 0; j < runs.length; j++){ var j0 = runs[j][0], j1 = Math.min(N, j0 + CH), jb = Math.max(0, j0 - 1);
          if (e2 < .98){ g.strokeStyle = '#000000'; g.lineWidth = LW + 8 * U * (1 - e2) * (1 - e2); g.setLineDash([]); g.beginPath(); g.moveTo(S[j0][0], S[j0][1]); for (k = j0 + 1; k <= j1; k++) g.lineTo(S[k][0], S[k][1]); g.stroke(); }
          g.strokeStyle = '#FFFFFF'; g.lineWidth = LW; g.beginPath(); g.moveTo(S[jb][0], S[jb][1]); for (k = jb + 1; k <= j1; k++) g.lineTo(S[k][0], S[k][1]); g.stroke(); }
      }
    } else {
      /* the line, parted: the home stands between its two halves, its drawing outside them */
      var la = 1 - sg(sp, .97, 1);
      if (la > .004){ ink(la, LW); seg(xL, -10, xL, H + 10); seg(xR, -10, xR, H + 10); }
      cross(eio(sg(q, 2.26, 2.7)), eio(sg(q, 2.4, 2.84)));
    }
  }
  /* the two centre hairlines of a photograph that carries words (the home page's own, 13.11): Bright Gray at 33 %, one pixel, ruled —
     the horizontal from the left edge, the vertical from the head */
  function cross(lh, lv){
    if (lh <= 0 && lv <= 0) return;
    g.strokeStyle = 'rgba(235,235,235,.33)'; g.lineWidth = 1; g.setLineDash([]);
    if (lh > 0) seg(0, MID, W * lh, MID);
    if (lv > 0){ var vx = Math.round(W / 2) - .5; seg(vx, 0, vx, H * lv); }
  }
  /* ================================================================== Solutions: one house, four ways to it — a scenario (17.11.2026 16:30)
     «Щоб це не просто була зміна картинок, а прямо якийсь сценарій відбувався, коли ми скролимо і в нас міняється текст.» The plan no longer
     fades from one set of layers to the next. It is one house and one camera, and each way DOES something to the drawing:
       CI Turnkey   the whole house from above, and it is lived in — it builds itself as the screen arrives: walls, glazing, furniture, the
                    lamps come on, the keys are left on the table in the foyer;
       CI Core      the furniture goes, the camera pushes in on the structure, and the drawing becomes a construction drawing: the walls are
                    hatched and the dimension chains draw themselves along them;
       CI Curated   the camera glides down into the living room and comes closer still; the furniture returns bright and the room is dressed
                    piece by piece — cushions, the table laid, a lamp, a plant;
       CI Wellness  the camera pulls all the way back, and the house fills: the sun reaches in through every window and travels with the hour,
                    the air moves through the rooms, the lamps glow.
     Every move straddles the change of the text (the old text leaves in the middle of it, the new one arrives as the camera settles), so the
     drawing is never showing one way while the words say another. The walls themselves never fade: it is the same house throughout. */
  var PCAM = [[500, 358, 1], [290, 190, 1.6], [365, 452, 1.5], [500, 358, 1]];   /* what the camera looks at, and how closely. 18.11.2026 20:50 (her frame 605:99): every heading stands at the head of the screen now, so the last way sees the whole house where the first does */
  var PCUR = [['r',430,426,38,30,6],['r',474,426,38,30,6],['r',592,426,38,30,6],['r',426,476,30,36,6],['r',426,520,30,36,6],
              ['c',560,520,13],['r',538,500,24,13,2],['c',150,440,8],['c',175,440,12],['c',200,440,8],
              ['c',672,410,13],['l',662,410,682,410],['l',672,400,672,420],['c',384,588,17],['c',384,588,7]];
  var PAIR = [[0,440, 330,400, 700,470, 1000,380], [0,130, 300,190, 560,90, 1000,120], [450,640, 500,470, 400,300, 435,0]];
  function plan(f, q, t){
    var N = f.n, k, TR = [], A = [], E = [];
    /* the three moves: each begins while the outgoing text still stands and ends as the incoming one has arrived */
    for (k = 0; k < N - 1; k++) TR[k] = c01(((q - (f.t0 + k * f.d)) / f.d - .72) / .44);
    for (k = 0; k < N; k++){
      var inn = k === 0 ? 1 : sm(0, 1, c01((TR[k - 1] - .45) / .55)), out = k === N - 1 ? 0 : sm(0, 1, c01(TR[k] / .5));
      A[k] = inn * (1 - out);                                       /* a way's own marks: in with the second half of its move, out with the first half of the next */
      E[k] = k === 0 ? 1 : c01((TR[k - 1] - .4) / .6);              /* and how far they have drawn themselves */
    }
    var base = sg(q, f.t0 - .38, f.t0 + .04);
    if (base <= .002) return;
    var ci = 0, cu = 0;
    for (k = 0; k < N - 1; k++) if (TR[k] > 0){ ci = k; cu = eio(TR[k]); }
    var c0 = PCAM[ci], c1 = PCAM[Math.min(N - 1, ci + 1)];
    var cx = lerp(c0[0], c1[0], cu), cy = lerp(c0[1], c1[1], cu), cs = Math.exp(lerp(Math.log(c0[2]), Math.log(c1[2]), cu));
    /* her frame 605:99 (18.11.2026 20:50): the drawing stands in the MIDDLE of the screen — on the screen's own axis, like the name over
       it and the button under it (her plan sits 20 right of it; snapped) — at the size it had, its camera 66 under the screen's middle
       as she set it; the camera looks at the house through a box that ends above the button (her second frame, 605:157: 226 … 903) */
    var P = PLN, BX0 = 517.5, BX1 = 1402.5, BY0 = 226, BY1 = 903, S = (BX1 - BX0) * .88 / P.W * cs, bx = 960, by = 606;
    function xm(v){ return W / 2 + (v - 960) * U; }
    function X(x){ return xm(bx + (x - cx) * S); }
    function Y(y){ return ry(by + (y - cy) * S); }
    function L(xa, ya, xb, yb){ g.beginPath(); g.moveTo(X(xa), Y(ya)); g.lineTo(X(xb), Y(yb)); g.stroke(); }
    var UN = X(1) - X(0), x0 = xm(BX0), x1 = xm(BX1), y0 = ry(BY0), y1 = ry(BY1);
    g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
    var dp = sg(q, f.t0 - .34, f.t0 + .16), a0 = A[0], a1 = A[1], a2 = A[2], a3 = A[3] || 0;
    var fur0 = a0 * sg(q, f.t0 - .08, f.t0 + .24), lamp0 = a0 * sg(q, f.t0 + .06, f.t0 + .4), key0 = a0 * sg(q, f.t0 + .26, f.t0 + .5);
    planDraw(X, Y, {
      wall: base * .78, dp: dp, win: base * .5 * sg(dp, .4, .95),
      fur: base * Math.max(fur0 * .3, a2 * .72, a3 * .26),
      lamp: base * Math.max(lamp0, a3), keys: base * key0 * .6,
      light: base * a3, hour: 11.4 + 4.1 * Math.sin(t * .055)
    });
    /* CI Core: the house as it is built — the walls hatched, the dimension chains drawn along them */
    if (a1 > .004){
      var e1 = E[1], off = 36, tk = 9, T = P.T, n, xx, yy;
      ink(base * a1 * .5, 1);
      P.side('n', P.W).forEach(function(r){ for (xx = r[0]; xx < r[1] - 2; xx += 11) if ((xx / P.W) < e1) L(xx, T, Math.min(r[1], xx + T), T - Math.min(T, r[1] - xx)); });
      P.side('s', P.W).forEach(function(r){ for (xx = r[0]; xx < r[1] - 2; xx += 11) if ((xx / P.W) < e1) L(xx, P.H, Math.min(r[1], xx + T), P.H - Math.min(T, r[1] - xx)); });
      P.side('w', P.H).forEach(function(r){ for (yy = r[0]; yy < r[1] - 2; yy += 11) if ((yy / P.H) < e1) L(0, Math.min(r[1], yy + T), Math.min(T, r[1] - yy), yy); });
      P.side('e', P.H).forEach(function(r){ for (yy = r[0]; yy < r[1] - 2; yy += 11) if ((yy / P.H) < e1) L(P.W - T, Math.min(r[1], yy + T), P.W - T + Math.min(T, r[1] - yy), yy); });
      ink(base * a1 * .62, 1);
      var xe = P.W * eo(e1), ye = P.H * eo(c01((e1 - .2) / .8));
      L(0, -off, xe, -off);
      [0, 300, 560, 770, 1000].forEach(function(v){ if (v <= xe + .5){ L(v - tk, -off + tk, v + tk, -off - tk); L(v, -off - 18, v, -8); } });
      L(-off, 0, -off, ye);
      [0, 240, 640].forEach(function(v){ if (v <= ye + .5){ L(-off - tk, v + tk, -off + tk, v - tk); L(-off - 18, v, -8, v); } });
    }
    /* CI Curated: the room is dressed, a piece at a time */
    if (a2 > .004){
      var e2 = E[2] * (PCUR.length + 1);
      PCUR.forEach(function(it, i){
        var al2 = base * a2 * .78 * c01(e2 - i); if (al2 <= .004) return;
        ink(al2, 1);
        if (it[0] === 'l') L(it[1], it[2], it[3], it[4]);
        else if (it[0] === 'c'){ g.beginPath(); g.arc(X(it[1]), Y(it[2]), it[3] * UN, 0, 6.2832); g.stroke(); }
        else { var rr = Math.min(it[5], it[3] / 2, it[4] / 2) * UN, xa = X(it[1]), ya = Y(it[2]), xb = X(it[1] + it[3]), yb = Y(it[2] + it[4]);
          g.beginPath(); g.moveTo(xa + rr, ya); g.lineTo(xb - rr, ya); g.quadraticCurveTo(xb, ya, xb, ya + rr); g.lineTo(xb, yb - rr); g.quadraticCurveTo(xb, yb, xb - rr, yb);
          g.lineTo(xa + rr, yb); g.quadraticCurveTo(xa, yb, xa, yb - rr); g.lineTo(xa, ya + rr); g.quadraticCurveTo(xa, ya, xa + rr, ya); g.closePath(); g.stroke(); }
      });
    }
    /* CI Wellness: the air moves through the rooms */
    if (a3 > .004){
      g.save(); g.beginPath(); g.rect(X(P.T), Y(P.T), (P.W - 2 * P.T) * UN, (P.H - 2 * P.T) * UN); g.clip();
      ink(base * a3 * .4 * E[3], 1, [7 * U, 13 * U]); g.lineDashOffset = -t * 24 * U;
      PAIR.forEach(function(c){ g.beginPath(); g.moveTo(X(c[0]), Y(c[1])); g.bezierCurveTo(X(c[2]), Y(c[3]), X(c[4]), Y(c[5]), X(c[6]), Y(c[7])); g.stroke(); });
      g.setLineDash([]); g.lineDashOffset = 0; g.restore();
    }
    g.restore();
    /* the edges of the box are soft: a close view runs out of sight, it is not cut off */
    var fw = 48 * U, gr;
    g.save(); g.globalCompositeOperation = 'destination-out';
    gr = g.createLinearGradient(x0, 0, x0 + fw, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x0 - 2, y0 - 2, fw + 2, y1 - y0 + 4);
    gr = g.createLinearGradient(x1, 0, x1 - fw, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x1 - fw, y0 - 2, fw + 2, y1 - y0 + 4);
    gr = g.createLinearGradient(0, y0, 0, y0 + fw); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, fw + 2);
    gr = g.createLinearGradient(0, y1, 0, y1 - fw); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x0 - 2, y1 - fw, x1 - x0 + 4, fw + 2);
    g.restore();
  }
  function steps(f, q, t){
    var N = f.n, x0 = xl(421), x1 = W - 50 * U, i, E = {};
    /* 16.11 23:09 («дуже якась рвана, топорна анімація тієї лінії. Хочеться легкості і плавності»): each way's own shape holds while its step is
       in hand and gives way over the whole gap to the next, so one turns into the other instead of snapping */
    for (i = 0; i < N; i++){
      var nm = f.emb[i]; if (!nm) continue;
      var c = f.t0 + i * f.d, dd = Math.abs(q - c) / f.d, a = sm(0, 1, 1 - c01(dd / .45));   /* full at the middle of a step, gone before the next: between two ways the line is simply straight */
      if ((i === 0 && q < c) || (i === N - 1 && q > c)) a = 1;
      if (a > 0) E[nm] = Math.max(E[nm] || 0, a);
    }
    theLine(1, E, t);
    var ta = sg(q, .45, .75);
    if (ta > 0){ ink(ta, 1); for (i = 0; i < N; i++){ var x = lerp(x0, x1, N > 1 ? i / (N - 1) : 0); seg(x, MID - 9 * U, x, MID + 9 * U); } }
    /* the square walks the line with the scroll and only eases as it comes to rest on a mark — no hop from one to the next */
    var p = c01((q - f.t0) / ((N - 1) * f.d)) * (N - 1), k = Math.min(N - 2, Math.floor(p)), fr = N > 1 ? c01(p - k) : 0;
    sq(lerp(x0, x1, N > 1 ? (k + sm(0, 1, fr)) / (N - 1) : 0), MID, sg(q, .6, .85));
  }
  /* ---------- film: scene — the page's own opening; a track pans sideways, a drawing draws itself */
  function scene(f, q, t){
    var i; for (i = 0; i < f.sc.length; i++) runScrub(f.sc[i], q);
    /* a cover that stands on the site's two centre lines (19.11.2026 13:24, Partnerships: «одна вертикальна, одна горизонтальна лінія по центру»):
       ruled once, in time, when the page opens — the title is centred on their crossing from the first moment; wide screens only */
    if (f.cr === undefined) f.cr = f.el.hasAttribute('data-cross') ? {t0: t} : null;
    if (f.cr && W > H) cross(eio(c01((t - f.cr.t0 - .3) / 1.3)), eio(c01((t - f.cr.t0 - .5) / 1.3)));
    if (f.trk){ var tk = (f.trk.getAttribute('data-track') || '0 1').split(' '), k = sg(q, +tk[0], +tk[1]), x = -(f.trk.scrollWidth - W) * k;
      if (f.trk.__x !== x){ f.trk.__x = x; f.trk.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)'; } }
    if (f.seg){ var S = f.seg, n = S.length / 4, p = sg(q, .02, 1.05), al = 1 - sg(q, 1.35, 1.9); if (p > 0 && al > 0){
      var iw = Math.max(W, H * f.ar), ih = iw / f.ar, ox = (W - iw) / 2, oy = (H - ih) / 2, span = n * .22, head = p * (n + span);
      ink(.9 * al, 1); g.beginPath();
      for (i = 0; i < n; i++){ var d = c01((head - i) / span); if (d <= 0) break; d = eo(d);
        var ax = ox + S[i * 4] / 1000 * iw, ay = oy + S[i * 4 + 1] / 1000 * ih, bx = ox + S[i * 4 + 2] / 1000 * iw, by = oy + S[i * 4 + 3] / 1000 * ih;
        g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * d, ay + (by - ay) * d); }
      g.stroke(); } }
    if (f.zf) zfDraw(f, q, t);
  }
  /* ---------- film: key — «Every Home Unique. One CI Standard» (Portfolio; her choice of 15.11 20:00 between two sketches, after the list, the large
     type and the abstract contours had all missed: the picture must read at once).
     One blank — the CI standard. The cuts — the six steps of the process, a blue pin resting in each; how deep each cut goes is the home's own:
     no two keys are cut alike, and the cuts keep gliding to the next key (with data-seed they stand still).
     16.11 12:16, her word: «ключ дуже великий… таких великих ключів немає» — of three stills she took А: the key has a real key's proportions
     (the blade hardly longer than the bow is wide) and is 519 long instead of 1424; the cuts stand close, so every cut is led out by a thin line
     to its name, and the names stand in a row under the key, 216 apart, the cuts' middle over the middle of the row.
     The site's line draws in to the key's length and opens into the blank; the cuts are made one after another, each with its line and its name.
     In the flow (phones) the key stands upright and the names stand in a column to its right, led out the same way; it draws itself once.
     Key space: a — along the key (0 in its middle, the bow at the minus end), c — across it (plus = the side of the cuts), in key units. */
  var KY = {T0: .7, D: .36, PER: 4.2, seed: reduced ? 7 : Math.floor(Math.random() * 1e6), BLUE: '150,168,191', RB: 100, HB: 68, SH: 12, NS: 30, BL: 300, C0: 34.6, SP: 38, M: 17, F: 5, sets: {}};
  function keySet(n, seed, cnt){
    var id = (seed || 0) + ':' + n + ':' + cnt; if (KY.sets[id]) return KY.sets[id];
    var o = [], i, prev = -1, sd = seed || KY.seed; for (i = 0; i < cnt; i++){ var x = Math.sin((sd + n * 131.7 + i * 17.3) * 12.9898) * 43758.5453; x -= Math.floor(x); var lv = Math.min(4, Math.floor(x * 5)); if (lv === prev) lv = (lv + 2) % 5; prev = lv; o.push(9 + lv * 5.2); }
    KY.sets[id] = o; return o;
  }
  function key(f, q, t){
    var flow = f.cw > 0, w = flow ? f.cw : W, h = flow ? f.ch : H, i, j, N = Math.max(1, f.names.length || 6);
    var hb = KY.HB / 2, sh = KY.SH, f0 = Math.asin((hb + sh) / KY.RB), L = KY.RB * (1 + Math.cos(f0)) + KY.NS + KY.BL, AB = -L / 2 + KY.RB, x0 = AB + KY.RB * Math.cos(f0), xt = x0 + KY.NS + KY.BL;
    var sp = N > 1 ? Math.min(KY.SP, (KY.BL - KY.C0 - 58) / (N - 1)) : 0, cmid = x0 + KY.NS + KY.C0 + sp * (N - 1) / 2;
    var s = flow ? Math.min(h - 36, 300) / L : U, kx = flow ? Math.round(Math.max(KY.RB * s + 14, w * .2)) + .5 : w / 2, ky = flow ? h / 2 : MID - Math.round(40 * U);
    if (flow){ if (!f.tv){ var cr = f.cv.getBoundingClientRect(); if (cr.top < H * .72 && cr.bottom > 0) f.tv = t; } q = reduced ? 9 : f.tv ? .05 + (t - f.tv) * .5 : 0; }
    else if (reduced && q > .05) q = Math.max(q, 9);
    var k1 = eio(sg(q, .05, .34)), k = eio(sg(q, .3, .62));
    function P(a, c){ return flow ? [kx + c * k * s, ky + a * s] : [kx + a * s, ky + c * k * s]; }
    function poly(pt, f01){ var tot = 0, ls = [], a; for (a = 1; a < pt.length; a++){ var l = Math.sqrt(Math.pow(pt[a][0] - pt[a - 1][0], 2) + Math.pow(pt[a][1] - pt[a - 1][1], 2)); ls.push(l); tot += l; }
      var rem = tot * f01; g.beginPath(); g.moveTo(pt[0][0], pt[0][1]); for (a = 1; a < pt.length && rem > 0; a++){ var u = Math.min(1, rem / ls[a - 1]); g.lineTo(lerp(pt[a - 1][0], pt[a][0], u), lerp(pt[a - 1][1], pt[a][1], u)); rem -= ls[a - 1]; } g.stroke(); }
    ink(1);
    if (k <= 0){   /* the site's line draws in to the key's length (and, on a screen, to the key's height) */
      if (flow){ var hl = L / 2 * s * k1; if (hl > 0) seg(kx, ky - hl, kx, ky + hl); }
      else { var ya = lerp(MID, ky, k1); seg(lerp(-10, kx - L / 2 * s, k1), ya, lerp(w + 10, kx + L / 2 * s, k1), ya); }
      return; }
    /* this key's cuts: with data-seed they stand still; on Portfolio they glide from one key to the next */
    var tt = reduced || f.seed ? 0 : t, n = Math.floor(tt / KY.PER), e = eio(sg(tt / KY.PER - n, 0, .28)), A = keySet(n, f.seed, N), B = keySet(n + 1, f.seed, N), d = [], pr = [], ca = [];
    for (i = 0; i < N; i++){ pr.push(eo(sg(q, KY.T0 + i * KY.D, KY.T0 + i * KY.D + .3))); d.push(lerp(A[i], B[i], e) * pr[i]); ca.push(x0 + KY.NS + KY.C0 + i * sp); }
    var pts = [], NA = 72;
    for (j = 0; j <= NA; j++){ var ph = f0 + (6.2831853 - 2 * f0) * j / NA; pts.push([AB + KY.RB * Math.cos(ph), KY.RB * Math.sin(ph)]); }
    pts.push([x0 + KY.NS, -hb - sh], [x0 + KY.NS, -hb], [xt - 38, -hb], [xt, -4], [xt, 8], [xt - 16, hb]);
    for (i = N - 1; i >= 0; i--) pts.push([ca[i] + KY.M, hb], [ca[i] + KY.F, hb - d[i]], [ca[i] - KY.F, hb - d[i]], [ca[i] - KY.M, hb]);
    pts.push([x0 + KY.NS, hb], [x0 + KY.NS, hb + sh]);
    g.lineJoin = 'miter'; g.beginPath(); for (j = 0; j < pts.length; j++){ var p = P(pts[j][0], pts[j][1]); if (j) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); } g.closePath(); g.stroke(); g.lineJoin = 'round';
    /* the hole of the bow and the groove of the blade come as the blank opens */
    var ga = sg(k, .55, 1);
    if (ga > 0){ ink(ga); g.beginPath(); for (j = 0; j <= 48; j++){ var hp = P(AB - 46 + 22 * Math.cos(j / 48 * 6.2831853), 22 * Math.sin(j / 48 * 6.2831853)); if (j) g.lineTo(hp[0], hp[1]); else g.moveTo(hp[0], hp[1]); } g.stroke();
      var g0 = P(x0 + KY.NS + 14, -11), g1 = P(xt - 48, -11); seg(g0[0], g0[1], g1[0], g1[1]); }
    /* the pins, the lines that lead each cut out, and the names (a name in square brackets is the client's placeholder: at half strength) */
    var px = Math.max(10, 14 * U), s6 = Math.max(5, 7 * U), LS = flow ? 30 : 216 * U; g.font = '400 ' + px.toFixed(2) + 'px "Zalando Sans Expanded", sans-serif'; g.textBaseline = 'alphabetic';
    for (i = 0; i < N; i++){
      var T = KY.T0 + i * KY.D, pa = sg(pr[i], .3, 1), lp = eio(sg(q, T + .06, T + .34)), la = sg(q, T + .24, T + .42), nm = f.names[i];
      if (pa > 0){ var pp = P(ca[i], hb - d[i] + 8); g.fillStyle = 'rgba(' + KY.BLUE + ',' + pa.toFixed(3) + ')'; g.fillRect(Math.round(pp[0] - s6 / 2), Math.round(pp[1] - s6 / 2), Math.round(s6), Math.round(s6)); }
      if (lp <= 0 || !nm) continue;
      var c0 = P(ca[i], hb), lx, ly, pth;
      if (flow){ ly = Math.round(ky + cmid * s + (i - (N - 1) / 2) * LS) + .5; var cy0 = Math.round(c0[1]) + .5, xa = c0[0] + 5; lx = xa + 84; pth = [[xa, cy0], [xa + 14, cy0], [xa + 66, ly], [lx - 6, ly]]; }
      else { lx = Math.round(w / 2 + (i - (N - 1) / 2) * LS) + .5; var cx0 = Math.round(c0[0]) + .5, yl = Math.round(ky + (122 + 17 * (lx < cx0 ? i : N - 1 - i)) * U) + .5; ly = ky + 247 * U; if (Math.abs(lx - cx0) < 1.5) cx0 = lx;
        pth = cx0 === lx ? [[lx, c0[1] + 6 * U], [lx, ky + 219 * U]] : /[?&#]ko=1/.test(location.search + location.hash) ? [[cx0, c0[1] + 6 * U], [cx0, yl], [lx, yl], [lx, ky + 219 * U]] : [[cx0, c0[1] + 6 * U], [cx0, ky + 125 * U], [lx, ky + 199 * U], [lx, ky + 219 * U]]; }
      ink(.33, 1); poly(pth, lp);
      if (la <= 0) continue;
      var hold = nm[0].charAt(0) === '[', v = nm[0].toUpperCase(), ad = nm[1].toUpperCase(), wh = 'rgba(255,255,255,' + (la * (hold ? .5 : 1)).toFixed(3) + ')', bl = hold ? wh : 'rgba(' + KY.BLUE + ',' + la.toFixed(3) + ')';
      if (flow){ g.textAlign = 'left'; g.fillStyle = wh; g.fillText(v, lx, ly + px * .36); g.fillStyle = bl; g.fillText(ad, lx + g.measureText(v + ' ').width, ly + px * .36); }
      else { var ty = ly + (1 - la) * 6 * U; g.textAlign = 'center'; g.fillStyle = wh; g.fillText(v, lx, ty); g.fillStyle = bl; g.fillText(ad, lx, ty + px * 1.3); }
    }
  }
  /* ---------- film: many — «Why the Details Matter» on a project's page (15.11): «Every project contains hundreds of individual decisions. The
     success of the home comes from making them feel like one idea». Hundreds of short strokes lie about, each its own way; a front passes from
     left to right and behind it they turn, close up and are one line — the site's line. The strokes that carry a name (the page's design
     decisions) are blue; once in the line each is a blue square on it. In the flow (phones) the front passes once, by time. */
  var MN = {N: 260, st: null};
  function manySet(){
    if (MN.st) return MN.st; var sd = 7, o = [], i; function rnd(){ sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
    for (i = 0; i < MN.N; i++) o.push({dx: (rnd() - .5) * 420, dy: (rnd() - .5) * 460, a: (rnd() - .5) * 3.14, l: 24 + rnd() * 44, j: rnd() * .25, w: .4 + rnd() * .8, p: rnd() * 6.28});
    MN.st = o; return o;
  }
  function many(f, q, t){
    var flow = f.cw > 0, w = flow ? f.cw : W, h = flow ? f.ch : H, mid = flow ? Math.round(h / 2) + .5 : MID, s = flow ? w / 1560 : U, i, S = manySet(), N = MN.N, M = f.names.length;
    if (flow){ if (!f.tv){ var cr = f.cv.getBoundingClientRect(); if (cr.top < H * .72 && cr.bottom > 0) f.tv = t; } q = reduced ? 9 : f.tv ? .5 + (t - f.tv) * .45 : 0; }
    else if (reduced && q > .05) q = Math.max(q, 9);
    var al = sg(q, -.45, .15), fr = sg(q, .5, 2.9), x0 = w / 2 - 700 * s, x1 = w / 2 + 700 * s, L = (x1 - x0) / N, tm = reduced ? 0 : t;
    if (al <= 0) return;
    var px = Math.max(10, 14 * U), s8 = Math.max(5, 8 * U); g.font = '400 ' + px.toFixed(2) + 'px "Zalando Sans Expanded", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.lineCap = 'butt';
    for (i = 0; i < N; i++){
      var o = S[i], txn = (i + .5) / N, d = c01((fr * 1.47 - txn) / .45 - o.j), k = d * d * (3 - 2 * d), tx = x0 + (i + .5) * L, fl = (1 - k) * 5 * s;
      var x = lerp(tx + o.dx * s + Math.sin(tm * .31 * o.w + o.p) * fl, tx, k), y = lerp(mid + o.dy * s + Math.cos(tm * .27 * o.w + o.p) * fl, mid, k), a = (o.a + Math.sin(tm * .2 * o.w + o.p) * .12) * (1 - k), l = lerp(o.l * s, L + .6, k) / 2;
      var mi = -1, mm; for (mm = 0; mm < M; mm++) if (i === Math.round((mm + .5) / M * N)) mi = mm;
      if (mi >= 0){ g.strokeStyle = 'rgba(' + KY.BLUE + ',' + al.toFixed(3) + ')'; g.lineWidth = 2.5; } else { g.strokeStyle = 'rgba(255,255,255,' + (al * (.55 + .45 * k)).toFixed(3) + ')'; g.lineWidth = LW; }
      g.beginPath(); g.moveTo(x - Math.cos(a) * l, y - Math.sin(a) * l); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      if (mi >= 0){
        if (k > .6){ var qa = sg(k, .6, 1) * al; g.fillStyle = 'rgba(' + KY.BLUE + ',' + qa.toFixed(3) + ')'; g.fillRect(Math.round(x - s8 / 2), Math.round(mid - s8 / 2), Math.round(s8), Math.round(s8)); }
        var nm = f.names[mi], lb = ((nm[0] + ' ' + nm[1]).trim()).toUpperCase(), hold = lb.charAt(0) === '['; if (hold) lb = lb.replace(/^\[|\]$/g, ''); if (flow) lb = ('0' + (mi + 1)).slice(-2);   /* in the flow there is no room for the names: their numbers */ g.fillStyle = 'rgba(255,255,255,' + (al * (hold ? .6 : 1)).toFixed(3) + ')'; g.fillText(lb, Math.max(px * lb.length * .36, Math.min(w - px * lb.length * .36, x)), lerp(y - 20 * s, mid - 22 * s, k)); }
    }
  }
  /* ---------- the cover flown through (Portfolio; her word of 15.11 20:25). The photograph is seen through the letters of the title: black, the letters
     white, multiplied over the photograph — drawn here, on the film's canvas, glyph by glyph where the page's own title has them.
     Arriving: the site's line draws across the middle (a hair of the photograph), then opens up and down like a blind and the letters are there.
     Scrolling: the picture grows about a point deep in a stroke of the first word (the thickest ink nearest the middle), until that stroke is
     the whole screen and the photograph stands whole — and the page scrolls on; the title is not said again. The photograph drifts a little against the pointer. */
  var ZF = {ready: !document.fonts, t0: 0, tx: 0, ty: 0, px: 0, py: 0};
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ZF.ready = true; dirty = true; });
  setTimeout(function(){ ZF.ready = true; }, 3000);
  window.addEventListener('pointermove', function(e){ ZF.tx = e.clientX / Math.max(1, W) - .5; ZF.ty = e.clientY / Math.max(1, H) - .5; }, {passive: true});
  /* the deepest point of a glyph's ink: [dx, dy, r] from its origin on the baseline, in px */
  function zfInk(ch, font, fpx){
    var k = 120 / fpx, pad = 6, n = Math.ceil(fpx * 1.5 * k) + pad * 2, cv = document.createElement('canvas'); cv.width = n; cv.height = n;
    var c = cv.getContext('2d'), by = pad + fpx * 1.1 * k; c.setTransform(k, 0, 0, k, pad, by); c.font = font; c.textBaseline = 'alphabetic'; c.fillStyle = '#000'; c.fillText(ch, 0, 0);
    var d; try { d = c.getImageData(0, 0, n, n).data; } catch (e) { return null; }
    function ink(x, y){ return x >= 0 && y >= 0 && x < n && y < n && d[(y * n + x) * 4 + 3] > 127; }
    var best = null, DIR = 16, x, y, a, r;
    for (y = pad; y < n - pad; y += 2) for (x = pad; x < n - pad; x += 2){ if (!ink(x, y)) continue; var m = 1e9;
      for (a = 0; a < DIR && m > (best ? best[2] : 0); a++){ var cx = Math.cos(a * 6.2831853 / DIR), sy = Math.sin(a * 6.2831853 / DIR); for (r = 1; r < m; r++) if (!ink(Math.round(x + cx * r), Math.round(y + sy * r))) break; m = Math.min(m, r); }
      if (!best || m > best[2]) best = [x, y, m]; }
    return best ? [(best[0] - pad) / k, (best[1] - by) / k, best[2] / k] : null;
  }
  function zfMeasure(f){
    var stg = qs('.stg', f.el), hi = qs('.sn-mask .sn-hi', f.el); if (!stg || !hi || getComputedStyle(f.cv).display === 'none') return null;
    var sr = stg.getBoundingClientRect(), cs = getComputedStyle(hi), fpx = parseFloat(cs.fontSize), font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily, up = cs.textTransform === 'uppercase';
    /* the first line's baseline, from a probe; the other lines stand as far below it as their boxes do */
    var pr = document.createElement('span'); pr.style.cssText = 'display:inline-block;width:0;height:0'; hi.insertBefore(pr, hi.firstChild); var b1 = pr.getBoundingClientRect().bottom - sr.top; hi.removeChild(pr);
    var ch = [], tw = document.createTreeWalker(hi, NodeFilter.SHOW_TEXT), nd, rg = document.createRange(), t1 = null, top = 1e9, bot = -1e9, i;
    while ((nd = tw.nextNode())) for (i = 0; i < nd.nodeValue.length; i++){ var c = nd.nodeValue.charAt(i); if (/\s/.test(c)) continue; rg.setStart(nd, i); rg.setEnd(nd, i + 1); var r = rg.getBoundingClientRect(); if (!r.width) continue;
      if (t1 === null) t1 = r.top; var y = b1 + (r.top - t1); ch.push({c: up ? c.toUpperCase() : c, x: r.left - sr.left, y: y, l1: Math.abs(r.top - t1) < 2}); top = Math.min(top, y - fpx * .75); bot = Math.max(bot, y); }
    if (!ch.length) return null;
    /* where to fly in: the ink of the first word that needs the least growth to fill the screen */
    var best = null, seen = {};
    ch.forEach(function(o){ if (!o.l1) return; var k = seen[o.c] || (seen[o.c] = zfInk(o.c, font, fpx)); if (!k) return; var ox = o.x + k[0], oy = o.y + k[1];
      var far = Math.sqrt(Math.pow(Math.max(ox, W - ox), 2) + Math.pow(Math.max(oy, H - oy), 2)), S = far / Math.max(1, k[2] - .75) * 1.1; if (!best || S < best.S) best = {ox: ox, oy: oy, S: S}; });
    if (!best) return null;
    return {ch: ch, font: font, ox: best.ox, oy: best.oy, S: best.S, cy: (top + bot) / 2, bh: bot - top, full: qs('.sn-full', f.el), kick: qs('.sn-k', f.el), mask: qs('.sn-mask', f.el), ko: -1, pk: ''};
  }
  function zfDraw(f, q, t){
    if (!ZF.ready) return;
    if (!f.zm){ f.zm = zfMeasure(f) || {off: 1, mask: qs('.sn-mask', f.el)}; f.el.classList.toggle('zon', !f.zm.off); f.el.classList.toggle('zx', !!f.zm.off); if (!ZF.t0) ZF.t0 = q > .05 || reduced ? t - 9 : t; }
    var Z = f.zm, i;
    if (Z.off){ if (Z.mask){ var mo = (1 - sg(q, .55, 1.35)).toFixed(3); if (Z.mo !== mo){ Z.mo = mo; Z.mask.style.opacity = mo; } } return; }
    var tE = t - ZF.t0, e = c01((q - .04) / .96), s = Math.exp(Math.log(Z.S) * Math.pow(e, 1.45));
    /* the photograph: it settles as the page arrives and gives a little against the pointer */
    if (Z.full && !reduced){ ZF.px += (ZF.tx - ZF.px) * .05; ZF.py += (ZF.ty - ZF.py) * .05; var k = 1 - e, sc = 1.04 + .05 * (1 - eo(sg(tE, 0, 3.2))), pk = (-ZF.px * 30 * U * k).toFixed(1) + ',' + (-ZF.py * 20 * U * k).toFixed(1) + ',' + sc.toFixed(4);
      if (pk !== Z.pk){ Z.pk = pk; var pp = pk.split(','); Z.full.style.transform = 'translate3d(' + pp[0] + 'px,' + pp[1] + 'px,0) scale(' + pp[2] + ')'; } }
    /* the page's name: it comes after the letters and leaves as the flight begins */
    var ko = sg(tE, 1.9, 2.6) * (1 - sg(q, .02, .15)); ko = Math.round(ko * 1000) / 1000;
    if (Z.kick && ko !== Z.ko){ Z.ko = ko; Z.kick.style.opacity = ko; }
    if (e >= 1) return;   /* flown through: the photograph whole */
    var full = Z.bh / 2 + 24 * U, hh = lerp(.75, full, eio(sg(tE, .7, 2.1))), hw = W / 2 * eo(sg(tE, .15, .9)), la = 1 - sg(tE, .9, 1.6);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(Z.ox, Z.oy); g.scale(s, s); g.translate(-Z.ox, -Z.oy);
    if (hh < full){ g.beginPath(); g.rect(-10, Z.cy - hh, W + 20, hh * 2); g.clip(); }
    g.fillStyle = '#FFFFFF'; g.font = Z.font; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    for (i = 0; i < Z.ch.length; i++) g.fillText(Z.ch[i].c, Z.ch[i].x, Z.ch[i].y);
    g.restore();
    if (la > 0 && hw > 0 && e <= 0){ g.fillStyle = 'rgba(255,255,255,' + la.toFixed(3) + ')'; g.fillRect(W / 2 - hw, Math.round(Z.cy) - .75, hw * 2, 1.5); }
  }
  /* ---------- film: wall — the cover of «Collectors Home». The photograph lights up pane by pane behind thin bars (6 × 4, the site's one pen) —
     the arrival she kept (15.11 22:27). Nothing else moves: every passage that turned the cover into a small picture was refused (15.11 22:41–
     22:53), and after her reference of 16.11 the page simply scrolls on; the bars leave as the cover goes. */
  var WL = {C: 6, R: 4, t0: 0, ord: null};
  function wall(f, q, t){
    if (getComputedStyle(f.cv).display === 'none') return;
    if (!WL.t0) WL.t0 = q > .05 || reduced ? t - 9 : t;
    var C = WL.C, R = WL.R, c, r, i, n = C * R, tE = t - WL.t0, pw = W / C, pv = H / R;
    if (!WL.ord){ var sd = 11, a = []; for (i = 0; i < n; i++) a.push(i); for (i = n - 1; i > 0; i--){ sd = (sd * 16807) % 2147483647; var j = sd % (i + 1), tmp = a[i]; a[i] = a[j]; a[j] = tmp; } WL.ord = []; for (i = 0; i < n; i++) WL.ord[a[i]] = i; }
    if (tE < 2.3) for (r = 0; r < R; r++) for (c = 0; c < C; c++){ var lt = .2 + WL.ord[r * C + c] / n * 1.25, al = 1 - sg(tE, lt, lt + .5); if (al <= 0) continue;
      g.fillStyle = 'rgba(0,0,0,' + al.toFixed(3) + ')'; g.fillRect(c * pw - 1, r * pv - 1, pw + 2, pv + 2); }
    var ba = .33 * sg(tE, 0, .6) * (1 - sg(q, .05, .5));
    if (ba > 0){ g.fillStyle = 'rgba(255,255,255,' + ba.toFixed(3) + ')'; for (c = 1; c < C; c++) g.fillRect(Math.round(c * pw), 0, 1, H); for (r = 1; r < R; r++) g.fillRect(0, Math.round(r * pv), W, 1); }
  }
  /* ---------- film: doors — CI Turnkey (16.11.2026). Their own line: «hand you the keys to the life waiting on the other side». Eight thresholds
     stand one behind another in the site's hairlines; the scroll walks through them, one stage at a time, and the last one opens on the home.
     The thresholds stand on the right half of the screen, so the stage's name and its sentence keep the text line to themselves. */
  /* CI Core's cover: the room stands as the drawing its own lines make, and the scroll builds it into the photograph. The figure draws
     nothing itself — the two pictures are scrubbed. */
  function drawn(f, q, t){
    for (var i = 0; i < f.sc.length; i++) runScrub(f.sc[i], q);
  }
  /* CI Turnkey's cover before the WebGL layer: the same move in clip-path. Kept as the figure for a context that is refused. */
  function horiz(f, q, t){
    for (var i = 0; i < f.sc.length; i++) runScrub(f.sc[i], q);
    horizLine(f, q);
  }
  /* ================================================================== CI Turnkey, 18.11.2026: three more films
     count — her frame 643:8641. The four counts and, beside them, what the count in hand is made of. The scroll walks them one by one;
     the pointer or the keyboard takes one in hand.
     16:56, on the first build (nine / forty / a hundred lines gathering into one in the panel): «мені не подобаються оті лінії, вони
     якісь безсмисляні. Придумай іншу анімацію, елегантнішу, мінімалістичнішу і преміальнішу.» A figure that has to be decoded is not
     one; and her frame keeps the panel empty between the number and the content. So nothing is drawn there. What moves is what the
     block already has: along the foot of the count in hand the page's own white line is ruled over its hairline, exactly as far as
     the scroll has carried the reader through that count, our square at its tip — when it reaches the end of the table the next count
     takes over; the panel's number rolls; the content comes in line by line (css). */
  function count(f, q, t){
    var c = f.ct;
    if (!c){
      var gE = qs('[data-count]', f.el);
      c = f.ct = {rows: qsa('.tk-ct-r', gE), ps: qsa('.tk-ct-p', gE), d: qs('.tk-ct-d', gE), cur: -1, hov: -1, p: 0, prev: -1, pp: 0, pt: 0};
      c.rows.forEach(function(r, i){
        function take(){ c.hov = i; c.hq = f.q; }
        r.addEventListener('pointerenter', take); r.addEventListener('pointermove', take); r.addEventListener('focus', take);
        r.addEventListener('blur', function(){ if (c.hov === i) c.hov = -1; });
      });
      qs('.tk-ct-t', gE).addEventListener('pointerleave', function(){ c.hov = -1; });
    }
    if (H >= W) return;                                                     /* phones read the four and their contents straight down (css) */
    /* a count is in hand while the pointer MOVES on it; once the page is scrolled on, the scroll walks the counts again — a pointer
       left lying on the table must not hold the block still */
    if (c.hov >= 0 && Math.abs(q - c.hq) > .04) c.hov = -1;
    var ST = [.2, .8, 1.4, 2, 2.6], on = c.hov >= 0 ? c.hov : q < ST[1] ? 0 : q < ST[2] ? 1 : q < ST[3] ? 2 : 3;
    if (on !== c.cur){
      if (c.cur >= 0){ c.prev = c.cur; c.pp = c.p; c.pt = t; }
      c.cur = on; c.p = 0;
      c.rows.forEach(function(e, i){ e.classList.toggle('on', i === on); });
      c.ps.forEach(function(e, i){ e.classList.toggle('on', i === on); });
      c.d.style.setProperty('--i', on);
    }
    /* how far the line has got: with the scroll through this count; all the way, in one stroke, under a count taken by the pointer */
    var tgt = c.hov >= 0 ? 1 : sg(q, ST[on], ST[on + 1]);
    c.p = reduced ? tgt : c.p + (tgt - c.p) * (c.hov >= 0 ? .11 : .3); if (Math.abs(tgt - c.p) < .0015) c.p = tgt;
    var sr = f.cv.getBoundingClientRect();
    function rule(i, p, a){
      var r = c.rows[i].getBoundingClientRect(); if (r.width < 40 || p <= .002 || a <= .004) return;
      var x0 = r.left - sr.left, y = Math.round(r.bottom - sr.top) - .5, x1 = x0 + r.width * p;
      ink(a, 1); seg(x0, y, x1, y);
      g.globalAlpha = a; g.fillStyle = '#96A8BF'; g.fillRect(Math.round(Math.min(x1, x0 + r.width - SQ / 2) - SQ / 2), Math.round(y - SQ / 2), Math.round(SQ), Math.round(SQ)); g.globalAlpha = 1;
    }
    rule(on, c.p, 1);
    if (c.prev >= 0){ var a = 1 - c01((t - c.pt) / .45); if (a > 0) rule(c.prev, c.pp, a); else c.prev = -1; }   /* the line of the count just left goes out */
  }
  /* team — her frames 644:8972 → 633:428: «зліва внизу фотографія маленька. Коли ми скролимо, вона буде збільшуватись, ставати на весь
     екран, затемнюватись… і появляється інформація». The square of the photograph in the corner of the list grows until it is the
     screen. It is one layer over the list, seen through everywhere but where the picture is (so the picture covers the list as it
     grows — nothing fades); the picture is fitted to its frame at every moment, graded down as it fills the screen, and then the two
     centre hairlines are ruled and the client's sentence comes to their crossing (the film's moments). */
  var TEAM_FS = ['precision highp float;', 'uniform sampler2D uT0;', 'uniform vec2 uRes, uS0;', 'uniform vec4 uR;', 'uniform float uD, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  vec2 sz = uR.zw - uR.xy, uv = (v - uR.xy) / sz, px = sz * uRes;',
    '  float ra = px.x / px.y, ri = uS0.x / uS0.y;',
    '  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);',
    '  vec3 c = texture2D(uT0, (uv - 0.5) * s + 0.5).rgb;',
    '  c = (c - 0.5) * 1.04 + 0.5;',
    '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
    /* her grade of the plate, measured off her frames (exposure −0.45, contrast +0.04): the mids and the shadows come down to about
       four tenths, the lights keep three quarters; and her 34 % of dark once the picture is the screen */
    '  c *= 0.745 * mix(0.55, 1.0, smoothstep(0.45, 0.95, l)) * mix(1.0, 0.659, uD);',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  vec2 d = min(uv, 1.0 - uv) * px;',
    '  float a = clamp(min(d.x, d.y) + 0.5, 0.0, 1.0);',
    '  gl_FragColor = vec4(c * a, a);',
    '}'].join('\n');
  function team(f, q, t){
    if (f.glo === undefined){
      var box = qs('.tk-ot-ph', f.el);
      f.ph = box && qs('img', box);
      f.glo = box ? GL2.make(box, TEAM_FS, qsa('img', box), {alpha: true}) : null;
    }
    if (H >= W) return;                                                     /* phones: the list, the photograph, the sentence — in the flow (css) */
    var o = f.glo, foot = Math.max(58, 50 * U), s0 = 217 * U, e = eio(sg(q, .95, 1.95)), dim = sm(1.5, 2.2, q);
    var x0 = lerp(50 * U, 0, e), y0 = lerp(H - foot - s0, 0, e), x1 = lerp(50 * U + s0, W, e), y1 = lerp(H - foot, H, e);
    if (o && o.ready){ o.size(); o.gl.uniform4f(o.u('uR'), x0 / W, y0 / H, x1 / W, y1 / H); o.set1('uD', dim); o.set1('uTime', (t * 60) | 0); o.draw(); }
    else if (f.ph && !o){
      var key = x0.toFixed(1) + y0.toFixed(1) + x1.toFixed(1) + dim.toFixed(2);
      if (f.ph.__k !== key){ f.ph.__k = key; var st = f.ph.style; st.visibility = 'visible'; st.left = x0 + 'px'; st.top = y0 + 'px'; st.bottom = 'auto'; st.width = (x1 - x0) + 'px'; st.height = (y1 - y0) + 'px';
        st.filter = 'contrast(1.05) brightness(' + lerp(.6, .4, dim).toFixed(3) + ')'; }
    }
    cross(eio(sg(q, 1.96, 2.38)), eio(sg(q, 2.1, 2.52)));
  }
  /* strip — her frame 644:8827: the eight stages are a row of squares longer than the screen; the scroll carries it to the left until
     the last one stands at the right field. It moves exactly with the scroll (the wheel is already eased) */
  function strip(f, q, t){
    if (f.st === undefined) f.st = qs('[data-strip]', f.el);
    if (H >= W || !f.st) return;
    var x = -Math.max(0, f.st.scrollWidth - W) * sg(q, .16, f.len - .2), tf = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    if (f.st.__t !== tf){ f.st.__t = tf; f.st.style.transform = tf; }
  }
  /* loose — the ecosystem, her frame 652:9078 and her idea (18.11.2026 17:37): «охапка тексту… щоб текст при скролі розсипався… це як
     метафора, що вам цього не потрібно, не потрібно про це думати». The twenty-two names stand as one solid mass, exactly as drawn.
     On the scroll the mass lets go — not an explosion and not a fall: the squares that held the names together go first, then the
     names leave their lines one by one (a fixed shuffled order, so the paragraph thins out everywhere at once), each on its own
     slow course outwards, turning a few degrees, some towards the reader (larger, out of focus), some into the depth (smaller,
     dimmer). By NAME, not by letter: what leaves can still be read as it leaves. What is left is a clear screen and the sentence.
     The whole thing is scrubbed by the scroll, so scrolling back gathers the mass again. The type is the page's own type: only
     transform, opacity and blur are set on it, and a name at rest carries no style at all. */
  function loose(f, q, t){
    var o = f.lo, i;
    if (o === undefined){
      var par = qs('[data-loose]', f.el), its = par ? qsa('.sqr > span', par) : [];
      o = f.lo = its.length > 1 ? {p: par, its: its, n: its.length, k: '', on: false} : null;
      if (o){ var sd = 29, ord = [], j, tmp; var rnd = function(){ sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; };
        for (i = 0; i < o.n; i++) ord.push(i);
        for (i = o.n - 1; i > 0; i--){ j = Math.floor(rnd() * (i + 1)); tmp = ord[i]; ord[i] = ord[j]; ord[j] = tmp; }
        o.rank = []; ord.forEach(function(ix, r){ o.rank[ix] = r; });
        o.r = its.map(function(){ return [rnd(), rnd(), rnd(), rnd()]; });
        o.key = its.map(function(){ return ''; }); o.ps = its.map(function(){ return 0; });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ o.k = ''; }); }   /* the lines are read again in the real face */
    }
    if (!o) return;
    if (f.el.hasAttribute('data-stay')) return;                              /* the other solutions: the names are what is included — they stand */
    function rest(e){ var st = e.style; st.transform = ''; st.opacity = ''; st.filter = ''; st.visibility = ''; st.willChange = ''; e.style.removeProperty('--q'); }
    if (o.aft === undefined) o.aft = qs('.tk-lo-a', f.el) || null;
    if (H >= W){ if (o.on){ o.on = false; o.k = ''; o.p.classList.remove('fx'); o.its.forEach(rest); if (o.aft){ o.aft.__k = ''; o.aft.style.cssText = ''; } } return; }   /* phones: the mass stands, in the flow */
    if (o.aft){ var ai = eio(sg(q, 1.62, 1.98)), ak = ai.toFixed(3);         /* the screen the names have left carries what the client has instead */
      if (o.aft.__k !== ak){ o.aft.__k = ak; var as = o.aft.style; as.opacity = ak; as.visibility = ai <= .001 ? 'hidden' : 'visible'; as.transform = 'translate3d(0,' + (16 * U * (1 - ai)).toFixed(1) + 'px,0)'; } }
    var lk = W + 'x' + H;
    if (o.k !== lk){                                                       /* the places, read from the page as it is laid out */
      o.k = lk; o.on = true; o.its.forEach(rest); o.p.classList.add('fx');
      var pr = o.p.getBoundingClientRect(), last = -1e9;
      o.c = o.its.map(function(e){ var r = e.getBoundingClientRect(), hd = Math.abs(r.top - last) > 4; last = r.top; e.classList.toggle('h', hd);
        return [(r.left + r.width / 2 - pr.left - pr.width / 2) / (pr.width / 2), (r.top + r.height / 2 - pr.top - pr.height / 2) / (pr.height / 2)]; });
      for (i = 0; i < o.n; i++) o.key[i] = '';
    }
    if (f.gat === undefined){ var ga = f.el.getAttribute('data-gather'); f.gat = ga == null ? -1 : +ga; }
    var gat = f.gat, A = gat >= 0 ? -.12 : .22, B = gat >= 0 ? .5 : .98, D = gat >= 0 ? .66 : .72;   /* the first lets go at .22 of a screen, the last at .98; each takes .72 */
    /* gather (CI Core): the same course run backwards — a name is away and out of focus until the scroll reaches it, then comes home */
    for (i = 0; i < o.n; i++){ var raw = c01((q - A - o.rank[i] / (o.n - 1) * (B - A)) / D); o.ps[i] = gat >= 0 ? 1 - raw : raw; }
    for (i = 0; i < o.n; i++){
      var p = o.ps[i], sqv = 1 - c01(Math.max(p, i ? o.ps[i - 1] : 0) * 6), ky = (p * 1000 | 0) + '/' + (sqv * 100 | 0);
      if (ky === o.key[i]) continue; o.key[i] = ky;
      var e = o.its[i], st = e.style;
      if (sqv >= 1) st.removeProperty('--q'); else st.setProperty('--q', sqv.toFixed(3));
      if (p <= 0){ st.transform = ''; st.opacity = ''; st.filter = ''; st.visibility = ''; st.willChange = ''; continue; }
      if (p >= 1){ st.visibility = 'hidden'; st.willChange = ''; continue; }
      var r = o.r[i], c = o.c[i], z = r[2] * 2 - 1, m = Math.pow(p, 1.9),                        /* reluctant at first, then it floats */
          ang = gat >= 0 ? (i < gat ? Math.PI : 0) + (r[0] - .5) * .9 + c[1] * .22 * (i < gat ? -1 : 1)     /* the design side from the left, the build side from the right */
                         : Math.atan2(c[1] * .55 - .14, c[0]) + (r[0] - .5) * 1.15,
          dist = (.15 + .2 * r[1]) * W * (1 + .5 * z) * m,
          sc = 1 + m * (z >= 0 ? .7 * z : .42 * z), rot = m * (r[3] - .5) * 20,
          bl = Math.pow(p, .75) * (4 + 9 * Math.abs(z)) * U, al = 1 - .25 * sm(0, .25, p) - .75 * sm(.3, .96, p);   /* the focus goes before the place does: a name that has moved is already on another plane */
      st.visibility = ''; st.willChange = 'transform, opacity, filter';
      st.transform = 'translate3d(' + (Math.cos(ang) * dist).toFixed(1) + 'px,' + (Math.sin(ang) * dist).toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
      st.opacity = al.toFixed(3); st.filter = bl > .25 ? 'blur(' + bl.toFixed(2) + 'px)' : '';
    }
  }
  /* recv — «What You Receive» on a photograph, her frames 658:9130 / 658:9201 / 658:9234 (18.11.2026 20:19): «спочатку така
     типографія, як на першому слайді. Далі пропадає, і по горизонтальній лінії при скролі ідуть оці блочки… починається з по
     центру, і при скролі вони рухаються вліво… прорухалися, текст пропав і появився текст той, що на третьому фреймі.»
     The picture is one WebGL layer: fitted to the screen, pushed in a little about a point on its upper edge, darkened as her
     frame darkens it (her veil of 46.5 % is a multiply by .535 — done in the shader, nothing is laid over the picture). The two
     centre hairlines are ruled on the film's canvas as the block arrives and stay. Step 1 (the name and the title; the lead and
     the paragraph on the foot) goes at .62–.9. Step 2: the caption, and the six pairs as a row on the horizontal line — it comes
     in with the first pair on the crossing and then moves exactly with the scroll (1.22 → 2.62) until the sixth stands there.
     Step 3: the row and the caption go and the closing sentence comes into focus on the crossing. */
  var RECV_FS = ['precision highp float;', 'uniform sampler2D uT0;', 'uniform vec2 uRes, uS0, uP;', 'uniform float uZ, uD, uV, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  float ra = uRes.x / uRes.y, ri = uS0.x / uS0.y;',
    '  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);',
    /* across: fitted to the screen and pushed in about uP.x; down: the picture's upper edge is ALWAYS the same row of the photograph
       (uP.y of its height), whatever the window's proportions — on a low wide window the wall the type stands on must not be cut */
    '  vec2 src = vec2((uP.x + (v.x - uP.x) / uZ - 0.5) * s.x + 0.5, uP.y + v.y * s.y / uZ);',
    '  vec3 c = texture2D(uT0, src).rgb;',
    '  c = (c - 0.5) * 1.05 + 0.5;',
    '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
    '  c *= mix(1.0, mix(0.94, 0.6, smoothstep(0.16, 0.72, l)), uD) * uV;',  /* the light of the picture comes down; then her darkening of the whole */
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function recv(f, q, t){
    var o = f.rc, i;
    if (o === undefined){
      var box = qs('.tk-rc-ph', f.el);
      o = f.rc = {gl: box ? GL2.make(box, RECV_FS, qsa('img', box), {}) : null, img: box && qs('img', box), h: qs('.tk-rc-h', f.el), l: qs('.tk-rc-l', f.el), p: qs('.tk-rc-p', f.el),
                  k: qs('.tk-rc-k', f.el), w: qs('.tk-rc-w', f.el), row: qs('.tk-rc-row', f.el), bs: qsa('.tk-rc-b', f.el), c: qs('.tk-rc-c', f.el), on: false, lk: '', c0: 0, c1: 0};
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ o.lk = ''; });
    }
    function put(e, op, tf, fl){ if (!e) return; var k = op.toFixed(3) + tf + (fl || ''); if (e.__k === k) return; e.__k = k;
      var st = e.style; st.opacity = op.toFixed(3); st.transform = tf; if (fl !== undefined) st.filter = fl; st.visibility = op <= .001 ? 'hidden' : 'visible'; }
    function clr(e){ if (!e) return; e.__k = ''; var st = e.style; st.opacity = ''; st.transform = ''; st.filter = ''; st.visibility = ''; }
    if (H >= W){ if (o.on){ o.on = false; o.lk = ''; [o.h, o.l, o.p, o.k, o.w, o.row, o.c].forEach(clr); if (o.img) o.img.style.transform = ''; } return; }   /* phones: in the flow (css) */
    o.on = true;
    var z = 1.16 + .06 * eio(sg(q, .55, 1.25)) + .03 * eio(sg(q, 2.5, 3.2)), g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); g2.set2('uP', .62, .105); g2.set1('uZ', z); g2.set1('uD', .7); g2.set1('uV', .535); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
    else if (o.img && !g2){ var tz = 'scale(' + z.toFixed(4) + ')'; if (o.img.__t !== tz){ o.img.__t = tz; o.img.style.transform = tz; } }
    cross(eio(sg(q, -.7, -.15)), eio(sg(q, -.55, 0)));                       /* the two centre hairlines: ruled as the block arrives, then they stand */
    var ho = 1 - eio(sg(q, .62, .9)), up = 'translate3d(0,' + (-16 * U * (1 - ho)).toFixed(1) + 'px,0)';   /* step 1 goes up a little as it goes out */
    put(o.h, ho, up); put(o.l, ho, up); put(o.p, ho, up);
    var lk = W + 'x' + H;
    if (o.lk !== lk && o.bs.length){ o.lk = lk;                               /* where each pair's middle stands in the row */
      var a = o.bs[0], b = o.bs[o.bs.length - 1]; o.c0 = a.offsetLeft + a.offsetWidth / 2; o.c1 = b.offsetLeft + b.offsetWidth / 2; }
    var xi = eio(sg(q, .92, 1.2)), xo = 1 - eio(sg(q, 2.68, 2.88)), tr = sg(q, 1.22, 2.62);
    put(o.k, xi * xo, 'translate3d(0,' + (10 * U * (1 - xi)).toFixed(1) + 'px,0)');
    put(o.w, xi * xo, 'none');
    var rx = -(o.c0 + (o.c1 - o.c0) * tr) + 70 * U * (1 - xi), rt = 'translate3d(' + rx.toFixed(1) + 'px,0,0)';
    if (o.row && o.row.__t !== rt){ o.row.__t = rt; o.row.style.transform = rt; }
    var ci = eio(sg(q, 2.86, 3.18)), bl = (1 - ci) * 8 * U;                  /* step 3 comes into focus */
    put(o.c, ci, 'translate3d(0,' + (14 * U * (1 - ci)).toFixed(1) + 'px,0)', bl > .2 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none');
  }
  /* ================================================================== CI Core, «What You Receive»: the drawing becomes the room
     18.11.2026 21:36, of the one-screen version: «він дуже грузний, дуже важкий»; 21:44, of the storyboard: «то, що рекомендуєш».
     One pinned screen, three steps, one thought to a step. The picture is one WebGL layer over the whole screen — the room's drawing
     (quiet: its ink at 42 %) left of a seam and the room itself right of it — and the SCROLL walks the seam: it stands on the right
     field while the title and the first paragraph are read, walks to the middle of the screen, where the client's two sentences
     stand either side of it (design on the drawing, construction on the room), and goes out at the left; the room is whole, its
     light comes back up, and the closing sentence stands alone. The seam's hairline and its square are ruled on the film's canvas
     (one crisp pixel), the drawing's lines light up a little where the seam passes them, the type is DOM. */
  var SEAM_FS = ['precision highp float;', 'uniform sampler2D uT0, uT1;', 'uniform vec2 uRes, uS0, uS1;', 'uniform float uX, uZ, uK, uD, uV, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'vec2 cov(vec2 uv, vec2 img){ float ra = uRes.x / uRes.y, ri = img.x / img.y; vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0); return (uv - 0.5) * s + 0.5; }',
    'void main(){',
    '  vec2 uv = (v - 0.5) / uZ + 0.5;',
    '  float d = v.x - uX, w = 1.0 / uRes.x;',
    '  float e = exp(-abs(d) * uRes.x / 30.0);',                              /* a hand's width either side of the seam */
    '  vec3 a = texture2D(uT0, cov(uv, uS0)).rgb * (uK + e * 0.45);',         /* 0 the drawing: quiet, and brighter where the seam passes it */
    '  vec3 b = texture2D(uT1, cov(uv, uS1)).rgb;',                           /* 1 the room */
    '  b = (b - 0.5) * 1.06 + 0.5;',
    '  float l = dot(b, vec3(0.299, 0.587, 0.114));',
    '  b *= mix(1.0, mix(0.94, 0.6, smoothstep(0.16, 0.72, l)), uD) * uV;',   /* its light is taken down while words stand on it — graded, never veiled */
    '  vec3 c = mix(a, b, smoothstep(-w, w, d));',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function seam(f, q, t){
    var o = f.sm;
    if (o === undefined){
      var box = qs('.co-dw-ph', f.el);
      o = f.sm = {gl: box ? GL2.make(box, SEAM_FS, qsa('img', box), {}) : null, im: box && qs('.co-dw-im', box), h: qs('.co-dw-h', f.el), l: qs('.co-dw-l', f.el), p: qs('.co-dw-p', f.el),
                  s: qs('.co-dw-t', f.el), a: qs('.co-dw-t .a', f.el), b: qs('.co-dw-t .b', f.el), c: qs('.co-dw-c', f.el), on: false};
    }
    function put(e, op, tf, fl){ if (!e) return; var k = op.toFixed(3) + tf + (fl || ''); if (e.__k === k) return; e.__k = k;
      var st = e.style; st.opacity = op.toFixed(3); st.transform = tf; if (fl !== undefined) st.filter = fl; st.visibility = op <= .001 ? 'hidden' : 'visible'; }
    function clr(e){ if (!e) return; e.__k = ''; e.__t = ''; var st = e.style; st.opacity = ''; st.transform = ''; st.filter = ''; st.visibility = ''; }
    if (H >= W){ if (o.on){ o.on = false; [o.h, o.l, o.p, o.s, o.a, o.b, o.c].forEach(clr); if (o.im) o.im.style.clipPath = ''; } return; }   /* phones: in the flow (css) */
    o.on = true;
    /* where the seam stands, as a part of the screen's width: in from the right edge to the right field as the block arrives; to the
       middle; out at the left */
    var xf = xr(1870) / W,
        x = q < .6 ? 1.04 - (1.04 - xf) * eio(sg(q, -.6, -.08)) : q < 1.7 ? xf + (.5 - xf) * eio(sg(q, .6, 1.3)) : .5 - .54 * eio(sg(q, 2.0, 2.78)),
        sx = Math.round(W * x) - .5, k3 = eio(sg(q, 2.0, 2.8)), g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); g2.set1('uX', sx / W); g2.set1('uZ', 1.045 - .045 * eio(sg(q, -.6, 2.9))); g2.set1('uK', .42); g2.set1('uD', .7 - .45 * k3); g2.set1('uV', .62 + .2 * k3);
      g2.set1('uTime', (t * 60) | 0); g2.draw(); }
    else if (o.im && !g2){ var cp = 'inset(0 0 0 ' + (c01(x) * 100).toFixed(2) + '%)'; if (o.im.__c !== cp){ o.im.__c = cp; o.im.style.clipPath = cp; } }
    if (sx > -1 && sx < W + 1){                                               /* the seam itself: one pixel, and our square on the screen's middle */
      ink(.85, 1); seg(sx, 0, sx, H);
      g.fillStyle = '#96A8BF'; g.fillRect(Math.round(sx - SQ / 2), Math.round(MID - SQ / 2), Math.round(SQ), Math.round(SQ));
    }
    var ho = 1 - eio(sg(q, .62, .9)), up = 'translate3d(0,' + (-16 * U * (1 - ho)).toFixed(1) + 'px,0)';   /* step 1 goes up a little as it goes out */
    put(o.h, ho, up); put(o.l, ho, up);
    var si = eio(sg(q, 1.14, 1.44)), so = 1 - eio(sg(q, 1.86, 2.08)), dx = 26 * U * (1 - si);        /* step 2: the two sentences come to the seam from their own sides */
    put(o.s, si * so, 'translate3d(0,' + (-12 * U * (1 - so)).toFixed(1) + 'px,0)');
    var ta = 'translate3d(' + (-dx).toFixed(1) + 'px,-50%,0)', tb = 'translate3d(' + dx.toFixed(1) + 'px,-50%,0)';
    if (o.a && o.a.__t !== ta){ o.a.__t = ta; o.a.style.transform = ta; } if (o.b && o.b.__t !== tb){ o.b.__t = tb; o.b.style.transform = tb; }
    put(o.p, si * so, 'translate3d(0,' + (10 * U * (1 - si) - 12 * U * (1 - so)).toFixed(1) + 'px,0)');
    var ci = eio(sg(q, 2.62, 2.98)), bl = (1 - ci) * 8 * U;                  /* step 3 comes into focus */
    put(o.c, ci, 'translate3d(0,' + (14 * U * (1 - ci)).toFixed(1) + 'px,0)', bl > .2 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none');
  }
  /* ================================================================== a film of words on one photograph (18.11.2026 22:07)
     CI Curated and CI Wellness: «вони дуже грузні… переосмислив, думав метафорами». One pinned screen, three steps, one thought to a
     step (tk_words() in build.py): the name and the title with the first paragraphs; then the client's WORDS one at a time where the
     title stood, with the second paragraphs on the foot; then the closing sentence alone on the screen's middle. The photograph is
     one WebGL layer that does what the words say:
       pool   the room stands in its evening and one light travels through it, resting on a piece for each word (the curator's eye);
              at the end the light is the whole room;
       day    a day passes through the room while the words are read — cool and low at dawn, full at noon, warm at dusk — and the
              sun's band crosses the picture;
       focus  the room is out of focus — a property the buyer cannot yet read — and comes into focus as the words pass (the
              Broker Program: «Turn Hesitation Into Vision»);
       still  the photograph only settles.
     Nothing is laid over the picture: its light is taken down in the shader where words stand on it. */
  var WORDS_FS = ['precision highp float;', 'uniform sampler2D uT0;', 'uniform vec2 uRes, uS0, uSun, uL, uLr;', 'uniform float uZ, uV, uD, uLk, uB, uTmp, uBl, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'vec2 cov(vec2 uv, vec2 img){ float ra = uRes.x / uRes.y, ri = img.x / img.y; vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0); return (uv - 0.5) * s + 0.5; }',
    'void main(){',
    '  vec2 src = cov((v - 0.5) / uZ + 0.5, uS0);',
    '  vec3 c = texture2D(uT0, src).rgb;',
    '  if (uBl > 0.0004){',                                                    /* out of focus: a disc of sixteen looks, turned differently at every point */
    '    float j = hash(v * uRes) * 6.2832; c = vec3(0.0);',
    '    for (int i = 0; i < 16; i++){ float fi = float(i), an = fi * 2.39996 + j, r = sqrt((fi + 0.5) / 16.0) * uBl;',
    '      c += texture2D(uT0, src + vec2(cos(an) * uS0.y / uS0.x, sin(an)) * r).rgb; }',
    '    c /= 16.0;',
    '  }',
    '  c = (c - 0.5) * 1.05 + 0.5;',
    '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
    '  float pool = 1.0 - smoothstep(0.5, 1.0, length((src - uL) * vec2(uS0.x / uS0.y, 1.0) / uLr));',   /* one light, the shape of the piece it rests on, in the photograph's own co-ordinates */
    '  c *= mix(1.0, mix(uB, 1.08, pool), uLk);',
    '  vec3 tn = uTmp < 0.0 ? mix(vec3(1.0), vec3(0.78, 0.9, 1.14), -uTmp) : mix(vec3(1.0), vec3(1.13, 0.95, 0.76), uTmp);',   /* the hour: cool, then warm */
    '  c *= tn * (1.0 + (1.0 - smoothstep(0.0, 0.45, abs(v.x + v.y * 0.4 - uSun.x))) * uSun.y * 0.22);',                      /* and the sun crossing the room */
    '  c *= mix(1.0, mix(0.94, 0.6, smoothstep(0.16, 0.72, l)), uD) * uV;',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function words(f, q, t){
    var o = f.wd, i, e = f.el;
    if (o === undefined){
      var box = qs('.tk-wd-ph', e);
      o = f.wd = {gl: box ? GL2.make(box, WORDS_FS, qsa('img', box), {}) : null, mode: e.getAttribute('data-mode') || 'still', n: +e.getAttribute('data-n') || 1, dw: +e.getAttribute('data-dw') || .42,
                  pts: (e.getAttribute('data-pts') || '').split(';').filter(Boolean).map(function(x){ return x.split(',').map(Number); }),
                  h: qs('.tk-wd-h', e), f1: qs('.tk-wd-f1', e), f2: qs('.tk-wd-f2', e), f3: qs('.tk-wd-f3', e), ws: qsa('.tk-wd-i', e), c: qs('.tk-wd-c', e), x: qs('.tk-wd-x', e), ix: qsa('.tk-wd-x li', e), cur: -1, on: false};
    }
    function put(el_, op, tf, fl){ if (!el_) return; var k = op.toFixed(3) + tf + (fl || ''); if (el_.__k === k) return; el_.__k = k;
      var st = el_.style; st.opacity = op.toFixed(3); st.transform = tf; if (fl !== undefined) st.filter = fl; st.visibility = op <= .001 ? 'hidden' : 'visible'; }
    function clr(el_){ if (!el_) return; el_.__k = ''; var st = el_.style; st.opacity = ''; st.transform = ''; st.filter = ''; st.visibility = ''; }
    function ty(px){ return 'translate3d(0,' + px.toFixed(1) + 'px,0)'; }
    if (H >= W){ if (o.on){ o.on = false; [o.h, o.f1, o.f2, o.f3, o.c, o.x].concat(o.ws).forEach(clr); } return; }   /* phones: in the flow (css) */
    o.on = true;
    var w0 = 1.0, wE = w0 + o.n * o.dw, p = (q - w0) / o.dw, k = c01((q - w0) / (wE - w0)), kc = eio(sg(q, wE + .12, wE + .5)), g2 = o.gl;
    if (g2 && g2.ready){
      var V = .5, D = .65, lk = 0, L = [.5, .5, 1, 1], tmp = 0, sun = 0, blr = 0;
      if (o.mode === 'pool' && o.pts.length){
        var a = Math.max(0, Math.min(o.pts.length - 1, Math.floor(p))), b = Math.min(o.pts.length - 1, a + 1), fr = eio(sg(p - a, .56, 1)), A = o.pts[a], B = o.pts[b],
            open = eio(sg(q, wE - .04, wE + .5));                             /* at the end the light is the whole room */
        lk = eio(sg(q, w0 - .32, w0 + .04));
        L = [A[0] + (B[0] - A[0]) * fr, A[1] + (B[1] - A[1]) * fr, (A[2] + (B[2] - A[2]) * fr) * (1 + 9 * open), (A[3] + (B[3] - A[3]) * fr) * (1 + 9 * open)];
        V = .44 + .5 * lk - .2 * kc; D = .5 * (1 - lk) + .82 * kc;
      } else if (o.mode === 'focus'){
        var fk = eio(c01((q - w0 + .15) / (wE - w0 + .45)));                   /* from the first word to the closing sentence */
        blr = .034 * (1 - fk); V = .42 + .22 * fk; D = .55 + .2 * kc;
      } else if (o.mode === 'day'){
        tmp = -.9 + 1.75 * k - .25 * kc; sun = Math.sin(Math.PI * k);
        V = .46 + .3 * sun + .06 * kc; D = .45 + .25 * kc;
      }
      g2.size(); g2.set1('uZ', 1.06 - .06 * eio(sg(q, -.6, wE + .6))); g2.set2('uL', L[0], L[1]); g2.set2('uLr', L[2], L[3]); g2.set1('uLk', lk); g2.set1('uB', .3);
      g2.set1('uTmp', tmp); g2.set1('uBl', blr); g2.set2('uSun', -.35 + 2.1 * k, sun); g2.set1('uV', V); g2.set1('uD', D); g2.set1('uTime', (t * 60) | 0); g2.draw();
    }
    var ho = 1 - eio(sg(q, .62, .9));                                         /* step 1 goes up a little as it goes out */
    put(o.h, ho, ty(-16 * U * (1 - ho))); put(o.f1, ho, ty(-16 * U * (1 - ho)));
    for (i = 0; i < o.ws.length; i++){                                         /* step 2: each word comes up into the title's place and gives it to the next */
      /* one is fully gone before the next begins to come (19.11.2026: «текст наїхав один на одний» — two sentences were on the screen at once for a moment) */
      var a0 = w0 + i * o.dw, wi = eio(sg(q, a0 + .02, a0 + .16)), wo = 1 - (i === o.ws.length - 1 ? (o.c ? eio(sg(q, wE - .04, wE + .1)) : 0) : eio(sg(q, a0 + o.dw - .16, a0 + o.dw - .04)));   /* without a closing sentence the last one stays */
      put(o.ws[i], wi * wo, ty((1 - wi) * 20 * U - (1 - wo) * 16 * U));
    }
    var fi = eio(sg(q, w0 - .04, w0 + .22)), fo = 1 - eio(sg(q, wE - .04, wE + .14));
    put(o.f2, fi * fo, ty(10 * U * (1 - fi) - 12 * U * (1 - fo)));
    if (o.x){                                                                 /* the index of a film of states: the name in hand is bright */
      put(o.x, fi * (o.c ? fo : 1), ty(10 * U * (1 - fi)));
      var cur = Math.max(0, Math.min(o.n - 1, Math.floor(p + .03)));
      if (cur !== o.cur){ o.cur = cur; for (i = 0; i < o.ix.length; i++) o.ix[i].classList.toggle('on', i === cur); }
    }
    var bl = (1 - kc) * 8 * U;                                                /* step 3 comes into focus */
    put(o.c, kc, ty(14 * U * (1 - kc)), bl > .2 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none');
    put(o.f3, kc, ty(10 * U * (1 - kc)));
  }
  /* ================================================================== CI Wellness, the features: names in a row on the line
     18.11.2026 23:03, her reference for this screen (santalarch.com/#services); 23:15, of my first version: «на прикладі воно ж не
     так… яка там класна плавна анімація. Ти зробив якийсь топор. Зроби точно як на референсі». As the reference is made: the names
     are one row that TRAVELS, continuously, and it exists twice — quiet over the whole screen and bright only in the window between
     the middle of the screen and its third quarter — so a name lights up letter by letter as it crosses the line. Each name's
     photograph travels with it under the horizontal line, seen only in the same window. The row comes in from the right as the
     block arrives, rests on every name and glides to the next; what is shown follows the scroll with a little weight (it eases to
     its place instead of being nailed to it). The photographs are ONE WebGL layer: a sheet of them made once they have loaded, and
     the shader lays the travelling columns out of it. The type is DOM; the lines are ruled on the film's canvas. */
  var FEAT_FS = ['precision highp float;', 'uniform sampler2D uT0;', 'uniform vec2 uRes, uG;', 'uniform float uP, uN, uGap, uAr, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  float pitch = 1.0 + uGap, i = floor((v.x - uGap) / pitch + uP), u = v.x - (uGap + (i - uP) * pitch);',   /* which column of the row this point is in */
    '  vec3 c = vec3(0.0);',
    '  if (u >= 0.0 && u < 1.0 && i >= 0.0 && i < uN){',
    '    float ra = uRes.x / uRes.y; vec2 sc = ra > uAr ? vec2(1.0, uAr / ra) : vec2(ra / uAr, 1.0);',
    '    vec2 q = clamp((vec2(u, v.y) - 0.5) * sc + 0.5, 0.004, 0.996);',
    '    c = texture2D(uT0, (vec2(mod(i, uG.x), floor(i / uG.x)) + q) / uG).rgb;',
    '    c = ((c - 0.5) * 1.06 + 0.5) * 0.9;',
    '  }',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function feat(f, q, t){
    var o = f.fx, i, e = f.el;
    if (o === undefined){
      o = f.fx = {n: +e.getAttribute('data-n') || 1, dw: +e.getAttribute('data-dw') || .6, rows: qsa('.wl-fx-row', e), ds: qsa('.wl-fx-i', e), nms: qsa('.wl-fx-t.a .wl-fx-nm', e),
                  ca: qs('.wl-fx-c .a', e), cn: qs('.wl-fx-c .n', e), box: qs('.wl-fx-ph', e), imgs: qsa('.wl-fx-ph img', e), gl: null, tried: false, cur: -1, P: -1.6, on: false, C: 5, R: 1, rt: ''};
    }
    if (H >= W){ if (o.on){ o.on = false; o.rt = ''; o.rows.forEach(function(r_){ r_.style.transform = ''; }); } return; }   /* phones: in the flow (css) */
    o.on = true;
    var lh = eio(sg(q, -.7, -.15)), lv = eio(sg(q, -.55, 0));
    cross(lh, lv);                                                            /* the two centre hairlines, and the window's other side */
    if (lv > 0){ var vx = Math.round(W * .75) - .5; seg(vx, 0, vx, H * lv); }
    if (!o.tried && o.imgs.length && o.imgs.every(function(im){ return im.complete && im.naturalWidth; })){   /* the sheet of photographs */
      o.tried = true;
      var TW = 540, TH = 620, cv = document.createElement('canvas'), x2 = cv.getContext('2d');
      o.R = Math.ceil(o.imgs.length / o.C); cv.width = TW * o.C; cv.height = TH * o.R;
      o.imgs.forEach(function(im, j){ var sc = Math.max(TW / im.naturalWidth, TH / im.naturalHeight), w = im.naturalWidth * sc, h = im.naturalHeight * sc, tx = (j % o.C) * TW, ty = Math.floor(j / o.C) * TH;
        x2.save(); x2.beginPath(); x2.rect(tx, ty, TW, TH); x2.clip(); x2.drawImage(im, tx + (TW - w) / 2, ty + (TH - h) / 2, w, h); x2.restore(); });
      cv.complete = true; cv.naturalWidth = cv.width; cv.naturalHeight = cv.height; o.ar = TW / TH;
      try { o.gl = GL2.make(o.box, FEAT_FS, [cv], {}); } catch (er){ o.gl = null; }
    }
    /* where the row should be, in names: in from the right as the block arrives, then a rest on every name and a glide to the next */
    var p = q / o.dw, a = Math.max(0, Math.min(o.n - 1, Math.floor(p))), tg = q < 0 ? -1.6 * (1 - eio(sg(q, -.8, 0))) : Math.min(o.n - 1, a + eio(sg(p - a, .34, 1)));
    o.P += (tg - o.P) * (Math.abs(tg - o.P) > 3 ? 1 : .1);                    /* it eases to its place; a jump (an anchor) is taken at once */
    if (Math.abs(tg - o.P) < .0004) o.P = tg;
    var colW = W * .25, gap = 50 * U, rt = 'translate3d(' + (gap - o.P * (colW + gap)).toFixed(2) + 'px,0,0)';
    if (o.rt !== rt){ o.rt = rt; o.rows.forEach(function(r_){ r_.style.transform = rt; }); }
    var cur = Math.max(0, Math.min(o.n - 1, Math.round(o.P)));
    if (cur !== o.cur){ o.cur = cur;
      for (i = 0; i < o.n; i++){ if (o.ds[i]) o.ds[i].classList.toggle('on', i === cur); if (o.imgs[i]) o.imgs[i].classList.toggle('on', i === cur); }
      if (o.ca) o.ca.textContent = ('0' + (cur + 1)).slice(-2);
      if (o.cn && o.nms[cur]){ var nt = o.nms[cur].textContent; o.cn.textContent = nt.length > 18 ? '' : nt; }   /* a long name is not said twice: it would run under the photograph */
    }
    var g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); g2.set2('uG', o.C, o.R); g2.set1('uAr', o.ar); g2.set1('uN', o.n); g2.set1('uGap', gap / colW); g2.set1('uP', o.P); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  /* ================================================================== Broker Program: «Естафета» and «Одна точка» (19.11.2026 07:53)
     Of the storyboard: «третій, ну окей, подивимося, як воно працює… п'ятий, ну, не знаю, подивимося, як воно працює».
     relay — three lanes (You · CI · Your client) ruled across the screen and ONE line that the scroll walks through the five stages,
     stepping from lane to lane; a stage's name over its square, the sentence of the stage in hand under it.
     point — ten names in two columns, a line from each to one point in the middle; then one line leaves the point downward and the
     client's sentence stands under it. Lines on the film's canvas, type in the DOM (placed here: the geometry is the screen's). */
  /* 19.11.2026 08:15 — «тепер мені якось не вистачає фотографій. Воно все чорне, чорне, чорне. Можливо, вставити ще якусь фотку»:
     relay — a band of ONE photograph lies under the three lanes and is uncovered exactly as far as the line has walked: the home
             appears along the journey, and is whole at «Move-In»;
     point — the one point OPENS into a photograph of the finished home (a window growing out of the square). One WebGL layer each. */
  var RELAY_FS = ['precision highp float;', 'uniform sampler2D uT0;', 'uniform vec2 uRes, uS0;', 'uniform float uX, uV, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'vec2 cov(vec2 uv, vec2 img){ float ra = uRes.x / uRes.y, ri = img.x / img.y; vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0); return (uv - 0.5) * s + 0.5; }',
    'void main(){',
    '  vec3 c = texture2D(uT0, cov(v, uS0)).rgb; c = (c - 0.5) * 1.05 + 0.5;',
    '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
    '  c *= mix(0.94, 0.6, smoothstep(0.16, 0.72, l)) * uV;',                 /* its light taken down: names and sentences stand on it */
    '  c *= 1.0 - smoothstep(uX - 70.0 / uRes.x, uX, v.x);',                  /* uncovered as far as the line has walked */
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  var POINT_FS = ['precision highp float;', 'uniform sampler2D uT0;', 'uniform vec2 uRes, uS0;', 'uniform float uA, uTime;', 'varying vec2 v;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'vec2 cov(vec2 uv, vec2 img){ float ra = uRes.x / uRes.y, ri = img.x / img.y; vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0); return (uv - 0.5) * s + 0.5; }',
    'void main(){',
    '  vec2 d = abs(v - 0.5) * 2.0;',
    '  vec3 c = texture2D(uT0, cov((v - 0.5) / (1.14 - 0.14 * uA) + 0.5, uS0)).rgb;',
    '  c = ((c - 0.5) * 1.05 + 0.5) * 0.92 * step(max(d.x, d.y), uA);',       /* the window grows out of the point */
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02 * step(max(d.x, d.y), uA);',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function relay(f, q, t){
    var o = f.rl, i, e = f.el;
    if (o === undefined){ o = f.rl = {ls: qsa('.br-rl-l', e), st: qsa('.br-rl-st', e), lk: '', P: -1, cur: -2, on: false};
      var bx = qs('.br-rl-ph', e); o.gl = bx ? GL2.make(bx, RELAY_FS, qsa('img', bx), {}) : null; }
    var n = o.st.length;
    if (H >= W){ if (o.on){ o.on = false; o.lk = ''; o.ls.concat(o.st).forEach(function(x){ x.style.left = ''; x.style.top = ''; x.style.opacity = ''; x.classList.remove('on'); }); } return; }
    o.on = true;
    var ys = [MID - 20 * U, MID + 140 * U, MID + 300 * U], x0 = 330 * U, x1 = W - 50 * U, xs = [], ly = [];
    for (i = 0; i < n; i++){ xs.push(x0 + 140 * U + i * (x1 - x0 - 520 * U) / (n - 1)); ly.push(ys[+o.st[i].getAttribute('data-l') || 0]); }   /* the last stage keeps room for its sentence inside the right field */
    var lk = W + 'x' + H;
    if (o.lk !== lk){ o.lk = lk;
      o.ls.forEach(function(x, j){ x.style.left = (50 * U) + 'px'; x.style.top = (ys[j] - 44 * U) + 'px'; });
      o.st.forEach(function(x, j){ x.style.left = xs[j] + 'px'; x.style.top = (ly[j] - 58 * U) + 'px'; });   /* the name is centred over its square (css): no step of the line passes through it */
    }
    /* where the line's head is, in stages: in to the first as the block arrives, then a rest on each and a walk to the next */
    var a0 = .2, dw = .62, k = Math.max(0, Math.min(n - 1, Math.floor((q - a0) / dw))), tg = q < a0 ? -1 + eio(sg(q, -.35, a0)) : Math.min(n - 1 + .35 * eio(sg(q, a0 + (n - 1) * dw + .1, a0 + n * dw)), k + eio(sg(q - a0 - k * dw, .22, dw)));
    o.P += (tg - o.P) * (Math.abs(tg - o.P) > 2 ? 1 : .12); if (Math.abs(tg - o.P) < .0005) o.P = tg;
    var la = eio(sg(q, -.6, -.1));
    ink(.2, 1); for (i = 0; i < 3; i++) seg(x0, Math.round(ys[i]) + .5, x0 + (x1 - x0) * la, Math.round(ys[i]) + .5);        /* the three lanes */
    function at(p){                                                                /* the line's point at p stages */
      if (p <= 0) return [xs[0] - (xs[0] - x0) * -p, ly[0], []];
      var a = Math.min(n - 1, Math.floor(p)), fr = p - a, pts = [];
      for (var j = 0; j < a; j++){ var mx_ = (xs[j] + xs[j + 1]) / 2; pts.push([mx_, ly[j]], [mx_, ly[j + 1]], [xs[j + 1], ly[j + 1]]); }
      if (a >= n - 1) return [xs[n - 1] + fr * (W - xs[n - 1]) / .35 * .35, ly[n - 1], pts];
      var dx = xs[a + 1] - xs[a], dy = ly[a + 1] - ly[a], L = dx + Math.abs(dy), d = fr * L, mx2 = xs[a] + dx / 2;
      if (d <= dx / 2) return [xs[a] + d, ly[a], pts];
      pts.push([mx2, ly[a]]);
      if (d <= dx / 2 + Math.abs(dy)) return [mx2, ly[a] + (dy < 0 ? -1 : 1) * (d - dx / 2), pts];
      pts.push([mx2, ly[a + 1]]); return [mx2 + (d - dx / 2 - Math.abs(dy)), ly[a + 1], pts];
    }
    var hd = at(o.P), px = x0, py = ly[0];
    ink(1, 1.5);
    hd[2].concat([[hd[0], hd[1]]]).forEach(function(pt){ seg(Math.round(px) + .5, Math.round(py) + .5, Math.round(pt[0]) + .5, Math.round(pt[1]) + .5); px = pt[0]; py = pt[1]; });
    if (o.gl && o.gl.ready){ var endk = eio(sg(q, a0 + (n - 1) * dw + .1, a0 + n * dw)), ux = hd[0] / W; o.gl.size(); o.gl.set1('uX', (ux + (1.08 - ux) * endk) * la); o.gl.set1('uV', .56); o.gl.set1('uTime', (t * 60) | 0); o.gl.draw(); }   /* the photograph under the lanes */
    var rp = Math.round(o.P), cur = Math.abs(o.P - rp) < .16 && rp >= 0 && rp < n ? rp : (o.P > n - 1 ? n - 1 : -1);   /* a sentence stands only while the line rests on its stage */
    for (i = 0; i < n; i++){                                                         /* the squares: a stage reached is whole, one ahead is quiet */
      var r = o.P >= i - .02; g.globalAlpha = r ? 1 : .35; g.fillStyle = '#96A8BF'; g.fillRect(Math.round(xs[i] - SQ / 2), Math.round(ly[i] - SQ / 2), Math.round(SQ), Math.round(SQ)); g.globalAlpha = 1;
      var op = (r ? 1 : .26) * la, ops = op.toFixed(2); if (o.st[i].__o !== ops){ o.st[i].__o = ops; o.st[i].style.opacity = ops; }
    }
    if (cur !== o.cur || la < 1){ o.cur = cur; o.st.forEach(function(x, j){ x.classList.toggle('on', j === cur && o.P > -.3); });
      var lc = Math.max(0, Math.min(n - 1, Math.round(o.P))); o.ls.forEach(function(x, j){ x.style.opacity = (la * (o.P > -.3 && ys[j] === ly[lc] ? 1 : .42)).toFixed(2); }); }
  }
  function point(f, q, t){
    var o = f.pt, i, e = f.el;
    if (o === undefined){ o = f.pt = {ns: qsa('.br-pt-n', e), c: qs('.br-pt-c', e), p: qs('.br-pt-p', e), lk: '', on: false};
      var bx = qs('.br-pt-ph', e); o.im = bx && qs('img', bx); o.gl = bx ? GL2.make(bx, POINT_FS, qsa('img', bx), {}) : null; }
    var n = o.ns.length, h = Math.ceil(n / 2);
    if (H >= W){ if (o.on){ o.on = false; o.lk = ''; o.ns.concat([o.c, o.p]).forEach(function(x){ if (x){ x.style.left = ''; x.style.right = ''; x.style.top = ''; x.style.opacity = ''; x.style.transform = ''; } }); } return; }
    o.on = true;
    var cx = W / 2, cy = MID + 10 * U, gapx = 250 * U, row = 68 * U, yy = function(j){ return cy + ((j % h) - (h - 1) / 2) * row; }, lk = W + 'x' + H;
    if (o.lk !== lk){ o.lk = lk;
      o.ns.forEach(function(x, j){ var L_ = j < h; x.style.top = (yy(j) - 17 * U) + 'px'; if (L_){ x.style.right = (W - (cx - gapx)) + 'px'; x.style.left = 'auto'; } else { x.style.left = (cx + gapx) + 'px'; x.style.right = 'auto'; } });
      if (o.c){ o.c.style.top = (cy + 300 * U) + 'px'; }
    }
    var quiet = eio(sg(q, 1.5, 1.9)), any = 0, ap = eio(sg(q, 1.62, 2.3));
    for (i = 0; i < n; i++){
      var L2 = i < h, ord = L2 ? i : i - h, ni = eio(sg(q, -.45 + ord * .05, -.05 + ord * .05)), li = eio(sg(q, .15 + i * .1, .62 + i * .1)), x_ = cx + (L2 ? -1 : 1) * (gapx - 22 * U), y_ = yy(i);
      var op = (ni * (1 - .78 * quiet)).toFixed(2); if (o.ns[i].__o !== op){ o.ns[i].__o = op; o.ns[i].style.opacity = op; }
      if (li > 0){ any = Math.max(any, li); ink(.5 * (1 - .8 * quiet), 1); seg(x_, y_, x_ + (cx - x_) * li, y_ + (cy - y_) * li); }
    }
    if ((any > .98 || quiet > 0) && ap < .25){ g.globalAlpha = 1 - ap * 4; g.fillStyle = '#96A8BF'; g.fillRect(Math.round(cx - SQ / 2), Math.round(cy - SQ / 2), Math.round(SQ), Math.round(SQ)); g.globalAlpha = 1; }
    if (o.gl && o.gl.ready){ o.gl.size(); o.gl.set1('uA', ap); o.gl.set1('uTime', (t * 60) | 0); o.gl.draw(); }   /* the point opens into the finished home */
    else if (o.im && !o.gl){ o.im.style.opacity = ap.toFixed(3); }
    var ci = eio(sg(q, 2.2, 2.52));
    if (o.c){ o.c.style.opacity = ci.toFixed(3); o.c.style.transform = 'translate3d(0,' + (14 * U * (1 - ci)).toFixed(1) + 'px,0)'; }
    if (o.p){ o.p.style.opacity = ci.toFixed(3); }
  }
  /* ================================================================== Partnerships, built to the storyboard (19.11.2026 09:02)
     «Ну, давай, збирай, подивимося, як воно працює все» — of `partnerships-ideas-2.jpg`, the storyboard redrawn after her «якось
     занадто багато кружечків» (08:38): the circle is on the page ONCE, at its end; the rest is ruled in straight lines.
       pparts   ONE full-screen photograph in six parts. They come from apart into an ordered grid with seams («World-Class
                Expertise. One Seamless Experience.»); each lights with one of the six benefits; then the seams close and the
                room is one («You gain world-class expertise. We manage every detail»).
       pquart   the black screen is ruled by the two centre lines, our square on the crossing. A photograph goes from quarter to
                quarter clockwise from twelve — «The Right Expertise at the Right Moment»: the edge that sweeps it in is the
                clock's hand; the wedge it leaves behind closes after it.
       pnames   a group of partners on a full-screen photograph: a name to a step, large; with several photographs they change
                with the names; a closing sentence, and then the type leaves and the picture comes forward.
       pwide    a photograph at the right edge of a black screen grows wider with each partner («…Expand the Idea of Better
                Living»): a fifth, a third, a half, two thirds — never the whole screen.
       psamp    five standards laid on the board like five samples of material: each square is laid from its upper edge down;
                a place not yet filled is ruled in the hairline.
       pring    the one circle, on her reference: a ring whose arc grows by a third with each pair «You… / We…», and
                closed on «That is the CI ecosystem».
     Every picture is a WebGL layer (always: motion over photographs); the type is DOM; the lines are ruled on the film's canvas. */
  function PUT(el_, op, tf, fl){ if (!el_) return; tf = tf || 'none'; var k = op.toFixed(3) + tf + (fl || ''); if (el_.__k === k) return; el_.__k = k;
    var st = el_.style; st.opacity = op.toFixed(3); st.transform = tf; if (fl !== undefined) st.filter = fl; st.visibility = op <= .001 ? 'hidden' : 'visible'; }
  function CLR(el_){ if (!el_) return; el_.__k = ''; var st = el_.style; st.opacity = ''; st.transform = ''; st.filter = ''; st.visibility = ''; st.left = ''; st.right = ''; st.top = ''; st.bottom = ''; }
  function TY(px){ return 'translate3d(0,' + px.toFixed(1) + 'px,0)'; }
  function BLR(k){ var b = (1 - k) * 8 * U; return b > .2 ? 'blur(' + b.toFixed(2) + 'px)' : 'none'; }
  /* a title that changes: the phrases stand in one window and follow one another; P = which one is in it (21.11.2026) */
  function ROT(items, P){ for (var j = 0; j < items.length; j++){ var ty = ((j - P) * 101).toFixed(2); if (items[j].__ty !== ty){ items[j].__ty = ty; items[j].style.transform = 'translate3d(0,' + ty + '%,0)'; } } }
  function bsq(x, y, a){ if (a <= 0) return; g.globalAlpha = a > 1 ? 1 : a; g.fillStyle = '#96A8BF'; g.fillRect(Math.round(x - SQ / 2), Math.round(y - SQ / 2), Math.round(SQ), Math.round(SQ)); g.globalAlpha = 1; }
  var PP_HEAD = ['precision highp float;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'vec2 cvr(vec2 uv, vec2 img, vec2 res){ float ra = res.x / res.y, ri = img.x / img.y; vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0); return (uv - 0.5) * s + 0.5; }',
    /* a photograph's light is taken down where words stand on it, in the picture itself (never a veil): d = how much its highlights give way, vv = its level */
    'vec3 grd(vec3 c, float d, float vv){ c = (c - 0.5) * 1.05 + 0.5; float l = dot(c, vec3(0.299, 0.587, 0.114)); return c * mix(1.0, mix(0.94, 0.6, smoothstep(0.16, 0.72, l)), d) * vv; }'].join('\n') + '\n';
  var PARTS_FS = PP_HEAD + ['uniform sampler2D uT0;', 'uniform vec2 uRes, uS0;', 'uniform float uGap, uJ, uV, uD, uZ, uTime;', 'uniform float uB[6];', 'varying vec2 v;',
    'void main(){',
    '  vec2 px = v * uRes, cell = uRes / vec2(3.0, 2.0); vec3 c = vec3(0.0);',
    '  for (int i = 0; i < 6; i++){',
    '    float fi = float(i), cx = fi < 2.5 ? fi : fi - 3.0, cy = fi < 2.5 ? 0.0 : 1.0;',
    '    float dy = (i == 0 ? -1.0 : i == 1 ? 0.8 : i == 2 ? -0.5 : i == 3 ? -0.6 : i == 4 ? 1.0 : -0.9) * uJ;',             /* each part a little off its place, up or down */
    '    vec2 a = vec2(cx, cy) * cell + vec2(cx > 0.5 ? uGap * 0.5 : 0.0, (cy > 0.5 ? uGap * 0.5 : 0.0) + dy);',
    '    vec2 b = vec2(cx + 1.0, cy + 1.0) * cell - vec2(cx < 1.5 ? uGap * 0.5 : 0.0, cy < 0.5 ? uGap * 0.5 : 0.0) + vec2(0.0, dy);',
    '    if (px.x >= a.x && px.x < b.x && px.y >= a.y && px.y < b.y){',
    '      vec2 src = (px - vec2(0.0, dy)) / uRes;',                                                                     /* a part carries its own piece of the picture with it */
    '      c = grd(texture2D(uT0, cvr((src - 0.5) / uZ + 0.5, uS0, uRes)).rgb, uD, uV * uB[i]);',
    '    }',
    '  }',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppParts(f, q, t){
    var o = f.pa, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-pa-ph', e);
      o = f.pa = {gl: bx ? GL2.make(bx, PARTS_FS, qsa('img', bx), {}) : null, ha: qs('.pp-h.a', e), fa: qs('.pp-f.a', e), ca: qs('.pp-pa-ca', e), hb: qs('.pp-h.b', e), ts: qsa('.pp-pa-t li', e), cb: qs('.pp-c.b', e),
                  ra: qsa('.pp-h.a .pp-rot-w > span', e), rb: qsa('.pp-h.b .pp-rot-w > span', e), B: new Float32Array(6), pk: [], on: false}; }
    if (H >= W){ if (o.on){ o.on = false; o.pk = []; [o.ha, o.fa, o.ca, o.hb, o.cb].concat(o.ts).forEach(CLR); } return; }   /* phones: in the flow (css) */
    o.on = true;
    var n = o.ts.length, t0 = 2.1, dw = .32, tE = t0 + n * dw, DY = [-1, .8, -.5, -.6, 1, -.9], close = eio(sg(q, tE + .05, tE + .6));
    /* how far apart the parts are: 1 as the block arrives, .35 the ordered grid with its seams, 0 one room */
    var K = (1 - .65 * eio(sg(q, -.7, .5))) * (1 - close), k0 = Math.min(1, K / .35), kk = K > .35 ? (K - .35) / .65 : 0, gap = (16 * k0 + 24 * kk) * U, J = (12 * k0 + 28 * kk) * U;
    var fo = 1 - eio(sg(q, .62, .9)), ci = eio(sg(q, .94, 1.24)), co = 1 - eio(sg(q, 1.5, 1.7));
    PUT(o.fa, fo, TY(-12 * U * (1 - fo)));                                     /* the paragraphs give the foot to the section's closing line; the title stays over both */
    PUT(o.ca, ci * co, TY(12 * U * (1 - ci) - 12 * U * (1 - co)));
    PUT(o.ha, co, TY(-16 * U * (1 - co)));
    ROT(o.ra, eio(sg(q, .74, .98)));                                           /* «World-Class Expertise» with the paragraphs, «One Seamless Experience» with the closing line */
    var hi = eio(sg(q, 1.74, 2.04)), hx = 1 - eio(sg(q, tE - .02, tE + .2));
    PUT(o.hb, hi * hx, TY(14 * U * (1 - hi) - 16 * U * (1 - hx)));
    var wn = o.rb.length, Pb = 0; for (i = 1; i < wn; i++){ var tc = t0 + i * (n / wn) * dw; Pb += eio(sg(q, tc - .1, tc + .12)); }
    ROT(o.rb, Pb);                                                             /* «Better» stays; Access → Coordination → Decisions, a word to every two benefits */
    var cw = W / 3, chh = H / 2, capIn = eio(sg(q, 1.86, 2.14)), base = .5 - .2 * hi, foot = Math.max(50 * U, 58);
    for (i = 0; i < 6; i++){
      var lit = i < n ? eio(sg(q, t0 + i * dw, t0 + i * dw + .24)) : 0, c_ = i % 3, r_ = (i / 3) | 0;
      o.B[i] = (base + (.66 - base) * lit) * (1 - close) + .8 * close;          /* a part lights with its benefit and stays lit */
      if (i >= n) continue;
      var x = c_ ? c_ * cw + gap / 2 + 25 * U : 50 * U, bt = r_ ? foot : H - (chh - gap / 2 + DY[i] * J) + 25 * U, pk = x.toFixed(1) + ',' + bt.toFixed(1);
      if (o.pk[i] !== pk){ o.pk[i] = pk; o.ts[i].style.left = x.toFixed(1) + 'px'; o.ts[i].style.bottom = bt.toFixed(1) + 'px'; }
      PUT(o.ts[i], capIn * hx * (.42 + .58 * lit));
    }
    var kc = eio(sg(q, tE + .38, tE + .74));
    PUT(o.cb, kc, TY(14 * U * (1 - kc)), BLR(kc));
    var g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); g2.set1('uGap', gap); g2.set1('uJ', J); g2.gl.uniform1fv(g2.u('uB'), o.B);
      g2.set1('uV', .3 + .7 * eio(sg(q, -.9, -.15))); g2.set1('uD', 1 - .12 * close); g2.set1('uZ', 1.06 - .06 * eio(sg(q, -.6, tE + .6))); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  var QUART_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2, uT3;', 'uniform vec2 uRes, uS0, uS1, uS2, uS3;', 'uniform float uA, uB, uV, uZ, uTime;', 'varying vec2 v;',
    'void main(){',
    '  vec2 d = (v - 0.5) * uRes;',
    '  float a = atan(d.x, -d.y) / 6.2831853; if (a < 0.0) a += 1.0; a = min(a * 4.0, 3.9999);',     /* quarters of the hour, clockwise from twelve */
    '  float k = floor(a);',
    '  vec2 qv = (fract(v * 2.0) - 0.5) / uZ + 0.5, qr = uRes * 0.5; vec3 c;',                        /* each quarter holds its own photograph */
    '  if (k < 0.5) c = texture2D(uT0, cvr(qv, uS0, qr)).rgb; else if (k < 1.5) c = texture2D(uT1, cvr(qv, uS1, qr)).rgb; else if (k < 2.5) c = texture2D(uT2, cvr(qv, uS2, qr)).rgb; else c = texture2D(uT3, cvr(qv, uS3, qr)).rgb;',
    '  c = grd(c, 0.8, uV);',
    '  c *= 0.7 + 0.3 * smoothstep(0.0, 0.5, length(d) / uRes.y);',                                   /* quieter by the crossing, where its sentence stands */
    '  float lo = uB < 0.002 ? 1.0 : smoothstep(uB - 0.006, uB + 0.006, a), hi = uA > 3.998 ? 1.0 : 1.0 - smoothstep(uA - 0.006, uA + 0.006, a);',
    '  float m = lo * hi * step(0.001, uA - uB);',                                                    /* what the hand has brought, less what has closed behind it */
    '  c *= m; c += (hash(v * uRes + uTime) - 0.5) * 0.02 * m;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function end0(p, n){ return eio(sg(p, n + .02, n + .4)); }
  function ppQuart(f, q, t){
    var o = f.qt, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-qt-ph', e);
      o = f.qt = {gl: bx ? GL2.make(bx, QUART_FS, qsa('img', bx), {max: 1600}) : null, h: qs('.pp-hh', e), l: qs('.pp-qt-l', e), is: qsa('.pp-qt-i', e), p: qs('.pp-qt-p', e), c: qs('.pp-qt-c', e), on: false}; }
    if (H >= W){ if (o.on){ o.on = false; [o.h, o.l, o.p, o.c].concat(o.is).forEach(CLR); } return; }
    o.on = true;
    var n = o.is.length, a0 = .3, dw = .62, p = (q - a0) / dw, A = 0, B = 0, lh = eio(sg(q, -.7, -.15)), lv = eio(sg(q, -.55, 0)), cx = Math.round(W / 2) - .5;
    cross(lh, lv);                                                             /* the site's two centre lines rule the four quarters */
    for (i = 0; i < n; i++){ A += eio(sg(p - i, 0, .5)); B += eio(sg(p - i - 1, .08, .58)); }   /* the hand; and what closes behind it a moment later — the fourth quarter too (21.11: only the lines stay) */
    var fr = A - Math.floor(A);
    if (fr > .001 && fr < .999){ var an = A * Math.PI / 2, L = W + H; ink(Math.sin(Math.PI * fr) * .85, 1); seg(cx, MID, cx + Math.sin(an) * L, MID - Math.cos(an) * L); }   /* the hand itself, only while it moves */
    var end = eio(sg(p, n + .02, n + .4));                                     /* the four have passed: their sentences and our square go, the closing sentence takes the crossing */
    bsq(cx, MID, lv > .98 ? 1 - end : 0);                                      /* our square on the crossing */
    var ho = 1 - eio(sg(p, n - 1 - .04, n - 1 + .24)); PUT(o.h, ho, TY(-16 * U * (1 - ho)));
    if (o.k0 === undefined) o.k0 = qs('.pp-h > .tk-cv-k', e); if (p > n - .2 || o.kt){ o.kt = true; PUT(o.k0, 1 - end0(p, n)); }              /* the title keeps the upper left quarter until the photograph comes to it */
    var li = eio(sg(q, -.45, -.05)), lo = 1 - eio(sg(p, n - 2 - .04, n - 2 + .22)); PUT(o.l, li * lo);
    for (i = 0; i < n; i++){ var si = eio(sg(p - i, .2, .5)), qo = i < n - 1 ? eio(sg(p - i - 1, 0, .3)) : 0; PUT(o.is[i], si * (1 - .66 * qo) * (1 - end), TY(12 * U * (1 - si) - 10 * U * end)); }   /* said and quiet; gone at the end */
    var kp = eio(sg(p, n + .5, n + .85)), kc = eio(sg(p, n + .6, n + 1.05)); PUT(o.p, kp, TY(10 * U * (1 - kp))); PUT(o.c, kc, TY(14 * U * (1 - kc)), BLR(kc));
    var g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); g2.set1('uA', A); g2.set1('uB', B); g2.set1('uV', .8); g2.set1('uZ', 1.06 - .015 * A); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
    else if (!g2){ if (!o.ims) o.ims = qsa('.pp-qt-ph img', e); o.ims.forEach(function(im, j){ im.style.opacity = A > j + .5 && B < j + .5 ? '1' : '0'; }); }   /* no WebGL: the quarter in hand, plainly */
  }
  var NAMES_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2, uT3;', 'uniform vec2 uRes, uS0, uS1, uS2, uS3;', 'uniform float uI, uV, uD, uZ, uTime;', 'varying vec2 v;',
    'vec3 pick(float k, vec2 uv){ if (k < 0.5) return texture2D(uT0, cvr(uv, uS0, uRes)).rgb; if (k < 1.5) return texture2D(uT1, cvr(uv, uS1, uRes)).rgb; if (k < 2.5) return texture2D(uT2, cvr(uv, uS2, uRes)).rgb; return texture2D(uT3, cvr(uv, uS3, uRes)).rgb; }',
    'void main(){',
    '  float i0 = floor(uI), fr = uI - i0;',
    '  vec3 c = pick(i0, (v - 0.5) / uZ + 0.5);',
    '  if (fr > 0.001){ float e = (1.0 - v.x) * 0.4, m = smoothstep(e, e + 0.6, fr); c = mix(c, pick(i0 + 1.0, (v - 0.5) / (uZ + 0.06 * (1.0 - fr)) + 0.5), m); }',   /* the next picture comes across from the left, settling */
    '  c = grd(c, uD, uV);',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppNames(f, q, t){
    var o = f.nm, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-nm-ph', e), ims = bx ? qsa('img', bx) : [];
      o = f.nm = {gl: bx ? GL2.make(bx, NAMES_FS, ims, {}) : null, ni: ims.length, h: qs('.pp-hh', e), k: qs('.pp-h .tk-cv-k', e), f0: qs('.pp-f.i0', e), ic: qs('.pp-nm-ic', e), ps: qsa('.pp-nm-i', e), c: qs('.pp-c', e), b: qs('.pp-nm-b', e), kt: false, on: false}; }
    if (H >= W){ if (o.on){ o.on = false; o.kt = false; [o.h, o.k, o.f0, o.ic, o.c, o.b].concat(o.ps).forEach(CLR); } return; }
    o.on = true;
    var n = o.ps.length, T1 = o.ic ? 1.8 : .95, dn = .7, tC = T1 + n * dn, I = 0, lw = 0, kc = 0, fw = 0;
    var ho = 1 - eio(sg(q, .62, .9)); PUT(o.h, ho, TY(-16 * U * (1 - ho))); PUT(o.f0, ho, TY(-16 * U * (1 - ho)));
    if (o.ic){ var ii = eio(sg(q, .94, 1.24)), io = 1 - eio(sg(q, 1.56, 1.76)); PUT(o.ic, ii * io, TY(16 * U * (1 - ii) - 14 * U * (1 - io))); }
    for (i = 0; i < n; i++){                                                    /* a partner to a step; one is gone before the next comes */
      var a = T1 + i * dn, wi = eio(sg(q, a + .02, a + .22)), wo = 1 - (i === n - 1 ? (o.c ? eio(sg(q, tC - .04, tC + .12)) : 0) : eio(sg(q, a + dn - .18, a + dn - .04)));
      PUT(o.ps[i], wi * wo, TY((1 - wi) * 20 * U - (1 - wo) * 16 * U)); if (i === n - 1) lw = wi * wo;
      if (i && o.ni > 1) I += eio(sg(q, a - .14, a + .24));                     /* its photograph comes a moment before its name */
    }
    PUT(o.b, lw);
    if (o.c){ kc = eio(sg(q, tC + .14, tC + .5)); var kx = 1 - eio(sg(q, tC + 1.0, tC + 1.2)); fw = eio(sg(q, tC + 1.02, tC + 1.6));
      PUT(o.c, kc * kx, TY(14 * U * (1 - kc) - 10 * U * (1 - kx)), BLR(kc));
      if (q > tC + .9 || o.kt){ o.kt = true; PUT(o.k, kx); } }                  /* the type leaves; the picture comes forward */
    var g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); g2.set1('uI', Math.min(o.ni - 1, I)); g2.set1('uV', eio(sg(q, -.4, .12)) * (.5 + .06 * kc + .46 * fw));   /* it comes up the screen dark and lights as it stops: its upper edge never meets the photograph of the block before as a second picture */ g2.set1('uD', 1 - .92 * fw);
      g2.set1('uZ', 1.05 - .05 * eio(sg(q, -.6, tC)) + .045 * fw); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  /* ---------- the vendors' triptych (21.11.2026 10:28: «без затемненої фотографії… кращий ефект»). Three photographs across the screen in their own light; the one of the
     partner in hand takes half the width, the others a quarter each. All the type is in the black band under them. At the end the band goes down out of the screen and the
     pictures grow to its whole height and come nearer: «The technology recedes. The experience of home comes forward». */
  var TRIP_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2;', 'uniform vec2 uRes, uS0, uS1, uS2;', 'uniform float uX1, uX2, uYb, uZ, uV, uTime, uR0, uR1, uR2, uB0, uB1, uB2;', 'varying vec2 v;',
    'void main(){',
    '  if (v.y > uYb){ gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }',                                  /* under the pictures: the band's black */
    '  float x0 = 0.0, x1 = uX1; if (v.x >= uX2){ x0 = uX2; x1 = 1.0; } else if (v.x >= uX1){ x0 = uX1; x1 = uX2; }',
    '  float fx = (v.x - x0) / (x1 - x0), r = v.x >= uX2 ? uR2 : (v.x >= uX1 ? uR1 : uR0);',
    '  if (fx > r){ gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }',                                       /* the block arrives black; each picture opens from its left edge, one after another */
    '  vec2 uv = vec2(fx, v.y), res = vec2((x1 - x0) * uRes.x, uRes.y); vec3 c;',                                 /* 21.11 11:22 («3 картинки, які зумляться»): a picture never changes its size — it fills its third of the whole screen, and the band only covers its foot */
    '  float lv = v.x >= uX2 ? uB2 : (v.x >= uX1 ? uB1 : uB0);',   /* each picture fills its own column, whatever its width */
    '  if (v.x >= uX2) c = texture2D(uT2, cvr(uv, uS2, res)).rgb; else if (v.x >= uX1) c = texture2D(uT1, cvr(uv, uS1, res)).rgb; else c = texture2D(uT0, cvr(uv, uS0, res)).rgb;',
    '  c = ((c - 0.5) * 1.04 + 0.5) * uV * lv;',                                                             /* the picture of the partner in hand in its own light; the other two wait, quieter */
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppTrip(f, q, t){
    var o = f.tr, e = f.el, i, j;
    if (o === undefined){ var bx = qs('.pp-tr-ph', e);
      o = f.tr = {gl: bx ? GL2.make(bx, TRIP_FS, qsa('img', bx), {}) : null, ims: bx ? qsa('img', bx) : [], tb: qs('.pp-tb', e), k: qs('.pp-tb > .tk-cv-k', e), is: qsa('.pp-tb-i', e), c: qs('.pp-tb-c', e), bk: '', bh: 0, ty: '', on: false}; }
    if (H >= W){ if (o.on){ o.on = false; o.bk = ''; o.ty = ''; o.tb.style.transform = ''; [o.k, o.c].concat(o.is).forEach(CLR); } return; }
    o.on = true;
    if (o.bk !== W + 'x' + H){ o.bk = W + 'x' + H; o.bh = o.tb.offsetHeight; }
    var n = o.is.length - 1, T1 = .95, dn = .75, tC = T1 + n * dn, rec = eio(sg(q, tC + .95, tC + 1.55)), w = [], act = [], x;
    for (j = 0; j < n; j++) w[j] = 1 / n;
    for (i = 0; i < n; i++){                                                    /* how far each partner is «in hand»: its picture opens to half the width, the others give way */
      var a = T1 + i * dn; act[i] = eio(sg(q, a - .16, a + .3)) - (i < n - 1 ? eio(sg(q, a + dn - .16, a + dn + .3)) : rec);
    }
    var ty = (rec * o.bh).toFixed(1); if (o.ty !== ty){ o.ty = ty; o.tb.style.transform = 'translate3d(0,' + ty + 'px,0)'; }   /* the band recedes */
    var fo = 1 - eio(sg(q, tC + .95, tC + 1.22)), ki = eio(sg(q, -.4, -.02)); PUT(o.k, ki * fo);                          /* going down with the band its words dim: they are gone before they reach the rail */
    var ho = 1 - eio(sg(q, .62, .9)); PUT(o.is[0], ki * ho, TY(-12 * U * (1 - ho)));
    for (i = 0; i < n; i++){
      var b = T1 + i * dn, wi = eio(sg(q, b + .04, b + .24)), wo = 1 - eio(sg(q, b + dn - .2, b + dn - .06));
      PUT(o.is[i + 1], wi * wo, TY((1 - wi) * 14 * U - (1 - wo) * 12 * U));
    }
    var kc = eio(sg(q, tC + .1, tC + .42)); PUT(o.c, kc * fo, TY(12 * U * (1 - kc)));
    var g2 = o.gl, yb = (H - o.bh * (1 - rec)) / H, R = [eio(sg(q, -.62, -.24)), eio(sg(q, -.48, -.1)), eio(sg(q, -.34, .04))];
    g.strokeStyle = 'rgba(235,235,235,.33)'; g.lineWidth = 1; g.setLineDash([]); x = 0;                                 /* a hairline on each seam, drawn down as the picture right of it opens */
    for (j = 0; j < n - 1; j++){ x += w[j]; if (R[j + 1] > 0){ var sx = Math.round(x * W) - .5; seg(sx, 0, sx, yb * H * R[j + 1]); } }
    if (g2 && g2.ready){ g2.size(); g2.set1('uX1', w[0]); g2.set1('uX2', w[0] + w[1]); g2.set1('uYb', yb); g2.set1('uV', 1); g2.set1('uR0', R[0]); g2.set1('uR1', R[1]); g2.set1('uR2', R[2]);
      var wait = eio(sg(q, T1 - .16, T1 + .3)) * (1 - rec); for (j = 0; j < n; j++) g2.set1('uB' + j, 1 - .62 * wait * (1 - c01(act[j])));   /* all three in full light before the first partner and after the last */
      g2.set1('uZ', 1); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
    else if (!g2){ x = 0; for (j = 0; j < o.ims.length; j++){ var st = o.ims[j].style; st.opacity = R[j].toFixed(3); st.left = (x * 100).toFixed(2) + '%'; st.width = (w[j] * 100 + .05).toFixed(2) + '%'; st.height = (yb * 100).toFixed(2) + '%'; x += w[j]; } }   /* no WebGL: the pictures themselves */
  }
  var WIDE_FS = PP_HEAD + ['uniform sampler2D uT0;', 'uniform vec2 uRes, uS0;', 'uniform float uX, uV, uZ, uTime;', 'varying vec2 v;',
    'void main(){',
    '  float m = smoothstep(uX - 0.5 / uRes.x, uX + 0.5 / uRes.x, v.x);',                                  /* the picture does not move: its left edge does */
    '  vec3 c = grd(texture2D(uT0, cvr((v - 0.5) / uZ + 0.5, uS0, uRes)).rgb, 0.25, uV) * m;',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02 * m;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppWide(f, q, t){
    var o = f.wi, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-wd-ph', e); o = f.wi = {gl: bx ? GL2.make(bx, WIDE_FS, qsa('img', bx), {}) : null, h: qs('.pp-hh', e), f0: qs('.pp-f.i0', e), ps: qsa('.pp-wd-i', e), on: false}; }
    if (H >= W){ if (o.on){ o.on = false; [o.h, o.f0].concat(o.ps).forEach(CLR); } return; }
    o.on = true;
    var n = o.ps.length, T1 = .95, dn = .8, F0 = .2, fa = function(j){ return n > 1 ? 1 / 3 + j * (1 / 3) / (n - 1) : .5; }, F = F0 + (fa(0) - F0) * eio(sg(q, .68, 1.12));
    var ho = 1 - eio(sg(q, .62, .9)); PUT(o.h, ho, TY(-16 * U * (1 - ho))); PUT(o.f0, ho, TY(-16 * U * (1 - ho)));
    for (i = 0; i < n; i++){
      var a = T1 + i * dn, wi = eio(sg(q, a + .04, a + .24)), wo = i === n - 1 ? 1 : 1 - eio(sg(q, a + dn - .2, a + dn - .06));
      PUT(o.ps[i], wi * wo, TY((1 - wi) * 20 * U - (1 - wo) * 16 * U));
      if (i) F += (fa(i) - fa(i - 1)) * eio(sg(q, a - .12, a + .3));           /* wider with each partner: a third, a half, two thirds */
    }
    F *= eio(sg(q, -.85, -.1));
    var ex = Math.round(W * (1 - F));
    bsq(ex, MID, F > .01 ? 1 : 0);                                             /* our square on the edge that moves */
    var g2 = o.gl;
    if (!g2){ var im0 = qs('.pp-wd-ph img', e); if (im0){ im0.style.opacity = '1'; clip(im0, 'inset(0 0 0 ' + (100 - F * 100).toFixed(2) + '%)'); } }   /* no WebGL: the same edge, on the picture itself */
    if (g2 && g2.ready){ g2.size(); g2.set1('uX', ex / W); g2.set1('uV', .88); g2.set1('uZ', 1.04 - .04 * eio(sg(q, -.6, T1 + n * dn))); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  var SAMP_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2, uT3, uT4;', 'uniform vec2 uRes, uS0, uS1, uS2, uS3, uS4;', 'uniform float uK[5];', 'uniform float uTw, uPt, uTime;', 'varying vec2 v;',
    'vec2 sqr(vec2 uv, vec2 img){ float ri = img.x / img.y; vec2 s = ri > 1.0 ? vec2(1.0 / ri, 1.0) : vec2(1.0, ri); return (uv - 0.5) * s + 0.5; }',
    'void main(){',
    '  float i = floor(v.x / uPt + 0.0001), u = (v.x - i * uPt) / uTw; vec3 c = vec3(0.0);',            /* which sample, and where in it */
    '  if (i < 4.5 && u >= 0.0 && u <= 1.0){',
    '    float k = 0.0; for (int j = 0; j < 5; j++){ if (abs(float(j) - i) < 0.5) k = uK[j]; }',
    '    vec2 uv = (vec2(u, v.y) - 0.5) / (1.0 + 0.16 * (1.0 - k)) + 0.5; vec3 tx;',                    /* it settles as it is laid */
    '    if (i < 0.5) tx = texture2D(uT0, sqr(uv, uS0)).rgb; else if (i < 1.5) tx = texture2D(uT1, sqr(uv, uS1)).rgb; else if (i < 2.5) tx = texture2D(uT2, sqr(uv, uS2)).rgb; else if (i < 3.5) tx = texture2D(uT3, sqr(uv, uS3)).rgb; else tx = texture2D(uT4, sqr(uv, uS4)).rgb;',
    '    float m = (1.0 - smoothstep(k * 1.04 - 0.04, k * 1.04, v.y)) * step(0.001, k);',               /* laid from its upper edge down */
    '    c = grd(tx, 0.2, 0.55 + 0.37 * k) * m; c += (hash(v * uRes + uTime) - 0.5) * 0.02 * m;',
    '  }',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppSamp(f, q, t){
    var o = f.sm, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-sm-g', e), ims = qsa('.pp-sm-r img', e);
      o = f.sm = {gl: bx && ims.length ? GL2.make(bx, SAMP_FS, ims, {max: 900}) : null, bx: bx, ims: ims, li: qsa('.pp-sm-r li', e), cs: qsa('.pp-sm-r li p', e), l: qs('.pp-sm-l', e), c: qs('.pp-sm-c', e), K: new Float32Array(5), on: false}; }
    if (H >= W){ if (o.on){ o.on = false; [o.l, o.c].concat(o.cs, o.ims).forEach(CLR); } return; }
    o.on = true;
    var n = o.li.length, r = o.bx.getBoundingClientRect(), sr = f.cv.getBoundingClientRect(), tw = o.li[0].getBoundingClientRect().width, pt = n > 1 ? (r.width - tw) / (n - 1) : 0, a0 = .12, dw = .34, ol = eio(sg(q, -.6, -.1));
    for (i = 0; i < n; i++){
      var k = eio(sg(q, a0 + i * dw, a0 + i * dw + .32)); o.K[i] = k;
      if (k < 1 && ol > 0){ g.strokeStyle = 'rgba(235,235,235,' + (.3 * ol * (1 - k)).toFixed(3) + ')'; g.lineWidth = 1; g.setLineDash([]);       /* a place not yet filled */
        g.strokeRect(Math.round(r.left - sr.left + i * pt) + .5, Math.round(r.top - sr.top) + .5, Math.round(tw) - 1, Math.round(r.height) - 1); }
      PUT(o.cs[i], ol * (.3 + .7 * k));
      if (!o.gl) o.ims[i].style.opacity = k.toFixed(3);                        /* no WebGL: the squares themselves */
    }
    var tE = a0 + n * dw, li = eio(sg(q, -.45, -.05)), lo = 1 - eio(sg(q, tE, tE + .16)), kc = eio(sg(q, tE + .2, tE + .52));
    PUT(o.l, li * lo, TY(-10 * U * (1 - lo))); PUT(o.c, kc, TY(12 * U * (1 - kc)));
    var g2 = o.gl;
    if (g2 && g2.ready && r.width > 0){ g2.size(); g2.gl.uniform1fv(g2.u('uK'), o.K); g2.set1('uTw', tw / r.width); g2.set1('uPt', pt / r.width); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  /* ---------- shared vision as plates (21.11.2026 12:05): her row of squares, carried to the left by the scroll as on CI Turnkey; the plate the scroll has reached takes the gradient */
  function plates(f, q, t){
    strip(f, q, t); if (H >= W) return;
    if (f.pc === undefined) f.pc = qsa('.tk-st-c', f.el);
    var n = f.pc.length, k = Math.min(n - 1, Math.floor(sg(q, .08, f.len - .25) * n));
    if (f.pk !== k){ f.pk = k; f.pc.forEach(function(c, i){ c.classList.toggle('on', i === k); }); }
  }
  /* ---------- shared vision as a track (21.11.2026 12:00): the standards and their photographs follow one another on one horizontal axis and the whole line moves sideways with the
     scroll; the pair in hand is in the middle in full light. The closing sentence is the last thing on the line. Nothing is scaled. */
  var TRK_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2, uT3, uT4;', 'uniform vec2 uRes, uS0, uS1, uS2, uS3, uS4;', 'uniform float uX[5], uB[5];', 'uniform float uW, uTime;', 'varying vec2 v;',
    'void main(){',
    '  vec3 c = vec3(0.0); float m = 0.0; vec2 res = vec2(uW * uRes.x, uRes.y);',
    '  for (int i = 0; i < 5; i++){',
    '    float fx = (v.x - uX[i]) / uW;',
    '    if (fx >= 0.0 && fx < 1.0){ vec2 uv = vec2(fx, v.y);',
    '      if (i == 0) c = texture2D(uT0, cvr(uv, uS0, res)).rgb; else if (i == 1) c = texture2D(uT1, cvr(uv, uS1, res)).rgb; else if (i == 2) c = texture2D(uT2, cvr(uv, uS2, res)).rgb; else if (i == 3) c = texture2D(uT3, cvr(uv, uS3, res)).rgb; else c = texture2D(uT4, cvr(uv, uS4, res)).rgb;',
    '      c = ((c - 0.5) * 1.04 + 0.5) * uB[i]; m = 1.0; }',
    '  }',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02 * m;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppTrack(f, q, t){
    var o = f.tk, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-tk-g', e), ims = qsa('.pp-tk-r img', e);
      o = f.tk = {gl: bx && ims.length === 5 ? GL2.make(bx, TRK_FS, ims, {max: 1400}) : null, ns: qsa('.pp-tk-r p', e), c: qs('.pp-tk-c', e), l: qs('.pp-tk-l', e), X: new Float32Array(5), B: new Float32Array(5), lk: '', xs: [], ws: [], C: [], on: false}; }
    if (H >= W){ if (o.on){ o.on = false; o.lk = ''; [o.c, o.l].concat(o.ns).forEach(CLR); } return; }
    o.on = true;
    var n = o.ns.length, PW = 600 * U, gp = 40 * U, GAP = 140 * U, lk = W + 'x' + H, x = 0;
    if (o.lk !== lk){ o.lk = lk;                                               /* the line is laid out once for a window: a name, 40, its photograph, 140, the next name… and the closing sentence */
      for (i = 0; i < n; i++){ o.ws[i] = o.ns[i].offsetWidth; o.xs[i] = x; o.C[i] = x + (o.ws[i] + gp + PW) / 2; x += o.ws[i] + gp + PW + GAP; }
      o.xs[n] = x; o.C[n] = x + o.c.offsetWidth / 2; }
    var T0 = .5, dn = .6, P = 0; for (i = 0; i < n; i++) P += eio(sg(q, T0 + i * dn, T0 + i * dn + .42));           /* 0…n − 1 the pairs · n the closing sentence */
    var ar = eio(sg(q, -.5, -.02)), dr = eio(sg(q, -.6, -.05)), i0 = Math.min(n - 1, Math.floor(P)), cen = o.C[i0] + (o.C[i0 + 1] - o.C[i0]) * (P - i0), off = W / 2 - cen + (1 - ar) * 520 * U;
    for (i = 0; i <= n; i++){ var near = 1 - Math.min(1, Math.abs(P - i)), xx = o.xs[i] + off;
      PUT(i < n ? o.ns[i] : o.c, ar * (.34 + .66 * near), 'translate3d(' + xx.toFixed(1) + 'px,-50%,0)');
      if (i < n){ o.X[i] = (xx + o.ws[i] + gp) / W; o.B[i] = ar * (.42 + .58 * near); } }
    if (dr > 0){ var ly = Math.round(H / 2 + 375 * U) + .5, lx0 = 50 * U, lx1 = W - 50 * U;
      g.strokeStyle = 'rgba(235,235,235,.33)'; g.lineWidth = 1; g.setLineDash([]); seg(lx0, ly, lx0 + (lx1 - lx0) * dr, ly);
      bsq(lx0 + (lx1 - lx0) * P / n, ly, ar); }                                                                     /* how far along the line */
    PUT(o.l, ar);
    var g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); var gl = g2.gl; gl.uniform1fv(g2.u('uX'), o.X); gl.uniform1fv(g2.u('uB'), o.B); g2.set1('uW', PW / W); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  /* ---------- shared vision as a table of five rows (21.11.2026): the row in hand opens tall and a band of material is drawn out in it from the screen's middle; at the end the
     five stand equal with all five bands. A band keeps its size — the row is a window onto it (nothing is scaled). */
  var ROWS_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2, uT3, uT4;', 'uniform vec2 uRes, uS0, uS1, uS2, uS3, uS4;', 'uniform float uY[5], uH[5], uR[5], uF[5];', 'uniform float uTime;', 'varying vec2 v;',
    'void main(){',
    '  vec3 c = vec3(0.0); float m = 0.0;',
    '  for (int i = 0; i < 5; i++){',
    '    float y0 = uY[i], hh = uH[i];',
    '    if (v.y >= y0 && v.y < y0 + hh && v.x < uR[i]){',
    '      vec2 s = i == 0 ? uS0 : (i == 1 ? uS1 : (i == 2 ? uS2 : (i == 3 ? uS3 : uS4)));',
    '      vec2 uv = vec2(v.x, uF[i] + (v.y - (y0 + hh * 0.5)) * (uRes.y / uRes.x) * (s.x / s.y));',              /* the picture's whole width across the band; its height follows */
    '      if (i == 0) c = texture2D(uT0, uv).rgb; else if (i == 1) c = texture2D(uT1, uv).rgb; else if (i == 2) c = texture2D(uT2, uv).rgb; else if (i == 3) c = texture2D(uT3, uv).rgb; else c = texture2D(uT4, uv).rgb;',
    '      m = 1.0;',
    '    }',
    '  }',
    '  c = ((c - 0.5) * 1.04 + 0.5) * m; c += (hash(v * uRes + uTime) - 0.5) * 0.02 * m;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppRows(f, q, t){
    var o = f.sv, e = f.el, i, j;
    if (o === undefined){ var bx = qs('.pp-sv-g', e), ims = qsa('.pp-sv-r img', e);
      o = f.sv = {gl: bx && ims.length === 5 ? GL2.make(bx, ROWS_FS, ims, {max: 1600}) : null, li: qsa('.pp-sv-r li', e), l: qs('.pp-sv-l', e), c: qs('.pp-sv-c', e),
                  Y: new Float32Array(5), Hh: new Float32Array(5), R: new Float32Array(5), F: new Float32Array((e.getAttribute('data-f') || '').split(',').map(Number)), on: false}; }
    if (H >= W){ if (o.on){ o.on = false; [o.l, o.c].concat(o.li).forEach(CLR); } return; }
    o.on = true;
    var n = o.li.length, T1 = .7, dn = .6, tC = T1 + n * dn, E = eio(sg(q, tC + .02, tC + .5)), ar = eio(sg(q, -.45, -.02)), dr = eio(sg(q, -.6, -.05));
    var top = H / 2 - 120 * U, TH = 540 * U, he = TH / n, hc = 56 * U, ho = TH - (n - 1) * hc, pad = 8 * U, h = [], a = [], sum = 0, y = top, x0 = 50 * U, x1 = W - 50 * U;
    for (j = 0; j < n; j++) h[j] = he;
    for (i = 0; i < n; i++){ var s0 = T1 + i * dn; a[i] = eio(sg(q, s0 - .08, s0 + .22)) - (i < n - 1 ? eio(sg(q, s0 + dn - .08, s0 + dn + .22)) : E); sum += a[i];
      for (j = 0; j < n; j++) h[j] += a[i] * ((j === i ? ho : hc) - he); }
    g.strokeStyle = 'rgba(235,235,235,.33)'; g.lineWidth = 1; g.setLineDash([]);
    for (i = 0; i < n; i++){
      var yy = Math.round(y) + .5; if (dr > 0) seg(x0, yy, x0 + (x1 - x0) * dr, yy);                                    /* a hairline over each row */
      var br = Math.max(a[i], E, 1 - sum - E);                                                                         /* a name is bright when its row is in hand — and all of them before and after */
      PUT(o.li[i], ar * (.4 + .6 * c01(br)), 'translate3d(0,' + (y - top).toFixed(1) + 'px,0)');
      if (a[i] > .02) bsq(W / 2, yy, c01(a[i] * 1.6) * (1 - E));                                                        /* our square on the line of the row in hand, where its band begins */
      o.Y[i] = (y - top + pad) / TH; o.Hh[i] = Math.max(0, h[i] - 2 * pad) / TH; o.R[i] = Math.max(a[i], E);
      y += h[i];
    }
    if (dr > 0){ var yb = Math.round(top + TH) + .5; seg(x0, yb, x0 + (x1 - x0) * dr, yb); }
    var kc = eio(sg(q, tC + .1, tC + .5)), lo = 1 - eio(sg(q, tC - .1, tC + .14));
    PUT(o.l, ar * lo, TY(-10 * U * (1 - lo))); PUT(o.c, kc, TY(12 * U * (1 - kc)));
    var g2 = o.gl;
    if (g2 && g2.ready){ g2.size(); var gl = g2.gl; gl.uniform1fv(g2.u('uY'), o.Y); gl.uniform1fv(g2.u('uH'), o.Hh); gl.uniform1fv(g2.u('uR'), o.R); gl.uniform1fv(g2.u('uF'), o.F); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  /* ---------- the one circle, on her reference (21.11.2026 10:44, madeinuxstudio.com's dial): a quiet ring, a brighter arc of it that grows by a third with each pair, three ticks
     inside it at 12, 4 and 8 o'clock; the round photograph in its centre changes by a circle that grows from the centre; the number in hand rolls left of it; the pairs and then
     the closing sentence roll in one window on the same axis at the left field. */
  var RING_FS = PP_HEAD + ['uniform sampler2D uT0, uT1, uT2, uT3;', 'uniform vec2 uRes, uS0, uS1, uS2, uS3;', 'uniform float uA, uP, uR, uOpen, uTime;', 'varying vec2 v;',
    /* the first three photographs are cut to the round window (a square 2R about the centre); the last is the closing screen's own, at the size and grade it has there */
    'vec3 pk(float i, vec2 us){ vec3 c; if (i < 0.5) c = texture2D(uT0, cvr(us, uS0, vec2(1.0))).rgb; else if (i < 1.5) c = texture2D(uT1, cvr(us, uS1, vec2(1.0))).rgb; else if (i < 2.5) c = texture2D(uT2, cvr(us, uS2, vec2(1.0))).rgb;',
    '  else return ((texture2D(uT3, cvr(v, uS3, uRes)).rgb - 0.5) * 1.04 + 0.5) * mix(1.0, 0.62, uOpen); return (c - 0.5) * 1.04 + 0.5; }',
    'void main(){',
    '  vec2 p = v * uRes, c0 = uRes * 0.5; float d = length(p - c0), aa = 1.5, R0 = uR * uRes.y, R = mix(R0 * uA, length(c0) + 2.0, uOpen), m = 1.0 - smoothstep(R - aa, R, d);',   /* the window: round, and at the end the whole screen */
    '  vec2 us = (p - c0) / (2.0 * R0) + 0.5;',
    '  float i0 = floor(uP), k = uP - i0, rk = k * R0, mk = k > 0.001 ? 1.0 - smoothstep(rk - aa, rk, d) : 0.0;',   /* the next photograph grows from the centre of the one in hand */
    '  vec3 c = mix(pk(i0, us), pk(min(i0 + 1.0, 3.0), us), mk) * m;',
    '  c += (hash(v * uRes + uTime) - 0.5) * 0.02 * m;',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'].join('\n');
  function ppRing(f, q, t){
    var o = f.rg, e = f.el, i;
    if (o === undefined){ var bx = qs('.pp-rg-ph', e);
      o = f.rg = {gl: bx ? GL2.make(bx, RING_FS, qsa('img', bx), {max: 1600}) : null, nx: e.nextElementSibling && e.nextElementSibling.classList.contains('fin') ? qsa('.rv', e.nextElementSibling) : [], ims: bx ? qsa('img', bx) : [], ws: qsa('.pp-rg-w > p', e), w: qs('.pp-rg-w', e), a: qs('.pp-rg-a', e), b: qs('.pp-rg-b', e),
                  rw: qsa('.pp-rg-rw', e).map(function(x){ return qsa(':scope > span', x); }), id: qs('.pp-rg-id', e), ids: qsa('.pp-rg-id span', e), of: qs('.pp-rg-of', e), on: false}; }
    var n = o.ws.length - 1, all = [o.w, o.a, o.b, o.id, o.of, o.k].concat(o.ws, o.ids, o.rw[0] || [], o.rw[1] || []);   /* n pairs; before them the lead, after them the closing sentence */
    if (H >= W){ if (o.on){ o.on = false; o.dn = undefined; e.classList.remove('pp-rg-done'); all.forEach(function(x){ CLR(x); if (x) x.__ty = ''; }); for (i = 0; i < o.nx.length; i++) o.nx[i].classList.add('in'); } return; }
    o.on = true;
    var cx = W / 2, cy = H / 2, r = 300 * U, T0 = .5, dp = .7, P = 0, A0 = -Math.PI / 2;
    for (i = 0; i <= n; i++) P += eio(sg(q, T0 + i * dp, T0 + i * dp + .45));                      /* 0 the lead · 1…n the pairs · n + 1 the closing sentence */
    var dr = eio(sg(q, -.6, -.05)), ar = eio(sg(q, -.45, -.02)), fr = Math.min(P, n) / n, Pt = c01(P - n);
    var tO = T0 + n * dp + .45 + .3, op = eio(sg(q, tO, tO + .6)), fo = 1 - eio(sg(q, tO, tO + .22)), done = q >= f.len - .004;   /* the end: the round window opens onto the closing screen; the ring and the words go first */
    if (o.dn !== done){ o.dn = done; e.classList.toggle('pp-rg-done', done); for (i = 0; i < o.nx.length; i++) o.nx[i].classList.toggle('in', done); }   /* the closing block is under the film's last screen: it is uncovered, and its words come in */
    else if (!done && o.nx.length && o.nx[0].classList.contains('in')) for (i = 0; i < o.nx.length; i++) o.nx[i].classList.remove('in');
    function roll(items, at){ for (var j = 0; j < items.length; j++){ var ty = ((j - at) * 100).toFixed(2); if (items[j].__ty !== ty){ items[j].__ty = ty; items[j].style.transform = 'translate3d(0,' + ty + '%,0)'; items[j].style.visibility = Math.abs(j - at) >= 1 ? 'hidden' : 'visible'; } } }
    if (dr > 0 && fo > 0){ g.lineWidth = 1; g.setLineDash([]); g.globalAlpha = fo;
      g.strokeStyle = 'rgba(235,235,235,.22)'; g.beginPath(); g.arc(cx, cy, r, A0, A0 + Math.PI * 2 * dr); g.stroke();                      /* the ring, quiet */
      if (fr > 0){ g.strokeStyle = 'rgba(235,235,235,.95)'; g.beginPath(); g.arc(cx, cy, r, A0, A0 + Math.PI * 2 * fr); g.stroke(); }       /* what has been said of it, bright */
      g.strokeStyle = 'rgba(235,235,235,' + (.9 * ar).toFixed(3) + ')';
      for (i = 0; i < n; i++){ var an = A0 + i * Math.PI * 2 / n, c0 = Math.cos(an), s0 = Math.sin(an); seg(cx + c0 * (r - 24 * U), cy + s0 * (r - 24 * U), cx + c0 * (r - 43 * U), cy + s0 * (r - 43 * U)); }   /* a tick where each pair begins */
      var ah = A0 + Math.PI * 2 * fr; bsq(cx + Math.cos(ah) * r, cy + Math.sin(ah) * r, ar * fo);                                         /* our square at the head of the arc */
      g.globalAlpha = 1;
    }
    roll(o.ws, P);                                                             /* under the ring: the lead, then the pairs; the last one goes up as the title turns */
    if (o.rw[0]) roll(o.rw[0], Pt); if (o.rw[1]) roll(o.rw[1], Pt);              /* either side of the ring: the title, and at the end the closing sentence in its place */
    roll(o.ids, Math.max(0, Math.min(P - 1, n - 1)));
    var ko = ar * eio(sg(P, .45, .95)) * (1 - eio(sg(P, n + .1, n + .6)));                                                                 /* the numbers come with the first pair and go as the ring closes */
    PUT(o.id, ko); PUT(o.of, ko); PUT(o.a, ar * fo); PUT(o.b, ar * fo); PUT(o.w, ar);
    if (o.k === undefined) o.k = qs('.pp-rg-a .tk-cv-k', e); PUT(o.k, 1 - eio(c01(Pt * 2)));                                            /* the block's name leaves as its title turns into the closing sentence */
    var g2 = o.gl, ua = eio(sg(q, -.4, .15)), up = Math.max(0, Math.min(P - 1, n));
    if (g2 && g2.ready){ g2.size(); g2.set1('uA', ua); g2.set1('uP', up); g2.set1('uR', 165 * U / H); g2.set1('uOpen', op); g2.set1('uTime', (t * 60) | 0); g2.draw(); }
  }
  var FIG = {cover: cover, steps: steps, plan: plan, unfold: unfold, scene: scene, key: key, many: many, wall: wall, horiz: horiz, drawn: drawn, glcv: glcv, count: count, team: team, strip: strip, loose: loose, recv: recv, seam: seam, words: words, feat: feat, relay: relay, point: point, pparts: ppParts, pquart: ppQuart, pnames: ppNames, pwide: ppWide, ptrip: ppTrip, prows: ppRows, ptrack: ppTrack, plates: plates, psamp: ppSamp, pring: ppRing};

  /* ================================================================== flow */
  /* blocks reveal once as they arrive: the title focuses in, the rest comes up one after another */
  (function(){
    var bl = qsa('.bk, .fin');
    bl.forEach(function(b){ qsa('.rv', b).forEach(function(e, i){ e.style.setProperty('--d', Math.min(i, 12)); }); });
    if (!('IntersectionObserver' in window) || reduced){ qsa('.rv').forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (!en.isIntersecting) return; en.target.classList.add('in'); io.unobserve(en.target); }); }, {rootMargin: '0px 0px -12% 0px'});
    qsa('.rv').forEach(function(e){ io.observe(e); });
  })();
  /* rows that open; one at a time within a list */
  qsa('.qa .qh').forEach(function(b){ b.addEventListener('click', function(){
    var qa = b.parentNode, was = qa.classList.contains('open');
    qsa('.qa.open', qa.parentNode).forEach(function(o){ o.classList.remove('open'); qs('.qh', o).setAttribute('aria-expanded', 'false'); });
    if (!was){ qa.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
  }); });
  /* chips that filter a list */
  qsa('[data-filter]').forEach(function(box){
    var list = $(box.getAttribute('data-filter')); if (!list) return;
    var chips = qsa('.chip', box), items = qsa('[data-tags]', list);
    chips.forEach(function(c){ c.addEventListener('click', function(){
      chips.forEach(function(o){ o.classList.toggle('on', o === c); });
      var fv = c.getAttribute('data-f'), n = 0;
      items.forEach(function(it){ var ok = fv === 'all' || (' ' + it.getAttribute('data-tags') + ' ').indexOf(' ' + fv + ' ') >= 0; it.hidden = !ok; if (ok) n++; });
      list.classList.toggle('empty', n === 0);
    }); });
  });
  /* the blog's filter (21.11.2026): one block on the foot of the screen that opens upward into tick-boxes; several can be on at once. The grid keeps its rhythm of wide and narrow
     tiles over whatever is left (the same list as NT_PAT in tools/site/pages.py). */
  qsa('.nf').forEach(function(nf){
    var list = $(nf.getAttribute('data-list')); if (!list) return;
    document.documentElement.classList.add('has-nf');                          /* the filter stands in the rail's place */
    var bar = qs('.nf-b', nf), lab = qs('.nf-b .t', nf), all = lab.textContent, boxes = qsa('.nf-i button', nf), items = qsa('[data-tags]', list), PAT = [1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0];
    function apply(){
      var on = boxes.filter(function(b){ return b.getAttribute('aria-checked') === 'true'; }), fs = on.map(function(b){ return b.getAttribute('data-f'); }), n = 0;
      items.forEach(function(it){ var ok = !fs.length || fs.indexOf(it.getAttribute('data-tags')) >= 0; it.hidden = !ok; if (ok){ it.classList.toggle('b', !!PAT[n % PAT.length]); n++; } });
      list.classList.toggle('empty', n === 0); nf.classList.toggle('has', fs.length > 0);
      lab.textContent = fs.length ? on.map(function(b){ return b.textContent.trim(); }).join(' + ') : all;
    }
    function open(v){ nf.classList.toggle('open', v); bar.setAttribute('aria-expanded', v ? 'true' : 'false'); }
    boxes.forEach(function(b){ b.addEventListener('click', function(){ b.setAttribute('aria-checked', b.getAttribute('aria-checked') === 'true' ? 'false' : 'true'); apply(); }); });
    bar.addEventListener('click', function(){ open(!nf.classList.contains('open')); });
    document.addEventListener('click', function(ev){ if (!nf.contains(ev.target)) open(false); });
    document.addEventListener('keydown', function(ev){ if (ev.key === 'Escape') open(false); });
    if ('IntersectionObserver' in window){ new IntersectionObserver(function(es){ var v = es[0].isIntersecting; nf.classList.toggle('in', v); if (!v) open(false); }, {rootMargin: '-35% 0px -12% 0px'}).observe(list); }
    else nf.classList.add('in');
  });
  /* the form checks itself; nothing is sent anywhere yet */
  qsa('form.frm').forEach(function(fm){
    fm.addEventListener('submit', function(e){
      e.preventDefault(); var bad = 0;
      qsa('[required]', fm).forEach(function(i){ var ok = i.value.trim() && (i.type !== 'email' || /^\S+@\S+\.\S+$/.test(i.value.trim())); i.closest('.fr').classList.toggle('bad', !ok); if (!ok && !bad++) i.focus(); });
      if (!bad){ fm.classList.add('sent'); var y = fm.getBoundingClientRect().top + window.scrollY - window.innerHeight * .3; smoothTo(y); }
    });
    qsa('[required]', fm).forEach(function(i){ i.addEventListener('input', function(){ i.closest('.fr').classList.remove('bad'); }); });
  });
  qsa('[data-noop]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); }); });

  /* ================================================================== FOOTER · the homepage's street in hairlines; one window is ours */
  (function(){
    var svg = $('ftCity'); if (!svg) return;
    var seed = 11; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var GY = 330, x = -10, i = 0, dots = '', lit = '', CI = null, gB = el('g', {'class': 'ft-b'}, svg);
    while (x < 1610){
      var w = 46 + Math.round(rnd() * 96), tall = rnd() < .18, h = tall ? 210 + rnd() * 110 : 60 + rnd() * 150, d = 'M' + f1(x) + ' ' + GY + 'V' + f1(GY - h);
      var sb = h > 150 && rnd() < .5 ? Math.round(w * (.14 + rnd() * .12)) : 0, sh = sb ? 18 + rnd() * 26 : 0;
      if (sb) d += 'H' + f1(x + sb) + 'V' + f1(GY - h - sh) + 'H' + f1(x + w - sb) + 'V' + f1(GY - h) + 'H' + f1(x + w); else d += 'H' + f1(x + w);
      d += 'V' + GY;
      if (tall && rnd() < .6) d += 'M' + f1(x + w / 2) + ' ' + f1(GY - h - sh) + 'V' + f1(GY - h - sh - 22 - rnd() * 30);
      var pth = el('path', {d: d, pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, gB); pth.style.setProperty('--i', i);
      var bx = 9 + Math.round(rnd() * 4), fy = 11 + Math.round(rnd() * 3);
      for (var yy = GY - 14; yy > GY - h + 8; yy -= fy) for (var xx = x + 7; xx < x + w - 5; xx += bx){
        var qd = 'M' + f1(xx) + ' ' + f1(yy) + 'h.1';
        if (!CI && x > 300 && x < 520 && h > 150 && yy < GY - 90){ CI = [xx, yy]; continue; }
        if (rnd() < .07) lit += qd; else dots += qd;
      }
      x += w + (rnd() < .3 ? 6 + Math.round(rnd() * 14) : 0); i++;
    }
    el('path', {d: 'M0 ' + GY + 'H1600', 'class': 'ft-gl', pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, svg);
    el('path', {d: dots, 'class': 'ft-dots', 'vector-effect': 'non-scaling-stroke'}, svg);
    el('path', {d: lit, 'class': 'ft-lit', 'vector-effect': 'non-scaling-stroke'}, svg);
    if (CI) el('rect', {x: f1(CI[0] - 3), y: f1(CI[1] - 3), width: 6, height: 6, 'class': 'ft-ci'}, svg);
    var ft = $('footer');
    if (!('IntersectionObserver' in window) || reduced){ ft.classList.add('in'); return; }
    var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ ft.classList.add('in'); io.disconnect(); } }, {rootMargin: '0px 0px -10% 0px'});
    io.observe(svg);
  })();



  /* ================================================================== Solutions' first screen: the pointer on a way brings its photograph up */
  (function(){
    var cells = qsa('.sf-cell'); if (!cells.length) return;
    var ims = qsa('.sf-ph img');
    function set(i){ cells.forEach(function(c, k){ c.classList.toggle('on', k === i); }); ims.forEach(function(m, k){ m.classList.toggle('on', k === i); }); }
    cells.forEach(function(c, i){
      c.addEventListener('pointerenter', function(){ set(i); });
      c.addEventListener('focus', function(){ set(i); });
    });
  })();

  /* ================================================================== CI Wellness: the invisible, drawn
     The room is a room. The pointer on one of the client's nine draws that one over it in a single stroke and lets it go again — which is the
     page's argument: «Controls can disappear. Infrastructure can remain behind the architecture.» */
  (function(){
    var gs = qsa('[data-wl]'); if (!gs.length) return;
    gs.forEach(function(g){
      var sec = g.parentNode, bs = qsa('.wl-b', sec), ls = qsa('.wl-sv g', g), ds = qsa('.wl-d', sec);
      function set(i){
        bs.forEach(function(b, k){ b.classList.toggle('on', k === i); });
        ls.forEach(function(l, k){ l.classList.toggle('on', k === i); });
        ds.forEach(function(d, k){ d.classList.toggle('on', k === i); });
        if (i < 0) g.removeAttribute('data-on'); else g.setAttribute('data-on', '1');
      }
      bs.forEach(function(b, i){
        b.addEventListener('pointerenter', function(){ set(i); });
        b.addEventListener('focus', function(){ set(i); });
        b.addEventListener('click', function(){ set(i); });
      });
      ls[0].classList.add('on'); g.setAttribute('data-on', '1');   /* the first quality is shown: the line under the room is never empty */
    });
  })();

  /* ================================================================== CI Curated's composition: a residence, in its parts
     The pointer on a fragment names it and brings it forward; the rest step back. Nothing moves out of place — the composition holds, which
     is the page's whole argument. */
  (function(){
    var gs = qsa('[data-comp]'); if (!gs.length) return;
    gs.forEach(function(g){
      var cs = qsa('.cu-c', g);
      function set(i){
        cs.forEach(function(c, k){ c.classList.toggle('on', k === i); });
        if (i < 0) g.removeAttribute('data-on'); else g.setAttribute('data-on', '1');
      }
      cs.forEach(function(c, i){
        c.addEventListener('pointerenter', function(){ set(i); });
        c.addEventListener('focus', function(){ set(i); });
      });
      g.addEventListener('pointerleave', function(){ set(-1); });
    });
  })();

  /* ================================================================== the site's WebGL layer (17.11.2026 12:51: «Завжди ми робимо на WebGL»)
     A small one: one quad, one shader, the pictures of a block as its textures. The 3D of the intro is three.js; here a library would only
     add weight — what these blocks need is a fragment shader over a photograph. Written against WebGL 1 so it runs everywhere, and every
     block keeps its DOM version underneath: if the context is refused, nothing is lost. */
  var GL2 = (function(){
    var VS = 'attribute vec2 p;varying vec2 v;void main(){v=vec2(p.x,1.0-p.y);gl_Position=vec4(p*2.0-1.0,0.0,1.0);}';
    function sh(gl, t, src){
      var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    function tex(gl, img, max){
      var t = gl.createTexture(), m = Math.max(img.naturalWidth, img.naturalHeight);
      if (max && m > max){                                                  /* a picture shown small is given to the GPU small: no shimmer where it is reduced */
        var c = document.createElement('canvas'), x = c.getContext('2d');
        c.width = Math.round(img.naturalWidth * max / m); c.height = Math.round(img.naturalHeight * max / m);
        x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, c.width, c.height); img = c;
      }
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      return t;
    }
    /* make(box, fragment source, the <img> elements of the block, {alpha: the layer is seen through where the shader says so,
       max: the longest side of a texture}) → {set(name, …), draw(), u(name)} or null if there is no context */
    function make(box, FS, imgs, opt){
      opt = opt || {};
      var cv = document.createElement('canvas'); cv.className = 'glc'; cv.setAttribute('aria-hidden', 'true');
      var gl = cv.getContext('webgl', {alpha: !!opt.alpha, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance'});
      if (!gl) return null;
      var pr = gl.createProgram(), vs = sh(gl, gl.VERTEX_SHADER, VS), fs = sh(gl, gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return null;
      gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)){ console.warn(gl.getProgramInfoLog(pr)); return null; }
      gl.useProgram(pr);
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 1,0, 0,1, 0,1, 1,0, 1,1]), gl.STATIC_DRAW);
      var ap = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
      var U = {}, ts = [], ready = 0;
      function u(n){ if (!(n in U)) U[n] = gl.getUniformLocation(pr, n); return U[n]; }
      box.appendChild(cv);
      var o = {
        gl: gl, cv: cv, u: u, ready: false, w: 0, h: 0,
        size: function(){
          var r = box.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
          var w = Math.round(r.width * d), h = Math.round(r.height * d);
          if (w === o.w && h === o.h) return false;
          o.w = w; o.h = h; cv.width = w; cv.height = h; gl.viewport(0, 0, w, h);
          gl.uniform2f(u('uRes'), r.width, r.height);
          return true;
        },
        set1: function(n, v){ gl.uniform1f(u(n), v); },
        set2: function(n, a, b){ gl.uniform2f(u(n), a, b); },
        draw: function(){ if (!o.ready) return; gl.drawArrays(gl.TRIANGLES, 0, 6); }
      };
      imgs.forEach(function(im, i){
        function load(){
          gl.activeTexture(gl.TEXTURE0 + i);
          ts[i] = tex(gl, im, opt.max);
          gl.uniform1i(u('uT' + i), i);
          gl.uniform2f(u('uS' + i), im.naturalWidth, im.naturalHeight);   /* the picture's own proportions, whatever size the texture is */
          if (++ready === imgs.length){ o.ready = true; box.classList.add('gl-on'); o.size(); if (o.onready) o.onready(); }
        }
        if (im.complete && im.naturalWidth) load(); else im.addEventListener('load', load);
      });
      return o;
    }
    return {make: make};
  })();

  /* ================================================================== the covers, on the same layer (17.11.2026)
     Three shaders, one for each thing a cover of ours does: the world retreating below the line (CI Turnkey), the drawing building into the
     room along its own lines (CI Core), and a photograph simply standing there with our grain in it (CI Curated, CI Wellness). The scroll
     drives them through the film's own q, so nothing is on a timer and nothing animates clip-path over a full-screen picture any more. */
  var GLSH = {
    /* the world goes below one line, and the picture rises inside what is left of it */
    retreat: [
      'float p = smoothstep(0.08, 0.92, uQ);',
      'float cut = p * 0.56;',
      'vec2 uv = v - vec2(0.0, p * 0.24);',
      'vec3 c = grade(texture2D(uT0, cov(uv, uS0)).rgb);',
      'float w = 1.2 / uRes.y;',
      'c *= smoothstep(cut - w, cut + w, v.y);'].join('\n'),
    /* the room arrives where the drawing already has ink, and spreads from there */
    build: [
      'vec3 a = texture2D(uT0, cov(v, uS0)).rgb;',
      'vec3 b = grade(texture2D(uT1, cov(v, uS1)).rgb);',
      'float p = smoothstep(0.1, 0.9, uQ);',
      'float k = p * 1.45 - 0.45 + dot(a, vec3(0.299, 0.587, 0.114)) * 0.45;',
      'vec3 c = mix(a, b, smoothstep(0.0, 0.5, k));'].join('\n'),
    /* the room itself, rising out of the dark where the drawing stood */
    rise: [
      'vec2 uv = (v - 0.5) / mix(1.05, 1.0, smoothstep(0.0, 1.0, uQ)) + 0.5;',
      'vec3 c = grade(texture2D(uT0, cov(uv, uS0)).rgb) * smoothstep(0.0, 0.92, uQ);'].join('\n'),
    /* CI Turnkey: the room, as a drawing of itself and then as itself. The drawing (uT1, the room drafted clean) grows out of the line
       that stands down the middle of the screen: uT2 is the moment the ink reaches each point along the strokes, uA how far it has got,
       and the pen's tip is a little brighter than the ink behind it. The home (uT0) stands between the two halves of the line once it
       has parted (uB, their places across the screen): one straight front. Just behind it the ink still lies on the photograph and is
       given up within a hand's width (tools/site/sketch.py) */
    room: [
      'vec3 ph = grade(texture2D(uT0, cov(v, uS0)).rgb);',
      'float ln = texture2D(uT1, cov(v, uS1)).r;',
      'float T = texture2D(uT2, cov(v, uS2)).r;',
      'float gq = uA * 1.2 - 0.02;',
      'float on = smoothstep(T - 0.006, T + 0.022, gq);',
      'float tip = on * (1.0 - smoothstep(T + 0.03, T + 0.17, gq));',
      'vec3 sk = vec3(ln * on * (0.8 + 0.2 * tip));',
      'float w = 1.0 / uRes.x;',
      'float ins = smoothstep(uB.x - w, uB.x + w, v.x) * (1.0 - smoothstep(uB.y - w, uB.y + w, v.x));',
      'float keep = 1.0 - smoothstep(0.0, 0.085, min(v.x - uB.x, uB.y - v.x));',
      'vec3 c = mix(sk, ph * mix(0.88, 1.0, smoothstep(0.3, 1.0, uQ)) + sk * keep * 0.9, ins);',
      /* 18.11: the page's thought comes to stand on the home. The picture is not veiled: its LIGHT is taken down — the sky in the window
         most, the room in its own dusk hardly at all — and more towards the half where the words stand. The evening simply deepens. */
      'float lum = dot(c, vec3(0.299, 0.587, 0.114));',
      'c *= mix(1.0, mix(0.9, 0.5, smoothstep(0.12, 0.62, lum)), uF * mix(0.5, 1.0, smoothstep(0.24, 0.56, v.x)));'].join('\n'),
    /* a photograph, settling */
    still: [
      'float s = mix(1.06, 1.0, smoothstep(0.0, 1.0, uQ));',
      'vec2 uv = (v - 0.5) / s + 0.5;',
      'vec3 c = grade(texture2D(uT0, cov(uv, uS0)).rgb);'].join('\n')
  };
  function glCoverFS(body, br){
    return [
      'precision highp float;',
      'uniform sampler2D uT0, uT1, uT2;',
      'uniform vec2 uRes, uS0, uS1, uS2;',
      'uniform float uQ, uTime, uA, uF;',
      'uniform vec2 uC, uH, uB;',
      'varying vec2 v;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'vec2 cov(vec2 uv, vec2 img){',
      '  float ra = uRes.x / uRes.y, ri = img.x / img.y;',
      '  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);',
      '  return (uv - 0.5) * s + 0.5;',   /* cover: the picture fills the box and is cropped, never squeezed in with its edge smeared */
      '}',
      'vec3 grade(vec3 c){ c = (c - 0.5) * 1.06 + 0.5; return c * ' + br.toFixed(3) + '; }',
      'void main(){',
      body,
      '  c += (hash(v * uRes + uTime) - 0.5) * 0.020;',
      '  gl_FragColor = vec4(c, 1.0);',
      '}'].join('\n');
  }
  /* the film's own figure: the cover is drawn by the scroll, like every other scene of ours */
  function glcv(f, q, t){
    if (f.glo === undefined){
      var box = qs('.tk-cv-ph, .co-cv-ph, .cu-cv-ph', f.el);
      var kind = f.el.getAttribute('data-gl') || 'still';
      var br = +f.el.getAttribute('data-br') || .72;
      f.glo = box ? GL2.make(box, glCoverFS(GLSH[kind] || GLSH.still, br), qsa('img', box)) : null;
    }
    var o = f.glo;
    for (var i = 0; i < f.sc.length; i++) runScrub(f.sc[i], q);   /* the DOM pictures keep their scrubs: they are what shows if there is no context */
    if (o && o.ready){ o.size(); o.set1('uQ', q); o.set1('uTime', (t * 60) | 0); o.draw(); }
    if (f.hasI === undefined) f.hasI = f.el.classList.contains('has-i');
    if (f.hasI && W > H) cross(eio(sg(q, 1.2, 1.62)), eio(sg(q, 1.34, 1.76)));   /* the page's thought on the built photograph, as on Turnkey's cover */
    if (f.el.getAttribute('data-gl') === 'retreat') horizLine(f, q);   /* the line itself stays on the 2d canvas: one crisp pixel, and our square at each field */
  }
  /* the horizon CI Turnkey's cover leaves behind, and the page's own line */
  function horizLine(f, q){
    var a = sg(q, .12, .62), w = eio(c01((q - .12) / .78));
    if (a <= .002 || w <= 0) return;
    var y = Math.round(H * .56) + .5, cx = W / 2, hw = (W / 2 - 50 * U) * w;
    ink(a * .62, 1); seg(cx - hw, y, cx + hw, y);
    sq(cx - hw, y, a * .9); sq(cx + hw, y, a * .9);
  }

  /* ================================================================== CI Turnkey's projects: a slider (18.11.2026 16:10, her frame 644:8894)
     «Я хочу, щоб ти перемалював стрілку вліво і стрілку вправо, щоб наш слайдер працював.» The project in hand stands large in the
     middle, the one before it and the one after it small either side. The three pictures are ONE WebGL layer over the row: on a step
     each picture travels to its next place and is fitted to its frame all the way (its crop is kept on the point read from her
     frame, data-f), the one that leaves closes at its field and the one that arrives opens from it — photographs on this site open and
     close, they do not fade. Where the places are is read from the page (three empty cells laid out by the css), so the same code
     serves the phone, where only the middle one exists and the pictures pass through it. The name and the small caps are DOM. */
  (function(){
    var sec = qs('[data-pjs]'); if (!sec) return;
    var row = qs('.tk-pj-r', sec), box = qs('.tk-pj-ph', sec), imgs = qsa('img', box), caps = qsa('.tk-pj-cp', sec), N = imgs.length;
    if (N < 2) return;
    var sL = qs('.tk-pj-s.l', sec), sC = qs('.tk-pj-s.c', sec), sR = qs('.tk-pj-s.r', sec), link = qs('a.tk-pj-go.c', sec);
    var foc = imgs.map(function(im){ var a = (im.getAttribute('data-f') || '.5,.5').split(','); return [+a[0] || .5, +a[1] || .5]; });
    var cur = 0, dir = 0, p = 1, t0 = 0, raf = 0, queued = 0, i;
    function mod(k){ return ((k % N) + N) % N; }
    var FS = ['precision highp float;', 'uniform vec2 uRes;', 'uniform vec4 uV[4], uC[4];', 'uniform vec3 uP[4];', 'varying vec2 v;'];
    for (i = 0; i < N; i++) FS.push('uniform sampler2D uT' + i + '; uniform vec2 uS' + i + ';');
    FS.push('vec3 tx(float id, vec2 uv){');
    for (i = 0; i < N; i++) FS.push((i ? 'else ' : '') + (i < N - 1 ? 'if (id < ' + (i + .5).toFixed(1) + ') ' : '') + 'return texture2D(uT' + i + ', uv).rgb;');
    FS.push('}', 'vec2 sz(float id){');
    for (i = 0; i < N; i++) FS.push((i ? 'else ' : '') + (i < N - 1 ? 'if (id < ' + (i + .5).toFixed(1) + ') ' : '') + 'return uS' + i + ';');
    FS.push('}', 'void main(){', '  vec2 p = v * uRes; vec3 c = vec3(0.0);',
      '  for (int i = 0; i < 4; i++){',
      '    vec4 cl = uC[i]; vec2 d = p - cl.xy;',
      '    if (cl.z > 0.5 && d.x >= 0.0 && d.y >= 0.0 && d.x <= cl.z && d.y <= cl.w){',
      '      vec4 r = uV[i]; vec2 uv = (p - r.xy) / r.zw, im = sz(uP[i].x);',
      '      float ra = r.z / r.w, ri = im.x / im.y;',
      '      vec2 vis = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);',          /* how much of the picture its frame shows, and which part: about its own point */
      '      c = tx(uP[i].x, clamp(uP[i].yz - vis * 0.5, vec2(0.0), vec2(1.0) - vis) + uv * vis);',
      '    }', '  }', '  gl_FragColor = vec4(c, 1.0);', '}');
    var o = GL2.make(box, FS.join('\n'), imgs, {max: 1600});
    function geo(){
      var rr = row.getBoundingClientRect();
      function R(e){ var b = e.getBoundingClientRect(); return b.width < 2 ? null : [b.left - rr.left, b.top - rr.top, b.width, b.height]; }
      var C = R(sC) || [0, 0, rr.width, rr.height], L = R(sL), Rg = R(sR), gap = 20 * U;
      return {C: C, L: L || [C[0] - C[2] - gap, C[1], C[2], C[3]], R: Rg || [C[0] + C[2] + gap, C[1], C[2], C[3]]};
    }
    function mix4(a, b, e){ return [lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e), lerp(a[3], b[3], e)]; }
    /* the pictures of a moment: [which, the frame it is fitted to, the part of that frame that is seen]. `cur` is already the one that
       will be in hand; `dir` is the way we went (+1 = to the next, the one on the right) */
    function boxes(G, e){
      var L = G.L, C = G.C, R = G.R, B;
      if (!dir || e >= 1) return [[mod(cur - 1), L, L], [cur, C, C], [mod(cur + 1), R, R]];
      if (dir > 0) B = [[mod(cur - 1), mix4(C, L, e), 0], [cur, mix4(R, C, e), 0],
                        [mod(cur - 2), L, [L[0], L[1], L[2] * (1 - e), L[3]]], [mod(cur + 1), R, [R[0] + R[2] * (1 - e), R[1], R[2] * e, R[3]]]];
      else B = [[mod(cur + 1), mix4(C, R, e), 0], [cur, mix4(L, C, e), 0],
                [mod(cur + 2), R, [R[0] + R[2] * e, R[1], R[2] * (1 - e), R[3]]], [mod(cur - 1), L, [L[0], L[1], L[2] * e, L[3]]]];
      B.forEach(function(b){ if (!b[2]) b[2] = b[1]; });
      return B;
    }
    function draw(e){
      var G = geo(), B = boxes(G, e);
      if (o && o.ready){
        var V = new Float32Array(16), K = new Float32Array(16), P = new Float32Array(12);
        B.forEach(function(b, k){ V.set(b[1], k * 4); K.set(b[2], k * 4); P[k * 3] = b[0]; P[k * 3 + 1] = foc[b[0]][0]; P[k * 3 + 2] = foc[b[0]][1]; });
        o.size(); o.gl.uniform4fv(o.u('uV'), V); o.gl.uniform4fv(o.u('uC'), K); o.gl.uniform3fv(o.u('uP'), P); o.draw();
      } else if (!o){                                                       /* no WebGL: the pictures themselves stand in their places, and change places at once */
        box.classList.add('dom');
        imgs.forEach(function(im, k){
          var r = k === cur ? G.C : k === mod(cur + 1) ? G.R : k === mod(cur - 1) ? G.L : null;
          im.classList.toggle('s', !!r);
          if (r){ var st = im.style; st.left = r[0] + 'px'; st.top = r[1] + 'px'; st.width = r[2] + 'px'; st.height = r[3] + 'px'; st.objectPosition = (foc[k][0] * 100) + '% ' + (foc[k][1] * 100) + '%'; }
        });
      }
    }
    function step(now){
      if (!t0) t0 = now;
      p = reduced ? 1 : Math.min(1, (now - t0) / 1150);
      draw(p < .5 ? 16 * p * p * p * p * p : 1 - Math.pow(-2 * p + 2, 5) / 2);
      if (p < 1){ raf = requestAnimationFrame(step); return; }
      raf = 0; dir = 0;
      if (queued){ var d = queued; queued = 0; go(d); }
    }
    function go(d){
      if (p < 1){ queued = d; return; }                                     /* one step at a time; one more is remembered */
      dir = d; cur = mod(cur + d); p = 0; t0 = 0;
      caps.forEach(function(c, k){ c.classList.toggle('on', k === cur); });
      if (link){ link.setAttribute('href', caps[cur].getAttribute('href')); var nm = qs('.nm', caps[cur]); if (nm) link.setAttribute('aria-label', nm.textContent); }
      raf = requestAnimationFrame(step);
    }
    function rest(){ if (p >= 1) draw(1); }
    sec.__still = function(d, e){ dir = d; draw(e); dir = 0; };              /* a moment of a step, held (for stills) */
    qs('.tk-pj-a.prev', sec).addEventListener('click', function(){ go(-1); });
    qs('.tk-pj-a.next', sec).addEventListener('click', function(){ go(1); });
    qsa('.tk-pj-go.l', sec).forEach(function(b){ b.addEventListener('click', function(){ go(-1); }); });
    qsa('.tk-pj-go.r', sec).forEach(function(b){ b.addEventListener('click', function(){ go(1); }); });
    sec.addEventListener('keydown', function(e){ if (e.key === 'ArrowLeft'){ go(-1); e.preventDefault(); } else if (e.key === 'ArrowRight'){ go(1); e.preventDefault(); } });
    var sx = null;                                                          /* the finger: a stroke across the row is a step */
    row.addEventListener('pointerdown', function(e){ sx = e.pointerType === 'mouse' ? null : e.clientX; });
    row.addEventListener('pointerup', function(e){ if (sx == null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); });
    row.addEventListener('pointercancel', function(){ sx = null; });
    if (o) o.onready = rest; else if (document.readyState === 'complete') rest(); else window.addEventListener('load', rest);
    window.addEventListener('resize', function(){ requestAnimationFrame(rest); });
    window.addEventListener('load', rest);
    if ('ResizeObserver' in window) new ResizeObserver(rest).observe(row);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rest);
  })();

  /* ================================================================== the «CI Difference» grid on an inner page (17.11.2026 19:34)
     The home page's block, by its own rules (js/chapters.js, 05 DIFFERENCE): one cell is open as a white card at a time; the pointer or a
     tap opens another; left alone, the block walks on by itself every 5.2 s while it is in view. Its entrance is the home page's as
     well — the one number --t, 0 → 1, on which the rules draw in, the names come into focus, the panel and the open card unroll — only
     here it is not pinned to the scroll: it plays once, when the block has come into view. */
  (function(){
    qsa('.df2[data-df]').forEach(function(sec){
      var st = qs('.df2-body', sec), cells = qsa('.df2-cell', sec); if (!st || !cells.length) return;
      var cur = 0, inView = false, hover = false, timer = null, played = false;
      cells.forEach(function(c, i){ if (c.classList.contains('on')) cur = i; });
      function show(i){ cur = i; cells.forEach(function(c, k){ c.classList.toggle('on', k === i); c.setAttribute('aria-expanded', k === i ? 'true' : 'false'); }); plan(); }
      function plan(){ clearTimeout(timer); if (inView && !hover && !reduced && sec.classList.contains('ready')) timer = setTimeout(function(){ show((cur + 1) % cells.length); }, 5200); }
      cells.forEach(function(c, i){
        c.addEventListener('click', function(){ show(i); });
        c.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse'){ hover = true; if (i !== cur) show(i); else plan(); } });
        c.addEventListener('pointerleave', function(){ hover = false; plan(); });
      });
      function enter(){
        if (played) return; played = true;
        if (reduced){ sec.style.setProperty('--t', 1); sec.classList.add('ready'); plan(); return; }
        var t0 = null;
        (function step(now){ if (t0 === null) t0 = now; var k = Math.min(1, (now - t0) / 1900);
          sec.style.setProperty('--t', (1 - Math.pow(1 - k, 2.2)).toFixed(4));
          if (k < 1) requestAnimationFrame(step); else { sec.classList.add('ready'); plan(); } })(performance.now());
      }
      if ('IntersectionObserver' in window){
        new IntersectionObserver(function(es){ inView = es[0].isIntersecting; if (inView) enter(); plan(); }, {threshold: .32}).observe(st);
      } else { inView = true; enter(); }
    });
  })();

  /* ================================================================== the gallery: «Explore the Work» (16.11, her reference htarchitecte.com/en)
     One screen; the photographs stand along its foot, all of one height, each its own width. The scroll walks the row sideways, one pixel of the
     row to one pixel of the page, and the row follows with a lag — the inertia. The filters rebuild it. */
  var GL = (function(){
    var sec = qs('.glx'); if (!sec) return null;
    var rail = qs('.gl-rail', sec), items = qsa('.gl-it', sec), chips = qsa('[data-gal] .chip', sec),
        FIELD = 50, vis = items.slice(), x = 0, tx = 0, span = 0, mob = false, ready = false;
    function ar(it, w, h){ if (!w || !h) return; qs('.gl-im', it).style.setProperty('--ar', Math.max(.72, Math.min(1.70, w / h)).toFixed(4)); dirty = true; }
    /* the proportions decide the widths, and the pictures stand off the screen: they are fetched once the section is a screen away */
    (function(){
      function load(){ if (ready) return; ready = true;
        items.forEach(function(it){ var img = qs('img', it); if (!img) return; img.loading = 'eager';
          if (img.complete && img.naturalWidth) return ar(it, img.naturalWidth, img.naturalHeight);
          var pre = new Image(); pre.onload = function(){ ar(it, pre.naturalWidth, pre.naturalHeight); }; pre.src = img.src; }); }
      if (!('IntersectionObserver' in window)) return load();
      var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ load(); io.disconnect(); } }, {rootMargin: '120% 0px'});
      io.observe(sec);
    })();
    function layout(){
      mob = !!(mm && mm('(max-aspect-ratio: 1/1)').matches);
      vis = items.filter(function(it){ return !it.hidden; });
      sec.classList.toggle('empty', vis.length === 0);
      if (mob || !vis.length){ sec.style.height = ''; rail.style.transform = ''; return; }
      var last = vis[vis.length - 1], railW = last.offsetLeft + last.offsetWidth + FIELD * U;
      span = Math.max(0, Math.round(railW - W));            /* one pixel of the row to one pixel of the scroll */
      sec.style.height = Math.round(span + H) + 'px';
    }
    function frame(){
      if (mob || !vis.length) return;
      var r = sec.getBoundingClientRect(); if (r.bottom < -200 || r.top > H + 200) return;
      tx = -(span > 0 ? c01(-r.top / span) : 0) * span;
      x += (tx - x) * .14;                                   /* the lag that makes the glide */
      if (Math.abs(tx - x) < .3) x = tx;
      rail.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    }
    chips.forEach(function(c){ c.addEventListener('click', function(){
      if (c.disabled) return;
      chips.forEach(function(o){ o.classList.toggle('on', o === c); });
      var fv = c.getAttribute('data-f');
      items.forEach(function(it){ var ok = fv === 'all' || (' ' + it.getAttribute('data-tags') + ' ').indexOf(' ' + fv + ' ') >= 0; it.hidden = !ok; });
      layout(); x = tx = 0; rail.style.transform = 'translate3d(0,0,0)';
      var t0 = sec.getBoundingClientRect().top + window.scrollY; if (window.scrollY > t0) smoothTo(t0 + 2);
    }); });
    window.addEventListener('keydown', function(e){
      if (mob || !vis.length || span <= 0) return; var r = sec.getBoundingClientRect(); if (r.top > 4 || r.bottom < H - 4) return;
      if (e.key === 'ArrowRight'){ e.preventDefault(); smoothTo(window.scrollY + Math.min(640, span)); }
      else if (e.key === 'ArrowLeft'){ e.preventDefault(); smoothTo(window.scrollY - Math.min(640, span)); }
    });
    return {layout: layout, frame: frame};
  })();

  /* ================================================================== the loop */
  var lastY = -1, lastVH = 0;
  function tick(now){
    smoothStep();
    if (dirty) layout();
    var y = window.scrollY, t = now / 1000, i, k;
    for (i = 0; i < FILMS.length; i++){
      var f = FILMS[i], r = f.el.getBoundingClientRect(), vis = r.bottom > -40 && r.top < H + 40, q = -r.top / (SP * H);
      if (f.cur){ q = y / (SP * H); vis = q < 2.2; }
      if (!vis){ if (f.on !== false){ f.on = false; } continue; }
      f.on = true; f.q = q;
      for (k = 0; k < f.ms.length; k++) runMoment(f.ms[k], q);
      g = f.g; g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); g.lineCap = 'butt'; g.lineJoin = 'round'; g.setLineDash([]);
      FIG[f.fig](f, q, t);
    }
    /* photographs open out of a line as they come up the screen */
    for (i = 0; i < BANDS.length; i++){
      var b = BANDS[i], br = b.el.getBoundingClientRect(); if (br.bottom < -40 || br.top > H + 40) continue;
      b.img.style.transform = 'translate3d(0,' + ((br.top / H) * -4).toFixed(2) + '%,0)';
    }
    if (GL) GL.frame();
    if (y !== lastY || H !== lastVH) updateChap(y, H);
    chapInk(); hdrInk(); updateLogo(y, H);
    lastY = y; lastVH = H;
    requestAnimationFrame(tick);
  }
  window.__inr = {films: function(){ return FILMS.map(function(f){ return {id: f.el.id, fig: f.fig, len: f.len, top: f.el.getBoundingClientRect().top + window.scrollY}; }); }, SP: SP,
                  y: function(id, q){ var e = $(id); var top = e.getBoundingClientRect().top + window.scrollY; return e.classList.contains('film') ? top + q * SP * window.innerHeight : top + q * window.innerHeight; }};
  requestAnimationFrame(tick);
})();
