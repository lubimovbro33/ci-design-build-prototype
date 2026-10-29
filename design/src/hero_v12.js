  /* ================================================================== 01 HERO v12 — the reel + the user's logo storyboard on the window side
     Shot 1 is the reel itself (CI × Ryan Hughes, 1916×1078 · 60 fps): the drone orbit of One Bennett at blue hour, the light
     running along the facade, arriving square to the window (0 → 3.78 s). There the reel PAUSES on a cleaned copy of that frame
     (the light frame retouched out, assets/reel/still_clean.jpg) and the storyboard plays in video space on top of it:
     the official logo draws clockwise exactly on the window frame's footprint → letters dissolve → the square erases clockwise
     while the warm light traces clockwise in its place, widening into the window's frame, the gap closes, bloom → the reel
     resumes at 3.78 s (its own light frame now sits exactly under ours), /CI · DESIGN+BUILD, through the glass, the bar.
     UI blur-in on the reel's cut at 5.75 s. All overlay geometry is in VIDEO pixels; .vs maps video → screen like object-fit:cover. */
  var vid=$('reel'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), cue=$('cue'), index=$('index'), row=$('row'),
      cur=$('cur'), hero=$('hero'), heroIn=qs('.hero-ui'), heroTitle=$('title'), stroke=$('stroke'), veil=$('veil'), dark=$('dark'),
      vs=$('vs'), still=$('still'), ov=$('ov'), logoG=$('logoG'), sqV=$('sqV'), ib=$('ib'), cMask=$('cMask'), tMask=$('tMask'), cF=$('cF'), tF=$('tF'),
      glowG=$('glowG'), gHalo=$('gHalo'), gMid=$('gMid'), gCore=$('gCore'), gHead=$('gHead'), ciSide=$('ciSide');
  var VW = 1916, VH = 1078;                                   // reel pixels
  var FR = {x:166, y:162, w:1277, h:733};                     // the reel's light frame, centreline, measured on the 3.78 s frame
  var SQ = {x0:96, y0:109, x1:602, y1:620, gy0:152, gy1:578}; // the logo square (centreline) + its gap, in logo units (viewBox 710×797)
  var F0 = (SQ.gy0 - SQ.y0) / (SQ.y1 - SQ.y0), F1 = (SQ.gy1 - SQ.y0) / (SQ.y1 - SQ.y0);
  var T = { skipIn:.6, hold:3.78, ui:5.75, loopAt:17.5 };    // reel seconds
  /* hold timeline (seconds from the pause) */
  var HT = { stillIn:.45, sqA:.3, sqB:1.4, cA:.9, cB:1.6, iA:1.4, iB:1.75, tA:1.65, tB:2.2, outA:2.75, outB:3.25, erA:2.8, erB:3.95, trA:2.8, trB:4.15, tightA:2.85, tightB:3.55, bloomA:4.15, bloomB:4.6, resume:4.65, end:5.35 };
  var state = {phase:'pre', done:false, skipped:false, t:0, held:false};
  var mx = 0, my = 0, pmx = 0, pmy = 0, scrollZoom = 0;
  var repeat = false; try { repeat = sessionStorage.getItem('ci-intro-v7') === '1'; } catch(e){}
  var HS = repeat ? .78 : 1;                                   // hold speed on repeat visits

  /* ---------- video space → screen (object-fit: cover; portrait keeps the tower: object-position 38 %) */
  var G = {};
  function layoutVS(){
    var vw = window.innerWidth, vh = window.innerHeight;
    var s = Math.max(vw / VW, vh / VH), px = (vh > vw) ? .38 : .5;
    G.s = s; G.ox = (vw - VW * s) * px; G.oy = (vh - VH * s) * .5;
    vs.style.transform = 'translate(' + G.ox.toFixed(2) + 'px,' + G.oy.toFixed(2) + 'px) scale(' + s.toFixed(5) + ')';
    vid.style.objectPosition = (px * 100) + '% 50%';
  }
  /* logo placement: its square sits on the frame's footprint — same height, centred */
  var k = FR.h / (SQ.y1 - SQ.y0), sqW = (SQ.x1 - SQ.x0) * k;
  var LSQ = {x: FR.x + FR.w / 2 - sqW / 2, y: FR.y, w: sqW, h: FR.h};
  logoG.setAttribute('transform', 'translate(' + (LSQ.x - SQ.x0 * k) + ' ' + (LSQ.y - SQ.y0 * k) + ') scale(' + k + ')');
  sqV.setAttribute('stroke-width', 7 * k);
  function sqPath(r){ return 'M' + (r.x + r.w) + ' ' + (r.y + r.h * F1) + ' V' + (r.y + r.h) + ' H' + r.x + ' V' + r.y + ' H' + (r.x + r.w) + ' V' + (r.y + r.h * F0); }
  function sqLen(r){ return r.h * (1 - F1) + r.w + r.h + r.w + r.h * F0; }
  function loopPath(r){ return 'M' + (r.x + r.w) + ' ' + (r.y + r.h * F1) + ' V' + (r.y + r.h) + ' H' + r.x + ' V' + r.y + ' H' + (r.x + r.w) + ' V' + (r.y + r.h * F1); }
  function loopLen(r){ return 2 * (r.w + r.h); }
  function loopPoint(r, d){                                    // point at distance d along loopPath (clockwise from the gap's lower end)
    var a = r.h * (1 - F1); if (d < a) return [r.x + r.w, r.y + r.h * F1 + d]; d -= a;
    if (d < r.w) return [r.x + r.w - d, r.y + r.h]; d -= r.w;
    if (d < r.h) return [r.x, r.y + r.h - d]; d -= r.h;
    if (d < r.w) return [r.x + d, r.y]; d -= r.w;
    return [r.x + r.w, r.y + Math.min(d, r.h * F1)];
  }
  function mixRect(a, b, p){ return {x:lerp(a.x, b.x, p), y:lerp(a.y, b.y, p), w:lerp(a.w, b.w, p), h:lerp(a.h, b.h, p)}; }
  function dash(el, len, p){ el.style.strokeDasharray = len; el.style.strokeDashoffset = len * (1 - p); }
  function erase(el, len, p){ el.style.strokeDasharray = '0 ' + (p * len) + ' ' + len; el.style.strokeDashoffset = 0; }
  var L = {ib: ib.getTotalLength(), c: cMask.getTotalLength()};

  /* ---------- the hold: logo → light frame, rendered from h = seconds since the pause */
  function renderHold(h){
    h = h / HS;
    var sIn = seg(h, 0, HT.stillIn, E.out);
    still.style.opacity = sIn; ciSide.style.opacity = sIn;
    /* logo draws clockwise */
    var r = mixRect(LSQ, FR, seg(h, HT.tightA, HT.tightB, E.expo));
    var sqD = seg(h, HT.sqA, HT.sqB, E.expo), er = seg(h, HT.erA, HT.erB, E.expo);
    sqV.setAttribute('d', sqPath(r)); var Ls = sqLen(r);
    if (er > 0) erase(sqV, Ls, er); else dash(sqV, Ls, sqD);
    sqV.style.opacity = er < 1 ? 1 : 0;
    dash(cMask, L.c, seg(h, HT.cA, HT.cB, E.expo)); dash(ib, L.ib, seg(h, HT.iA, HT.iB, E.out));
    tMask.setAttribute('width', 560 * seg(h, HT.tA, HT.tB, E.out));
    var lo = 1 - seg(h, HT.outA, HT.outB, E.expo); cF.style.opacity = lo; ib.style.opacity = lo; tF.style.opacity = lo;
    /* the light traces clockwise from the same gap, closes the gap last */
    var tr = seg(h, HT.trA, HT.trB, E.expo), Ll = loopLen(r), d = loopPath(r);
    gHalo.setAttribute('d', d); gMid.setAttribute('d', d); gCore.setAttribute('d', d);
    dash(gHalo, Ll, tr); dash(gMid, Ll, tr); dash(gCore, Ll, tr);
    var hp = loopPoint(r, tr * Ll); gHead.setAttribute('cx', hp[0]); gHead.setAttribute('cy', hp[1]); gHead.style.opacity = (tr > 0 && tr < 1) ? 1 : 0;
    var bloom = seg(h, HT.bloomA, HT.bloomA + .18, E.out) * (1 - seg(h, HT.bloomA + .18, HT.bloomB, E.out));
    var gOut = 1 - seg(h, HT.resume, HT.end, E.out);
    glowG.style.opacity = (tr > 0 ? 1 : 0) * gOut;
    gHalo.style.strokeWidth = 44 + 40 * bloom; gHalo.style.opacity = .55 + .45 * bloom; gMid.style.opacity = .9 + .1 * bloom;
    /* hand back to the reel: the retouched still fades, the reel's own light frame is already under ours */
    var back = seg(h, HT.resume, HT.resume + .4, E.out);
    if (back > 0) { still.style.opacity = 1 - back; ciSide.style.opacity = 1 - back; }
  }

  /* ---------- source */
  (function pickSource(){
    var big = Math.min(window.innerWidth, window.innerHeight) >= 520;
    var vp9 = !!vid.canPlayType && vid.canPlayType('video/webm; codecs="vp9"') === 'probably';
    var src = !big ? 'assets/reel/reel_720.mp4' : (vp9 ? 'assets/reel/reel_1080.webm' : 'assets/reel/reel_1080.mp4');
    var s = document.createElement('source'); s.src = src; s.type = /webm/.test(src) ? 'video/webm' : 'video/mp4'; vid.appendChild(s);
    if (!vp9 || !big) { var s2 = document.createElement('source'); s2.src = big ? 'assets/reel/reel_1080.mp4' : 'assets/reel/reel_720.mp4'; s2.type = 'video/mp4'; if (s2.src !== s.src) vid.appendChild(s2); }
    vid.load();
  })();

  /* ---------- preloader */
  var pre0 = performance.now(), preDone = false, canPlay = false, shown = 0;
  function markReady(){ canPlay = true; }
  vid.addEventListener('canplay', markReady); vid.addEventListener('canplaythrough', markReady); vid.addEventListener('loadeddata', function(){ if (vid.readyState >= 3) canPlay = true; });
  function buffered(){ try { if (vid.buffered.length && vid.duration) return vid.buffered.end(vid.buffered.length - 1) / Math.min(vid.duration, 7); } catch(e){} return 0; }
  function preTick(now){
    if (preDone) return;
    var el = (now - pre0) / 1000;
    var target = Math.max(Math.min(.9, el / 1.6), Math.min(1, buffered()));
    if (canPlay || vid.readyState >= 3 || el > 4 || repeat && el > .4) target = 1;
    shown += (target * 100 - shown) * .16; if (target >= 1 && shown > 98.5) shown = 100;
    cnt.textContent = (shown < 10 ? '0' : '') + Math.round(shown);
    if (shown >= 100) { preDone = true; startReel(); return; }
    requestAnimationFrame(preTick);
  }
  requestAnimationFrame(preTick);

  /* ---------- play / hold / play */
  var raf = null, holdStart = 0;
  function startReel(){
    pre.classList.add('out'); veil.classList.add('off');
    var p = vid.play(); if (p && p.catch) p.catch(function(){ setTimeout(finish, 600); });
    state.phase = 'play1';
    raf = requestAnimationFrame(tick);
  }
  function tick(now){
    var t = vid.currentTime || 0; state.t = t;
    if (state.phase === 'play1') {
      skip.classList.toggle('on', t > T.skipIn);
      if (t >= T.hold - .02 && !state.held) { state.held = true; vid.pause(); try { vid.currentTime = T.hold; } catch(e){} state.phase = 'hold'; holdStart = now; vs.classList.add('on'); renderHold(0); }
    } else if (state.phase === 'hold') {
      var h = (now - holdStart) / 1000; renderHold(h);
      if (h >= HT.resume * HS && vid.paused) { var p = vid.play(); if (p && p.catch) p.catch(function(){}); }
      if (h >= HT.end * HS) { state.phase = 'play2'; vs.classList.remove('on'); }
    } else if (state.phase === 'play2') {
      if (!state.done && t >= T.ui) finish();
      if (t >= T.loopAt && !vid.seeking) { try { vid.currentTime = 0; } catch(e){} }
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
    try { sessionStorage.setItem('ci-intro-v7', '1'); } catch(e){}
    startScroll();
  }
  function skipIntro(){
    if (state.done || state.skipped) return; state.skipped = true;
    if (!preDone) { preDone = true; startReel(); }
    state.held = true; state.phase = 'play2'; vs.classList.remove('on');
    try { vid.currentTime = T.ui + .05; } catch(e){} var p = vid.play(); if (p && p.catch) p.catch(function(){});
    finish();
  }
  skip.addEventListener('click', skipIntro);
  window.addEventListener('keydown', function(e){ if (!state.done && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipIntro(); } });

  /* ---------- cursor + mouse */
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var cx = 0, cy = 0, tx = 0, ty = 0, curLab = qs('.cl', cur);
  window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5); });
  (function curLoop(){ cx += (tx - cx) * .6; cy += (ty - cy) * .6; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(curLoop); })();
  document.addEventListener('pointerover', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw'); if (t) cur.classList.add('link'); });
  document.addEventListener('pointerout', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw'); if (t) cur.classList.remove('link'); });
  layoutVS();
  window.addEventListener('resize', function(){ layoutVS(); onResize(); });
  function heroScroll(hy, vh){
    var p = clamp01(hy / vh);
    scrollZoom = p * .08;
    dark.style.opacity = p * .8;
    heroIn.style.opacity = 1 - clamp01(p * 1.4); heroIn.style.transform = 'translateY(' + (hy * .12) + 'px)';
  }
