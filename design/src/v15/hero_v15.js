  /* ================================================================== 01 HERO v15 — lights off → the CI outline → our window lights up → inside
     One frontal night facade (assets/v15/fac_*.jpg, approved 2 Nov): dark grey stone, 7 asymmetric columns, every apartment dark,
     glass with sparse cool city reflections; the centre column has square single-pane windows and the CENTRAL square window sits
     exactly at the image centre (ChatGPT generation → graded/cleaned → Topaz ×2 in Weave). Plain DOM layers, one transform per frame:
       .cam  = the facade (cover-fit, scale z about the screen centre = the window centre)
       .win  = the window rect inside .cam: the room photo inside the glass (its own slower scale = the room is deeper than the
               facade; the frame stays the facade's own), the warm spill on the stone
       .mark = the official CI logo mark (crop of logo-white.png), drawn clockwise with a conic mask, centred on the window.
     Timeline ≤ 5 s: fade in 0–.35 · slow drift z 1→1.03 · logo .7–1.5 · logo out 2.3–2.65 · window lights 2.45–3.05 (bloom) ·
     push 3.05–4.65 (expo, z → 7.8; the frame flies by) · UI 4.3 · end 4.75 → the room photo is slide 0 of the hero slider. */
  var hero=$('hero'), heroIn=qs('.hero-ui'), heroTitle=$('title'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), veil=$('veil'), dark=$('dark'),
      cur=$('cur'), slidesEl=$('slides'), preview=$('preview');
  var st15=$('v15'), cam=$('v15cam'), facImg=$('v15fac'), win=$('v15win'), glass=$('v15glass'), roomImg=$('v15room'), spill=$('v15spill'), mark=$('v15mark');
  var FAC = {w:3840, h:2160, win:{x:1632, y:786, w:574, h:580}, inset:{l:19, t:26, r:15, b:20}};   /* the central window (outer frame) in fac_4k px; glass = frame − inset */
  var ROOM = {w:2400, h:1729};
  var Z_END = 7.8, MARK_W = .78;                                             /* logo mark = 78 % of the glass width */
  var T = {fadeIn:.35, drift:3.05, logoA:.70, logoB:1.50, outA:2.30, outB:2.65, litA:2.45, litB:3.05, push:3.05, pushEnd:4.65, ui:4.30, end:4.75};
  var G = {}, state = {t:0, done:false, skipped:false, phase:'pre'};
  var mx = 0, my = 0, pmx = 0, pmy = 0, scrollZoom = 0;
  var short = false; try { short = sessionStorage.getItem('ci-intro-v15') === '1'; } catch(e){}
  function sm15(x){ x = clamp01(x); return x * x * (3 - 2 * x); }
  function expo15(u){ u = clamp01(u); if (u === 0 || u === 1) return u; return u < .5 ? Math.pow(2, 20 * u - 10) / 2 : 1 - Math.pow(2, -20 * u + 10) / 2; }

  /* ---------- sources: pick sizes for the screen */
  (function pick(){
    var px = Math.max(window.innerWidth, window.innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2);
    facImg.src = px > 2600 ? 'assets/v15/fac_4k.jpg' : px > 1700 ? 'assets/v15/fac_2k.jpg' : 'assets/v15/fac_1k.jpg';
    roomImg.src = px > 1500 ? 'assets/v15/room_2k.jpg' : 'assets/v15/room_1k.jpg';
  })();
  var need = [facImg, roomImg, mark], loaded = 0;
  function isOk(im){ return im.complete && im.naturalWidth > 0; }
  need.forEach(function(im){ if (isOk(im)) loaded++; else { im.addEventListener('load', function(){ loaded++; }); im.addEventListener('error', function(){ loaded++; }); } });

  /* ---------- geometry */
  function layout(){
    var vw = window.innerWidth, vh = window.innerHeight;
    var c = Math.max(vw / FAC.w, vh / FAC.h);                                 /* cover; the window centre (1920,1080) = the screen centre */
    G = {vw:vw, vh:vh, c:c};
    cam.style.width = FAC.w + 'px'; cam.style.height = FAC.h + 'px';
    var W = FAC.win;
    win.style.left = W.x + 'px'; win.style.top = W.y + 'px'; win.style.width = W.w + 'px'; win.style.height = W.h + 'px';
    var b = FAC.inset; glass.style.left = b.l + 'px'; glass.style.top = b.t + 'px'; glass.style.right = b.r + 'px'; glass.style.bottom = b.b + 'px';
    G.gw = W.w - b.l - b.r; G.gh = W.h - b.t - b.b;                          /* glass, fac px */
    /* the room photo: on-screen scale s(z) = sEnd·(z/Z_END)^.88, sEnd = cover of the viewport ×1.02 → always covers the glass */
    G.sEnd = Math.max(vw / ROOM.w, vh / ROOM.h) * 1.02;
    G.zEnd = Math.max(Z_END, Math.max(vw / (G.gw * c), vh / (G.gh * c)) * 1.06);
    var mw = G.gw * MARK_W, gcx = W.x + b.l + G.gw / 2, gcy = W.y + b.t + G.gh / 2;   /* centred on the glass */
    mark.style.width = mw + 'px'; mark.style.left = (gcx - mw / 2) + 'px'; mark.style.top = (gcy - mw * 520 / 532 / 2) + 'px';
  }
  function zAt(t){
    if (t < T.push) return 1 + .03 * clamp01(t / T.drift);
    return 1.03 * Math.pow(G.zEnd / 1.03, expo15((t - T.push) / (T.pushEnd - T.push)));
  }
  function render(t){
    var z = zAt(t) * (1 + scrollZoom), c = G.c, k = c * z;                    /* fac px → screen px */
    var tx = G.vw / 2 - FAC.w / 2 * k, ty = G.vh / 2 - FAC.h / 2 * k;
    cam.style.transform = 'translate3d(' + (tx + pmx * -10) + 'px,' + (ty + pmy * -8) + 'px,0) scale(' + k + ')';
    var fade = sm15(t / T.fadeIn); st15.style.opacity = fade;
    /* logo: clockwise conic wipe from the right-hand side */
    var lp = sm15((t - T.logoA) / (T.logoB - T.logoA)), la = t < T.outA ? 1 : 1 - clamp01((t - T.outA) / (T.outB - T.outA));
    mark.style.setProperty('--a', (lp * 360).toFixed(1) + 'deg'); mark.style.opacity = (lp > 0 ? .92 * la : 0);
    /* the window */
    var lit = sm15((t - T.litA) / (T.litB - T.litA)), bloom = 1 + .25 * Math.sin(Math.PI * clamp01((t - T.litA) / .8));
    var passed = sm15((t - T.push) / .9);
    glass.style.opacity = lit; roomImg.style.filter = 'brightness(' + bloom.toFixed(3) + ')';
    var zr = zAt(t), sOn = Math.max(G.sEnd * Math.pow(zr / G.zEnd, .88), Math.max(G.gw / ROOM.w, G.gh / ROOM.h) * c * zr * 1.12), sLoc = sOn / k * (1 + scrollZoom);   /* room scale inside .cam */
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
    var target = Math.max(Math.min(.9, el / 1.2), loaded / need.length * .95);
    if (loaded >= need.length || el > 3 || short && el > .4) target = 1;
    shown += (target * 100 - shown) * .2; if (target >= 1 && shown > 98.5) shown = 100;
    cnt.textContent = (shown < 10 ? '0' : '') + Math.round(shown);
    if (shown >= 100) { preDone = true; startIntro(); return; }
    requestAnimationFrame(preTick);
  }
  requestAnimationFrame(preTick);

  var raf = null, t0 = null;
  function startIntro(){
    pre.classList.add('out'); veil.classList.add('off'); st15.classList.add('on');
    if (reduced) { finish(); return; }
    state.phase = 'intro'; t0 = performance.now();
    raf = requestAnimationFrame(tick);
  }
  function tick(now){
    var t = (now - t0) / 1000;
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
    pre.style.display = 'none'; mark.style.display = 'none';
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
  skip.addEventListener('click', skipIntro);
  window.addEventListener('keydown', function(e){ if (!state.done && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipIntro(); } });
  function idleLoop(){ (function f(){ if (slide.cur === 0 && !document.hidden) { var dx = mx - pmx, dy = my - pmy; if (Math.abs(dx) + Math.abs(dy) > .0005) { pmx += dx * .06; pmy += dy * .06; render(T.end + 1); } } requestAnimationFrame(f); })(); }

  /* ================================================================== the hero slider (interiors): slide 0 = the room we entered */
  var SL = [
    {k:'v15', dur:7, th:'assets/v15/room_1k.jpg'},
    {k:'img', src:'assets/img2/living2_w.jpg', dur:6.5},
    {k:'img', src:'assets/img2/foyer_w.jpg', dur:6.5},
    {k:'img', src:'assets/img2/hall_w.jpg', dur:6.5},
    {k:'img', src:'assets/img2/living3_w.jpg', dur:6.5},
    {k:'img', src:'assets/img2/dining_w.jpg', dur:6.5},
    {k:'img', src:'assets/img2/chaise.jpg', dur:6.5}
  ];
  var slide = {cur:0, timer:null, on:false, els:[]};
  var pvImgs = preview ? qsa('.pv-img img', preview) : [];
  function buildSlides(){
    SL.forEach(function(s, i){
      if (s.k === 'img') { var im = document.createElement('img'); im.className = 'sl'; im.src = s.src; im.alt = ''; im.decoding = 'async'; slidesEl.appendChild(im); slide.els[i] = im; s.th = s.src; }
    });
  }
  function setPreview(){
    for (var j = 0; j < pvImgs.length; j++) { var s = SL[(slide.cur + 1 + j) % SL.length]; pvImgs[j].src = s.th; pvImgs[j].parentNode.setAttribute('data-i', (slide.cur + 1 + j) % SL.length); }
  }
  function showSlide(i){
    var prev = SL[slide.cur], next = SL[i];
    clearTimeout(slide.timer);
    if (prev.k === 'img') slide.els[slide.cur].classList.remove('on');
    slide.cur = i;
    if (next.k === 'img') slide.els[i].classList.add('on');
    slide.timer = setTimeout(nextSlide, next.dur * 1000);
    setPreview();
  }
  function nextSlide(){ if (!slide.on) return; showSlide((slide.cur + 1) % SL.length); }
  function startSlider(){
    if (slide.on) return; slide.on = true; buildSlides(); setPreview();
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
  window.addEventListener('resize', function(){ layout(); render(state.done ? T.end + 1 : state.t); onResize(); });
  render(0);
  function heroScroll(hy, vh){
    var p = clamp01(hy / vh);
    scrollZoom = p * .08;
    dark.style.opacity = p * .8;
    if (state.done) render(T.end + 1);
    heroIn.style.opacity = 1 - clamp01(p * 1.4); heroIn.style.transform = 'translateY(' + (hy * .12) + 'px)';
  }

