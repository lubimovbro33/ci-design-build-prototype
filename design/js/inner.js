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
     17:07, frame `603:742`: the name and the title in the middle of a black screen, the site's line near them; the scroll makes the line
     draw the picture, and the picture becomes the photograph. 17:12: the words stand on black only. 17:33: «щоб лінія починалася від
     центру екрану, трошки нижче заголовка, і йшла вниз… можливо, щоб вона була така закручена, як у нас на головній. Ідея — це завжди
     щось хаотичне, а потім ми вже це структуруємо в якийсь результат». 17:35: the sketch into the photograph by something better than light.
     So the cover is four states of one line:
       the idea      a tangle, turning, just under the title — the home page's own knot, a real one, its strand breaking where it passes
                     behind itself — with the line leaving it straight down to the foot of the screen;
       the line      the scroll follows the line down: the words leave upward as on any page, the tangle pays out and is a straight line;
       the sketch    the line parts in two, to the left and to the right, and the client's room is drawn between them — its own lines,
                     the ink brightest where a line has just been;
       the home      the drawing is filled in with the photograph one thing at a time, from the ground up — the bed, the pillows, the
                     folds of the curtains, the city, the sky (GLSH.room, tools/site/cells.py) — and its lines are given up cell by cell.
     Chaos, a line, a structure, a result: «From First Idea to First Night Home». */
  var KNOT = (function(){ var N = 320, K = [], i; for (i = 0; i < N; i++){ var a = i / N * Math.PI * 2, r = 2 + .9 * Math.cos(5 * a);
    K.push([r * Math.cos(2 * a), r * Math.sin(2 * a), -.9 * Math.sin(5 * a)]); } K.push(K[0]); return K; })();
  function unfold(f, q, t){
    if (f.glo === undefined){
      var box = qs('.tk-cv-ph', f.el);
      f.glo = box ? GL2.make(box, glCoverFS(GLSH.room, .93), qsa('img', box)) : null;
      f.tx = qs('.tk-cv-t', f.el);
    }
    var o = f.glo, i, k;
    function room(l, x1, x2, fr){
      if (!o || !o.ready) return;
      o.size(); o.set2('uC', .5, .5); o.set2('uH', .5, .5); o.set2('uB', x1, x2); o.set1('uF', fr); o.set1('uQ', l); o.set1('uTime', (t * 60) | 0); o.draw();
    }
    if (H >= W){ room(1, 2, 2, 0); return; }                                /* phones: the words, the line, then the room — in the flow (css) */
    /* the tangle and its line come once, when the screen is first seen: a second and a half, by the clock */
    f.dp = Math.max(Math.min(1, (f.dp || 0) + Math.min(.05, Math.max(0, t - (f.tl || t)) / 1.5)), sg(q, 0, .06)); f.tl = t;
    var dp = f.dp, sh = Math.min(H * 1.3, q * SP * H * 1.5);                /* the page seems to scroll on: the words and the tangle leave upward */
    if (f.tx){
      var vis = sh < H * .72 ? 1 : 0, tf = 'translate3d(0,' + (-sh).toFixed(1) + 'px,0)';
      if (f.tx.__t !== tf){ f.tx.__t = tf; f.tx.style.transform = tf; }
      if (f.tx.__v !== vis){ f.tx.__v = vis; f.tx.style.visibility = vis ? 'visible' : 'hidden'; }
    }
    var KR = 27 * U, KX = W / 2, KY = MID + 232 * U - sh, yA = MID + 150 * U - sh, yB = KY + 84 * U;   /* the tangle: about 160 across, 44 under the title */
    var e = sm(0, 1, sg(q, .07, .42)), e2 = e * e * (3 - 2 * e);
    var sp = eio(sg(q, .56, 1.22)), dist = sp * (W / 2 + 10), xL = W / 2 - dist, xR = W / 2 + dist, lp = sg(q, 1.28, 2.0);
    room(lp, sp > 0 ? xL / W : 2, sp > 0 ? xR / W : 2, 1 - sg(sp, .9, 1));
    g.lineCap = 'butt'; g.lineJoin = 'round';
    if (sp <= 0){
      /* the line: out of the middle of the tangle, straight down */
      var ka = sm(0, 1, sg(dp, 0, .45)), y1 = lerp(KY, yB, e2), y2 = lerp(y1, H + 10, eo(sg(dp, .25, 1)));
      ink(1, LW); seg(KX, y1, KX, y2);
      /* the tangle: one strand, turning; where it passes behind itself it breaks. The scroll pays it out into the line */
      if (e2 < 1 || yA > -4){
        var N = KNOT.length - 1, ay = t * .38 + q * 5.2, ax = 1.0 + .25 * Math.sin(t * .21 + q * 2), ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax), F = 7.5, S = [];
        for (i = 0; i <= N; i++){ var p = KNOT[i], x = p[0] * ca + p[2] * sa, z = -p[0] * sa + p[2] * ca, y = p[1] * cb - z * sb; z = p[1] * sb + z * cb;
          var fp = F / (F - z), u = i / N, kx = KX + x * KR * fp, ky = KY - y * KR * fp;
          S.push([kx + (KX - kx) * e2, ky + (yA + u * (yB - yA) - ky) * e2, z * (1 - e2)]); }
        var CH = 4, runs = [];
        for (i = 0; i < N; i += CH) runs.push([i, (S[i][2] + S[Math.min(N, i + CH)][2]) / 2]);
        if (e2 < 1) runs.sort(function(a, b){ return a[1] - b[1]; });
        g.globalAlpha = ka;
        for (var j = 0; j < runs.length; j++){ var j0 = runs[j][0], j1 = Math.min(N, j0 + CH), jb = Math.max(0, j0 - 1);
          if (e2 < .98){ g.strokeStyle = '#000000'; g.lineWidth = LW + 7 * U * (1 - e2); g.setLineDash([]); g.beginPath(); g.moveTo(S[j0][0], S[j0][1]); for (k = j0 + 1; k <= j1; k++) g.lineTo(S[k][0], S[k][1]); g.stroke(); }
          g.strokeStyle = '#FFFFFF'; g.lineWidth = LW; g.beginPath(); g.moveTo(S[jb][0], S[jb][1]); for (k = jb + 1; k <= j1; k++) g.lineTo(S[k][0], S[k][1]); g.stroke(); }
        g.globalAlpha = 1;
      }
    } else {
      /* the line, parted: the sketch stands between its two halves */
      var la = 1 - sg(sp, .97, 1);
      if (la > .004){ ink(la, LW); seg(xL, -10, xL, H + 10); seg(xR, -10, xR, H + 10); }
    }
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
  var PCAM = [[500, 358, 1], [290, 190, 1.6], [365, 452, 1.5], [500, 167, 1]];   /* what the camera looks at, and how closely; the last keeps the house clear of the long heading */
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
    /* the drawing lives in the right half of the frame; the camera looks at the house through that box */
    var P = PLN, BX0 = 985, BX1 = 1870, BY0 = 150, BY1 = 990, S = (BX1 - BX0) * .88 / P.W * cs, bx = (BX0 + BX1) / 2, by = (BY0 + BY1) / 2;
    function X(x){ return xr(bx + (x - cx) * S); }
    function Y(y){ return ry(by + (y - cy) * S); }
    function L(xa, ya, xb, yb){ g.beginPath(); g.moveTo(X(xa), Y(ya)); g.lineTo(X(xb), Y(yb)); g.stroke(); }
    var UN = X(1) - X(0), x0 = xr(BX0), x1 = xr(BX1), y0 = ry(BY0), y1 = ry(BY1);
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
  var FIG = {cover: cover, steps: steps, plan: plan, unfold: unfold, scene: scene, key: key, many: many, wall: wall, horiz: horiz, drawn: drawn, glcv: glcv};

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
    function tex(gl, img){
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      return t;
    }
    /* make(box, fragment source, the <img> elements of the block) → {set(name, …), draw(), live(bool)} or null if there is no context */
    function make(box, FS, imgs){
      var cv = document.createElement('canvas'); cv.className = 'glc'; cv.setAttribute('aria-hidden', 'true');
      var gl = cv.getContext('webgl', {alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance'});
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
        gl: gl, cv: cv, ready: false, w: 0, h: 0,
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
          ts[i] = tex(gl, im);
          gl.uniform1i(u('uT' + i), i);
          gl.uniform2f(u('uS' + i), im.naturalWidth, im.naturalHeight);
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
    /* CI Turnkey: the room, as a drawing of itself and then as itself. The drawing (uT1, the room's own lines) exists only between the two
       lines that have parted (uB, their places across the screen) and its ink is brightest where a line has just been (uF). The photograph
       (uT0) is not faded in: uT2 gives every thing in the picture — a panel, a pane, a fold, a pillow, a building — its own moment, and the
       drawing is filled in with the photograph one such cell at a time, its lines given up cell by cell (tools/site/cells.py) */
    room: [
      'vec2 r = (v - uC) / (2.0 * uH) + 0.5;',
      'float ins = step(0.0, r.x) * step(r.x, 1.0) * step(0.0, r.y) * step(r.y, 1.0);',
      'vec2 iu = cov(r, uS0);',
      'vec3 ph = grade(texture2D(uT0, iu).rgb);',
      'float ln = smoothstep(0.22, 0.92, texture2D(uT1, cov(r, uS1)).r);',   /* the core of each line, without its halo: a finer pen */
      'float T = mix(texture2D(uT2, cov(r, uS2)).r, 1.0 - iu.y, 0.3);',     /* the thing's own moment, and each point's own height in it */
      'float p = uQ * 1.2 - 0.1;',
      'float m = smoothstep(T - 0.012, T + 0.06, p);',
      'float held = smoothstep(T + 0.03, T + 0.15, p);',
      'float band = step(uB.x, v.x) * step(v.x, uB.y);',
      'float fr = 1.0 + uF * 0.42 * (exp(-(v.x - uB.x) * 9.0) + exp(-(uB.y - v.x) * 9.0));',
      'vec3 c = (ph * m * mix(0.86, 1.0, smoothstep(0.55, 1.0, uQ)) + vec3(ln) * 0.6 * fr * band * (1.0 - held)) * ins;'].join('\n'),
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

  /* ================================================================== CI Core's seam, in a shader
     One room, drawn on one side of a line and built on the other. The seam is not a cut any more: the light bends as it crosses it, the
     drawing's own lines light up where it passes them, and the whole picture carries our grain. The line follows the pointer with the
     gallery's lag, so moving it feels like drawing rather than dragging a control. */
  (function(){
    var gs = qsa('[data-seam]'); if (!gs.length) return;
    var FS = [
      'precision highp float;',
      'uniform sampler2D uT0, uT1;',            /* 0 the drawing, 1 the room */
      'uniform vec2 uRes, uS0, uS1;',
      'uniform float uX, uTime, uIn;',
      'varying vec2 v;',
      'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
      'vec2 cov(vec2 uv, vec2 img){',
      '  float ra = uRes.x / uRes.y, ri = img.x / img.y;',
      '  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);',
      '  return (uv - 0.5) * s + 0.5;',   /* cover: the picture fills the box and is cropped, never squeezed in with its edge smeared */
      '}',
      'void main(){',
      '  float d = v.x - uX;',
      '  float w = 0.9 / uRes.x * 26.0;',                       /* the edge is about 26 px of the block, whatever its width */
      '  float e = exp(-abs(d) / w);',
      '  vec2 uv = v + vec2(e * 0.0045 * sign(d) * uIn, 0.0);',  /* the light bends at the edge of the glass */
      '  vec3 a = texture2D(uT0, cov(uv, uS0)).rgb;',
      '  vec3 b = texture2D(uT1, cov(uv, uS1)).rgb;',
      '  b = (b - 0.5) * 1.06 + 0.5; b *= 0.84;',                 /* the room, graded as the rest of the site grades its pictures */
      '  float m = smoothstep(-w, w, d);',
      '  vec3 c = mix(a, b, m);',
      '  c += a * e * 0.55 * uIn;',                               /* the drawing lights up where the seam passes it */
      '  c += (hash(v * uRes + uTime) - 0.5) * 0.022;',           /* our grain */
      '  gl_FragColor = vec4(c, 1.0);',
      '}'].join('\n');
    gs.forEach(function(g){
      var dr = qs('.co-sm-dr', g), im = qs('.co-sm-im', g);
      var x = .5, tx = .5, run = 0, live = 0, lv = 0, t = 0;
      var o = GL2.make(g, FS, [dr, im]);
      function put(){ g.style.setProperty('--x', (x * 100).toFixed(2) + '%'); }          /* the hairline and its square are DOM, and stay crisp */
      function tick(){
        x += (tx - x) * .16; lv += (live - lv) * .12; t += 1.0;
        put();
        if (o && o.ready){ o.size(); o.set1('uX', x); o.set1('uTime', t); o.set1('uIn', lv); o.draw(); }
        if (Math.abs(tx - x) > .0004 || live || lv > .01) requestAnimationFrame(tick); else run = 0;
      }
      function kick(){ if (!run){ run = 1; requestAnimationFrame(tick); } }
      function at(e){
        var r = g.getBoundingClientRect();
        tx = Math.max(.02, Math.min(.98, (e.clientX - r.left) / r.width));
        kick();
      }
      if (o) o.onready = function(){ o.set1('uX', x); o.set1('uIn', 0); o.set1('uTime', 0); o.draw(); };
      g.addEventListener('pointerenter', function(e){ live = 1; at(e); });
      g.addEventListener('pointermove', at);
      g.addEventListener('pointerleave', function(){ live = 0; tx = .5; kick(); });
      g.addEventListener('pointerdown', function(e){ at(e); if (g.setPointerCapture) g.setPointerCapture(e.pointerId); });
      window.addEventListener('resize', function(){ if (o && o.ready){ o.size(); o.set1('uX', x); o.draw(); } });
      put();
    });
  })();

  /* ================================================================== CI Turnkey's four counts: the instrument of the page
     The rows are read first and opened second: the pointer (or the keyboard) on a count brings what it is made of into the one reading line
     under them, so the page's lists live inside its numbers. The rows never move — only the line under them changes. */
  (function(){
    qsa('[data-math]').forEach(function(g){
      var rows = qsa('.tk-m-r', g), ds = qsa('.tk-m-d', g), cur = 0;
      if (!rows.length) return;
      /* ---------------------------------------------------------------- the figure: the many, gathering (17.11.2026 15:15)
         «Це ж можна якось цікаво візуалізувати, якоюсь цікавою інфографікою.» Each count is drawn, and every one of them is drawn as the
         same event: what a project is made of enters on the left, narrows to a single point, and leaves as one line towards the word ONE.
         Only the grain differs — nine lines, a few hundred dots, a thousand specks, eight stages laid end to end — so the four read as one
         argument: whatever the quantity, the client receives one of it. The count in hand flows; the other three rest. */
      var cv = document.createElement('canvas'); cv.className = 'tk-m-cv'; cv.setAttribute('aria-hidden', 'true');
      g.insertBefore(cv, g.firstChild); g.classList.add('cv-on');
      var x2 = cv.getContext('2d'), cw = 0, chh = 0, dpr = 1, SETS = [], ri;
      function rnd(s){ var x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
      for (ri = 0; ri < 4; ri++){
        var n = [9, 260, 1150, 8][ri], it = [], k;
        for (k = 0; k < n; k++){
          var u = n === 1 ? .5 : k / (n - 1);
          it.push({y: ri === 1 || ri === 2 ? (rnd(ri * 31 + k) * 2 - 1) : (u * 2 - 1),
                   p: rnd(ri * 97 + k * 3 + 7), v: .42 + rnd(ri * 53 + k * 5 + 13) * .7,
                   w: .55 + rnd(ri * 17 + k * 11 + 3) * .45});
        }
        SETS.push(it);
      }
      function qd(ax, ay, bx, by, cx_, cy_, u){ var m = 1 - u;
        return [m * m * ax + 2 * m * u * bx + u * u * cx_, m * m * ay + 2 * m * u * by + u * u * cy_]; }
      function size(){
        var r = g.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
        if (Math.abs(r.width - cw) < .5 && Math.abs(r.height - chh) < .5) return;
        cw = r.width; chh = r.height; cv.width = Math.round(cw * dpr); cv.height = Math.round(chh * dpr);
      }
      function draw(t){
        var gr = g.getBoundingClientRect(), k, i;
        x2.setTransform(dpr, 0, 0, dpr, 0, 0); x2.clearRect(0, 0, cw, chh);
        x2.lineCap = 'butt'; x2.lineJoin = 'round';
        for (i = 0; i < rows.length && i < 4; i++){
          var rr = rows[i].getBoundingClientRect(), ir = qs('i', rows[i]).getBoundingClientRect();
          if (ir.width < 40) continue;                /* the figure belongs to the wide screen; the phone reads the counts alone */
          var x0 = ir.left - gr.left, x1 = ir.right - gr.left, cy = (rr.top + rr.bottom) / 2 - gr.top;
          var hh = Math.min(rr.height * .46, 86 * U), wx = x0 + (x1 - x0) * .70, bx = x0 + (x1 - x0) * .40;
          var on = i === cur, al = on ? 1 : .42, ph = on ? t * .09 : .34, set = SETS[i], pt;
          if (i === 0){                                   /* nine disciplines: nine lines, bending into one */
            for (k = 0; k < set.length; k++){
              var y = cy + set[k].y * hh;
              x2.strokeStyle = 'rgba(255,255,255,' + (al * .42).toFixed(3) + ')'; x2.lineWidth = LW;
              x2.beginPath(); x2.moveTo(x0, y); x2.quadraticCurveTo(bx, y, wx, cy); x2.stroke();
              if (on){                                    /* and one mark travelling down each of them */
                var u0 = (ph * set[k].v + set[k].p) % 1;
                pt = qd(x0, y, bx, y, wx, cy, u0);
                sq2(pt[0], pt[1], .22 + .62 * u0, 4 * U);
              }
            }
          } else if (i === 3){                            /* eight stages: laid end to end, closing into one journey */
            var gap = 7 * U, seg = (wx - x0) / 8;
            for (k = 0; k < 8; k++){
              var sx = x0 + k * seg, gg = gap * (1 - k / 9);
              x2.strokeStyle = 'rgba(255,255,255,' + (al * (.34 + .075 * k)).toFixed(3) + ')'; x2.lineWidth = LW;
              x2.beginPath(); x2.moveTo(sx, cy); x2.lineTo(sx + seg - gg, cy); x2.stroke();
              x2.strokeStyle = 'rgba(255,255,255,' + (al * .42).toFixed(3) + ')';
              x2.beginPath(); x2.moveTo(sx, cy - 11 * U); x2.lineTo(sx, cy + 11 * U); x2.stroke();
            }
            if (on){ var uj = (t * .13) % 1; sq2(x0 + (wx - x0) * uj, cy, .3 + .6 * uj, 5 * U); }
          } else {                                        /* hundreds of people, thousands of decisions: a field, drawn in */
            var sz = i === 1 ? 2.4 : 1.6;
            for (k = 0; k < set.length; k++){
              var it2 = set[k], uu = (ph * it2.v + it2.p) % 1, yy = cy + it2.y * hh * (i === 1 ? 1 : .92);
              pt = qd(x0, yy, bx, yy, wx, cy, Math.pow(uu, 1.7));
              sq2(pt[0], pt[1], al * (i === 1 ? .13 + .42 * uu : .09 + .3 * uu) * it2.w, sz * U);
            }
          }
          /* the one point everything arrives at, and the line that leaves it */
          x2.strokeStyle = 'rgba(255,255,255,' + (al * .55).toFixed(3) + ')'; x2.lineWidth = LW;
          x2.beginPath(); x2.moveTo(wx, cy); x2.lineTo(x1, cy); x2.stroke();
          sq2(wx, cy, al * (on ? .95 : .5), 7 * U);
        }
      }
      function sq2(x, y, a, s){ if (a <= .004) return;
        x2.fillStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')';
        x2.fillRect(x - s / 2, y - s / 2, s, s); }
      function loop(now){
        var r = g.getBoundingClientRect();
        if (r.bottom > -80 && r.top < H + 80){ size(); draw(now / 1000); }
        requestAnimationFrame(loop);
      }
      requestAnimationFrame(loop);
      function set(i){
        if (i === cur) return; cur = i;
        rows.forEach(function(r, k){ r.classList.toggle('on', k === i); });
        ds.forEach(function(d, k){ d.classList.toggle('on', k === i); });
      }
      rows.forEach(function(r, i){
        r.addEventListener('pointerenter', function(){ set(i); });
        r.addEventListener('focus', function(){ set(i); });
        r.addEventListener('click', function(){ set(i); });
      });
      rows[0].classList.add('on'); g.setAttribute('data-on', '1');
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
