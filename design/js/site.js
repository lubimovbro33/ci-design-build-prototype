/* CI Design + Build — homepage design v11 · site.js
   vanilla, no deps. 1) hero intro timeline  2) reveals  3) scroll-driven blocks  4) interactions */
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var qs = function(s, r){ return (r || document).querySelector(s); };
  var qsa = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, p){ return a + (b - a) * p; }
  var E = {
    out: function(t){ return 1 - Math.pow(1 - t, 4); },
    expo: function(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; },
    push: function(t){ return t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; },
    lin: function(t){ return t; }
  };
  function seg(t, a, b, ease){ return (ease || E.expo)(clamp01((t - a) / (b - a))); }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = function(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--m')) || 48; };
  try { history.scrollRestoration = 'manual'; } catch(e){}
  window.scrollTo(0, 0);

  /* ================================================================== plate geometry (CTA bookend only — 2D) */
  var P = {w:2851, h:1520, glass:{x:1400, y:524, w:330, h:452}};
  function cover(vw, vh){ var s = Math.max(vw / P.w, vh / P.h); return {s:s, px:(vw - P.w * s) / 2, py:(vh - P.h * s) / 2}; }
  function mapRect(c, r){ return {x:c.px + r.x * c.s, y:c.py + r.y * c.s, w:r.w * c.s, h:r.h * c.s}; }
  function plateGeom(vw, vh){
    var c = cover(vw, vh), gl = mapRect(c, P.glass);
    var g = {vw:vw, vh:vh, s:c.s, px:c.px, py:c.py, gl:gl, gcx:gl.x + gl.w/2, gcy:gl.y + gl.h/2};
    g.sEnd = Math.max(vw / gl.w, vh / gl.h);
    var needW = Math.max(gl.w, vw / g.sEnd), needH = Math.max(gl.h, vh / g.sEnd);
    var bw = Math.max(needW, needH * 16 / 9), bh = bw * 9 / 16;
    if (bh < needH) { bh = needH; bw = bh * 16 / 9; }
    g.box = {w:bw, h:bh, x:(gl.w - bw)/2, y:(gl.h - bh)/2};
    return g;
  }

  /* ================================================================== 01 HERO v11 — the reel IS the hero
     The CI × Ryan Hughes reel (Instagram DajISPfwHmc, 8 Jul 2026, 1916×1078 · 60 fps · 21.1 s) plays full-bleed.
     Everything the client asked for — drone orbit of One Bennett at blue hour, the light trace drawing the frame
     round the window, /CI · DESIGN+BUILD, through the glass, the zoom into the bar — is the footage itself.
     Our layer: preloader (coords · city · counter) while it buffers, SKIP, then the UI blur-in at 5.75 s
     (the reel's own zoom-blur cut into the bar). The timeline is driven by video.currentTime, not a clock. */
  var vid=$('reel'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), cue=$('cue'), index=$('index'), row=$('row'),
      cur=$('cur'), hero=$('hero'), heroIn=qs('.hero-in'), heroTitle=$('title'), stroke=$('stroke'), veil=$('veil'), dark=$('dark');
  var T = { skipIn:.6, ui:5.75 };                      // seconds of reel time
  var state = {done:false, skipped:false, playing:false, t:0};
  var mx = 0, my = 0, pmx = 0, pmy = 0;
  var repeat = false; try { repeat = sessionStorage.getItem('ci-intro-v6') === '1'; } catch(e){}

  /* ---------- source: original VP9 (remuxed, no re-encode) where it plays, H.264 elsewhere, 720p on small screens */
  (function pickSource(){
    var big = Math.min(window.innerWidth, window.innerHeight) >= 520;   // phones get the 720p30 cut (6.5 MB), everything else the 1080p60
    var vp9 = !!vid.canPlayType && vid.canPlayType('video/webm; codecs="vp9"') === 'probably';
    var src = !big ? 'assets/reel/reel_720.mp4' : (vp9 ? 'assets/reel/reel_1080.webm' : 'assets/reel/reel_1080.mp4');
    var s = document.createElement('source'); s.src = src; s.type = /webm/.test(src) ? 'video/webm' : 'video/mp4';
    vid.appendChild(s);
    if (!vp9 || !big) { var s2 = document.createElement('source'); s2.src = big ? 'assets/reel/reel_1080.mp4' : 'assets/reel/reel_720.mp4'; s2.type = 'video/mp4'; if (s2.src !== s.src) vid.appendChild(s2); }
    vid.load();
  })();

  /* ---------- preloader: counter follows the buffer, never stalls, finishes when the reel can play (max 4 s) */
  var pre0 = performance.now(), preDone = false, canPlay = false, shown = 0;
  function markReady(){ canPlay = true; }
  vid.addEventListener('canplay', markReady); vid.addEventListener('canplaythrough', markReady); vid.addEventListener('loadeddata', function(){ if (vid.readyState >= 3) canPlay = true; });
  function buffered(){ try { if (vid.buffered.length && vid.duration) return vid.buffered.end(vid.buffered.length - 1) / Math.min(vid.duration, 7); } catch(e){} return 0; }
  function preTick(now){
    if (preDone) return;
    var el = (now - pre0) / 1000;
    var target = Math.max(Math.min(.9, el / 1.6) , Math.min(1, buffered()));
    if (canPlay || vid.readyState >= 3 || el > 4 || repeat && el > .4) target = 1;
    shown += (target * 100 - shown) * .16; if (target >= 1 && shown > 98.5) shown = 100;
    cnt.textContent = (shown < 10 ? '0' : '') + Math.round(shown);
    if (shown >= 100) { preDone = true; startReel(); return; }
    requestAnimationFrame(preTick);
  }
  requestAnimationFrame(preTick);

  /* ---------- play */
  var raf = null;
  function startReel(){
    pre.classList.add('out'); veil.classList.add('off');
    var p = vid.play(); if (p && p.catch) p.catch(function(){ /* autoplay refused: poster stays, UI comes in anyway */ setTimeout(finish, 600); });
    state.playing = true;
    raf = requestAnimationFrame(tick);
  }
  function tick(){
    var t = vid.currentTime || 0; state.t = t;
    if (!state.done) {
      skip.classList.toggle('on', t > T.skipIn);
      if (t >= T.ui) finish();
    }
    pmx += (mx - pmx) * .05; pmy += (my - pmy) * .05;
    if (state.done && !coarse) vid.style.transform = 'translate3d(' + (pmx * -10).toFixed(1) + 'px,' + (pmy * -6).toFixed(1) + 'px,0) scale(' + (1.02 + scrollZoom).toFixed(3) + ')';
    raf = requestAnimationFrame(tick);
  }
  function finish(){
    if (state.done) return; state.done = true;
    hero.classList.add('ui'); document.body.classList.add('ready'); document.body.classList.remove('is-intro');
    heroTitle.classList.add('in');
    skip.classList.remove('on'); skip.style.pointerEvents = 'none';
    try { sessionStorage.setItem('ci-intro-v6', '1'); } catch(e){}
    startScroll();
  }
  function skipIntro(){
    if (state.done || state.skipped) return; state.skipped = true;
    if (!preDone) { preDone = true; startReel(); }
    try { vid.currentTime = T.ui + .05; } catch(e){}
    finish();
  }
  skip.addEventListener('click', skipIntro);
  window.addEventListener('keydown', function(e){ if (!state.done && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipIntro(); } });
  if (reduced) { vid.removeAttribute('autoplay'); }

  /* ---------- cursor + mouse */
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var cx = 0, cy = 0, tx = 0, ty = 0, curLab = qs('.cl', cur), scrollZoom = 0;
  window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5); });
  (function curLoop(){ cx += (tx - cx) * .6; cy += (ty - cy) * .6; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(curLoop); })();
  document.addEventListener('pointerover', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw'); if (t) cur.classList.add('link'); });
  document.addEventListener('pointerout', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw'); if (t) cur.classList.remove('link'); });
  window.addEventListener('resize', function(){ onResize(); });
  /* hero on scroll: the reel dims and zooms a touch, the text layer lifts away */
  function heroScroll(hy, vh){
    var p = clamp01(hy / vh);
    scrollZoom = p * .08;
    dark.style.opacity = p * .8;
    heroIn.style.opacity = 1 - clamp01(p * 1.4); heroIn.style.transform = 'translateY(' + (hy * .12) + 'px)';
  }

  /* ================================================================== YODEZEEN text reveal
     measured on yodezeen.com: every character is its own inline span (opacity 0 → 1, expo-out);
     inside a word the LAST character starts first (reversed stagger, ~7 px of scroll per char),
     each word starts at its own offset; the whole thing is scrubbed by scroll (reversible).
     Here: progress p in [0,1] (scroll or time) → per-char opacity. */
  function yodeHash(i){ var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function yodeSplit(el){
    var words = [];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'yw'; var cs = [];
            for (var i = 0; i < p.length; i++) { var c = document.createElement('span'); c.className = 'yc'; c.textContent = p[i]; w.appendChild(c); cs.push(c); }
            words.push(cs); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    var chars = [], wi = 0, STEP = .028, D = .42;
    words.forEach(function(cs){ var base = yodeHash(wi++ + el._yseed) * .45; cs.forEach(function(c, i){ chars.push({el:c, off:base + (cs.length - 1 - i) * STEP}); }); });
    var S = 0; chars.forEach(function(c){ if (c.off > S) S = c.off; }); S += D;
    el._yode = {chars:chars, S:S, D:D, last:-1};
    el.classList.add('split');
  }
  function yodeSet(el, p){
    var y = el._yode; if (!y) return;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    if (p === y.last) return; y.last = p;
    var ps = p * y.S, cs = y.chars;
    for (var i = 0; i < cs.length; i++) {
      var q = (ps - cs[i].off) / y.D; q = q < 0 ? 0 : q > 1 ? 1 : q;
      cs[i].el.style.opacity = q >= 1 ? 1 : (1 - Math.pow(2, -10 * q)).toFixed(3);
    }
    if (p >= 1) el.classList.add('yd'); else el.classList.remove('yd');
  }
  var yodeSeed = 0;
  qsa('.yode').forEach(function(el){ el._yseed = (yodeSeed += 7); yodeSplit(el); });
  var yodeScroll = qsa('.yode').filter(function(el){ return el.id !== 'title'; });
  function updateYode(vh){
    for (var i = 0; i < yodeScroll.length; i++) {
      var el = yodeScroll[i], r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      yodeSet(el, (vh * .9 - r.top) / (vh * .26));
    }
  }

  /* ================================================================== text splitting (chars / words) */
  function splitNode(node, mode, st){
    // mode 'chars' → words of chars; 'words' → words only. Keeps <br> and inline elements (recurses).
    var kids = Array.prototype.slice.call(node.childNodes);
    kids.forEach(function(n){
      if (n.nodeType === 3) {
        var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          if (mode === 'chars') {
            for (var i = 0; i < p.length; i++) {
              var c = document.createElement('span'); c.className = 'ch'; c.textContent = p[i];
              var o = (Math.sin(st.i * 12.9898 + 78.233) * 43758.5453); o = o - Math.floor(o);
              c.style.setProperty('--o', Math.round((o * 2 - 1) * 70) + 'px');
              c.style.transitionDelay = (st.i * 22) + 'ms'; st.i++; w.appendChild(c);
            }
          } else { w.textContent = p; st.i++; }
          frag.appendChild(w);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') splitNode(n, mode, st);
    });
  }
  qsa('.chars').forEach(function(el){ splitNode(el, 'chars', {i:0}); });
  qsa('.read').forEach(function(el){ splitNode(el, 'words', {i:0}); });
  var reads = qsa('.read').map(function(el){ return {el: el, w: qsa('.w', el), n: -1}; });
  function updateReads(vh){
    reads.forEach(function(r){
      var rc = r.el.getBoundingClientRect(); if (rc.bottom < 0 || rc.top > vh) return;
      var p = clamp01((vh * .78 - rc.top) / (rc.height + vh * .18));
      var n = Math.round(p * r.w.length);
      if (n !== r.n) { r.n = n; for (var i = 0; i < r.w.length; i++) r.w[i].classList.toggle('on', i < n); }
    });
  }

  /* ================================================================== parallax images */
  var pxs = qsa('.px').map(function(el){ return {el: el, img: el.querySelector('img'), imgs: qsa('img', el)}; });
  function updatePx(vh){
    for (var i = 0; i < pxs.length; i++) {
      var r = pxs[i].el.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) continue;
      var c = (r.top + r.height / 2 - vh / 2) / vh;     // -0.5 … 0.5
      var py = Math.round(c * -0.12 * r.height);
      for (var k = 0; k < pxs[i].imgs.length; k++) pxs[i].imgs[k].style.setProperty('--py', py + 'px');
    }
  }

  /* ================================================================== chapter bar */
  var chap = $('chap'), chapLinks = qsa('a', chap), chapSecs = chapLinks.map(function(a){ return $(a.getAttribute('data-ch')); }), chapOn = -1;
  function updateChap(y, vh){
    if (!chap) return;
    chap.classList.toggle('show', state.done && y > vh * .7);
    var idx = 0, tops = chapSecs.map(function(s){ return s.getBoundingClientRect().top + y; });
    for (var i = 0; i < tops.length; i++) if (y + vh * .5 >= tops[i]) idx = i;
    var next = idx + 1 < tops.length ? tops[idx + 1] : document.documentElement.scrollHeight - vh;
    var p = clamp01((y - tops[idx]) / Math.max(1, next - tops[idx]));
    if (idx !== chapOn) { chapOn = idx; chapLinks.forEach(function(a, k){ a.classList.toggle('on', k === idx); }); }
    chapLinks[idx].querySelector('i').style.transform = 'scaleX(' + p + ')';
    chap.classList.toggle('light', !!hdrTheme);
  }

  /* ================================================================== smooth wheel scroll (lerp) */
  var sm = {t: 0, c: 0, on: false, ours: false};
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!reduced && !coarse) {
    window.addEventListener('wheel', function(e){
      if (!state.done || e.ctrlKey) return;
      e.preventDefault();
      var d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      d = Math.max(-140, Math.min(140, d));
      if (!sm.on) { sm.on = true; sm.c = sm.t = window.scrollY; }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      sm.t = Math.max(0, Math.min(max, sm.t + d * 1.15));
    }, {passive: false});
    window.addEventListener('scroll', function(){ if (!sm.on || Math.abs(window.scrollY - sm.c) > 2) { sm.c = sm.t = window.scrollY; sm.on = false; } });
  }
  function smoothStep(){
    if (!sm.on) return;
    var diff = sm.t - sm.c;
    if (Math.abs(diff) < .3) { sm.on = false; return; }
    sm.c += diff * .11; sm.c = Math.round(sm.c * 100) / 100; window.scrollTo(0, sm.c); sm.c = window.scrollY;
  }
  function smoothTo(y){ if (reduced || coarse) { window.scrollTo(0, y); return; } sm.on = true; sm.c = window.scrollY; sm.t = y; }

  /* ================================================================== reveals (IntersectionObserver) */
  var num20 = $('num20'), num20Done = false;
  function countTo(el, to, ms, suffix){
    var s = performance.now();
    (function f(now){ var p = E.out(clamp01((now - s) / ms)); el.textContent = Math.round(to * p) + (suffix || ''); if (p < 1) requestAnimationFrame(f); })(s);
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); io.unobserve(en.target);
      if (en.target.classList.contains('px')) setTimeout(function(){ en.target.classList.add('st'); }, 1800);
      if (en.target.id === 'stat20' && !num20Done) { num20Done = true; countTo(num20, 20, 1400); }
    });
  }, {threshold: .12, rootMargin: '0px 0px -6% 0px'});
  qsa('.rv, .lines, .wipe, .img-rv, .chars, .bi').forEach(function(el){ if (el.id !== 'title') io.observe(el); });

  /* ================================================================== anchors */
  qsa('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href').slice(1); if (!id) { e.preventDefault(); return; }
      var el = $(id); if (!el) return; e.preventDefault();
      smoothTo(el.getBoundingClientRect().top + window.scrollY);
    });
  });

  /* ================================================================== 03 PHILOSOPHY — the 24h dial */
  var dialSvg = $('dialSvg'), dialNum = $('dialNum'), dialTicks = [], dialArc, dialState = -1, philCols = qs('.phil .dial-row');
  (function buildDial(){
    if (!dialSvg) return;
    var NS = 'http://www.w3.org/2000/svg', N = 96, cxp = 260, cyp = 260, r = 240;
    var ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', cxp); ring.setAttribute('cy', cyp); ring.setAttribute('r', 214);
    ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', 'rgba(241,239,233,.14)'); ring.setAttribute('stroke-width', '1'); dialSvg.appendChild(ring);
    dialArc = document.createElementNS(NS, 'circle'); dialArc.setAttribute('cx', cxp); dialArc.setAttribute('cy', cyp); dialArc.setAttribute('r', 214);
    dialArc.setAttribute('fill', 'none'); dialArc.setAttribute('stroke', '#96A9BF'); dialArc.setAttribute('stroke-width', '1.5');
    var C = 2 * Math.PI * 214; dialArc.setAttribute('stroke-dasharray', C); dialArc.setAttribute('stroke-dashoffset', C); dialArc.setAttribute('transform', 'rotate(-90 260 260)'); dialSvg.appendChild(dialArc);
    dialArc._C = C;
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2 - Math.PI / 2, big = i % 8 === 0, len = big ? 22 : 12;
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', cxp + Math.cos(a) * (r - len)); l.setAttribute('y1', cyp + Math.sin(a) * (r - len));
      l.setAttribute('x2', cxp + Math.cos(a) * r); l.setAttribute('y2', cyp + Math.sin(a) * r);
      l.setAttribute('class', 'tk' + (big ? ' h' : '')); dialSvg.appendChild(l); dialTicks.push(l);
    }
  })();
  function updateDial(vh){
    if (!philCols) return;
    var r = philCols.getBoundingClientRect();
    var p = E.out(clamp01((vh * .9 - r.top) / (vh * .8)));
    var on = Math.round(72 * p);
    if (on !== dialState) {
      dialState = on;
      for (var i = 0; i < dialTicks.length; i++) dialTicks[i].classList.toggle('on', i < on);
      dialNum.textContent = Math.round(75 * p);
      dialArc.setAttribute('stroke-dashoffset', dialArc._C * (1 - .75 * p));
    }
  }

  /* ================================================================== 04 ABOUT — fragments → one roof */
  var diagram = $('diagram'), aboutPin = $('aboutPin'), aboutStages = qsa('#aboutStages > div'), aboutCounter = $('aboutCounter');
  var CHIPS = ['Architecture','Interior Design','Construction','Furnishings','Art','Wellness','Procurement','Installation','Project Management'];
  var SCAT = [[.14,.16],[.78,.1],[.44,.3],[.88,.48],[.2,.56],[.6,.54],[.1,.86],[.5,.9],[.84,.84]];
  var LINKS = [[0,2],[1,3],[2,5],[4,6],[5,8],[3,8],[4,2],[6,7],[1,5]];
  var chips = [], links = [], aboutStage = -1;
  (function buildDiagram(){
    if (!diagram) return;
    LINKS.forEach(function(pr){ var l = document.createElement('div'); l.className = 'link'; l.style.background = 'repeating-linear-gradient(90deg, rgba(17,17,17,.35) 0 9px, transparent 9px 15px)'; diagram.appendChild(l); links.push(l); });
    CHIPS.forEach(function(n, i){ var c = document.createElement('div'); c.className = 'chip meta'; c.innerHTML = '<span class="mono">0' + (i+1) + '</span>' + n; diagram.appendChild(c); chips.push(c); });
  })();
  function updateAbout(vh, now){
    if (!diagram) return;
    var r = aboutPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var W = diagram.clientWidth, H = diagram.clientHeight;
    var g = seg(p, .28, .68, E.expo), lk = 1 - seg(p, .22, .42, E.out);
    var pts = [];
    for (var i = 0; i < chips.length; i++) {
      var sx = SCAT[i][0] * W, sy = SCAT[i][1] * H;
      var jx = Math.sin(now / 900 + i * 1.7) * 5 * (1 - g), jy = Math.cos(now / 1100 + i * 2.3) * 5 * (1 - g);
      var NC = W < 600 ? 2 : 3, NR = Math.ceil(chips.length / NC), col = i % NC, rw = Math.floor(i / NC);
      var gx = (.08 + (col + .5) * (.84 / NC)) * W, gy = (.12 + (rw + .5) * (.74 / NR)) * H;
      var x = lerp(sx, gx, g) + jx, y = lerp(sy, gy, g) + jy;
      pts.push([x, y]);
      chips[i].style.transform = 'translate(' + (x) + 'px,' + (y) + 'px) translate(-50%,-50%)';
    }
    for (var j = 0; j < links.length; j++) {
      var a = pts[LINKS[j][0]], b = pts[LINKS[j][1]], dx = b[0]-a[0], dy = b[1]-a[1], len = Math.sqrt(dx*dx+dy*dy), ang = Math.atan2(dy, dx);
      links[j].style.transform = 'translate(' + a[0] + 'px,' + a[1] + 'px) rotate(' + ang + 'rad)'; links[j].style.width = len + 'px'; links[j].style.opacity = lk;
    }
    diagram.classList.toggle('one', p > .66);
    var st = p < .33 ? 0 : p < .66 ? 1 : 2;
    if (st !== aboutStage) {
      aboutStage = st; aboutStages.forEach(function(d, i){ d.classList.toggle('on', i === st); });
      aboutCounter.textContent = st < 2 ? 'ARCHITECTS · DESIGNERS · CONTRACTORS · VENDORS · INSTALLERS' : 'UNDER ONE ROOF · ONE TEAM';
    }
  }

  /* ================================================================== 05 PROJECTS — drag carousel */
  (function carousel(){
    var wrap = $('projWrap'), track = $('projTrack'), idxEl = $('projIdx'), bar = $('projBar');
    if (!wrap) return;
    var cards = qsa('.card', track), i = 0, x = 0, startX = 0, startTX = 0, dragging = false, moved = 0, lastX = 0, vel = 0;
    function maxShift(){ return Math.max(0, track.scrollWidth - wrap.clientWidth + M()*2 - M()*2); }
    function goTo(n, instant){
      i = Math.max(0, Math.min(cards.length - 1, n));
      x = -Math.min(cards[i].offsetLeft, maxShift());
      track.classList.toggle('dragging', !!instant);
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      idxEl.textContent = (i < 9 ? '0' : '') + (i + 1);
      bar.style.transform = 'translateX(' + (i * 100) + '%)';
    }
    $('projPrev').addEventListener('click', function(){ goTo(i - 1); });
    $('projNext').addEventListener('click', function(){ goTo(i + 1); });
    wrap.addEventListener('pointerenter', function(){ cur.classList.add('drag'); curLab.textContent = 'DRAG'; });
    wrap.addEventListener('pointerleave', function(){ cur.classList.remove('drag'); });
    wrap.addEventListener('pointerdown', function(e){ dragging = true; moved = 0; startX = lastX = e.clientX; startTX = x; vel = 0; wrap.setPointerCapture(e.pointerId); track.classList.add('dragging'); });
    wrap.addEventListener('pointermove', function(e){ if (!dragging) return; var dx = e.clientX - startX; vel = e.clientX - lastX; lastX = e.clientX; moved = Math.abs(dx); var nx = Math.max(-maxShift() - 80, Math.min(80, startTX + dx)); track.style.transform = 'translate3d(' + nx + 'px,0,0)'; x = nx; });
    function end(e){ if (!dragging) return; dragging = false; track.classList.remove('dragging');
      var dx = x - startTX; var n = i;
      if (dx < -60 || vel < -6) n = i + 1; else if (dx > 60 || vel > 6) n = i - 1;
      goTo(n); }
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
    qsa('a', wrap).forEach(function(a){ a.addEventListener('click', function(e){ if (moved > 6) e.preventDefault(); }); });
    window.addEventListener('resize', function(){ goTo(i, true); requestAnimationFrame(function(){ track.classList.remove('dragging'); }); });
    goTo(0, true); requestAnimationFrame(function(){ track.classList.remove('dragging'); });
  })();

  /* ================================================================== 06 DIFFERENCE — floating image */
  (function diff(){
    var list = $('diffList'), fl = $('diffFloat'), cl = $('diffCl'); if (!list) return;
    var imgs = qsa('img', fl), fx = 0, fy = 0, gx = 0, gy = 0, on = false;
    list.addEventListener('pointermove', function(e){ gx = e.clientX; gy = e.clientY; });
    qsa('.item', list).forEach(function(it, i){
      it.addEventListener('pointerenter', function(){ on = true; fl.classList.add('on'); imgs.forEach(function(im){ im.classList.toggle('on', im.getAttribute('data-k') === it.getAttribute('data-img')); }); cl.textContent = '0' + (i + 1); });
    });
    list.addEventListener('pointerleave', function(){ on = false; fl.classList.remove('on'); });
    (function loop(){ if (on || fl.classList.contains('on')) { fx += (gx - fx) * .14; fy += (gy - fy) * .14; fl.style.left = fx + 'px'; fl.style.top = fy + 'px'; } else { fx = gx; fy = gy; } requestAnimationFrame(loop); })();
  })();

  /* ================================================================== 07 SUITE — stacked layers */
  (function suite(){
    var stack = $('stack'), tabs = qsa('#suiteTabs .tab'), descs = qsa('#suiteDesc > div'), sw = $('wellSw'), cntB = $('layerCnt'); if (!stack) return;
    var ORDER = ['Architecture','Interior Design','Construction','Furnishings','Art','Styling','Wellness','Installation','Move-In','CI Wellness'];
    var SETS = {
      turnkey: ['Architecture','Interior Design','Construction','Furnishings','Art','Wellness','Installation','Move-In'],
      core: ['Architecture','Interior Design','Construction'],
      curated: ['Architecture','Interior Design','Construction','Furnishings','Art','Styling']
    };
    var layers = {}, cur = 'turnkey', well = false, STEP = 60;
    ORDER.forEach(function(n){ var l = document.createElement('div'); l.className = 'layer meta'; l.innerHTML = '<span>' + n + '</span><span class="mono"></span>'; stack.appendChild(l); layers[n] = l; });
    function apply(){
      var vis = SETS[cur].slice(), addAmber = null;
      if (well) { if (vis.indexOf('Wellness') >= 0) addAmber = 'Wellness'; else { vis.push('CI Wellness'); addAmber = 'CI Wellness'; } }
      var N = vis.length;
      stack.style.minHeight = Math.max(360, N * STEP + 80) + 'px';
      ORDER.forEach(function(n){
        var l = layers[n], pos = vis.indexOf(n);
        if (pos < 0) { l.classList.remove('on', 'add'); l.style.transitionDelay = '0s'; return; }
        l.style.bottom = (pos * STEP) + 'px'; l.style.left = (pos * 10) + 'px';
        l.style.transitionDelay = (pos * 45) + 'ms';
        l.querySelector('.mono').textContent = (pos < 9 ? '0' : '') + (pos + 1);
        l.classList.add('on'); l.classList.toggle('add', n === addAmber);
      });
      cntB.textContent = N;
      tabs.forEach(function(t){ t.classList.toggle('on', t.getAttribute('data-k') === cur); });
      descs.forEach(function(d){ d.classList.toggle('on', d.getAttribute('data-k') === cur); });
    }
    tabs.forEach(function(t){ t.addEventListener('click', function(){ cur = t.getAttribute('data-k'); apply(); }); });
    sw.addEventListener('click', function(){ well = !well; sw.classList.toggle('on', well); sw.setAttribute('aria-pressed', well); apply(); });
    apply();
  })();

  /* ================================================================== 08 APPROACH — questions type themselves */
  var qmark = $('qmark'), apprPin = $('apprPin'), apprQ = qsa('#qs .q'), apprDone = $('apprDone'), apprRail = qsa('#apprRail i'), apprBg = qs('.appr .bg'), apprImgs = qsa('#apprBg img'), apprCur = -1;
  function updateAppr(vh){
    if (!apprPin) return;
    var r = apprPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var S = .158;
    for (var i = 0; i < apprQ.length; i++) {
      var q = apprQ[i], tx = q.querySelector('.tx'), full = tx.getAttribute('data-t');
      var lp = (p - i * S) / S;
      if (lp < 0 || lp >= 1) { q.style.opacity = 0; q.classList.remove('typing'); tx.textContent = lp >= 1 ? full : ''; continue; }
      var typed = clamp01(lp / .55), n = Math.ceil(full.length * typed);
      tx.textContent = full.slice(0, n);
      q.classList.toggle('typing', typed < 1);
      var op = seg(lp, 0, .06, E.out) * (1 - seg(lp, .86, 1, E.out));
      q.style.opacity = op; q.style.transform = 'translateY(' + (-50 + (-24 * seg(lp, .86, 1, E.out))) + '%)';
      apprRail.forEach(function(t, k){ t.classList.toggle('on', k <= i); });
    }
    var dp = seg(p, .8, .9, E.out);
    apprDone.style.opacity = dp; apprDone.style.transform = 'translateY(' + (-50 + 6 * (1 - dp)) + '%)';
    if (dp > 0) apprRail.forEach(function(t){ t.classList.add('on'); });
    if (apprBg) apprBg.style.transform = 'scale(' + (1.12 - .12 * p) + ')';
    var qi = Math.min(apprImgs.length - 1, Math.max(0, Math.floor(p / S))); if (qi !== apprCur) { apprCur = qi; apprImgs.forEach(function(im, k){ im.classList.toggle('on', k === qi); }); }
    if (qmark) qmark.style.transform = 'translateY(' + (-52 + (p - .5) * 30) + '%) translateX(' + ((tx / window.innerWidth - .5) * -40) + 'px) rotate(' + ((p - .5) * 10) + 'deg)';
  }

  /* ================================================================== 09 PROCESS — the line straightens */
  var procPin = $('procPin'), procRail = $('procRail'), procSteps = qsa('#procRail .step'), procPath = $('procPath'), procBar = $('procBar'), procIdx = $('procIdx');
  var JIT = []; for (var z = 0; z < 28; z++) { var f = Math.sin(z * 12.9898 + 4.1) * 43758.5453; f = f - Math.floor(f); JIT.push((f * 2 - 1) * 46); }
  var procActive = -1, procLastP = -1, procImgs = qsa('#procPic img'), procPicLab = $('procPicLab'), PROC_NAMES = ['DISCOVER','DEFINE','DESIGN','BUILD','CURATE','DELIVER'];
  function updateProc(vh){
    if (!procPin) return;
    var r = procPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var m = M(), railW = procRail.scrollWidth, maxS = Math.max(0, railW - (window.innerWidth - m * 2));
    var sp = seg(p, .04, .96, E.lin);
    procRail.style.transform = 'translate3d(' + (-maxS * sp) + 'px,0,0)';
    var act = Math.min(5, Math.floor(sp * 6.2));
    if (act !== procActive) { procActive = act; procSteps.forEach(function(s, i){ s.classList.toggle('on', i <= act); }); procIdx.textContent = '0' + (act + 1) + ' / 06'; procImgs.forEach(function(im, i){ im.classList.toggle('on', i === act); }); if (procPicLab) procPicLab.textContent = '0' + (act + 1) + ' / ' + PROC_NAMES[act]; }
    procBar.style.width = (p * 100) + '%';
    var st = E.out(clamp01((p - .02) / .9));
    if (Math.abs(st - procLastP) > .002) {
      procLastP = st;
      var pts = [], n = JIT.length;
      for (var i = 0; i < n; i++) pts.push([i * (1000 / (n - 1)), 60 + JIT[i] * (1 - st)]);
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var k = 1; k < n - 1; k++) { var mx = (pts[k][0] + pts[k+1][0]) / 2, my = (pts[k][1] + pts[k+1][1]) / 2; d += ' Q' + pts[k][0] + ' ' + pts[k][1] + ' ' + mx + ' ' + my; }
      d += ' L' + pts[n-1][0] + ' ' + pts[n-1][1];
      procPath.setAttribute('d', d);
    }
  }

  /* ================================================================== 12 FAQ */
  qsa('#faqList .qa').forEach(function(qa){
    qa.querySelector('.qh').addEventListener('click', function(){
      var open = qa.classList.contains('open');
      qsa('#faqList .qa.open').forEach(function(o){ o.classList.remove('open'); o.querySelector('.qh').setAttribute('aria-expanded', 'false'); });
      if (!open) { qa.classList.add('open'); qa.querySelector('.qh').setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ================================================================== 13 CTA — back into the window */
  var ctaPin = $('ctaPin'), plate2 = $('plate2'), glass2 = $('glass2'), glow2 = $('glow2'), ctaVeil = $('ctaVeil'), ctaTx = $('ctaTx'), ctaIdx = $('ctaIdx'), glass2Img = qs('img', glass2), C2 = {};
  function layoutCta(){
    if (!ctaPin) return;
    var vw = window.innerWidth, vh = window.innerHeight; C2 = plateGeom(vw, vh);
    plate2.style.transform = 'translate(' + C2.px + 'px,' + C2.py + 'px) scale(' + C2.s + ')';
    glow2.style.left = (P.glass.x - 2) + 'px'; glow2.style.top = (P.glass.y - 2) + 'px'; glow2.style.width = (P.glass.w + 4) + 'px'; glow2.style.height = (P.glass.h + 4) + 'px';
    glass2.style.left = C2.gl.x + 'px'; glass2.style.top = C2.gl.y + 'px'; glass2.style.width = C2.gl.w + 'px'; glass2.style.height = C2.gl.h + 'px';
    glass2Img.style.width = C2.box.w + 'px'; glass2Img.style.height = C2.box.h + 'px'; glass2Img.style.left = '50%'; glass2Img.style.top = '50%';
  }
  function updateCta(vh){
    if (!ctaPin) return;
    var r = ctaPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var k = seg(p, .04, .72, E.expo);
    var sc = lerp(C2.sEnd * 1.06, 1, k);
    glass2.style.transform = 'scale(' + sc + ')';
    glass2Img.style.transform = 'translate(-50%,-50%) scale(' + lerp(1, 1.15, k) + ')';
    plate2.style.filter = 'blur(' + (5 * (1 - seg(p, .3, .72, E.out))) + 'px)';
    var on = seg(p, .6, .85, E.out);
    glow2.style.opacity = on;
    ctaVeil.style.opacity = seg(p, .5, .85, E.out) * .9;
    var tp = seg(p, .62, .9, E.out);
    ctaTx.style.opacity = tp; ctaTx.style.transform = 'translateY(' + (16 * (1 - tp)) + 'px)';
    ctaIdx.style.opacity = tp;
  }

  /* ================================================================== brand: "NN/" indexes + blurred ghost titles */
  qsa('.sec-idx > span, .index > span, .cta .idx > span').forEach(function(sp){ var m = /^(\d\d) — \d\d$/.exec(sp.textContent.trim()); if (m) { sp.textContent = m[1] + '/'; sp.classList.add('n'); } });
  qsa('.mega').forEach(function(el){ var g = document.createElement('div'); g.className = 'ghost-blur mega'; g.setAttribute('aria-hidden', 'true'); g.innerHTML = el.innerHTML.replace(/<span class="(?:ch|yc|yw)"[^>]*>/g, '<span>'); g.style.font = getComputedStyle(el).font; g.style.left = el.offsetLeft + 'px'; g.style.top = el.offsetTop + 'px'; g.style.width = el.offsetWidth + 'px'; el.parentNode.insertBefore(g, el); });

  /* ================================================================== footer wordmark fit */
  var wmk = $('wmk');
  function fitWmk(){ if (!wmk) return; wmk.style.fontSize = '100px'; var w = wmk.scrollWidth, cw = wmk.parentNode.clientWidth - M()*2; wmk.style.fontSize = (100 * cw / w * .995) + 'px'; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWmk); fitWmk();


  /* ================================================================== glass: fluted panels slide off with scroll; glass bar parallax */
  var flutes = qsa('.flute.sl'), gbar = $('gbar'), gbarHost = gbar ? gbar.parentNode : null;
  function updateGlass(vh){
    for (var i = 0; i < flutes.length; i++) {
      var r = flutes[i].parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) continue;
      var p = E.out(clamp01((vh * .62 - r.top) / (vh * .45)));
      flutes[i].style.setProperty('--fx', (p * (flutes[i].classList.contains('edge-l') ? -102 : 102)).toFixed(1) + '%');
    }
    if (gbar) { var g = gbarHost.getBoundingClientRect(); if (g.bottom > 0 && g.top < vh) { var c = (g.top + g.height / 2 - vh / 2) / vh; gbar.style.setProperty('--gy', (c * -.42 * g.height).toFixed(1) + 'px'); } }
  }
  /* ================================================================== header theme */
  var hdrTheme = null;
  function updateHdr(){
    var x = Math.round(window.innerWidth / 2), y = Math.round(parseFloat(getComputedStyle(hdr).height) / 2) + 1;
    var els = document.elementsFromPoint(x, y), dark = true;
    for (var i = 0; i < els.length; i++) { var el = els[i]; if (hdr.contains(el) || el === cur || cur.contains(el)) continue; var s = el.closest('.sec,.hero,.appr,.cta,.ftr'); if (s) { dark = s.classList.contains('dark') || !s.classList.contains('sec'); } break; }
    dark = true; if (dark !== hdrTheme) { hdrTheme = dark; hdr.classList.toggle('on-light', !dark); }
  }

  /* ================================================================== scroll loop */
  var running = false, lastY = -1, lastVH = 0, lastHy = -1;
  function onResize(){ layoutCta(); fitWmk(); lastY = -1; }
  function startScroll(){ if (running) return; running = true; layoutCta(); requestAnimationFrame(loop); }
  function loop(now){
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    // hero parallax after the intro
    var hy = Math.min(y, vh);
    if (hy !== lastHy) { heroScroll(hy, vh); lastHy = hy; }
    smoothStep(); y = window.scrollY || window.pageYOffset;
    updateDial(vh); updateAbout(vh, now); updateAppr(vh); updateProc(vh); updateCta(vh); updateReads(vh); updatePx(vh); updateYode(vh); updateGlass(vh);
    if (y !== lastY || vh !== lastVH) { updateHdr(); updateChap(y, vh); }
    lastY = y; lastVH = vh;
    requestAnimationFrame(loop);
  }

  window.__intro = { vid: vid, T: T, finish: finish, state: state, seek: function(t){ try { vid.pause(); vid.currentTime = t; } catch(e){} if (!preDone) { preDone = true; pre.classList.add('out'); veil.classList.add('off'); } if (t >= T.ui) finish(); } };
})();
