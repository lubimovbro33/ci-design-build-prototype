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
  function idleLoop(){ (function f(){ if (slide.cur === 0 && !tr && !loopOn && !document.hidden) { var dx = mx - pmx, dy = my - pmy; if (Math.abs(dx) + Math.abs(dy) > .0005) { pmx += dx * .06; pmy += dy * .06; render(T.end + 1); } } requestAnimationFrame(f); })(); }

  /* ================================================================== the hero slider (interiors): slide 0 = the room we entered */
  /* the five interiors the user picked on the Figma board "Hero — интерьеры (отбор)" (02.11, 18:07): professional photos */
  var HSZ = Math.max(window.innerWidth, window.innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2) > 1700 ? '_2560.jpg' : '_1600.jpg';
  var SL = [{k:'v15', dur:7, th:'assets/v15/room_1k.jpg'}].concat(['h1_city', 'h2_kitchen', 'h3_fireplace', 'h4_skyline', 'h5_double'].map(function(n){
    return {k:'img', src:'assets/hero/' + n + HSZ, bg:'assets/hero/' + n + '_bg' + HSZ, dep:'assets/hero/' + n + '_dep.png', th:'assets/hero/' + n + '_th.jpg', dur:6.5};
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
    if (document.hidden) { loopOn = false; return; }
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
  function drawIdle(){ if (GLS && (slide.cur !== 0 || tr)) { ensureLoop(); return; } render(T.end + 1); }
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
  function nextSlide(){ if (!slide.on) return; showSlide((slide.cur + 1) % SL.length); }
  function startSlider(){
    if (slide.on) return; slide.on = true;
    if (gl3() && window.__pre3d.slidesInit) {
      GLS = true;
      window.__pre3d.slidesInit(SL.slice(1).map(function(s){ return {src:s.src, bg:s.bg, dep:s.dep}; })).then(function(){ slide.ready = true; slide.readyAt = performance.now(); }, function(){ GLS = false; buildSlides(); });
    } else buildSlides();
    setPreview();
    slide.timer = setTimeout(nextSlide, SL[0].dur * 1000);
    if (preview) qsa('.pv-img', preview).forEach(function(el){ el.style.pointerEvents = 'auto'; el.style.cursor = 'none'; el.addEventListener('click', function(){ var i = parseInt(el.getAttribute('data-i'), 10); if (!isNaN(i)) showSlide(i); }); });
    document.addEventListener('visibilitychange', function(){ if (document.hidden) { clearTimeout(slide.timer); } else if (slide.on) { showSlide(slide.cur); } });
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
  function heroScroll(hy, vh){
    var p = clamp01(hy / vh);
    scrollZoom = p * .08; heroOff = p >= 1;
    dark.style.opacity = p * .8;
    if (state.done) drawIdle();
    heroIn.style.opacity = 1 - clamp01(p * 1.4); heroIn.style.transform = 'translateY(' + (hy * .12) + 'px)';
  }

