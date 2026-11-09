/* 05 DIFFERENCE · the photographs in WebGL (user 09.11 15:31)
   - no black veil: each picture gets a light grade instead — contrast up, brightness down (the same numbers as the CSS
     fallback and the opening window: contrast(1.12) brightness(.74)), plus a soft vignette once the grid is up;
   - the cursor turns the picture a few degrees (a plane tilting towards it), shifts it a little and carries a soft liquid
     lens that drags with the movement;
   - a change of picture is the intro's front (drawing ↔ photo): one wavy, liquid edge spreads from the card that was opened;
     its rim bends both pictures as it passes, the old one pushes in, the new one settles out of a slight zoom;
   - on the way out of the chapter the picture melts to black behind the same front, into the black of the next chapter.
   Plain WebGL 1, one full-screen quad; nothing runs while the chapter is off screen. Without WebGL the <img> layers stay. */
(function(){
  'use strict';
  var sec = document.getElementById('difference'); if (!sec) return;
  var box = sec.querySelector('.df2-bgs'), bgs = [].slice.call(sec.querySelectorAll('.df2-bg')); if (!box || !bgs.length) return;
  var cv = document.createElement('canvas'); cv.className = 'df2-gl'; cv.setAttribute('aria-hidden', 'true');
  var gl = null; try { gl = cv.getContext('webgl', {alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance'}); } catch (e) {}
  if (!gl) return;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;

  var VS = 'attribute vec2 aP; varying vec2 vUv; void main(){ vUv = aP * .5 + .5; gl_Position = vec4(aP, 0., 1.); }';
  var FS = [
    'precision highp float;',
    'uniform sampler2D tA; uniform sampler2D tB; uniform vec2 uRes; uniform float aA; uniform float aB;',
    'uniform float uP; uniform vec2 uO; uniform float uMax; uniform vec2 uM; uniform vec2 uC; uniform vec2 uV; uniform float uHov;',
    'uniform float uT; uniform float uIn; uniform float uOut; uniform float uDpr; varying vec2 vUv;',
    'float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float nz(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);',
    '  return mix(mix(hh(i), hh(i + vec2(1., 0.)), f.x), mix(hh(i + vec2(0., 1.)), hh(i + 1.), f.x), f.y); }',
    'float fbm(vec2 p){ return nz(p) * .5 + nz(p * 2.03 + 3.1) * .3 + nz(p * 4.1 + 7.7) * .2; }',
    /* object-fit: cover, in screen-centred units */
    'vec2 cover(vec2 p, float ar){ float va = uRes.x / uRes.y; if (va > ar) p.y *= ar / va; else p.x *= va / ar; return p + .5; }',
    'vec3 grade(vec3 c){ return clamp((c - .5) * 1.12 + .5, 0., 1.) * .74; }',
    'void main(){',
    '  vec2 fc = gl_FragCoord.xy; float asp = uRes.x / uRes.y;',
    '  vec2 q = (vUv - .5) * vec2(asp, 1.);',                                   /* isotropic, height = 1 */
    '  q /= 1. + dot(q, uM * vec2(.05, .04) * uIn);',                          /* the plane turns towards the cursor */
    '  vec2 cp = (uC / uRes - .5) * vec2(asp, 1.), dc = q - cp;',
    '  float fall = exp(-dot(dc, dc) / .05) * uHov * uIn;',                    /* the liquid lens under the cursor */
    '  q -= dc * .07 * fall + uV * fall;',
    '  q = q / (1.01 + uIn * (.06 + .01 * sin(uT * .09))) - uM * .014 * uIn;',
    '  vec2 p = q / vec2(asp, 1.);',
    /* the front (as the intro's): a wavy distance from the opened card */
    '  float FW = 190. * uDpr, FSo = 160. * uDpr, FN = 1. / (250. * uDpr);',
    '  float n = fbm(fc * FN + vec2(uT * .06, -uT * .05)) * .75 + fbm(fc * FN * 2.6 + 4.1 - uT * .04) * .25;',
    '  float d = length(fc - uO) + FW * (n - .5), R = uP * (uMax + FW + FSo);',
    '  float k = 1. - smoothstep(R - FSo, R, d);',
    '  float rim = (1. - smoothstep(0., FSo * .8, abs(d - R + FSo * .5))) * step(.0001, uP) * step(uP, .9999);',
    '  vec2 off = normalize(fc - uO + .01) * rim * .035;',                     /* the rim bends both pictures */
    '  vec2 pa = (p - off) / (1. + .05 * uP), pb = (p + off * .6) / (1. + .07 * (1. - uP));',
    '  vec3 col = mix(grade(texture2D(tA, cover(pa, aA)).rgb), grade(texture2D(tB, cover(pb, aB)).rgb), k);',
    '  vec2 v = vUv - .5; col *= 1. - .24 * uIn * smoothstep(.18, .78, dot(v, v) * 2.2);',
    /* on the way out: the picture melts to black behind the same kind of front, from the middle */
    '  if (uOut > 0.){ float d2 = length(fc - uRes * vec2(.5, .42)) + FW * (n - .5), R2 = uOut * (length(uRes) * .62 + FW + FSo);',
    '    col *= smoothstep(R2 - FSo, R2, d2); }',
    '  col += (hh(fc + fract(uT * 37.)) - .5) * .028;',                        /* the house grain */
    '  gl_FragColor = vec4(col, 1.);',
    '}'
  ].join('\n');

  function sh(t, s){ var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)){ console.warn('[dfgl]', gl.getShaderInfoLog(o)); return null; } return o; }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS); if (!vs || !fs) return;
  var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)){ console.warn('[dfgl]', gl.getProgramInfoLog(pr)); return; }
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aP = gl.getAttribLocation(pr, 'aP'); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['tA', 'tB', 'uRes', 'aA', 'aB', 'uP', 'uO', 'uMax', 'uM', 'uC', 'uV', 'uHov', 'uT', 'uIn', 'uOut', 'uDpr'].forEach(function(n){ U[n] = gl.getUniformLocation(pr, n); });
  gl.uniform1i(U.tA, 0); gl.uniform1i(U.tB, 1);

  /* textures: the <img> layers already hold the right size (srcset); uploaded one per frame as the chapter comes near */
  var TX = bgs.map(function(){ return null; }), AR = bgs.map(function(){ return 1.5; }), want = [];
  function upload(i){
    var im = bgs[i].querySelector('img'); if (!im || TX[i]) return true;
    if (!im.complete || !im.naturalWidth) return false;
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    TX[i] = t; AR[i] = im.naturalWidth / im.naturalHeight; return true;
  }
  function onIdx(){ for (var i = 0; i < bgs.length; i++) if (bgs[i].classList.contains('on')) return i; return 0; }

  var A = onIdx(), B = A, P = 0, anim = false, queued = -1, O = [0, 0], MAX = 1, DPR = 1, W = 1, H = 1;
  function size(){ DPR = Math.min(window.devicePixelRatio || 1, 1.75); var r = box.getBoundingClientRect(); W = Math.max(2, Math.round(r.width * DPR)); H = Math.max(2, Math.round(r.height * DPR)); if (cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; } }
  function origin(){
    var c = sec.querySelector('.df2-cell.on'), r = box.getBoundingClientRect(), x = r.width / 2, y = r.height / 2;
    if (c){ var cr = c.getBoundingClientRect(); if (cr.width) { x = cr.left + cr.width / 2 - r.left; y = cr.top + cr.height / 2 - r.top; } }
    O = [x * DPR, (r.height - y) * DPR];
    MAX = 0; [[0, 0], [W, 0], [0, H], [W, H]].forEach(function(k){ MAX = Math.max(MAX, Math.hypot(k[0] - O[0], k[1] - O[1])); });
  }
  function go(i){
    if (i === (anim ? B : A)) { queued = -1; return; }
    if (anim){ queued = i; return; }
    if (!TX[i] && !upload(i)){ queued = i; return; }                 /* not decoded yet: tried again every frame */
    B = i; P = 0; anim = true; origin();
  }
  new MutationObserver(function(){ go(onIdx()); }).observe(box, {attributes: true, subtree: true, attributeFilter: ['class']});

  /* the cursor */
  var M = [0, 0], Mt = [0, 0], C = [0, 0], Ct = [0, 0], V = [0, 0], hov = 0, hovT = 0, last = null;
  window.addEventListener('pointermove', function(e){
    if (e.pointerType !== 'mouse') return;
    var r = box.getBoundingClientRect(); if (!r.height) return;
    Mt = [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)];
    Ct = [(e.clientX - r.left) * DPR, (r.height - (e.clientY - r.top)) * DPR];
    if (last){ var k = 1 / Math.max(r.height, 1); V[0] += ((e.clientX - last[0]) * k - V[0]) * .35; V[1] += (-(e.clientY - last[1]) * k - V[1]) * .35; }
    last = [e.clientX, e.clientY]; hovT = 1;
  }, {passive: true});
  document.addEventListener('pointerleave', function(){ hovT = 0; last = null; });

  /* run only near the screen */
  var vis = false, near = false, raf = 0, t0 = performance.now(), prev = t0, shown = false;
  function frame(now){
    raf = 0; if (!vis && !near) return;
    var dt = Math.min(.05, (now - prev) / 1000); prev = now;
    if (want.length && upload(want[0])) want.shift();                 /* one upload per frame */
    if (!vis){ if (want.length) raf = requestAnimationFrame(frame); return; }
    if (!TX[A]){ upload(A); if (!TX[A]){ raf = requestAnimationFrame(frame); return; } }
    if (!shown){ shown = true; box.classList.add('gl'); }
    if (!anim && queued >= 0){ var qd = queued; queued = -1; go(qd); }
    if (anim){ P += dt / (reduced ? .6 : 1.7); if (P >= 1){ A = B; P = 0; anim = false; } }
    size();
    var T = (now - t0) / 1000;
    if (coarse || reduced){ Mt = reduced ? [0, 0] : [Math.sin(T * .21) * .35, Math.cos(T * .17) * .25]; hovT = 0; }
    var s = reduced ? 1 : .06; M[0] += (Mt[0] - M[0]) * s; M[1] += (Mt[1] - M[1]) * s;
    C[0] += (Ct[0] - C[0]) * .14; C[1] += (Ct[1] - C[1]) * .14; V[0] *= .9; V[1] *= .9; hov += (hovT - hov) * .06;
    var rise = parseFloat(sec.style.getPropertyValue('--rise')); var IN = isNaN(rise) ? 0 : 1 - Math.min(1, Math.max(0, rise / 28));
    var r = sec.getBoundingClientRect(), vh = window.innerHeight, OUT = Math.min(1, Math.max(0, (vh - r.bottom) / (vh * .95)));
    var e = P * P * (3 - 2 * P);
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TX[A]);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, anim ? TX[B] : TX[A]);
    gl.uniform2f(U.uRes, W, H); gl.uniform1f(U.aA, AR[A]); gl.uniform1f(U.aB, anim ? AR[B] : AR[A]);
    gl.uniform1f(U.uP, anim ? e : 0); gl.uniform2f(U.uO, O[0], O[1]); gl.uniform1f(U.uMax, MAX);
    gl.uniform2f(U.uM, M[0], M[1]); gl.uniform2f(U.uC, C[0], C[1]); gl.uniform2f(U.uV, V[0], V[1]); gl.uniform1f(U.uHov, hov);
    gl.uniform1f(U.uT, T); gl.uniform1f(U.uIn, IN); gl.uniform1f(U.uOut, OUT); gl.uniform1f(U.uDpr, DPR);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(frame);
  }
  function start(){ if (!raf && (vis || near) && !document.hidden){ prev = performance.now(); raf = requestAnimationFrame(frame); } }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ near = es[0].isIntersecting; if (near && !want.length) want = [A].concat(bgs.map(function(_, i){ return i; })).filter(function(i, k, a){ return !TX[i] && a.indexOf(i) === k; }); start(); }, {rootMargin: '150% 0px'}).observe(sec);
    new IntersectionObserver(function(es){ vis = es[0].isIntersecting; start(); }).observe(box);
  } else { vis = true; want = bgs.map(function(_, i){ return i; }); start(); }
  document.addEventListener('visibilitychange', start);
  cv.addEventListener('webglcontextlost', function(e){ e.preventDefault(); box.classList.remove('gl'); vis = false; });
  box.insertBefore(cv, box.firstChild);
})();
