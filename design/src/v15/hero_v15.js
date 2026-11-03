  /* ================================================================== 01 HERO v15 — the preloader by the user's Figma frames 13 → 15 → 16 → 14
     Picture = ChatGPT outpaint of the cover of CI's reel DajISPfwHmc (night limestone tower, Chicago skyline right), placed exactly
     as in Figma (image stretched to 2033×1477 at −57,−251 in a 1920×1080 frame; assets are that frame at 2×, 3840×2160):
       13  every window dark (the lit window covered by a dark window from two floors up, Figma rect 874,442 167×179)  → pre_dark_*.jpg
       15  the official CI DESIGN + BUILD logo (Figma rect 865,432 190×217) drawn clockwise over that window            → logo_db.png
       16  the logo goes, a warm outline draws round the window (Figma rect 877,448 163×164, 3 px #F8BD79, glow 8.6)     → svg .ol
       14  the window lights up: the original lit window with the couple (Figma frame 14)                                 → pre_litwin.jpg
     then we push into the window (zoom about the window centre) and land in room 1450_34 = slide 0 of the hero slider. ≤ 5 s. */
  var hero=$('hero'), heroIn=qs('.hero-ui'), heroTitle=$('title'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), veil=$('veil'), dark=$('dark'),
      cur=$('cur'), slidesEl=$('slides'), preview=$('preview');
  var st15=$('v15'), cam=$('v15cam'), facImg=$('v15fac'), win=$('v15win'), glass=$('v15glass'), litImg=$('v15lit'), roomImg=$('v15room'), spill=$('v15spill'), mark=$('v15mark'), ol=$('v15ol'), olPath=$('v15olp');
  var FAC  = {w:3840, h:2160, win:{x:1748, y:884, w:334, h:358}};          /* Figma frame ×2: the window patch (dark ↔ lit)          */
  var OL   = {x:1754, y:896, w:326, h:328, sw:6};                           /* Figma "Rectangle 11" ×2, stroke inside                  */
  var MARK = {x:1730, y:864, w:380, h:434};                                 /* Figma "CI DB LOGO FINAL-White" ×2                       */
  var ROOM = {w:2400, h:1729};
  var Z_END = 7.8;
  var T = {fadeIn:1.10, orbit:2.40, drift:3.05, logoA:.50, logoB:1.30, shineA:1.30, shineB:2.40, outA:2.50, outB:3.20, olA:2.62, olB:3.32, litA:3.32, litB:3.82, olOutA:3.95, olOutB:4.35,
           push:4.00, pushEnd:5.55, roomA:4.15, roomB:4.70, ui:5.30, end:5.80};
  /* WebGL 3D scene (js/pre3d.js, three.js) when the browser has WebGL2; the DOM layers below are the fallback */
  var GL = (function(){ try { var c = document.createElement('canvas'); return !!(window.WebGL2RenderingContext && c.getContext('webgl2')); } catch(e){ return false; } })();
  function gl3(){ return GL && window.__pre3d && window.__pre3d.state === 'ready'; }
  var G = {}, state = {t:0, done:false, skipped:false, phase:'pre'};
  var mx = 0, my = 0, pmx = 0, pmy = 0, scrollZoom = 0;
  var short = false; try { short = sessionStorage.getItem('ci-intro-v15') === '1'; } catch(e){}
  function sm15(x){ x = clamp01(x); return x * x * (3 - 2 * x); }
  function expo15(u){ u = clamp01(u); if (u === 0 || u === 1) return u; return u < .5 ? Math.pow(2, 20 * u - 10) / 2 : 1 - Math.pow(2, -20 * u + 10) / 2; }

  /* ---------- sources: pick sizes for the screen */
  function pickDom(){
    if (facImg.src) return;
    var px = Math.max(window.innerWidth, window.innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2);
    facImg.src = px > 2600 ? 'assets/v15/pre_dark_4k.jpg' : px > 1700 ? 'assets/v15/pre_dark_2k.jpg' : 'assets/v15/pre_dark_1k.jpg';
    roomImg.src = px > 1500 ? 'assets/v15/room_2k.jpg' : 'assets/v15/room_1k.jpg';
  }
  if (!GL) pickDom();
  var need = [facImg, litImg, roomImg, mark], loaded = 0;
  function isOk(im){ return im.complete && im.naturalWidth > 0; }
  need.forEach(function(im){ if (isOk(im)) loaded++; else { im.addEventListener('load', function(){ loaded++; }); im.addEventListener('error', function(){ loaded++; }); } });

  /* ---------- geometry */
  function place(el, r){ el.style.left = r.x + 'px'; el.style.top = r.y + 'px'; el.style.width = r.w + 'px'; el.style.height = r.h + 'px'; }
  function layout(){
    var vw = window.innerWidth, vh = window.innerHeight;
    var c = Math.max(vw / FAC.w, vh / FAC.h);                                 /* cover-fit, picture centred */
    G = {vw:vw, vh:vh, c:c};
    cam.style.width = FAC.w + 'px'; cam.style.height = FAC.h + 'px';
    var W = FAC.win; place(win, W); place(mark, MARK);
    place(ol, OL); ol.setAttribute('viewBox', '0 0 ' + OL.w + ' ' + OL.h);
    var h = OL.sw / 2, R = OL.w - h, B = OL.h - h, my2 = OL.h / 2;              /* clockwise from the right edge's middle (the logo's gap side) */
    olPath.setAttribute('d', 'M' + R + ' ' + my2 + 'V' + B + 'H' + h + 'V' + h + 'H' + R + 'V' + my2);
    G.gw = W.w; G.gh = W.h;
    G.wcx = W.x + W.w / 2; G.wcy = W.y + W.h / 2;                            /* zoom about the window centre */
    G.sEnd = Math.max(vw / ROOM.w, vh / ROOM.h) * 1.02;
    G.zEnd = Math.max(Z_END, Math.max(vw / (G.gw * c), vh / (G.gh * c)) * 1.06);
  }
  function zAt(t){
    if (t < T.push) return 1 + .03 * clamp01(t / T.drift);
    return 1.03 * Math.pow(G.zEnd / 1.03, expo15((t - T.push) / (T.pushEnd - T.push)));
  }
  function render(t){
    if (st15.classList.contains('gl')) {                                      /* the 3D scene draws everything (fade, logo, outline, light, fly-in) */
      window.__pre3d.render(t, T, pmx, pmy, scrollZoom); st15.style.opacity = 1;
      if (!state.done && t >= T.ui) uiOn();
      if (!state.done) skip.classList.toggle('on', t > .5 && t < T.ui);
      return;
    }
    var z = zAt(t) * (1 + scrollZoom), c = G.c, k = c * z;                    /* fac px → screen px */
    var sx = G.vw / 2 + (G.wcx - FAC.w / 2) * c, sy = G.vh / 2 + (G.wcy - FAC.h / 2) * c;   /* the window's screen position at z = 1 stays put */
    var tx = sx - G.wcx * k, ty = sy - G.wcy * k;
    cam.style.transform = 'translate3d(' + (tx + pmx * -10) + 'px,' + (ty + pmy * -8) + 'px,0) scale(' + k + ')';
    st15.style.opacity = sm15(t / T.fadeIn);
    /* 15 · the logo draws clockwise, then goes */
    var lp = sm15((t - T.logoA) / (T.logoB - T.logoA)), la = t < T.outA ? 1 : 1 - sm15((t - T.outA) / (T.outB - T.outA));
    mark.style.setProperty('--a', (lp * 360).toFixed(1) + 'deg'); mark.style.opacity = (lp > 0 ? la : 0);
    /* 16 · the warm outline draws clockwise round the window, stays through the lighting, fades as we push */
    var op = sm15((t - T.olA) / (T.olB - T.olA)), oa = 1 - sm15((t - T.olOutA) / (T.olOutB - T.olOutA));
    olPath.style.strokeDashoffset = (1 - op).toFixed(4); ol.style.opacity = op > 0 ? oa : 0;
    /* 14 · the window lights up (bloom), then the room takes over inside the glass during the push */
    var lit = sm15((t - T.litA) / (T.litB - T.litA)), bloom = 1 + .25 * Math.sin(Math.PI * clamp01((t - T.litA) / .8));
    var room = sm15((t - T.roomA) / (T.roomB - T.roomA)), passed = sm15((t - T.push) / .9);
    litImg.style.opacity = lit; litImg.style.filter = 'brightness(' + bloom.toFixed(3) + ')';
    roomImg.style.opacity = room;
    var zr = zAt(t), sOn = Math.max(G.sEnd * Math.pow(zr / G.zEnd, .88), Math.max(G.gw / ROOM.w, G.gh / ROOM.h) * c * zr * 1.12), sLoc = sOn / k * (1 + scrollZoom);
    roomImg.style.transform = 'translate(-50%,-50%) scale(' + sLoc + ')';
    spill.style.opacity = lit * bloom * (1 - .6 * passed) * .9;
    if (!state.done && t >= T.ui) uiOn();
    if (!state.done) skip.classList.toggle('on', t > .5 && t < T.ui);
  }

  /* ---------- preloader: waits for the 4 images (max 3 s; repeat visits .4 s) */
  var pre0 = performance.now(), preDone = false, shown = 0;
  function preTick(now){
    if (preDone) return;
    var el = (now - pre0) / 1000;
    if (GL && !gl3() && (el > 6 || (window.__pre3d && window.__pre3d.state === 'error'))) { GL = false; pickDom(); pre0 = now; el = 0; }
    var target;
    if (GL) { target = gl3() ? 1 : Math.min(.92, el / 2.2); }
    else {
      target = Math.max(Math.min(.9, el / 1.2), loaded / need.length * .95);
      if (loaded >= need.length || el > 3 || short && el > .4) target = 1;
    }
    shown += (target * 100 - shown) * .2; if (target >= 1 && shown > 98.5) shown = 100;
    cnt.textContent = (shown < 10 ? '0' : '') + Math.round(shown);
    if (shown >= 100) { preDone = true; startIntro(); return; }
    requestAnimationFrame(preTick);
  }
  requestAnimationFrame(preTick);

  var raf = null, t0 = null;
  function startIntro(){
    pre.classList.add('out'); veil.classList.add('off'); st15.classList.add('on');
    if (gl3()) st15.classList.add('gl');
    if (reduced) { finish(); return; }
    state.phase = 'intro'; t0 = performance.now(); state.t = 0; lastNow = null;
    raf = requestAnimationFrame(tick);
  }
  var lastNow = null;
  function tick(now){                                                       /* own clock: a slow first frame never makes the intro jump */
    if (lastNow === null) lastNow = now;
    var dt = Math.min((now - lastNow) / 1000, 1 / 30); lastNow = now;
    var t = state.t + dt;
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    state.t = t; render(t);
    if (t < T.end) raf = requestAnimationFrame(tick); else finish();
  }
  function uiOn(){
    if (hero.classList.contains('ui')) return;
    hero.classList.add('ui'); document.body.classList.add('ready'); document.body.classList.remove('is-intro'); heroTitle.classList.add('in');
    skip.classList.remove('on'); skip.style.pointerEvents = 'none';
  }
  function finish(){
    if (state.done) return; state.done = true; cancelAnimationFrame(raf);
    uiOn(); state.t = T.end + 1; render(T.end + 1);
    pre.style.display = 'none'; mark.style.display = 'none'; ol.style.display = 'none';
    try { sessionStorage.setItem('ci-intro-v15', '1'); } catch(e){}
    startScroll(); startSlider(); idleLoop();
  }
  function skipIntro(){
    if (state.done || state.skipped) return; state.skipped = true;
    if (!preDone) { preDone = true; pre.classList.add('out'); veil.classList.add('off'); st15.classList.add('on'); }
    cancelAnimationFrame(raf);
    var start = performance.now(), from = Math.max(state.t, T.litA);
    (function f(now){ var p = clamp01((now - start) / 900); var t = lerp(from, T.end, E.expo(p)); state.t = t; render(t); if (p < 1) requestAnimationFrame(f); else finish(); })(start);
  }
  function idleLoop(){ (function f(){ if (slide.cur === 0 && !tr && !loopOn && !ST.on && !document.hidden) { var dx = mx - pmx, dy = my - pmy; if (Math.abs(dx) + Math.abs(dy) > .0005) { pmx += dx * .06; pmy += dy * .06; render(T.end + 1); } } requestAnimationFrame(f); })(); }

  /* ================================================================== the hero slider (interiors): slide 0 = the room we entered */
  /* the five interiors the user picked on the Figma board "Hero — интерьеры (отбор)" (02.11, 18:07): professional photos */
  var HSZ = Math.max(window.innerWidth, window.innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2) > 1700 ? '_2560.jpg' : '_1600.jpg';
  var SL = [{k:'v15', dur:7, th:'assets/v15/room_1k.jpg'}].concat(['h1_city', 'h2_kitchen', 'h3_fireplace', 'h4_skyline', 'h5_double'].map(function(n){
    return {k:'img', src:'assets/hero/' + n + HSZ, bg:'assets/hero/' + n + '_bg' + HSZ, dep:'assets/hero/' + n + '_dep.png', th:'assets/hero/' + n + '_th.jpg', dur:6.5,
            sko:'assets/hero/' + n + '_sk.jpg', skb:'assets/hero/' + n + '_bg_sk.jpg'};
  }));
  var slide = {cur:0, timer:null, on:false, els:[], ready:false, start:[]};
  var pvImgs = preview ? qsa('.pv-img img', preview) : [];
  function buildSlides(){
    SL.forEach(function(s, i){
      if (s.k === 'img') { var im = document.createElement('img'); im.className = 'sl'; im.src = s.src; im.alt = ''; im.decoding = 'async'; slidesEl.appendChild(im); slide.els[i] = im; }
    });
  }
  /* WebGL: the slides change through a wave of fluted glass (js/pre3d.js slideFrame); DOM crossfade is the fallback */
  var GLS = false, tr = null, loopOn = false, TR_DUR = 2.6, heroOff = false;
  function ease3(u){ u = clamp01(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function kbOf(i, now){ return i === 0 ? 0 : clamp01((now - (slide.start[i] || now)) / ((SL[i].dur + TR_DUR) * 1000)); }
  function glFrame(a, b, p, now){ window.__pre3d.slideFrame({a:a - 1, b:b - 1, p:p, ka:kbOf(a, now), kb:kbOf(b, now), mx:pmx, my:pmy, scroll:scrollZoom, T:T}); }
  function glLoop(now){
    if (document.hidden || ST.on) { loopOn = false; return; }
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    if (tr) {
      var p = clamp01((now - tr.t0) / (TR_DUR * 1000));
      if (!heroOff) glFrame(tr.a, tr.b, ease3(p), now);
      if (p >= 1) tr = null;
    } else if (slide.cur !== 0) {
      if (!heroOff) glFrame(slide.cur, slide.cur, 0, now);
    } else { loopOn = false; render(T.end + 1); return; }      /* back in the 3D room: idleLoop redraws on mouse moves */
    requestAnimationFrame(glLoop);
  }
  function ensureLoop(){ if (loopOn) return; loopOn = true; requestAnimationFrame(glLoop); }
  function drawIdle(){ if (ST.on) return; if (GLS && (slide.cur !== 0 || tr)) { ensureLoop(); return; } render(T.end + 1); }
  function setPreview(){
    for (var j = 0; j < pvImgs.length; j++) { var s = SL[(slide.cur + 1 + j) % SL.length]; pvImgs[j].src = s.th; pvImgs[j].parentNode.setAttribute('data-i', (slide.cur + 1 + j) % SL.length); }
  }
  function showSlide(i){
    var prev = SL[slide.cur], next = SL[i];
    clearTimeout(slide.timer);
    if (GLS) {
      if (!slide.ready || performance.now() - slide.readyAt < 1500) { slide.timer = setTimeout(function(){ showSlide(i); }, 400); return; }   /* uploads/warm-up settle first */
      if (i !== slide.cur) {
        var now = performance.now();
        if (tr) { tr.a = tr.b; }                              /* clicked mid-change: carry on from the picture coming in */
        tr = {a: tr ? tr.a : slide.cur, b: i, t0: now};
        slide.start[i] = now; slide.cur = i;
      }
      slide.timer = setTimeout(nextSlide, (next.dur + (i !== 0 ? TR_DUR : 0)) * 1000);
      setPreview(); ensureLoop();
      return;
    }
    if (prev.k === 'img') slide.els[slide.cur].classList.remove('on');
    slide.cur = i;
    if (next.k === 'img') slide.els[i].classList.add('on');
    slide.timer = setTimeout(nextSlide, next.dur * 1000);
    setPreview();
  }
  function nextSlide(){ if (!slide.on || ST.on) return; showSlide((slide.cur + 1) % SL.length); }
  function startSlider(){
    if (slide.on) return; slide.on = true;
    if (gl3() && window.__pre3d.slidesInit) {
      GLS = true;
      setTimeout(function(){                                     /* after the title has landed */
        window.__pre3d.slidesInit(SL.slice(1).map(function(s){ return {src:s.src, bg:s.bg, dep:s.dep, sko:s.sko, skb:s.skb}; })).then(function(){ slide.ready = true; slide.readyAt = performance.now(); }, function(){ GLS = false; buildSlides(); });
      }, 1200);
    } else buildSlides();
    setPreview();
    slide.timer = setTimeout(nextSlide, SL[0].dur * 1000);
    if (preview) qsa('.pv-img', preview).forEach(function(el){ el.style.pointerEvents = 'auto'; el.style.cursor = 'none'; el.addEventListener('click', function(){ var i = parseInt(el.getAttribute('data-i'), 10); if (!isNaN(i)) showSlide(i); }); });
    document.addEventListener('visibilitychange', function(){ if (document.hidden) { clearTimeout(slide.timer); } else if (slide.on && !ST.on) { showSlide(slide.cur); } });
  }

  /* ---------- cursor + mouse */
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var cx = 0, cy = 0, tx = 0, ty = 0, curLab = qs('.cl', cur);
  window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5); });
  (function curLoop(){ cx += (tx - cx) * .6; cy += (ty - cy) * .6; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(curLoop); })();
  document.addEventListener('pointerover', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw,.pv-img'); if (t) cur.classList.add('link'); });
  document.addEventListener('pointerout', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw,.pv-img'); if (t) cur.classList.remove('link'); });
  layout();
  window.addEventListener('resize', function(){ layout(); if (gl3()) window.__pre3d.resize(); if (state.done) drawIdle(); else render(state.t); onResize(); });
  render(0);
  /* ================================================================== the story: hero → blocks 2–3 (user's whiteboard, 02.11 18:34)
     The hero is pinned (.hpin, sticky) and the scroll plays one scene, s = viewport-heights scrolled into the pin:
       hero UI out → (if a photo is up: the glass wave back to the room) → the camera flies back out of the room, through the
       window, and pulls back from the tower → the golden outline draws round the window → the picture becomes an ink sketch →
       only the CI window stays → it becomes the central square: phrase 01 → a square draws on the left (counter-clockwise),
       phrase 02 → on the right, phrase 03 → the three merge into one, the CI paragraph types itself in, "This is turnkey." →
       the square tilts into an isometric stack of three layers (the three phrases) → block 3's text left and right on lines
       with square ends. Everything is a pure function of s (scrolling back plays it backwards). */
  var hpin = $('hpin'), story = $('story'), stBg = $('stBg'), stLay = $('stLay'), sqC = $('sqC'), sqL = $('sqL'), sqR = $('sqR'),
      hdL = $('hdL'), hdR = $('hdR'), ldL = $('ldL'), ldR = $('ldR'), ldqL = $('ldqL'), ldqR = $('ldqR'),
      phs = [$('ph0'), $('ph1'), $('ph2')], stTk = $('stTk'), pts = [$('pt0'), $('pt1'), $('pt2')], stSlog = $('stSlog');
  var ST = {on:false, s:-1, push:0, R:null, words:[], lay:[], ld:[]}, S_END = 10.6;
  var NS = 'http://www.w3.org/2000/svg';
  function sg(s, a, b){ return clamp01((s - a) / (b - a)); }
  function eo(u){ return 1 - Math.pow(1 - clamp01(u), 3); }                       /* ease out */
  function eio(u){ u = clamp01(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  /* phrases: one masked span per word */
  phs.forEach(function(el, k){
    var p = qs('p', el), ws = p.textContent.split(' ');
    p.innerHTML = ws.map(function(w){ return '<span class="w"><span>' + w + '</span></span>'; }).join(' ');
    ST.words[k] = qsa('.w > span', p);
  });
  function revealWords(k, q){ var ws = ST.words[k], n = ws.length; for (var i = 0; i < n; i++) { var u = eo(clamp01(q * (n + 1.2) - i)); ws[i].style.transform = 'translateY(' + ((1 - u) * 105).toFixed(1) + '%)'; } }
  /* iso layers (bottom → top in the DOM so the top one covers) */
  [2, 1, 0].forEach(function(i){
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'lay' + (i === 0 ? ' top' : ''));
    var path = document.createElementNS(NS, 'path'), tg = document.createElementNS(NS, 'g');
    var n = document.createElementNS(NS, 'text'); n.setAttribute('class', 'n'); n.textContent = '0' + (i + 1);
    var t = document.createElementNS(NS, 'text'), line = '', lines = [];          /* the phrase, wrapped to fit the layer */
    qs('p', phs[i]).textContent.replace(/\s+/g, ' ').trim().toUpperCase().split(' ').forEach(function(w){ if ((line + ' ' + w).trim().length > 15 && line) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); });
    lines.push(line);
    lines.forEach(function(l){ var ts = document.createElementNS(NS, 'tspan'); ts.textContent = l; t.appendChild(ts); });
    tg.appendChild(n); tg.appendChild(t); g.appendChild(path); g.appendChild(tg); stLay.appendChild(g);
    ST.lay[i] = {g:g, path:path, tg:tg, n:n, t:t};
  });
  [0, 1, 2].forEach(function(i){
    var l = document.createElementNS(NS, 'path'); l.setAttribute('class', 'ld'); l.setAttribute('pathLength', '1');
    var q = document.createElementNS(NS, 'rect'); q.setAttribute('class', 'ldq'); q.setAttribute('width', 7); q.setAttribute('height', 7);
    stLay.parentNode.appendChild(l); stLay.parentNode.appendChild(q); ST.ld[i] = {l:l, q:q};
  });
  function sqPath(x0, y0, x1, y1){ var cy = (y0 + y1) / 2; return 'M' + x1 + ' ' + cy + 'V' + y0 + 'H' + x0 + 'V' + y1 + 'H' + x1 + 'V' + cy; }   /* from the right middle, counter-clockwise */
  function headAt(x0, y0, x1, y1, p){                                              /* the point at fraction p along sqPath */
    var w = x1 - x0, h = y1 - y0, L = 2 * (w + h), d = p * L, cy = (y0 + y1) / 2;
    if (d <= h / 2) return [x1, cy - d]; d -= h / 2;
    if (d <= w) return [x1 - d, y0]; d -= w;
    if (d <= h) return [x0, y0 + d]; d -= h;
    if (d <= w) return [x0 + d, y1]; d -= w;
    return [x1, y1 - d];
  }
  function drawSq(el, r, p, op){ el.setAttribute('d', sqPath(r[0], r[1], r[2], r[3])); el.style.strokeDasharray = Math.max(p, 0.0001) + ' 2'; el.style.opacity = op; }
  function placeBox(el, r, pad){ el.style.left = r[0] + 'px'; el.style.top = r[1] + 'px'; el.style.width = (r[2] - r[0]) + 'px'; el.style.height = (r[3] - r[1]) + 'px'; el.style.padding = pad + 'px'; }
  function sqAt(cx, cy, S){ return [cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2]; }
  function lerpR(a, b, k){ return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)]; }
  var lastMx = 9, lastMy = 9;
  function storyUpdate(vh){
    if (!hpin || !story) return;
    var vw = window.innerWidth, s = clamp01(-hpin.getBoundingClientRect().top / vh / S_END) * S_END;
    var on = state.done && s > .002;
    if (!on) {
      if (ST.on) {                                                                   /* back on the hero */
        ST.on = false; story.classList.remove('on'); heroIn.style.opacity = ''; heroIn.style.transform = ''; heroIn.style.visibility = ''; heroIn.style.filter = '';
        st15.style.opacity = 1; if (window.__pre3d.setRoom) window.__pre3d.setRoom(-1);
        if (slide.on) { if (slide.cur === 0) render(T.end + 1); showSlide(slide.cur); }
      }
      ST.s = s; return;
    }
    if (!ST.on) {                                                                    /* entering the story: the slider pauses */
      ST.on = true; story.classList.add('on'); clearTimeout(slide.timer);
      var cur = tr ? tr.b : slide.cur; tr = null; slide.cur = cur; ST.s = -1; ST.push = 0;
      if (GLS && slide.ready && cur > 0 && window.__pre3d.setRoom) { window.__pre3d.setRoom(cur - 1); ST.push = .05 * kbOf(cur, performance.now()); }
    }
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    var moved = Math.abs(pmx - lastMx) + Math.abs(pmy - lastMy) > .0004;
    if (s === ST.s && !moved) return;
    ST.s = s; lastMx = pmx; lastMy = pmy;
    /* --- the hero text blurs away while we already fly */
    var ui = sg(s, 0, 1.0);
    heroIn.style.opacity = 1 - eio(ui); heroIn.style.filter = ui > 0 ? 'blur(' + (18 * eo(ui)).toFixed(1) + 'px)' : '';
    heroIn.style.transform = 'scale(' + (1 + .06 * eo(ui)).toFixed(4) + ')'; heroIn.style.visibility = ui >= 1 ? 'hidden' : '';
    /* --- the squares' size: the window stops exactly at this size (no grow) */
    var horiz = vw / vh > .95, S = horiz ? Math.min(vw * .27, vh * .46, 470) : Math.min(vh * .25, vw * .7);
    story.style.setProperty('--S', S + 'px');
    var gap = S * .12, cx = vw / 2, cy = vh / 2, step = S + gap;
    /* --- WebGL: fly out of the window to that distance, outline, the sketch comes and goes, only the window stays */
    var useGL = gl3() && window.__pre3d.storyFrame, glOn = s < 3.2;
    stBg.style.opacity = useGL ? sg(s, 2.85, 3.15) : Math.min(1, sg(s, .2, 1.4));
    /* v7 (user 03.11 10:16): a hairline (no gold, no glow) draws round the window; the facade turns into a vector drawing
       behind one soft front from the window, the window stays a live photo; the drawing retracts into the window, whose line
       becomes the panel's line at the very same pixels while the drone eases in to the panel's size */
    var grow = eio(sg(s, 2.5, 3.05));
    if (useGL && glOn) {
      var g0 = window.__perfLog ? performance.now() : 0;
      ST.R = window.__pre3d.storyFrame({T:T, mx:pmx, my:pmy, push:ST.push, winPx:S * lerp(.78, 1, grow), fly:sg(s, 0, 1.6), ol:eio(sg(s, 1.05, 1.6)),
                                       olOp:1 - sg(s, 2.45, 2.55), draw:eio(sg(s, 1.45, 2.3)), out:eio(sg(s, 2.45, 2.95))});
      if (g0) ST.dbg = performance.now() - g0;
    } else ST.dbg = 0;
    var target = [cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2];
    var win = ST.R ? [ST.R.x0, ST.R.y0, ST.R.x1, ST.R.y1] : target;
    var rc = lerpR(win, target, eio(sg(s, 2.85, 3.15)));                             /* exactly the window; the end absorbs the mouse parallax */
    var cOp = useGL ? sg(s, 2.45, 2.55) : sg(s, 1.2, 1.6);
    var sL = s - .3;                                                                 /* everything after the window: 0.3 later than v6 */
    var iso = sg(sL, 7.8, 8.8), isoE = eio(iso);
    var pL = horiz ? [cx - step, cy] : [cx, cy - step], pR = horiz ? [cx + step, cy] : [cx, cy + step];
    /* --- three squares: centre (the window), left and right drawn counter-clockwise, then they merge */
    var mg = eio(sg(sL, 5.8, 6.5)), dl = eio(sg(sL, 3.5, 4.1)), dr = eio(sg(sL, 4.5, 5.1));
    var rl = sqAt(lerp(pL[0], cx, mg), lerp(pL[1], cy, mg), S), rr = sqAt(lerp(pR[0], cx, mg), lerp(pR[1], cy, mg), S);
    var sideOp = 1 - sg(sL, 6.3, 6.5), tkq = sg(sL, 6.5, 7.0), tkOut = 1 - sg(sL, 7.6, 7.9);
    drawSq(sqC, rc, 1, isoE > 0 ? 0 : cOp);
    var fin = eo(tkq) * tkOut;                                                       /* the same 1 px Bright Gray as the drawing; only the finale glows */
    sqC.style.stroke = '#EBEBEB'; sqC.style.strokeWidth = 1 + fin * .5;
    sqC.style.filter = fin > .001 ? 'drop-shadow(0 0 ' + (14 * fin).toFixed(1) + 'px rgba(150,169,191,' + (.85 * fin).toFixed(2) + '))' : 'none';
    drawSq(sqL, rl, dl, dl > 0 ? sideOp : 0); drawSq(sqR, rr, dr, dr > 0 ? sideOp : 0);
    var hl = headAt(rl[0], rl[1], rl[2], rl[3], dl), hr = headAt(rr[0], rr[1], rr[2], rr[3], dr);
    hdL.setAttribute('x', hl[0] - 3.5); hdL.setAttribute('y', hl[1] - 3.5); hdL.style.opacity = dl > 0 && dl < 1 ? 1 : 0;
    hdR.setAttribute('x', hr[0] - 3.5); hdR.setAttribute('y', hr[1] - 3.5); hdR.style.opacity = dr > 0 && dr < 1 ? 1 : 0;
    var pad = S * .085, phOut = 1 - sg(sL, 5.6, 5.9);
    var rects = [target, rl, rr], qs3 = [sg(sL, 2.95, 3.45), sg(sL, 3.95, 4.45), sg(sL, 4.95, 5.45)];
    for (var k = 0; k < 3; k++) { placeBox(phs[k], rects[k], pad); revealWords(k, qs3[k]); phs[k].style.opacity = qs3[k] > 0 ? phOut : 0; }
    /* --- the finale: one panel, "This is turnkey." */
    placeBox(stTk, target, pad);
    stTk.style.opacity = eo(tkq) * tkOut; qs('p', stTk).style.transform = 'translateY(' + ((1 - eo(tkq)) * 18).toFixed(1) + 'px)';
    /* --- it splits into three layers (isometric); each part of the CI paragraph on a line with a square end */
    var thz = isoE * Math.PI / 4, thx = isoE * 54.7 * Math.PI / 180, sc = lerp(1, horiz ? .72 : .6, isoE), D = S * .34 * isoE;
    var czz = Math.cos(thz), szz = Math.sin(thz), cxx = Math.cos(thx), sxx = Math.sin(thx);
    var a = czz * sc, b = szz * cxx * sc, c = -szz * sc, d = czz * cxx * sc;
    var hs = S / 2, corners = [[-hs, -hs], [hs, -hs], [hs, hs], [-hs, hs]], ext = [];
    var labQ = sg(sL, 8.4, 8.9);
    stLay.style.opacity = isoE > 0 ? 1 : 0;
    for (var i = 0; i < 3; i++) {
      var L = ST.lay[i], h = (1 - i) * D, ox = cx, oy = cy - h * sxx * sc;
      var ptsL = corners.map(function(q){ return [a * q[0] + c * q[1] + ox, b * q[0] + d * q[1] + oy]; });
      L.path.setAttribute('d', 'M' + ptsL.map(function(q){ return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z');
      L.tg.setAttribute('transform', 'matrix(' + [a, b, c, d, ox, oy].map(function(v){ return v.toFixed(4); }).join(' ') + ')');
      var fs = S * .062, tsp = L.t.childNodes, nl = tsp.length, y0 = hs - pad - (nl - 1) * fs * 1.08;
      for (var j = 0; j < nl; j++) { tsp[j].setAttribute('x', -hs + pad); tsp[j].setAttribute('y', (y0 + j * fs * 1.08).toFixed(1)); }
      L.n.setAttribute('x', -hs + pad); L.n.setAttribute('y', (-hs + pad + S * .03).toFixed(1)); L.n.setAttribute('font-size', (S * .03).toFixed(1));
      L.t.setAttribute('font-size', fs.toFixed(1)); L.tg.style.opacity = labQ;
      var lft = [1e9, 0], rgt = [-1e9, 0];
      ptsL.forEach(function(q){ if (q[0] < lft[0]) lft = q; if (q[0] > rgt[0]) rgt = q; });
      ext[i] = {l:lft, r:rgt};
    }
    var m = Math.max(20, Math.min(48, vw * .035));
    for (var i2 = 0; i2 < 3; i2++) {
      var side = i2 === 1 ? 1 : -1, ld = eio(sg(sL, 8.8 + i2 * .15, 9.3 + i2 * .15)), tq = eo(sg(sL, 9.0 + i2 * .15, 9.5 + i2 * .15));
      var P = pts[i2], LD = ST.ld[i2];
      if (horiz) {
        var e = side < 0 ? ext[i2].l : ext[i2].r, x1 = e[0] + side * 64;
        LD.l.setAttribute('d', 'M' + e[0].toFixed(1) + ' ' + e[1].toFixed(1) + 'H' + x1.toFixed(1));
        LD.q.setAttribute('x', (side < 0 ? x1 - 7 : x1).toFixed(1)); LD.q.setAttribute('y', (e[1] - 3.5).toFixed(1));
        var wP = Math.min(vw * .26, side < 0 ? x1 - 22 - m : vw - m - x1 - 22);
        P.style.width = wP + 'px'; P.style.left = (side < 0 ? x1 - 22 - wP : x1 + 22) + 'px';
        P.style.top = (e[1] - 12) + 'px';
        LD.l.style.opacity = ld > 0 ? 1 : 0; LD.l.style.strokeDasharray = Math.max(ld, .0001) + ' 2'; LD.q.style.opacity = ld >= 1 ? 1 : 0;
      } else {
        LD.l.style.opacity = LD.q.style.opacity = 0;
        P.style.left = m + 'px'; P.style.width = (vw - 2 * m) + 'px';
        P.style.top = (i2 === 0 ? 92 : i2 === 1 ? cy + S * .55 : cy + S * .55 + 70) + 'px';
      }
      P.style.opacity = tq; P.style.transform = 'translateY(' + ((1 - tq) * 14).toFixed(1) + 'px)';
    }
    stSlog.style.opacity = eo(sg(sL, 9.4, 9.9));
  }



