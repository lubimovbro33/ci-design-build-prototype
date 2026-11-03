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
    var hourT = el('text', {x: 0, y: RY - 36, 'class': 'hr', 'text-anchor': 'middle'}, cursor);
    /* five, ten, twenty years: the home's outline grows outward like rings */
    var gYrs = el('g', {'class': 'dg'}, svg), YR = [{d: 34, t: '5'}, {d: 70, t: '10'}, {d: 112, t: '20'}];
    YR.forEach(function(y, i){ line(gYrs, rectD(-y.d, -y.d, W + 2 * y.d, H + 2 * y.d, y.d * .9), 'w3 yr', i * .22);
      var t = el('text', {x: W + y.d - 6, y: -y.d - 8, 'class': 'yl', 'text-anchor': 'end'}, gYrs); t.textContent = y.t; y.t2 = t; });
    var yrLab = el('text', {x: W + 112, y: -112 - 26, 'class': 'yl lab', 'text-anchor': 'end'}, gYrs); yrLab.textContent = 'YEARS FROM NOW';
    var stage = sec.querySelector('.ch-stage');

    function update(p){
      /* text: one phase at a time, cross-fading with a small rise */
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
      /* the plan draws itself, then dims a little at the close */
      var kd = sg(p, .0, .12); [gWall, gWin, gDoor, gFur].forEach(function(g){ g.style.setProperty('--k', kd.toFixed(3)); });
      gAll.style.opacity = (1 - .45 * sg(p, .9, 1)).toFixed(3);
      /* the 75 %: the at-home hours fill the scale bar */
      var kr = sg(p, .1, .15); gRule.style.setProperty('--k', kr.toFixed(3));
      var kf = eo(sg(p, .13, .22)); fill.style.strokeDashoffset = (1 - kf).toFixed(4);
      txt(pctEl, Math.round(75 * kf)); stage.style.setProperty('--pc', (sg(p, .11, .15) * (1 - sg(p, .88, .94))).toFixed(3));
      /* the day: 06:00 → 24:00 while the verbs are read */
      var hr = 5 + 19 * sg(p, .36, .76), th = Math.min(23.99, hr), mm = Math.floor((th % 1) * 60);
      txt(hourT, (th < 10 ? '0' : '') + Math.floor(th) + ':' + (mm < 10 ? '0' : '') + mm);
      
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
    var gSec = el('g', {}, svg);
    LAY.forEach(function(L, i){ L.g = el('g', {'class': 'dg'}, gSec); L.box = el('path', {d: rectD(-10, 50, 920, 580), 'class': 'box', 'vector-effect': 'non-scaling-stroke'}, L.g);
      L.t = el('text', {x: -10, y: 36, 'class': 'lt'}, L.g); L.t.textContent = L.k; });
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
    var gRoof = el('g', {'class': 'dg roof'}, svg);
    line(gRoof, 'M10 92L450 -110L890 92', 'w1', 0); line(gRoof, 'M40 80L450 -92L860 80', 'w2', .1);
    /* disciplines, each pointing at its part of the house */
    var DIS = [['ARCHITECTURE', 47, 460, -1], ['INTERIOR DESIGN', 765, 240, 1], ['CONSTRUCTION', 640, 460, 1], ['FURNISHINGS', 425, 548, 1], ['ART', 620, 200, 1],
               ['WELLNESS', 605, 300, 1], ['PROCUREMENT', 185, 425, -1], ['INSTALLATION', 195, 476, -1], ['PROJECT MANAGEMENT', 450, -60, 1]];
    var gDis = el('g', {}, svg), dis = DIS.map(function(d, i){
      var g = el('g', {'class': 'ab-dis'}, gDis), lx = d[3] > 0 ? 960 : -60, ly = 20 + i * 64;
      if (d[0] === 'PROJECT MANAGEMENT') ly = -120;
      el('path', {d: 'M' + d[1] + ' ' + d[2] + 'L' + (d[3] > 0 ? lx - 20 : lx + 20) + ' ' + ly + 'H' + lx, 'class': 'ld', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, g);
      el('rect', {x: d[1] - 3, y: d[2] - 3, width: 6, height: 6, 'class': 'sq'}, g);
      var t = el('text', {x: lx + (d[3] > 0 ? 10 : -10), y: ly + 5, 'class': 'dt', 'text-anchor': d[3] > 0 ? 'start' : 'end'}, g); t.textContent = d[0];
      return g; });
    /* time: the traditional model hands off five times; CI runs the same work together and finishes a fifth sooner */
    var gT = el('g', {'class': 'ab-time'}, svg), TY = 760, X0 = 0, X1 = 900;
    var trad = [[0, .16], [.21, .37], [.42, .66], [.71, .84], [.88, 1]], ci = [[0, .2], [.08, .36], [.18, .66], [.4, .72], [.56, .8]];
    var lab1 = el('text', {x: X0, y: TY - 22, 'class': 'tl'}, gT); lab1.textContent = 'THE TRADITIONAL MODEL';
    var lab2 = el('text', {x: X0, y: TY + 118, 'class': 'tl'}, gT); lab2.textContent = 'CI DESIGN + BUILD';
    var bars = [];
    trad.forEach(function(b, i){ bars.push({e: el('path', {d: seg(X0 + b[0] * X1, TY + i * 12, X0 + b[1] * X1, TY + i * 12), 'class': 'bar t', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, gT), d: i * .08}); });
    ci.forEach(function(b, i){ bars.push({e: el('path', {d: seg(X0 + b[0] * X1, TY + 140 + i * 12, X0 + b[1] * X1, TY + 140 + i * 12), 'class': 'bar c', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, gT), d: .3 + i * .06}); });
    var saved = el('path', {d: seg(X1 * .8, TY + 200, X1, TY + 200), 'class': 'sav', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, gT);
    var savT = [el('path', {d: seg(X1 * .8, TY + 192, X1 * .8, TY + 208), 'class': 'sav', 'vector-effect': 'non-scaling-stroke'}, gT), el('path', {d: seg(X1, TY + 192, X1, TY + 208), 'class': 'sav', 'vector-effect': 'non-scaling-stroke'}, gT)];
    /* your decisions on CI's line; everything in between is ours */
    var MS = [.0, .2, .36, .56, .8], own = el('path', {d: seg(0, TY + 236, X1 * .8, TY + 236), 'class': 'own', 'vector-effect': 'non-scaling-stroke', pathLength: 1}, gT);
    var dots = MS.map(function(m){ return el('rect', {x: m * X1 - 4, y: TY + 232, width: 8, height: 8, 'class': 'ms'}, gT); });

    function update(p){
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
      /* the five layers draw, spread apart in their own frames; then they come together and register */
      var kd = sg(p, .02, .16), j = sm(sg(p, .3, .46)), fr = sg(p, .12, .2) * (1 - sg(p, .3, .38));
      LAY.forEach(function(L, i){ L.g.style.setProperty('--k', kd.toFixed(3));
        /* spread: five small separate drawings in a row, each in its own frame, slightly askew; together: one */
        var s = sm(sg(p, .1, .24)) * (1 - j), sc = lerp(1, .3, s), tx = lerp(450, -186 + i * 334, s), ty = lerp(340, 330 + L.off[1] * .6, s), r = L.off[2] * s;
        L.g.setAttribute('transform', 'translate(' + f1(tx) + ' ' + f1(ty) + ') rotate(' + r.toFixed(2) + ') scale(' + sc.toFixed(4) + ') translate(-450 -340)');
        L.box.style.opacity = fr.toFixed(3); L.t.style.opacity = (sg(p, .14, .2) * (1 - sg(p, .3, .36))).toFixed(3); });
      /* one roof */
      gRoof.style.setProperty('--k', sg(p, .46, .54).toFixed(3));
      /* the disciplines */
      dis.forEach(function(g, i){ var k = sg(p, .5 + i * .012, .54 + i * .012) * (1 - sg(p, .6, .63)); g.style.opacity = k.toFixed(3); g.firstChild.style.strokeDashoffset = (1 - k).toFixed(3); });
      /* the section steps back while time is measured; 20 % */
      var tk = sm(sg(p, .6, .66));
      gSec.style.opacity = (1 - .62 * tk).toFixed(3); gRoof.style.opacity = (1 - .62 * tk).toFixed(3);
      gT.style.opacity = tk.toFixed(3);
      bars.forEach(function(b){ var k = sg(p, .63 + b.d * .1, .67 + b.d * .1); b.e.style.strokeDashoffset = (1 - k).toFixed(3); });
      var ks = sg(p, .7, .76); saved.style.strokeDashoffset = (1 - ks).toFixed(3); savT.forEach(function(e){ e.style.opacity = ks.toFixed(3); });
      txt(pctEl, Math.round(20 * eo(ks))); stage.style.setProperty('--pc', sg(p, .69, .72).toFixed(3));
      /* your decisions, our everything-in-between */
      var km = sg(p, .82, .9); own.style.strokeDashoffset = (1 - km).toFixed(3);
      dots.forEach(function(d, i){ d.style.opacity = sg(p, .8 + i * .012, .82 + i * .012).toFixed(3); });
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
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
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
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
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
    function layout(set){                                                 /* each layer's place in a state: present ones stacked, absent ones lifted out */
      var N = set.length, gp = Math.min(200, (HS - PH) / Math.max(1, N - 1)), top = (VBH - (PH + (N - 1) * gp)) / 2, out = {};
      ORDER.forEach(function(_, li){
        var k = set.indexOf(li);
        if (k >= 0) out[li] = {y: top + (N - 1 - k) * gp, o: 1, pos: k};
        else { var v = set.filter(function(x){ return x < li; }).length - .5; out[li] = {y: top + (N - 1 - v) * gp - 320, o: 0, pos: -1}; }
      });
      out.top = top; out.bot = top + (N - 1) * gp; out.N = N; return out;
    }
    var LS = ST.map(layout), ENTER = {5: [.5, .6], 9: [.78, .88]};
    function state(p){                                                    /* blended between the tiers */
      var t = [sm(sg(p, .3, .38)), sm(sg(p, .5, .58)), sm(sg(p, .78, .86))], k = t[2] > 0 ? 2 : t[1] > 0 ? 1 : 0, a = LS[k], b = LS[k + 1], u = t[k];
      return {a: a, b: b, u: u, dom: u < .5 ? k : k + 1};
    }
    function go(pp){ var top = pin.getBoundingClientRect().top + (window.scrollY || window.pageYOffset); window.scrollTo({top: top + pp * (pin.offsetHeight - window.innerHeight), behavior: 'smooth'}); }
    tabs.forEach(function(b, i){ b.addEventListener('click', function(){ go([.2, .44, .67][i]); }); });
    if (sw) sw.addEventListener('click', function(){ go(sw.classList.contains('on') ? .67 : .93); });
    var lastDom = -1, portrait = null;
    function update(p){
      var pt = window.innerWidth < window.innerHeight; if (pt !== portrait){ portrait = pt; svg.setAttribute('viewBox', pt ? '40 0 1600 1500' : '0 0 2100 1500'); }
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
      var s = state(p), dom = s.dom, H = [[.12, .3], [.38, .5], [.6, .78], [.86, 1]][dom], ht = sg(p, H[0], H[1]), hold = ht > 0 && ht < 1 ? 1 : 0, setD = ST[dom];
      layers.forEach(function(L, j){
        var A = s.a[L.i], B = s.b[L.i], y = lerp(A.y, B.y, s.u), o = lerp(A.o, B.o, s.u);
        var e = ENTER[L.i], kd = e ? sg(p, e[0], e[1]) : sg(p, .01 + L.i * .011, .1 + L.i * .011);
        var kp = setD.indexOf(L.i), em = dom === 3 ? (L.i === 9 ? 1 : 0) : kp < 0 ? 0 : Math.max(0, 1 - Math.abs(ht * setD.length - (kp + .5)) * 1.2) * hold;
        var dimK = dom === 3 ? sm(sg(p, .86, .9)) : Math.min(sm(sg(ht, 0, .06)), 1 - sm(sg(ht, .94, 1)));
        L.em = em; L.gd.style.opacity = (1 - .45 * dimK * (1 - em)).toFixed(3); L.lab.classList.toggle('em', em > .5 || (dimK < .5 && kp >= 0));
        L.gd.style.setProperty('--k', kd.toFixed(3)); L.lab.style.opacity = (sg(kd, .25, .6) * o).toFixed(3);
        L.g.setAttribute('transform', 'translate(' + f1(-46 * sm(em)) + ' ' + f1(y) + ')'); L.g.style.opacity = o.toFixed(3); L.g.style.visibility = o > .002 ? '' : 'hidden';
      });
      var top = lerp(s.a.top, s.b.top, s.u), bot = lerp(s.a.bot, s.b.bot, s.u), ks = sg(p, .1, .16);
      spine.forEach(function(sp, i){ var c = [LC, FC, RC][i]; sp.setAttribute('d', 'M' + f1(c[0]) + ' ' + f1(top + c[1]) + 'V' + f1(top + c[1] + (bot - top) * ks)); });
      if (dom !== lastDom){ lastDom = dom; var set = ST[dom];
        layers.forEach(function(L){ var k = set.indexOf(L.i); if (k >= 0) L.num.textContent = (k < 9 ? '0' : '') + (k + 1); });
        cnt.textContent = set.length; tabs.forEach(function(b, i){ b.classList.toggle('on', i === Math.min(2, dom)); });
        if (sw){ sw.classList.toggle('on', dom === 3); sw.setAttribute('aria-pressed', dom === 3 ? 'true' : 'false'); } }
      var w = [1 - sm(sg(p, .3, .38)), sm(sg(p, .3, .38)) * (1 - sm(sg(p, .5, .58))), sm(sg(p, .5, .58))];
      descs.forEach(function(d, i){ var o = sm(clamp01(w[i] * 2 - 1)); d.style.opacity = o.toFixed(3); d.style.visibility = o > 0 ? '' : 'hidden'; d.style.transform = 'translateY(' + ((1 - o) * 10).toFixed(1) + 'px)'; });
      stage.style.setProperty('--pc', (sg(p, .08, .12) * (1 - sg(p, .97, 1))).toFixed(3));
    }
    return { sec: sec, pin: pin, update: update };
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
    var W = 1, H = 1, CX = 0, CY = 0, F = 1, cam = null;
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
    var lastSz = '';
    function update(p){
      var sz = window.innerWidth + 'x' + window.innerHeight; if (sz !== lastSz){ lastSz = sz; size(); }
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
      /* the questions type themselves; the one being asked is bright, the answered ones settle */
      var act = -1;
      rows.forEach(function(r, i){ var a = Q0 + i * QD, t = sg(p, a, a + QT), full = txs[i].dataset.t, n = Math.ceil(full.length * eo(t) - 1e-6);
        if (txs[i].__n !== n){ txs[i].__n = n; txs[i].style.setProperty('--n', n); var c = chs[i][Math.max(0, n - 1)]; if (curC[i] !== c){ if (curC[i]) curC[i].classList.remove('ap-c'); c.classList.add('ap-c'); curC[i] = c; } }
        r.style.opacity = (sg(p, a - .012, a)).toFixed(3); if (p >= a) act = i;
        r.classList.toggle('typing', t > 0 && t < 1); });
      rows.forEach(function(r, i){ r.classList.toggle('on', i === act && p < .6); });
      /* the camera: a plan from straight above, then it tips over into a three-quarter view and drifts */
      var tilt = sm(sg(p, .6, .74)), dr = sg(p, .74, 1), narrow = W / H < .9;
      var yaw = lerp(0, -.62, tilt) - .16 * dr, pitch = lerp(Math.PI / 2 - .0001, .5, tilt) - .05 * dr, dist = lerp(20, 24, tilt);
      var zoom = Math.min(W * (narrow ? .9 : .66) / (5.6 / dist), H * .78 / (4.8 / dist)) * lerp(1, .82, tilt);
      CX = W / 2; CY = H * lerp(.5, .58, tilt); setCam(yaw, pitch, dist, lerp(0, 1.3, sm(sg(p, .7, .86))), zoom);
      /* the grid axes: question i draws axis i+1 and (to D) one lettered axis */
      var xa = XS[0] - EXT, xb = XS[4] + EXT, za = ZS[0] - EXT, zb = ZS[3] + EXT, bs = narrow ? ' scale(.72)' : '', bf = 1 - .55 * sm(sg(p, .86, .94));
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
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== 08 PROCESS · one room, six stages: surveyed, scoped, drawn, built, curated, lit */
  function process(){
    var sec = document.getElementById('process'); if (!sec || !sec.classList.contains('ch')) return null;
    var pin = sec.querySelector('.ch-pin'), stage = sec.querySelector('.ch-stage'), phases = [].slice.call(sec.querySelectorAll('.ch-t > [data-a]'));
    var box = sec.querySelector('#prBox'), svg = sec.querySelector('#prSvg'), lab = sec.querySelector('#prLab'), rail = [].slice.call(sec.querySelectorAll('#prRail > div'));
    var imgs = {}; [].slice.call(box.querySelectorAll('.pr-img')).forEach(function(im){ imgs[im.dataset.k] = im; });
    var inner = document.createElement('div'); inner.className = 'pr-in'; box.insertBefore(inner, box.firstChild);
    ['clay', 'day', 'eve'].forEach(function(k){ inner.appendChild(imgs[k]); }); inner.appendChild(svg);
    var NAMES = ['Discover', 'Define', 'Design', 'Build', 'Curate', 'Deliver'], S0 = .1, SD = .13;
    var D = null, gPts, clipR, scan, gScope, gLines;
    var defs = el('defs', {}, svg); clipR = el('rect', {x: 0, y: 0, width: 0, height: 899}, el('clipPath', {id: 'prClip'}, defs));
    var glow = el('linearGradient', {id: 'prScanG', x1: 0, x2: 1, y1: 0, y2: 0}, defs);
    el('stop', {offset: 0, 'stop-color': '#96A9BF', 'stop-opacity': 0}, glow); el('stop', {offset: 1, 'stop-color': '#96A9BF', 'stop-opacity': .22}, glow);
    gScope = el('g', {'class': 'dg'}, svg); gLines = el('g', {'class': 'dg'}, svg);
    var scanBand = el('rect', {x: 0, y: 0, width: 140, height: 899, fill: 'url(#prScanG)', opacity: 0}, svg);
    scan = el('path', {d: 'M0 0V899', 'class': 'pr-scan', 'vector-effect': 'non-scaling-stroke'}, svg);
    /* the scope: the wall we will work on, its dimension strings (no figures), the stations it was measured from */
    var SX0 = 346, SX1 = 1585, SY0 = 232, SY1 = 690;
    line(gScope, rectD(SX0, SY0, SX1 - SX0, SY1 - SY0), 'w1', 0);
    line(gScope, seg(SX0, 186, SX1, 186), 'w2', .15); [SX0, 650, 842, 1430, SX1].forEach(function(x, i){ line(gScope, seg(x - 7, 193, x + 7, 179), 'w2', .2 + i * .03); line(gScope, seg(x, 172, x, 200), 'w3', .2 + i * .03); });
    line(gScope, seg(300, SY0, 300, SY1), 'w2', .15); [SY0, 298, 638, SY1].forEach(function(y, i){ line(gScope, seg(293, y + 7, 307, y - 7), 'w2', .25 + i * .03); line(gScope, seg(286, y, 314, y), 'w3', .25 + i * .03); });
    [[SX0, SY0], [SX1, SY0], [SX1, SY1], [SX0, SY1]].forEach(function(q, i){ line(gScope, circD(q[0], q[1], 9), 'w2', .4 + i * .04); });
    line(gScope, seg(1136 - 18, 468, 1136 + 18, 468), 'w2', .5); line(gScope, seg(1136, 450, 1136, 486), 'w2', .5);
    fetch('assets/proc/data.json').then(function(r){ return r.json(); }).then(function(d){
      D = d; var pp = d.p, s = '';
      for (var i = 0; i < pp.length; i += 2) s += 'M' + pp[i] + ' ' + pp[i + 1] + 'h.1';
      gPts = el('path', {d: s, 'class': 'pr-pts', 'clip-path': 'url(#prClip)', 'vector-effect': 'non-scaling-stroke'}, svg); svg.insertBefore(gPts, gScope);
      d.l.forEach(function(q, j){ var L = Math.hypot(q[2] - q[0], q[3] - q[1]) || 1, ex = (q[2] - q[0]) / L * 14, ey = (q[3] - q[1]) / L * 14;
        line(gLines, seg(q[0] - ex, q[1] - ey, q[2] + ex, q[3] + ey), q[4] > .3 ? 'w1' : 'w2', .55 * j / d.l.length); });
      last = -1; if (cur != null) update(cur);
    }).catch(function(){});
    var last = -1, cur = null, lastStep = -2;
    function update(p){
      cur = p;
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
      stage.style.setProperty('--fr', sg(p, .05, .1).toFixed(3));
      /* 01 survey: a scanner sweeps the room, the points stay behind it */
      var sw = sm(sg(p, .11, .22)); clipR.setAttribute('width', f1(1600 * sw));
      scan.setAttribute('transform', 'translate(' + f1(1600 * sw) + ' 0)'); scanBand.setAttribute('x', f1(1600 * sw - 140));
      var sOn = sw > 0 && sw < 1 ? 1 : 0; scan.style.opacity = sOn; scanBand.setAttribute('opacity', sOn);
      if (gPts) gPts.style.opacity = ((1 - .7 * sm(sg(p, .26, .31))) * (1 - sm(sg(p, .39, .45)))).toFixed(3);
      /* 02 scope */
      gScope.style.setProperty('--k', sg(p, .26, .36).toFixed(3)); gScope.style.opacity = (1 - .75 * sm(sg(p, .4, .46)) - .25 * sm(sg(p, .52, .56))).toFixed(3);
      /* 03 the drawing; 04 the grey build under it; 05 colour; 06 the lights come on */
      gLines.style.setProperty('--k', sg(p, .39, .49).toFixed(3));
      gLines.style.opacity = (1 - .45 * sm(sg(p, .53, .58)) - .4 * sm(sg(p, .65, .7)) - .15 * sm(sg(p, .78, .82))).toFixed(3);
      imgs.clay.style.opacity = sm(sg(p, .52, .58)).toFixed(3); imgs.day.style.opacity = sm(sg(p, .65, .71)).toFixed(3); imgs.eve.style.opacity = sm(sg(p, .78, .86)).toFixed(3);
      inner.style.transform = 'scale(' + (1 + .05 * sm(sg(p, .5, 1))).toFixed(4) + ')';
      /* the rail */
      var step = -1;
      rail.forEach(function(r, i){ var a = S0 + i * SD, k = sg(p, a, a + SD); r.style.setProperty('--f', k.toFixed(3)); if (p >= a) step = i; r.classList.toggle('on', p >= a && (p < a + SD || i === 5)); });
      if (step !== lastStep){ lastStep = step; lab.textContent = step < 0 ? '' : '0' + (step + 1) + ' / ' + NAMES[step]; }
      stage.style.setProperty('--rl', sg(p, .07, .11).toFixed(3));
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
      phases.forEach(function(e){ var a = +e.dataset.a, b = +e.dataset.b, k = Math.min(sg(p, a, a + .03), 1 - sg(p, b - .03, b));
        e.style.opacity = k.toFixed(3); e.style.transform = 'translateY(' + ((1 - eo(Math.min(1, sg(p, a, a + .05)))) * 18).toFixed(1) + 'px)'; e.style.visibility = k > 0 ? '' : 'hidden'; });
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

  /* ================================================================== the loop: only chapters near the screen, cached ranges */
  var CH = [philosophy(), about(), projects(), difference(), suite(), approach(), process(), client(), cta()].filter(Boolean), dirty = true;
  var SVGS = [].slice.call(document.querySelectorAll('.ch svg'));
  function dashScale(){ SVGS.forEach(function(v){ var m = v.getScreenCTM && v.getScreenCTM(); if (m && m.a) v.style.setProperty('--ds', Math.max(m.a, .05).toFixed(4)); }); }
  function measure(){ dashScale(); var y = window.scrollY || window.pageYOffset; CH.forEach(function(c){ var r = c.pin.getBoundingClientRect(); c.top = r.top + y; c.h = c.pin.offsetHeight; }); dirty = false; }
  window.addEventListener('resize', function(){ dirty = true; }); window.addEventListener('load', function(){ dirty = true; });
  if (window.ResizeObserver) new ResizeObserver(function(){ dirty = true; }).observe(document.body);
  function tick(){
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
