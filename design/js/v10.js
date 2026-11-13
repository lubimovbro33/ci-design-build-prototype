/* CI · v10 — the menu. The square in the header opens it; the list is on the left, a photograph on the right follows the pointer. */
(function(){
  'use strict';
  var root = document.documentElement, mn = document.getElementById('mn'), btn = document.querySelector('.hdr .menu-sq');
  if (!mn || !btn) return;
  var links = [].slice.call(mn.querySelectorAll('.mn-nav a')), imgs = [].slice.call(mn.querySelectorAll('.mn-ph img')), cur = 0, loaded = false;
  function show(i){ if (i === cur || !imgs[i]) return; imgs[cur].classList.remove('on'); cur = i; imgs[i].classList.add('on'); }
  function open(){
    if (!loaded){ loaded = true; imgs.forEach(function(im){ im.src = im.getAttribute('data-src'); }); }   /* the photographs load on the first opening */
    root.classList.add('mn-open'); mn.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Close menu');
  }
  function close(){ root.classList.remove('mn-open'); mn.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Menu'); }
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', function(){ if (root.classList.contains('mn-open')) close(); else open(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') close(); });
  links.forEach(function(a, i){ a.style.setProperty('--i', i);
    a.addEventListener('mouseenter', function(){ show(i); }); a.addEventListener('focus', function(){ show(i); }); });
  /* a link that leads somewhere on this page closes the menu; the pages that are not built yet (href="#") leave it open */
  [].forEach.call(mn.querySelectorAll('a[href^="#"]'), function(a){ a.addEventListener('click', function(){ if (a.getAttribute('href').length > 1) close(); }); });
})();

/* ---------- v11 (10.11) · the rebuilt blocks: 09 Client (read on the scroll, then the datum line rises), 10 Reviews (two film cards) */
(function(){
  'use strict';
  function c01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sg(p, a, b){ return c01((p - a) / (b - a)); }
  function sm(x){ return x * x * (3 - 2 * x); }
  var pins = [], tick = 0;
  function run(){ tick = 0; var vh = window.innerHeight;
    pins.forEach(function(o){ var r = o.el.getBoundingClientRect(); if (r.bottom < -vh || r.top > 2 * vh) return;
      var p = c01(-r.top / Math.max(1, r.height - vh)); if (p !== o.p){ o.p = p; o.fn(p); } }); }
  function ask(){ if (!tick) tick = requestAnimationFrame(run); }
  window.addEventListener('scroll', ask, {passive: true}); window.addEventListener('resize', ask);

  /* 09 CLIENT */
  var cl = document.querySelector('.cl5');
  if (cl){
    var say = cl.querySelector('.cl5-say'), stage = cl.querySelector('.cl5-stage'), words = [], lit = 0;
    say.textContent.split(/\s+/).filter(Boolean).forEach(function(w, i){ if (!i) say.textContent = ''; var s = document.createElement('span'); s.className = 'w'; s.textContent = w; say.appendChild(s); say.appendChild(document.createTextNode(' ')); words.push(s); });
    pins.push({el: cl, p: -1, fn: function(p){
      var k = Math.round(sg(p, .03, .34) * words.length);
      if (k !== lit){ for (var i = Math.min(k, lit); i < Math.max(k, lit); i++) words[i].classList.toggle('lit', i < k); lit = k; }
      /* the second screen (her frame 456:14755): the photograph rises to the whole screen, then dims while the two centre hairlines draw and the small title
         comes in, then "So do we" rises from under its baseline; the last tenth holds */
      stage.style.setProperty('--f', sg(p, .36, .43).toFixed(3));
      stage.style.setProperty('--r', sm(sg(p, .42, .66)).toFixed(4));
      stage.style.setProperty('--v', sm(sg(p, .66, .78)).toFixed(4));
      stage.style.setProperty('--o2', sm(sg(p, .78, .91)).toFixed(4)); }});
  }

  /* 10 REVIEWS */
  var rv = document.querySelector('.rv5');
  if (rv){
    var cards = [].slice.call(rv.querySelectorAll('.rv5-c')), qs = [].slice.call(rv.querySelectorAll('.rv5-q'));
    var act = function(i){ cards.forEach(function(c, j){ c.classList.toggle('on', j === i); }); qs.forEach(function(q, j){ q.classList.toggle('on', j === i); }); };
    cards.forEach(function(c, i){ c.addEventListener('mouseenter', function(){ act(i); }); c.addEventListener('focus', function(){ act(i); }); c.addEventListener('click', function(){ act(i); }); });
  }
  ask();
})();
