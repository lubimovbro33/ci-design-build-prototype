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
