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
    chap.classList.toggle('show', y > vh * .6 && ftop > vh * .92);
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
      var y = t.getBoundingClientRect().top + window.scrollY; if (t.classList.contains('film') && t.getAttribute('data-fig') !== 'cover') y += .7 * SP * H; smoothTo(y); });
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
  /* CI Turnkey's cover: the residence retreats below one hairline, and that line goes on to run the page — above it the client's life,
     below it the whole of the work. The canvas draws the line from the middle outward, arriving with the photograph's top edge. */
  function horiz(f, q, t){
    var i;
    for (i = 0; i < f.sc.length; i++) runScrub(f.sc[i], q);
    var a = sg(q, .12, .62), w = eio(c01((q - .12) / .78));
    if (a <= .002 || w <= 0) return;
    var y = Math.round(H * .56) + .5, cx = W / 2, hw = (W / 2 - 50 * U) * w;
    ink(a * .62, 1); seg(cx - hw, y, cx + hw, y);
    sq(cx - hw, y, a * .9); sq(cx + hw, y, a * .9);
  }
  var FIG = {cover: cover, steps: steps, scene: scene, key: key, many: many, wall: wall, horiz: horiz};

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
    chapInk(); updateLogo(y, H);
    lastY = y; lastVH = H;
    requestAnimationFrame(tick);
  }
  window.__inr = {films: function(){ return FILMS.map(function(f){ return {id: f.el.id, fig: f.fig, len: f.len, top: f.el.getBoundingClientRect().top + window.scrollY}; }); }, SP: SP,
                  y: function(id, q){ var e = $(id); var top = e.getBoundingClientRect().top + window.scrollY; return e.classList.contains('film') ? top + q * SP * window.innerHeight : top + q * window.innerHeight; }};
  requestAnimationFrame(tick);
})();
