/* 26.11.2026 · the trial order of the home page (branch review-flow) — the seams that need the scroll.
   The designer: «Из услуг в проекты нужно проработать переход… обязательно между блоками нужно проработать плавные переходы,
   интересные переходы».

   Solutions → Projects → Philosophy. The projects' stage is pinned a little longer than its own screen, and the same window the
   slider already opens every next photograph out of (clip-path inset 37 % 52 % 37 % 34 %) is now driven by the scroll at both ends:
   · in — the stage arrives as the blue field Solutions ends on, with the first home seen through that small window; as the page
     is scrolled the window opens to the whole screen and the project's name, the card and the controls come in;
   · out — the name and the card leave, the photograph closes back into the window, the field goes to black and the light in the
     window goes out: Philosophy begins on that black.
   Between the two the block is exactly what it was (the class .flow comes off and the slider plays). Wide screens only. */
(function(){
  'use strict';
  var pj = document.getElementById('projects'), pin = pj && pj.querySelector('.pj4-pin');
  if (!pin || !window.matchMedia) return;
  var wide = window.matchMedia('(min-aspect-ratio: 1/1) and (min-width: 901px)'), OPEN = 75, CLOSE = 55, last = '', on = null;
  function cl(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function sm(t){ return t * t * (3 - 2 * t); }
  function io(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function set(flow, po, pu, pk, pd, play){
    var key = [flow, po.toFixed(4), pu.toFixed(3), pk.toFixed(3), pd.toFixed(3), play].join('/'); if (key === last) return; last = key;
    if (flow !== on){ on = flow; pj.classList.toggle('flow', flow); }
    pj.style.setProperty('--po', po.toFixed(4)); pj.style.setProperty('--pu', pu.toFixed(3)); pj.style.setProperty('--pk', pk.toFixed(3)); pj.style.setProperty('--pd', pd.toFixed(3));
    pj.classList.toggle('paused', !play);          /* the slider's own observer asks for 55 % of the section on screen — the pinned section is taller than that */
  }
  function tick(){
    if (!wide.matches){ if (on !== null){ on = null; last = ''; pj.classList.remove('flow'); ['--po', '--pu', '--pk', '--pd'].forEach(function(k){ pj.style.removeProperty(k); }); } }
    else {
      var vh = window.innerHeight, r = pin.getBoundingClientRect();
      if (r.bottom > -vh && r.top < 2 * vh){
        var y = -r.top, IN = OPEN * vh / 100, OUT = CLOSE * vh / 100, a = cl(y / IN), b = cl((y - (r.height - vh - OUT)) / OUT);
        var open = io(cl(a / .8)), ui = sm(cl((a - .6) / .4));
        var close = io(cl((b - .1) / .6)), uo = 1 - sm(cl(b / .3)), dark = sm(cl((b - .15) / .6)), off = sm(cl((b - .62) / .38));
        var flow = a < 1 || b > 0;
        set(flow, open * (1 - close), ui * uo, dark, off, !flow && r.top < vh * .45 && r.bottom > vh * .55);
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
