/* CI · About (14.11.2026) — "one line". Vanilla, no deps.
   The page is one film on one pinned stage. A single white line (the canvas) runs through all ten scenes — "from the first conversation
   to the finished home" — and becomes each idea in turn: a voice, a knot drawn straight, a full circle, a seam between the drawing and the
   finished room, the plan of a life, one roof, a line a fifth shorter, seven floors, a door. Everything is scrubbed by the scroll.
   Times are in "screens" from each scene's start (data-len on .sc, data-k="in0 in1 out0 out1" on every text moment).
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
    qsa('.sc p.t34, .sc p.t20, .tc-b p').forEach(function(n){
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

  /* ================================================================== the stage */
  var main = $('ab3'), stg = $('st'), cv = $('ln'), g = cv.getContext('2d');
  var W = 0, H = 0, U = 1, DPR = 1, MID = 0, SQ = 8, FOOT = 58, SP = .8, mainTop = 0;
  var SC = qsa('.sc', stg).map(function(e){ return {el: e, id: e.getAttribute('data-id'), len: +e.getAttribute('data-len'), start: 0, ms: qsa('.m', e).map(Moment), on: null}; });
  var BY = {}; SC.forEach(function(c){ BY[c.id] = c; });
  function xl(X){ return X * U; }                      /* hung from the left field */
  function xr(X){ return W - (1920 - X) * U; }         /* hung from the right field */
  function xm(X){ return W / 2 + (X - 960) * U; }      /* hung from the middle */
  function yt(Y){ return Y * U; }
  function yb(Y){ return H - (1080 - Y) * U; }
  function ym(Y){ return H / 2 + (Y - 540) * U; }
  var dirty = true;
  function layout(){
    W = window.innerWidth; H = window.innerHeight; U = W >= H ? Math.min(W / 1920, H / 1080) : W / 1920; if (W < H) U = Math.max(U, W / 900);
    DPR = Math.min(2, window.devicePixelRatio || 1); MID = Math.round(H / 2) + .5; SQ = Math.max(5, 8 * U); FOOT = Math.max(50 * U, 58);
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    var s = 0; SC.forEach(function(c){ c.start = s; s += c.len; var mk = $(c.id); if (mk) mk.style.top = Math.round(c.start * SP * H) + 'px'; });
    var ct = $('a-contact'); if (ct) ct.style.top = Math.round((BY['a-cta'].start + 2.3) * SP * H) + 'px';
    main.style.height = Math.round(s * SP * H + H) + 'px';
    mainTop = main.getBoundingClientRect().top + window.scrollY;
    ringLayout(); tmW = 0; dirty = false;
    var cs = qsa('#ftCity'); cs.forEach(function(v){ var mtx = v.getScreenCTM && v.getScreenCTM(); if (mtx && mtx.a) v.style.setProperty('--ds', Math.max(mtx.a, .05).toFixed(4)); });
  }
  window.addEventListener('resize', function(){ dirty = true; });
  window.addEventListener('load', function(){ dirty = true; });

  /* anchors: a chapter opens a little into its scene, where its title already stands */
  qsa('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){ var id = a.getAttribute('href').slice(1); if (!id){ e.preventDefault(); return; } var t = $(id); if (!t) return; e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY; if (BY[id] && id !== 'a-top') y += .75 * SP * H; smoothTo(y); });
  });

  /* small helpers for things the script places */
  function vis(e, a){ a = a <= .001 ? 0 : a >= .999 ? 1 : Math.round(a * 1000) / 1000; if (e.__a === a) return; e.__a = a; e.style.visibility = a > 0 ? 'visible' : 'hidden'; e.style.opacity = a; }
  function at(e, x, y){ var k = x.toFixed(1) + ',' + y.toFixed(1); if (e.__p === k) return; e.__p = k; e.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)'; }
  function box(e, x, y, w, h){ var k = x.toFixed(1) + ',' + y.toFixed(1) + ',' + w.toFixed(1) + ',' + h.toFixed(1); if (e.__b === k) return; e.__b = k; var s = e.style; s.left = x.toFixed(1) + 'px'; s.top = y.toFixed(1) + 'px'; s.width = w.toFixed(1) + 'px'; s.height = h.toFixed(1) + 'px'; }
  function clip(e, v){ if (e.__c === v) return; e.__c = v; e.style.clipPath = v; e.style.webkitClipPath = v; }
  /* a photograph: the outer box is its window, the inner box is where the whole picture would stand on the screen */
  function coverRect(rx, ry, rw, rh, ar, fx, fy){ var iw = Math.max(rw, rh * ar), ih = iw / ar, x = rx + rw / 2 - fx * iw, y = ry + rh / 2 - fy * ih;
    x = Math.min(rx, Math.max(rx + rw - iw, x)); y = Math.min(ry, Math.max(ry + rh - ih, y)); return [x, y, iw, ih]; }
  function lerpR(a, b, t){ return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), lerp(a[3], b[3], t)]; }
  function pic(p, r, im){ box(p, r[0], r[1], r[2], r[3]); var i = p.firstElementChild; if (im && i) box(i, im[0] - r[0], im[1] - r[1], im[2], im[3]); }

  /* the canvas pen */
  var LW = 1.5;
  function ink(a, lw, dash){ g.strokeStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.lineWidth = lw || LW; g.setLineDash(dash || []); }
  function poly(p, close){ g.beginPath(); g.moveTo(p[0], p[1]); for (var i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); if (close) g.closePath(); g.stroke(); }
  function seg(x1, y1, x2, y2){ g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  function sq(x, y, a, s){ if (a <= 0) return; s = s || SQ; g.fillStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s)); }
  function flat(a, x0, x1){ if (a <= 0) return; ink(a); seg(x0 == null ? -10 : x0, MID, x1 == null ? W + 10 : x1, MID); }

  /* ================================================================== 01 COVER — the photograph closes into one line */
  var phC = $('phCover'), cvH = $('cvH');
  function cover(q, t, act){
    if (q > 1.2 || q < -1){ vis(phC, 0); } else {
      var k = eio(sg(q, .1, 1.0));
      if (k >= 1) vis(phC, 0); else { vis(phC, 1); clip(phC, 'inset(' + (k * 50).toFixed(3) + '% 0)'); }
    }
    var o = q < -1 ? 0 : 1 - eo(sg(q, .08, .5));
    if (cvH.__o !== o){ cvH.__o = o; cvH.style.opacity = o.toFixed(3); cvH.style.visibility = o > 0 ? 'visible' : 'hidden';
      cvH.style.transform = o < 1 ? 'translateY(' + (-(1 - o) * 26 * U).toFixed(1) + 'px)' : ''; cvH.style.filter = o < 1 ? 'blur(' + ((1 - o) * 10).toFixed(1) + 'px)' : ''; }
    if (act) flat(sg(q, .82, 1.0));
  }

  /* ================================================================== 02 OUR STORY — a voice; what was heard most clearly stays as five peaks */
  var svL = qsa('#svL .sv');
  function story(q, t, act){
    var A = eio(sg(q, .1, .75)) * (1 - .55 * eio(sg(q, 1.5, 2.2))) * (1 - eio(sg(q, 2.6, 3.05)));
    var x0 = xl(421), x1 = xr(1581), B = [], i;
    for (i = 0; i < 5; i++){
      B[i] = eio(sg(q, 2.78 + i * .06, 3.2 + i * .06)) * (1 - eio(sg(q, 3.85, 4.2)));
      vis(svL[i], sg(B[i], .6, 1)); at(svL[i], lerp(x0, x1, i / 4) - SQ / 2, MID - 72 * U * B[i] - 25 * U);
    }
    if (!act) return;
    var N = 520, p = [], e0 = xl(160), e1 = xr(1760);
    for (var j = 0; j <= N; j++){
      var x = -10 + (W + 20) * j / N, y = MID;
      if (A > 0){
        var e = c01((x - e0) / (e1 - e0)), env = Math.pow(Math.sin(Math.PI * e), 1.2), xu = x / U, md = (.5 + .5 * Math.sin(xu / 330 - t * .45)) * (.62 + .38 * Math.sin(xu / 137 + t * .8 + 1.7));
        y += A * env * md * U * (150 * Math.sin(xu / 92 + t * 1.05) + 74 * Math.sin(xu / 41 - t * 1.6 + 1.3) + 34 * Math.sin(xu / 19 + t * 2.3 + .4));
      }
      for (i = 0; i < 5; i++) if (B[i] > 0){ var d = (x - lerp(x0, x1, i / 4)) / (30 * U); if (d > -4 && d < 4) y -= 72 * U * B[i] * Math.exp(-d * d); }
      p.push(x, y);
    }
    ink(1); poly(p);
    for (i = 0; i < 5; i++) sq(lerp(x0, x1, i / 4), MID - 72 * U * B[i], sg(B[i], .5, .9));
  }

  /* ================================================================== 03 WHY CI — the line tangles into a knot of moving parts, and is drawn straight again */
  var KX = new Float32Array(641), KY = new Float32Array(641), KZ = new Float32Array(641);
  function why(q, t, act){
    if (!act) return;
    var a = eio(sg(q, .05, 1.0)) * (1 - eio(sg(q, 1.65, 2.35))), i;
    if (a < .003) flat(1);
    else {
      var N = 640, R = 212 * U, ry = .5 * Math.sin(t * .21) + .25, cyr = Math.cos(ry), syr = Math.sin(ry), rx = .3 + .16 * Math.sin(t * .17 + 1), cxr = Math.cos(rx), sxr = Math.sin(rx), cx = W / 2, cy = MID - 24 * U, TA = (-1.5708 - .7) / 3, TL = 6.2832 + 1.0472;
      for (i = 0; i <= N; i++){
        var s = i / N, bx = -10 + (W + 20) * s, w = sm(.1, .2, s) * (1 - sm(.8, .9, s)) * a;
        if (w <= 0){ KX[i] = bx; KY[i] = MID; KZ[i] = 0; continue; }
        var tau = TA + c01((s - .1) / .8) * TL;
        var kx = 1.25 * Math.sin(3 * tau + .7), ky = .92 * Math.sin(4 * tau + .2), kz = Math.sin(7 * tau + 1.9);
        var x1 = kx * cyr + kz * syr, z1 = -kx * syr + kz * cyr, y1 = ky * cxr - z1 * sxr, z2 = ky * sxr + z1 * cxr, pf = 1 + z2 * .16;
        KX[i] = bx + (cx + R * x1 * pf - bx) * w; KY[i] = MID + (cy + R * y1 * pf - MID) * w; KZ[i] = z2 * w;
      }
      /* far strands first; each run clears a gap under itself, so a strand passing in front breaks the one behind */
      var CH = 4, runs = [];
      for (i = 0; i < N; i += CH) runs.push([i, (KZ[i] + KZ[Math.min(N, i + CH)]) / 2]);
      runs.sort(function(p, r){ return p[1] - r[1]; });
      g.lineCap = 'butt'; g.lineJoin = 'round';
      for (var r = 0; r < runs.length; r++){
        var j0 = runs[r][0], j1 = Math.min(N, j0 + CH), k;
        if (Math.abs(runs[r][1]) > .02){ g.strokeStyle = '#000'; g.lineWidth = 9; g.setLineDash([]); g.beginPath(); g.moveTo(KX[j0], KY[j0]); for (k = j0 + 1; k <= j1; k++) g.lineTo(KX[k], KY[k]); g.stroke(); }
        ink(1, LW); g.beginPath(); var jb = Math.max(0, j0 - 1); g.moveTo(KX[jb], KY[jb]); for (k = jb + 1; k <= j1; k++) g.lineTo(KX[k], KY[k]); g.stroke();
      }
    }
    /* one central team guides the entire journey: the square travels the line */
    var h = sg(q, 3.0, 3.25) * (1 - sg(q, 3.85, 4.0));
    if (h > 0) sq(lerp(xl(421), xr(1870), eio(sg(q, 3.1, 3.9))), MID, h);
    /* the decisions that are yours: three marks; everything between them is ours */
    var dx = [xl(421), xm(960), xr(1500)];
    for (i = 0; i < 3; i++){ var d = eo(sg(q, 4.1 + i * .1, 4.3 + i * .1)) * (1 - sg(q, 4.75, 4.9)); if (d > 0) sq(dx[i], MID, d, SQ * (.4 + .6 * d)); }
  }

  /* ================================================================== 04 THE CI MODEL — the line closes into a full circle; every pair speaks through one centre */
  var rgL = qsa('#rgL .rg'), RG = {cx: 0, cy: 0, r: 0};
  function ringLayout(){
    RG.cx = xr(1440); RG.cy = ym(580); RG.r = 380 * U;
    rgL.forEach(function(e, i){
      var a = (-90 + 30 * i) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), rr = RG.r - 30 * U;
      var vert = Math.abs(c) < .2;
      e.classList.remove('ca', 'cb_', 'lm', 'rm'); e.classList.add(vert || c < 0 ? 'lm' : 'rm');
      /* beside its line, never on it: a step off, across the line */
      if (vert) at(e, RG.cx + 16 * U, RG.cy + (rr - 14 * U) * s); else at(e, RG.cx + rr * c - 24 * U * s * (c > 0 ? -1 : 1) * 0, RG.cy + rr * s + (s <= 0 ? 24 : -24) * U);
    });
  }
  var T4 = 1.85, D4 = .42;
  function model(q, t, act){
    var j, on = q >= T4 && q < T4 + 6 * D4 ? Math.floor((q - T4) / D4) : -1;
    for (j = 0; j < 12; j++){ var pj = j % 6, a = pj === on ? sg(q, T4 + pj * D4, T4 + pj * D4 + .1) * (1 - sg(q, T4 + pj * D4 + .36, T4 + pj * D4 + .42)) : 0; vis(rgL[j], a); if (rgL[j].__on !== (a > .5)){ rgL[j].__on = a > .5; rgL[j].classList.toggle('on', a > .5); } }
    if (!act) return;
    var k = eio(sg(q, .05, .95)), cx = RG.cx, cy = RG.cy, r0 = RG.r, open = eio(sg(q, 6.4, 7.05));
    if (open >= 1) return;
    var la = 1 - sg(open, .5, 1);
    if (k < .002) flat(1);
    else {
      var N = 240, th = 6.28318 * k, L = lerp(W + 20, 6.28318 * r0, k), R = L / th, ybm = lerp(MID, cy + r0, k), xbm = lerp(W / 2, cx, k), p = [], rr = lerp(1, WS.R / r0, open);
      for (j = 0; j <= N; j++){ var ph = (j / N - .5) * th; p.push((xbm + R * Math.sin(ph) - cx) * rr + cx, (ybm - R * (1 - Math.cos(ph)) - cy) * rr + cy); }
      ink(la); poly(p, k >= 1);
    }
    /* twelve marks on the circle; six conversations through one centre */
    var ta = sg(q, .95, 1.2) * (1 - sg(q, 5.15, 5.4));
    if (ta > 0){ ink(ta, 1); for (j = 0; j < 12; j++){ var an = (-90 + 30 * j) * Math.PI / 180; seg(cx + r0 * Math.cos(an), cy + r0 * Math.sin(an), cx + (r0 - 9 * U) * Math.cos(an), cy + (r0 - 9 * U) * Math.sin(an)); } }
    var fade = 1 - sg(q, 5.15, 5.4), any = 0;
    for (j = 0; j < 6; j++){
      var d = eo(sg(q, T4 + j * D4, T4 + j * D4 + .2)); if (d <= 0) continue; any = Math.max(any, d);
      var an2 = (-90 + 30 * j) * Math.PI / 180, c = Math.cos(an2), s = Math.sin(an2), al = (j === on ? 1 : q < 4.37 ? .3 : lerp(.3, .62, sg(q, 4.37, 4.6))) * fade;
      ink(al, j === on ? LW : 1);
      seg(cx + r0 * c, cy + r0 * s, cx + r0 * c * (1 - d), cy + r0 * s * (1 - d)); seg(cx - r0 * c, cy - r0 * s, cx - r0 * c * (1 - d), cy - r0 * s * (1 - d));
      if (j === on){ sq(cx + r0 * c, cy + r0 * s, d); sq(cx - r0 * c, cy - r0 * s, d); }
    }
    sq(cx, cy, any * fade);
  }

  /* ================================================================== the wine room: the result the circle opens onto (04), then the subject of 05 */
  var phW = $('phWine'), WS = {on: false, R: 1, r: [0, 0, 0, 0], im: [0, 0, 0, 0], sx: 1, dis: 0, col: 0, q: -1};
  var WAR = 2560 / 1845, WSH = 1153, WSEG = [1592,133,1592,1131,1294,993,1289,1,1578,1126,1590,136,1585,156,1571,1126,1596,1132,1596,273,1507,834,1526,1,1446,1,1438,751,1558,1125,1577,377,1138,949,1134,222,1461,43,1461,767,1131,104,421,88,1449,842,1454,134,1544,399,1524,1104,1120,757,1117,128,544,86,1137,99,1562,561,1561,1,417,156,416,713,1546,627,1552,136,1531,1106,1546,626,1504,578,1493,1042,672,664,673,203,1140,488,1142,947,1555,159,1556,596,859,139,439,128,1498,432,1496,31,1470,211,1472,609,686,197,685,583,373,516,1,518,1493,276,1488,647,1535,526,1534,159,366,313,1,311,799,116,438,106,1490,776,1498,433,717,314,716,656,1571,218,1567,534,1485,31,1483,337,1528,46,1529,348,1462,768,1465,1066,1477,374,1480,79,1531,503,1520,794,363,109,77,105,1482,576,1488,298,1556,831,1547,1107,1441,752,1429,1017,706,659,707,396,850,367,850,627,1511,259,1509,1,1516,1,1516,259,1483,1033,1489,777,1528,777,1536,524,1576,376,1579,127,434,186,673,190,412,554,412,318,412,318,412,84,1558,597,1558,829,1,290,232,292,690,684,921,693,1506,348,1504,578,1438,1065,1450,843,1068,120,846,117,1521,993,1528,772,1504,133,1505,354,1,497,222,497,533,913,531,696,1472,753,1472,968,589,514,589,302,1000,908,1000,704,167,86,369,89,1542,201,1536,1,1001,143,998,342,995,341,995,143,566,449,567,644,113,723,302,722,864,139,864,321,851,142,850,322,860,321,861,141,1207,739,1208,918,416,722,415,898,893,1004,1068,994,409,723,409,898,572,278,567,448,582,522,582,353,1030,556,1030,388,279,708,113,711,1036,391,1036,551,1529,344,1529,502,689,190,847,193,1206,578,1207,733,434,666,434,821,1059,417,1058,571,411,707,411,554,714,925,563,928,796,523,796,372,1541,1130,1391,1114,1007,144,1009,292,1068,968,921,967,921,692,1067,691,1536,151,1540,296,1429,1057,1289,1062,831,959,971,963,1286,1007,1426,1004,981,418,982,558,549,932,687,950,231,292,369,292,729,527,730,664,1069,741,1070,876,826,964,693,957,1289,1066,1422,1062,1293,1022,1426,1018,1424,1015,1293,1019,1501,1,1503,132,541,661,542,529,906,549,903,419,351,142,350,272,1426,989,1297,992,993,141,866,138,1068,271,1068,144,1571,169,1570,44,1565,9,1566,133,1545,109,1546,233,556,333,556,209,480,917,555,1012,556,207,436,204,1446,1087,1327,1092,832,324,832,206,436,430,553,432,1338,1099,1453,1112,438,284,553,285,439,234,553,236,439,277,553,278,1017,538,1017,424,827,358,938,381,1409,995,1297,998,1472,641,1471,753,552,282,439,281,1037,257,1036,144,1040,144,1040,257,553,274,442,273,552,228,441,228,563,921,563,811,1,768,109,763,1541,1,1545,109,295,1036,275,1143,788,937,788,829,1402,1009,1294,1012,831,203,726,201,729,319,729,424,928,1091,824,1086,611,816,612,919,38,771,38,874,208,1069,109,1099,1541,296,1543,398,539,569,437,568,1058,813,1013,721,992,701,890,704,686,955,585,943,808,919,806,818,917,827,916,928,1024,948,923,947,167,123,67,120,931,661,831,664,569,236,669,237,557,812,557,912,1552,138,1552,38,729,424,730,524,538,1020,439,1024,463,921,364,924,923,927,925,828,438,578,537,577,441,645,539,645,654,1121,591,1045,1289,1062,1202,1017,676,1032,773,1041,1496,1094,1501,997,531,833,433,835,434,823,531,821,1200,966,1287,1006,971,961,1067,957,922,967,827,964,1068,384,1067,479,1199,980,1284,1020,663,567,569,569,65,863,66,769,371,928,464,927,434,566,434,659,859,945,766,944,833,619,832,526,1199,1022,1282,1065,618,902,617,809,637,328,637,421,428,999,368,931,720,831,718,921,441,709,531,709,447,627,537,632,890,705,802,718,697,537,696,626,1576,112,1574,199,796,354,796,268,1014,755,1058,828,856,713,941,705,1574,29,1576,114,744,954,829,954,726,862,729,777,1140,401,1140,484,796,614,796,531,953,1079,1036,1068,1040,1140,1123,1151,266,917,243,997,696,1108,778,1115,347,902,304,831,431,902,348,904,1566,536,1563,617,634,1098,553,1095,900,342,981,348,299,722,379,719,539,290,459,290,414,82,493,84,719,824,720,746,436,106,436,184,1206,499,1206,577,1287,997,1217,965,241,803,317,802,317,797,241,798,938,168,927,243,929,353,854,339,1026,1082,951,1090,925,232,935,158,568,203,566,277,667,632,667,558,674,960,601,961,674,1035,690,1106,759,666,687,674,242,960,266,891,242,832,213,899,554,407,555,334,938,380,1011,381,442,1027,435,1099,1293,1013,1228,983,355,399,356,328,866,675,937,676,692,618,692,547,684,1108,669,1039,1224,964,1288,993,176,893,107,887,1546,231,1545,299,954,1136,1023,1137,581,349,582,281,670,551,670,619,1140,329,1140,398,988,822,989,891,1286,1018,1224,988,165,528,222,564,1566,134,1568,202,1005,291,1004,223,674,202,607,200,574,431,574,498,84,971,137,1012,790,1053,856,1039,1069,924,1003,931,1067,910,1001,908,434,837,434,903,637,423,637,489,1311,1150,1372,1124,1064,686,999,682,1026,1151,1024,1086,349,711,284,710,507,650,442,651,832,523,834,458,1067,141,1002,141,1287,988,1228,962,354,177,357,113,721,916,784,920,433,506,497,506,1580,106,1580,42,919,954,856,954,443,660,507,660,945,332,882,326,215,1007,209,1069,214,571,164,532,481,354,543,357,436,206,435,268,523,385,461,385,506,664,443,664,395,317,395,254,950,1089,952,1151,991,1039,1050,1055,446,1013,507,1013,358,62,358,1,951,831,951,892,1068,379,1068,318,147,1013,98,976,1037,1091,1039,1151,783,898,723,901,547,937,489,922,72,1113,13,1101,676,919,675,859,932,1151,930,1091,436,296,435,356], WORD = [];   /* the drawing is in the photograph's own 1600 × 1153 */
  (function(){ var n = WSEG.length / 4, i; for (i = 0; i < n; i++){ var mx = (WSEG[i * 4] + WSEG[i * 4 + 2]) / 3200; WORD[i] = c01(mx * .8 + ((i * 37) % 17) / 17 * .2); } })();
  function wine(s){
    var M = BY['a-model'], S = BY['a-standard'], qm = s - M.start, q5 = s - S.start;
    WS.R = Math.sqrt(Math.pow(Math.max(RG.cx, W - RG.cx), 2) + Math.pow(Math.max(RG.cy, H - RG.cy), 2)) + 4;
    WS.q = q5;
    if (qm < 5.95 || q5 > 5.62){ vis(phW, 0); WS.on = false; return; }
    WS.on = true;
    var full = [0, 0, W, H], imF = coverRect(0, 0, W, H, WAR, .5, .52);
    if (q5 < 0){   /* inside the circle, then the circle opens */
      /* in the circle the picture stands so that the doorway to the wine room is in it; as the circle opens the picture glides to its place */
      var op = eio(sg(qm, 6.4, 7.05)), r = qm < 6.4 ? RG.r * eio(sg(qm, 6.0, 6.4)) : lerp(RG.r, WS.R, op);
      var imR = [RG.cx - .47 * imF[2], Math.min(0, Math.max(H - imF[3], RG.cy - .42 * imF[3])), imF[2], imF[3]];
      imF = lerpR(imR, imF, op);
      vis(phW, 1); pic(phW, full, imF); clip(phW, r >= WS.R ? 'none' : 'circle(' + r.toFixed(1) + 'px at ' + RG.cx.toFixed(1) + 'px ' + RG.cy.toFixed(1) + 'px)');
      WS.r = full; WS.im = imF; WS.sx = 1; WS.dis = 0; WS.col = 0; return;
    }
    /* 05: the picture steps back into a window on the right half; dissolves into its drawing; the seam closes the finished room over it */
    var k = eio(sg(q5, .05, .9)), wx0 = xl(960), wy0 = yt(178), win = [wx0, wy0, W - 50 * U - wx0, H - FOOT - wy0], imW = coverRect(win[0], win[1], win[2], win[3], WAR, .47, .5);
    var r5 = lerpR(full, win, k), im5 = lerpR(imF, imW, k), col = eio(sg(q5, 5.0, 5.5));
    if (col > 0){ var t0 = lerp(r5[1], MID, col), b0 = lerp(r5[1] + r5[3], MID, col); r5 = [r5[0], t0, r5[2], Math.max(0, b0 - t0)]; }
    var dis = q5 < 2.0 ? eio(sg(q5, 1.0, 1.75)) : 0;
    var sx = q5 < 2.0 ? 1 : q5 < 3.15 ? eio(sg(q5, 2.1, 2.9)) : q5 < 4.2 ? lerp(1, .5, eio(sg(q5, 3.2, 3.6))) : lerp(.5, 1, eio(sg(q5, 4.25, 4.65)));
    WS.r = r5; WS.im = im5; WS.sx = sx; WS.dis = dis; WS.col = col;
    if (col >= 1 || (q5 >= 2.0 && sx <= 0)){ vis(phW, 0); return; }
    vis(phW, 1 - dis); pic(phW, r5, im5); clip(phW, sx >= 1 ? 'none' : 'inset(0 ' + ((1 - sx) * 100).toFixed(3) + '% 0 0)');
  }
  function standard(q, t, act){
    if (!act) return;
    var r = WS.r, im = WS.im, i, n = WSEG.length / 4;
    /* the drawing, in register with the photograph: under the dissolve first, then on the far side of the seam */
    var dr = q < 2.0 ? sg(q, .95, 1.75) : 1, x0 = q < 2.0 ? r[0] : r[0] + r[2] * WS.sx;
    if (dr > 0 && WS.col < 1 && x0 < r[0] + r[2] - .5){
      g.save(); g.beginPath(); g.rect(x0, r[1], r[0] + r[2] - x0, r[3]); g.clip();
      ink(1, 1); g.beginPath();
      var sxs = im[2] / 1600, sys = im[3] / WSH;
      for (i = 0; i < n; i++){
        var d = dr >= 1 ? 1 : sg(dr, WORD[i] * .72, WORD[i] * .72 + .28); if (d <= 0) continue;
        var ax = im[0] + WSEG[i * 4] * sxs, ay = im[1] + WSEG[i * 4 + 1] * sys, bx = im[0] + WSEG[i * 4 + 2] * sxs, by = im[1] + WSEG[i * 4 + 3] * sys;
        g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * d, ay + (by - ay) * d);
      }
      g.stroke(); g.restore();
    }
    /* the seam: our line, standing */
    if (q >= 2.0 && WS.sx > 0 && WS.sx < 1 && WS.col < 1){ var sxp = r[0] + r[2] * WS.sx; ink(1); seg(sxp, r[1], sxp, r[1] + r[3]); sq(sxp, r[1] + r[3] / 2, 1 - WS.col); }
    /* the window closes to one line again, and the line runs on */
    if (WS.col > .96){ var e = eio(sg(q, 5.4, 5.75)); flat(sg(WS.col, .96, 1), lerp(r[0], -10, e), lerp(r[0] + r[2], W + 10, e)); }
  }

  /* ================================================================== 06 DESIGNED AROUND YOU — a plan whose rooms are named after your life */
  var rmL = qsa('#rmL .rm'), phY = $('phYou'), YAR = 2560 / 1898;
  /* the plan, 910 × 640: [x1, y1, x2, y2, room]; door openings are simply left open, each with its swing */
  var PW = 910, PH = 640;
  var WALLS = [[310, 0, 310, 240, 0], [0, 240, 120, 240, 0], [166, 240, 310, 240, 0],
               [640, 0, 640, 240, 1], [310, 240, 440, 240, 1], [486, 240, 640, 240, 1],
               [640, 240, 740, 240, 2], [786, 240, 910, 240, 2],
               [220, 240, 220, 310, 3], [220, 356, 220, 430, 3], [0, 430, 220, 430, 3],
               [220, 430, 560, 430, 4], [606, 430, 910, 430, 4],
               [300, 430, 300, 500, 5], [300, 546, 300, 640, 5],
               [630, 430, 630, 500, 6], [630, 546, 630, 640, 6]];
  var ARCS = [[120, 240, 46, 0, 90, 0], [440, 240, 46, 0, 90, 1], [740, 240, 46, 0, 90, 2], [220, 310, 46, 90, 180, 3], [560, 430, 46, 270, 360, 4], [300, 500, 46, 90, 180, 5], [630, 500, 46, 0, 90, 6]];
  var RMC = [[25, 25], [335, 25], [665, 25], [25, 265], [245, 265], [25, 455], [325, 455], [655, 455]];   /* each name hangs in its room's corner */
  var T6 = 1.0, D6 = .28;
  function you(q, t, act){
    var px = xl(421), py = ym(218), sc = U, i, out = 1 - sg(q, 4.3, 4.55);
    for (i = 0; i < 8; i++){ vis(rmL[i], eo(sg(q, T6 + i * D6 + .1, T6 + i * D6 + .3)) * out); at(rmL[i], px + RMC[i][0] * sc, py + RMC[i][1] * sc); }
    /* "Yours": the plan fills with the room it became, and the room takes the screen */
    var pr = [px, py, PW * sc, PH * sc], full = [0, 0, W, H], imF = coverRect(0, 0, W, H, YAR, .5, .62);
    if (q < 4.3 || q > 6.05) vis(phY, 0);
    else {
      var k = eio(sg(q, 4.55, 5.1)), r = lerpR(pr, full, k), col = eio(sg(q, 5.55, 6.0));
      if (col > 0){ var t0 = lerp(r[1], MID, col), b0 = lerp(r[1] + r[3], MID, col); r = [r[0], t0, r[2], Math.max(0, b0 - t0)]; }
      if (col >= 1) vis(phY, 0); else { vis(phY, sg(q, 4.3, 4.55)); pic(phY, r, imF); }
    }
    if (!act) return;
    if (q > 5.9){ flat(sg(q, 5.9, 6.0)); return; }
    if (out <= 0) return;
    /* the line bends into the outer wall: its ends are drawn in, its middle walks the perimeter */
    var m = eio(sg(q, .05, .95)), N = 200, p = [], per = 2 * (PW + PH) * sc;
    for (i = 0; i <= N; i++){
      var s = i / N, bx = -10 + (W + 20) * s, u = c01((s - .12) / .76) * per, tx, ty, w = PW * sc, h = PH * sc;
      /* start at the middle of the left wall, go up and round clockwise */
      var d0 = h / 2;
      if (u < d0){ tx = px; ty = py + h / 2 - u; }
      else if (u < d0 + w){ tx = px + (u - d0); ty = py; }
      else if (u < d0 + w + h){ tx = px + w; ty = py + (u - d0 - w); }
      else if (u < d0 + 2 * w + h){ tx = px + w - (u - d0 - w - h); ty = py + h; }
      else { tx = px; ty = py + h - (u - d0 - 2 * w - h); }
      p.push(lerp(bx, tx, m), lerp(MID, ty, m));
    }
    ink(out); poly(p);
    /* the rooms, one after another */
    for (i = 0; i < WALLS.length; i++){ var wl = WALLS[i], d = eo(sg(q, T6 + wl[4] * D6, T6 + wl[4] * D6 + .26)); if (d <= 0) continue; ink(.62 * out, 1);
      seg(px + wl[0] * sc, py + wl[1] * sc, px + lerp(wl[0], wl[2], d) * sc, py + lerp(wl[1], wl[3], d) * sc); }
    for (i = 0; i < ARCS.length; i++){ var ar = ARCS[i], da = eo(sg(q, T6 + ar[5] * D6 + .12, T6 + ar[5] * D6 + .3)); if (da <= 0) continue; ink(.3 * out, 1);
      g.beginPath(); g.arc(px + ar[0] * sc, py + ar[1] * sc, ar[2] * sc, ar[3] * Math.PI / 180, lerp(ar[3], ar[4], da) * Math.PI / 180); g.stroke(); }
  }

  /* ================================================================== 07 OUR TEAM — one roof over ten disciplines; the people stand under it */
  var dcL = qsa('#dcL .dc'), tm = $('tm'), tmW = 0;
  var CSTEP = 145;
  function colX(i){ return xl(421) + i * CSTEP * U; }
  function roofY(x, r){ var ev = ym(500), ap = ym(290), xa = colX(0), xb = colX(9), mdx = (xa + xb) / 2, hw = (xb - xa) / 2, d = Math.abs(x - mdx); return lerp(MID, d >= hw ? ev : lerp(ap, ev, d / hw), r); }
  function team(q, t, act){
    var r = eio(sg(q, .05, .85)) * (1 - eio(sg(q, 6.2, 6.75))), i, colsOut = 1 - sg(q, 4.0, 4.3), base = ym(760);
    for (i = 0; i < 10; i++){ vis(dcL[i], eo(sg(q, 1.0 + i * .07, 1.25 + i * .07)) * colsOut); at(dcL[i], colX(i) - SQ * .375, base + (i % 2 ? 75 : 25) * U); }
    /* the people: a strip of portraits that travels under the roof */
    var sIn = sg(q, 4.2, 4.5) * (1 - sg(q, 6.0, 6.25));
    if (sIn <= 0) vis(tm, 0);
    else { if (!tmW) tmW = tm.scrollWidth; vis(tm, sIn); at(tm, lerp(xl(421) + 260 * U * (1 - eo(sg(q, 4.2, 4.6))), W - 50 * U - tmW, eio(sg(q, 4.5, 5.95))), ym(550)); }
    if (!act) return;
    var xs = [-10, colX(0), (colX(0) + colX(9)) / 2, colX(9), W + 10], p = [];
    for (i = 0; i < xs.length; i++) p.push(xs[i], roofY(xs[i], r));
    ink(1); g.lineJoin = 'miter'; poly(p);
    if (colsOut > 0) for (i = 0; i < 10; i++){
      var cxx = colX(i), d = eo(sg(q, .85 + i * .07, 1.2 + i * .07)); if (d <= 0) continue;
      var top = roofY(cxx, r); ink(.62 * colsOut, 1); seg(cxx, top, cxx, lerp(top, base, d)); sq(cxx, base, sg(d, .9, 1) * colsOut, SQ * .75);
    }
    /* connection: one tie through all ten */
    var tb = eio(sg(q, 2.25, 2.9)) * colsOut;
    if (tb > 0){ var xa = colX(0), xb = colX(9); ink(colsOut, LW); seg(xa, ym(640), lerp(xa, xb, tb), ym(640)); }
  }

  /* ================================================================== 08 THE CI EXPERIENCE — a line without a seam; five commitments on it; a fifth of the way given back */
  var T8 = 1.6, D8 = .4;
  function exper(q, t, act){
    if (!act) return;
    var cut = eio(sg(q, 3.65, 4.15)) * (1 - eio(sg(q, 4.6, 4.95))), xe = lerp(W + 10, W * .8, cut), i;
    flat(1, -10, xe);
    if (cut > 0){ ink(.3 * cut, 1, [3, 7]); seg(xe, MID, W + 10, MID); g.setLineDash([]); }
    var x0 = xl(960), x1 = W * .8 - 70 * U, ta = sg(q, 1.4, 1.65) * (1 - sg(q, 3.45, 3.65));
    if (ta > 0){ ink(ta, 1); for (i = 0; i < 5; i++){ var x = lerp(x0, x1, i / 4); seg(x, MID - 9 * U, x, MID + 9 * U); } }
    /* the square: where we are on the way */
    var st = c01((q - T8) / D8 / 4), hx = x0, hs = sg(q, 1.4, 1.65);
    for (i = 1; i < 5; i++) hx += (x1 - x0) / 4 * eio(sg(q, T8 + i * D8 - .08, T8 + i * D8 + .1));
    if (q > 3.5) hx = lerp(hx, xe, eio(sg(q, 3.55, 4.1)));
    sq(hx, MID, hs * (1 - sg(q, 4.75, 4.95)));
  }

  /* ================================================================== 09 OUR PRINCIPLES — seven floors on one ground line, from "Listen First" up */
  var prs = qsa('#prs .pr'), T9 = .95, D9 = .55, FH = 84;
  function tower(q){ var f = 0, i; for (i = 0; i < 7; i++) f += eo(sg(q, T9 + i * D9, T9 + i * D9 + .3)); return f; }
  function princ(q, t, act){
    var gy = lerp(MID, yb(930), eio(sg(q, .05, .75))), x0 = xr(960), x1 = xr(1870), f = q < 0 ? 0 : tower(q), i;
    var on = q >= T9 && q < 5.1 ? Math.min(6, Math.floor((q - T9) / D9)) : -1, out = 1 - sg(q, 5.3, 5.6);
    for (i = 0; i < 7; i++){
      var a = sg(f, i + .35, i + .95) * out, e = prs[i]; vis(e, a);
      box(e, x0, gy - FH * U * (i + 1), x1 - x0, FH * U);
      if (e.__on !== (i === on)){ e.__on = i === on; e.classList.toggle('on', i === on); }
    }
    if (!act) return;
    var top = gy - FH * U * f;
    ink(1); g.lineJoin = 'miter';
    if (f <= 0) seg(-10, gy, W + 10, gy); else poly([-10, gy, x0, gy, x0, top, x1, top, x1, gy, W + 10, gy]);
    for (i = 0; i < 6; i++){ var d = sg(f, i + 1, i + 1.3) * out; if (d > 0 && i !== on && i + 1 !== on){ ink(.3 * d, 1); seg(x0, gy - FH * U * (i + 1), x1, gy - FH * U * (i + 1)); } }
  }

  /* ================================================================== 10 CTA — the line stands up as a door; it opens onto the finished home */
  var dr = $('dr'), leaf = $('drLeaf'), phD = $('phDoor'), DAR = 2560 / 1920;
  function cta(q, t, act){
    var gy = yb(930), e = eio(sg(q, .02, .85)), x0 = lerp(xr(960), xr(1500), e), x1 = xr(1870), top = lerp(gy - FH * U * 7, gy - 690 * U, e);
    var o = eio(sg(q, 1.0, 2.1));
    if (q < .8){ vis(phD, 0); vis(dr, 0); }
    else {
      /* the room beyond: the picture stands larger than the doorway, its dining room in the opening; it drifts a little as the door swings */
      var r = [x0, top, x1 - x0, gy - top], ih = (gy - top) * 1.42, iw = ih * DAR, sh = (1 - o) * 46 * U;
      vis(phD, sg(q, .8, .9)); pic(phD, r, [(x0 + x1) / 2 - .735 * iw - sh, (top + gy) / 2 - .56 * ih, iw, ih]);
      vis(dr, sg(q, .8, .9)); box(dr, x0, top, x1 - x0, gy - top);
      var an = (o * 74).toFixed(2); if (leaf.__an !== an){ leaf.__an = an; leaf.style.transform = 'rotateY(' + an + 'deg)'; }
    }
    if (!act) return;
    ink(1); g.lineJoin = 'miter'; poly([-10, gy, x0, gy, x0, top, x1, top, x1, gy, W + 10, gy]);
  }

  var FN = {'a-top': cover, 'a-story': story, 'a-why': why, 'a-model': model, 'a-standard': standard, 'a-you': you, 'a-team': team, 'a-exp': exper, 'a-principles': princ, 'a-cta': cta};
  qsa('.tc').forEach(function(c){ c.addEventListener('click', function(){ if (coarse) c.classList.toggle('flip'); }); });

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

  /* ================================================================== the loop */
  var lastY = -1, lastVH = 0;
  function tick(now){
    smoothStep();
    if (dirty) layout();
    var y = window.scrollY, s = (y - mainTop) / (SP * H), t = now / 1000, i, act = 0;
    for (i = 0; i < SC.length; i++) if (s >= SC[i].start) act = i;
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); g.lineCap = 'butt'; g.lineJoin = 'round'; g.setLineDash([]);
    wine(s);
    for (i = 0; i < SC.length; i++){
      var c = SC[i], q = s - c.start, near = q > -.3 && q < c.len + (i === SC.length - 1 ? 1.7 : .3);   /* the last scene stays while the stage scrolls away */
      if (near !== c.on){ c.on = near; c.el.classList.toggle('on', near); }
      for (var k = 0; k < c.ms.length; k++) runMoment(c.ms[k], near ? q : -9);
      FN[c.id](near ? q : -9, t, i === act);
    }
    if (y !== lastY || H !== lastVH) updateChap(y, H);
    chapInk(); updateLogo(y, H);
    lastY = y; lastVH = H;
    requestAnimationFrame(tick);
  }
  /* a hook for the test renders: the film's map, and a frozen clock */
  window.__ab3 = {scenes: function(){ return SC.map(function(c){ return {id: c.id, start: c.start, len: c.len}; }); }, y: function(id, q){ return mainTop + (BY[id].start + q) * SP * H; }};
  requestAnimationFrame(tick);
})();
