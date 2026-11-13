/* Diagnostics panel — only with ?diag in the address (loaded by the inline script in <head>). Reads the state of the 3D intro
   and the hero slider, frame times and errors, so a browser we can't test here (Safari) can show what it is doing. */
(function(){
  var D = window.__dg || (window.__dg = {t0: 0, err: [], ev: []});
  function ms(t){ return Math.round(t) + ' ms'; }
  function ev(name){ D.ev.push([name, performance.now()]); }

  /* GPU info from a throwaway context (same GPU as the page's) */
  var gpu = {}; try {
    var c = document.createElement('canvas'), g = c.getContext('webgl2');
    if (!g) gpu.webgl2 = 'НЕМАЄ';
    else {
      gpu.webgl2 = 'так';
      var ri = g.getExtension('WEBGL_debug_renderer_info');
      gpu.renderer = ri ? g.getParameter(ri.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER);
      gpu.maxTex = g.getParameter(g.MAX_TEXTURE_SIZE);
      gpu.parallel = g.getExtension('KHR_parallel_shader_compile') ? 'так' : 'ні';
      gpu.floatRT = g.getExtension('EXT_color_buffer_float') ? 'так' : 'ні';
      var lc = g.getExtension('WEBGL_lose_context'); if (lc) lc.loseContext();
    }
  } catch (e) { gpu.webgl2 = 'помилка: ' + e.message; }

  /* frame times */
  var fr = [], last = 0;
  function loop(now){ if (last) { fr.push(now - last); if (fr.length > 180) fr.shift(); } last = now; requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  function stats(){
    if (fr.length < 10) return '—';
    var s = fr.slice().sort(function(a, b){ return a - b; }), n = s.length, avg = 0; for (var i = 0; i < n; i++) avg += s[i]; avg /= n;
    var long = 0; for (i = 0; i < n; i++) if (s[i] > 50) long++;
    return Math.round(1000 / avg) + ' fps · медіана ' + s[n >> 1].toFixed(1) + ' · p95 ' + s[Math.floor(n * .95)].toFixed(1) + ' · макс ' + s[n - 1].toFixed(0) + ' ms · >50ms: ' + long;
  }

  /* CPU time of the GL calls (wrapped once they exist) */
  var cpu = {};
  function wrap(name){
    var P = window.__pre3d; if (!P || typeof P[name] !== 'function' || P[name].__w) return;
    var f = P[name], rec = cpu[name] = {n: 0, sum: 0, max: 0};
    P[name] = function(){ var a = performance.now(), r = f.apply(this, arguments), d = performance.now() - a; rec.n++; rec.sum += d; if (d > rec.max) rec.max = d; return r; };
    P[name].__w = true;
  }

  var seen = {};
  function mark(key, cond){ if (cond && !seen[key]) { seen[key] = performance.now(); ev(key); } }

  var box = document.createElement('pre');
  box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:2147483647;margin:0;padding:10px 12px;max-width:min(560px,92vw);max-height:70vh;overflow:auto;' +
    'background:rgba(0,0,0,.86);color:#fff;font:11px/1.45 ui-monospace,Menlo,monospace;white-space:pre-wrap;pointer-events:auto;border:1px solid rgba(255,255,255,.3)';
  function add(){ if (document.body) document.body.appendChild(box); else setTimeout(add, 50); }
  add();

  function upd(){
    var P = window.__pre3d || {}, C = window.__ci || {}, now = performance.now();
    ['render', 'slideFrame', 'storyFrame'].forEach(wrap);
    mark('3D готове', P.state === 'ready'); mark('3D помилка', P.state === 'error'); mark('кімната готова', P.roomReady === true);
    var st = C.state || {}, sl = C.slide || {};
    mark('інтро почалось', st.phase === 'intro'); mark('інтро завершено', st.done === true); mark('слайди GL готові', sl.ready === true);
    var cv = document.querySelector('canvas.gl'), ua = navigator.userAgent, sv = (ua.match(/Version\/([\d.]+)/) || [])[1];
    var L = [];
    L.push('CI · діагностика (13.11)   ' + (sv ? 'Safari ' + sv : ua.slice(0, 60)));
    L.push('екран ' + innerWidth + '×' + innerHeight + ' @' + (window.devicePixelRatio || 1) + 'x · lite: ' + (document.documentElement.classList.contains('lite') ? 'так' : 'ні'));
    L.push('WebGL2: ' + gpu.webgl2 + (gpu.renderer ? ' · ' + gpu.renderer : '') + (gpu.maxTex ? ' · maxTex ' + gpu.maxTex : ''));
    L.push('паралельна компіляція шейдерів: ' + (gpu.parallel || '?') + ' · float RT: ' + (gpu.floatRT || '?'));
    L.push('3D-сцена: ' + (P.state || 'ще не завантажена') + (P.err ? ' · ' + P.err : '') + ' · кімната: ' + (P.roomReady === undefined ? '?' : P.roomReady));
    L.push('сайт використовує 3D: ' + (C.gl ? (C.gl() ? 'ТАК' : 'НІ — запасний DOM-варіант') : '?') + (window.__ciFb ? ' · перемкнувся на DOM через ' + window.__ciFb.el.toFixed(1) + ' с (стан 3D: ' + window.__ciFb.st + ')' : ''));
    L.push('інтро: ' + (st.phase || '?') + ' · t ' + (st.t || 0).toFixed(2) + ' · завершено: ' + (st.done ? 'так' : 'ні'));
    L.push('слайдер: ' + (!sl.on ? 'ще не стартував' : C.gls ? (C.gls() ? 'WebGL' : 'DOM') : '?') + ' · готовий: ' + (sl.ready ? 'так' : 'ні') + ' · кадр ' + (sl.cur === undefined ? '?' : sl.cur) +
      ' · перехід: ' + (C.tr && C.tr() ? 'йде' : 'ні') + ' · цикл: ' + (C.loop ? (C.loop() ? 'так' : 'ні') : '?') + ' · сцена прокрутки: ' + (C.st && C.st() && C.st().on ? 'так' : 'ні'));
    if (cv) L.push('canvas ' + cv.width + '×' + cv.height + ' · видимий: ' + (getComputedStyle(cv).display !== 'none' ? 'так' : 'ні'));
    L.push('кадри: ' + stats());
    var cp = Object.keys(cpu).filter(function(k){ return cpu[k].n; }).map(function(k){ var r = cpu[k]; return k + ' ' + (r.sum / r.n).toFixed(1) + '/' + r.max.toFixed(0) + ' ms'; });
    if (cp.length) L.push('CPU на кадр (сер/макс): ' + cp.join(' · '));
    L.push('хронологія: ' + D.ev.map(function(e){ return e[0] + ' ' + ms(e[1]); }).join(' → '));
    if (D.err.length) { L.push('ПОМИЛКИ (' + D.err.length + '):'); D.err.slice(-6).forEach(function(e){ L.push('  ' + e); }); }
    else L.push('помилок немає');
    box.textContent = L.join('\n');
  }
  setInterval(upd, 500); upd();
})();
