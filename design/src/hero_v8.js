  /* ================================================================== plate geometry (1536 x 864 space; shared by hero + cta) */
  var P = {w:2851, h:1520,
    wide:{x:1400, y:524, w:330, h:452},                /* facade.jpg (real One Bennett Park, stitched from the night drone): the CI window glass */
    glass:{x:1400, y:524, w:330, h:452}};              /* same rect for the CTA bookend */
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

  /* ================================================================== 01 HERO INTRO v8 — WebGL (logo → facade → the window → inside) */
  var cvs=$('gl'), vid=$('vid'), logo=$('logo'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), cue=$('cue'), index=$('index'), row=$('row'),
      cur=$('cur'), heroIn=qs('.hero-in'), heroTitle=$('title'), stroke=$('stroke'), sideL=$('sideL'), sideR=$('sideR'), fallback=$('glFallback');
  var sq=$('sq'), ib=$('ib'), cMask=$('cMask'), tMask=$('tMask'), cF=$('cF'), tF=$('tF');
  var LOGO = {w:710, h:797, sq:{x:92, y:105, w:514, h:519}};
  var G = {}, state = {t:0, gate:false, videoReady:false, done:false, skipped:false, inside:0};
  var rowKids = row.children, mx = 0, my = 0, pmx = 0, pmy = 0;

  /* ---------- GL setup */
  var gl = cvs.getContext('webgl', {alpha:false, antialias:false, premultipliedAlpha:false, powerPreference:'high-performance'});
  var GLOK = !!gl;
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  var FS = [
  'precision highp float;varying vec2 v;',
  'uniform vec2 R;uniform float T;',
  'uniform sampler2D tW,tWb,tC,tCb,tV,tM;',
  'uniform vec4 rW,rC;',            /* glass rects in plate uv (x,y,w,h), y down */
  'uniform vec4 rS;',               /* window glass rect on screen, px, y down */
  'uniform vec4 rV;',               /* video plane rect on screen (16:9), px */
  'uniform vec4 fr;',               /* glow frame rect on screen, px */
  'uniform float mixC,blurW,blurC,fade,winOn,trace,glow,frameA,inside,dark,grain,vidA,vidZoom,lightsOff,zoomW,vidMix;',
  'uniform vec2 wc;',
  'uniform vec2 mo,head;uniform float headA;',
  'float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
  'vec2 plateUV(vec4 r,vec2 s){return vec2(r.x+(s.x-rS.x)/rS.z*r.z, r.y+(s.y-rS.y)/rS.w*r.w);}',   /* screen px → plate uv so that the plate glass lands on rS */
  'vec3 samp(sampler2D a,sampler2D b,vec2 uv,float bl){vec2 u=clamp(uv,0.001,0.999);vec3 s=texture2D(a,u).rgb;vec3 q=texture2D(b,u).rgb;return mix(s,q,bl);}',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'void main(){',
  '  vec2 s=vec2(v.x*R.x,(1.-v.y)*R.y);',                                     /* screen px, y down */
  '  vec2 par=mo*vec2(14.,10.);',
  '  vec2 uw=plateUV(rW,s+par*.6); uw=wc+(uw-wc)/zoomW;',
  '  vec3 cw=samp(tW,tWb,uw,blurW);',
  '  float m=texture2D(tM,clamp(uw,0.,1.)).r;',
  '  float lum=dot(cw,vec3(.3,.59,.11));',
  '  vec3 off=vec3(lum*.10)+vec3(.015,.022,.04);',                               /* lights off: dark glass with a cold cast */
  '  vec3 fac=mix(cw*1.28,off,m*lightsOff);',
  /* interior video mapped to the glass rect (cover), with its own parallax */
  '  vec2 q=(s-rS.xy)/rS.zw;',                                                   /* 0..1 inside the glass */
  '  vec2 vq=(s+par*1.6-rV.xy)/rV.zw; vq=(vq-.5)/vidZoom+.5;',
  '  vec3 vc=texture2D(tV,clamp(vq,0.,1.)).rgb;',
  '  float inG=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);',
  '  vec3 real=cw*1.05;',                                                          /* the real lit interior behind the CI window */
  '  vec3 lit=mix(real, mix(vc*vec3(1.02,.98,.92), real, .14), vidMix*vidA);',
  '  vec3 col=mix(fac, mix(fac,lit,winOn), inG);',
  '  col=mix(col, vc, inside);',
  /* glow frame (SDF of fr), with the running trace along the perimeter */
  '  vec2 fc=fr.xy+fr.zw*.5; vec2 fh=fr.zw*.5;',
  '  float d=abs(sdBox(s-fc,fh));',
  '  vec2 rp=s-fc; float per=2.*(fr.z+fr.w);',
  '  float a=0.; vec2 n=rp/max(fh,vec2(1.));',
  '  if(abs(n.y)>abs(n.x)){ if(n.y<0.) a=(rp.x+fh.x); else a=fr.z+fr.w+(fh.x-rp.x); }',
  '  else { if(n.x>0.) a=fr.z+(rp.y+fh.y); else a=2.*fr.z+fr.w+(fh.y-rp.y); }',
  '  a/=per; float on=step(a,trace);',
  '  float core=smoothstep(1.6,0.,d)*on; float halo=exp(-d*d/(2.*pow(10.+glow*14.,2.)))*on;',
  '  vec3 warm=vec3(1.,.86,.62);',
  '  col+=warm*(core*1.1+halo*(.55+.45*glow))*frameA;',
  '  float hd=length(s-head); col+=warm*exp(-hd*hd/900.)*headA*1.4+vec3(1.)*exp(-hd*hd/60.)*headA;',
  /* vignette, darkening, grain, fade from black */
  '  vec2 cuv=v-.5; float vig=1.-dot(cuv*vec2(1.,R.y/R.x*1.3),cuv*vec2(1.,R.y/R.x*1.3))*.9;',
  '  col*=mix(1.,clamp(vig,0.,1.),.55);',
  '  col*=1.-smoothstep(.5,1.,1.-v.y)*.42*inside-smoothstep(.85,1.,v.y)*.3*inside;',           /* legibility: darker bottom + top when inside */
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
    ['R','T','tW','tWb','tC','tCb','tV','tM','rW','rC','rS','rV','fr','lightsOff','zoomW','vidMix','wc','mixC','blurW','blurC','fade','winOn','trace','glow','frameA','inside','dark','grain','vidA','vidZoom','mo','head','headA','vidAsp'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });
    for (var ui = 0; ui < 6; ui++) TEX[ui] = mkTex(ui);
    gl.uniform1i(U.tW, 0); gl.uniform1i(U.tWb, 1); gl.uniform1i(U.tC, 2); gl.uniform1i(U.tCb, 3); gl.uniform1i(U.tV, 4); gl.uniform1i(U.tM, 5);
    gl.uniform2f(U.wc, (P.wide.x + P.wide.w / 2) / P.w, (P.wide.y + P.wide.h / 2) / P.h);
    gl.uniform4f(U.rW, P.wide.x / P.w, P.wide.y / P.h, P.wide.w / P.w, P.wide.h / P.h);
    gl.uniform4f(U.rC, P.glass.x / P.w, P.glass.y / P.h, P.glass.w / P.w, P.glass.h / P.h);
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

  /* ---------- geometry */
  function layout(){
    var vw = window.innerWidth, vh = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    G = plateGeom(vw, vh); G.vw = vw; G.vh = vh;
    /* facade placement: the CI window sits at the screen centre; scale = the smallest that still covers the viewport */
    var wcx = P.wide.x + P.wide.w / 2, wcy = P.wide.y + P.wide.h / 2;
    var s0 = Math.max(vw / (2 * Math.min(wcx, P.w - wcx)), vh / (2 * Math.min(wcy, P.h - wcy)), vw / P.w, vh / P.h);
    var c = {s:s0, px:vw / 2 - wcx * s0, py:vh / 2 - wcy * s0};
    G.R0 = mapRect(c, P.wide);                                   /* the CI window glass on screen at zoom 1 */
    G.cov = c;
    var k = G.R0.h / LOGO.sq.h;                                  /* logo: its square is exactly as tall as the window glass, centred on it */
    G.lk = k; G.lsq = {w:LOGO.sq.w * k, h:LOGO.sq.h * k}; G.lsq.x = G.R0.x + G.R0.w / 2 - G.lsq.w / 2; G.lsq.y = G.R0.y + G.R0.h / 2 - G.lsq.h / 2;
    logo.style.transform = 'translate(' + (G.lsq.x - LOGO.sq.x * k) + 'px,' + (G.lsq.y - LOGO.sq.y * k) + 'px) scale(' + k + ')';
    /* end rect: the glass grows past the viewport so we are inside */
    var sEnd = Math.max(vw / G.R0.w, vh / G.R0.h) * 1.12;
    G.REnd = {w:G.R0.w * sEnd, h:G.R0.h * sEnd}; G.REnd.x = (vw - G.REnd.w) / 2; G.REnd.y = (vh - G.REnd.h) / 2;
    /* video plane: 16:9 around the dark window at the start, viewport cover at the end */
    var v0h = Math.max(G.R0.h, G.R0.w * 9 / 16) * 1.35, v0w = v0h * 16 / 9;
    G.V0 = {w:v0w, h:v0h, x:G.R0.x + G.R0.w / 2 - v0w / 2, y:G.R0.y + G.R0.h / 2 - v0h / 2};
    var ve = Math.max(vw / 16, vh / 9) * 1.04; G.VEnd = {w:ve * 16, h:ve * 9}; G.VEnd.x = (vw - G.VEnd.w) / 2; G.VEnd.y = (vh - G.VEnd.h) / 2;
    if (GLOK) { cvs.width = Math.round(vw * dpr); cvs.height = Math.round(vh * dpr); gl.viewport(0, 0, cvs.width, cvs.height); gl.uniform2f(U.R, vw, vh); }
    G.dpr = dpr;
  }
  function mixRect(a, b, p){ return {x:lerp(a.x, b.x, p), y:lerp(a.y, b.y, p), w:lerp(a.w, b.w, p), h:lerp(a.h, b.h, p)}; }
  function zoomRect(a, b, p){ /* log-interpolated size, centre interpolated */ var s = Math.exp(lerp(Math.log(a.w), Math.log(b.w), p)) / a.w; var cx = lerp(a.x + a.w/2, b.x + b.w/2, p), cy = lerp(a.y + a.h/2, b.y + b.h/2, p); return {x:cx - a.w*s/2, y:cy - a.h*s/2, w:a.w*s, h:a.h*s}; }
  function perimPoint(r, t){ var per = 2 * (r.w + r.h), d = t * per; if (d < r.w) return [r.x + d, r.y]; d -= r.w; if (d < r.h) return [r.x + r.w, r.y + d]; d -= r.h; if (d < r.w) return [r.x + r.w - d, r.y + r.h]; d -= r.w; return [r.x, r.y + r.h - d]; }

  var L = {sq: sq.getTotalLength(), ib: ib.getTotalLength(), c: cMask.getTotalLength()};
  function dash(el, len, p){ el.style.strokeDasharray = len; el.style.strokeDashoffset = len * (1 - p); }
  var T = {
    sqStart:.25, sqEnd:1.25, cStart:.95, cEnd:1.75, iStart:1.55, iEnd:1.95, tStart:1.9, tEnd:2.6, cntEnd:2.7,
    bgIn:2.0, bgFull:3.5, sharp:2.3, sharpEnd:3.8,
    lettersOut:3.3, lettersGone:3.9, sqOut:3.6, sqGone:4.0, frIn:3.45, frFull:3.8,
    tightStart:3.7, tightEnd:4.3, traceStart:3.65, traceEnd:5.15, bloom:5.1, bloomEnd:5.7,
    winOn:5.35, winFull:6.05, pushStart:6.05, pushEnd:7.85, vmStart:6.3, vmEnd:7.0, frOut:7.0, frGone:7.5,
    sideIn:5.55, sideFull:6.2, uiStart:7.45, uiEnd:8.45, end:8.7
  };
  var short = false; try { short = sessionStorage.getItem('ci-intro-v4') === '1'; } catch(e){}

  var UN = {};
  function render(t){
    var vw = G.vw, vh = G.vh;
    /* logo drawing (SVG) */
    dash(sq, L.sq, seg(t, T.sqStart, T.sqEnd, E.expo)); dash(cMask, L.c, seg(t, T.cStart, T.cEnd, E.expo)); dash(ib, L.ib, seg(t, T.iStart, T.iEnd, E.out));
    tMask.setAttribute('width', 560 * seg(t, T.tStart, T.tEnd, E.out));
    var lo = 1 - seg(t, T.lettersOut, T.lettersGone, E.expo); cF.style.opacity = lo; ib.style.opacity = lo; tF.style.opacity = lo;
    sq.style.opacity = 1 - seg(t, T.sqOut, T.sqGone, E.expo);
    var c = Math.round(100 * seg(t, T.sqStart, T.cntEnd, E.lin)); cnt.textContent = (c < 10 ? '0' : '') + c;
    pre.style.opacity = 1 - seg(t, T.bgFull, T.bgFull + .5, E.out);
    /* background: fades in from black, blurred → sharp, settling from a slow zoom */
    var fade = seg(t, T.bgIn, T.bgFull, E.out);
    var blurW = 1 - seg(t, T.sharp, T.sharpEnd, E.out);
    var zoomW = 1.16 - .16 * seg(t, T.bgIn, T.sharpEnd + .2, E.out);
    /* the frame = the logo square, which tightens onto the window glass while the light runs round it */
    var mv = seg(t, T.tightStart, T.tightEnd, E.out);
    var frRect = mixRect(G.lsq, G.R0, mv);
    var trace = seg(t, T.traceStart, T.traceEnd, E.lin);
    var frameA = seg(t, T.frIn, T.frFull, E.out) * (1 - seg(t, T.frOut, T.frGone, E.out));
    var bloom = seg(t, T.bloom, T.bloom + .25, E.out) * (1 - seg(t, T.bloom + .25, T.bloomEnd + .4, E.out));
    /* push: the glass rect grows from R0 past the viewport */
    var pu = seg(t, T.pushStart, T.pushEnd, E.push);
    var RS = zoomRect(G.R0, G.REnd, pu), RV = zoomRect(G.V0, G.VEnd, pu);
    if (mv < 1) { /* before the push the glass rect is the dark window (the frame still travelling) */ }
    var frameRect = pu > 0 ? RS : frRect;
    var xf = 0;
    var winOn = seg(t, T.winOn, T.winFull, E.out);
    var inside = seg(t, T.pushEnd - .15, T.pushEnd + .05, E.out);
    state.inside = inside;
    /* head of the trace */
    var hp = perimPoint(frRect, trace % 1), headA = (trace > 0 && trace < 1) ? 1 : 0;
    UN.fade = fade; UN.blurW = blurW; UN.blurC = 0; UN.mixC = 0; UN.winOn = winOn; UN.trace = trace; UN.glow = bloom; UN.frameA = frameA; UN.inside = inside;
    UN.zoomW = zoomW; UN.lightsOff = 1; UN.vidMix = seg(t, T.vmStart, T.vmEnd, E.out);
    UN.fr = frameRect; UN.rS = pu > 0 ? RS : G.R0; UN.rV = pu > 0 ? RV : G.V0; UN.head = hp; UN.headA = headA * frameA; UN.vidA = 1; UN.vidZoom = 1.0;
    UN.blurW = Math.max(blurW, seg(t, T.pushStart + .5, T.pushEnd, E.out) * .75);
    /* side wordmarks + ui */
    var sd = seg(t, T.sideIn, T.sideFull, E.out);
    sideL.style.opacity = sd; sideR.style.opacity = sd; sideL.style.transform = 'translateY(' + (10 * (1 - sd)) + 'px)'; sideR.style.transform = 'translateY(' + (10 * (1 - sd)) + 'px)';
    var u = seg(t, T.uiStart, T.uiEnd, E.out);
    hdr.style.opacity = u; hdr.style.transform = 'translateY(' + (-(1 - u) * 20) + 'px)';
    heroTitle.classList.toggle('in', t >= T.uiStart);
    for (var j = 0; j < rowKids.length; j++) { var rp2 = seg(t, T.uiStart + .45 + j*.08, T.uiEnd + .35 + j*.08, E.out); rowKids[j].style.opacity = rp2; rowKids[j].style.transform = 'translateY(' + (12 * (1 - rp2)) + 'px)'; }
    var ip = seg(t, T.uiStart + .2, T.uiEnd + .2, E.out);
    index.style.opacity = ip; index.style.transform = 'translateY(' + (8*(1-ip)) + 'px)';
    cue.style.opacity = ip; cue.style.transform = 'translateY(' + (8*(1-ip)) + 'px)';
    if (stroke) stroke.style.transform = 'scaleX(' + seg(t, T.uiStart + .3, T.uiEnd + .5, E.expo) + ')';
    if (!state.done) skip.style.opacity = (t > T.bgFull ? 1 : 0) * (1 - seg(t, T.uiStart, T.uiStart + .3, E.out));
    draw();
  }
  var darkU = 0;
  function draw(){
    if (!GLOK) return;
    gl.uniform1f(U.T, performance.now() / 1000);
    gl.uniform1f(U.fade, UN.fade || 0); gl.uniform1f(U.blurW, UN.blurW == null ? 1 : UN.blurW); gl.uniform1f(U.blurC, UN.blurC || 0); gl.uniform1f(U.mixC, UN.mixC || 0);
    gl.uniform1f(U.winOn, UN.winOn || 0); gl.uniform1f(U.trace, UN.trace || 0); gl.uniform1f(U.glow, UN.glow || 0); gl.uniform1f(U.frameA, UN.frameA || 0); gl.uniform1f(U.inside, UN.inside || 0);
    gl.uniform1f(U.dark, darkU); gl.uniform1f(U.grain, .035); gl.uniform1f(U.lightsOff, UN.lightsOff == null ? 1 : UN.lightsOff); gl.uniform1f(U.zoomW, UN.zoomW || 1); gl.uniform1f(U.vidMix, UN.vidMix == null ? 1 : UN.vidMix); gl.uniform1f(U.vidA, vidTexOK ? (UN.vidA || 0) : 0); gl.uniform1f(U.vidZoom, UN.vidZoom || 1);
    var f = UN.fr || {x:0,y:0,w:0,h:0}, r = UN.rS || {x:0,y:0,w:1,h:1};
    gl.uniform4f(U.fr, f.x, f.y, f.w, f.h); gl.uniform4f(U.rS, r.x, r.y, r.w, r.h); var rv = UN.rV || r; gl.uniform4f(U.rV, rv.x, rv.y, rv.w, rv.h);
    gl.uniform2f(U.mo, pmx, pmy); var h = UN.head || [-999,-999]; gl.uniform2f(U.head, h[0], h[1]); gl.uniform1f(U.headA, UN.headA || 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function markReady(){ state.videoReady = true; }
  vid.addEventListener('canplaythrough', markReady); vid.addEventListener('canplay', markReady);
  function startVideo(){ var pr = vid.play(); if (pr && pr.catch) pr.catch(function(){}); }
  (function(){ var big = window.innerWidth >= 900 && GLOK; var s = $('vsrc'); s.src = big ? 'assets/night/int_night_1080.mp4' : 'assets/night/int_night_720.mp4'; vid.load(); })();

  var t0 = null, raf = null, hold = 0, lastNow = null, maxHold = 5;
  function tick(now){
    if (t0 === null) { t0 = now; lastNow = now; }
    var dt = (now - lastNow) / 1000; lastNow = now;
    var t = (now - t0) / 1000 - hold;
    if (!state.gate && t >= T.winOn - .05) {
      if ((state.videoReady || vid.readyState >= 3) && texLoaded >= TEXN || hold >= maxHold) { state.gate = true; startVideo(); }
      else { hold += dt; t = T.winOn - .05; }
    }
    if (t < T.bgIn && texLoaded < TEXN && t > T.bgIn - .05) { /* wait for plates before the facade appears */ hold += dt; t = T.bgIn - .05; }
    pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06;
    if (state.gate) uploadVideo();
    state.t = t; render(t);
    if (t < T.end) raf = requestAnimationFrame(tick); else finish();
  }
  function finish(){
    if (state.done) return; state.done = true; cancelAnimationFrame(raf);
    render(T.end + 1);
    document.body.classList.add('ready'); document.body.classList.remove('is-intro');
    skip.style.opacity = 0; skip.style.pointerEvents = 'none';
    pre.style.display = 'none'; logo.style.display = 'none';
    try { sessionStorage.setItem('ci-intro-v4', '1'); } catch(e){}
    startScroll();
  }
  function skipIntro(){
    if (state.done || state.skipped) return; state.skipped = true;
    cancelAnimationFrame(raf); state.gate = true; startVideo();
    var start = performance.now(), from = state.t;
    (function f(now){ var p = clamp01((now - start) / 900); uploadVideo(); render(lerp(Math.max(from, T.pushStart), T.end, E.expo(p))); if (p < 1) requestAnimationFrame(f); else finish(); })(start);
  }
  skip.addEventListener('click', skipIntro);
  window.addEventListener('keydown', function(e){ if (!state.done && (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); skipIntro(); } });

  /* ================================================================== cursor + mouse parallax */
  var cx = 0, cy = 0, tx = 0, ty = 0, curLab = qs('.cl', cur);
  window.addEventListener('pointermove', function(e){ tx = e.clientX; ty = e.clientY; mx = (e.clientX / window.innerWidth - .5); my = (e.clientY / window.innerHeight - .5); });
  (function curLoop(){ cx += (tx - cx) * .6; cy += (ty - cy) * .6; cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(curLoop); })();
  document.addEventListener('pointerover', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw'); if (t) cur.classList.add('link'); });
  document.addEventListener('pointerout', function(e){ var t = e.target.closest('a,button,.qh,.tab,.sw'); if (t) cur.classList.remove('link'); });

  layout();
  window.addEventListener('resize', function(){ layout(); render(state.done ? T.end + 1 : state.t); onResize(); });
  render(0);
  function go(){
    if (!GLOK) { /* fallback: plain video */ fallback.classList.add('on'); state.gate = true; startVideo(); finish(); return; }
    if (reduced) { state.gate = true; startVideo(); finish(); return; }
    if (short) { for (var k in T) T[k] = Math.round(T[k] * 55) / 100; }
    raf = requestAnimationFrame(tick);
  }
  go();
