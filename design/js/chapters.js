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
      pctEl.textContent = Math.round(75 * kf); stage.style.setProperty('--pc', (sg(p, .11, .15) * (1 - sg(p, .88, .94))).toFixed(3));
      /* the day: 06:00 → 24:00 while the verbs are read */
      var hr = 5 + 19 * sg(p, .36, .76), th = Math.min(23.99, hr), mm = Math.floor((th % 1) * 60);
      hourT.textContent = (th < 10 ? '0' : '') + Math.floor(th) + ':' + (mm < 10 ? '0' : '') + mm;
      
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
      pctEl.textContent = Math.round(20 * eo(ks)); stage.style.setProperty('--pc', sg(p, .69, .72).toFixed(3));
      /* your decisions, our everything-in-between */
      var km = sg(p, .82, .9); own.style.strokeDashoffset = (1 - km).toFixed(3);
      dots.forEach(function(d, i){ d.style.opacity = sg(p, .8 + i * .012, .82 + i * .012).toFixed(3); });
    }
    return { sec: sec, pin: pin, update: update };
  }

  /* ================================================================== the loop: only chapters near the screen, cached ranges */
  var CH = [philosophy(), about()].filter(Boolean), dirty = true;
  function measure(){ var y = window.scrollY || window.pageYOffset; CH.forEach(function(c){ var r = c.pin.getBoundingClientRect(); c.top = r.top + y; c.h = c.pin.offsetHeight; }); dirty = false; }
  window.addEventListener('resize', function(){ dirty = true; }); window.addEventListener('load', function(){ dirty = true; });
  if (window.ResizeObserver) new ResizeObserver(function(){ dirty = true; }).observe(document.body);
  function tick(){
    if (dirty) measure();
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    for (var i = 0; i < CH.length; i++){ var c = CH[i];
      if (y + vh * 1.5 < c.top || y > c.top + c.h + vh * .5) continue;
      var p = reduced ? 1 : clamp01((y - c.top) / Math.max(1, c.h - vh));
      if (p !== c.last){ c.last = p; c.update(p, vh); } }
    requestAnimationFrame(tick);
  }
  if (CH.length){ CH.forEach(function(c){ c.update(0); }); requestAnimationFrame(tick); }
})();
