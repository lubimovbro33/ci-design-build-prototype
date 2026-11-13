/* CI Design + Build — chapters after the story (v8, user 03.11 19:58: "level up upgrade")
   One idea carried through the page: the drawing is the design, the live picture in a frame is the built home.
   Black, 1 px Bright Gray hairlines in three strengths, colour only inside frames, Gradient Blue accents.
   Every chapter is a pinned scene, a pure function of p = how far the pin has been scrolled (0..1).
   Chapters: 02 Philosophy — a day passes over the plan of a home. */
(function(){
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sg(x, a, b){ return clamp01((x - a) / (b - a)); }
  function sm(x){ x = clamp01(x); return x * x * (3 - 2 * x); }
  function eo(x){ x = clamp01(x); return 1 - Math.pow(1 - x, 3); }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v){ return Math.round(v * 10) / 10; }
  /* text is written only when it changes: a DOM text write every frame costs a third of the frame rate where the page is observed
     (the Vercel preview toolbar watches the DOM; measured on M4: 60 → 40 fps for one write per frame) */
  function txt(e, v){ v = String(v); if (e && e.__t !== v){ e.__t = v; e.textContent = v; } }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LITE = document.documentElement.classList.contains('lite');                 /* phones: no per-frame blur filters */

  /* v10 · text choreography. Every phase of a pinned chapter comes in line by line (the hero's focus-in), on the scroll.
     Words are wrapped once (.w); each knows its line (--l), the phase knows how many lines it has (--n) and where it is
     (--kin, --kout); CSS does the rest. A phase marked .st is a statement: it reports its presence to the stage (--st). */
  var PHASES = [].slice.call(document.querySelectorAll('.ph-t > [data-a], .ch-t > [data-a], .cl-t > [data-a]'));
  function splitPhase(e){
    [].forEach.call(e.querySelectorAll('h2,h3,p'), function(b){
      var tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT, null), nodes = [], n; while ((n = tw.nextNode())) nodes.push(n);
      nodes.forEach(function(t){ if (!t.nodeValue.trim()) return;
        var fr = document.createDocumentFragment();
        t.nodeValue.split(/([ \n\t]+)/).forEach(function(x){ if (!x) return;
          if (/^[ \n\t]+$/.test(x)){ fr.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w'; w.textContent = x; fr.appendChild(w); });
        t.parentNode.replaceChild(fr, t); }); });
    [].forEach.call(e.querySelectorAll('.pill, .ph-tag, .r3btn'), function(x){ x.classList.add('wx'); });
    e.classList.add('sp');
  }
  function linesOf(e){
    var line = -1, top = -1e9;
    [].forEach.call(e.querySelectorAll('.w, .wx'), function(w){
      if (w.classList.contains('wx')){ line++; top = -1e9; } else { var t = w.offsetTop; if (Math.abs(t - top) > 3){ line++; top = t; } }
      w.style.setProperty('--l', line); });
    e.style.setProperty('--n', Math.max(1, line + 1));
  }
  PHASES.forEach(splitPhase);
  function measurePhases(){ PHASES.forEach(linesOf); }
  measurePhases(); window.addEventListener('resize', measurePhases);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measurePhases);
  function phase(e, p){
    var a = +e.dataset.a, b = +e.dataset.b, len = Math.min(1, b - a), st8 = e.classList.contains('st'),
        din = st8 ? .03 : Math.min(.045, len * .4), dout = Math.min(.028, len * .25),   /* short phases keep a moment of rest */
        kin = sg(p, a, a + din), kout = sg(p, b - dout, b), key = kin.toFixed(3) + '/' + kout.toFixed(3);
    if (e.__ph === key) return; e.__ph = key;
    e.style.setProperty('--kin', kin.toFixed(3)); e.style.setProperty('--kout', kout.toFixed(3));
    e.style.visibility = kin > 0 && kout < 1 ? '' : 'hidden';
    if (!LITE){ var bl = (1 - kin) * 5 + kout * 4; e.style.filter = bl > .05 ? 'blur(' + bl.toFixed(2) + 'px)' : ''; }
    if (e.classList.contains('st')){ var st = e.__st || (e.__st = e.closest('.ch-stage')), v = kin * (1 - kout);
      if (st){ st.style.setProperty('--st', v.toFixed(3)); st.classList.toggle('st-on', v > 0); } }
  }

  /* a hairline that draws itself: pathLength 1, its own delay --d inside its group's progress --k (CSS does the rest) */
  function line(g, d, cls, delay){ var p = el('path', {d: d, pathLength: 1, 'class': 'dw ' + (cls || ''), 'vector-effect': 'non-scaling-stroke'}, g); p.style.setProperty('--d', f1(delay || 0)); return p; }
  function seg(x1, y1, x2, y2){ return 'M' + f1(x1) + ' ' + f1(y1) + 'L' + f1(x2) + ' ' + f1(y2); }
  function rectD(x, y, w, h, r){ if (!r) return 'M' + x + ' ' + y + 'H' + (x + w) + 'V' + (y + h) + 'H' + x + 'Z';
    return 'M' + (x + r) + ' ' + y + 'H' + (x + w - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w) + ' ' + (y + r) + 'V' + (y + h - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + w - r) + ' ' + (y + h) +
           'H' + (x + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x + ' ' + (y + h - r) + 'V' + (y + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + y + 'Z'; }
  function circD(cx, cy, r){ return 'M' + (cx - r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 1 0 ' + (cx - r) + ' ' + cy; }

  /* ================================================================== 02 PHILOSOPHY · a day over the plan of a home */
  function philosophy(){
    var sec = document.getElementById('philosophy'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), svg = sec.querySelector('#phPlan'), phases = [].slice.call(sec.querySelectorAll('.ph-t > [data-a]'));
    var vbs = [].slice.call(sec.querySelectorAll('.ph-verbs .vb')), pctEl = sec.querySelector('#phPct');
    var W = 1000, H = 640, T = 14;                                       /* plan units; exterior wall 14 */
    var gAll = el('g', {}, svg), gWall = el('g', {'class': 'dg'}, gAll), gWin = el('g', {'class': 'dg'}, gAll), gDoor = el('g', {'class': 'dg'}, gAll), gFur = el('g', {'class': 'dg'}, gAll);
    var defs = el('defs', {}, svg), gLight = el('g', {'clip-path': 'url(#phClip)'}, svg); svg.insertBefore(gLight, gAll);
    var clip = el('clipPath', {id: 'phClip'}, defs); el('rect', {x: T, y: T, width: W - 2 * T, height: H - 2 * T}, clip);
    /* exterior walls: two lines with breaks for the windows; the glazing sits in the breaks */
    var WIN = { n: [[590, 730]], s: [[60, 280], [380, 520], [560, 680], [770, 960]], e: [[60, 170], [300, 420], [460, 580]], w: [[50, 190], [330, 560]] };
    var DOORX = { n: [[400, 470]] };
    function side(k, len, at){                                           /* along a side: the pieces between openings */
      var cuts = (WIN[k] || []).concat(DOORX[k] || []).slice().sort(function(a, b){ return a[0] - b[0]; }), pts = [], x = 0;
      cuts.forEach(function(c){ pts.push([x, c[0]]); x = c[1]; }); pts.push([x, len]); return pts;
    }
    var delay = function(x, y){ return .02 + .5 * Math.hypot(x - 500, y - 320) / 600; };   /* the plan draws from its centre outward */
    side('n', W).forEach(function(r){ line(gWall, seg(r[0], 0, r[1], 0), 'w1', delay((r[0] + r[1]) / 2, 0)); line(gWall, seg(Math.max(T, r[0]), T, Math.min(W - T, r[1]), T), 'w1', delay((r[0] + r[1]) / 2, T)); });
    side('s', W).forEach(function(r){ line(gWall, seg(r[0], H, r[1], H), 'w1', delay((r[0] + r[1]) / 2, H)); line(gWall, seg(Math.max(T, r[0]), H - T, Math.min(W - T, r[1]), H - T), 'w1', delay((r[0] + r[1]) / 2, H)); });
    side('e', H).forEach(function(r){ line(gWall, seg(W, r[0], W, r[1]), 'w1', delay(W, (r[0] + r[1]) / 2)); line(gWall, seg(W - T, Math.max(T, r[0]), W - T, Math.min(H - T, r[1])), 'w1', delay(W, (r[0] + r[1]) / 2)); });
    side('w', H).forEach(function(r){ line(gWall, seg(0, r[0], 0, r[1]), 'w1', delay(0, (r[0] + r[1]) / 2)); line(gWall, seg(T, Math.max(T, r[0]), T, Math.min(H - T, r[1])), 'w1', delay(0, (r[0] + r[1]) / 2)); });
    var wins = [];                                                       /* window: jambs + two panes of glass; n = outward normal */
    WIN.n.forEach(function(r){ wins.push({a: [r[0], 0], b: [r[1], 0], n: [0, -1]}); });
    WIN.s.forEach(function(r){ wins.push({a: [r[0], H], b: [r[1], H], n: [0, 1]}); });
    WIN.e.forEach(function(r){ wins.push({a: [W, r[0]], b: [W, r[1]], n: [1, 0]}); });
    WIN.w.forEach(function(r){ wins.push({a: [0, r[0]], b: [0, r[1]], n: [-1, 0]}); });
    wins.forEach(function(w){
      var tx = -w.n[0] * T, ty = -w.n[1] * T, dl = delay((w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2) + .08;
      line(gWin, seg(w.a[0], w.a[1], w.a[0] + tx, w.a[1] + ty), 'w2', dl); line(gWin, seg(w.b[0], w.b[1], w.b[0] + tx, w.b[1] + ty), 'w2', dl);
      line(gWin, seg(w.a[0] + tx * .35, w.a[1] + ty * .35, w.b[0] + tx * .35, w.b[1] + ty * .35), 'w2', dl);
      line(gWin, seg(w.a[0] + tx * .65, w.a[1] + ty * .65, w.b[0] + tx * .65, w.b[1] + ty * .65), 'w2', dl);
    });
    /* the entry: jambs in the north wall */
    line(gWin, seg(400, 0, 400, T), 'w2', .1); line(gWin, seg(470, 0, 470, T), 'w2', .1);
    /* interior walls (single hairlines, with door openings) */
    [[0, 240, 70, 240], [270, 240, 340, 240], [540, 240, 600, 240], [660, 240, 800, 240], [860, 240, 1000, 240],
     [300, 0, 300, 150], [300, 210, 300, 240], [560, 0, 560, 60], [560, 120, 560, 240], [770, 0, 770, 240],
     [330, 240, 330, 300], [330, 560, 330, 640], [710, 240, 710, 470], [710, 530, 710, 640]].forEach(function(s){
      line(gWall, seg(s[0], s[1], s[2], s[3]), 'w1', delay((s[0] + s[2]) / 2, (s[1] + s[3]) / 2) + .04);
    });
    /* doors: leaf + swing */
    function door(hx, hy, lx, ly, ex, ey, sweep){ var dl = delay(hx, hy) + .12;
      line(gDoor, seg(hx, hy, lx, ly), 'w2', dl);
      var r = Math.hypot(lx - hx, ly - hy); line(gDoor, 'M' + lx + ' ' + ly + 'A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + ex + ' ' + ey, 'w3', dl);
    }
    door(400, T, 400, T + 70, 470, T, 0);                                /* entry, into the foyer */
    door(300, 150, 360, 150, 300, 210, 1);                               /* kitchen ↔ foyer */
    door(600, 240, 600, 180, 660, 240, 1);                               /* study */
    door(800, 240, 800, 180, 860, 240, 1);                               /* spa */
    door(710, 470, 770, 470, 710, 530, 1);                               /* bedroom */
    /* furniture, quiet */
    var fu = function(d, x, y){ line(gFur, d, 'w3', delay(x, y) + .2); };
    fu(rectD(846, 392, 126, 168, 6), 900, 470); fu(seg(846, 420, 972, 420), 900, 420); fu(rectD(946, 400, 20, 30, 3), 950, 410); fu(rectD(946, 522, 20, 30, 3), 950, 530);
    fu(rectD(820, 368, 156, 216), 880, 470);                             /* bed + rug */
    fu(rectD(420, 420, 220, 44, 8), 520, 440); fu(rectD(420, 464, 44, 110, 8), 440, 520); fu(circD(560, 520, 34), 560, 520); fu(rectD(400, 400, 260, 196), 520, 500);   /* sofa, table, rug */
    fu(rectD(686, 300, 24, 140), 700, 370);                              /* fireplace */
    fu(rectD(100, 380, 150, 120, 60), 175, 440);                         /* dining table */
    for (var i = 0; i < 3; i++){ fu(rectD(118 + i * 44, 356, 26, 18, 4), 130 + i * 44, 360); fu(rectD(118 + i * 44, 506, 26, 18, 4), 130 + i * 44, 515); }
    fu(rectD(76, 425, 18, 30, 4), 85, 440); fu(rectD(256, 425, 18, 30, 4), 265, 440);
    fu(rectD(90, 90, 150, 56, 4), 165, 118); fu(seg(T + 26, T, T + 26, 230), 30, 120); fu(seg(T, T + 26, 300, T + 26), 150, 30);   /* kitchen */
    fu(rectD(610, 150, 110, 50, 3), 665, 175); for (var k = 0; k < 6; k++) fu(seg(574, 30 + k * 30, 594, 30 + k * 30), 584, 100);   /* desk, library */
    fu(seg(574, 20, 574, 200), 574, 100); fu(seg(740, 30, 760, 30), 750, 30);
    fu(circD(430, 130, 30), 430, 130); fu(seg(316, 60, 316, 120), 316, 90); fu(seg(544, 140, 544, 200), 544, 170); fu(seg(470, 226, 530, 226), 500, 226);   /* foyer: table, art */
    fu(rectD(880, 40, 92, 52, 22), 920, 66); fu(rectD(790, 150, 60, 60), 820, 180); fu(seg(970, 120, 970, 220), 970, 170);   /* spa: tub, shower, vanity */
    /* verbs in their rooms (the copy's own words) */
    var VERB = [ {k: 'wake up', h: 6.5, x: 860, y: 330}, {k: 'recharge', h: 11, x: 640, y: 92}, {k: 'collect', h: 15, x: 400, y: 190},
                 {k: 'recover', h: 18, x: 860, y: 120}, {k: 'entertain', h: 20, x: 140, y: 300}, {k: 'gather', h: 21.5, x: 500, y: 360} ];
    var gTag = el('g', {}, svg), tags = VERB.map(function(v){
      var g = el('g', {'class': 'ph-tag', transform: 'translate(' + v.x + ' ' + v.y + ')'}, gTag);
      var ring = el('circle', {r: 4, 'class': 'ring', 'vector-effect': 'non-scaling-stroke'}, g);
      el('circle', {r: 2, 'class': 'dot'}, g);
      var t = el('text', {x: 10, y: 4, 'class': 'tx'}, g); t.textContent = v.k;
      return {v: v, g: g, ring: ring};
    });
    /* evening: lamps in the rooms where the evening happens */
    var gLamp = el('g', {}, svg); svg.insertBefore(gLamp, gAll);
    var lampGrad = el('radialGradient', {id: 'phLamp'}, defs); el('stop', {offset: '0', 'stop-color': '#EBEBEB', 'stop-opacity': '.16'}, lampGrad); el('stop', {offset: '1', 'stop-color': '#EBEBEB', 'stop-opacity': '0'}, lampGrad);
    var LAMP = [ {x: 175, y: 440, r: 150, a: 19.5, b: 23.4}, {x: 520, y: 480, r: 190, a: 21, b: 23.6}, {x: 900, y: 470, r: 120, a: 22.6, b: 23.9}, {x: 165, y: 118, r: 110, a: 19, b: 22.4} ];
    LAMP.forEach(function(l){ l.e = el('circle', {cx: l.x, cy: l.y, r: l.r, fill: 'url(#phLamp)', opacity: 0}, gLamp); });
    /* sunlight: a shaft through every window the sun can see, travelling with the hour */
    wins.forEach(function(w, i){
      var gr = el('linearGradient', {id: 'phSun' + i, gradientUnits: 'userSpaceOnUse'}, defs);
      el('stop', {offset: '0', 'stop-color': '#EBEBEB', 'stop-opacity': '.2'}, gr); el('stop', {offset: '.55', 'stop-color': '#EBEBEB', 'stop-opacity': '.07'}, gr); el('stop', {offset: '1', 'stop-color': '#EBEBEB', 'stop-opacity': '0'}, gr);
      w.gr = gr; w.poly = el('polygon', {fill: 'url(#phSun' + i + ')', opacity: 0}, gLight);
    });
    /* the day as a scale bar under the plan (00 … 24); the hours at home fill it — 75 % */
    var gRule = el('g', {'class': 'dg ph-rule'}, svg), RY = H + 92;
    line(gRule, seg(0, RY, W, RY), 'w2', .0);
    for (var hh = 0; hh <= 24; hh++){ var xx = W * hh / 24, big = hh % 6 === 0; line(gRule, seg(xx, RY - (big ? 10 : 5), xx, RY), big ? 'w2' : 'w3', .02 + hh * .012); }
    ['00', '06', '12', '18', '24'].forEach(function(s, i){ var t = el('text', {x: W * i / 4, y: RY + 26, 'class': 'rl', 'text-anchor': 'middle'}, gRule); t.textContent = s; });
    var fill = el('path', {d: seg(W * 6 / 24, RY, W, RY), 'class': 'ph-fill', pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, svg);
    var cursor = el('g', {'class': 'ph-cur'}, svg); el('path', {d: seg(0, RY - 22, 0, RY + 6), 'vector-effect': 'non-scaling-stroke'}, cursor); el('rect', {x: -3, y: RY - 25, width: 6, height: 6}, cursor);
    /* the clock: every hour and every ten minutes already set as text, one of each shown (no text is written while the day runs) */
    var HRS = [], MNS = [], shownH = null, shownM = null;
    for (var q = 0; q < 24; q++){ var th0 = el('text', {x: 2, y: RY - 36, 'class': 'hr', 'text-anchor': 'end'}, cursor); th0.textContent = (q < 10 ? '0' : '') + q + ':'; th0.style.display = 'none'; HRS.push(th0); }
    for (var q2 = 0; q2 < 6; q2++){ var tm0 = el('text', {x: 2, y: RY - 36, 'class': 'hr', 'text-anchor': 'start'}, cursor); tm0.textContent = q2 + '0'; tm0.style.display = 'none'; MNS.push(tm0); }
    function clock(h, m){ var a = HRS[h], b = MNS[m]; if (a !== shownH){ if (shownH) shownH.style.display = 'none'; a.style.display = ''; shownH = a; } if (b !== shownM){ if (shownM) shownM.style.display = 'none'; b.style.display = ''; shownM = b; } }
    /* five, ten, twenty years: the home's outline grows outward like rings */
    var gYrs = el('g', {'class': 'dg'}, svg), YR = [{d: 34, t: '5'}, {d: 70, t: '10'}, {d: 112, t: '20'}];
    YR.forEach(function(y, i){ line(gYrs, rectD(-y.d, -y.d, W + 2 * y.d, H + 2 * y.d, y.d * .9), 'w3 yr', i * .22);
      var t = el('text', {x: W + y.d - 6, y: -y.d - 8, 'class': 'yl', 'text-anchor': 'end'}, gYrs); t.textContent = y.t; y.t2 = t; });
    var yrLab = el('text', {x: W + 112, y: -112 - 26, 'class': 'yl lab', 'text-anchor': 'end'}, gYrs); yrLab.textContent = 'YEARS FROM NOW';
    var stage = sec.querySelector('.ch-stage');

    function update(p){
      /* text: one phase at a time, cross-fading with a small rise */
      phases.forEach(function(e){ phase(e, p); });
      /* the plan draws itself, then dims a little at the close */
      var kd = sg(p, .0, .12); [gWall, gWin, gDoor, gFur].forEach(function(g){ g.style.setProperty('--k', kd.toFixed(3)); });
      gAll.style.opacity = (1 - .45 * sg(p, .9, 1)).toFixed(3);
      /* the 75 %: the at-home hours fill the scale bar */
      var kr = sg(p, .1, .15); gRule.style.setProperty('--k', kr.toFixed(3));
      var kf = eo(sg(p, .13, .22)); fill.style.strokeDashoffset = (1 - kf).toFixed(4);
      txt(pctEl, Math.round(75 * kf)); stage.style.setProperty('--pc', (sg(p, .11, .15) * (1 - sg(p, .325, .35))).toFixed(3));
      /* the day: 06:00 → 24:00 while the verbs are read */
      var hr = 5 + 19 * sg(p, .36, .76), th = Math.min(23.99, hr), mm = Math.floor((th % 1) * 6) * 10;   /* the clock ticks in tens of minutes */
      clock(Math.floor(th), mm / 10);
      
      cursor.setAttribute('transform', 'translate(' + f1(W * th / 24) + ' 0)'); cursor.style.opacity = (sg(p, .34, .38) * (1 - sg(p, .9, .96))).toFixed(3);
      var day = sm((hr - 5.6) / 1.2) * (1 - sm((hr - 18.6) / 1.4)), theta = (hr - 6) / 12 * Math.PI, sx = -Math.cos(theta), sy = -Math.sin(theta), elev = Math.max(0, Math.sin(theta));
      var L = 220 + 420 * (1 - elev);
      wins.forEach(function(w){
        var k = -(sx * w.n[0] + sy * w.n[1]);                            /* the sun reaches in through this window */
        var a = day * Math.max(0, k) * (.6 + .4 * elev);
        if (a < .01){ w.poly.setAttribute('opacity', 0); return; }
        var ax = w.a[0], ay = w.a[1], bx = w.b[0], by = w.b[1];
        w.poly.setAttribute('points', [ax, ay, bx, by, bx + sx * L, by + sy * L, ax + sx * L, ay + sy * L].map(f1).join(' '));
        var mx = (ax + bx) / 2, my = (ay + by) / 2;
        w.gr.setAttribute('x1', f1(mx)); w.gr.setAttribute('y1', f1(my)); w.gr.setAttribute('x2', f1(mx + sx * L)); w.gr.setAttribute('y2', f1(my + sy * L));
        w.poly.setAttribute('opacity', a.toFixed(3));
      });
      LAMP.forEach(function(l){ l.e.setAttribute('opacity', (sm((hr - l.a) / .6) * (1 - sm((hr - l.b) / .5))).toFixed(3)); });
      /* verbs light up in their rooms and in the sentence at their hour */
      tags.forEach(function(t, i){ var on = sg(hr, t.v.h, t.v.h + .35), seen = hr >= t.v.h;
        t.g.style.opacity = (on * (seen ? 1 : 0) * (1 - .45 * sg(hr, t.v.h + 1.2, t.v.h + 2)) * (1 - sg(p, .9, .97))).toFixed(3);
        var pr = sg(hr, t.v.h, t.v.h + .9); t.ring.setAttribute('r', f1(4 + 26 * eo(pr))); t.ring.style.opacity = (1 - pr).toFixed(3);
        var vb = vbs.filter(function(v){ return v.textContent.trim() === t.v.k; })[0]; if (vb) vb.classList.toggle('on', seen && p < .9); });
      var curK = null, curH = -1; tags.forEach(function(t){ if (hr >= t.v.h && t.v.h > curH){ curH = t.v.h; curK = t.v.k; } });
      vbs.forEach(function(v){ v.classList.toggle("vcur", p < .9 && v.textContent.trim() === curK); });
      /* the years */
      var ky = sg(p, .74, .84); gYrs.style.setProperty('--k', ky.toFixed(3)); gYrs.style.opacity = (1 - sg(p, .9, .97)).toFixed(3);
      YR.forEach(function(y, i){ y.t2.style.opacity = sg(ky, i * .22 + .1, i * .22 + .3).toFixed(3); }); yrLab.style.opacity = sg(ky, .7, 1).toFixed(3);
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 03 ABOUT · five firms, five misregistered layers → one section under one roof */
  function about(){
    var sec = document.getElementById('about'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), svg = sec.querySelector('#abDraw'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]'));
    var stage = sec.querySelector('.ch-stage'), pctEl = sec.querySelector('#abPct');
    var defs = el('defs', {}, svg);
    /* a two-storey residence in section, x 40..860, ground y 600, upper floor y 330, eaves y 80 */
    var LAY = [
      { k: 'ARCHITECTS', off: [-250, -40, -2.5] }, { k: 'DESIGNERS', off: [-110, 60, 1.6] }, { k: 'CONTRACTORS', off: [40, -70, -1.2] },
      { k: 'VENDORS', off: [170, 50, 2.2] }, { k: 'INSTALLERS', off: [300, -30, -1.8] } ];
    /* v13 (user 09.11 15:03, his frames 11/12): no rainbow — the design system's Bright Gray for every firm, hairline card frames;
       the house sits in the middle of the screen (frame 11: 644…1276 × 273…806 at 1920, ×.718) and comes apart into five cards in one
       straight row along the bottom (frame 12: 356.8 × 224.9 from x 24, 22 apart, label above, box top 827.3) */
    var ONE = [235, 235, 235], COL = [ONE, ONE, ONE, ONE, ONE];
    function mix(a, b, t){ return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }
    var gSec = el('g', {}, svg), gH = el('g', {}, svg);   /* gSec: the five layers in screen units; gH: house units (roof, disciplines, time) */
    LAY.forEach(function(L, i){ L.g = el('g', {'class': 'dg'}, gSec); L.box = el('path', {d: rectD(-10, 50, 920, 580), 'class': 'box', 'vector-effect': 'non-scaling-stroke'}, L.g);
      L.t = el('text', {x: -10, y: 36, 'class': 'lt'}, L.g); L.t.textContent = L.k; L.c = COL[i];
      L.t.style.fill = mix(L.c, L.c, 0); L.box.style.stroke = mix(L.c, L.c, 0); L.box.style.fill = mix(L.c, L.c, 0); L.g.style.setProperty('--hl', mix(L.c, L.c, 0)); });
    var A = LAY[0].g, D = LAY[1].g, C = LAY[2].g, V = LAY[3].g, I = LAY[4].g;
    var dly = function(x, y){ return .05 + .45 * (Math.abs(x - 450) / 450 * .5 + Math.abs(y - 340) / 300 * .5); };
    /* architects: the envelope and its openings */
    [[40, 80, 40, 400], [40, 520, 40, 600], [54, 80, 54, 400], [54, 520, 54, 600], [860, 80, 860, 150], [860, 270, 860, 600], [846, 80, 846, 150], [846, 270, 846, 600],
     [40, 80, 860, 80]].forEach(function(q){ line(A, seg(q[0], q[1], q[2], q[3]), 'w1', dly(q[0], q[1])); });
    [[40, 400, 54, 400], [40, 520, 54, 520], [47, 400, 47, 520], [860, 150, 846, 150], [860, 270, 846, 270], [853, 150, 853, 270]].forEach(function(q){ line(A, seg(q[0], q[1], q[2], q[3]), 'w2', dly(q[0], q[1]) + .05); });
    /* contractors: foundation, slabs, stair */
    [[0, 600, 900, 600], [40, 614, 860, 614], [40, 330, 860, 330], [40, 344, 540, 344], [700, 344, 860, 344]].forEach(function(q){ line(C, seg(q[0], q[1], q[2], q[3]), 'w1', dly((q[0] + q[2]) / 2, q[1])); });
    line(C, seg(60, 614, 60, 650), 'w2', .3); line(C, seg(840, 614, 840, 650), 'w2', .3); line(C, seg(30, 650, 90, 650), 'w2', .32); line(C, seg(810, 650, 870, 650), 'w2', .32);
    var st = 'M540 600'; for (var k = 0; k < 9; k++) st += 'H' + (540 + (k + 1) * 18) + 'V' + (600 - (k + 1) * 30); line(C, st, 'w2', .25); line(C, seg(540, 600, 702, 330), 'w3', .3);
    /* designers: partitions, kitchen, millwork */
    line(D, seg(470, 80, 470, 250), 'w2', .2); line(D, seg(470, 250, 470, 330), 'w3', .25);
    line(D, rectD(80, 520, 210, 80), 'w2', .22); line(D, seg(80, 540, 290, 540), 'w3', .26); line(D, rectD(80, 400, 210, 50), 'w2', .24); line(D, seg(150, 400, 150, 450), 'w3', .26); line(D, seg(220, 400, 220, 450), 'w3', .26);
    line(D, rectD(700, 150, 130, 180), 'w2', .2); for (var j = 1; j < 5; j++) line(D, seg(700, 150 + j * 36, 830, 150 + j * 36), 'w3', .24);
    /* vendors: what fills the rooms */
    line(V, 'M330 600V560Q330 548 342 548H508Q520 548 520 560V600', 'w2', .3); line(V, seg(330, 572, 520, 572), 'w3', .32);
    line(V, seg(360, 548, 360, 530), 'w3', .33); line(V, seg(490, 548, 490, 530), 'w3', .33); line(V, seg(355, 530, 495, 530), 'w3', .33);
    line(V, rectD(90, 285, 210, 45, 6), 'w2', .3); line(V, seg(90, 300, 300, 300), 'w3', .32); line(V, rectD(84, 250, 14, 80), 'w3', .33);
    line(V, 'M530 330V308Q530 300 538 300H672Q680 300 680 308V330', 'w2', .32);              /* the bath */
    line(V, rectD(150, 560, 90, 8), 'w3', .34); line(V, seg(160, 568, 160, 600), 'w3', .34); line(V, seg(230, 568, 230, 600), 'w3', .34);
    /* installers: light, art, curtains */
    [[195, 344, 195, 470], [420, 80, 420, 200]].forEach(function(q){ line(I, seg(q[0], q[1], q[2], q[3]), 'w3', .35); });
    line(I, 'M170 470H220L210 482H180Z', 'w2', .36); line(I, 'M400 200H440L432 212H408Z', 'w2', .36);
    line(I, rectD(580, 150, 80, 100), 'w2', .36); line(I, rectD(590, 160, 60, 80), 'w3', .38);
    for (var c = 0; c < 4; c++){ line(I, seg(64 + c * 6, 395, 64 + c * 6, 525), 'w3', .4); line(I, seg(836 - c * 6, 145, 836 - c * 6, 275), 'w3', .4); }
    /* the roof: one line over everything */
    var gRoof = el('g', {'class': 'dg roof'}, gH);
    line(gRoof, 'M10 92L450 -110L890 92', 'w1', 0); line(gRoof, 'M40 80L450 -92L860 80', 'w2', .1);
    /* disciplines, each pointing at its part of the house */
    var DIS = [['ARCHITECTURE', 47, 460, -1], ['INTERIOR DESIGN', 765, 240, 1], ['CONSTRUCTION', 640, 460, 1], ['FURNISHINGS', 425, 548, 1], ['ART', 620, 200, 1],
               ['WELLNESS', 605, 300, 1], ['PROCUREMENT', 185, 425, -1], ['INSTALLATION', 195, 476, -1], ['PROJECT MANAGEMENT', 450, -60, 1]];
    var gDis = el('g', {}, gH), dis = DIS.map(function(d, i){
      var g = el('g', {'class': 'ab-dis'}, gDis), lx = d[3] > 0 ? 960 : -20, ly = 20 + i * 64;   /* left labels closer in, clear of the text column (v13) */
      if (d[0] === 'PROJECT MANAGEMENT') ly = -120; if (d[0] === 'ARCHITECTURE') ly = -80; if (d[0] === 'PROCUREMENT') ly = 700; if (d[0] === 'INSTALLATION') ly = 740;
      el('path', {d: 'M' + d[1] + ' ' + d[2] + 'L' + (d[3] > 0 ? lx - 20 : lx + 20) + ' ' + ly + 'H' + lx, 'class': 'ld', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, g);
      el('rect', {x: d[1] - 3, y: d[2] - 3, width: 6, height: 6, 'class': 'sq'}, g);
      var t = el('text', {x: lx + (d[3] > 0 ? 10 : -10), y: ly + 5, 'class': 'dt', 'text-anchor': d[3] > 0 ? 'start' : 'end'}, g); t.textContent = d[0];
      return g; });
    /* v14 (user 15:24: all at once read as too many lines) — three scenes instead of one crowded screen:
       1 · the house with its disciplines; 2 · the house steps out and time takes the stage: the 20 % above a wide, quiet chart
       (a ruler, the traditional model's five hand-offs hatched in grey, CI's overlapping five hatched in Bright Gray, the saved fifth
       dimensioned); 3 · only one line is left — your decisions as five squares, everything in between hatched: ours.
       Screen units: the chart is 1080 wide (1:1 at 1920), placed by layout(). */
    [['abStG', '#7B8087'], ['abStW', '#EBEBEB']].forEach(function(q){ var pt = el('pattern', {id: q[0], width: 4, height: 12, patternUnits: 'userSpaceOnUse'}, defs); el('rect', {width: 1, height: 12, fill: q[1]}, pt); });
    var gT = el('g', {'class': 'ab-time'}, svg), PW = 1080;
    var trad = [[0, .16], [.21, .37], [.42, .66], [.71, .84], [.88, 1]], ci = [[0, .2], [.08, .36], [.18, .66], [.4, .72], [.56, .8]];
    /* v12 (10.11 06:26: "всё контурное, сливается"). The same comparison, in solid planes that read in a second:
       row 1 — the traditional model: five grey blocks with waiting (hatched) between them, running to 100 %;
       row 2 — CI: one light plane, the same five works overlapping inside it, finished at 80 %; the fifth that is left is
       a blue plane carrying the figure — the card of the hero (label top-left, figure bottom-left, square bottom-right). */
    var TY = 89, TH = 50, CY = 217, CH2 = 100, SX = PW * .8;   /* r3: her frame — ruler, label, blocks, label, the CI plane */
    el('path', {d: seg(0, 0, PW, 0), 'class': 'rl', 'vector-effect': 'non-scaling-stroke'}, gT);
    [0, .25, .5, .75, 1].forEach(function(t, i){ el('path', {d: seg(t * PW, -4, t * PW, 4), 'class': 'rl', 'vector-effect': 'non-scaling-stroke'}, gT);
      var tt = el('text', {x: t * PW, y: -12, 'class': 'tk', 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}, gT); tt.textContent = i === 4 ? '100%' : String(t * 100); });
    var lab1 = el('text', {x: PW / 2, y: TY - 30, 'class': 'tl2', 'text-anchor': 'middle'}, gT); lab1.textContent = 'THE TRADITIONAL MODEL';
    var lab2 = el('text', {x: PW / 2, y: CY - 32, 'class': 'tl2', 'text-anchor': 'middle'}, gT); lab2.textContent = 'CI DESIGN + BUILD';
    var bars = [], fades = [];
    var TN = ['ARCHITECTS', 'DESIGNERS', 'CONTRACTORS', 'VENDORS', 'INSTALLERS'], CN = ['ARCHITECTURE', 'INTERIOR DESIGN', 'CONSTRUCTION', 'FURNISHINGS', 'INSTALLATION'];
    trad.forEach(function(b, i){ var d = i * .2;
      if (i){ var g0 = trad[i - 1][1]; fades.push({e: el('rect', {x: g0 * PW + 3, y: TY, width: (b[0] - g0) * PW - 6, height: TH, fill: 'none', opacity: 0}, gT), d: d - .05}); }
      bars.push({e: el('rect', {x: b[0] * PW, y: TY, width: 0, height: TH, 'class': 'tb'}, gT), w: (b[1] - b[0]) * PW, d: d});
      var t = el('text', {x: b[0] * PW + 9, y: TY + 15, 'class': 'nm', opacity: 0}, gT); t.textContent = TN[i]; fades.push({e: t, d: d + .1}); });
    var ciP = el('rect', {x: 0, y: CY, width: 0, height: CH2, 'class': 'cb'}, gT);
    ci.forEach(function(b, i){ var y = CY + 17 + i * 18, d = 1.25 + i * .12;
      var t = el('text', {x: b[0] * PW + 9, y: y, 'class': 'nm k', opacity: 0}, gT); t.textContent = CN[i]; fades.push({e: t, d: d});
      bars.push({e: el('rect', {x: b[0] * PW + 9, y: y + 4, width: 0, height: 1.6, 'class': 'cl'}, gT), w: (b[1] - b[0]) * PW - 18, d: d}); });
    var svB = el('rect', {x: SX + 3, y: CY, width: 0, height: CH2, 'class': 'sb'}, gT), SW = PW - SX - 3;
    var svG = el('g', {opacity: 0}, gT);
    var s1 = el('text', {x: SX + 14, y: CY + 19, 'class': 'sl'}, svG); s1.textContent = 'PROJECT TIME SAVED';
    var s2 = el('text', {x: SX + 14, y: CY + 28.5, 'class': 'sl'}, svG); s2.textContent = 'AVERAGE';
    var svN = el('text', {x: SX + 12, y: CY + CH2 - 13, 'class': 'big'}, svG), svV = el('tspan', {}, svN), svP = el('tspan', {'class': 'pc', dx: 7, dy: -27}, svN); svV.textContent = '0'; svP.textContent = '%';
    var svQ = el('rect', {x: PW - 17, y: CY + CH2 - 17, width: 6, height: 6, fill: '#000'}, svG);
    /* r3 (her note 13.11 19:23: "why are these blocks not the full container?"): on a window lower than 16:9 the chart keeps the
       container's full width and only its heights follow the window — the group is scaled by x and y apart, and every text (and
       the little square) is narrowed back by the same ratio about its own anchor, so the letters stay in proportion */
    var tFit = [].slice.call(gT.querySelectorAll('text'));
    /* scene 3: your decisions (squares) on one line; everything in between, hatched, is ours */
    var gO = el('g', {'class': 'ab-own'}, svg), MS = [0, .22, .41, .63, 1];
    var own = el('path', {d: seg(0, 0, PW, 0), 'class': 'own', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, gO);
    var hat = MS.slice(1).map(function(m, i){ var a = MS[i]; return {e: el('rect', {x: a * PW + 14, y: -6, width: 0, height: 12, fill: 'url(#abStW)', 'class': 'br'}, gO), w: (m - a) * PW - 28}; });
    var dots = MS.map(function(m){ return el('rect', {x: m * PW - 5, y: -5, width: 10, height: 10, 'class': 'ms'}, gO); });

    /* r3 (13.11, her frame 03 About · 7): no slider. One line across the screen; one circle draws in the middle, comes apart
       into two that overlap — "we own everything in between" stands in the overlap — then a smaller circle draws at each end;
       squares mark where the circles meet the line. Units: 1/1920 of the width, origin at the middle of the line. */
    var gC = el('g', {'class': 'ab-circ'}, svg);
    /* her stroke paint (Figma 441:6745…): linear, paint opacity .33, stops 0 → alpha 1, .514 → alpha .43, transform .915 / −.024:
       33 % at the edge that faces the middle of the screen, falling to 14 % at 59 % of the width, 14 % beyond. The circles are
       drawn turned by ±90° (so the stroke starts at the top), hence the gradient runs along their local y. */
    [['abCgA', .0262, 1.1191], ['abCgB', .9738, -.1191]].forEach(function(q){ var g = el('linearGradient', {id: q[0], x1: 0, x2: 0, y1: q[1], y2: q[2]}, defs);
      el('stop', {offset: 0, 'stop-color': '#EBEBEB', 'stop-opacity': .33}, g); el('stop', {offset: .514, 'stop-color': '#EBEBEB', 'stop-opacity': .142}, g); el('stop', {offset: 1, 'stop-color': '#EBEBEB', 'stop-opacity': .142}, g); });
    var lgr = el('linearGradient', {id: 'abLg', gradientUnits: 'userSpaceOnUse', x1: -1020, y1: 0, x2: 1020, y2: 0}, defs); el('stop', {offset: 0, 'stop-color': '#EBEBEB', 'stop-opacity': .1}, lgr); el('stop', {offset: .5, 'stop-color': '#EBEBEB', 'stop-opacity': .33}, lgr); el('stop', {offset: 1, 'stop-color': '#EBEBEB', 'stop-opacity': .1}, lgr);
    var cLine = el('path', {d: 'M0 0H0', 'class': 'cl'}, gC), R1 = 245, R2 = 129, DX = 169, EX = 781;
    var mkC = function(r){ return el('circle', {r: r, cx: 0, cy: 0, 'class': 'cc', pathLength: 1, transform: 'rotate(-90)'}, gC); };
    var cA = mkC(R1), cB = mkC(R1), cS1 = mkC(R2), cS2 = mkC(R2);
    cA.style.stroke = 'url(#abCgB)'; [cB, cS1, cS2].forEach(function(c){ c.style.stroke = 'url(#abCgA)'; });   /* each one brighter towards the middle */
    cS1.setAttribute('transform', 'translate(' + (-EX) + ' 0) rotate(90)'); cS2.setAttribute('transform', 'translate(' + EX + ' 0) rotate(-90)');
    var cQ = [-(EX - R2), -(DX + R1), DX + R1, EX - R2].map(function(x){ return el('rect', {x: x - 4, y: -4, width: 8, height: 8, 'class': 'cq', opacity: 0}, gC); });
    var one = sec.querySelector('#abOne'), ows = one ? [].slice.call(one.querySelectorAll('.ws b')) : [], oneW = -1, IN = .2, wsBox = one && one.querySelector('.ws');
    function oneFit(){}   /* the word sits on its own centred line now: nothing to measure */
    var LY = null, last = -1, OWN_DS = 1;
    function layout(){
      var w = svg.clientWidth || window.innerWidth, h = svg.clientHeight || window.innerHeight, port = w / h < 1, VW = port ? 1080 : 1920, VH = VW * h / w;
      svg.setAttribute('viewBox', '0 0 ' + VW + ' ' + f1(VH));
      /* v15 (user 15:27): bigger, and the walls (y 80…650, not the roof) centred on the screen from the first frame */
      var k = port ? 1 : Math.min(1, (h / 1080) / (w / 1920));   /* r3: a window lower than 16:9 — the frame is fitted by height */
      var hs = port ? VW * .76 / 880 : .86 * k, cx = VW / 2, cy = port ? VH * .36 : VH / 2 + 10 * k;
      var m = port ? 24 : 48 * k, gap = 22, cols = port ? 3 : 5,   /* the row keeps the text margin (48 of the frame, as --x:48), not the header's 24 */
       cw = (VW - 2 * m - (cols - 1) * gap) / cols, sc = cw / 920, chh = 580 * sc;
      /* the row stands 24 above the chapter rule at the bottom (user 15:22: it ran into it on a 16:10 screen) */
      var chap = document.querySelector('.chap'), navTop = chap && chap.getBoundingClientRect().height ? chap.getBoundingClientRect().top : h - 60;
      var top = port ? VH * .58 : Math.min(VH - 40, (navTop - 40) * VW / w) - chh;
      /* type pass: the H2 title is wider now — if its longest line would come within 48 of the house's wall, the house steps
         right just enough (at most 6 % of the width), so it stays centred wherever there is room */
      var tt = document.querySelector('.ch-about .ab-ttl');
      if (tt && !port){ var tr = tt.getBoundingClientRect(); if (tr.width){ var need = tr.right * VW / w + 96 - (cx - 450 * hs + 50 * hs); if (need > 0) cx += Math.min(need, VW * .08); } }
      LY = { house: [cx - 450 * hs, cy - 340 * hs, hs], cards: LAY.map(function(L, i){ var r = Math.floor(i / cols), c = i % cols, x = m + c * (cw + gap), y = top + r * (chh + 52);
        return [x + 10 * sc, y - 50 * sc, sc]; }) };
      gH.setAttribute('transform', 'translate(' + f1(LY.house[0]) + ' ' + f1(LY.house[1]) + ') scale(' + LY.house[2].toFixed(4) + ')');
      LAY.forEach(function(L){ L.t.setAttribute('y', f1(50 - 20 / sc)); });   /* r3: the trade's name stands 20 above its card's line (her note 13.11 18:47) */
      /* scene 2's chart and scene 3's line: x 760…1840, the chart from y 540, the line across the middle; full width on portrait */
      var mT = 48 * k, tx0 = port ? m : mT, tw = port ? VW - 2 * m : VW - 2 * mT, sc2 = tw / 1080, ty0 = port ? VH * .34 : VH / 2 - 106 * sc2;
      gT.setAttribute('transform', 'translate(' + f1(tx0) + ' ' + f1(ty0) + ') scale(' + sc2.toFixed(4) + ')');
      /* v10: scene 3 is a statement — the line of decisions runs the full width under it */
      var mU = 48 * k, sc3 = port ? sc2 : (VW - 2 * mU) / 1080;
      OWN_DS = Math.max(1, sc3); gO.style.setProperty('--ds', OWN_DS.toFixed(3));   /* non-scaling strokes dash in screen units */
      gO.setAttribute('transform', 'translate(' + f1(port ? tx0 : mU) + ' ' + f1(port ? VH * .62 : VH * .56) + ') scale(' + sc3.toFixed(4) + ')');
      /* r3: the chart hangs from the top (her frames: the ruler at 415 under the title, at 150 once the title has left); the circles sit on the middle */
      LY.t = [tx0, sc2, port ? VH * .34 : 415 * k, port ? VH * .3 : 150 * k, sc2 * k];   /* x, x-scale, y under the title, y once it has left, y-scale */
      tFit.forEach(function(t){ var x = +t.getAttribute('x') || 0; if (k < .999) t.setAttribute('transform', 'translate(' + x + ' 0) scale(' + k.toFixed(4) + ' 1) translate(' + (-x) + ' 0)'); else t.removeAttribute('transform'); });
      if (k < .999) svQ.setAttribute('transform', 'translate(' + f1(PW - 11 * k) + ' 0) scale(' + k.toFixed(4) + ' 1) translate(' + (-(PW - 11)) + ' 0)'); else svQ.removeAttribute('transform');
      var cs = port ? VW / 1920 * .9 : k; LY.hl = Math.max(1020, VW / 2 / cs + 40); lgr.setAttribute('x1', f1(-LY.hl)); lgr.setAttribute('x2', f1(LY.hl));   /* the line bleeds off both edges, as in her frame */
      gC.setAttribute('transform', 'translate(' + f1(VW / 2) + ' ' + f1(port ? VH * .44 : VH / 2 + 27 * k) + ') scale(' + cs.toFixed(4) + ')'); gC.style.setProperty('--sw', (VW / w / cs).toFixed(3));
    }
    layout(); window.addEventListener('resize', function(){ layout(); oneFit(); if (last >= 0){ var q = last; last = -1; update(q); } });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ layout(); oneFit(); if (last >= 0){ var q = last; last = -1; update(q); } });   /* the title's width needs the real font */
    function update(pi){
      if (pi === last) return; last = pi;
      /* r3: the chapter opens on "One ___": the word changes with the scroll, then the old timeline runs from its start */
      /* r3 (her note 13.11 19:01: the words jumped — they changed on a threshold, by a timer). Now the change is scrubbed by the scroll:
         under "One" the line is a slot — the old word rolls up out of it while the next rolls in from below; stop the scroll and it stops. */
      var t = clamp01(pi / IN), D = .13, A = [-1, .25, .56], B = [.25, .56, 9];
      ows.forEach(function(b, i){ var e = sm(sg(t, A[i], A[i] + D)), x = sm(sg(t, B[i], B[i] + D)), key = e.toFixed(3) + '/' + x.toFixed(3);
        if (b.__k === key) return; b.__k = key;
        b.style.transform = 'translate(-50%,' + ((1 - e) * 1.05 - x * 1.05).toFixed(3) + 'em)'; b.style.opacity = (e * (1 - x)).toFixed(3);
        if (!LITE){ var bl = ((1 - e) + x) * 5; b.style.filter = bl > .05 ? 'blur(' + bl.toFixed(2) + 'px)' : ''; } });
      if (one){ var oo = 1 - sg(t, .9, 1); one.style.opacity = oo.toFixed(3); one.style.visibility = oo > 0 ? '' : 'hidden'; if (!LITE) one.style.filter = oo < 1 ? 'blur(' + ((1 - oo) * 6).toFixed(1) + 'px)' : ''; }
      var p = sg(pi, IN, 1);
      phases.forEach(function(e){ phase(e, p); });
      /* the five layers draw, spread apart in their own frames; then they come together and register */
      /* draw .00–.10, then it holds, whole, until .18 (user 15:27: let it be complete before it comes apart); apart .18–.30; together .38–.50 */
      var kd = sg(p, 0, .1), j = sm(sg(p, .38, .5)), fr = sg(p, .24, .3) * (1 - sg(p, .38, .44));
      LAY.forEach(function(L, i){ L.g.style.setProperty('--k', kd.toFixed(3));
        /* apart: five cards in one straight row along the bottom (frame 12); together: one house in the middle (frame 11) */
        var s = sm(sg(p, .18, .3)) * (1 - j), H0 = LY.house, C0 = LY.cards[i];
        L.g.setAttribute('transform', 'translate(' + f1(lerp(H0[0], C0[0], s)) + ' ' + f1(lerp(H0[1], C0[1], s)) + ') scale(' + lerp(H0[2], C0[2], s).toFixed(4) + ')');
        L.box.style.opacity = fr.toFixed(3); L.t.style.opacity = (sg(p, .26, .31) * (1 - sg(p, .38, .42))).toFixed(3);
        if (L.j !== j){ L.j = j; L.g.style.setProperty('--hl', mix(L.c, ONE, j)); } });
      /* one roof */
      gRoof.style.setProperty('--k', sg(p, .5, .56).toFixed(3));
      /* the disciplines */
      dis.forEach(function(g, i){ var k = sg(p, .53 + i * .008, .56 + i * .008); g.style.opacity = k.toFixed(3); g.firstChild.style.strokeDashoffset = (1 - k).toFixed(3); });
      /* scene 2: the house and its disciplines step out; time takes the stage; scene 3: only the line of decisions */
      var tk = sm(sg(p, .6, .66)), out3 = sm(sg(p, .79, .83)), ho = (1 - sm(sg(p, .59, .64))).toFixed(3);
      gSec.style.opacity = ho; gRoof.style.opacity = ho; gDis.style.opacity = ho;
      gT.style.opacity = (tk * (1 - out3)).toFixed(3);
      var tyk = sm(sg(p, .705, .735)); gT.setAttribute('transform', 'translate(' + f1(LY.t[0]) + ' ' + f1(lerp(LY.t[2], LY.t[3], tyk)) + ') scale(' + LY.t[1].toFixed(4) + ' ' + LY.t[4].toFixed(4) + ')');
      bars.forEach(function(b){ var k = sg(p, .63 + b.d * .04, .665 + b.d * .04), w = f1(b.w * eo(k)); if (b.cw !== w){ b.cw = w; b.e.setAttribute('width', w); } });
      fades.forEach(function(f){ var o = sg(p, .64 + f.d * .04, .665 + f.d * .04).toFixed(2); if (f.co !== o){ f.co = o; f.e.setAttribute('opacity', o); } });
      var kc = f1(SX * eo(sg(p, .665, .7))); if (ciP.__w !== kc){ ciP.__w = kc; ciP.setAttribute('width', kc); }
      var ks = sg(p, .71, .76), sw = f1(SW * eo(ks)); if (svB.__w !== sw){ svB.__w = sw; svB.setAttribute('width', sw); }
      svG.setAttribute('opacity', sg(p, .725, .75).toFixed(2)); txt(svV, Math.round(20 * eo(ks))); txt(pctEl, Math.round(20 * eo(ks)));
      /* your decisions, our everything-in-between */
      /* r3: the closing — the line, one circle, two circles, the blue words, the outer circles */
      var kl = eo(sg(p, .84, .885)), k0 = eo(sg(p, .86, .9)), ksp = sm(sg(p, .9, .94)), kss = eo(sg(p, .94, .98));
      gC.style.opacity = sg(p, .835, .845).toFixed(3);
      cLine.setAttribute('d', 'M' + f1(-LY.hl * kl) + ' 0H' + f1(LY.hl * kl));
      cA.style.strokeDashoffset = cB.style.strokeDashoffset = (1 - k0).toFixed(4);
      cA.setAttribute('transform', 'translate(' + f1(-DX * ksp) + ' 0) rotate(-90)'); cB.setAttribute('transform', 'translate(' + f1(DX * ksp) + ' 0) rotate(-90)');
      cB.style.opacity = ksp > 0 ? 1 : 0;
      cS1.style.strokeDashoffset = cS2.style.strokeDashoffset = (1 - kss).toFixed(4);
      cQ.forEach(function(q, i){ var inner = i === 1 || i === 2; q.setAttribute('opacity', (inner ? sg(p, .93, .95) : sg(p, .965, .985)).toFixed(2)); });
      stage.style.setProperty('--ob', eo(sg(p, .915, .95)).toFixed(3));
      var km = sg(p, .82, .88); gO.style.opacity = sg(p, .81, .84).toFixed(3); own.style.strokeDashoffset = ((1 - km) * OWN_DS).toFixed(3);
      dots.forEach(function(d, i){ d.style.opacity = sg(p, .83 + i * .014, .85 + i * .014).toFixed(3); });
      hat.forEach(function(h, i){ var w = f1(h.w * eo(sg(p, .87 + i * .018, .93 + i * .018))); if (h.cw !== w){ h.cw = w; h.e.setAttribute('width', w); } });
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 04 PROJECTS · lit windows in a facade drawing; each opens into its home */
  function projects(){
    var sec = document.getElementById('projects'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), svg = sec.querySelector('#pjDraw'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]'));
    var frames = [].slice.call(sec.querySelectorAll('.pj-frame')), caps = [].slice.call(sec.querySelectorAll('.pj-cap')), idx = sec.querySelector('#pjIdx'), stage = sec.querySelector('.ch-stage');
    var W = 900, H = 1000, COLS = 6, ROWS = 7, BW = W / COLS, FH = H / ROWS, ww = 84, wh = 100;
    var defs = el('defs', {}, svg), gF = el('g', {'class': 'dg'}, svg), gReg = el('g', {'class': 'dg reg'}, svg), gLit = el('g', {}, svg);
    var dly = function(x, y){ return .02 + .55 * Math.hypot(x - W / 2, y - H / 2) / 670; };
    line(gF, rectD(0, 0, W, H), 'w1', .02); line(gF, seg(-60, H, W + 60, H), 'w1', .05);
    for (var r = 1; r < ROWS; r++) line(gF, seg(0, r * FH, W, r * FH), 'w3', dly(W / 2, r * FH));
    var win = function(c, r){ return { x: c * BW + (BW - ww) / 2, y: r * FH + (FH - wh) / 2 + 6 }; };
    for (var c = 0; c < COLS; c++) for (var rr = 0; rr < ROWS; rr++){
      var q = win(c, rr), d = dly(q.x + ww / 2, q.y + wh / 2);
      line(gF, rectD(q.x, q.y, ww, wh), 'w2', d); line(gF, rectD(q.x + 5, q.y + 5, ww - 10, wh - 10), 'w3', d + .04); line(gF, seg(q.x + ww / 2, q.y + 5, q.x + ww / 2, q.y + wh - 5), 'w3', d + .06);
      line(gF, seg(q.x - 6, q.y + wh + 6, q.x + ww + 6, q.y + wh + 6), 'w3', d + .05);
    }
    /* regulating lines: the facade's proportion, traced over it */
    [[0, 0, W, H], [W, 0, 0, H], [0, 0, W, H * .5], [W, 0, 0, H * .5], [0, H * .5, W, H], [W, H * .5, 0, H], [W / 2, 0, W / 2, H], [0, H / 2, W, H / 2]].forEach(function(q, i){ line(gReg, seg(q[0], q[1], q[2], q[3]), 'reg', i * .08); });
    el('circle', {cx: W / 2, cy: H / 2, r: 4, 'class': 'regdot'}, gReg);
    /* three homes, three lit windows */
    var PJ = [win(1, 3), win(4, 1), win(3, 5)], imgs = frames.map(function(f){ return f.querySelector('img').getAttribute('src'); });
    var lit = PJ.map(function(q, i){
      var cp = el('clipPath', {id: 'pjC' + i}, defs); el('rect', {x: q.x + 5, y: q.y + 5, width: ww - 10, height: wh - 10}, cp);
      var im = el('image', {href: imgs[i], x: q.x + 5 - 40, y: q.y + 5, width: ww - 10 + 80, height: wh - 10, preserveAspectRatio: 'xMidYMid slice', 'clip-path': 'url(#pjC' + i + ')', opacity: 0}, gLit);
      return im; });
    var vbW = 1300, vbX = -200, vbY = -60, vbH = 1140;                    /* = the viewBox */
    function winRect(i){                                                  /* the lit window on screen, in the stage's px */
      var b = svg.getBoundingClientRect(), sb = stage.getBoundingClientRect(), k = Math.min(b.width / vbW, b.height / vbH);
      var ox = b.left - sb.left + (b.width - vbW * k) / 2 - vbX * k, oy = b.top - sb.top + (b.height - vbH * k) / 2 - vbY * k, q = PJ[i];
      return [ox + (q.x + 5) * k, oy + (q.y + 5) * k, (ww - 10) * k, (wh - 10) * k];
    }
    function update(p){
      phases.forEach(function(e){ phase(e, p); });
      gF.style.setProperty('--k', sg(p, 0, .12).toFixed(3));
      lit.forEach(function(im, i){ im.setAttribute('opacity', sg(p, .13 + i * .03, .17 + i * .03).toFixed(3)); });
      var kreg = sg(p, .25, .34); gReg.style.setProperty('--k', kreg.toFixed(3)); gReg.style.opacity = (1 - sg(p, .38, .42)).toFixed(3);
      /* each home in turn: its window opens into a large frame, then closes back */
      var sb = stage.getBoundingClientRect(), big = [sb.width * .4, sb.height * .17, sb.width * .56 - 0, sb.height * .64];
      if (sb.width / sb.height < 1) big = [sb.width * .06, sb.height * .14, sb.width * .88, sb.height * .42];
      var cur = -1;
      frames.forEach(function(f, i){
        var a = .4 + i * .16, o = sm(sg(p, a, a + .05)) * (1 - sm(sg(p, a + .12, a + .16)));
        var w = winRect(i), r = [lerp(w[0], big[0], o), lerp(w[1], big[1], o), lerp(w[2], big[2], o), lerp(w[3], big[3], o)];
        f.style.transform = 'translate(' + r[0].toFixed(1) + 'px,' + r[1].toFixed(1) + 'px)'; f.style.width = r[2].toFixed(1) + 'px'; f.style.height = r[3].toFixed(1) + 'px';
        f.style.opacity = (o > .002 ? 1 : 0); f.querySelector('img').style.transform = 'scale(' + (1.08 - .08 * o + .03 * sg(p, a, a + .16)).toFixed(4) + ')';
        caps[i].style.opacity = sg(p, a + .04, a + .07) * (1 - sg(p, a + .11, a + .13));
        if (o > .5) cur = i;
      });
      gF.style.opacity = (1 - .55 * sm(sg(p, .38, .44)) * (1 - sm(sg(p, .86, .9)))).toFixed(3);
      txt(idx, '0' + (cur < 0 ? 1 : cur + 1));
      stage.style.setProperty('--geo', sg(p, .9, .95).toFixed(3));
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 05 DIFFERENCE · the drawing lies exactly on the built room */
  var DIFF = [{"src":"assets/img2/dining_w.jpg","w":1400,"h":787,"l":[[694,232,1343,42,1.0],[162,265,162,618,0.731],[696,293,168,248,0.73],[460,286,460,573,0.697],[167,171,693,231,0.515],[369,576,369,278,0.453],[1376,160,1376,421,0.385],[1356,419,1356,169,0.336],[1384,419,1384,162,0.323],[1348,166,1348,422,0.312],[1376,453,1376,735,0.299],[1347,456,1347,730,0.279],[1385,667,1385,458,0.23],[1356,637,1356,453,0.178],[899,410,899,250,0.17],[1328,455,1159,455,0.167],[678,564,678,310,0.147],[167,1,167,171,0.131],[1088,178,903,222,0.094],[174,583,174,424,0.089]]},{"src":"assets/img2/cove.jpg","w":1400,"h":788,"l":[[843,357,218,592,1.0],[467,602,1394,338,0.605],[574,4,911,238,0.505],[896,242,546,5,0.48],[210,629,902,392,0.422],[989,208,739,3,0.28],[593,2,912,228,0.24],[1224,686,1120,354,0.237],[1227,696,1395,675,0.235],[0,649,209,674,0.145],[1399,256,1244,2,0.141],[1161,695,833,736,0.138],[823,745,1056,717,0.066],[620,9,798,136,0.044]]},{"src":"assets/img2/foyer_w.jpg","w":1400,"h":787,"l":[[206,122,668,150,1.0],[1188,121,1188,506,0.976],[164,0,164,386,0.473],[178,512,178,177,0.42],[968,187,1176,93,0.267],[264,273,264,623,0.266],[782,207,1113,5,0.219],[549,195,780,207,0.196],[180,177,382,188,0.18],[501,747,675,775,0.172],[773,685,492,698,0.161],[487,661,793,661,0.13],[176,616,176,784,0.109],[710,318,710,523,0.105],[1148,5,994,93,0.082],[971,215,1182,225,0.078],[1155,339,1155,519,0.075],[878,320,878,546,0.066],[1199,6,1019,103,0.046]]},{"src":"assets/img2/art_w.jpg","w":1400,"h":787,"l":[[346,176,1330,66,1.0],[356,616,1123,663,0.398],[468,270,1113,222,0.293],[0,558,232,539,0.246],[232,318,2,288,0.232],[1116,565,474,565,0.203],[0,320,211,342,0.199],[0,70,345,174,0.164],[204,514,17,525,0.151],[1394,785,1176,765,0.121],[238,314,238,545,0.11],[1,279,238,312,0.105],[285,550,285,277,0.098],[232,546,0,568,0.093],[1388,586,1117,586,0.077],[1,312,187,332,0.062],[855,634,1122,649,0.057],[1343,462,1147,462,0.047],[971,533,645,533,0.043],[971,301,971,507,0.041],[1292,336,1137,343,0.035],[728,281,885,271,0.022]]},{"src":"assets/img2/living2_w.jpg","w":1400,"h":787,"l":[[331,131,848,3,1.0],[308,782,87,722,0.697],[707,742,406,688,0.624],[330,217,2,158,0.514],[1294,568,1294,730,0.385],[0,49,331,130,0.375],[288,567,288,229,0.37],[860,511,1080,511,0.266],[58,177,274,215,0.256],[685,578,1054,608,0.252],[659,376,659,114,0.236],[761,658,1033,691,0.236],[666,154,666,367,0.212],[668,368,1074,348,0.208],[327,411,327,569,0.201],[92,309,92,516,0.173],[297,468,297,246,0.143],[165,220,165,397,0.116],[273,406,273,564,0.114],[902,71,667,118,0.11]]},{"src":"assets/img2/kitchen_w.jpg","w":1400,"h":787,"l":[[38,762,38,0,1.0],[159,651,919,786,0.809],[25,756,25,196,0.778],[661,653,661,131,0.648],[6,749,6,204,0.636],[530,638,530,158,0.505],[266,247,266,544,0.467],[482,581,482,263,0.357],[29,176,29,0,0.327],[953,287,953,490,0.277],[267,198,491,218,0.268],[891,730,1067,757,0.261],[473,580,473,264,0.253],[1266,682,1266,2,0.245],[9,174,9,10,0.244],[261,637,490,671,0.244],[474,262,268,247,0.24],[514,602,514,239,0.228],[530,69,271,31,0.224],[282,25,529,63,0.178],[508,270,508,595,0.176],[1061,583,1061,411,0.151],[494,77,268,46,0.143],[1068,755,1263,730,0.14],[608,37,400,2,0.129],[463,542,463,270,0.074],[1091,468,1262,468,0.058],[609,718,450,691,0.041],[502,48,257,10,0.041],[1212,311,1212,154,0.019]]}];
  function difference(){
    var sec = document.getElementById('difference'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]')), stage = sec.querySelector('.ch-stage');
    var host = sec.querySelector('.df-frames'), caps = [].slice.call(sec.querySelectorAll('.df-cap')), nums = [].slice.call(sec.querySelectorAll('.df-idx i'));
    var items = DIFF.map(function(d, i){
      var s = el('svg', {viewBox: '0 0 ' + d.w + ' ' + d.h, preserveAspectRatio: 'xMidYMid slice', 'class': 'df-svg'}, host);
      var im = el('image', {href: d.src, x: 0, y: 0, width: d.w, height: d.h, preserveAspectRatio: 'xMidYMid slice', opacity: 0}, s);
      var g = el('g', {'class': 'dg'}, s);
      d.l.forEach(function(q, j){ var L = Math.hypot(q[2] - q[0], q[3] - q[1]), ex = (q[2] - q[0]) / L * 16, ey = (q[3] - q[1]) / L * 16;
        line(g, seg(q[0] - ex, q[1] - ey, q[2] + ex, q[3] + ey), q[4] > .5 ? 'w1' : 'w2', .5 * j / d.l.length); });
      return { s: s, im: im, g: g };
    });
    function update(p){
      phases.forEach(function(e){ phase(e, p); });
      var A = .17, D = .135, cur = 0;
      items.forEach(function(it, i){
        var a = A + i * D, on = sg(p, a - .01, a + .01) * (i === items.length - 1 ? 1 : 1 - sg(p, a + D - .01, a + D + .01));
        it.s.style.opacity = on.toFixed(3); it.s.style.visibility = on > 0 ? '' : 'hidden';
        var kl = sg(p, a, a + D * .4); it.g.style.setProperty('--k', kl.toFixed(3));
        var ki = sm(sg(p, a + D * .35, a + D * .6)); it.im.setAttribute('opacity', ki.toFixed(3));
        it.g.style.opacity = (1 - .7 * sm(sg(p, a + D * .6, a + D * .85))).toFixed(3);
        if (p >= a - .01) cur = i;
        caps[i].style.opacity = (sg(p, a + D * .15, a + D * .3) * (i === items.length - 1 ? 1 : 1 - sg(p, a + D - .02, a + D))).toFixed(3);
      });
      nums.forEach(function(n, i){ n.classList.toggle('on', i === cur && p >= A - .01); });
      stage.style.setProperty('--fr', sg(p, A - .04, A).toFixed(3));
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 06 SUITE · the home in layers: one plan, exploded in axonometric */
  /* the same plan as chapter 02 (the day over the home), each discipline its own plate; a tier keeps its layers, the rest lift away */
  function suite(){
    var sec = document.getElementById('suite'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), svg = sec.querySelector('#suDraw'), stage = sec.querySelector('.ch-stage'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]'));
    var tabs = [].slice.call(sec.querySelectorAll('.su-tab')), descs = [].slice.call(sec.querySelectorAll('.su-desc > div')), sw = sec.querySelector('#suSw'), cnt = sec.querySelector('#suCnt');
    var PW = 1000, PD = 640, T = 14, CA = Math.cos(15 * Math.PI / 180), SA = Math.sin(15 * Math.PI / 180), CB = Math.cos(31 * Math.PI / 180), SB = Math.sin(31 * Math.PI / 180), SQ = .8;
    function P(x, y){ return [x * CA - y * CB, (x * SA + y * SB) * SQ]; }
    function pd(pts, dy){ dy = dy || 0; return pts.map(function(q, i){ var r = P(q[0], q[1]); return (i ? 'L' : 'M') + f1(r[0]) + ' ' + f1(r[1] + dy); }).join(''); }
    function rp(x, y, w, h){ return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]; }
    function cp(cx, cy, r, a0, a1, n){ var a = []; a0 = a0 || 0; a1 = a1 == null ? 2 * Math.PI : a1; n = n || 28; for (var i = 0; i <= n; i++){ var t = a0 + (a1 - a0) * i / n; a.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return a; }
    var RC = P(PW, 0), FC = P(PW, PD), LC = P(0, PD);                    /* right, front, left corners of a plate */
    var ORDER = ['Architecture', 'Interior Design', 'Construction', 'Furnishings', 'Art', 'Styling', 'Wellness', 'Installation', 'Move-In', 'CI Wellness'];
    var ST = [[0, 1, 2, 3, 4, 6, 7, 8], [0, 1, 2], [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5, 9]];   /* Turnkey · Core · Curated · + CI Wellness */
    var WIN = { n: [[590, 730]], s: [[60, 280], [380, 520], [560, 680], [770, 960]], e: [[60, 170], [300, 420], [460, 580]], w: [[50, 190], [330, 560]] };
    var IW = [[0, 240, 70, 240], [270, 240, 340, 240], [540, 240, 600, 240], [660, 240, 800, 240], [860, 240, 1000, 240], [300, 0, 300, 150], [300, 210, 300, 240], [560, 0, 560, 60], [560, 120, 560, 240], [770, 0, 770, 240], [330, 240, 330, 300], [330, 560, 330, 640], [710, 240, 710, 470], [710, 530, 710, 640]];
    var gAll = el('g', {transform: 'translate(620 0)'}, svg), gSpine = el('g', {}, gAll), layers = [];
    var spine = [LC, FC, RC].map(function(){ return el('path', {'class': 'su-spine', 'vector-effect': 'non-scaling-stroke'}, gSpine); });
    ORDER.forEach(function(name, li){
      var g = el('g', {'class': 'su-layer' + (li === 9 ? ' add' : '')}, gAll), gd = el('g', {'class': 'dg'}, g), n = 0;
      el('path', {d: pd(rp(0, 0, PW, PD)), 'class': 'su-fill'}, gd);   /* each plate a sheet: what lies below shows through, fainter */
      var L = function(pts, cls){ line(gd, pd(pts), cls || 'w3', .05 + .4 * Math.min(1, n++ / 40)); };
      /* the plate: its outline and a thin slab edge on the two near sides */
      line(gd, pd(rp(0, 0, PW, PD)), li === 9 ? 'w1' : 'w2', 0);
      line(gd, pd([[0, PD], [PW, PD], [PW, 0]], 9), 'w3', .02); [[0, PD], [PW, PD], [PW, 0]].forEach(function(q){ line(gd, pd([q, q]).replace(/L.*/, '') + 'v9', 'w3', .02); });
      if (li === 0){                                                       /* architecture: the envelope, its openings, glazing */
        var side = function(k, len){ var cuts = (WIN[k] || []).concat(k === 'n' ? [[400, 470]] : []).sort(function(a, b){ return a[0] - b[0]; }), out = [], x = 0; cuts.forEach(function(c){ out.push([x, c[0]]); x = c[1]; }); out.push([x, len]); return out; };
        side('n', PW).forEach(function(r){ L([[Math.max(T, r[0]), T], [Math.min(PW - T, r[1]), T]], 'w2'); });
        side('s', PW).forEach(function(r){ L([[Math.max(T, r[0]), PD - T], [Math.min(PW - T, r[1]), PD - T]], 'w2'); });
        side('e', PD).forEach(function(r){ L([[PW - T, Math.max(T, r[0])], [PW - T, Math.min(PD - T, r[1])]], 'w2'); });
        side('w', PD).forEach(function(r){ L([[T, Math.max(T, r[0])], [T, Math.min(PD - T, r[1])]], 'w2'); });
        WIN.n.forEach(function(r){ L([[r[0], T / 2], [r[1], T / 2]], 'w2'); }); WIN.s.forEach(function(r){ L([[r[0], PD - T / 2], [r[1], PD - T / 2]], 'w2'); });
        WIN.e.forEach(function(r){ L([[PW - T / 2, r[0]], [PW - T / 2, r[1]]], 'w2'); }); WIN.w.forEach(function(r){ L([[T / 2, r[0]], [T / 2, r[1]]], 'w2'); });
      } else if (li === 1){                                                /* interior design: partitions, doors */
        IW.forEach(function(s){ L([[s[0], s[1]], [s[2], s[3]]], 'w2'); });
        [[400, T, 70, 0, .5], [300, 150, 60, 0, .5], [600, 240, 60, -.5, 0], [800, 240, 60, -.5, 0], [710, 470, 60, 0, .5]].forEach(function(d){
          var a0 = d[3] * Math.PI, a1 = d[4] * Math.PI; L(cp(d[0], d[1], d[2], a0, a1, 10)); L([[d[0], d[1]], [d[0] + d[2] * Math.cos(a1), d[1] + d[2] * Math.sin(a1)]], 'w2'); });
        L(rp(686, 300, 24, 140), 'w2');
      } else if (li === 2){                                                /* construction: joists, beams, posts */
        for (var x = 40; x < PW; x += 40) L([[x, T], [x, PD - T]]);
        L([[T, 240], [PW - T, 240]], 'w2'); L([[300, T], [300, PD - T]], 'w2'); L([[710, T], [710, PD - T]], 'w2');
        [[300, 240], [710, 240], [300, 470], [710, 470], [300, T + 6], [710, T + 6]].forEach(function(q){ L(rp(q[0] - 9, q[1] - 9, 18, 18), 'w2'); });
      } else if (li === 3){                                                /* furnishings */
        [[846, 392, 126, 168], [820, 368, 156, 216], [420, 420, 220, 44], [420, 464, 44, 110], [400, 400, 260, 196], [100, 380, 150, 120], [90, 90, 150, 56], [610, 150, 110, 50], [880, 40, 92, 52], [790, 150, 60, 60]].forEach(function(r){ L(rp(r[0], r[1], r[2], r[3]), 'w2'); });
        L(cp(560, 520, 34)); for (var i = 0; i < 3; i++){ L(rp(118 + i * 44, 356, 26, 18)); L(rp(118 + i * 44, 506, 26, 18)); }
      } else if (li === 4){                                                /* art: pieces on the walls, a sculpture on its plinth */
        [[316, 58, 6, 64], [468, 226, 64, 6], [538, 140, 6, 60], [850, 246, 100, 6], [110, 246, 120, 6], [T + 2, 380, 6, 110]].forEach(function(r){ L(rp(r[0], r[1], r[2], r[3]), 'w2'); });
        L(rp(410, 108, 40, 40), 'w2'); L(cp(430, 128, 12), 'w2'); L(rp(950, 300, 30, 30), 'w2'); L(cp(965, 315, 9), 'w2');
      } else if (li === 5){                                                /* styling: cushions, vessels, books, a plant */
        [[445, 438, 10], [480, 438, 10], [515, 438, 10], [175, 440, 12], [556, 516, 8], [572, 528, 6], [645, 412, 12], [880, 420, 9], [930, 420, 9], [46, 600, 18], [46, 600, 8], [250, 118, 9], [980, 590, 14]].forEach(function(c){ L(cp(c[0], c[1], c[2], 0, null, 18), 'w2'); });
        for (var k = 0; k < 6; k++) L([[576, 34 + k * 30], [592, 34 + k * 30]], 'w2');
      } else if (li === 6){                                                /* wellness, designed in: water, light, air, rest */
        [16, 30, 44].forEach(function(r){ L(cp(926, 66, r, 0, null, 32), 'w2'); });
        WIN.s.forEach(function(r){ for (var x = r[0] + 20; x < r[1]; x += 40) L([[x, PD - T], [x - 70, PD - 150]]); });
        var wv = []; for (var x2 = 360; x2 <= 690; x2 += 10) wv.push([x2, 330 + 12 * Math.sin(x2 / 26)]); L(wv, 'w2');
        [40, 70].forEach(function(r){ L(cp(898, 476, r, 0, null, 32)); });
      } else if (li === 7){                                                /* installation: setting out — dimensions, crosshairs */
        var dl = function(a, b, o, v){ if (v){ L([[a[0] - o, a[1]], [b[0] - o, b[1]]], 'w2'); } else { L([[a[0], a[1] - o], [b[0], b[1] - o]], 'w2'); } };
        dl([0, 0], [PW, 0], 46, false); dl([0, 0], [0, PD], 46, true);
        [0, 300, 560, 770, 1000].forEach(function(x){ L([[x, -60], [x, -32]], 'w2'); }); [0, 240, 640].forEach(function(y){ L([[-60, y], [-32, y]], 'w2'); });
        [[300, 240], [710, 240], [770, 240], [330, 240], [560, 240], [710, 470]].forEach(function(q){ L([[q[0] - 16, q[1]], [q[0] + 16, q[1]]], 'w1'); L([[q[0], q[1] - 16], [q[0], q[1] + 16]], 'w1'); L(cp(q[0], q[1], 8, 0, null, 14)); });
      } else if (li === 8){                                                /* move-in: the finished home — lit, the door open */
        el('path', {d: pd(rp(0, 0, PW, PD)), 'class': 'su-glow'}, gd);
        WIN.s.concat([]).forEach(function(r){ L([[r[0], PD - T / 2], [r[1], PD - T / 2]], 'w1'); }); WIN.e.forEach(function(r){ L([[PW - T / 2, r[0]], [PW - T / 2, r[1]]], 'w1'); });
        L(cp(400, T, 70, 0, .5 * Math.PI, 12), 'w1'); L([[400, T], [400, T + 70]], 'w1');
      } else {                                                             /* CI Wellness: the add-on, through every room */
        [150, 320, 490].forEach(function(y0, j){ var w = []; for (var x3 = T; x3 <= PW - T; x3 += 10) w.push([x3, y0 + 16 * Math.sin(x3 / 38 + j * 1.3)]); L(w, 'w1'); });
        [[180, 120], [640, 120], [520, 470], [880, 470]].forEach(function(c){ L(cp(c[0], c[1], 26, 0, null, 24), 'w2'); });
      }
      /* its label, on a leader from the plate's right corner */
      var lab = el('g', {'class': 'su-lab'}, g);
      el('path', {d: 'M' + f1(RC[0] + 18) + ' ' + f1(RC[1]) + 'H' + f1(RC[0] + 90), 'class': 'su-ld', 'vector-effect': 'non-scaling-stroke'}, lab);
      el('rect', {x: f1(RC[0] + 86), y: f1(RC[1] - 4), width: 8, height: 8, 'class': 'su-sq'}, lab);
      var num = el('text', {x: f1(RC[0] + 112), y: f1(RC[1] + 9), 'class': 'su-num'}, lab), nm = el('text', {x: f1(RC[0] + 160), y: f1(RC[1] + 9), 'class': 'su-nm'}, lab);
      nm.textContent = name;
      layers.push({g: g, gd: gd, lab: lab, num: num, i: li, pos: -1});
    });
    var VBH = 1500, HS = 1380, PH = FC[1];                               /* plate height on paper */
    function layout(set){                                                 /* each layer's place: present ones stacked, absent ones lifted out */
      var N = set.length, gp = Math.min(200, (HS - PH) / Math.max(1, N - 1)), top = (VBH - (PH + (N - 1) * gp)) / 2, out = {};
      ORDER.forEach(function(_, li){
        var k = set.indexOf(li);
        if (k >= 0) out[li] = {y: top + (N - 1 - k) * gp, o: 1};
        else { var v = set.filter(function(x){ return x < li; }).length - .5; out[li] = {y: top + (N - 1 - v) * gp - 320, o: 0}; }
      });
      out.top = top; out.bot = top + (N - 1) * gp; return out;
    }
    /* v9 (user 04.11): the tiers are chosen, not scrolled — tabs and the switch restack the plates; a reading cursor climbs the stack on its own, a label under the pointer takes it */
    var tier = 0, well = false, inView = false, started = false, hoverL = -1, cyc = -1, raf = 0, tgt = null, topN = 0, botN = 0, spK = 0, cycT = null;
    function curSet(){ var s = ST[tier].slice(); if (well && s.indexOf(6) < 0) s.push(9); return s; }
    layers.forEach(function(L){ L.y = 0; L.o = 0; L.k = 0; L.em = 0; L.ty = 0; L.to = 0;
      L.lab.addEventListener('pointerenter', function(){ hoverL = L.i; kick(); }); L.lab.addEventListener('pointerleave', function(){ hoverL = -1; kick(); }); });
    function apply(first){
      var set = curSet(); tgt = layout(set);
      layers.forEach(function(L){ var t = tgt[L.i]; L.ty = t.y; L.to = t.o; if (first){ L.y = t.y; } var k = set.indexOf(L.i); if (k >= 0) txt(L.num, (k < 9 ? '0' : '') + (k + 1));
        L.g.classList.toggle('add', L.i === 9 || (well && L.i === 6)); });
      if (first){ topN = tgt.top; botN = tgt.bot; }
      txt(cnt, set.length);
      tabs.forEach(function(b, i){ b.classList.toggle('on', i === tier); b.setAttribute('aria-selected', i === tier ? 'true' : 'false'); });
      descs.forEach(function(d, i){ d.classList.toggle('on', i === tier); });
      if (sw){ sw.classList.toggle('on', well); sw.setAttribute('aria-pressed', well ? 'true' : 'false'); }
      cyc = well ? Math.max(set.indexOf(9), set.indexOf(6)) : -1; restartCycle(); kick();
    }
    function restartCycle(){ clearInterval(cycT); if (!inView || reduced) return;
      cycT = setInterval(function(){ if (hoverL >= 0) return; var n = curSet().length; cyc = (cyc + 1) % n; kick(); }, 2000); }
    function kick(){ if (!raf) raf = requestAnimationFrame(frame); }
    function frame(){
      raf = 0; var set = curSet(), moving = false, anyEm = false;
      layers.forEach(function(L){ var kp = set.indexOf(L.i), want = hoverL >= 0 ? (L.i === hoverL ? 1 : 0) : (kp >= 0 && kp === cyc ? 1 : 0); if (want) anyEm = true; L.want = want; });
      layers.forEach(function(L){
        L.y += (L.ty - L.y) * .12; L.o += (L.to - L.o) * .14;
        if (L.to > .5) L.k = Math.min(1, L.k + .022); else if (L.o < .02) L.k = 0;
        L.em += (L.want - L.em) * .16;
        var dim = anyEm ? 1 - .45 * (1 - L.em) : 1;
        L.g.setAttribute('transform', 'translate(' + f1(-46 * sm(L.em)) + ' ' + f1(L.y) + ')'); L.g.style.opacity = L.o.toFixed(3); L.g.style.visibility = L.o > .004 ? '' : 'hidden';
        L.gd.style.setProperty('--k', L.k.toFixed(3)); L.gd.style.opacity = dim.toFixed(3);
        L.lab.style.opacity = (sg(L.k, .25, .6) * L.o).toFixed(3); L.lab.classList.toggle('em', anyEm ? L.em > .5 : true);
        if (Math.abs(L.ty - L.y) > .3 || Math.abs(L.to - L.o) > .003 || (L.to > .5 && L.k < 1) || Math.abs(L.want - L.em) > .004) moving = true;
      });
      topN += (tgt.top - topN) * .12; botN += (tgt.bot - botN) * .12; spK = Math.min(1, spK + .02);
      spine.forEach(function(sp, i){ var c = [LC, FC, RC][i]; sp.setAttribute('d', 'M' + f1(c[0]) + ' ' + f1(topN + c[1]) + 'V' + f1(topN + c[1] + (botN - topN) * spK)); });
      if (Math.abs(tgt.top - topN) > .3 || spK < 1) moving = true;
      if (moving) kick();
    }
    tabs.forEach(function(b, i){ b.addEventListener('click', function(){ if (tier !== i){ tier = i; apply(); } }); });
    if (sw) sw.addEventListener('click', function(){ well = !well; apply(); });
    var portrait = null;
    function fit(){ var pt = window.innerWidth < window.innerHeight; if (pt !== portrait){ portrait = pt; svg.setAttribute('viewBox', pt ? '40 0 1600 1500' : '0 0 2100 1500'); } }
    fit(); window.addEventListener('resize', fit);
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ inView = es[0].isIntersecting;
      if (inView && !started){ started = true; apply(true); } else restartCycle(); }, {threshold: .25}).observe(svg);
    else { started = true; apply(true); }
    return null;
  }

  /* ================================================================== 07 APPROACH · each question sets out a grid axis; the answers become the foundation */
  /* a structural grid in plan (bubbled axes, as on a drawing), drawn by the questions; then the plan tilts into perspective and
     the frame of a house rises from it — footings, columns, floors. One small camera, projected by hand into one SVG. */
  function approach(){
    var sec = document.getElementById('approach'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), svg = sec.querySelector('#apDraw'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]'));
    var rows = [].slice.call(sec.querySelectorAll('#apQs li')), txs = rows.map(function(r){ return r.querySelector('.tx'); });
    var chs = txs.map(function(t){ var s = t.dataset.t, out = []; t.textContent = ''; for (var i = 0; i < s.length; i++){ var c = document.createElement('i'); c.textContent = s[i]; c.style.setProperty('--i', i + 1); t.appendChild(c); out.push(c); } t.setAttribute('aria-label', s); return out; }), curC = [];
    var XS = [-2, -1, 0, 1, 2], ZS = [-1.5, -.5, .5, 1.5], EXT = .75, LV = [0, .95, 1.9, 2.75];   /* axes, overrun, floor levels */
    var Q0 = .13, QD = .095, QT = .062;                                    /* question i types over [Q0 + i·QD, + QT] */
    var gGrid = el('g', {}, svg), gFrame = el('g', {}, svg), gBub = el('g', {}, svg);
    var mk = function(g, cls){ return el('path', {'class': cls, 'vector-effect': 'non-scaling-stroke'}, g); };
    var axN = XS.map(function(){ return mk(gGrid, 'ap-ax'); }), axL = ZS.map(function(){ return mk(gGrid, 'ap-ax'); });
    var foot = mk(gFrame, 'ap-ft'), cols = mk(gFrame, 'ap-col'), slabs = LV.slice(1).map(function(){ return mk(gFrame, 'ap-sl'); }), beams = LV.slice(1).map(function(){ return mk(gFrame, 'ap-bm'); });
    var bub = function(t){ var g = el('g', {'class': 'ap-bub'}, gBub); el('circle', {r: 15, 'vector-effect': 'non-scaling-stroke'}, g); var x = el('text', {y: 5}, g); x.textContent = t; return g; };
    var bN = XS.map(function(_, i){ return bub(String(i + 1)); }), bL = ZS.map(function(_, i){ return bub('ABCD'[i]); });
    var W = 1, H = 1, CX = 0, CY = 0, F = 1, cam = null, apIn = sec.querySelector('#apIn');
    function eio(x){ x = clamp01(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function size(){ var r = svg.getBoundingClientRect(); W = r.width || 1; H = r.height || 1; svg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H)); }
    function setCam(yaw, pitch, dist, ty, zoom){
      var cp = Math.cos(pitch), C = [dist * Math.sin(yaw) * cp, ty + dist * Math.sin(pitch), dist * Math.cos(yaw) * cp];
      var f = [-C[0], ty - C[1], -C[2]], fl = Math.hypot(f[0], f[1], f[2]); f = [f[0] / fl, f[1] / fl, f[2] / fl];
      var r = [Math.cos(yaw), 0, -Math.sin(yaw)], u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
      cam = {C: C, f: f, r: r, u: u}; F = zoom;
    }
    function pr(x, y, z){ var d = [x - cam.C[0], y - cam.C[1], z - cam.C[2]], zz = d[0] * cam.f[0] + d[1] * cam.f[1] + d[2] * cam.f[2];
      return [CX + F * (d[0] * cam.r[0] + d[1] * cam.r[1] + d[2] * cam.r[2]) / zz, CY - F * (d[0] * cam.u[0] + d[1] * cam.u[1] + d[2] * cam.u[2]) / zz]; }
    function L(a, b){ var p = pr(a[0], a[1], a[2]), q = pr(b[0], b[1], b[2]); return 'M' + f1(p[0]) + ' ' + f1(p[1]) + 'L' + f1(q[0]) + ' ' + f1(q[1]); }
    function part(a, b, k){ return L(a, [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]); }
    var lastSz = '', G = 1;
    /* r3 (her note 13.11 19:46: "once the plan is drawn the house must not jump, the isometry must not stand at the side — all of it
       in the centre, neatly"): the drawing keeps the middle of the screen from the first axis to the last floor. It used to step to
       the right to clear the closing lines; now, where a window is too narrow for both, the drawing is a little smaller
       from its first line instead (G, found once per size by fit(): every pose from the tilt on is tried against the text blocks). */
    function pose(p, g){
      var tilt = sm(sg(p, .6, .74)), dr = sg(p, .74, 1), narrow = W / H < .9;
      var yaw = lerp(0, -.62, tilt) - .16 * dr, pitch = lerp(Math.PI / 2 - .0001, .5, tilt) - .05 * dr, dist = lerp(20, 24, tilt);
      var zoom = Math.min(W * (narrow ? .9 : .56) / (5.6 / dist), H * (narrow ? .5 : .66) / (4.8 / dist)) * lerp(1, .9, tilt) * g;
      CX = W / 2; CY = narrow ? H * .3 : H * lerp(.52, .56, tilt);
      setCam(yaw, pitch, dist, lerp(0, 1.3, sm(sg(p, .7, .86))), zoom);
    }
    function fit(){
      G = 1; if (W / H < .9) return;
      var sr = svg.getBoundingClientRect(), u = Math.min(W / 1920, H / 1080), g = Math.max(20, 30 * u);
      var bx = phases.map(function(e){ var c = e.querySelector('p,h3') || e, r = c.getBoundingClientRect(), ws = [].slice.call(c.querySelectorAll('.w')), l = 1e9, rt = -1e9;
        ws.forEach(function(w){ var q = w.getBoundingClientRect(); if (q.width){ l = Math.min(l, q.left); rt = Math.max(rt, q.right); } });
        if (rt < l){ l = r.left; rt = r.right; } return {l: l - sr.left, r: rt - sr.left, t: r.top - sr.top, b: r.bottom - sr.top}; });
      if (bx.length < 4) return;
      /* each block only against the poses it is on the screen with: [block, from, to, its corner of the screen] */
      var BL = [[bx[0], .6, .8, 'tl'], [bx[1], .6, .8, 'bl'], [bx[2], .8, 1.01, 'tl'], [bx[3], .8, 1.01, 'br']];
      var xa = XS[0] - EXT, xb = XS[4] + EXT, za = ZS[0] - EXT, zb = ZS[3] + EXT, e = .32, need = 1;
      function edge(a, b, out){ for (var i = 0; i <= 8; i++){ var k = i / 8; out.push([lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k), 0]); } }
      for (var q = .6; q <= 1.0001; q += .02){
        pose(q, 1); var P = [];
        /* what is really drawn at q: the axes and their bubbles, the columns as high as they have risen, the slabs that have come */
        XS.forEach(function(x){ edge([x, 0, za], [x, 0, zb], P); P.push([x, 0, za - .32, 17]); }); ZS.forEach(function(z){ edge([xa, 0, z], [xb, 0, z], P); P.push([xa - .32, 0, z, 17]); });
        var kc = eo(sg(q + .02, .7, .8));
        if (kc > 0) XS.forEach(function(x, i){ ZS.forEach(function(z, j){ var h = LV[3] * eo(sg(kc, (i + j) / 16, (i + j) / 16 + .5)); if (h > 0) P.push([x, h, z, 0], [x, h / 2, z, 0]); }); });
        LV.slice(1).forEach(function(y, l){ if (q + .02 <= .76 + l * .04) return; var c = [[XS[0] - e, ZS[0] - e], [XS[4] + e, ZS[0] - e], [XS[4] + e, ZS[3] + e], [XS[0] - e, ZS[3] + e]];
          c.forEach(function(a, i){ var b = c[(i + 1) % 4]; edge([a[0], y, a[1]], [b[0], y, b[1]], P); }); });
        var O = P.map(function(pt){ var o = pr(pt[0], pt[1], pt[2]); return [o[0], o[1], pt[3]]; });
        BL.forEach(function(B){ if (q < B[1] || q > B[2]) return; var r = B[0], sx = B[3] === 'br' ? 1 : -1, sy = B[3] === 'tl' ? -1 : 1;
          var ex = sx < 0 ? CX - (r.r + g) : (r.l - g) - CX, ey = sy < 0 ? CY - (r.b + g) : (r.t - g) - CY;   /* the room between the middle and the block */
          O.forEach(function(o){ var dx = (o[0] + sx * o[2] - CX) * sx, dy = (o[1] + sy * o[2] - CY) * sy; if (dx <= 0 || dy <= 0) return;
            need = Math.min(need, Math.max(ex / dx, ey / dy)); }); });
      }
      G = Math.max(.6, Math.min(1, need));
    }
    function update(p){
      var sz = window.innerWidth + 'x' + window.innerHeight; if (sz !== lastSz){ lastSz = sz; size(); fit(); }
      /* r3 (13.11, her frames 07 · 1 / 5 / 4): the title stands alone; its halves part, a photograph opens between them and
         grows to the whole screen; on it — "We begin with questions / not about style, but about life"; then the old scene. */
      var pi = p, AI = .26; p = pi < AI ? .1 : .1 + (pi - AI) / (1 - AI) * .9;
      if (apIn){ var out = sg(pi, AI - .035, AI), vals = [eio(sg(pi, .025, .085)), eio(sg(pi, .085, .16)), eo(sg(pi, .16, .19)), sg(pi, .03, .06), out], key = vals.map(function(v){ return v.toFixed(3); }).join('/');
        if (apIn.__k !== key){ apIn.__k = key; ['--sp', '--gr', '--qk', '--pho', '--out'].forEach(function(n, i){ apIn.style.setProperty(n, vals[i].toFixed(3)); }); apIn.style.visibility = out >= 1 ? 'hidden' : ''; } }
      phases.forEach(function(e){ phase(e, p); });
      /* the questions type themselves; the one being asked is bright, the answered ones settle */
      var act = -1;
      rows.forEach(function(r, i){ var a = Q0 + i * QD, t = sg(p, a, a + QT), full = txs[i].dataset.t, n = Math.ceil(full.length * eo(t) - 1e-6);
        if (txs[i].__n !== n){ txs[i].__n = n; txs[i].style.setProperty('--n', n); var c = chs[i][Math.max(0, n - 1)]; if (curC[i] !== c){ if (curC[i]) curC[i].classList.remove('ap-c'); c.classList.add('ap-c'); curC[i] = c; } }
        r.style.opacity = (sg(p, a - .012, a)).toFixed(3); if (p >= a) act = i;
        r.classList.toggle('typing', t > 0 && t < 1); });
      rows.forEach(function(r, i){ r.classList.toggle('on', i === act && p < .6); });
      /* the camera: a plan from straight above, then it tips over into a three-quarter view and drifts */
      var narrow = W / H < .9;
      pose(p, G);   /* r3: centred and at one size all the way */
      /* v13: each question sits at the end of the lettered axis it draws — A and C on the left, B and D on the right — and the fifth
         under the grid on axis 5; the whole set leaves as the camera tips over */
      var qo = 1 - sg(p, .58, .62);
      if (!narrow) rows.forEach(function(r, i){ var u = W / 1920, w = Math.max(220, 330 * u), x, y, side;
        if (i < 4){ var z = ZS[i], left = i % 2 === 0, e = left ? pr(XS[0] - EXT - .32, 0, z) : pr(XS[4] + EXT, 0, z);
          x = left ? e[0] - 30 * Math.max(u, .75) - w : e[0] + 26 * Math.max(u, .75); y = e[1]; side = left ? 'l' : 'r'; }
        else { var b5 = pr(XS[4], 0, ZS[0] - EXT - .32); x = b5[0] + 30 * Math.max(u, .75); y = b5[1]; side = 'r'; }   /* the fifth beside its own bubble, top right */
        if (r.__s !== side){ r.__s = side; r.classList.toggle('l', side === 'l'); r.classList.toggle('c', side === 'c'); }
        r.style.transform = 'translate(' + f1(x) + 'px,' + f1(y) + 'px) translateY(-50%)';
        r.style.opacity = (+r.style.opacity * qo).toFixed(3); });
      else rows.forEach(function(r){ r.style.opacity = (+r.style.opacity * qo).toFixed(3); });
      /* the grid axes: question i draws axis i+1 and (to D) one lettered axis */
      var xa = XS[0] - EXT, xb = XS[4] + EXT, za = ZS[0] - EXT, zb = ZS[3] + EXT, bs = narrow ? ' scale(.72)' : '', bf = 1;   /* polish: the bubble labels are text: they stay full */
      XS.forEach(function(x, i){ var a = Q0 + i * QD, k = eo(sg(p, a + .01, a + QT)); axN[i].setAttribute('d', k > 0 ? part([x, 0, za], [x, 0, zb], k) : '');
        var b = pr(x, 0, za - .32); bN[i].setAttribute('transform', 'translate(' + f1(b[0]) + ' ' + f1(b[1]) + ')' + bs); bN[i].style.opacity = (sg(p, a + QT * .7, a + QT) * bf).toFixed(3); });
      ZS.forEach(function(z, i){ var a = Q0 + i * QD + .02, k = eo(sg(p, a + .01, a + QT)); axL[i].setAttribute('d', k > 0 ? part([xa, 0, z], [xb, 0, z], k) : '');
        var b = pr(xa - .32, 0, z); bL[i].setAttribute('transform', 'translate(' + f1(b[0]) + ' ' + f1(b[1]) + ')' + bs); bL[i].style.opacity = (sg(p, a + QT * .7, a + QT) * bf).toFixed(3); });
      /* footings at every crossing; columns rise; the floors arrive one by one, beams running out along the axes */
      var kf = sg(p, .66, .72), kc = eo(sg(p, .7, .8)), d = '', dc = '';
      if (kf > 0) XS.forEach(function(x, i){ ZS.forEach(function(z, j){ var s = .13 * eo(sg(kf, (i + j) / 14, (i + j) / 14 + .4));
        if (s > 0) d += L([x - s, 0, z - s], [x + s, 0, z - s]) + L([x + s, 0, z - s], [x + s, 0, z + s]) + L([x + s, 0, z + s], [x - s, 0, z + s]) + L([x - s, 0, z + s], [x - s, 0, z - s]);
        var h = LV[3] * eo(sg(kc, (i + j) / 16, (i + j) / 16 + .5)); if (h > 0) dc += L([x, 0, z], [x, h, z]); }); });
      foot.setAttribute('d', d); cols.setAttribute('d', dc);
      LV.slice(1).forEach(function(y, l){ var k = eo(sg(p, .76 + l * .04, .83 + l * .04)), ds = '', db = '';
        if (k > 0){ var e = .32;                                           /* the slab's edge overhangs the grid a little */
          ds = part([XS[0] - e, y, ZS[0] - e], [XS[4] + e, y, ZS[0] - e], k) + part([XS[4] + e, y, ZS[0] - e], [XS[4] + e, y, ZS[3] + e], k) + part([XS[4] + e, y, ZS[3] + e], [XS[0] - e, y, ZS[3] + e], k) + part([XS[0] - e, y, ZS[3] + e], [XS[0] - e, y, ZS[0] - e], k);
          XS.forEach(function(x){ db += part([x, y, ZS[0]], [x, y, ZS[3]], k); }); ZS.forEach(function(z){ db += part([XS[0], y, z], [XS[4], y, z], k); }); }
        slabs[l].setAttribute('d', ds); beams[l].setAttribute('d', db); });
      gGrid.style.opacity = (1 - .45 * sm(sg(p, .78, .9))).toFixed(3);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ lastSz = ''; });
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 08 PROCESS · v9 (user 04.11: "from a broken line you structure everything"):
     the project as it usually is — many strands crossing, tangled; a front travels left to right through the six steps and,
     behind it, every strand lies down into one straight line. At the end: one line, six stations. */
  function process(){
    var sec = document.getElementById('process'); if (!sec || !sec.classList.contains('ch-proc2')) return null;
    var pin = sec.querySelector('.ch-pin'), stage = sec.querySelector('.ch-stage'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]'));
    var svg = sec.querySelector('#prSvg2'), ims = [].slice.call(sec.querySelectorAll('.pr2-im')), pl = sec.querySelector('#prPl'), labs = [].slice.call(sec.querySelectorAll('.pr2-lab'));
    var NAMES = ['DISCOVER', 'DEFINE', 'DESIGN', 'BUILD', 'CURATE', 'DELIVER'], NS0 = 11, N = 140;
    var gT = el('g', {}, svg), strands = [], i;
    for (i = 0; i < NS0; i++) strands.push({e: el('path', {'class': 'pr2-s', 'vector-effect': 'non-scaling-stroke'}, gT),
      w: [1.3 + (i * 1.7) % 3.1, 3.2 + (i * 2.3) % 4.4, 7.1 + (i * 1.1) % 5.3], ph: [i * 1.9, i * 2.7 + 1, i * .7 + 2], a: [.55, .3, .15], sk: (i % 2 ? 1 : -1) * (.2 + (i % 4) * .12)});
    var one = el('path', {'class': 'pr2-one', 'vector-effect': 'non-scaling-stroke'}, svg), glint = el('path', {'class': 'pr2-gl', 'vector-effect': 'non-scaling-stroke'}, svg);
    var nodes = NAMES.map(function(){ var g = el('g', {'class': 'pr2-node'}, svg); el('circle', {r: 9, 'vector-effect': 'non-scaling-stroke'}, g); el('rect', {x: -3, y: -3, width: 6, height: 6}, g);
      var ring = el('circle', {r: 9, 'class': 'ring', 'vector-effect': 'non-scaling-stroke'}, g); return {g: g, ring: ring}; });
    var W = 1, H = 1, X0 = 0, X1 = 1, Y0 = 0, A = 1, lastSz = '', lastStep = -2;
    function size(){ var r = stage.getBoundingClientRect(), m = parseFloat(getComputedStyle(stage).getPropertyValue('--m')) || 48; W = r.width; H = r.height;
      svg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H)); X0 = m; X1 = W - m; Y0 = H * (W / H < 1 ? .5 : .7); A = H * (W / H < 1 ? .075 : .13); }
    function update(p){
      var sz = window.innerWidth + 'x' + window.innerHeight; if (sz !== lastSz){ lastSz = sz; size(); }
      phases.forEach(function(e){ phase(e, p); });
      /* the front: where the work has been brought together */
      var band = (X1 - X0) * .09, fx = X0 + (X1 - X0 + band * .6) * sg(p, .1, .88), kin = sg(p, .0, .08), t = p * 2.2;
      strands.forEach(function(s, j){
        var d = '';
        for (var k = 0; k <= N; k++){
          var u = k / N, x = X0 + (X1 - X0) * u, f = 0;
          for (var q = 0; q < 3; q++) f += s.a[q] * Math.sin(u * s.w[q] * 6.283 + s.ph[q] + t * (q + 1) * .35);
          f += s.sk * Math.sin(u * 3.1416);
          var mrg = sm((fx - x) / band + .5), y = Y0 + A * f * (1 - mrg) * Math.min(1, .25 + u * 1.5 + .75 * (1 - kin));
          if (u > kin * 1.02 && kin < 1) break;
          d += (k ? 'L' : 'M') + f1(x) + ' ' + f1(y);
        }
        s.e.setAttribute('d', d);
      });
      var fe = Math.max(X0, Math.min(X1, fx - band * .5));
      one.setAttribute('d', fe > X0 ? 'M' + f1(X0) + ' ' + f1(Y0) + 'H' + f1(fe) : '');
      /* the finished line: a glint runs along it once */
      var gk = sg(p, .9, 1); glint.setAttribute('d', gk > 0 && gk < 1 ? 'M' + f1(X0 + (X1 - X0) * Math.max(0, gk * 1.15 - .15)) + ' ' + f1(Y0) + 'H' + f1(X0 + (X1 - X0) * Math.min(1, gk * 1.15)) : '');
      var step = -1;
      nodes.forEach(function(n, k){ var xs = X0 + (X1 - X0) * (k + .5) / 6, on = sg(fx, xs - band * .2, xs + band * .3);
        n.g.setAttribute('transform', 'translate(' + f1(xs) + ' ' + f1(Y0) + ')'); n.g.style.opacity = on.toFixed(3);
        var pr = sg(fx, xs, xs + band * 1.6); n.ring.setAttribute('r', f1(9 + 26 * eo(pr))); n.ring.style.opacity = (pr > 0 && pr < 1 ? 1 - pr : 0).toFixed(3);
        if (on > .5) step = k;
        labs[k].style.opacity = on.toFixed(3); labs[k].classList.toggle('on', on > .5 && (p < .88 ? k === Math.min(5, Math.floor((p - .1) / .13)) : true)); });
      if (step !== lastStep){ lastStep = step; ims.forEach(function(im, k){ im.classList.toggle('on', k === step); }); if (step >= 0) txt(pl, '0' + (step + 1) + ' / ' + NAMES[step]); }
      stage.style.setProperty('--pic', (sg(p, .1, .14) * (1 - sg(p, .86, .9))).toFixed(3));
      stage.style.setProperty('--ly', f1(Y0) + 'px');
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 05 DIFFERENCE · the opening (09.11 12:51): the window in the black
     opens to full bleed with the scroll; the photograph is the chapter's own first background, so when the cover fades nothing moves */
  function diffOpen(){
    var sec = document.getElementById('difference'); if (!sec) return null;
    var pin = sec.querySelector('.df2-pinw'), body = sec.querySelector('.df2-body'), nx = sec.querySelector('.df2-nx'), title = sec.querySelector('.df2-title'); if (!pin || !nx) return null;
    /* the title, letter by letter (as the hero's): .tl lines, .fc letters with their own delays */
    if (title && !title.querySelector('.fc')){ var n = 0, raw = title.innerHTML.split(/<br\s*\/?>/i);
      title.setAttribute('aria-label', title.textContent);
      title.innerHTML = raw.map(function(l, li){ var t = l.replace(/<[^>]+>/g, '');
        return '<span class="tl" aria-hidden="true" style="--s:' + (.12 + li * .07).toFixed(3) + '">' + t.split('').map(function(ch){ if (ch === ' ') return ' '; var d = .15 + (n++) * .012; return '<span class="fc" style="--s:' + d.toFixed(3) + '">' + ch + '</span>'; }).join('') + '</span>'; }).join('<br>'); }
    var ready = false, lastT = -1, lastR = -1, atStart = true;
    function setReady(v){ if (v === ready) return; ready = v; sec.classList.toggle('ready', v); sec.dispatchEvent(new CustomEvent(v ? 'df2in' : 'df2out')); }
    var ph = nx.querySelector('.df2-nx-ph'), im = ph.querySelector('img'), fr = nx.querySelector('.df2-nx-fr'), cap = nx.querySelector('.df2-nx-cap');
    function ease(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function update(p){
      var vw = window.innerWidth, vh = window.innerHeight, u = vw / 1920, port = vw <= 900 || vw / vh <= 1;
      var W = port ? vw * .44 : 400 * u, H = port ? vw * .68 : 540 * u, m = port ? 14 : 26 * u;
      var D = Math.max(1, pin.offsetHeight - body.offsetHeight), q = clamp01(p * Math.max(1, pin.offsetHeight - vh) / D);
      var e = ease(clamp01((q - .02) / .3)), T = (1 - e) * (vh - H) / 2, L = (1 - e) * (vw - W) / 2;
      ph.style.clipPath = 'inset(' + T.toFixed(1) + 'px ' + L.toFixed(1) + 'px)';
      im.style.transform = 'scale(' + (1.15 - .14 * e).toFixed(4) + ')'; im.style.filter = 'contrast(' + (1 + .06 * e).toFixed(3) + ') brightness(' + (1 - .1 * e).toFixed(3) + ')';
      fr.style.transform = 'scale(' + ((W + 2 * m + e * (vw - W)) / (W + 2 * m)).toFixed(4) + ',' + ((H + 2 * m + e * (vh - H)) / (H + 2 * m)).toFixed(4) + ')';
      fr.style.opacity = Math.max(0, 1 - e * 2.4).toFixed(3);
      cap.style.opacity = Math.max(0, 1 - e * 2.6).toFixed(3);
      cap.style.marginLeft = (-60 * u * e).toFixed(1) + 'px';
      var f = clamp01((q - .31) / .07); nx.style.opacity = (1 - f).toFixed(3); nx.style.visibility = f >= 1 ? 'hidden' : 'visible';
      /* then the grid: it rises 28vh → 0 (the "scroll a little" of 14:58) while it starts to draw; --t runs the entrance to the end
         of the pin (.92), and only then is it .ready — hover, autoplay, and the page scrolls on */
      var r = ease(clamp01((q - .37) / .15)), t = clamp01((q - .4) / .5);
      var R = +(28 * (1 - r)).toFixed(2); if (R !== lastR){ lastR = R; sec.style.setProperty('--rise', R); }
      var Tt = +t.toFixed(4); if (Tt !== lastT){ lastT = Tt; sec.style.setProperty('--t', Tt); }
      setReady(t >= .999);
      if (q < .3){ if (!atStart){ atStart = true; sec.dispatchEvent(new CustomEvent('df2reset')); } } else atStart = false;
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 08 PROCESS · v10: one real home (Room To Breathe) through the six steps — the scroll turns the pages, the arrows too */
  function process3(){
    var sec = document.getElementById('process'); if (!sec || !sec.classList.contains('pr3')) return null;
    var pin = sec.querySelector('.ch-pin'), ims = [].slice.call(sec.querySelectorAll('.pr3-im')), cs = [].slice.call(sec.querySelectorAll('.pr3-c')), ticks = [].slice.call(sec.querySelectorAll('.pr3-ticks i'));
    var cap = sec.querySelector('#prCap'), CAPS = cap.getAttribute('data-caps').split('|'), prev = sec.querySelector('.pr3-ar.prev'), next = sec.querySelector('.pr3-ar.next'), N = 8, cur = -1;
    function imgOf(s){ return Math.min(s, 6); }                          /* the last page keeps the finished room */
    function go(s){ s = Math.max(0, Math.min(N - 1, s)); var top = pin.getBoundingClientRect().top + (window.scrollY || window.pageYOffset); window.scrollTo({top: top + (s + .5) / N * (pin.offsetHeight - window.innerHeight), behavior: 'smooth'}); }
    prev.addEventListener('click', function(){ go(cur - 1); }); next.addEventListener('click', function(){ go(cur + 1); });
    function update(p){
      var s = Math.max(0, Math.min(N - 1, Math.floor(p * N)));
      if (s === cur) return; var pi = cur < 0 ? -1 : imgOf(cur); cur = s;
      var ii = imgOf(s); ims.forEach(function(e, k){ e.classList.toggle('on', k === ii); e.classList.toggle('was', k === pi && pi !== ii); });
      cs.forEach(function(e, k){ e.classList.toggle('on', k === s); });
      ticks.forEach(function(t, k){ t.classList.toggle('on', k + 1 <= s); });
      txt(cap, CAPS[s] || ''); prev.disabled = s === 0; next.disabled = s === N - 1;
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 08 PROCESS · v11: the tangle becomes the line (the archive's idea) */
  function process4(){
    var sec = document.getElementById('process'); if (!sec || !sec.classList.contains('pr4')) return null;
    var pin = sec.querySelector('.ch-pin'), stage = sec.querySelector('.pr4-stage'), svg = sec.querySelector('#pr4Svg'), t1 = sec.querySelector('.pr4-t1'), t2 = sec.querySelector('.pr4-t2');
    var bws = [].slice.call(sec.querySelectorAll('.pr4-bw')), labs = [].slice.call(sec.querySelectorAll('.pr5-lab')), sq = sec.querySelector('.pr4-sq'), end = sec.querySelector('.pr4-end'), big = sec.querySelector('.pr4-big');
    var fr = sec.querySelector('.pr5-fr'), ims = [].slice.call(sec.querySelectorAll('.pr5-im')), labsBox = sec.querySelector('.pr5-labs'), cap = sec.querySelector('.pr5-cap'), POR = false, cv = sec.querySelector('.pr4-cv'), FR = [0, 0, 1, 1], curI = -1;
    var cx = cv && cv.getContext('2d'); if (!cx) return null;
    var nds = labs.map(function(){ return el('rect', {width: 9, height: 9, 'class': 'nd'}, svg); });
    var CAPS = ims.map(function(f){ var c = f.querySelector('figcaption'); return c ? c.textContent : ''; });
    var N = 320, W = 1, H = 1, X0 = 0, X1 = 0, Y = 0, RL = 0, KR = 1, KX = 0, KY = 0, DPR = 1, lastSz = '', cur = -1, P = 0;
    /* 15:20 · the knot (youniqlabs-like): a real 3D knot — a (2,5) torus knot, a little irregular — drawn as one white line in
       perspective, turning all the time; where it passes in front of itself the back strand breaks (a knot drawing, not a
       scribble), the near strands are thicker. On the scroll it straightens into the one line of the six steps. */
    var KN = []; for (var i = 0; i < N; i++){ var t = i / N * Math.PI * 2, r = 2 + .9 * Math.cos(5 * t);
      KN.push([r * Math.cos(2 * t), r * Math.sin(2 * t), -.9 * Math.sin(5 * t)]); }
    KN.push(KN[0]);
    function size(){ var r = stage.getBoundingClientRect(), por = r.width < r.height; W = r.width; H = r.height; svg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H));
      DPR = Math.min(window.devicePixelRatio || 1, 2); cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      var m = parseFloat(getComputedStyle(stage).getPropertyValue('--m')) || 48, hd = parseFloat(getComputedStyle(stage).getPropertyValue('--hdr')) || 70;
      POR = por;
      /* v11 (10.11): on desktop the line runs margin to margin and carries six columns — a photograph standing on it, the step under it */
      X0 = por ? W * .07 : m; X1 = por ? W * .78 : W - m; Y = H * (por ? .84 : .7); RL = por ? Math.min(W * (1 - X1 / W - .05), H * .1) : 0;
      KR = Math.min(W * (por ? .3 : .16), H * .21) / 2.9; KX = W * .5; KY = H * .63;
      var pw = por ? Math.min(W * .34, 170) : Math.max(190, Math.min(W * .15, 300)), ph = pw * 1.25;
      var ft = hd + (por ? 24 : 92);   /* polish: the photo's top on the same line as the title beside it (.pr4-t2 top = hdr + 92) */
      FR = [W - m - pw, ft, W - m, ft + ph];
      if (por){ fr.style.transform = 'translate(' + f1(FR[0]) + 'px,' + f1(FR[1]) + 'px)'; fr.style.width = f1(pw) + 'px'; fr.style.height = f1(ph) + 'px';
        cap.style.transform = 'translate(' + f1(FR[0]) + 'px,' + f1(FR[3] + 12) + 'px)'; cap.style.width = f1(pw) + 'px'; }
      else { fr.style.transform = fr.style.width = fr.style.height = cap.style.transform = cap.style.width = ''; fr.style.bottom = f1(H - Y + 16) + 'px'; }
      labs.forEach(function(l, k){ l.style.left = f1(nx(k)) + 'px'; l.style.top = f1(Y + 18) + 'px'; });
      nds.forEach(function(n, k){ n.setAttribute('x', f1(nx(k) - 4.5)); n.setAttribute('y', f1(Y - 4.5)); });
      big.style.setProperty('--bt', f1(por ? Y - 200 : Y - 70 - Math.max(34, W * 66 / 1920) - 120) + 'px'); }
    function nx(k){ return POR ? X0 + k / 5 * (X1 - X0) * .96 : X0 + k / 6 * (X1 - X0); }
    var T0 = performance.now();
    function draw(){
      var T = (performance.now() - T0) / 1000, p = P;
      var e = sm(sg(p, .1, .36)), e2 = e * e * (3 - 2 * e);
      var ay = T * (reduced ? 0 : .38) + p * 5.2, ax = 1.0 + .25 * Math.sin(T * .21 + p * 2), ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax), F = 7.5;
      var S = [];
      for (var i = 0; i <= N; i++){ var k = KN[i], x = k[0] * ca + k[2] * sa, z = -k[0] * sa + k[2] * ca, y = k[1] * cb - z * sb; z = k[1] * sb + z * cb;
        var f = F / (F - z), u = i / N, kx = KX + x * KR * f, ky = KY - y * KR * f, fx, fy;
        if (u < .84){ fx = X0 + (u / .84) * (X1 - X0); fy = Y; } else { var v = (u - .84) / .16; fx = X1 + v * RL; fy = Y - v * RL; }
        S.push([kx + (fx - kx) * e2, ky + (fy - ky) * e2, z * (1 - e2)]); }
      cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.clearRect(0, 0, W, H);
      var op = 1 - sg(p, .88, .92); if (op <= 0) return; cx.globalAlpha = op;
      var seg = []; for (i = 0; i < N; i++) seg.push(i);
      if (e2 < 1) seg.sort(function(a, b){ return (S[a][2] + S[a + 1][2]) - (S[b][2] + S[b + 1][2]); });   /* back to front */
      cx.lineJoin = 'round';
      for (var j = 0; j < N; j++){ var a = S[seg[j]], b = S[seg[j] + 1], d = (a[2] + b[2]) * .5, w = lerp(1.3 + 2.2 * clamp01((d + 1.) / 2.), 1.4, e2);
        if (e2 < .98){ cx.lineCap = 'butt'; cx.strokeStyle = '#0B0B0C'; cx.lineWidth = w + 9 * (1 - e2); cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
        cx.lineCap = 'round'; cx.strokeStyle = '#EBEBEB'; cx.lineWidth = w; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
      cx.globalAlpha = 1;
    }
    var vis = false, raf = 0;
    function loop(){ raf = 0; if (!vis) return; draw(); raf = requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window){ var eg = new IntersectionObserver(function(es){ if (!es[0].isIntersecting) return; ims.forEach(function(f){ var im = f.querySelector('img'); if (im) im.loading = 'eager'; }); eg.disconnect(); }, {rootMargin: '200% 0px'}); eg.observe(sec); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ vis = es[0].isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); }).observe(stage);
    function update(p){
      var sz = window.innerWidth + 'x' + window.innerHeight; if (sz !== lastSz){ lastSz = sz; size(); }
      P = p; if (!vis) draw();
      var e = sm(sg(p, .1, .36));
      /* the opening line, over the knot */
      var ko = sg(p, .3, .38); t1.style.opacity = (1 - ko).toFixed(3);
      t1.style.transform = 'translateY(-50%) scale(' + (1.1 - .1 * eo(sg(p, 0, .12)) - .08 * ko).toFixed(4) + ')'; t1.style.filter = ko > 0 && !LITE ? 'blur(' + f1(12 * ko) + 'px)' : '';
      t1.style.visibility = ko >= 1 ? 'hidden' : '';
      var k2 = sg(p, .37, .42) * (1 - sg(p, .84, .88)); t2.style.opacity = k2.toFixed(3); t2.style.transform = 'translateY(' + f1((1 - eo(sg(p, .37, .42))) * 18 - 24 * sg(p, .86, .9)) + 'px)';
      /* the six steps: the square walks them; the step's word rises above the line */
      var ok = e > .985, s = sg(p, .42, .82), a = s * 5, k = ok && p < .86 ? Math.round(a) : (p >= .86 ? 5 : -1), r = sg(p, .83, .88);
      nds.forEach(function(n, i){ n.style.opacity = ok ? 1 : 0; n.classList.toggle('on', ok && i <= a + .01); });
      labs.forEach(function(l, i){ l.style.opacity = ok ? 1 : 0; l.classList.toggle('on', ok && i === k && p < .86); l.classList.toggle('got', ok && i <= Math.max(k, p >= .86 ? 5 : 0)); });
      if (ok){ var x = nx(0) + (nx(5) - nx(0)) * s, y = Y; if (r > 0){ x = nx(5) + (X1 + RL - nx(5)) * r; y = x > X1 ? Y - (x - X1) : Y; }
        sq.style.opacity = 1; sq.style.transform = 'translate3d(' + f1(x) + 'px,' + f1(y) + 'px,0)'; } else sq.style.opacity = 0;
      /* the real home, small: one photograph per step in the top-right corner, its caption under it */
      var ki = !ok ? 0 : p >= .86 ? 5 : Math.max(0, k);
      var kj = ok ? ki : -1;
      if (kj !== curI){ var pv = curI; curI = kj; ims.forEach(function(im, i){ im.classList.toggle('on', i === kj); im.classList.toggle('was', i === pv && pv !== kj); im.classList.toggle('got', i <= kj); }); cap.textContent = (CAPS[ki] || '').replace(' · ', '\n'); }
      var fo = sg(p, .36, .42); fr.style.opacity = fo.toFixed(3); cap.style.opacity = fo.toFixed(3);
      var lo = 1 - sg(p, .88, .92); svg.style.opacity = lo.toFixed(3); labsBox.style.opacity = lo.toFixed(3); big.style.opacity = lo.toFixed(3); if (lo < 1) sq.style.opacity = lo.toFixed(3);
      var kk = p >= .86 ? -1 : k;
      if (kk !== cur){ var was = cur; cur = kk; bws.forEach(function(b, i){ b.classList.toggle('on', i === kk); b.classList.toggle('was', i === was && kk !== -1 && i !== kk); }); }
      var ke = sg(p, .93, .98); end.style.opacity = ke.toFixed(3); end.style.transform = 'translateY(' + f1((1 - eo(ke)) * 20) + 'px)';
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 09 CLIENT · two lines that meet exactly */
  function client(){
    var sec = document.getElementById('client'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), stage = sec.querySelector('.ch-stage'), phases = [].slice.call(sec.querySelectorAll('.cl-t > [data-a]'));
    var ph1 = sec.querySelector('.cl-ph1'), ph2 = sec.querySelector('.cl-ph2'), l1 = sec.querySelector('.cl-l1'), l2 = sec.querySelector('.cl-l2'), svg = sec.querySelector('.cl-svg');
    var mk = function(cls){ return el('path', {'class': cls, pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, svg); };
    var fa = mk('cl-ln'), fb = mk('cl-ln'), A = mk('cl-ln'), B = mk('cl-ln'), C = mk('cl-ln faint');
    var sq1 = el('rect', {width: 7, height: 7, 'class': 'cl-sq'}, svg), sq2 = el('rect', {width: 7, height: 7, 'class': 'cl-sq'}, svg), loupe = el('circle', {r: 10, 'class': 'cl-loupe', 'vector-effect': 'non-scaling-stroke'}, svg);
    var G = null, lastSz = '';
    function layout(){
      var sb = stage.getBoundingClientRect(), W = sb.width, H = sb.height, por = W / H < 1, m = parseFloat(getComputedStyle(stage).getPropertyValue('--m')) || 48;
      svg.setAttribute('viewBox', '0 0 ' + f1(W) + ' ' + f1(H));
      l1.style.transform = 'none'; var r1 = l1.getBoundingClientRect(), b1 = ph1.getBoundingClientRect();
      var yA = r1.bottom - sb.top + (por ? 22 : 30), X = por ? W - m : Math.round(W * .52), yB = por ? yA + Math.min(H * .34, (W - 2 * m) * .75) : H - m - 44;
      ph2.style.left = m + 'px'; ph2.style.top = yA + 'px'; ph2.style.width = (X - m) + 'px'; ph2.style.height = (yB - yA) + 'px';
      if (por){ l2.style.left = m + 'px'; l2.style.top = (yB + 22) + 'px'; } else { l2.style.left = (X + 44) + 'px'; l2.style.top = (yA + 26) + 'px'; }
      var f = [b1.left - sb.left, b1.top - sb.top, b1.right - sb.left, b1.bottom - sb.top];
      fa.setAttribute('d', 'M' + f1(f[0]) + ' ' + f1(f[1]) + 'H' + f1(f[2]) + 'V' + f1(f[3]));
      fb.setAttribute('d', 'M' + f1(f[0]) + ' ' + f1(f[1]) + 'V' + f1(f[3]) + 'H' + f1(f[2]));
      A.setAttribute('d', 'M' + f1(m) + ' ' + f1(yA) + 'H' + f1(X)); B.setAttribute('d', 'M' + f1(X) + ' ' + f1(yB) + 'V' + f1(yA));
      C.setAttribute('d', 'M' + f1(m) + ' ' + f1(yA) + 'V' + f1(yB) + 'H' + f1(X));
      sq1.setAttribute('x', f1(f[2] - 3.5)); sq1.setAttribute('y', f1(f[3] - 3.5)); sq2.setAttribute('x', f1(X - 3.5)); sq2.setAttribute('y', f1(yA - 3.5));
      loupe.setAttribute('cx', f1(X)); loupe.setAttribute('cy', f1(yA));
      G = {W: W, H: H};
    }
    function draw(e, k){ e.style.strokeDashoffset = (1 - k).toFixed(4); e.style.opacity = k > 0 ? '' : 0; }
    function update(p){
      var sz = window.innerWidth + 'x' + window.innerHeight; if (sz !== lastSz || !G){ lastSz = sz; layout(); }
      phases.forEach(function(e){ phase(e, p); });
      /* i · the portrait's frame: two lines leave one corner and meet, exactly, at the opposite one */
      var out1 = 1 - sm(sg(p, .42, .47)), kf = eo(sg(p, .03, .15));
      draw(fa, kf); draw(fb, kf); fa.style.opacity = fb.style.opacity = kf > 0 ? out1 : 0;
      sq1.style.opacity = (sg(p, .145, .16) * out1).toFixed(3);
      ph1.style.opacity = (sm(sg(p, .15, .22)) * out1).toFixed(3); ph1.querySelector('img').style.transform = 'scale(' + (1.08 - .08 * sm(sg(p, .15, .45))).toFixed(4) + ')';
      /* ii · their standard (a line from the left), ours (a line from below): they meet at one point */
      var k1 = sg(p, .46, .51); l1.style.opacity = k1.toFixed(3); l1.style.transform = 'translateY(' + ((1 - eo(k1)) * 22).toFixed(1) + 'px)';
      draw(A, eo(sg(p, .5, .6))); draw(B, eo(sg(p, .58, .68)));
      var km = sg(p, .675, .69); sq2.style.opacity = km.toFixed(3);
      var kr = sg(p, .68, .76); loupe.setAttribute('r', f1(6 + 34 * eo(kr))); loupe.style.opacity = (kr > 0 ? (1 - kr) * .9 : 0).toFixed(3);
      var k2 = sg(p, .7, .75); l2.style.opacity = k2.toFixed(3); l2.style.transform = 'translateY(' + ((1 - eo(k2)) * 22).toFixed(1) + 'px)';
      draw(C, sg(p, .74, .84));
      ph2.style.opacity = sm(sg(p, .76, .84)).toFixed(3); ph2.querySelector('img').style.transform = 'scale(' + (1.1 - .1 * sm(sg(p, .76, 1))).toFixed(4) + ')';
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 10 REVIEWS · 11 FAQ — quiet sections: their lines draw once as they arrive */
  (function(){
    var els = [].slice.call(document.querySelectorAll('.ch-rev .rv-card, .ch-rev .rv-hd, .ch-faq .fq-hd, .ch-faq .qa'));
    [].slice.call(document.querySelectorAll('.ch-faq .qa')).forEach(function(q, i){ q.style.setProperty('--i', i); });
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduced){ els.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin: '0px 0px -12% 0px'});
    els.forEach(function(e){ io.observe(e); });
  })();

  /* ================================================================== 12 CTA · the bookend: the facade at night as its drawing, built again, and in through the same window */
  /* the 3D scene of the opening (js/pre3d.js) is lent to this stage: its canvas moves here while the CTA is near and goes home after.
     The facade starts as the architect's elevation (the story's sketch, held), the photo returns from the edges in to the CI window,
     the hairline round the window draws, and the camera flies in through it to the lit room where the site began. */
  function cta(){
    var sec = document.getElementById('cta'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), stage = sec.querySelector('.ch-stage'), host = sec.querySelector('#ctGl'), fb = sec.querySelector('.ct-fb'), tx = sec.querySelector('#ctTx');
    var head = tx.querySelector('.ct-h'), side = tx.querySelector('.ct-side');
    var canvas = document.getElementById('v15gl'), home = null, next = null, lent = false, P = 0, lastR = '', mx = 0, my = 0, pmx = 0, pmy = 0;
    window.addEventListener('pointermove', function(e){ mx = e.clientX / window.innerWidth - .5; my = e.clientY / window.innerHeight - .5; }, {passive: true});
    function glOK(){ var g = window.__pre3d; return !!(canvas && g && g.state === 'ready' && g.storyFrame && window.__intro && window.__intro.T && !reduced); }
    function lend(on){
      var g = window.__pre3d; if (on === lent) return;
      if (on){ home = canvas.parentNode; next = canvas.nextSibling; host.appendChild(canvas); g.cta = true; if (g.setRoom) g.setRoom(-1); lent = true; sec.classList.add('gl'); lastR = ''; }
      else { if (home) home.insertBefore(canvas, next && next.parentNode === home ? next : null); g.cta = false; lent = false; sec.classList.remove('gl'); }
    }
    function frame(){
      pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
      var key = P.toFixed(4) + ',' + pmx.toFixed(4) + ',' + pmy.toFixed(4); if (key === lastR) return; lastR = key;
      var W = window.innerWidth, p = P;
      window.__pre3d.storyFrame({T: window.__intro.T, mx: pmx, my: pmy, push: 0, winPx: Math.max(70, W * .075),
        fly: 1 - Math.pow(sm(sg(p, .3, .86)), 1.15), draw: 1 - sm(sg(p, .08, .3)), out: 0, ol: sg(p, .14, .26), olOp: 1 - sg(p, .5, .62)});
    }
    function near(on){
      var ok = on && glOK(); lend(ok);
      if (lent) frame();
    }
    function update(p){
      P = p;
      if (!lent){ var z = 1 + 1.6 * Math.pow(sm(sg(p, .3, .9)), 1.6); fb.style.transform = 'scale(' + z.toFixed(4) + ')'; }
      /* the line: over the drawing first, it stays on the glass while the world moves behind it; then the rest */
      var kh = sg(p, .02, .08); head.style.opacity = kh.toFixed(3); head.style.transform = 'translateY(' + ((1 - eo(kh)) * 22).toFixed(1) + 'px)';
      var ks = sg(p, .84, .92); side.style.opacity = ks.toFixed(3); side.style.transform = 'translateY(' + ((1 - eo(ks)) * 18).toFixed(1) + 'px)'; side.style.visibility = ks > 0 ? '' : 'hidden';
      stage.style.setProperty('--vl', sm(sg(p, .7, .9)).toFixed(3));
    }
    return { sec: sec, pin: pin, update: update, near: near };
  }

  /* ================================================================== FOOTER · a street elevation in hairlines, its windows as points of light; one is ours */
  (function(){
    var svg = document.getElementById('ftCity'); if (!svg) return;
    var seed = 11; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var GY = 330, x = -10, i = 0, dots = '', lit = '', CI = null, gB = el('g', {'class': 'ft-b'}, svg);
    while (x < 1610){
      var w = 46 + Math.round(rnd() * 96), tall = rnd() < .18, h = tall ? 210 + rnd() * 110 : 60 + rnd() * 150, d = 'M' + f1(x) + ' ' + GY + 'V' + f1(GY - h);
      var sb = h > 150 && rnd() < .5 ? Math.round(w * (.14 + rnd() * .12)) : 0, sh = sb ? 18 + rnd() * 26 : 0;
      if (sb) d += 'H' + f1(x + sb) + 'V' + f1(GY - h - sh) + 'H' + f1(x + w - sb) + 'V' + f1(GY - h) + 'H' + f1(x + w);
      else d += 'H' + f1(x + w);
      d += 'V' + GY;
      if (tall && rnd() < .6) d += 'M' + f1(x + w / 2) + ' ' + f1(GY - h - sh) + 'V' + f1(GY - h - sh - 22 - rnd() * 30);
      var p = el('path', {d: d, pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, gB); p.style.setProperty('--i', i);
      /* windows: a point per bay and floor; a few are lit */
      var bx = 9 + Math.round(rnd() * 4), fy = 11 + Math.round(rnd() * 3);
      for (var yy = GY - 14; yy > GY - h + 8; yy -= fy) for (var xx = x + 7; xx < x + w - 5; xx += bx){
        var q = 'M' + f1(xx) + ' ' + f1(yy) + 'h.1';
        if (!CI && x > 300 && x < 520 && h > 150 && yy < GY - 90){ CI = [xx, yy]; continue; }
        if (rnd() < .07) lit += q; else dots += q;
      }
      x += w + (rnd() < .3 ? 6 + Math.round(rnd() * 14) : 0); i++;
    }
    el('path', {d: 'M0 ' + GY + 'H1600', 'class': 'ft-gl', pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, svg);
    el('path', {d: dots, 'class': 'ft-dots', 'vector-effect': 'non-scaling-stroke'}, svg);
    el('path', {d: lit, 'class': 'ft-lit', 'vector-effect': 'non-scaling-stroke'}, svg);
    if (CI) el('rect', {x: f1(CI[0] - 3), y: f1(CI[1] - 3), width: 6, height: 6, 'class': 'ft-ci'}, svg);
    var ft = document.getElementById('footer');
    if (!('IntersectionObserver' in window) || reduced){ ft.classList.add('in'); return; }
    var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ ft.classList.add('in'); io.disconnect(); } }, {rootMargin: '0px 0px -10% 0px'});
    io.observe(svg);
  })();

  /* ================================================================== 04 PROJECTS · v11 (user 09.11 12:51): a slider, not the scroll.
     Arrows, the pagination (the active line fills while it plays, 7 s, then the next one opens), the panel's index rows, swipe.
     Held while the pointer is on the panel or the controls, and while the section is off screen. */
  (function(){
    var sec = document.getElementById('projects'); if (!sec || !sec.classList.contains('pj4')) return;
    var q = function(s){ return [].slice.call(sec.querySelectorAll(s)); };
    var ims = q('.pj4-im'), cs = q('.pj4-c'), rs = q('.pj4-r'), pgs = q('.pj4-pg button'), N = ims.length, cur = 0, lock = 0, wasT = 0;
    function show(s){
      var prev = cur; cur = s; clearTimeout(wasT);
      ims.forEach(function(e, k){ e.classList.toggle('on', k === s); e.classList.toggle('was', k === prev); });
      cs.forEach(function(e, k){ e.classList.toggle('on', k === s); e.classList.toggle('was', k === prev); });
      rs.forEach(function(e, k){ e.classList.toggle('on', k === s); });
      pgs.forEach(function(e, k){ e.classList.toggle('on', k === s); e.classList.remove('run'); });
      void sec.offsetWidth; pgs[s].classList.add('run');
      wasT = setTimeout(function(){ ims.forEach(function(e){ e.classList.remove('was'); }); cs.forEach(function(e){ e.classList.remove('was'); }); }, 1400);
    }
    function go(s){ s = (s + N) % N; var now = performance.now(); if (s === cur || now < lock) return; lock = now + 950; show(s); }
    pgs.forEach(function(b, i){ b.addEventListener('click', function(){ go(i); }); });
    rs.forEach(function(b, i){ b.addEventListener('click', function(){ go(i); }); });
    sec.querySelector('.pj4-ar.prev').addEventListener('click', function(){ go(cur - 1); });
    sec.querySelector('.pj4-ar.next').addEventListener('click', function(){ go(cur + 1); });
    sec.addEventListener('animationend', function(e){ if (e.animationName === 'pj4-prog') go(cur + 1); });
    q('.pj4-pn, .pj4-ctl').forEach(function(el){
      el.addEventListener('pointerenter', function(e){ if (e.pointerType !== 'touch') sec.classList.add('hold'); });
      el.addEventListener('pointerleave', function(){ sec.classList.remove('hold'); });
    });
    sec.addEventListener('keydown', function(e){ if (e.key === 'ArrowRight') go(cur + 1); else if (e.key === 'ArrowLeft') go(cur - 1); });
    var sx = null, sy = 0, stage = sec.querySelector('.pj4-stage');
    stage.addEventListener('pointerdown', function(e){ if (e.pointerType === 'mouse' || e.target.closest('.pj4-pn, .pj4-ctl')) return; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', function(e){ if (sx === null) return; var dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(cur + (dx < 0 ? 1 : -1)); });
    sec.classList.add('paused');
    if ('IntersectionObserver' in window) new IntersectionObserver(function(en){ sec.classList.toggle('paused', !en[0].isIntersecting); }, {threshold: .55}).observe(sec);
    else sec.classList.remove('paused');
  })();

  /* ================================================================== 05 DIFFERENCE · v9: the photograph ruled into a grid; a discipline opens as a card in its cell, the photograph follows */
  (function(){
    var sec = document.getElementById('difference'), st = sec && sec.querySelector('.df2-body'); if (!st) return;
    var cells = [].slice.call(st.querySelectorAll('.df2-cell')), bgs = [].slice.call(sec.querySelectorAll('.df2-bg'));
    var cur = Math.max(0, cells.findIndex(function(c){ return c.classList.contains('on'); })), inView = false, hover = false, timer = null;
    function show(i){ cur = i; cells.forEach(function(c, k){ c.classList.toggle('on', k === i); c.setAttribute('aria-expanded', k === i ? 'true' : 'false'); }); bgs.forEach(function(b, k){ b.classList.toggle('on', k === i); }); plan(); }
    var DEF = cur;
    function plan(){ clearTimeout(timer); if (inView && !hover && !reduced && sec.classList.contains('ready')) timer = setTimeout(function(){ show((cur + 1) % cells.length); }, 5200); }
    sec.addEventListener('df2in', plan); sec.addEventListener('df2out', function(){ hover = false; clearTimeout(timer); });
    sec.addEventListener('df2reset', function(){ if (cur !== DEF) show(DEF); clearTimeout(timer); });
    cells.forEach(function(c, i){ c.addEventListener('click', function(){ show(i); });
      c.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse'){ hover = true; if (i !== cur) show(i); else plan(); } });
      c.addEventListener('pointerleave', function(){ hover = false; plan(); }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ inView = es[0].isIntersecting; plan(); }, {threshold: .45}).observe(st);
  })();

  /* ================================================================== 09 CLIENT · v9: reveals, and the photographs drift at their own depths */
  (function(){
    var sec = document.querySelector('.cl2'); if (!sec) return;
    var rv = [].slice.call(sec.querySelectorAll('.cl2-rv')), photo = sec.querySelector('.cl2-photo img'), frs = [].slice.call(sec.querySelectorAll('.cl2-fr')), on = false;
    if (!('IntersectionObserver' in window) || reduced){ rv.forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin: '0px 0px -15% 0px'});
    rv.forEach(function(e){ io.observe(e); });
    var DEP = [-.06, .1, -.16];
    function drift(){ if (!on) return; var vh = window.innerHeight, r = sec.getBoundingClientRect(), k = (r.top + r.height / 2 - vh / 2) / vh;
      var pr = photo.parentNode.getBoundingClientRect(), kp = (pr.top + pr.height / 2 - vh / 2) / vh; photo.style.transform = 'translate3d(0,' + (kp * -9 - 7).toFixed(2) + '%,0)';
      var por = window.innerWidth < window.innerHeight;
      frs.forEach(function(f, i){ if (por){ f.style.transform = ''; return; } var kf = (r.top + f.offsetTop + f.offsetHeight / 2 - vh / 2) / vh; f.style.transform = 'translate3d(0,' + (kf * DEP[i] * vh).toFixed(1) + 'px,0)'; });
      requestAnimationFrame(drift); }
    new IntersectionObserver(function(es){ var was = on; on = es[0].isIntersecting; if (on && !was) requestAnimationFrame(drift); }).observe(sec);
  })();

  /* ================================================================== 10 REVIEWS · v9: two testimonials, dots switch the card and the film still behind it */
  (function(){
    var sec = document.querySelector('.rv2'); if (!sec) return;
    var dots = [].slice.call(sec.querySelectorAll('.rv2-dots button')), qs = [].slice.call(sec.querySelectorAll('.rv2-q')), bgs = [].slice.call(sec.querySelectorAll('.rv2-bg'));
    dots.forEach(function(d, i){ d.addEventListener('click', function(){ [dots, qs, bgs].forEach(function(a){ a.forEach(function(e, k){ e.classList.toggle('on', k === i); }); }); }); });
  })();

  /* light sections: the header and the chapter rail turn to ink while one is under them */
  var INK = [].slice.call(document.querySelectorAll('[data-ink]')), hdrEl = document.getElementById('hdr'), chapEl = document.getElementById('chap'), inkH = null, inkC = null;
  function ink(){
    if (!INK.length) return; var vh = window.innerHeight, yh = 40, yc = vh - 18, h = false, c = false;
    for (var i = 0; i < INK.length; i++){ var r = INK[i].getBoundingClientRect(); if (r.top <= yh && r.bottom >= yh) h = true; if (r.top <= yc && r.bottom >= yc) c = true; }
    if (h !== inkH){ inkH = h; if (hdrEl) hdrEl.classList.toggle('ink', h); }
    if (c !== inkC){ inkC = c; if (chapEl) chapEl.classList.toggle('ink', c); }
  }

  /* chapter rail: each item reads what is under it — photos and dark fields → white, light cards / panels → #1D1D1D */
  var CHA = chapEl ? [].slice.call(chapEl.querySelectorAll('a')) : [], curEl = document.getElementById('cur'), chapN = 0;
  function rgbL(s){ var m = s && s.match(/[\d.]+/g); if (!m || (m.length > 3 && +m[3] < .5)) return -1; return (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; }
  function under(x, y){
    var st = document.elementsFromPoint(x, y);
    for (var i = 0; i < st.length; i++){
      var e = st[i]; if ((chapEl && chapEl.contains(e)) || (curEl && curEl.contains(e))) continue;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .5) continue;
      var t = e.tagName; if (t === 'IMG' || t === 'VIDEO' || t === 'CANVAS' || t === 'image') return 0;
      if (cs.backgroundImage.indexOf('url(') >= 0) return 0;
      var l = rgbL(cs.backgroundColor); if (l >= 0) return l;
      if (e instanceof SVGGeometryElement && cs.fill !== 'none' && +cs.fillOpacity > .5){ l = rgbL(cs.fill); if (l >= 0) return l; }
    }
    return 0;
  }
  function chapInk(){
    if (!CHA.length || (chapN++ & 3)) return; var y = window.innerHeight - 18;
    for (var i = 0; i < CHA.length; i++){ var r = CHA[i].getBoundingClientRect(); if (!r.width) continue; var lt = under(r.left + Math.min(r.width / 2, 60), y) > .6; if (lt !== CHA[i]._lt){ CHA[i]._lt = lt; CHA[i].classList.toggle('lt', lt); } }
  }

  /* ================================================================== the loop: only chapters near the screen, cached ranges */
  var CH = [philosophy(), about(), projects(), diffOpen(), difference(), suite(), approach(), process(), process3(), process4(), client(), cta()].filter(Boolean), dirty = true;
  var SVGS = [].slice.call(document.querySelectorAll('.ch svg'));
  function dashScale(){ SVGS.forEach(function(v){ var m = v.getScreenCTM && v.getScreenCTM(); if (m && m.a) v.style.setProperty('--ds', Math.max(m.a, .05).toFixed(4)); }); }
  function measure(){ dashScale(); var y = window.scrollY || window.pageYOffset; CH.forEach(function(c){ var r = c.pin.getBoundingClientRect(); c.top = r.top + y; c.h = c.pin.offsetHeight; }); dirty = false; }
  window.addEventListener('resize', function(){ dirty = true; }); window.addEventListener('load', function(){ dirty = true; });
  if (window.ResizeObserver) new ResizeObserver(function(){ dirty = true; }).observe(document.body);
  function tick(){
    ink(); chapInk();
    if (dirty) measure();
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    for (var i = 0; i < CH.length; i++){ var c = CH[i], away = y + vh * 1.5 < c.top || y > c.top + c.h + vh * .5;
      if (c.near) c.near(!away);
      if (away) continue;
      var p = reduced ? 1 : clamp01((y - c.top) / Math.max(1, c.h - vh));
      if (p !== c.last){ c.last = p; c.update(p, vh); } }
    requestAnimationFrame(tick);
  }
  if (CH.length){ CH.forEach(function(c){ c.update(0); }); requestAnimationFrame(tick); }
})();
