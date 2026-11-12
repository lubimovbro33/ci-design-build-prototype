/* CI · About us (12.11.2026) — vanilla, no deps. The page shell (cursor, smooth wheel, header, chapter rail, footer street) is the
   homepage's, trimmed to what this page has; the ten scenes are below it, each scrubbed by the scroll through its own pinned stage. */
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
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v){ return Math.round(v * 10) / 10; }
  var mm = window.matchMedia;
  var reduced = mm && mm('(prefers-reduced-motion: reduce)').matches;
  var coarse = mm && mm('(pointer: coarse)').matches;
  function desk(){ return window.innerWidth >= window.innerHeight; }
  function U(){ return window.innerWidth / 1920; }
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ------------------------------------------------------------------ typograph: no hanging short words, the last two words tied */
  (function(){
    var SHORT; try { SHORT = new RegExp('(?<=^|[\\s(“"])(a|an|the|of|to|in|on|at|by|for|and|or|but|is|it|we|our|your|you|with|from|as|so|no|not|one|CI|—|–)\\s+(?=\\S)', 'gi'); } catch (e) { return; }
    qsa('.a-say, .a-p, .ql-c, .pr .pl').forEach(function(n){
      var tw = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), t, last = null;
      while ((t = tw.nextNode())){ t.nodeValue = t.nodeValue.replace(SHORT, function(m, w){ return w + ' '; }).replace(/\s+(—|–)/g, ' $1'); if (/\S/.test(t.nodeValue)) last = t; }
      if (last) last.nodeValue = last.nodeValue.replace(/\s+(\S+\s*)$/, ' $1');
    });
  })();

  /* ------------------------------------------------------------------ words: every moment brings its words in one after another */
  function split(node){
    var out = [];
    (function walk(n){
      [].slice.call(n.childNodes).forEach(function(c){
        if (c.nodeType === 3){
          var parts = c.nodeValue.split(/([ \t\n\r]+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){ if (!p) return; if (/^[ \t\n\r]+$/.test(p)){ frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = p; frag.appendChild(w); out.push(w); });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.hasAttribute('data-k')) walk(c);
      });
    })(node);
    return out;
  }
  function Moment(node){
    var o = {el: node, words: [], kin: -1, kout: -1, blur: node.classList.contains('a-h2'), box: !!node.querySelector('[data-k]') || node.hasAttribute('data-box')};
    var k = (node.getAttribute('data-k') || '0 0 2 2').trim().split(/\s+/).map(parseFloat);
    o.a = k[0]; o.b = k[1]; o.c = k[2]; o.d = k[3];
    if (!o.box) o.words = split(node);
    var cws = o.words.filter(function(w){ var f = w.closest('[data-fx="ch"]'); return f && node.contains(f); });
    if (cws.length){
      var sd = 0; [].forEach.call(node.textContent, function(c){ sd = (sd * 31 + c.charCodeAt(0)) % 2147483647; }); sd = sd || 7;
      o.chars = [];
      cws.forEach(function(w){ var t = w.textContent; w.textContent = ''; [].forEach.call(t, function(c){ var e = document.createElement('span'); e.className = 'c'; e.textContent = c; w.appendChild(e); sd = (sd * 16807) % 2147483647; o.chars.push({e: e, r: (sd - 1) / 2147483646}); }); });
      o.words = o.words.filter(function(w){ return cws.indexOf(w) < 0; });
    }
    return o;
  }
  function setMoment(o, kin, kout){
    kin = Math.round(kin * 1000) / 1000; kout = Math.round(kout * 1000) / 1000;
    if (kin === o.kin && kout === o.kout) return;
    var st = o.el.style;
    if (kout !== o.kout || (kin > 0) !== (o.kin > 0)){
      var vis = kin > 0 && kout < 1;
      st.visibility = vis ? '' : 'hidden';
      st.opacity = vis ? (1 - eo(kout)).toFixed(3) : 0;
      st.transform = kout > 0 ? 'translateY(' + (-eo(kout) * 18).toFixed(1) + 'px)' : '';
      st.filter = kout > 0 && o.blur ? 'blur(' + (kout * 8).toFixed(1) + 'px)' : '';
    }
    if (kin !== o.kin){
      if (o.box){ if (kout <= 0){ st.opacity = eo(kin).toFixed(3); st.transform = 'translateY(' + ((1 - eo(kin)) * 26).toFixed(1) + 'px)'; } }
      else {
        if (o.chars) for (var ci = 0; ci < o.chars.length; ci++){ var cc = o.chars[ci], qq = c01(kin * 1.8 - cc.r * .8), v = qq >= 1 ? '' : (qq * qq * (3 - 2 * qq)).toFixed(3); if (cc.v !== v){ cc.v = v; cc.e.style.opacity = v; } }
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
  function runMoment(o, p){ setMoment(o, sg(p, o.a, o.b), o.c >= 2 ? 0 : sg(p, o.c, o.d)); }
  /* a time-driven version for things that are not pinned (the cover, the team) */
  function play(o, delay, dur){
    var t0 = performance.now() + delay;
    (function f(now){ var k = c01((now - t0) / dur); setMoment(o, k, 0); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* ------------------------------------------------------------------ the shell: cursor */
  var cur = $('cur');
  if (cur && !coarse){
    var tx = 0, ty = 0, curLab = qs('.cl', cur), cSq = qs('.cd', cur), S = {x: 0, y: 0, s: 8, r: 0}, cTgt = null, cDown = false, cFirst = true, pvx = 0;
    var PRESS = 'a,button,[data-cursor]';
    window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; if (cFirst){ cFirst = false; S.x = tx; S.y = ty; } cur.classList.add('on'); });
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
      var k = dock ? .2 : .24, nx = S.x + (x - S.x) * k, v = nx - S.x; S.x = nx; S.y += (y - S.y) * k; S.s += (sz - S.s) * .2;
      pvx += (Math.max(-18, Math.min(18, v * 1.4)) - pvx) * .15; S.r = dock || lab ? S.r * .8 : pvx;
      cSq.style.width = cSq.style.height = S.s.toFixed(2) + 'px';
      cSq.style.transform = 'translate3d(' + (S.x - S.s / 2).toFixed(1) + 'px,' + (S.y - S.s / 2).toFixed(1) + 'px,0) rotate(' + S.r.toFixed(2) + 'deg)';
      requestAnimationFrame(curLoop); })();
  }
  var MX = -1e4, MY = -1e4; window.addEventListener('pointermove', function(e){ MX = e.clientX; MY = e.clientY; }, {passive: true});

  /* button labels roll through a blur on hover (the homepage's variant A) */
  qsa('.blk .t, .hdr .cta-blk .t').forEach(function(t){
    var lines = t.innerHTML.split(/<br\s*\/?>/i).map(function(l){ return l.replace(/<[^>]*>/g, ''); });
    t.parentNode.setAttribute('aria-label', lines.join(' '));
    t.innerHTML = lines.map(function(l, i){ return '<span class="bl" style="--i:' + i + '"><span class="bo" aria-hidden="true">' + l + '</span><span class="bn" aria-hidden="true">' + l + '</span></span>'; }).join('');
  });

  /* smooth wheel (lerp), as on the homepage */
  var sm = {t: 0, c: 0, on: false};
  if (!reduced && !coarse){
    window.addEventListener('wheel', function(e){
      if (e.ctrlKey) return; e.preventDefault();
      if (document.documentElement.classList.contains('mn-open')) return;
      var d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      d = Math.max(-140, Math.min(140, d));
      if (!sm.on){ sm.on = true; sm.c = sm.t = window.scrollY; }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      sm.t = Math.max(0, Math.min(max, sm.t + d * 1.15));
    }, {passive: false});
    window.addEventListener('scroll', function(){ if (!sm.on || Math.abs(window.scrollY - sm.c) > 2){ sm.c = sm.t = window.scrollY; sm.on = false; } });
  }
  function smoothStep(){ if (!sm.on) return; var d = sm.t - sm.c; if (Math.abs(d) < .3){ sm.on = false; return; } sm.c += d * .11; sm.c = Math.round(sm.c * 100) / 100; window.scrollTo(0, sm.c); sm.c = window.scrollY; }
  function smoothTo(y){ if (reduced || coarse){ window.scrollTo(0, y); return; } sm.on = true; sm.c = window.scrollY; sm.t = y; }
  qsa('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){ var id = a.getAttribute('href').slice(1); if (!id){ e.preventDefault(); return; } var t = $(id); if (!t) return; e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY; if (id === 'a-cta') y += Math.max(0, t.offsetHeight - window.innerHeight) * .62; smoothTo(y); });
  });

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
    for (var i = 0; i < tops.length; i++) if (y + vh * .5 >= tops[i]) idx = i;
    var next = idx + 1 < tops.length ? tops[idx + 1] : document.documentElement.scrollHeight - vh;
    var p = c01((y - tops[idx]) / Math.max(1, next - tops[idx]));
    if (idx !== chapOn){ chapOn = idx; chapLinks.forEach(function(a, k){ a.classList.toggle('on', k === idx); }); }
    chapLinks.forEach(function(a, k){ var v = k < idx ? 1 : k > idx ? 0 : p, s = v.toFixed(4); if (a.__p !== s){ a.__p = s; a.style.setProperty('--p', s); a.classList.toggle('st', v > 0); } });
  }
  function rgbL(s){ var m = s && s.match(/[\d.]+/g); if (!m || (m.length > 3 && +m[3] < .5)) return -1; return (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; }
  function under(x, y){
    var st = document.elementsFromPoint(x, y);
    for (var i = 0; i < st.length; i++){
      var e = st[i]; if ((chap && chap.contains(e)) || (cur && cur.contains(e))) continue;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .5) continue;
      var t = e.tagName; if (t === 'IMG' || t === 'CANVAS' || t === 'VIDEO') return 0;
      var l = rgbL(cs.backgroundColor); if (l >= 0) return l;
    }
    return 0;
  }
  function chapInk(){
    if (!chapLinks.length || (chapN++ & 3)) return; var y = window.innerHeight - 18;
    for (var i = 0; i < chapLinks.length; i++){ var r = chapLinks[i].getBoundingClientRect(); if (!r.width) continue; var lt = under(r.left + Math.min(r.width / 2, 60), y) > .6; if (lt !== chapLinks[i]._lt){ chapLinks[i]._lt = lt; chapLinks[i].classList.toggle('lt', lt); } }
  }

  /* ================================================================== the scenes */
  var SC = [];
  function Scene(id, fn, opt){
    var sec = $(id); if (!sec) return null;
    var o = {sec: sec, fn: fn || function(){}, last: -1, top: 0, h: 0, ms: qsa('.a-stage .m', sec).map(Moment), live: opt && opt.live};
    SC.push(o); return o;
  }
  function M(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--m')) || 48; }

  /* ---------- 01 COVER: built on load */
  (function(){
    var cv = qs('.a-cover'); if (!cv) return;
    var ms = qsa('.m0', cv).map(function(n){ n.style.opacity = 1; return Moment(n); });
    ms.forEach(function(o){ setMoment(o, 0, 0); o.el.style.visibility = ''; });
    function go(){
      if (reduced){ cv.classList.add('go', 'done'); ms.forEach(function(o){ setMoment(o, 1, 0); }); return; }
      requestAnimationFrame(function(){ cv.classList.add('go'); });
      setTimeout(function(){ cv.classList.add('done'); }, 4300);
      ms.forEach(function(o, i){ play(o, 3000 + i * 260, 1500); });
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ setTimeout(go, 120); }); else setTimeout(go, 300);
  })();

  /* ---------- 02 STORY: the finish board rises beside the statement; then "one" three times at full scale */
  (function(){
    var ph = $('stPh'); if (!ph) return;
    var rows = qsa('.st-r', $('a-story')).map(Moment);
    Scene('a-story', function(p){
      var r = eio(sg(p, .03, .16)), o = sg(p, .27, .33);
      ph.style.setProperty('--r', ((1 - r) * 100).toFixed(2) + '%'); ph.style.setProperty('--z', r.toFixed(3));
      ph.style.opacity = (1 - o).toFixed(3);
      rows.forEach(function(m){ runMoment(m, p); });
    });
  })();

  /* ---------- 03 WHY CI + THE MODEL: ten loads sag one beam; one central support takes them; the level line then carries each pair */
  (function(){
    var svg = $('ldSvg'); if (!svg) return;
    var beam = $('ldBeam'), col = $('ldCol'), sup = $('ldSup'), thg = $('ldTh'), ci = $('ldCi'), lds = qsa('#ldWs .ld'), N = lds.length, P = 0;
    var pps = qsa('#pw .pp'), rs = qsa('.rs-w .rs').map(Moment), PA = .64, PS = .037;
    pps.forEach(function(pp){ qsa(':scope > span', pp).forEach(function(s){ s.setAttribute('data-fx', 'ch'); }); });
    var pm = pps.map(function(pp){ return qsa(':scope > span', pp).map(Moment); });
    var seed = 3; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var L = lds.map(function(_, i){ return {L0: (i % 2 ? 150 : 70) + rnd() * 70, ph: rnd() * 6.3, w: 1.1 + rnd() * .7, th: 0, path: el('path', {}, thg)}; });
    function draw(now){
      var t = now / 1000, W = svg.clientWidth, H = svg.clientHeight, m = M(), k = H / 900;
      var x0 = m, x1 = W - m, y0 = H * .4, span = x1 - x0;
      var fix = eio(sg(P, .24, .33)), drop = 0, ds = [], gone = sg(P, .5, .54);
      for (var i = 0; i < N; i++){ var a = .05 + i * .014, d = sg(P, a, a + .03); ds.push(d); drop += eo(d); }
      var D = H * .15 * (drop / N) * (1 - fix);
      function yb(x){ return y0 + D * Math.sin(Math.PI * c01((x - x0) / span)); }
      var dpath = ''; for (var s = 0; s <= 60; s++){ var x = x0 + span * s / 60; dpath += (s ? 'L' : 'M') + f1(x) + ' ' + f1(yb(x)); }
      beam.setAttribute('d', dpath);
      var tri = 16 * k; sup.setAttribute('d', 'M' + f1(x0 - tri * .7) + ' ' + f1(y0 + tri) + 'L' + f1(x0) + ' ' + f1(y0) + 'L' + f1(x0 + tri * .7) + ' ' + f1(y0 + tri) + 'Z M' + f1(x1 - tri * .7) + ' ' + f1(y0 + tri) + 'L' + f1(x1) + ' ' + f1(y0) + 'L' + f1(x1 + tri * .7) + ' ' + f1(y0 + tri) + 'Z');
      var cr = eo(sg(P, .22, .3)), xc = x0 + span / 2, yTop = lerp(H, yb(xc), cr);
      col.setAttribute('d', cr > 0 ? 'M' + f1(xc) + ' ' + f1(H) + 'V' + f1(yTop) : '');
      var cis = ci.style; cis.opacity = sg(P, .28, .3).toFixed(3); cis.transform = 'translate(' + f1(xc) + 'px,' + f1(yb(xc)) + 'px) translate(-50%,-50%)';
      var Lf0 = 56 * k, Lf1 = 112 * k;
      for (var j = 0; j < N; j++){
        var o = L[j], dd = ds[j], xx = x0 + span * (j + .5) / N, ya = yb(xx), len = lerp(o.L0 * k, j % 2 ? Lf1 : Lf0, fix) * (1 - eio(gone));
        var mx = MX > 0 ? Math.max(-1, Math.min(1, (xx - MX) / 90)) * Math.exp(-Math.pow((xx - MX) / 110, 2)) * Math.exp(-Math.pow((ya + len - MY) / 160, 2)) : 0;
        var target = ((.05 + .03 * Math.sin(o.ph)) * Math.sin(t * o.w + o.ph) + (1 - eo(dd)) * .5 * Math.sin(t * 5 + o.ph) + mx * .35) * (1 - fix);
        o.th += (target - o.th) * .08;
        var fall = (1 - eo(dd)) * (H * .14), ex = xx + Math.sin(o.th) * len, ey = ya + Math.cos(o.th) * len - fall;
        o.path.setAttribute('d', dd > 0 && gone < 1 ? 'M' + f1(xx) + ' ' + f1(ya) + 'L' + f1(ex) + ' ' + f1(Math.max(ya, ey)) : '');
        var st = lds[j].style; st.opacity = dd > 0 ? (eo(sg(dd, .35, 1)) * (1 - gone)).toFixed(3) : 0;
        st.transform = 'translate(' + f1(ex) + 'px,' + f1(ey) + 'px) translate(-50%, -2px) rotate(' + (-o.th * 57.3).toFixed(2) + 'deg)';
      }
      /* the pairs stand on the level line, one at each support */
      var gap = 14 * Math.max(.7, U());
      pps.forEach(function(pp){ qsa(':scope > span', pp).forEach(function(s){ var hh = s.offsetHeight; s.style.top = f1(y0 - hh - gap) + 'px'; }); });
    }
    Scene('a-why', function(p){
      P = p;
      for (var j = 0; j < 6; j++){
        var a = PA + j * PS, kin = sg(p, a, a + PS * .45), kout = j < 5 ? sg(p, a + PS * .82, a + PS) : sg(p, .855, .875);
        pm[j].forEach(function(o){ setMoment(o, kin, kout); }); setMoment(rs[j], sg(p, a + .004, a + PS * .5), kout);
      }
    }, {live: draw});
  })();

  /* ---------- 04 STANDARD: drawing → the model in register → the finished room → the room as a sheet with its title block */
  (function(){
    var f = $('qlF'), svg = $('qlLn'); if (!f || !svg) return;
    var lines = [], cut = $('qlCut'), clay = qs('.ql-clay', f), P = -1;
    fetch('assets/about/lines.json').then(function(r){ return r.json(); }).then(function(d){
      d.l.forEach(function(l, i){ lines.push({e: el('line', {x1: l[0], y1: l[1], x2: l[2], y2: l[3], pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, 'stroke-opacity': (.3 + .6 * l[4]).toFixed(2), 'stroke-width': (.8 + .7 * l[4]).toFixed(2)}, svg), i: i, n: d.l.length, last: -1}); });
      if (P >= 0) upd(P);
    }).catch(function(){});
    function upd(p){
      P = p;
      for (var i = 0; i < lines.length; i++){ var o = lines[i], a = .04 + (o.i / o.n) * .2, d = eio(sg(p, a, a + .06)), v = Math.round(d * 1000) / 1000; if (v !== o.last){ o.last = v; o.e.setAttribute('stroke-dashoffset', (1 - v).toFixed(3)); } }
      clay.style.opacity = (sg(p, .3, .4) * .92).toFixed(3);
      f.style.setProperty('--x', (eio(sg(p, .42, .64)) * 100).toFixed(2) + '%');
      cut.style.opacity = (sg(p, .4, .44) * (1 - sg(p, .64, .68))).toFixed(3);
      svg.style.opacity = (1 - sg(p, .62, .7)).toFixed(3);
      f.style.setProperty('--cb', (eio(sg(p, .68, .78)) * 34).toFixed(2) + '%');
    }
    var cms = qsa('[data-k]', qs('.ql-tb')).map(Moment);
    Scene('a-standard', function(p){ upd(p); cms.forEach(function(o){ runMoment(o, p); }); });
  })();

  /* ---------- 05 FOR YOU: "your …" rolls through a life until it becomes "yours." */
  (function(){
    var sl = $('lfSl'); if (!sl) return;
    var ws = qsa('.sw', sl), ims = qsa('#lfPh img'), ph = $('lfPh'), sx = qs('.lf-s', sl), N = ws.length, on = -1;
    Scene('a-you', function(p){
      var raw = sg(p, .17, .74) * (N - 1) + sg(p, .755, .8), fl = Math.floor(raw), fr = raw - fl, f = Math.min(N, fl + eio(c01((fr - .55) / .45)));
      ws.forEach(function(w, j){ var d = j - f, s = w.style, o = c01(1 - Math.abs(d) * 1.4); s.transform = 'translateY(' + (d * 2.1).toFixed(3) + 'em)'; s.opacity = o.toFixed(3); s.visibility = o > 0 ? '' : 'hidden'; });
      var i = Math.max(0, Math.min(N - 1, Math.round(f)));
      if (i !== on){ if (on >= 0) ims[on].classList.remove('on'); on = i; ims[i].classList.add('on'); }
      sl.style.opacity = sg(p, .13, .18).toFixed(3);
      ph.style.opacity = (sg(p, .13, .18) * (1 - sg(p, .74, .8))).toFixed(3);
      sx.style.clipPath = 'inset(0 ' + ((1 - eio(sg(p, .76, .82))) * 100).toFixed(1) + '% 0 0)';
      sl.style.transform = 'translateY(-55%) scale(' + (1 + eio(sg(p, .78, .9)) * .55).toFixed(4) + ')';
    });
  })();

  /* ---------- 06 TEAM: everything comes in with the section's own position, not a timer */
  (function(){
    var sec = $('a-team'); if (!sec) return;
    var rvs = qsa('.rv', sec).map(Moment), figs = qsa('.tm-ph figure', sec);
    rvs.forEach(function(o){ o.el.style.opacity = 1; setMoment(o, 0, 0); o.el.style.visibility = ''; });
    SC.push({sec: sec, fn: function(){}, last: -1, ms: [], free: function(vh){
      var r = sec.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      rvs.forEach(function(o){ var t = o.el.getBoundingClientRect().top; setMoment(o, sg(vh - t, vh * .08, vh * (o.el.classList.contains('tm-wall') ? .62 : .38)), 0); });
      figs.forEach(function(fg){ var t = fg.getBoundingClientRect(), k = eo(sg(vh - t.top, 0, vh * .8)); fg.style.setProperty('--k', k.toFixed(3)); fg.style.clipPath = 'inset(' + ((1 - eio(sg(vh - t.top, vh * .05, vh * .55))) * 100).toFixed(2) + '% 0 0 0)'; });
    }});
  })();

  /* ---------- 07 EXPERIENCE + PRINCIPLES: the seam closes until it disappears; the commitments; then the principles, row by row */
  (function(){
    var s = $('sm'); if (!s) return;
    var hl = $('xpHl'), rows = qsa('#prB .pr');
    Scene('a-exp', function(p){
      var fs = parseFloat(getComputedStyle(s).fontSize), k = eio(sg(p, .02, .18));
      s.style.setProperty('--d', ((1 - k) * fs * .42).toFixed(1) + 'px');
      s.style.setProperty('--so', (1 - sg(p, .15, .2)).toFixed(3));
      var out = sg(p, .2, .24), inn = sg(p, 0, .02);
      s.style.opacity = (eo(inn) * (1 - out)).toFixed(3); s.style.filter = out > 0 ? 'blur(' + (out * 10).toFixed(1) + 'px)' : '';
      hl.classList.toggle('on', p >= .37 && p < .46);
      rows.forEach(function(r, i){ var a = .65 + i * .042, l = sg(p, a, a + .042); r.style.setProperty('--t', eo(sg(l, 0, .6)).toFixed(4)); r.classList.toggle('on', l > 0 && l < 1); });
    });
  })();

  /* ---------- 08 CTA: the next title is drawn, not built; it fills when you begin */
  (function(){
    var sec = $('a-cta'); if (!sec) return;
    var svg = qs('.ct-h .cv-t', sec), gd = qs('.ct-h .cv-gd', sec), grid = qs('.ct-grid', sec), go = qs('.ct-go', sec);
    function fill(on){ sec.classList.toggle('fill', on); }
    if (go){ go.addEventListener('pointerenter', function(){ fill(true); }); go.addEventListener('pointerleave', function(){ fill(false); }); go.addEventListener('focus', function(){ fill(true); }); go.addEventListener('blur', function(){ fill(false); }); }
    Scene('a-cta', function(p){
      var g = eio(sg(p, .02, .22)).toFixed(4), k = sg(p, .12, .5).toFixed(4);
      gd.style.setProperty('--g', g); grid.style.setProperty('--g', g); svg.style.setProperty('--k', k);
      if (coarse) fill(p > .9);
    });
  })();

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
        var q = 'M' + f1(xx) + ' ' + f1(yy) + 'h.1';
        if (!CI && x > 300 && x < 520 && h > 150 && yy < GY - 90){ CI = [xx, yy]; continue; }
        if (rnd() < .07) lit += q; else dots += q;
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

  /* ================================================================== the loop: only scenes near the screen */
  var dirty = true;
  function measure(){ var y = window.scrollY; SC.forEach(function(c){ var r = c.sec.getBoundingClientRect(); c.top = r.top + y; c.h = c.sec.offsetHeight; }); dirty = false;
    var s = qsa('#ftCity, .ch svg'); s.forEach(function(v){ var mtx = v.getScreenCTM && v.getScreenCTM(); if (mtx && mtx.a) v.style.setProperty('--ds', Math.max(mtx.a, .05).toFixed(4)); }); }
  window.addEventListener('resize', function(){ dirty = true; SC.forEach(function(c){ c.last = -1; }); });
  window.addEventListener('load', function(){ dirty = true; });
  if (window.ResizeObserver) new ResizeObserver(function(){ dirty = true; }).observe(document.body);
  var lastY = -1, lastVH = 0, isDesk = desk();
  function tick(now){
    smoothStep();
    if (dirty) measure();
    var y = window.scrollY, vh = window.innerHeight; isDesk = desk();
    for (var i = 0; i < SC.length; i++){
      var c = SC[i];
      if (c.free){ c.free(vh); continue; }
      var away = y + vh * 1.2 < c.top || y > c.top + c.h + vh * .2;
      if (away || !isDesk) continue;
      var p = reduced ? 1 : c01((y - c.top) / Math.max(1, c.h - vh));
      if (p !== c.last){ c.last = p; c.fn(p, vh); for (var k = 0; k < c.ms.length; k++) runMoment(c.ms[k], p); }
      if (c.live) c.live(now);
    }
    if (y !== lastY || vh !== lastVH){ updateChap(y, vh); }
    chapInk(); updateLogo(y, vh);
    lastY = y; lastVH = vh;
    requestAnimationFrame(tick);
  }
  /* phones and tall windows: the scenes stand in the flow, their words visible */
  if (!desk()) SC.forEach(function(c){ c.ms.forEach(function(o){ setMoment(o, 1, 0); }); });
  window.scrollTo(0, 0);
  requestAnimationFrame(tick);
})();
