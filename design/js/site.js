/* CI Design + Build — homepage design v11 · site.js
   vanilla, no deps. 1) hero intro timeline  2) reveals  3) scroll-driven blocks  4) interactions */
(function(){
  'use strict';
  var $ = function(id){ return document.getElementById(id); };
  var qs = function(s, r){ return (r || document).querySelector(s); };
  var qsa = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, p){ return a + (b - a) * p; }
  var E = {
    out: function(t){ return 1 - Math.pow(1 - t, 4); },
    expo: function(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; },
    push: function(t){ return t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2; },
    lin: function(t){ return t; }
  };
  function seg(t, a, b, ease){ return (ease || E.expo)(clamp01((t - a) / (b - a))); }
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var M = function(){ return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--m')) || 48; };
  try { history.scrollRestoration = 'manual'; } catch(e){}
  window.scrollTo(0, 0);

  /* ================================================================== plate geometry (shared by hero + cta) */
  var P = {w:2851, h:1520,
    wide:{x:1400, y:524, w:330, h:452},                /* facade.jpg (real One Bennett Park, stitched from the night drone): the CI window glass */
    glass:{x:1400, y:524, w:330, h:452}};
  function cover(vw, vh){ var s = Math.max(vw / P.w, vh / P.h); return {s:s, px:(vw - P.w * s) / 2, py:(vh - P.h * s) / 2}; }
  function mapRect(c, r){ return {x:c.px + r.x * c.s, y:c.py + r.y * c.s, w:r.w * c.s, h:r.h * c.s}; }
  function plateGeom(vw, vh){
    var c = cover(vw, vh), gl = mapRect(c, P.glass);
    var g = {vw:vw, vh:vh, s:c.s, px:c.px, py:c.py, gl:gl, gcx:gl.x + gl.w/2, gcy:gl.y + gl.h/2};
    g.sEnd = Math.max(vw / gl.w, vh / gl.h);
    var needW = Math.max(gl.w, vw / g.sEnd), needH = Math.max(gl.h, vh / g.sEnd);
    var bw = Math.max(needW, needH * 16 / 9), bh = bw * 9 / 16;
    if (bh < needH) { bh = needH; bw = bh * 16 / 9; }
    g.box = {w:bw, h:bh, x:(gl.w - bw)/2, y:(gl.h - bh)/2};
    return g;
  }

  /* ================================================================== 01 HERO v13 — the reel's drone shot → whip → the REAL facade → logo → the window lights inside it → inside → slider
     act 1 (0–2.3 s): the CI reel plays as is (drone over One Bennett at blue hour, the light along the facade).
     cut (2.3 s): the reel's current frame is captured into the GL plate A; the video hides; the camera WHIPS round (plate A yaws
     away under motion blur, the real stitched night facade yaws in — plain windows, all lights off).
     then the storyboard as in v9: the official logo draws clockwise with its square exactly on the CI window; letters dissolve;
     the square erases clockwise while the warm light traces clockwise from the gap and tightens onto the glass; the window LIGHTS
     UP inside the small logo (the real photographed interior), the video appears behind the glass, we push through — inside.
     after the intro the hero is a slider of interiors (the interior loop, reel segments, photos) driven by the preview strip. */
  var cvs=$('gl'), vid=$('vid'), reel=$('reel'), logo=$('logo'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), veil=$('veil'), dark=$('dark'),
      cur=$('cur'), hero=$('hero'), heroIn=qs('.hero-ui'), heroTitle=$('title'), fallback=$('glFallback'), slidesEl=$('slides'), preview=$('preview');
  var sq=$('sq'), ib=$('ib'), cMask=$('cMask'), tMask=$('tMask'), cF=$('cF'), tF=$('tF');
  var LOGO = {w:710, h:797, sq:{x:92, y:105, w:514, h:519}};
  var G = {}, state = {t:0, gate:false, videoReady:false, done:false, skipped:false, inside:0, cut:false, phase:'pre'};
  var mx = 0, my = 0, pmx = 0, pmy = 0, scrollZoom = 0;
  var RW = 1916, RH = 1078;                                              /* reel pixels */

  /* ---------- GL setup (v9 shader + trace0) */
  var gl = cvs.getContext('webgl', {alpha:false, antialias:false, premultipliedAlpha:false, powerPreference:'high-performance'});
  var GLOK = !!gl;
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  var FS = [
  'precision highp float;varying vec2 v;',
  'uniform vec2 R;uniform float T;',
  'uniform sampler2D tW,tWb,tC,tCb,tV,tM,tA,tAb;',
  'uniform vec4 rA;uniform float blurA,yawA,yawB,mixAB,zoomA;',
  'uniform vec4 rW,rC;',
  'uniform vec4 rS;',
  'uniform vec4 rV;',
  'uniform vec4 fr;',
  'uniform float mixC,blurW,blurC,fade,winOn,trace,trace0,glow,frameA,inside,dark,grain,vidA,vidZoom,lightsOff,zoomW,vidMix;',
  'uniform vec2 wc;',
  'uniform vec2 mo,head;uniform float headA;',
  'float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
  'vec2 plateUV(vec4 r,vec2 s){return vec2(r.x+(s.x-rS.x)/rS.z*r.z, r.y+(s.y-rS.y)/rS.w*r.w);}',
  'vec3 samp(sampler2D a,sampler2D b,vec2 uv,float bl){vec2 u=clamp(uv,0.001,0.999);vec3 s=texture2D(a,u).rgb;vec3 q=texture2D(b,u).rgb;return mix(s,q,bl);}',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'vec2 yaw(vec2 s,float th){ if(abs(th)<.0005) return s; float f=1.3; vec2 p=(s-R*.5)/R.x; float c=cos(th),sn=sin(th); float xp=p.x/(f*c-p.x*sn); float yp=p.y*(1.+xp*sn)/f; return R*.5+vec2(xp,yp)*R.x*f; }',
  'void main(){',
  '  vec2 s0=vec2(v.x*R.x,(1.-v.y)*R.y);',
  '  vec2 par=mo*vec2(14.,10.);',
  '  vec2 s=yaw(s0,yawB);',
  '  vec2 uw=plateUV(rW,s+par*.6); uw=wc+(uw-wc)/zoomW;',
  '  vec3 cw=samp(tW,tWb,uw,blurW);',
  '  float m=texture2D(tM,clamp(uw,0.,1.)).r;',
  '  float lum=dot(cw,vec3(.3,.59,.11));',
  '  vec3 off=vec3(lum*.10)+vec3(.015,.022,.04);',
  '  vec3 fac=mix(cw*1.28,off,m*lightsOff);',
  '  vec2 q=(s-rS.xy)/rS.zw;',
  '  vec2 vq=(s+par*1.6-rV.xy)/rV.zw; vq=(vq-.5)/vidZoom+.5;',
  '  vec3 vc=texture2D(tV,clamp(vq,0.,1.)).rgb;',
  '  float inG=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);',
  '  vec3 real=cw*1.05;',
  '  vec3 lit=mix(real, mix(vc*vec3(1.02,.98,.92), real, .14), vidMix*vidA);',
  '  vec3 col=mix(fac, mix(fac,lit,winOn), inG);',
  '  col=mix(col, vc, inside);',
  '  vec2 sa=yaw(s0,yawA); vec2 ua=(sa+par*.5-rA.xy)/rA.zw; ua=.5+(ua-.5)/zoomA;',
  '  float inA=step(0.,ua.x)*step(ua.x,1.)*step(0.,ua.y)*step(ua.y,1.);',
  '  vec3 ca=samp(tA,tAb,ua,blurA)*inA;',
  '  col=mix(ca,col,mixAB);',
  '  vec2 fc=fr.xy+fr.zw*.5; vec2 fh=fr.zw*.5;',
  '  float d=abs(sdBox(s-fc,fh));',
  '  vec2 rp=s-fc; float per=2.*(fr.z+fr.w);',
  '  float a=0.; vec2 n=rp/max(fh,vec2(1.));',
  '  if(abs(n.y)>abs(n.x)){ if(n.y<0.) a=(rp.x+fh.x); else a=fr.z+fr.w+(fh.x-rp.x); }',
  '  else { if(n.x>0.) a=fr.z+(rp.y+fh.y); else a=2.*fr.z+fr.w+(fh.y-rp.y); }',
  '  a=fract(a/per-trace0); float on=step(a,trace);',
  '  float core=smoothstep(1.6,0.,d)*on; float halo=exp(-d*d/(2.*pow(10.+glow*14.,2.)))*on;',
  '  vec3 warm=vec3(1.,.86,.62);',
  '  col+=warm*(core*1.1+halo*(.55+.45*glow))*frameA;',
  '  float hd=length(s-head); col+=warm*exp(-hd*hd/900.)*headA*1.4+vec3(1.)*exp(-hd*hd/60.)*headA;',
  '  vec2 cuv=v-.5; float vig=1.-dot(cuv*vec2(1.,R.y/R.x*1.3),cuv*vec2(1.,R.y/R.x*1.3))*.9;',
  '  col*=mix(1.,clamp(vig,0.,1.),.55);',
  '  col*=1.-smoothstep(.5,1.,1.-v.y)*.42*inside-smoothstep(.85,1.,v.y)*.3*inside;',
  '  col*=1.-dark;',
  '  col+=(hash(s*.37+fract(T))-.5)*grain;',
  '  col*=fade;',
  '  gl_FragColor=vec4(col,1.);',
  '}'].join('\n');
  var prog, U = {}, TEX = {};
  function mkShader(type, src){ var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); GLOK = false; } return sh; }
  function mkTex(unit){ var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([12,14,18])); return t; }
  function loadTex(unit, src, cb){ var im = new Image(); im.onload = function(){ gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, TEX[unit]); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); cb && cb(); }; im.onerror = function(){ cb && cb(); }; im.src = src; }
  if (GLOK) {
    prog = gl.createProgram(); gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); GLOK = false; }
  }
  if (GLOK) {
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['R','T','tW','tWb','tC','tCb','tV','tM','tA','tAb','rA','blurA','yawA','yawB','mixAB','zoomA','rW','rC','rS','rV','fr','lightsOff','zoomW','vidMix','wc','mixC','blurW','blurC','fade','winOn','trace','trace0','glow','frameA','inside','dark','grain','vidA','vidZoom','mo','head','headA'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });
    for (var ui = 0; ui < 8; ui++) TEX[ui] = mkTex(ui);
    gl.uniform1i(U.tW, 0); gl.uniform1i(U.tWb, 1); gl.uniform1i(U.tC, 2); gl.uniform1i(U.tCb, 3); gl.uniform1i(U.tV, 4); gl.uniform1i(U.tM, 5); gl.uniform1i(U.tA, 6); gl.uniform1i(U.tAb, 7);
    gl.uniform2f(U.wc, (P.wide.x + P.wide.w / 2) / P.w, (P.wide.y + P.wide.h / 2) / P.h);
    gl.uniform4f(U.rW, P.wide.x / P.w, P.wide.y / P.h, P.wide.w / P.w, P.wide.h / P.h);
    gl.uniform4f(U.rC, P.glass.x / P.w, P.glass.y / P.h, P.glass.w / P.w, P.glass.h / P.h);
    gl.uniform1f(U.trace0, (514 + .918 * 519) / (2 * (514 + 519)));           /* the gap's lower end on the square's perimeter (clockwise from the top-left) */
  }
  var texLoaded = 0, TEXN = 3;
  function texDone(){ texLoaded++; }
  if (GLOK) { loadTex(0, 'assets/night/facade.jpg', texDone); loadTex(1, 'assets/night/facade_blur.jpg', texDone); loadTex(5, 'assets/night/facade_mask.png', texDone); }
  var vidTexOK = false;
  function uploadVideo(){
    if (!GLOK || vid.readyState < 2) return;
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, TEX[4]);
    try { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid); vidTexOK = true; } catch(e){}
  }
  /* the reel's frame at the cut becomes plate A (+ a downscaled twin for the motion blur) */
  function captureReel(){
    if (!GLOK) return;
    try {
      gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D, TEX[6]); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, reel);
      var c = document.createElement('canvas'); c.width = 160; c.height = 90; var ctx = c.getContext('2d'); ctx.drawImage(reel, 0, 0, 160, 90);
      var c2 = document.createElement('canvas'); c2.width = 40; c2.height = 23; c2.getContext('2d').drawImage(c, 0, 0, 40, 23);
      gl.activeTexture(gl.TEXTURE7); gl.bindTexture(gl.TEXTURE_2D, TEX[7]); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, c2);
    } catch(e){}
  }

  /* ---------- geometry */
  function layout(){
    var vw = window.innerWidth, vh = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    G = plateGeom(vw, vh); G.vw = vw; G.vh = vh;
    var wcx = P.wide.x + P.wide.w / 2, wcy = P.wide.y + P.wide.h / 2;
    var s0 = Math.max(vw / (2 * Math.min(wcx, P.w - wcx)), vh / (2 * Math.min(wcy, P.h - wcy)), vw / P.w, vh / P.h);
    var c = {s:s0, px:vw / 2 - wcx * s0, py:vh / 2 - wcy * s0};
    G.R0 = mapRect(c, P.wide); G.cov = c;
    var sa = Math.max(vw / RW, vh / RH), px = (vh > vw) ? .38 : .5;                      /* plate A = the reel frame, placed like object-fit: cover */
    G.rA = {x:(vw - RW * sa) * px, y:(vh - RH * sa) / 2, w:RW * sa, h:RH * sa};
    reel.style.objectPosition = (px * 100) + '% 50%';
    var k = G.R0.h / LOGO.sq.h;
    G.lk = k; G.lsq = {w:LOGO.sq.w * k, h:LOGO.sq.h * k}; G.lsq.x = G.R0.x + G.R0.w / 2 - G.lsq.w / 2; G.lsq.y = G.R0.y + G.R0.h / 2 - G.lsq.h / 2;
    logo.style.transform = 'translate(' + (G.lsq.x - LOGO.sq.x * k) + 'px,' + (G.lsq.y - LOGO.sq.y * k) + 'px) scale(' + k + ')';
    var sEnd = Math.max(vw / G.R0.w, vh / G.R0.h) * 1.12;
    G.REnd = {w:G.R0.w * sEnd, h:G.R0.h * sEnd}; G.REnd.x = (vw - G.REnd.w) / 2; G.REnd.y = (vh - G.REnd.h) / 2;
    var v0h = Math.max(G.R0.h, G.R0.w * 9 / 16) * 1.35, v0w = v0h * 16 / 9;
    G.V0 = {w:v0w, h:v0h, x:G.R0.x + G.R0.w / 2 - v0w / 2, y:G.R0.y + G.R0.h / 2 - v0h / 2};
    var ve = Math.max(vw / 16, vh / 9) * 1.04; G.VEnd = {w:ve * 16, h:ve * 9}; G.VEnd.x = (vw - G.VEnd.w) / 2; G.VEnd.y = (vh - G.VEnd.h) / 2;
    if (GLOK) { cvs.width = Math.round(vw * dpr); cvs.height = Math.round(vh * dpr); gl.viewport(0, 0, cvs.width, cvs.height); gl.uniform2f(U.R, vw, vh); }
    G.dpr = dpr;
  }
  function mixRect(a, b, p){ return {x:lerp(a.x, b.x, p), y:lerp(a.y, b.y, p), w:lerp(a.w, b.w, p), h:lerp(a.h, b.h, p)}; }
  function zoomRect(a, b, p){ var s = Math.exp(lerp(Math.log(a.w), Math.log(b.w), p)) / a.w; var cx = lerp(a.x + a.w/2, b.x + b.w/2, p), cy = lerp(a.y + a.h/2, b.y + b.h/2, p); return {x:cx - a.w*s/2, y:cy - a.h*s/2, w:a.w*s, h:a.h*s}; }
  function perimPoint(r, t){ t = t - Math.floor(t); var per = 2 * (r.w + r.h), d = t * per; if (d < r.w) return [r.x + d, r.y]; d -= r.w; if (d < r.h) return [r.x + r.w, r.y + d]; d -= r.h; if (d < r.w) return [r.x + r.w - d, r.y + r.h]; d -= r.w; return [r.x, r.y + r.h - d]; }
  var TRACE0 = (514 + .918 * 519) / (2 * (514 + 519));

  var L = {sq: sq.getTotalLength(), ib: ib.getTotalLength(), c: cMask.getTotalLength()};
  function dash(el, len, p){ el.style.strokeDasharray = len; el.style.strokeDashoffset = len * (1 - p); }
  function erase(el, len, p){ el.style.strokeDasharray = '0 ' + (p * len) + ' ' + len; el.style.strokeDashoffset = 0; }
  /* timeline (seconds; act 1 runs on the reel's own clock, everything after the cut on the wall clock) */
  var T = {
    cut:2.3, turn:2.3, turnEnd:3.45, xA:2.72, xAEnd:3.12, bgSharp:2.9, bgSharpEnd:3.9,
    sqStart:3.6, sqEnd:4.6, cStart:4.25, cEnd:5.05, iStart:4.85, iEnd:5.25, tStart:5.2, tEnd:5.85,
    lettersOut:6.0, lettersGone:6.55, sweepStart:6.1, sweepEnd:7.4, tightStart:6.05, tightEnd:6.65, bloom:7.4, bloomEnd:8.0,
    winOn:7.65, winFull:8.35, pushStart:8.35, pushEnd:10.15, vmStart:8.6, vmEnd:9.3, frOut:9.3, frGone:9.8,
    uiStart:9.75, end:10.6
  };
  var short = false; try { short = sessionStorage.getItem('ci-intro-v8') === '1'; } catch(e){}

  var UN = {};
  function render(t){
    /* logo: draws clockwise, letters, then erases clockwise while the light runs round from the same gap */
    var sweep = seg(t, T.sweepStart, T.sweepEnd, E.expo);
    if (sweep > 0) erase(sq, L.sq, sweep); else dash(sq, L.sq, seg(t, T.sqStart, T.sqEnd, E.expo));
    sq.style.opacity = sweep < 1 ? 1 : 0;
    dash(cMask, L.c, seg(t, T.cStart, T.cEnd, E.expo)); dash(ib, L.ib, seg(t, T.iStart, T.iEnd, E.out));
    tMask.setAttribute('width', 560 * seg(t, T.tStart, T.tEnd, E.out));
    var lo = 1 - seg(t, T.lettersOut, T.lettersGone, E.expo); cF.style.opacity = lo; ib.style.opacity = lo; tF.style.opacity = lo;
    /* the whip: plate A (the reel's last frame) yaws away under motion blur, the real facade yaws in */
    var turn = seg(t, T.turn, T.turnEnd, E.expo), whip = Math.sin(turn * Math.PI);
    UN.yawA = -turn * 1.05; UN.yawB = (1 - turn) * 1.05;
    UN.mixAB = seg(t, T.xA, T.xAEnd, E.lin);
    UN.blurA = whip; UN.zoomA = 1 + .25 * turn;
    var blurW = Math.max(whip, 1 - seg(t, T.bgSharp, T.bgSharpEnd, E.out));
    /* the frame: the logo square tightens onto the window glass while the light runs round it */
    var mv = seg(t, T.tightStart, T.tightEnd, E.out);
    var frRect = mixRect(G.lsq, G.R0, mv);
    var frameA = (t >= T.sweepStart ? 1 : 0) * (1 - seg(t, T.frOut, T.frGone, E.out));
    var bloom = seg(t, T.bloom, T.bloom + .25, E.out) * (1 - seg(t, T.bloom + .25, T.bloomEnd + .4, E.out));
    var pu = seg(t, T.pushStart, T.pushEnd, E.push);
    var RS = zoomRect(G.R0, G.REnd, pu), RV = zoomRect(G.V0, G.VEnd, pu);
    var frameRect = pu > 0 ? RS : frRect;
    var winOn = seg(t, T.winOn, T.winFull, E.out);
    var inside = seg(t, T.pushEnd - .15, T.pushEnd + .05, E.out); state.inside = inside;
    var hp = perimPoint(frRect, sweep + TRACE0), headA = (sweep > 0 && sweep < 1) ? 1 : 0;
    UN.fade = state.cut ? 1 : 0; UN.blurW = Math.max(blurW, seg(t, T.pushStart + .5, T.pushEnd, E.out) * .75); UN.blurC = 0; UN.mixC = 0;
    UN.winOn = winOn; UN.trace = sweep; UN.glow = bloom; UN.frameA = frameA; UN.inside = inside;
    UN.zoomW = 1; UN.lightsOff = 1; UN.vidMix = seg(t, T.vmStart, T.vmEnd, E.out);
    UN.fr = frameRect; UN.rS = pu > 0 ? RS : G.R0; UN.rV = pu > 0 ? RV : G.V0; UN.head = hp; UN.headA = headA; UN.vidA = 1; UN.vidZoom = 1;
    if (!state.done && t >= T.uiStart) uiOn();
    if (!state.done) skip.classList.toggle('on', t > .6 && t < T.uiStart);
    draw();
  }
  var darkU = 0;
  function draw(){
    if (!GLOK) return;
    gl.uniform1f(U.T, performance.now() / 1000);
    gl.uniform1f(U.fade, UN.fade || 0); gl.uniform1f(U.blurW, UN.blurW == null ? 1 : UN.blurW); gl.uniform1f(U.blurC, 0); gl.uniform1f(U.mixC, 0);
    gl.uniform1f(U.winOn, UN.winOn || 0); gl.uniform1f(U.trace, UN.trace || 0); gl.uniform1f(U.glow, UN.glow || 0); gl.uniform1f(U.frameA, UN.frameA || 0); gl.uniform1f(U.inside, UN.inside || 0);
    gl.uniform1f(U.dark, darkU); gl.uniform1f(U.grain, .035); gl.uniform1f(U.lightsOff, 1); gl.uniform1f(U.zoomW, 1); gl.uniform1f(U.vidMix, UN.vidMix == null ? 1 : UN.vidMix); gl.uniform1f(U.vidA, vidTexOK ? (UN.vidA || 0) : 0); gl.uniform1f(U.vidZoom, 1 + scrollZoom);
    var f = UN.fr || {x:0,y:0,w:0,h:0}, r = UN.rS || {x:0,y:0,w:1,h:1};
    gl.uniform4f(U.fr, f.x, f.y, f.w, f.h); gl.uniform4f(U.rS, r.x, r.y, r.w, r.h); var rv = UN.rV || r; gl.uniform4f(U.rV, rv.x, rv.y, rv.w, rv.h);
    gl.uniform2f(U.mo, pmx, pmy); var ra = G.rA || {x:0,y:0,w:1,h:1}; gl.uniform4f(U.rA, ra.x, ra.y, ra.w, ra.h); gl.uniform1f(U.blurA, UN.blurA == null ? 1 : UN.blurA); gl.uniform1f(U.yawA, UN.yawA || 0); gl.uniform1f(U.yawB, UN.yawB || 0); gl.uniform1f(U.mixAB, UN.mixAB == null ? 1 : UN.mixAB); gl.uniform1f(U.zoomA, UN.zoomA || 1); var h = UN.head || [-999,-999]; gl.uniform2f(U.head, h[0], h[1]); gl.uniform1f(U.headA, UN.headA || 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ---------- sources */
  function markReady(){ state.videoReady = true; }
  vid.addEventListener('canplaythrough', markReady); vid.addEventListener('canplay', markReady);
  function startVideo(){ var pr = vid.play(); if (pr && pr.catch) pr.catch(function(){}); }
  (function(){ var big = window.innerWidth >= 900 && GLOK; var s = $('vsrc'); s.src = big ? 'assets/night/int_night_1080.mp4' : 'assets/night/int_night_720.mp4'; vid.load(); })();
  var reelCan = false;
  (function pickReel(){
    var big = Math.min(window.innerWidth, window.innerHeight) >= 520;
    var vp9 = !!reel.canPlayType && reel.canPlayType('video/webm; codecs="vp9"') === 'probably';
    var src = !big ? 'assets/reel/reel_720.mp4' : (vp9 ? 'assets/reel/reel_1080.webm' : 'assets/reel/reel_1080.mp4');
    var s = document.createElement('source'); s.src = src; s.type = /webm/.test(src) ? 'video/webm' : 'video/mp4'; reel.appendChild(s);
    if (!vp9 || !big) { var s2 = document.createElement('source'); s2.src = big ? 'assets/reel/reel_1080.mp4' : 'assets/reel/reel_720.mp4'; s2.type = 'video/mp4'; if (s2.src !== s.src) reel.appendChild(s2); }
    reel.addEventListener('canplay', function(){ reelCan = true; }); reel.addEventListener('canplaythrough', function(){ reelCan = true; });
    reel.load();
  })();

  /* ---------- preloader: the counter follows the reel buffer + the facade plates; starts the reel when both are in (max 4.5 s) */
  var pre0 = performance.now(), preDone = false, shown = 0;
  function buffered(){ try { if (reel.buffered.length && reel.duration) return reel.buffered.end(reel.buffered.length - 1) / Math.min(reel.duration, 5); } catch(e){} return 0; }
  function preTick(now){
    if (preDone) return;
    var el = (now - pre0) / 1000;
    var target = Math.max(Math.min(.9, el / 1.6), Math.min(1, buffered()) * (texLoaded >= TEXN ? 1 : .8));
    if ((reelCan || reel.readyState >= 3) && (texLoaded >= TEXN || !GLOK) || el > 4.5 || short && el > .5) target = 1;
    shown += (target * 100 - shown) * .16; if (target >= 1 && shown > 98.5) shown = 100;
    cnt.textContent = (shown < 10 ? '0' : '') + Math.round(shown);
    if (shown >= 100) { preDone = true; startIntro(); return; }
    requestAnimationFrame(preTick);
  }
  requestAnimationFrame(preTick);

  /* ---------- the intro clock */
  var raf = null, wall0 = null, hold = 0, lastNow = null;
  function startIntro(){
    pre.classList.add('out'); veil.classList.add('off');
    if (!GLOK || reduced) { fallback.classList.add('on'); state.cut = true; state.gate = true; startVideo(); reel.classList.add('cut'); finish(); return; }
    state.phase = 'act1';
    var p = reel.play(); if (p && p.catch) p.catch(function(){ /* autoplay refused → straight to the facade */ doCut(performance.now()); });
    raf = requestAnimationFrame(tick);
  }
  function doCut(now){
    if (state.cut) return; state.cut = true;
    captureReel(); reel.pause(); reel.classList.add('cut');
    wall0 = now - T.cut * 1000; lastNow = now; state.phase = 'intro';
  }
  function tick(now){
    var t;
    if (!state.cut) {
      t = reel.currentTime || 0;
      if (t >= T.cut - .02 || reel.ended) { doCut(now); t = T.cut; }
    } else {
      var dt = (now - lastNow) / 1000; lastNow = now;
      t = (now - wall0) / 1000 - hold;
      if (!state.gate && t >= T.winOn - .05) {
        if ((state.videoReady || vid.readyState >= 3) || hold >= 5) { state.gate = true; startVideo(); }
        else { hold += dt; t = T.winOn - .05; }
      }
      if (state.gate) uploadVideo();
    }
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    state.t = t; render(t);
    if (!state.cut || t < T.end) raf = requestAnimationFrame(tick); else finish();
  }
  function uiOn(){
    if (hero.classList.contains('ui')) return;
    hero.classList.add('ui'); document.body.classList.add('ready'); document.body.classList.remove('is-intro'); heroTitle.classList.add('in');
    skip.classList.remove('on'); skip.style.pointerEvents = 'none';
  }
  function finish(){
    if (state.done) return; state.done = true; cancelAnimationFrame(raf);
    uiOn(); render(T.end + 1);
    pre.style.display = 'none'; logo.style.display = 'none';
    try { sessionStorage.setItem('ci-intro-v8', '1'); } catch(e){}
    startScroll(); startSlider(); idleLoop();
  }
  function skipIntro(){
    if (state.done || state.skipped) return; state.skipped = true;
    if (!preDone) { preDone = true; pre.classList.add('out'); veil.classList.add('off'); }
    cancelAnimationFrame(raf); if (!state.cut) { state.cut = true; reel.pause(); reel.classList.add('cut'); }
    state.gate = true; startVideo();
    var start = performance.now(), from = state.t;
    (function f(now){ var p = clamp01((now - start) / 900); uploadVideo(); render(lerp(Math.max(from, T.pushStart), T.end, E.expo(p))); if (p < 1) requestAnimationFrame(f); else finish(); })(start);
  }
  skip.addEventListener('click', skipIntro);
  window.addEventListener('keydown', function(e){ if (!state.done && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipIntro(); } });
  /* after the intro the GL keeps the interior loop alive (slide 0) */
  function idleLoop(){ (function f(){ if (slide.cur === 0) { pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06; uploadVideo(); draw(); } requestAnimationFrame(f); })(); }

  /* ================================================================== the hero slider: interiors (loop · reel segments · photos), driven by the preview strip */
  var SL = [
    {k:'gl', dur:7.5, th:'assets/reel/th/loop.jpg'},
    {k:'reel', a:5.85, b:8.4, rate:.6, th:'assets/reel/th/bar.jpg'},
    {k:'img', src:'assets/img2/dining_w.jpg', dur:6.5},
    {k:'reel', a:8.55, b:9.95, rate:.45, th:'assets/reel/th/kitchen.jpg'},
    {k:'img', src:'assets/img2/bed_night_w.jpg', dur:6.5},
    {k:'reel', a:10.05, b:11.45, rate:.45, th:'assets/reel/th/living.jpg'},
    {k:'img', src:'assets/img2/wine_w.jpg', dur:6.5},
    {k:'reel', a:11.6, b:14.9, rate:.8, th:'assets/reel/th/window.jpg'}
  ];
  var slide = {cur:0, timer:null, on:false, els:[]};
  var pvImgs = preview ? qsa('.pv-img img', preview) : [];
  function buildSlides(){
    SL.forEach(function(s, i){
      if (s.k === 'img') { var im = document.createElement('img'); im.className = 'sl'; im.src = s.src; im.alt = ''; im.decoding = 'async'; slidesEl.appendChild(im); slide.els[i] = im; s.th = s.src; }
    });
  }
  function setPreview(){
    for (var j = 0; j < pvImgs.length; j++) { var s = SL[(slide.cur + 1 + j) % SL.length]; pvImgs[j].src = s.th; pvImgs[j].parentNode.setAttribute('data-i', (slide.cur + 1 + j) % SL.length); }
  }
  function showSlide(i){
    var prev = SL[slide.cur], next = SL[i];
    clearTimeout(slide.timer); reel.removeEventListener('timeupdate', reelEnd);
    /* hide the previous */
    if (prev.k === 'reel') { reel.classList.remove('on'); reel.classList.add('fade'); setTimeout(function(){ if (SL[slide.cur].k !== 'reel') reel.pause(); }, 1200); }
    if (prev.k === 'img') slide.els[slide.cur].classList.remove('on');
    slide.cur = i;
    if (next.k === 'gl') { slide.timer = setTimeout(nextSlide, next.dur * 1000); }
    else if (next.k === 'img') { slide.els[i].classList.add('on'); slide.timer = setTimeout(nextSlide, next.dur * 1000); }
    else { try { reel.currentTime = next.a; } catch(e){} reel.playbackRate = next.rate; reel.classList.remove('cut'); reel.classList.remove('fade'); reel.classList.add('on'); var p = reel.play(); if (p && p.catch) p.catch(function(){}); reel.addEventListener('timeupdate', reelEnd); slide.timer = setTimeout(nextSlide, ((next.b - next.a) / next.rate + 1.5) * 1000); }
    setPreview();
  }
  function reelEnd(){ var s = SL[slide.cur]; if (s.k === 'reel' && reel.currentTime >= s.b) { reel.removeEventListener('timeupdate', reelEnd); nextSlide(); } }
  function nextSlide(){ if (!slide.on) return; showSlide((slide.cur + 1) % SL.length); }
  function startSlider(){
    if (slide.on) return; slide.on = true; buildSlides(); setPreview();
    slide.timer = setTimeout(nextSlide, SL[0].dur * 1000);
    if (preview) qsa('.pv-img', preview).forEach(function(el){ el.style.pointerEvents = 'auto'; el.style.cursor = 'none'; el.addEventListener('click', function(){ var i = parseInt(el.getAttribute('data-i'), 10); if (!isNaN(i)) showSlide(i); }); });
    document.addEventListener('visibilitychange', function(){ if (document.hidden) { clearTimeout(slide.timer); } else if (slide.on) { showSlide(slide.cur); } });
  }

  /* ---------- cursor + mouse */
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var cx = 0, cy = 0, tx = 0, ty = 0, curLab = qs('.cl', cur);
  window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5); });
  (function curLoop(){ cx += (tx - cx) * .6; cy += (ty - cy) * .6; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(curLoop); })();
  document.addEventListener('pointerover', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw,.pv-img'); if (t) cur.classList.add('link'); });
  document.addEventListener('pointerout', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw,.pv-img'); if (t) cur.classList.remove('link'); });
  layout();
  window.addEventListener('resize', function(){ layout(); render(state.done ? T.end + 1 : state.t); onResize(); });
  render(0);
  function heroScroll(hy, vh){
    var p = clamp01(hy / vh);
    scrollZoom = p * .08; darkU = p * .75;
    dark.style.opacity = p * .8;
    heroIn.style.opacity = 1 - clamp01(p * 1.4); heroIn.style.transform = 'translateY(' + (hy * .12) + 'px)';
  }

  /* ================================================================== YODEZEEN text reveal
     measured on yodezeen.com: every character is its own inline span (opacity 0 → 1, expo-out);
     inside a word the LAST character starts first (reversed stagger, ~7 px of scroll per char),
     each word starts at its own offset; the whole thing is scrubbed by scroll (reversible).
     Here: progress p in [0,1] (scroll or time) → per-char opacity. */
  function yodeHash(i){ var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }
  function yodeSplit(el){
    var words = [];
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
          parts.forEach(function(p){
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span'); w.className = 'yw'; var cs = [];
            for (var i = 0; i < p.length; i++) { var c = document.createElement('span'); c.className = 'yc'; c.textContent = p[i]; w.appendChild(c); cs.push(c); }
            words.push(cs); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    })(el);
    var chars = [], wi = 0, STEP = .028, D = .42;
    words.forEach(function(cs){ var base = yodeHash(wi++ + el._yseed) * .45; cs.forEach(function(c, i){ chars.push({el:c, off:base + (cs.length - 1 - i) * STEP}); }); });
    var S = 0; chars.forEach(function(c){ if (c.off > S) S = c.off; }); S += D;
    el._yode = {chars:chars, S:S, D:D, last:-1};
    el.classList.add('split');
  }
  function yodeSet(el, p){
    var y = el._yode; if (!y) return;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    if (p === y.last) return; y.last = p;
    var ps = p * y.S, cs = y.chars;
    for (var i = 0; i < cs.length; i++) {
      var q = (ps - cs[i].off) / y.D; q = q < 0 ? 0 : q > 1 ? 1 : q;
      cs[i].el.style.opacity = q >= 1 ? 1 : (1 - Math.pow(2, -10 * q)).toFixed(3);
    }
    if (p >= 1) el.classList.add('yd'); else el.classList.remove('yd');
  }
  var yodeSeed = 0;
  qsa('.yode').forEach(function(el){ el._yseed = (yodeSeed += 7); yodeSplit(el); });
  var yodeScroll = qsa('.yode').filter(function(el){ return el.id !== 'title'; });
  function updateYode(vh){
    for (var i = 0; i < yodeScroll.length; i++) {
      var el = yodeScroll[i], r = el.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;
      yodeSet(el, (vh * .9 - r.top) / (vh * .26));
    }
  }

  /* ================================================================== text splitting (chars / words) */
  function splitNode(node, mode, st){
    // mode 'chars' → words of chars; 'words' → words only. Keeps <br> and inline elements (recurses).
    var kids = Array.prototype.slice.call(node.childNodes);
    kids.forEach(function(n){
      if (n.nodeType === 3) {
        var parts = n.nodeValue.split(/(\s+)/), frag = document.createDocumentFragment();
        parts.forEach(function(p){
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          if (mode === 'chars') {
            for (var i = 0; i < p.length; i++) {
              var c = document.createElement('span'); c.className = 'ch'; c.textContent = p[i];
              var o = (Math.sin(st.i * 12.9898 + 78.233) * 43758.5453); o = o - Math.floor(o);
              c.style.setProperty('--o', Math.round((o * 2 - 1) * 70) + 'px');
              c.style.transitionDelay = (st.i * 22) + 'ms'; st.i++; w.appendChild(c);
            }
          } else { w.textContent = p; st.i++; }
          frag.appendChild(w);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') splitNode(n, mode, st);
    });
  }
  qsa('.chars').forEach(function(el){ splitNode(el, 'chars', {i:0}); });
  qsa('.read').forEach(function(el){ splitNode(el, 'words', {i:0}); });
  var reads = qsa('.read').map(function(el){ return {el: el, w: qsa('.w', el), n: -1}; });
  function updateReads(vh){
    reads.forEach(function(r){
      var rc = r.el.getBoundingClientRect(); if (rc.bottom < 0 || rc.top > vh) return;
      var p = clamp01((vh * .78 - rc.top) / (rc.height + vh * .18));
      var n = Math.round(p * r.w.length);
      if (n !== r.n) { r.n = n; for (var i = 0; i < r.w.length; i++) r.w[i].classList.toggle('on', i < n); }
    });
  }

  /* ================================================================== parallax images */
  var pxs = qsa('.px').map(function(el){ return {el: el, img: el.querySelector('img'), imgs: qsa('img', el)}; });
  function updatePx(vh){
    for (var i = 0; i < pxs.length; i++) {
      var r = pxs[i].el.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) continue;
      var c = (r.top + r.height / 2 - vh / 2) / vh;     // -0.5 … 0.5
      var py = Math.round(c * -0.12 * r.height);
      for (var k = 0; k < pxs[i].imgs.length; k++) pxs[i].imgs[k].style.setProperty('--py', py + 'px');
    }
  }

  /* ================================================================== chapter bar */
  var chap = $('chap'), chapLinks = qsa('a', chap), chapSecs = chapLinks.map(function(a){ return $(a.getAttribute('data-ch')); }), chapOn = -1;
  function updateChap(y, vh){
    if (!chap) return;
    chap.classList.toggle('show', state.done && y > vh * .7);
    var idx = 0, tops = chapSecs.map(function(s){ return s.getBoundingClientRect().top + y; });
    for (var i = 0; i < tops.length; i++) if (y + vh * .5 >= tops[i]) idx = i;
    var next = idx + 1 < tops.length ? tops[idx + 1] : document.documentElement.scrollHeight - vh;
    var p = clamp01((y - tops[idx]) / Math.max(1, next - tops[idx]));
    if (idx !== chapOn) { chapOn = idx; chapLinks.forEach(function(a, k){ a.classList.toggle('on', k === idx); }); }
    chapLinks[idx].querySelector('i').style.transform = 'scaleX(' + p + ')';
    chap.classList.toggle('light', !!hdrTheme);
  }

  /* ================================================================== smooth wheel scroll (lerp) */
  var sm = {t: 0, c: 0, on: false, ours: false};
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!reduced && !coarse) {
    window.addEventListener('wheel', function(e){
      if (!state.done || e.ctrlKey) return;
      e.preventDefault();
      var d = e.deltaY; if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= window.innerHeight;
      d = Math.max(-140, Math.min(140, d));
      if (!sm.on) { sm.on = true; sm.c = sm.t = window.scrollY; }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      sm.t = Math.max(0, Math.min(max, sm.t + d * 1.15));
    }, {passive: false});
    window.addEventListener('scroll', function(){ if (!sm.on || Math.abs(window.scrollY - sm.c) > 2) { sm.c = sm.t = window.scrollY; sm.on = false; } });
  }
  function smoothStep(){
    if (!sm.on) return;
    var diff = sm.t - sm.c;
    if (Math.abs(diff) < .3) { sm.on = false; return; }
    sm.c += diff * .11; sm.c = Math.round(sm.c * 100) / 100; window.scrollTo(0, sm.c); sm.c = window.scrollY;
  }
  function smoothTo(y){ if (reduced || coarse) { window.scrollTo(0, y); return; } sm.on = true; sm.c = window.scrollY; sm.t = y; }

  /* ================================================================== reveals (IntersectionObserver) */
  var num20 = $('num20'), num20Done = false;
  function countTo(el, to, ms, suffix){
    var s = performance.now();
    (function f(now){ var p = E.out(clamp01((now - s) / ms)); el.textContent = Math.round(to * p) + (suffix || ''); if (p < 1) requestAnimationFrame(f); })(s);
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      en.target.classList.add('in'); io.unobserve(en.target);
      if (en.target.classList.contains('px')) setTimeout(function(){ en.target.classList.add('st'); }, 1800);
      if (en.target.id === 'stat20' && !num20Done) { num20Done = true; countTo(num20, 20, 1400); }
    });
  }, {threshold: .12, rootMargin: '0px 0px -6% 0px'});
  qsa('.rv, .lines, .wipe, .img-rv, .chars, .bi').forEach(function(el){ if (el.id !== 'title') io.observe(el); });

  /* ================================================================== anchors */
  qsa('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href').slice(1); if (!id) { e.preventDefault(); return; }
      var el = $(id); if (!el) return; e.preventDefault();
      smoothTo(el.getBoundingClientRect().top + window.scrollY);
    });
  });

  /* ================================================================== 03 PHILOSOPHY — the 24h dial */
  var dialSvg = $('dialSvg'), dialNum = $('dialNum'), dialTicks = [], dialArc, dialState = -1, philCols = qs('.phil .dial-row');
  (function buildDial(){
    if (!dialSvg) return;
    var NS = 'http://www.w3.org/2000/svg', N = 96, cxp = 260, cyp = 260, r = 240;
    var ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', cxp); ring.setAttribute('cy', cyp); ring.setAttribute('r', 214);
    ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', 'rgba(241,239,233,.14)'); ring.setAttribute('stroke-width', '1'); dialSvg.appendChild(ring);
    dialArc = document.createElementNS(NS, 'circle'); dialArc.setAttribute('cx', cxp); dialArc.setAttribute('cy', cyp); dialArc.setAttribute('r', 214);
    dialArc.setAttribute('fill', 'none'); dialArc.setAttribute('stroke', '#96A9BF'); dialArc.setAttribute('stroke-width', '1.5');
    var C = 2 * Math.PI * 214; dialArc.setAttribute('stroke-dasharray', C); dialArc.setAttribute('stroke-dashoffset', C); dialArc.setAttribute('transform', 'rotate(-90 260 260)'); dialSvg.appendChild(dialArc);
    dialArc._C = C;
    for (var i = 0; i < N; i++) {
      var a = (i / N) * Math.PI * 2 - Math.PI / 2, big = i % 8 === 0, len = big ? 22 : 12;
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', cxp + Math.cos(a) * (r - len)); l.setAttribute('y1', cyp + Math.sin(a) * (r - len));
      l.setAttribute('x2', cxp + Math.cos(a) * r); l.setAttribute('y2', cyp + Math.sin(a) * r);
      l.setAttribute('class', 'tk' + (big ? ' h' : '')); dialSvg.appendChild(l); dialTicks.push(l);
    }
  })();
  function updateDial(vh){
    if (!philCols) return;
    var r = philCols.getBoundingClientRect();
    var p = E.out(clamp01((vh * .9 - r.top) / (vh * .8)));
    var on = Math.round(72 * p);
    if (on !== dialState) {
      dialState = on;
      for (var i = 0; i < dialTicks.length; i++) dialTicks[i].classList.toggle('on', i < on);
      dialNum.textContent = Math.round(75 * p);
      dialArc.setAttribute('stroke-dashoffset', dialArc._C * (1 - .75 * p));
    }
  }

  /* ================================================================== 04 ABOUT — fragments → one roof */
  var diagram = $('diagram'), aboutPin = $('aboutPin'), aboutStages = qsa('#aboutStages > div'), aboutCounter = $('aboutCounter');
  var CHIPS = ['Architecture','Interior Design','Construction','Furnishings','Art','Wellness','Procurement','Installation','Project Management'];
  var SCAT = [[.14,.16],[.78,.1],[.44,.3],[.88,.48],[.2,.56],[.6,.54],[.1,.86],[.5,.9],[.84,.84]];
  var LINKS = [[0,2],[1,3],[2,5],[4,6],[5,8],[3,8],[4,2],[6,7],[1,5]];
  var chips = [], links = [], aboutStage = -1;
  (function buildDiagram(){
    if (!diagram) return;
    LINKS.forEach(function(pr){ var l = document.createElement('div'); l.className = 'link'; l.style.background = 'repeating-linear-gradient(90deg, rgba(17,17,17,.35) 0 9px, transparent 9px 15px)'; diagram.appendChild(l); links.push(l); });
    CHIPS.forEach(function(n, i){ var c = document.createElement('div'); c.className = 'chip meta'; c.innerHTML = '<span class="mono">0' + (i+1) + '</span>' + n; diagram.appendChild(c); chips.push(c); });
  })();
  function updateAbout(vh, now){
    if (!diagram) return;
    var r = aboutPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var W = diagram.clientWidth, H = diagram.clientHeight;
    var g = seg(p, .28, .68, E.expo), lk = 1 - seg(p, .22, .42, E.out);
    var pts = [];
    for (var i = 0; i < chips.length; i++) {
      var sx = SCAT[i][0] * W, sy = SCAT[i][1] * H;
      var jx = Math.sin(now / 900 + i * 1.7) * 5 * (1 - g), jy = Math.cos(now / 1100 + i * 2.3) * 5 * (1 - g);
      var NC = W < 600 ? 2 : 3, NR = Math.ceil(chips.length / NC), col = i % NC, rw = Math.floor(i / NC);
      var gx = (.08 + (col + .5) * (.84 / NC)) * W, gy = (.12 + (rw + .5) * (.74 / NR)) * H;
      var x = lerp(sx, gx, g) + jx, y = lerp(sy, gy, g) + jy;
      pts.push([x, y]);
      chips[i].style.transform = 'translate(' + (x) + 'px,' + (y) + 'px) translate(-50%,-50%)';
    }
    for (var j = 0; j < links.length; j++) {
      var a = pts[LINKS[j][0]], b = pts[LINKS[j][1]], dx = b[0]-a[0], dy = b[1]-a[1], len = Math.sqrt(dx*dx+dy*dy), ang = Math.atan2(dy, dx);
      links[j].style.transform = 'translate(' + a[0] + 'px,' + a[1] + 'px) rotate(' + ang + 'rad)'; links[j].style.width = len + 'px'; links[j].style.opacity = lk;
    }
    diagram.classList.toggle('one', p > .66);
    var st = p < .33 ? 0 : p < .66 ? 1 : 2;
    if (st !== aboutStage) {
      aboutStage = st; aboutStages.forEach(function(d, i){ d.classList.toggle('on', i === st); });
      aboutCounter.textContent = st < 2 ? 'ARCHITECTS · DESIGNERS · CONTRACTORS · VENDORS · INSTALLERS' : 'UNDER ONE ROOF · ONE TEAM';
    }
  }

  /* ================================================================== 05 PROJECTS — drag carousel */
  (function carousel(){
    var wrap = $('projWrap'), track = $('projTrack'), idxEl = $('projIdx'), bar = $('projBar');
    if (!wrap) return;
    var cards = qsa('.card', track), i = 0, x = 0, startX = 0, startTX = 0, dragging = false, moved = 0, lastX = 0, vel = 0;
    function maxShift(){ return Math.max(0, track.scrollWidth - wrap.clientWidth + M()*2 - M()*2); }
    function goTo(n, instant){
      i = Math.max(0, Math.min(cards.length - 1, n));
      x = -Math.min(cards[i].offsetLeft, maxShift());
      track.classList.toggle('dragging', !!instant);
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      idxEl.textContent = (i < 9 ? '0' : '') + (i + 1);
      bar.style.transform = 'translateX(' + (i * 100) + '%)';
    }
    $('projPrev').addEventListener('click', function(){ goTo(i - 1); });
    $('projNext').addEventListener('click', function(){ goTo(i + 1); });
    wrap.addEventListener('pointerenter', function(){ cur.classList.add('drag'); curLab.textContent = 'DRAG'; });
    wrap.addEventListener('pointerleave', function(){ cur.classList.remove('drag'); });
    wrap.addEventListener('pointerdown', function(e){ dragging = true; moved = 0; startX = lastX = e.clientX; startTX = x; vel = 0; wrap.setPointerCapture(e.pointerId); track.classList.add('dragging'); });
    wrap.addEventListener('pointermove', function(e){ if (!dragging) return; var dx = e.clientX - startX; vel = e.clientX - lastX; lastX = e.clientX; moved = Math.abs(dx); var nx = Math.max(-maxShift() - 80, Math.min(80, startTX + dx)); track.style.transform = 'translate3d(' + nx + 'px,0,0)'; x = nx; });
    function end(e){ if (!dragging) return; dragging = false; track.classList.remove('dragging');
      var dx = x - startTX; var n = i;
      if (dx < -60 || vel < -6) n = i + 1; else if (dx > 60 || vel > 6) n = i - 1;
      goTo(n); }
    wrap.addEventListener('pointerup', end); wrap.addEventListener('pointercancel', end);
    qsa('a', wrap).forEach(function(a){ a.addEventListener('click', function(e){ if (moved > 6) e.preventDefault(); }); });
    window.addEventListener('resize', function(){ goTo(i, true); requestAnimationFrame(function(){ track.classList.remove('dragging'); }); });
    goTo(0, true); requestAnimationFrame(function(){ track.classList.remove('dragging'); });
  })();

  /* ================================================================== 06 DIFFERENCE — floating image */
  (function diff(){
    var list = $('diffList'), fl = $('diffFloat'), cl = $('diffCl'); if (!list) return;
    var imgs = qsa('img', fl), fx = 0, fy = 0, gx = 0, gy = 0, on = false;
    list.addEventListener('pointermove', function(e){ gx = e.clientX; gy = e.clientY; });
    qsa('.item', list).forEach(function(it, i){
      it.addEventListener('pointerenter', function(){ on = true; fl.classList.add('on'); imgs.forEach(function(im){ im.classList.toggle('on', im.getAttribute('data-k') === it.getAttribute('data-img')); }); cl.textContent = '0' + (i + 1); });
    });
    list.addEventListener('pointerleave', function(){ on = false; fl.classList.remove('on'); });
    (function loop(){ if (on || fl.classList.contains('on')) { fx += (gx - fx) * .14; fy += (gy - fy) * .14; fl.style.left = fx + 'px'; fl.style.top = fy + 'px'; } else { fx = gx; fy = gy; } requestAnimationFrame(loop); })();
  })();

  /* ================================================================== 07 SUITE — stacked layers */
  (function suite(){
    var stack = $('stack'), tabs = qsa('#suiteTabs .tab'), descs = qsa('#suiteDesc > div'), sw = $('wellSw'), cntB = $('layerCnt'); if (!stack) return;
    var ORDER = ['Architecture','Interior Design','Construction','Furnishings','Art','Styling','Wellness','Installation','Move-In','CI Wellness'];
    var SETS = {
      turnkey: ['Architecture','Interior Design','Construction','Furnishings','Art','Wellness','Installation','Move-In'],
      core: ['Architecture','Interior Design','Construction'],
      curated: ['Architecture','Interior Design','Construction','Furnishings','Art','Styling']
    };
    var layers = {}, cur = 'turnkey', well = false, STEP = 60;
    ORDER.forEach(function(n){ var l = document.createElement('div'); l.className = 'layer meta'; l.innerHTML = '<span>' + n + '</span><span class="mono"></span>'; stack.appendChild(l); layers[n] = l; });
    function apply(){
      var vis = SETS[cur].slice(), addAmber = null;
      if (well) { if (vis.indexOf('Wellness') >= 0) addAmber = 'Wellness'; else { vis.push('CI Wellness'); addAmber = 'CI Wellness'; } }
      var N = vis.length;
      stack.style.minHeight = Math.max(360, N * STEP + 80) + 'px';
      ORDER.forEach(function(n){
        var l = layers[n], pos = vis.indexOf(n);
        if (pos < 0) { l.classList.remove('on', 'add'); l.style.transitionDelay = '0s'; return; }
        l.style.bottom = (pos * STEP) + 'px'; l.style.left = (pos * 10) + 'px';
        l.style.transitionDelay = (pos * 45) + 'ms';
        l.querySelector('.mono').textContent = (pos < 9 ? '0' : '') + (pos + 1);
        l.classList.add('on'); l.classList.toggle('add', n === addAmber);
      });
      cntB.textContent = N;
      tabs.forEach(function(t){ t.classList.toggle('on', t.getAttribute('data-k') === cur); });
      descs.forEach(function(d){ d.classList.toggle('on', d.getAttribute('data-k') === cur); });
    }
    tabs.forEach(function(t){ t.addEventListener('click', function(){ cur = t.getAttribute('data-k'); apply(); }); });
    sw.addEventListener('click', function(){ well = !well; sw.classList.toggle('on', well); sw.setAttribute('aria-pressed', well); apply(); });
    apply();
  })();

  /* ================================================================== 08 APPROACH — questions type themselves */
  var qmark = $('qmark'), apprPin = $('apprPin'), apprQ = qsa('#qs .q'), apprDone = $('apprDone'), apprRail = qsa('#apprRail i'), apprBg = qs('.appr .bg'), apprImgs = qsa('#apprBg img'), apprCur = -1;
  function updateAppr(vh){
    if (!apprPin) return;
    var r = apprPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var S = .158;
    for (var i = 0; i < apprQ.length; i++) {
      var q = apprQ[i], tx = q.querySelector('.tx'), full = tx.getAttribute('data-t');
      var lp = (p - i * S) / S;
      if (lp < 0 || lp >= 1) { q.style.opacity = 0; q.classList.remove('typing'); tx.textContent = lp >= 1 ? full : ''; continue; }
      var typed = clamp01(lp / .55), n = Math.ceil(full.length * typed);
      tx.textContent = full.slice(0, n);
      q.classList.toggle('typing', typed < 1);
      var op = seg(lp, 0, .06, E.out) * (1 - seg(lp, .86, 1, E.out));
      q.style.opacity = op; q.style.transform = 'translateY(' + (-50 + (-24 * seg(lp, .86, 1, E.out))) + '%)';
      apprRail.forEach(function(t, k){ t.classList.toggle('on', k <= i); });
    }
    var dp = seg(p, .8, .9, E.out);
    apprDone.style.opacity = dp; apprDone.style.transform = 'translateY(' + (-50 + 6 * (1 - dp)) + '%)';
    if (dp > 0) apprRail.forEach(function(t){ t.classList.add('on'); });
    if (apprBg) apprBg.style.transform = 'scale(' + (1.12 - .12 * p) + ')';
    var qi = Math.min(apprImgs.length - 1, Math.max(0, Math.floor(p / S))); if (qi !== apprCur) { apprCur = qi; apprImgs.forEach(function(im, k){ im.classList.toggle('on', k === qi); }); }
    if (qmark) qmark.style.transform = 'translateY(' + (-52 + (p - .5) * 30) + '%) translateX(' + ((tx / window.innerWidth - .5) * -40) + 'px) rotate(' + ((p - .5) * 10) + 'deg)';
  }

  /* ================================================================== 09 PROCESS — the line straightens */
  var procPin = $('procPin'), procRail = $('procRail'), procSteps = qsa('#procRail .step'), procPath = $('procPath'), procBar = $('procBar'), procIdx = $('procIdx');
  var JIT = []; for (var z = 0; z < 28; z++) { var f = Math.sin(z * 12.9898 + 4.1) * 43758.5453; f = f - Math.floor(f); JIT.push((f * 2 - 1) * 46); }
  var procActive = -1, procLastP = -1, procImgs = qsa('#procPic img'), procPicLab = $('procPicLab'), PROC_NAMES = ['DISCOVER','DEFINE','DESIGN','BUILD','CURATE','DELIVER'];
  function updateProc(vh){
    if (!procPin) return;
    var r = procPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var m = M(), railW = procRail.scrollWidth, maxS = Math.max(0, railW - (window.innerWidth - m * 2));
    var sp = seg(p, .04, .96, E.lin);
    procRail.style.transform = 'translate3d(' + (-maxS * sp) + 'px,0,0)';
    var act = Math.min(5, Math.floor(sp * 6.2));
    if (act !== procActive) { procActive = act; procSteps.forEach(function(s, i){ s.classList.toggle('on', i <= act); }); procIdx.textContent = '0' + (act + 1) + ' / 06'; procImgs.forEach(function(im, i){ im.classList.toggle('on', i === act); }); if (procPicLab) procPicLab.textContent = '0' + (act + 1) + ' / ' + PROC_NAMES[act]; }
    procBar.style.width = (p * 100) + '%';
    var st = E.out(clamp01((p - .02) / .9));
    if (Math.abs(st - procLastP) > .002) {
      procLastP = st;
      var pts = [], n = JIT.length;
      for (var i = 0; i < n; i++) pts.push([i * (1000 / (n - 1)), 60 + JIT[i] * (1 - st)]);
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var k = 1; k < n - 1; k++) { var mx = (pts[k][0] + pts[k+1][0]) / 2, my = (pts[k][1] + pts[k+1][1]) / 2; d += ' Q' + pts[k][0] + ' ' + pts[k][1] + ' ' + mx + ' ' + my; }
      d += ' L' + pts[n-1][0] + ' ' + pts[n-1][1];
      procPath.setAttribute('d', d);
    }
  }

  /* ================================================================== 12 FAQ */
  qsa('#faqList .qa').forEach(function(qa){
    qa.querySelector('.qh').addEventListener('click', function(){
      var open = qa.classList.contains('open');
      qsa('#faqList .qa.open').forEach(function(o){ o.classList.remove('open'); o.querySelector('.qh').setAttribute('aria-expanded', 'false'); });
      if (!open) { qa.classList.add('open'); qa.querySelector('.qh').setAttribute('aria-expanded', 'true'); }
    });
  });

  /* ================================================================== 13 CTA — back into the window */
  var ctaPin = $('ctaPin'), plate2 = $('plate2'), glass2 = $('glass2'), glow2 = $('glow2'), ctaVeil = $('ctaVeil'), ctaTx = $('ctaTx'), ctaIdx = $('ctaIdx'), glass2Img = qs('img', glass2), C2 = {};
  function layoutCta(){
    if (!ctaPin) return;
    var vw = window.innerWidth, vh = window.innerHeight; C2 = plateGeom(vw, vh);
    plate2.style.transform = 'translate(' + C2.px + 'px,' + C2.py + 'px) scale(' + C2.s + ')';
    glow2.style.left = (P.glass.x - 2) + 'px'; glow2.style.top = (P.glass.y - 2) + 'px'; glow2.style.width = (P.glass.w + 4) + 'px'; glow2.style.height = (P.glass.h + 4) + 'px';
    glass2.style.left = C2.gl.x + 'px'; glass2.style.top = C2.gl.y + 'px'; glass2.style.width = C2.gl.w + 'px'; glass2.style.height = C2.gl.h + 'px';
    glass2Img.style.width = C2.box.w + 'px'; glass2Img.style.height = C2.box.h + 'px'; glass2Img.style.left = '50%'; glass2Img.style.top = '50%';
  }
  function updateCta(vh){
    if (!ctaPin) return;
    var r = ctaPin.getBoundingClientRect();
    var p = clamp01(-r.top / (r.height - vh));
    var k = seg(p, .04, .72, E.expo);
    var sc = lerp(C2.sEnd * 1.06, 1, k);
    glass2.style.transform = 'scale(' + sc + ')';
    glass2Img.style.transform = 'translate(-50%,-50%) scale(' + lerp(1, 1.15, k) + ')';
    plate2.style.filter = 'blur(' + (5 * (1 - seg(p, .3, .72, E.out))) + 'px)';
    var on = seg(p, .6, .85, E.out);
    glow2.style.opacity = on;
    ctaVeil.style.opacity = seg(p, .5, .85, E.out) * .9;
    var tp = seg(p, .62, .9, E.out);
    ctaTx.style.opacity = tp; ctaTx.style.transform = 'translateY(' + (16 * (1 - tp)) + 'px)';
    ctaIdx.style.opacity = tp;
  }

  /* ================================================================== brand: "NN/" indexes + blurred ghost titles */
  qsa('.sec-idx > span, .index > span, .cta .idx > span').forEach(function(sp){ var m = /^(\d\d) — \d\d$/.exec(sp.textContent.trim()); if (m) { sp.textContent = m[1] + '/'; sp.classList.add('n'); } });
  qsa('.mega').forEach(function(el){ var g = document.createElement('div'); g.className = 'ghost-blur mega'; g.setAttribute('aria-hidden', 'true'); g.innerHTML = el.innerHTML.replace(/<span class="(?:ch|yc|yw)"[^>]*>/g, '<span>'); g.style.font = getComputedStyle(el).font; g.style.left = el.offsetLeft + 'px'; g.style.top = el.offsetTop + 'px'; g.style.width = el.offsetWidth + 'px'; el.parentNode.insertBefore(g, el); });

  /* ================================================================== footer wordmark fit */
  var wmk = $('wmk');
  function fitWmk(){ if (!wmk) return; wmk.style.fontSize = '100px'; var w = wmk.scrollWidth, cw = wmk.parentNode.clientWidth - M()*2; wmk.style.fontSize = (100 * cw / w * .995) + 'px'; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWmk); fitWmk();


  /* ================================================================== glass: fluted panels slide off with scroll; glass bar parallax */
  var flutes = qsa('.flute.sl'), gbar = $('gbar'), gbarHost = gbar ? gbar.parentNode : null;
  function updateGlass(vh){
    for (var i = 0; i < flutes.length; i++) {
      var r = flutes[i].parentNode.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) continue;
      var p = E.out(clamp01((vh * .62 - r.top) / (vh * .45)));
      flutes[i].style.setProperty('--fx', (p * (flutes[i].classList.contains('edge-l') ? -102 : 102)).toFixed(1) + '%');
    }
    if (gbar) { var g = gbarHost.getBoundingClientRect(); if (g.bottom > 0 && g.top < vh) { var c = (g.top + g.height / 2 - vh / 2) / vh; gbar.style.setProperty('--gy', (c * -.42 * g.height).toFixed(1) + 'px'); } }
  }
  /* ================================================================== header theme */
  var hdrTheme = null;
  function updateHdr(){
    var x = Math.round(window.innerWidth / 2), y = Math.round(parseFloat(getComputedStyle(hdr).height) / 2) + 1;
    var els = document.elementsFromPoint(x, y), dark = true;
    for (var i = 0; i < els.length; i++) { var el = els[i]; if (hdr.contains(el) || el === cur || cur.contains(el)) continue; var s = el.closest('.sec,.hero,.appr,.cta,.ftr'); if (s) { dark = s.classList.contains('dark') || !s.classList.contains('sec'); } break; }
    dark = true; if (dark !== hdrTheme) { hdrTheme = dark; hdr.classList.toggle('on-light', !dark); }
  }

  /* ================================================================== scroll loop */
  var running = false, lastY = -1, lastVH = 0, lastHy = -1;
  function onResize(){ layoutCta(); fitWmk(); lastY = -1; }
  function startScroll(){ if (running) return; running = true; layoutCta(); requestAnimationFrame(loop); }
  function loop(now){
    var y = window.scrollY || window.pageYOffset, vh = window.innerHeight;
    // hero parallax after the intro
    var hy = Math.min(y, vh);
    if (hy !== lastHy) { heroScroll(hy, vh); lastHy = hy; }
    smoothStep(); y = window.scrollY || window.pageYOffset;
    updateDial(vh); updateAbout(vh, now); updateAppr(vh); updateProc(vh); updateCta(vh); updateReads(vh); updatePx(vh); updateYode(vh); updateGlass(vh);
    if (y !== lastY || vh !== lastVH) { updateHdr(); updateChap(y, vh); }
    lastY = y; lastVH = vh;
    requestAnimationFrame(loop);
  }

  window.__intro = { vid: vid, reel: reel, T: T, finish: finish, state: state, G: function(){ return G; }, seek: function(t){ cancelAnimationFrame(raf); if (!preDone) { preDone = true; pre.classList.add('out'); veil.classList.add('off'); } if (t >= T.cut) { if (!state.cut) { try { reel.pause(); reel.currentTime = T.cut; } catch(e){} setTimeout(function(){ captureReel(); reel.classList.add('cut'); state.cut = true; state.gate = true; uploadVideo(); state.t = t; render(t); }, 400); } else { state.gate = true; uploadVideo(); state.t = t; render(t); } } else { try { reel.currentTime = t; } catch(e){} } }, slide: function(i){ showSlide(i); } };
})();
