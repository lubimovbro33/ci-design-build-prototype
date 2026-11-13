/* CI Design + Build — homepage design v11 · site.js
   vanilla, no deps. 1) hero intro timeline  2) reveals  3) scroll-driven blocks  4) interactions */
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var qs = function(s, r){ return (r || document).querySelector(s); };
  var qsa = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* typograph (lesson: no hanging short words, no one-word last lines) — running text only, text nodes only, so markup
     and the per-letter title splits are never touched. Short words are tied to the next word, the dash to the word before,
     and the last two words of a paragraph to each other. */
  (function(){
    var SHORT; try { SHORT = new RegExp('(?<=^|[\\s(\u201c"])(a|an|the|of|to|in|on|at|by|for|and|or|but|is|it|we|our|your|you|with|from|as|so|no|not|one|CI|\u2014|\u2013)\\s+(?=\\S)', 'gi'); } catch (e) { return; }
    qsa('.ch .ch-lead, .ch .ch-p, .ph-lead, .ph-p, .su-p, .ch-faq .ain .p, .pr4-lead, .pr4-bd, .cl2-card p, .pj4-pn p, .ap-qs .tx').forEach(function(el){
      var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), n, last = null;
      while ((n = tw.nextNode())){ n.nodeValue = n.nodeValue.replace(SHORT, function(m, w){ return w + '\u00a0'; }).replace(/\s+(\u2014|\u2013)/g, '\u00a0$1'); if (/\S/.test(n.nodeValue)) last = n; }
      if (last) last.nodeValue = last.nodeValue.replace(/\s+(\S+\s*)$/, ' $1');
    });
  })();
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
  if (/[?&]perf/.test(location.search)) { window.__perfLog = []; (function f(n){ var l = window.__perfLog; l.push(Math.round(n)); if (l.length < 2400) requestAnimationFrame(f); })(performance.now()); }   /* debug: frame times from the very start */

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

  /* ================================================================== 01 HERO v15 — the preloader by the user's Figma frames 13 → 15 → 16 → 14
     Picture = ChatGPT outpaint of the cover of CI's reel DajISPfwHmc (night limestone tower, Chicago skyline right), placed exactly
     as in Figma (image stretched to 2033×1477 at −57,−251 in a 1920×1080 frame; assets are that frame at 2×, 3840×2160):
       13  every window dark (the lit window covered by a dark window from two floors up, Figma rect 874,442 167×179)  → pre_dark_*.jpg
       15  the official CI DESIGN + BUILD logo (Figma rect 865,432 190×217) drawn clockwise over that window            → logo_db.png
       16  the logo goes, a warm outline draws round the window (Figma rect 877,448 163×164, 3 px #F8BD79, glow 8.6)     → svg .ol
       14  the window lights up: the original lit window with the couple (Figma frame 14)                                 → pre_litwin.jpg
     then we push into the window (zoom about the window centre) and land in room 1450_34 = slide 0 of the hero slider. ≤ 5 s. */
  var hero=$('hero'), heroIn=qs('.hero-ui'), heroTitle=$('title'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), veil=$('veil'), dark=$('dark'),
      cur=$('cur'), slidesEl=$('slides');
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
    if (window.__pre3d && window.__pre3d.cta) return;                         /* the canvas is lent to the CTA (js/chapters.js) */
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
    if (GL && gl3()) {                                                              /* the 3D is up: warm it under the still, go next frame */
      preDone = true; var go = function(){ requestAnimationFrame(startIntro); };
      try { if (window.__pre3d.warm) window.__pre3d.warm(T).then(go, go); else go(); } catch (e) { go(); } return;
    }
    var target;
    if (GL) { target = gl3() ? 1 : Math.min(.92, el / 2.2); }
    else {
      target = Math.max(Math.min(.9, el / 1.2), loaded / need.length * .95);
      if (loaded >= need.length || el > 3 || short && el > .4) target = 1;
    }
    shown += (target * 100 - shown) * .2; if (target >= 1 && shown > 98.5) shown = 100;
    if (cnt) cnt.textContent = (shown < 10 ? '0' : '') + Math.round(shown);   /* the % counter is gone (user 03.11 10:12); the wait stays */
    if (shown >= 100) { preDone = true; startIntro(); return; }
    requestAnimationFrame(preTick);
  }
  requestAnimationFrame(preTick);

  var raf = null, t0 = null;
  function startIntro(){
    if (state.done || state.phase === 'intro') return;                               /* skipped meanwhile / already running */
    var still = $('prePoster'), stillOn = !!still && isOk(still);
    if (gl3() && stillOn) { window.__pre3d.noFade = true; veil.style.transition = 'none'; }   /* the still IS this frame: cross-fade, no dip */
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
    if (window.__pre3d && window.__pre3d.roomReady === false && st15.classList.contains('gl')) t = Math.min(t, Math.max(state.t, T.push - .1));   /* the room is still on its way: the drone waits at the window */
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    state.t = t; render(t);
    if (t < T.end) raf = requestAnimationFrame(tick); else finish();
  }
  function uiOn(){
    if (hero.classList.contains('ui')) return;
    hero.classList.add('ui'); document.body.classList.add('ready'); document.body.classList.remove('is-intro'); heroTitle.classList.add('in');
    setTimeout(function(){ heroTitle.classList.add('done'); }, TITLE_END || 2600);   /* filters off once sharp */
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
  if (skip) skip.addEventListener('click', skipIntro);                                /* (lost in v15: SKIP showed but did nothing) */
  window.addEventListener('keydown', function(e){ if (!state.done && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipIntro(); } });
  var lastSY = 0;
  function idleLoop(){ (function f(){ var still = false, sy = window.scrollY; if (slide.cur === 0 && !tr && !loopOn && !ST.on && !document.hidden) { var dx = mx - pmx, dy = my - pmy; if (Math.abs(dx) + Math.abs(dy) > .0005) { pmx += dx * .06; pmy += dy * .06; render(T.end + 1); } else still = true; }
    if (window.__pre3d) window.__pre3d.busy = !(still || document.hidden) || sy !== lastSY; lastSY = sy;   /* GPU uploads wait for a still frame */
    requestAnimationFrame(f); })(); }

  /* ================================================================== the hero slider (interiors): slide 0 = the room we entered */
  /* the five interiors the user picked on the Figma board "Hero — интерьеры (отбор)" (02.11, 18:07): professional photos */
  var LITE = document.documentElement.classList.contains('lite');
  var HSZ = LITE ? '_1600.jpg' : Math.max(window.innerWidth, window.innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2) > 1700 ? '_2560.jpg' : '_1600.jpg';
  var SL = [{k:'v15', dur:3.5}].concat(['h1_city', 'h2_kitchen', 'h3_fireplace', 'h4_skyline', 'h5_double'].map(function(n){
    return {k:'img', src:'assets/hero/' + n + HSZ, bg:'assets/hero/' + n + '_bg' + HSZ, dep:'assets/hero/' + n + '_dep.png', dur:3.25,
            sko:'assets/hero/' + n + '_sk.jpg', skb:'assets/hero/' + n + '_bg_sk.jpg'};
  }));
  /* the pause on each picture (user 09.11: twice as often as before, 7 / 6.5 s → 3.5 / 3.25 s); the glass change itself and
     the slow push-in keep their speed (KB_T = the old 6.5 + 2.6 s) */
  var slide = {cur:0, timer:null, on:false, els:[], ready:false, start:[]};
  function armTimer(ms){ clearTimeout(slide.timer); slide.timer = setTimeout(nextSlide, ms); }
  function buildSlides(){
    SL.forEach(function(s, i){
      if (s.k === 'img') { var im = document.createElement('img'); im.className = 'sl'; im.src = s.src; im.alt = ''; im.decoding = 'async'; slidesEl.appendChild(im); slide.els[i] = im; }
    });
  }
  /* WebGL: the slides change through a wave of fluted glass (js/pre3d.js slideFrame); DOM crossfade is the fallback */
  var GLS = false, tr = null, loopOn = false, TR_DUR = 2.6, heroOff = false;
  function ease3(u){ u = clamp01(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  var KB_T = 9.1;
  function kbOf(i, now){ return i === 0 ? 0 : clamp01((now - (slide.start[i] || now)) / (KB_T * 1000)); }
  function glFrame(a, b, p, now){ if (window.__pre3d.cta) return; window.__pre3d.slideFrame({a:a - 1, b:b - 1, p:p, ka:kbOf(a, now), kb:kbOf(b, now), mx:pmx, my:pmy, scroll:scrollZoom, T:T}); }
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
      armTimer((next.dur + (i !== 0 ? TR_DUR : 0)) * 1000); ensureLoop();
      return;
    }
    if (prev.k === 'img') slide.els[slide.cur].classList.remove('on');
    slide.cur = i;
    if (next.k === 'img') slide.els[i].classList.add('on');
    armTimer(next.dur * 1000);
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
    armTimer(SL[0].dur * 1000);
    document.addEventListener('visibilitychange', function(){ if (document.hidden) { clearTimeout(slide.timer); } else if (slide.on && !ST.on) { showSlide(slide.cur); } });
  }

  /* ---------- cursor + mouse */
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  /* the cursor = the buttons' square (09.11 15:18): springs after the pointer and leans into its motion; docks into a button's own
     corner square; grows over other pressable things; opens into a labelled square where something is dragged or opened */
  var tx = 0, ty = 0, curLab = qs('.cl', cur), cSq = qs('.cd', cur);
  var S = {x: 0, y: 0, s: 8, r: 0}, cTgt = null, cDown = false, cFirst = true, pvx = 0;
  var PRESS = 'a,button,.qh,.tab,.sw,[data-cursor]';
  window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5);
    if (cFirst){ cFirst = false; S.x = tx; S.y = ty; } cur.classList.add('on'); });
  document.documentElement.addEventListener('mouseleave', function(){ cur.classList.remove('on'); });
  window.addEventListener('pointerdown', function(){ cDown = true; }); window.addEventListener('pointerup', function(){ cDown = false; });
  document.addEventListener('pointerover', function(e){ var t = e.target.closest && e.target.closest(PRESS); if (!t) return; cTgt = t; cur.classList.add('link');
    var l = t.getAttribute('data-cursor'); if (l){ curLab.textContent = l; cur.classList.add('lab'); } });
  document.addEventListener('pointerout', function(e){ var t = e.target.closest && e.target.closest(PRESS); if (!t) return; var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(PRESS);
    if (to === t) return; if (cTgt === t) cTgt = null; cur.classList.remove('link', 'lab'); });
  if (!coarse) (function curLoop(){
    var x = tx, y = ty, sz = 8, dock = null, lab = cur.classList.contains('lab') || cur.classList.contains('drag');
    if (lab) sz = 72;
    else if (cTgt && cTgt.isConnected){ dock = cTgt.querySelector(':scope > .sqd'); if (dock){ var r = dock.getBoundingClientRect(); if (r.width){ x = r.left + r.width / 2; y = r.top + r.height / 2; sz = r.width; } else dock = null; } if (!dock) sz = 16; }
    if (cDown) sz *= .7;
    var k = dock ? .2 : .24, nx = S.x + (x - S.x) * k, v = nx - S.x; S.x = nx; S.y += (y - S.y) * k; S.s += (sz - S.s) * .2;
    pvx += (Math.max(-18, Math.min(18, v * 1.4)) - pvx) * .15; S.r = dock || lab ? S.r * .8 : pvx;
    cSq.style.width = cSq.style.height = S.s.toFixed(2) + 'px';
    cSq.style.transform = 'translate3d(' + (S.x - S.s / 2).toFixed(1) + 'px,' + (S.y - S.s / 2).toFixed(1) + 'px,0) rotate(' + S.r.toFixed(2) + 'deg)';
    requestAnimationFrame(curLoop); })();   /* touch: no cursor, no loop */
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
    var sameS = s === ST.s;
    ST.s = s; lastMx = pmx; lastMy = pmy;
    /* --- the hero text blurs away while we already fly */
    var ui = sg(s, 0, 1.0);
    heroIn.style.opacity = 1 - eio(ui); heroIn.style.filter = ui > 0 && !LITE ? 'blur(' + (18 * eo(ui)).toFixed(1) + 'px)' : '';
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
    /* the panels ride with the window in 3D (user 03.11 19:48): while the canvas shows, the panel's line IS the window's rect;
       after it, the whole story layer moves with the cursor exactly as the window would at that depth (one compositor shift) */
    var par = [0, 0];
    if (useGL && !glOn && window.__pre3d.storyRect) {
      var R2 = window.__pre3d.storyRect({mx:pmx, my:pmy, push:ST.push, winPx:S, fly:1});
      par = [(R2.x0 + R2.x1) / 2 - cx, (R2.y0 + R2.y1) / 2 - cy];
    }
    story.style.setProperty('--px', par[0].toFixed(1) + 'px'); story.style.setProperty('--py', par[1].toFixed(1) + 'px');
    if (sameS && useGL && !glOn) return;                                               /* only the cursor moved: the shift is all */
    if (useGL && glOn) {
      var g0 = window.__perfLog ? performance.now() : 0;
      ST.R = window.__pre3d.storyFrame({T:T, mx:pmx, my:pmy, push:ST.push, winPx:S * lerp(.78, 1, grow), fly:sg(s, 0, 1.6), ol:eio(sg(s, 1.05, 1.6)),
                                       olOp:1 - sg(s, 2.45, 2.55), draw:eio(sg(s, 1.45, 2.3)), out:eio(sg(s, 2.45, 2.95))});
      if (g0) ST.dbg = performance.now() - g0;
    } else ST.dbg = 0;
    var target = [cx - S / 2, cy - S / 2, cx + S / 2, cy + S / 2];
    var win = ST.R && useGL && glOn ? [ST.R.x0, ST.R.y0, ST.R.x1, ST.R.y1] : target;
    var rc = win;                                                                    /* exactly the window (after the canvas: the layer's shift) */
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
    sqC.style.filter = fin > .001 && !LITE ? 'drop-shadow(0 0 ' + (14 * fin).toFixed(1) + 'px rgba(150,169,191,' + (.85 * fin).toFixed(2) + '))' : 'none';
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
        var uu = Math.min(vw / 1920, vh / 1080), wP = Math.min(338 * uu, side < 0 ? x1 - 7 - 30 * uu - m : vw - m - x1 - 7 - 30 * uu), gp = Math.min(81 * uu, Math.max(24, (side < 0 ? x1 - 7 - m - wP : vw - m - x1 - 7 - wP)));
        P.style.width = wP + 'px'; P.style.left = (side < 0 ? x1 - 7 - gp - wP : x1 + 7 + gp) + 'px';
        P.style.top = e[1] + 'px';
        LD.l.style.opacity = ld > 0 ? 1 : 0; LD.l.style.strokeDasharray = Math.max(ld, .0001) + ' 2'; LD.q.style.opacity = ld >= 1 ? 1 : 0;
      } else {
        LD.l.style.opacity = LD.q.style.opacity = 0;
        P.style.left = m + 'px'; P.style.width = (vw - 2 * m) + 'px';
        P.style.top = (i2 === 0 ? 92 : i2 === 1 ? cy + S * .55 : cy + S * .55 + 70) + 'px';
      }
      P.style.opacity = tq; P.style.transform = horiz ? 'translateY(calc(-50% + ' + ((1 - tq) * 14).toFixed(1) + 'px))' : 'translateY(' + ((1 - tq) * 14).toFixed(1) + 'px)';
    }
    stSlog.style.opacity = eo(sg(sL, 9.4, 9.9));
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
  /* random letter reveal (.rr): every character gets its own random delay (seeded per element, so a reload looks the same) */
  function rrHash(i){ var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function rrSplit(el, seed){
    var n = 0, span = 1.0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(c){
        if (c.nodeType === 3) {
          var parts = c.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'rw';
            for (var i = 0; i < p.length; i++) { var s = document.createElement('span'); s.className = 'rc'; s.textContent = p[i]; s.style.setProperty('--d', (rrHash(seed + n) * span).toFixed(3) + 's'); s.style.setProperty('--do', (rrHash(seed + n + 101) * .3).toFixed(3) + 's'); n++; w.appendChild(s); }
            frag.appendChild(w);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(el);
  }
  var rrSeed = 3; qsa('.rr').forEach(function(el){ rrSplit(el, rrSeed); rrSeed += 37; });
  /* the hero title comes into focus (v13, user 09.11): one span per letter (inline, so the kerning stays), one block per line;
     the delays run left → right, line 2 a beat after line 1 (css: .hero-title .fc / .tl) */
  var TITLE_END = 0;
  (function(el){
    if (!el) return;
    var lines = el.innerHTML.split(/<br\s*\/?>/i), out = [], last = 0;
    lines.forEach(function(line, li){
      var txt = line.replace(/<[^>]*>/g, ''), n = 0, ld = li * .18, html = '';
      for (var i = 0; i < txt.length; i++) {
        var ch = txt[i];
        if (ch === ' ') { html += ' '; continue; }
        var d = ld + (n++) * .034; last = Math.max(last, d);
        html += '<span class="fc" style="--d:' + d.toFixed(3) + 's">' + ch + '</span>';
      }
      out.push('<span class="tl" aria-hidden="true" style="--ld:' + ld.toFixed(2) + 's">' + html + '</span>');
    });
    el.innerHTML = out.join('');
    TITLE_END = (last + 1.8) * 1000;
  })($('title'));
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
    var ftr = $('footer'), ftop = ftr ? ftr.getBoundingClientRect().top : 1e9;   /* the footer has its own street line: the rail steps aside */
    chap.classList.toggle('show', state.done && y > vh * .7 && ftop > vh * .92);
    var gr = chap.__gr || (chap.__gr = document.querySelector('.grain')); if (gr) gr.classList.toggle('on', state.done && y > vh * .7);   /* v10: grain from the first drawn chapter on; the hero stays as approved */
    var idx = 0, tops = chapSecs.map(function(s){ return s.getBoundingClientRect().top + y; });
    for (var i = 0; i < tops.length; i++) if (y + vh * .5 >= tops[i]) idx = i;
    var next = idx + 1 < tops.length ? tops[idx + 1] : document.documentElement.scrollHeight - vh;
    var p = clamp01((y - tops[idx]) / Math.max(1, next - tops[idx]));
    if (idx !== chapOn) { chapOn = idx; chapLinks.forEach(function(a, k){ a.classList.toggle('on', k === idx); }); }
    /* one line per item, drawn by one element (::after, a two-stop gradient), so the lit part and the track can never sit a pixel
       apart; passed chapters stay lit, the ones ahead stay empty */
    chapLinks.forEach(function(a, k){ var v = k < idx ? 1 : k > idx ? 0 : p, s = v.toFixed(4);
      if (a.__p !== s){ a.__p = s; a.style.setProperty('--p', s); a.classList.toggle('st', v > 0); } });
    chap.classList.toggle('light', !!hdrTheme);
  }

  /* ================================================================== smooth wheel scroll (lerp) */
  var sm = {t: 0, c: 0, on: false, ours: false};
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!reduced && !coarse) {
    window.addEventListener('wheel', function(e){
      if (!state.done || e.ctrlKey) return;
      e.preventDefault();
      if (document.documentElement.classList.contains('mn-open')) return;   /* v10: the page holds still under the open menu */
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
  qsa('.rv, .lines, .wipe, .img-rv, .chars, .bi, .rr').forEach(function(el){ if (el.id !== 'title') io.observe(el); });

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
  qsa('.mega').forEach(function(el){ var g = document.createElement('div'); g.className = 'ghost-blur mega'; g.setAttribute('aria-hidden', 'true'); g.innerHTML = el.innerHTML.replace(/<span class="(?:ch|yc|yw|rc|rw)"[^>]*>/g, '<span>'); g.style.font = getComputedStyle(el).font; g.style.left = el.offsetLeft + 'px'; g.style.top = el.offsetTop + 'px'; g.style.width = el.offsetWidth + 'px'; el.parentNode.insertBefore(g, el); });

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
  /* document ranges of the scroll-driven sections, cached (re-measured on resize / load / when the page's height changes) */
  var SEC = {}, secDirty = true;
  function secRange(els){ var y = window.scrollY || window.pageYOffset, t = 1e9, b = -1e9, n = 0;
    els.forEach(function(el){ if (!el) return; var r = el.getBoundingClientRect(); t = Math.min(t, r.top + y); b = Math.max(b, r.bottom + y); n++; });
    return n ? {t: t, b: b} : null; }
  function secCache(){
    secDirty = false;
    SEC = { dial: secRange([philCols]), about: secRange([aboutPin]), appr: secRange([apprPin]), proc: secRange([procPin]), cta: secRange([ctaPin]),
            reads: secRange(reads.map(function(r){ return r.el; })), px: secRange(pxs.map(function(p){ return p.el; })), yode: secRange(yodeScroll),
            glass: secRange(flutes.map(function(f){ return f.parentNode; }).concat(gbarHost ? [gbarHost] : [])) };
  }
  function near(k, y, vh){ var r = SEC[k]; return !r || (r.b > y - vh * .6 && r.t < y + vh * 1.6); }
  window.addEventListener('load', function(){ secDirty = true; });
  if (window.ResizeObserver) new ResizeObserver(function(){ secDirty = true; }).observe(document.body);
  /* the logo shrinks with the first half-screen of scroll to ×0.609 (Figma 289:8827) and grows back at the top; eased on the
     scroll and followed with a light lag, so even a jump (a nav click) shrinks it smoothly */
  /* button labels roll through a blur on hover, variant A (css .bl/.bo/.bn): one block per line, two copies */
  qsa('.blk .t, .hdr .cta-blk .t, .pj4-cta .t').forEach(function(t){
    var lines = t.innerHTML.split(/<br\s*\/?>/i).map(function(l){ return l.replace(/<[^>]*>/g, ''); });
    t.parentNode.setAttribute('aria-label', lines.join(' '));
    t.innerHTML = lines.map(function(l, i){ return '<span class="bl" style="--i:' + i + '"><span class="bo" aria-hidden="true">' + l + '</span><span class="bn" aria-hidden="true">' + l + '</span></span>'; }).join('');
  });
  var wmCell = $('wmCell'), LOGO_S = 81 / 133, logoK = -1;
  function updateLogo(y, vh){
    if (!wmCell) return;
    var p = clamp01(y / (vh * .5)), t = 1 - (1 - LOGO_S) * (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    if (logoK < 0) logoK = t; else logoK += (t - logoK) * .2;
    if (Math.abs(t - logoK) < .0005) logoK = t;
    var v = logoK.toFixed(4); if (v !== wmCell.__k) { wmCell.__k = v; wmCell.style.transform = 'scale(' + v + ')'; }
  }
  function loop(now){
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    // hero parallax after the intro
    var pf = window.__perfLog ? performance.now() : 0;
    storyUpdate(vh);
    if (pf) { var pf2 = performance.now(); if (pf2 - pf > 8) (window.__perfStory = window.__perfStory || []).push([Math.round(pf), +ST.s.toFixed(2), +(pf2 - pf).toFixed(1), +(ST.dbg || 0).toFixed(1)]); }
    smoothStep(); y = window.scrollY || window.pageYOffset;
    /* v7.2: a section's update runs only while the section is near the screen. Each one reads layout after the previous one
       wrote styles, so running all nine every frame forced nine layouts a frame (holding still in the story: 45 fps) */
    if (secDirty || vh !== lastVH) secCache();
    if (near('dial', y, vh)) updateDial(vh); if (near('about', y, vh)) updateAbout(vh, now); if (near('appr', y, vh)) updateAppr(vh);
    if (near('proc', y, vh)) updateProc(vh); if (near('cta', y, vh)) updateCta(vh); if (near('reads', y, vh)) updateReads(vh);
    if (near('px', y, vh)) updatePx(vh); if (near('yode', y, vh)) updateYode(vh); if (near('glass', y, vh)) updateGlass(vh);
    if (y !== lastY || vh !== lastVH) { updateHdr(); updateChap(y, vh); }
    updateLogo(y, vh);
    lastY = y; lastVH = vh;
    requestAnimationFrame(loop);
  }

  window.__intro = { T: T, finish: finish, state: state, G: function(){ return G; }, seek: function(t){ cancelAnimationFrame(raf); if (!preDone) { preDone = true; pre.classList.add('out'); veil.classList.add('off'); st15.classList.add('on'); } state.t = t; render(t); }, slide: function(i){ showSlide(i); } };
})();
