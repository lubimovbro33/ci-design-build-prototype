/* CI · inner pages (15.11.2026). Vanilla, no deps. One script for every page after the homepage and About.
   Films: a pinned stage scrubbed by the scroll (.film[data-fig]) — "cover": the photograph closes into the site's one white line;
   "steps": a journey on the line, the square walks from mark to mark. Times are in "screens" (data-len, data-k="in0 in1 out0 out1").
   Flow: blocks reveal once as they arrive, photographs open out of a line (.bnd), rows open (.qa), chips filter lists, the form checks itself.
   The shell (cursor, smooth wheel, header logo, chapter rail, footer street) is the homepage's. */
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var qs = function(s, r){ return (r || document).querySelector(s); };
  var qsa = function(s, r){ return [].slice.call((r || document).querySelectorAll(s)); };
  function c01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sg(p, a, b){ return c01((p - a) / (b - a)); }
  function eo(t){ return 1 - Math.pow(1 - t, 3); }
  function eio(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function sm(a, b, x){ var t = c01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent){ var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function f1(v){ return Math.round(v * 10) / 10; }
  var mm = window.matchMedia;
  var reduced = mm && mm('(prefers-reduced-motion: reduce)').matches;
  var coarse = mm && mm('(pointer: coarse)').matches;
  try { history.scrollRestoration = 'manual'; } catch (e) {}

  /* ------------------------------------------------------------------ typograph: no hanging short words, the last two words tied */
  (function(){
    var SHORT; try { SHORT = new RegExp('(?<=^|[\\s(“"])(a|an|the|of|to|in|on|at|by|for|and|or|but|is|it|we|our|your|you|with|from|as|so|no|not|one|CI|—|–|\\+)\\s+(?=\\S)', 'gi'); } catch (e) { return; }
    qsa('.film p.t34, .film .t20s p, .film p.t20, .bk p.t34, .bk .t20s p, .bk .dsc p, .bk .ain p, .fin p.t34').forEach(function(n){
      var tw = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), t, last = null;
      while ((t = tw.nextNode())){ t.nodeValue = t.nodeValue.replace(SHORT, function(m, w){ return w + '\u00A0'; }).replace(/\s+(—|–)/g, '\u00A0$1'); if (/\S/.test(t.nodeValue)) last = t; }
      if (last) last.nodeValue = last.nodeValue.replace(/\s+(\S+\s*)$/, '\u00A0$1');
    });
  })();

  /* ------------------------------------------------------------------ text moments: the words come one after another; titles focus in through a blur */
  function split(node){
    var out = [];
    (function walk(n){
      [].slice.call(n.childNodes).forEach(function(c){
        if (c.nodeType === 3){
          var parts = c.nodeValue.split(/([ \t\n\r]+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){ if (!p) return; if (/^[ \t\n\r]+$/.test(p)){ frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'w'; w.textContent = p; frag.appendChild(w); out.push(w); });
          n.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
      });
    })(node);
    return out;
  }
  function Moment(node){
    var o = {el: node, words: [], kin: -1, kout: -1, blur: /\bt60\b|\bt111\b/.test(node.className), box: !!node.querySelector('a, .v')};
    var k = (node.getAttribute('data-k') || '0 0 99 99').trim().split(/\s+/).map(parseFloat);
    o.a = k[0]; o.b = k[1]; o.c = k[2]; o.d = k[3];
    if (!o.box) o.words = split(node);
    return o;
  }
  function setMoment(o, kin, kout){
    kin = Math.round(kin * 1000) / 1000; kout = Math.round(kout * 1000) / 1000;
    if (kin === o.kin && kout === o.kout) return;
    var st = o.el.style;
    if (kout !== o.kout || (kin > 0) !== (o.kin > 0)){
      var vis = kin > 0 && kout < 1;
      st.visibility = vis ? 'visible' : 'hidden';
      st.opacity = vis ? (1 - eo(kout)).toFixed(3) : 0;
      st.transform = kout > 0 ? 'translateY(' + (-eo(kout) * 18).toFixed(1) + 'px)' : '';
      st.filter = kout > 0 && o.blur ? 'blur(' + (kout * 8).toFixed(1) + 'px)' : '';
    }
    if (kin !== o.kin){
      if (o.box){ if (kout <= 0){ st.opacity = eo(kin).toFixed(3); st.transform = kin >= 1 ? '' : 'translateY(' + ((1 - eo(kin)) * 26).toFixed(1) + 'px)'; } }
      else {
        var N = o.words.length, S = Math.min(1.4, .25 + N * .035);
        for (var j = 0; j < N; j++){
          var q = c01(kin * (1 + S) - (j / Math.max(1, N - 1)) * S), e = eo(q), w = o.words[j].style;
          w.opacity = e.toFixed(3);
          w.transform = e >= 1 ? '' : 'translateY(' + ((1 - e) * .5).toFixed(3) + 'em)';
          if (o.blur) w.filter = e >= 1 ? '' : 'blur(' + ((1 - e) * 9).toFixed(1) + 'px)';
        }
      }
    }
    o.kin = kin; o.kout = kout;
  }
  function runMoment(o, q){ setMoment(o, sg(q, o.a, o.b), o.c >= 90 ? 0 : sg(q, o.c, o.d)); }

  /* ------------------------------------------------------------------ the shell: cursor (the buttons' square) */
  var cur = $('cur');
  if (cur && !coarse){
    var tx = 0, ty = 0, curLab = qs('.cl', cur), cSq = qs('.cd', cur), CS = {x: 0, y: 0, s: 8, r: 0}, cTgt = null, cDown = false, cFirst = true, pvx = 0;
    var PRESS = 'a,button,[data-cursor]';
    window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; if (cFirst){ cFirst = false; CS.x = tx; CS.y = ty; } cur.classList.add('on'); });
    document.documentElement.addEventListener('mouseleave', function(){ cur.classList.remove('on'); });
    window.addEventListener('pointerdown', function(){ cDown = true; }); window.addEventListener('pointerup', function(){ cDown = false; });
    document.addEventListener('pointerover', function(e){ var t = e.target.closest && e.target.closest(PRESS); if (!t) return; cTgt = t; cur.classList.add('link');
      var l = t.getAttribute('data-cursor'); if (l){ curLab.textContent = l; cur.classList.add('lab'); } });
    document.addEventListener('pointerout', function(e){ var t = e.target.closest && e.target.closest(PRESS); if (!t) return; var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(PRESS);
      if (to === t) return; if (cTgt === t) cTgt = null; cur.classList.remove('link', 'lab'); });
    (function curLoop(){
      var x = tx, y = ty, sz = 8, dock = null, lab = cur.classList.contains('lab');
      if (lab) sz = 72;
      else if (cTgt && cTgt.isConnected){ dock = cTgt.querySelector(':scope > .sqd'); if (dock){ var r = dock.getBoundingClientRect(); if (r.width){ x = r.left + r.width / 2; y = r.top + r.height / 2; sz = r.width; } else dock = null; } if (!dock) sz = 16; }
      if (cDown) sz *= .7;
      var k = dock ? .2 : .24, nx = CS.x + (x - CS.x) * k, v = nx - CS.x; CS.x = nx; CS.y += (y - CS.y) * k; CS.s += (sz - CS.s) * .2;
      pvx += (Math.max(-18, Math.min(18, v * 1.4)) - pvx) * .15; CS.r = dock || lab ? CS.r * .8 : pvx;
      cSq.style.width = cSq.style.height = CS.s.toFixed(2) + 'px';
      cSq.style.transform = 'translate3d(' + (CS.x - CS.s / 2).toFixed(1) + 'px,' + (CS.y - CS.s / 2).toFixed(1) + 'px,0) rotate(' + CS.r.toFixed(2) + 'deg)';
      requestAnimationFrame(curLoop); })();
  }

  /* the header button's label rolls through a blur on hover (the homepage's) */
  qsa('.hdr .cta-blk .t').forEach(function(t){
    var lines = t.innerHTML.split(/<br\s*\/?>/i).map(function(l){ return l.replace(/<[^>]*>/g, ''); });
    t.parentNode.setAttribute('aria-label', lines.join(' '));
    t.innerHTML = lines.map(function(l, i){ return '<span class="bl" style="--i:' + i + '"><span class="bo" aria-hidden="true">' + l + '</span><span class="bn" aria-hidden="true">' + l + '</span></span>'; }).join('');
  });

  /* smooth wheel (lerp), as on the homepage */
  var smw = {t: 0, c: 0, on: false};
  if (!reduced && !coarse){
    window.addEventListener('wheel', function(e){
      if (e.ctrlKey) return; e.preventDefault();
      if (document.documentElement.classList.contains('mn-open')) return;
      var d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      d = Math.max(-140, Math.min(140, d));
      if (!smw.on){ smw.on = true; smw.c = smw.t = window.scrollY; }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      smw.t = Math.max(0, Math.min(max, smw.t + d * 1.15));
    }, {passive: false});
    window.addEventListener('scroll', function(){ if (!smw.on || Math.abs(window.scrollY - smw.c) > 2){ smw.c = smw.t = window.scrollY; smw.on = false; } });
  }
  function smoothStep(){ if (!smw.on) return; var d = smw.t - smw.c; if (Math.abs(d) < .3){ smw.on = false; return; } smw.c += d * .11; smw.c = Math.round(smw.c * 100) / 100; window.scrollTo(0, smw.c); smw.c = window.scrollY; }
  function smoothTo(y){ if (reduced || coarse){ window.scrollTo(0, y); return; } smw.on = true; smw.c = window.scrollY; smw.t = y; }

  /* the logo eases down to ×0.609 over the first half-screen, as on the homepage */
  var wmCell = $('wmCell'), LOGO_S = 81 / 133, logoK = -1;
  function updateLogo(y, vh){
    if (!wmCell) return;
    var p = c01(y / (vh * .5)), t = 1 - (1 - LOGO_S) * eio(p);
    if (logoK < 0) logoK = t; else logoK += (t - logoK) * .2;
    if (Math.abs(t - logoK) < .0005) logoK = t;
    var v = logoK.toFixed(4); if (v !== wmCell.__k){ wmCell.__k = v; wmCell.style.transform = 'scale(' + v + ')'; }
  }

  /* chapter rail: lit up to where the reader is; each item reads what is under it (photos and dark → white, light cards → ink) */
  var chap = $('chap'), chapLinks = chap ? qsa('a', chap) : [], chapSecs = chapLinks.map(function(a){ return $(a.getAttribute('data-ch')); }), chapOn = -1, chapN = 0;
  function updateChap(y, vh){
    if (!chap) return;
    var ftr = $('footer'), ftop = ftr ? ftr.getBoundingClientRect().top : 1e9;
    chap.classList.toggle('show', y > vh * .6 && ftop > vh * .92);
    var idx = 0, tops = chapSecs.map(function(s){ return s.getBoundingClientRect().top + y; });
    for (var i = 0; i < tops.length; i++) if (y + 2 >= tops[i]) idx = i;
    var next = idx + 1 < tops.length ? tops[idx + 1] : document.documentElement.scrollHeight - vh;
    var p = c01((y - tops[idx]) / Math.max(1, next - tops[idx]));
    if (idx !== chapOn){ chapOn = idx; chapLinks.forEach(function(a, k){ a.classList.toggle('on', k === idx); }); }
    chapLinks.forEach(function(a, k){ var v = k < idx ? 1 : k > idx ? 0 : p, s = v.toFixed(4); if (a.__p !== s){ a.__p = s; a.style.setProperty('--p', s); a.classList.toggle('st', v > 0); } });
  }
  function rgbL(s){ var m = s && s.match(/[\d.]+/g); if (!m || (m.length > 3 && +m[3] < .5)) return -1; return (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; }
  function under(x, y){
    var stk = document.elementsFromPoint(x, y);
    for (var i = 0; i < stk.length; i++){
      var e = stk[i]; if ((chap && chap.contains(e)) || (cur && cur.contains(e))) continue;
      var cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .5) continue;
      var t = e.tagName; if (t === 'IMG' || t === 'VIDEO') return 0; if (t === 'CANVAS') continue;
      var l = rgbL(cs.backgroundColor); if (l >= 0) return l;
    }
    return 0;
  }
  function chapInk(){
    if (!chapLinks.length || (chapN++ & 3)) return; var y = window.innerHeight - 18;
    for (var i = 0; i < chapLinks.length; i++){ var r = chapLinks[i].getBoundingClientRect(); if (!r.width) continue; var lt = under(r.left + Math.min(r.width / 2, 60), y) > .6; if (lt !== chapLinks[i]._lt){ chapLinks[i]._lt = lt; chapLinks[i].classList.toggle('lt', lt); } }
  }


  /* ================================================================== the frame */
  var W = 0, H = 0, U = 1, DPR = 1, MID = 0, SQ = 8, SP = .8, g = null, dirty = true;
  function xl(X){ return X * U; }
  function xr(X){ return W - (1920 - X) * U; }
  function xm(X){ return W / 2 + (X - 960) * U; }
  /* scenes: every page opens in its own way — the elements of an opening are scrubbed by the scroll.
     data-s="prop:from>to@q0-q1; …"  props: tx ty (in u), sc, op, br (brightness), ci (clip inset, four %) */
  function Scrub(el){
    var tw = (el.getAttribute('data-s') || '').split(';').map(function(x){ var m = x.trim().match(/^(\w+):([^>]+)>([^@]+)(?:@([-\d.]+)-([-\d.]+))?$/); if (!m) return null;
      return {p: m[1], a: m[2].split(',').map(parseFloat), b: m[3].split(',').map(parseFloat), q0: m[4] == null ? 0 : +m[4], q1: m[5] == null ? 1 : +m[5]}; }).filter(Boolean);
    return {el: el, tw: tw, mv: tw.some(function(w){ return w.p === 'tx' || w.p === 'ty' || w.p === 'sc'; }), key: ''};
  }
  function runScrub(o, q){
    var tx = 0, ty = 0, sc = 1, st = o.el.style, i, key = '';
    for (i = 0; i < o.tw.length; i++){ var w = o.tw[i], k = eio(sg(q, w.q0, w.q1)), v0 = w.a[0] + (w.b[0] - w.a[0]) * k;
      if (w.p === 'tx') tx += v0 * U; else if (w.p === 'ty') ty += v0 * U; else if (w.p === 'sc') sc *= v0;
      else { var ky = w.p + k.toFixed(4); if (o['_' + i] === ky) continue; o['_' + i] = ky;
        if (w.p === 'op'){ st.opacity = v0.toFixed(3); st.visibility = v0 <= .001 ? 'hidden' : 'visible'; }
        else if (w.p === 'br') st.filter = 'contrast(1.04) brightness(' + v0.toFixed(3) + ')';
        else if (w.p === 'ci') clip(o.el, k >= 1 && w.b.join('') === '0000' ? 'none' : 'inset(' + w.a.map(function(a, j){ return (a + (w.b[j] - a) * k).toFixed(3) + '%'; }).join(' ') + ')'); } }
    if (o.mv){ key = tx.toFixed(1) + ',' + ty.toFixed(1) + ',' + sc.toFixed(4); if (key !== o.key){ o.key = key; st.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + sc.toFixed(4) + ')'; } }
  }
  var FILMS = qsa('.film').map(function(e){
    var cv = qs('.ln', e);
    return {el: e, cv: cv, g: cv.getContext('2d'), fig: e.getAttribute('data-fig'), len: +e.getAttribute('data-len'), ms: qsa('.m', e).map(Moment), pic: qs('.pic', e), h1: qs('.cv-h', e), kick: qs('.cv-k', e),
            n: +e.getAttribute('data-n') || 0, emb: (e.getAttribute('data-emb') || '').split(','), t0: +e.getAttribute('data-t0') || .9, d: +e.getAttribute('data-d') || .55, q: -9, on: null,
            sc: qsa('[data-s]', e).map(Scrub), trk: qs('[data-track]', e), cur: e.classList.contains('crt'), seg: (function(){ var d = e.getAttribute('data-seg'); return d ? d.split(',').map(Number) : null; })(), ar: +e.getAttribute('data-ar') || 1.42};
  });
  var BANDS = qsa('.bnd').map(function(e){ return {el: e, img: qs('img', e), k: -1}; });
  function layout(){
    W = window.innerWidth; H = window.innerHeight; U = W >= H ? Math.min(W / 1920, H / 1080) : Math.max(W / 1920, W / 900);
    DPR = Math.min(2, window.devicePixelRatio || 1); MID = Math.round(H / 2) + .5; SQ = Math.max(5, 8 * U);
    FILMS.forEach(function(f){ f.el.style.height = Math.round(f.len * SP * H + H) + 'px'; f.cv.width = Math.round(W * DPR); f.cv.height = Math.round(H * DPR); });
    dirty = false;
    qsa('#ftCity').forEach(function(v){ var mtx = v.getScreenCTM && v.getScreenCTM(); if (mtx && mtx.a) v.style.setProperty('--ds', Math.max(mtx.a, .05).toFixed(4)); });
  }
  window.addEventListener('resize', function(){ dirty = true; });
  window.addEventListener('load', function(){ dirty = true; });

  /* anchors on this page: a film opens a little into itself, where its title already stands */
  qsa('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){ var id = a.getAttribute('href').slice(1); if (!id){ e.preventDefault(); return; } var t = $(id); if (!t) return; e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY; if (t.classList.contains('film') && t.getAttribute('data-fig') !== 'cover') y += .7 * SP * H; smoothTo(y); });
  });

  /* the pen */
  var LW = 1.5;
  function ink(a, lw, dash){ g.strokeStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.lineWidth = lw || LW; g.setLineDash(dash || []); }
  function seg(x1, y1, x2, y2){ g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
  function sq(x, y, a, s){ if (a <= 0) return; s = s || SQ; g.fillStyle = a >= 1 ? '#FFFFFF' : 'rgba(255,255,255,' + a.toFixed(3) + ')'; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), Math.round(s), Math.round(s)); }
  function clip(e, v){ if (e.__c === v) return; e.__c = v; e.style.clipPath = v; e.style.webkitClipPath = v; }

  /* the line, and what it becomes for a page (amounts 0…1 by name; several can be on the way in and out at once) */
  function theLine(al, E, t, x0, x1){
    if (al <= 0) return;
    E = E || {}; x0 = x0 == null ? -10 : x0; x1 = x1 == null ? W + 10 : x1;
    var wv = (E.wellness || 0), vo = (E.voice || 0), co = (E.core || 0), cg = (E.converge || 0), xj = xm(960), i;
    /* the main line; where two (or five) lines run into it, it begins at their meeting point */
    var lead = Math.max(co, cg), xs = lead > 0 ? Math.max(x0, x0 + (xj - x0) * lead) : x0;
    ink(al);
    if (wv > 0 || vo > 0){
      g.beginPath();
      for (i = 0; i <= 260; i++){
        var x = xs + (x1 - xs) * i / 260, xu = x / U, y = MID;
        if (wv > 0) y += wv * 15 * U * Math.sin(xu / 150 - t * .5);
        if (vo > 0){ var e = c01((x - xl(160)) / (xr(1760) - xl(160))), env = Math.pow(Math.sin(Math.PI * e), 1.2), md = (.5 + .5 * Math.sin(xu / 330 - t * .45)) * (.62 + .38 * Math.sin(xu / 137 + t * .8 + 1.7));
          y += vo * env * md * U * (64 * Math.sin(xu / 92 + t * 1.05) + 32 * Math.sin(xu / 41 - t * 1.6 + 1.3) + 14 * Math.sin(xu / 19 + t * 2.3 + .4)); }
        if (i) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    } else seg(xs, MID, x1, MID);
    /* Core — design and build, two lines that become one */
    if (co > 0){ ink(al); [-1, 1].forEach(function(s){ g.beginPath(); g.moveTo(x0, MID + s * 70 * U * co); g.bezierCurveTo(x0 + (xj - x0) * .55, MID + s * 70 * U * co, x0 + (xj - x0) * .6, MID, xj, MID); g.stroke(); }); sq(xj, MID, al * co); }
    /* partners — many lines run into one */
    if (cg > 0){ [-2, -1, 0, 1, 2].forEach(function(s){ ink(al * (s ? .62 : 1), s ? 1 : LW); g.beginPath(); g.moveTo(x0, MID + s * 46 * U * cg); g.bezierCurveTo(x0 + (xj - x0) * .5, MID + s * 46 * U * cg, x0 + (xj - x0) * .62, MID, xj, MID); g.stroke(); }); sq(xj, MID, al * cg); }
    /* Curated — the layers laid over what was built */
    if (E.curated > 0){ var c = E.curated; [[14, .62], [28, .45], [42, .3]].forEach(function(l, k){ var d = c01(c * 1.6 - k * .3); if (d <= 0) return; ink(al * l[1], 1); seg(xj, MID - l[0] * U, xj + (x1 - xj) * eo(d), MID - l[0] * U); }); }
    /* Turnkey — one unbroken line, from the first idea to the first night home */
    if (E.turnkey > 0){ sq(50 * U + SQ / 2, MID, al * E.turnkey); sq(W - 50 * U - SQ / 2, MID, al * E.turnkey); }
  }

  /* ---------- film: the cover — the photograph closes into the line */
  function cover(f, q, t){
    if (f.pic){
      var k = eio(sg(q, .1, 1.0));
      if (k >= 1 || q < -1.2){ if (f.pic.__v !== 0){ f.pic.__v = 0; f.pic.style.visibility = 'hidden'; } }
      else { if (f.pic.__v !== 1){ f.pic.__v = 1; f.pic.style.visibility = 'visible'; } clip(f.pic, 'inset(' + (k * 50).toFixed(3) + '% 0)'); }
    }
    var o = 1 - eo(sg(q, .08, .5));
    [f.h1, f.kick].forEach(function(h){ if (!h || h.__o === o) return; h.__o = o; h.style.opacity = o.toFixed(3); h.style.visibility = o > 0 ? 'visible' : 'hidden';
      h.style.transform = o < 1 ? 'translateY(' + (-(1 - o) * 26 * U).toFixed(1) + 'px)' : ''; h.style.filter = o < 1 ? 'blur(' + ((1 - o) * 10).toFixed(1) + 'px)' : ''; });
    var E = {}; if (f.emb[0]) E[f.emb[0]] = eio(sg(q, 1.0, 1.7));
    theLine(f.pic ? sg(q, .82, 1.0) : 1, E, t);
  }
  /* ---------- film: steps — a journey on the line; the square walks from mark to mark */
  function steps(f, q, t){
    var N = f.n, x0 = xl(421), x1 = W - 50 * U, i, E = {};
    for (i = 0; i < N; i++){ var nm = f.emb[i]; if (!nm) continue; var a = eio(sg(q, f.t0 + i * f.d - .12, f.t0 + i * f.d + .2)) * (i < N - 1 ? 1 - eio(sg(q, f.t0 + (i + 1) * f.d - .12, f.t0 + (i + 1) * f.d + .2)) : 1); if (a > 0) E[nm] = Math.max(E[nm] || 0, a); }
    theLine(1, E, t);
    var ta = sg(q, .45, .75);
    if (ta > 0){ ink(ta, 1); for (i = 0; i < N; i++){ var x = lerp(x0, x1, N > 1 ? i / (N - 1) : 0); seg(x, MID - 9 * U, x, MID + 9 * U); } }
    var hx = x0; for (i = 1; i < N; i++) hx += (x1 - x0) / (N - 1) * eio(sg(q, f.t0 + i * f.d - .1, f.t0 + i * f.d + .12));
    sq(hx, MID, sg(q, .6, .85));
  }
  /* ---------- film: scene — the page's own opening; a track pans sideways, a drawing draws itself */
  function scene(f, q, t){
    var i; for (i = 0; i < f.sc.length; i++) runScrub(f.sc[i], q);
    if (f.trk){ var tk = (f.trk.getAttribute('data-track') || '0 1').split(' '), k = sg(q, +tk[0], +tk[1]), x = -(f.trk.scrollWidth - W) * k;
      if (f.trk.__x !== x){ f.trk.__x = x; f.trk.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)'; } }
    if (f.seg){ var S = f.seg, n = S.length / 4, p = sg(q, .02, 1.05), al = 1 - sg(q, 1.35, 1.9); if (p > 0 && al > 0){
      var iw = Math.max(W, H * f.ar), ih = iw / f.ar, ox = (W - iw) / 2, oy = (H - ih) / 2, span = n * .22, head = p * (n + span);
      ink(.9 * al, 1); g.beginPath();
      for (i = 0; i < n; i++){ var d = c01((head - i) / span); if (d <= 0) break; d = eo(d);
        var ax = ox + S[i * 4] / 1000 * iw, ay = oy + S[i * 4 + 1] / 1000 * ih, bx = ox + S[i * 4 + 2] / 1000 * iw, by = oy + S[i * 4 + 3] / 1000 * ih;
        g.moveTo(ax, ay); g.lineTo(ax + (bx - ax) * d, ay + (by - ay) * d); }
      g.stroke(); } }
  }
  var FIG = {cover: cover, steps: steps, scene: scene};

  /* ================================================================== flow */
  /* blocks reveal once as they arrive: the title focuses in, the rest comes up one after another */
  (function(){
    var bl = qsa('.bk, .fin');
    bl.forEach(function(b){ qsa('.rv', b).forEach(function(e, i){ e.style.setProperty('--d', Math.min(i, 12)); }); });
    if (!('IntersectionObserver' in window) || reduced){ qsa('.rv').forEach(function(e){ e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (!en.isIntersecting) return; en.target.classList.add('in'); io.unobserve(en.target); }); }, {rootMargin: '0px 0px -12% 0px'});
    qsa('.rv').forEach(function(e){ io.observe(e); });
  })();
  /* rows that open; one at a time within a list */
  qsa('.qa .qh').forEach(function(b){ b.addEventListener('click', function(){
    var qa = b.parentNode, was = qa.classList.contains('open');
    qsa('.qa.open', qa.parentNode).forEach(function(o){ o.classList.remove('open'); qs('.qh', o).setAttribute('aria-expanded', 'false'); });
    if (!was){ qa.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
  }); });
  /* chips that filter a list */
  qsa('[data-filter]').forEach(function(box){
    var list = $(box.getAttribute('data-filter')); if (!list) return;
    var chips = qsa('.chip', box), items = qsa('[data-tags]', list);
    chips.forEach(function(c){ c.addEventListener('click', function(){
      chips.forEach(function(o){ o.classList.toggle('on', o === c); });
      var fv = c.getAttribute('data-f'), n = 0;
      items.forEach(function(it){ var ok = fv === 'all' || (' ' + it.getAttribute('data-tags') + ' ').indexOf(' ' + fv + ' ') >= 0; it.hidden = !ok; if (ok) n++; });
      list.classList.toggle('empty', n === 0);
    }); });
  });
  /* the form checks itself; nothing is sent anywhere yet */
  qsa('form.frm').forEach(function(fm){
    fm.addEventListener('submit', function(e){
      e.preventDefault(); var bad = 0;
      qsa('[required]', fm).forEach(function(i){ var ok = i.value.trim() && (i.type !== 'email' || /^\S+@\S+\.\S+$/.test(i.value.trim())); i.closest('.fr').classList.toggle('bad', !ok); if (!ok && !bad++) i.focus(); });
      if (!bad){ fm.classList.add('sent'); var y = fm.getBoundingClientRect().top + window.scrollY - window.innerHeight * .3; smoothTo(y); }
    });
    qsa('[required]', fm).forEach(function(i){ i.addEventListener('input', function(){ i.closest('.fr').classList.remove('bad'); }); });
  });
  qsa('[data-noop]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); }); });

  /* ================================================================== FOOTER · the homepage's street in hairlines; one window is ours */
  (function(){
    var svg = $('ftCity'); if (!svg) return;
    var seed = 11; function rnd(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    var GY = 330, x = -10, i = 0, dots = '', lit = '', CI = null, gB = el('g', {'class': 'ft-b'}, svg);
    while (x < 1610){
      var w = 46 + Math.round(rnd() * 96), tall = rnd() < .18, h = tall ? 210 + rnd() * 110 : 60 + rnd() * 150, d = 'M' + f1(x) + ' ' + GY + 'V' + f1(GY - h);
      var sb = h > 150 && rnd() < .5 ? Math.round(w * (.14 + rnd() * .12)) : 0, sh = sb ? 18 + rnd() * 26 : 0;
      if (sb) d += 'H' + f1(x + sb) + 'V' + f1(GY - h - sh) + 'H' + f1(x + w - sb) + 'V' + f1(GY - h) + 'H' + f1(x + w); else d += 'H' + f1(x + w);
      d += 'V' + GY;
      if (tall && rnd() < .6) d += 'M' + f1(x + w / 2) + ' ' + f1(GY - h - sh) + 'V' + f1(GY - h - sh - 22 - rnd() * 30);
      var pth = el('path', {d: d, pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, gB); pth.style.setProperty('--i', i);
      var bx = 9 + Math.round(rnd() * 4), fy = 11 + Math.round(rnd() * 3);
      for (var yy = GY - 14; yy > GY - h + 8; yy -= fy) for (var xx = x + 7; xx < x + w - 5; xx += bx){
        var qd = 'M' + f1(xx) + ' ' + f1(yy) + 'h.1';
        if (!CI && x > 300 && x < 520 && h > 150 && yy < GY - 90){ CI = [xx, yy]; continue; }
        if (rnd() < .07) lit += qd; else dots += qd;
      }
      x += w + (rnd() < .3 ? 6 + Math.round(rnd() * 14) : 0); i++;
    }
    el('path', {d: 'M0 ' + GY + 'H1600', 'class': 'ft-gl', pathLength: 1, 'vector-effect': 'non-scaling-stroke'}, svg);
    el('path', {d: dots, 'class': 'ft-dots', 'vector-effect': 'non-scaling-stroke'}, svg);
    el('path', {d: lit, 'class': 'ft-lit', 'vector-effect': 'non-scaling-stroke'}, svg);
    if (CI) el('rect', {x: f1(CI[0] - 3), y: f1(CI[1] - 3), width: 6, height: 6, 'class': 'ft-ci'}, svg);
    var ft = $('footer');
    if (!('IntersectionObserver' in window) || reduced){ ft.classList.add('in'); return; }
    var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ ft.classList.add('in'); io.disconnect(); } }, {rootMargin: '0px 0px -10% 0px'});
    io.observe(svg);
  })();


  /* ================================================================== the loop */
  var lastY = -1, lastVH = 0;
  function tick(now){
    smoothStep();
    if (dirty) layout();
    var y = window.scrollY, t = now / 1000, i, k;
    for (i = 0; i < FILMS.length; i++){
      var f = FILMS[i], r = f.el.getBoundingClientRect(), vis = r.bottom > -40 && r.top < H + 40, q = -r.top / (SP * H);
      if (f.cur){ q = y / (SP * H); vis = q < 2.2; }
      if (!vis){ if (f.on !== false){ f.on = false; } continue; }
      f.on = true; f.q = q;
      for (k = 0; k < f.ms.length; k++) runMoment(f.ms[k], q);
      g = f.g; g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); g.lineCap = 'butt'; g.lineJoin = 'round'; g.setLineDash([]);
      FIG[f.fig](f, q, t);
    }
    /* photographs open out of a line as they come up the screen */
    for (i = 0; i < BANDS.length; i++){
      var b = BANDS[i], br = b.el.getBoundingClientRect(); if (br.bottom < -40 || br.top > H + 40) continue;
      b.img.style.transform = 'translate3d(0,' + ((br.top / H) * -4).toFixed(2) + '%,0)';
    }
    if (y !== lastY || H !== lastVH) updateChap(y, H);
    chapInk(); updateLogo(y, H);
    lastY = y; lastVH = H;
    requestAnimationFrame(tick);
  }
  window.__inr = {films: function(){ return FILMS.map(function(f){ return {id: f.el.id, fig: f.fig, len: f.len, top: f.el.getBoundingClientRect().top + window.scrollY}; }); }, SP: SP,
                  y: function(id, q){ var e = $(id); var top = e.getBoundingClientRect().top + window.scrollY; return e.classList.contains('film') ? top + q * SP * window.innerHeight : top + q * window.innerHeight; }};
  requestAnimationFrame(tick);
})();
