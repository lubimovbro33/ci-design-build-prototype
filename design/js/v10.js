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
  /* 06 Projects (her note 13.11 23:23): the card's lead stands on the card's foot, where the rail would lie over it — while the card is under the rail,
     the rail starts right of the card (html.rail-pj) */
  var pjCard = document.querySelector('#projects .pj4-card'), pjMq = window.matchMedia ? window.matchMedia('(min-aspect-ratio: 1/1) and (min-width: 901px)') : null, pjOn = null;
  function railPj(vh){ if (!pjCard || !pjMq) return; var on = false; if (pjMq.matches){ var r = pjCard.getBoundingClientRect(); on = r.height > 0 && r.top < vh && r.bottom > vh - 36; }
    if (on !== pjOn){ pjOn = on; document.documentElement.classList.toggle('rail-pj', on); } }
  function run(){ tick = 0; var vh = window.innerHeight; railPj(vh);
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

  /* 10 REVIEWS · r3 (13.11 23:21) "the clients' windows": a facade in hairlines on the right; every client is a lit window. On the scroll a window
     grows out of the facade into a tall frame while its quote is inked beside it, then returns; at the end the whole facade is drawn, all windows lit. */
  var rv = document.querySelector('.rv6');
  if (rv){
    var NS = 'http://www.w3.org/2000/svg', rsvg = rv.querySelector('.rv6-svg'), rst = rv.querySelector('.rv6-stage'), rall = rv.querySelector('.rv6-all');
    var wins = [].slice.call(rv.querySelectorAll('.rv6-w')), qs = [].slice.call(rv.querySelectorAll('.rv6-q')), RN = wins.length, rsz = '', RG = null, rmq = window.matchMedia('(min-aspect-ratio: 1/1) and (min-width: 901px)');
    var CELL = [[1, 0], [3, 1], [0, 2]], rwords = qs.map(function(q){ var pp = q.querySelector('p'), ws = [];
      pp.textContent.split(/\s+/).filter(Boolean).forEach(function(w, i){ if (!i) pp.textContent = ''; var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; pp.appendChild(sp); pp.appendChild(document.createTextNode(' ')); ws.push(sp); });
      return {ws: ws, lit: 0}; });
    function f1(v){ return (Math.round(v * 10) / 10).toString(); }
    function rline(d){ var e = document.createElementNS(NS, 'path'); e.setAttribute('d', d); e.setAttribute('pathLength', '1'); rsvg.appendChild(e); }
    function rsq(x, y, d){ var e = document.createElementNS(NS, 'rect'); e.setAttribute('x', f1(x - d / 2)); e.setAttribute('y', f1(y - d / 2)); e.setAttribute('width', f1(d)); e.setAttribute('height', f1(d)); rsvg.appendChild(e); }
    function rsize(){
      var W = rst.clientWidth, H = rst.clientHeight, u = Math.min(W / 1920, H / 1080); while (rsvg.firstChild) rsvg.removeChild(rsvg.firstChild);
      rsvg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H));
      var fw = 862 * u, fh = 810 * u, fx = W - 50 * u - fw, fy = Math.max(180 * u, (H - fh) / 2 + 40 * u), C = 4, R = 3, bw = fw / C, fl = fh / R, ww = bw * .56, wh = fl * .68, e = 22 * u, c, r;
      for (r = 0; r <= R; r++) rline('M' + f1(fx - e) + ' ' + f1(fy + r * fl) + 'H' + f1(fx + fw + e));          /* floors */
      rline('M' + f1(fx - e) + ' ' + f1(fy - 9 * u) + 'H' + f1(fx + fw + e));                                       /* the cornice's second line */
      for (c = 0; c <= C; c++) rline('M' + f1(fx + c * bw) + ' ' + f1(fy) + 'V' + f1(fy + fh));                     /* bays */
      var cells = [];
      for (r = 0; r < R; r++) for (c = 0; c < C; c++){ var x = fx + c * bw + (bw - ww) / 2, y = fy + r * fl + (fl - wh) * .42;
        cells.push([c, r, x, y]);
        rline('M' + f1(x) + ' ' + f1(y) + 'h' + f1(ww) + 'v' + f1(wh) + 'h' + f1(-ww) + 'z');                         /* the window */
        rline('M' + f1(x + ww / 2) + ' ' + f1(y) + 'v' + f1(wh)); rline('M' + f1(x) + ' ' + f1(y + wh * .3) + 'h' + f1(ww));   /* mullion and transom */
        rline('M' + f1(x - 8 * u) + ' ' + f1(y + wh + 9 * u) + 'h' + f1(ww + 16 * u)); }                               /* the sill */
      rsq(fx - e, fy + fh, Math.max(5, 8 * u)); rsq(fx + fw + e, fy + fh, Math.max(5, 8 * u));
      var bwid = Math.min(560 * u, fw * .7), bh = Math.min(640 * u, fh * .86);
      RG = {cell: CELL.slice(0, RN).map(function(k){ var q = cells[k[1] * C + k[0]]; return [q[2], q[3], ww, wh]; }), big: [fx + (fw - bwid) / 2, fy + (fh - bh) / 2, bwid, bh]};
    }
    function rclear(){ wins.forEach(function(w){ ['left', 'top', 'width', 'height', 'opacity', 'zIndex'].forEach(function(k){ w.style[k] = ''; }); });
      qs.forEach(function(q){ q.style.opacity = q.style.visibility = ''; }); if (rall) rall.style.opacity = rall.style.visibility = ''; RG = null; rsz = ''; }
    wins.forEach(function(w, i){ w.addEventListener('click', function(){ if (!RG) return; var top = rv.getBoundingClientRect().top + window.pageYOffset, span = rv.offsetHeight - window.innerHeight;
      window.scrollTo({top: top + (.1 + (i + .45) * (.8 / RN)) * span, behavior: 'smooth'}); }); });
    pins.push({el: rv, p: -1, fn: function(p){
      if (!rmq.matches){ if (RG) rclear(); return; }
      var sz = window.innerWidth + 'x' + window.innerHeight; if (sz !== rsz || !RG){ rsz = sz; rsize(); }
      var seg = .8 / RN, E = 0, es = [], i, t, fin = sg(p, .92, .98);
      for (i = 0; i < RN; i++){ t = (p - .1 - i * seg) / seg; es[i] = (t <= 0 || t >= 1) ? 0 : sm(sg(t, 0, .22)) * (1 - sm(sg(t, .8, 1))); if (es[i] > E) E = es[i]; }
      rsvg.style.setProperty('--dr', sm(sg(p, 0, .09)).toFixed(3));
      rsvg.style.setProperty('--fo', (.16 + (.05 - .16) * E + (.33 - .16) * fin).toFixed(3));
      for (i = 0; i < RN; i++){ t = (p - .1 - i * seg) / seg; var e = es[i], a = RG.cell[i], b = RG.big, w = wins[i], q = qs[i], ws = rwords[i], on = t > 0 && t < 1;
        w.style.left = f1(a[0] + (b[0] - a[0]) * e) + 'px'; w.style.top = f1(a[1] + (b[1] - a[1]) * e) + 'px'; w.style.width = f1(a[2] + (b[2] - a[2]) * e) + 'px'; w.style.height = f1(a[3] + (b[3] - a[3]) * e) + 'px';
        w.style.opacity = (sg(p, .03 + .02 * i, .08 + .02 * i) * (1 - .92 * (E - e))).toFixed(3); w.style.zIndex = e > 0 ? 4 : 2; w.style.setProperty('--e', sg(e, .7, 1).toFixed(3));
        var qo = on ? sg(t, .1, .22) * (1 - sg(t, .76, .86)) : 0; q.style.opacity = qo.toFixed(3); q.style.visibility = qo > 0 ? 'visible' : 'hidden';
        var k = on ? Math.round(sg(t, .16, .66) * ws.ws.length) : 0;
        if (k !== ws.lit){ for (var j = Math.min(k, ws.lit); j < Math.max(k, ws.lit); j++) ws.ws[j].classList.toggle('lit', j < k); ws.lit = k; }
        q.style.setProperty('--l', (on ? sm(sg(t, .3, .5)) : 0).toFixed(3)); }
      if (rall){ rall.style.opacity = fin.toFixed(3); rall.style.visibility = fin > 0 ? 'visible' : 'hidden'; }
    }});
  }
  ask();
})();
