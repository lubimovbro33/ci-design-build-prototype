  /* ================================================================== plate geometry (CTA bookend only — 2D) */
  var P = {w:2851, h:1520, glass:{x:1400, y:524, w:330, h:452}};
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

  /* ================================================================== 01 HERO v10 — a 3D scene in one shader
     world units = facade pixels (the real One Bennett facade tile 2000×786 px, repeated); y down, z towards the camera.
     front face: plane z = 0, x < XR; side face: plane x = XR, z < 0. CI window = WIN (tile 0). */
  var cvs=$('gl'), vid=$('vid'), logo=$('logo'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), cue=$('cue'), index=$('index'), row=$('row'),
      cur=$('cur'), heroIn=qs('.hero-in'), heroTitle=$('title'), stroke=$('stroke'), sideL=$('sideL'), sideR=$('sideR'), fallback=$('glFallback');
  var sq=$('sq'), ib=$('ib'), cMask=$('cMask'), tMask=$('tMask'), cF=$('cF'), tF=$('tF');
  var LOGO = {w:710, h:797, sq:{x:92, y:105, w:514, h:519}};
  var TILE = {w:2000, h:786}, WIN = {x:970, y:262, w:330, h:452}, WC = {x:WIN.x + WIN.w/2, y:WIN.y + WIN.h/2}, XR = WC.x + 2300, XL = WC.x - 3100, YTOP = WIN.y - 262 - 3 * 786, ZD = 6500, FOC = 1.3;
  var G = {}, state = {t:0, gate:false, videoReady:false, done:false, skipped:false, inside:0};
  var rowKids = row.children, mx = 0, my = 0, pmx = 0, pmy = 0;

  /* ---------- GL */
  var gl = cvs.getContext('webgl', {alpha:false, antialias:false, premultipliedAlpha:false, powerPreference:'high-performance'});
  var GLOK = !!gl, aniso = null;
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  var FS = [
  'precision highp float;varying vec2 v;',
  'uniform vec2 R;uniform float T;',
  'uniform sampler2D tF,tFb,tM,tV,tS;',
  'uniform vec3 cam,tgt;uniform float f,XR,XL,YTOP,ZD;uniform vec2 tile,mo;uniform vec4 win,vidR,rVs,fr;',
  'uniform float blur,lightsOff,winOn,vidMix,vidA,inside,fade,dark,grain,trace,trace0,glow,frameA,headA,sideSh;uniform vec2 head;',
  'float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'vec3 samp(vec2 uv,float bl){vec3 a=texture2D(tF,uv).rgb;vec3 b=texture2D(tFb,uv).rgb;return mix(a,b,bl);}',
  'void main(){',
  '  vec2 s=vec2(v.x*R.x,(1.-v.y)*R.y);',
  '  vec2 p=(s-R*.5)/R.x;',
  '  vec3 F=normalize(tgt-cam); vec3 Rt=normalize(cross(vec3(0.,-1.,0.),F)); vec3 Dn=cross(Rt,F);',
  '  vec3 d=normalize(F*f+Rt*p.x+Dn*p.y);',
  '  vec3 col=vec3(0.); float m=0.; float inG=0.; vec2 hp=vec2(0.); float hit=0.; float dist=1e9;',
  '  if(d.z<0.){ float tf=-cam.z/d.z; vec3 h=cam+tf*d; if(h.x<=XR && h.x>=XL && h.y>=YTOP){ hit=1.; hp=h.xy; dist=tf; } }',
  '  if(hit<.5 && cam.x>XR && d.x<0.){ float ts=(XR-cam.x)/d.x; vec3 h=cam+ts*d; if(h.z<=0. && h.z>=-ZD && h.y>=YTOP){ hit=2.; hp=vec2(-h.z+XR,h.y); dist=ts; } }',
  '  if(hit<.5 && cam.y<YTOP && d.y>0.){ float tr=(YTOP-cam.y)/d.y; vec3 h=cam+tr*d; if(h.x<=XR && h.x>=XL && h.z<=0. && h.z>=-ZD){ hit=3.; hp=h.xz; dist=tr; } }',
  '  if(hit>2.5){',
  '    float edge=max(step(XR-70.,hp.x),step(-70.,hp.y));',                       /* parapet strip */
  '    col=mix(vec3(.055,.055,.06),vec3(.16,.15,.14),edge)*(.8+.2*hash(floor(hp*.02)));',
  '    col=mix(col,vec3(.02,.03,.05),clamp(dist/26000.,0.,.45));',
  '  } else if(hit>.5){',
  '    vec2 uv=vec2(fract(hp.x/tile.x),fract(hp.y/tile.y));',
  '    vec3 c=samp(uv,blur); m=texture2D(tM,uv).r;',
  '    float lum=dot(c,vec3(.3,.59,.11)); vec3 off=vec3(lum*.10)+vec3(.015,.022,.04);',
  '    vec3 fac=mix(c*vec3(1.5,1.56,1.66),off,m*lightsOff);',
  '    if(hit<1.5){',
  '      inG=step(win.x,hp.x)*step(hp.x,win.x+win.z)*step(win.y,hp.y)*step(hp.y,win.y+win.w);',
  '      vec2 vq=(hp-vidR.xy)/vidR.zw; vec3 vc=texture2D(tV,clamp(vq,0.,1.)).rgb;',
  '      vec3 real=c*1.05; vec3 lit=mix(real,mix(vc*vec3(1.02,.98,.92),real,.14),vidMix*vidA);',
  '      fac=mix(fac,lit,winOn*inG);',
  '    } else fac*=sideSh;',
  '    col=fac;',
  '    col=mix(col,vec3(.03,.04,.07),clamp(dist/30000.,0.,.35));',                /* atmospheric depth */
  '  } else {',
  '    vec2 su=vec2(clamp(.5+d.x*.85,0.,1.),clamp(.47+d.y*1.1,0.,1.));',
  '    col=texture2D(tS,su).rgb;',
  '  }',
  /* inside: the full-screen video */
  '  vec2 q2=(s+mo*vec2(14.,10.)-rVs.xy)/rVs.zw; vec3 vfull=texture2D(tV,clamp(q2,0.,1.)).rgb;',
  '  col=mix(col,vfull,inside);',
  /* glow frame (screen space), clockwise from trace0 */
  '  vec2 fc=fr.xy+fr.zw*.5; vec2 fh=fr.zw*.5;',
  '  float dd=abs(sdBox(s-fc,fh));',
  '  vec2 rp=s-fc; float per=2.*(fr.z+fr.w); float a=0.; vec2 n=rp/max(fh,vec2(1.));',
  '  if(abs(n.y)>abs(n.x)){ if(n.y<0.) a=(rp.x+fh.x); else a=fr.z+fr.w+(fh.x-rp.x); }',
  '  else { if(n.x>0.) a=fr.z+(rp.y+fh.y); else a=2.*fr.z+fr.w+(fh.y-rp.y); }',
  '  a=fract(a/per-trace0); float on=step(a,trace);',
  '  float core=smoothstep(1.6,0.,dd)*on; float halo=exp(-dd*dd/(2.*pow(10.+glow*14.,2.)))*on;',
  '  vec3 warm=vec3(1.,.86,.62);',
  '  col+=warm*(core*1.1+halo*(.55+.45*glow))*frameA;',
  '  float hd=length(s-head); col+=warm*exp(-hd*hd/900.)*headA*1.4+vec3(1.)*exp(-hd*hd/60.)*headA;',
  /* vignette, darkening, legibility, grain, fade */
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
  function mkTex(unit, repeat){ var t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); var wr = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE; gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wr); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wr); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([12,14,18])); return t; }
  function loadTex(unit, src, mip, cb){ var im = new Image(); im.onload = function(){ gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, TEX[unit]); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); if (mip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8); } cb && cb(); }; im.onerror = function(){ cb && cb(); }; im.src = src; }
  if (GLOK) {
    aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    prog = gl.createProgram(); gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); GLOK = false; }
  }
  if (GLOK) {
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['R','T','tF','tFb','tM','tV','tS','cam','tgt','f','XR','XL','YTOP','ZD','tile','mo','win','vidR','rVs','fr','blur','lightsOff','winOn','vidMix','vidA','inside','fade','dark','grain','trace','trace0','glow','frameA','headA','sideSh','head'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });
    TEX[0] = mkTex(0, true); TEX[1] = mkTex(1, true); TEX[2] = mkTex(2, true); TEX[3] = mkTex(3, false); TEX[4] = mkTex(4, false);
    gl.uniform1i(U.tF, 0); gl.uniform1i(U.tFb, 1); gl.uniform1i(U.tM, 2); gl.uniform1i(U.tV, 3); gl.uniform1i(U.tS, 4);
    gl.uniform1f(U.f, FOC); gl.uniform1f(U.XR, XR); gl.uniform1f(U.XL, XL); gl.uniform1f(U.YTOP, YTOP); gl.uniform1f(U.ZD, ZD); gl.uniform2f(U.tile, TILE.w, TILE.h);
    gl.uniform4f(U.win, WIN.x, WIN.y, WIN.w, WIN.h);
    var vw0 = WIN.h * 16 / 9 * 1.3, vh0 = WIN.h * 1.3; gl.uniform4f(U.vidR, WC.x - vw0 / 2, WC.y - vh0 / 2, vw0, vh0);
    gl.uniform1f(U.sideSh, .72);
    /* the trace starts at the logo's gap (right edge, 92 % down) and runs clockwise, like the square itself */
    gl.uniform1f(U.trace0, (514 + .918 * 519) / (2 * (514 + 519)));
  }
  var texLoaded = 0, TEXN = 4;
  function texDone(){ texLoaded++; }
  if (GLOK) { loadTex(0, 'assets/night/tile.jpg', true, texDone); loadTex(1, 'assets/night/tile_blur.jpg', true, texDone); loadTex(2, 'assets/night/tile_mask.png', true, texDone); loadTex(4, 'assets/night/sky.jpg', false, texDone); }
  var vidTexOK = false;
  function uploadVideo(){
    if (!GLOK || vid.readyState < 2) return;
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, TEX[3]);
    try { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid); vidTexOK = true; } catch(e){}
  }

  /* ---------- geometry */
  function layout(){
    var vw = window.innerWidth, vh = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    G = plateGeom(vw, vh); G.vw = vw; G.vh = vh; G.dpr = dpr;
    /* the frontal camera distance that makes the CI window 30 % of the viewport height (but never wider than 34 % of the width) */
    var hT = Math.min(vh * .30, vw * .34 * WIN.h / WIN.w);
    G.Dend = WIN.h * FOC * vw / hT;
    /* the distance where the window glass covers the viewport ×1.12 */
    G.Din = Math.min(WIN.h * FOC * vw / (vh * 1.12), WIN.w * FOC * vw / (vw * 1.12));
    G.R0 = projRect(WC.x, WC.y, G.Dend);
    var k = G.R0.h / LOGO.sq.h;
    G.lk = k; G.lsq = {w:LOGO.sq.w * k, h:LOGO.sq.h * k}; G.lsq.x = G.R0.x + G.R0.w / 2 - G.lsq.w / 2; G.lsq.y = G.R0.y + G.R0.h / 2 - G.lsq.h / 2;
    logo.style.transform = 'translate(' + (G.lsq.x - LOGO.sq.x * k) + 'px,' + (G.lsq.y - LOGO.sq.y * k) + 'px) scale(' + k + ')';
    var ve = Math.max(vw / 16, vh / 9) * 1.04; G.VEnd = {w:ve * 16, h:ve * 9}; G.VEnd.x = (vw - G.VEnd.w) / 2; G.VEnd.y = (vh - G.VEnd.h) / 2;
    if (GLOK) { cvs.width = Math.round(vw * dpr); cvs.height = Math.round(vh * dpr); gl.viewport(0, 0, cvs.width, cvs.height); gl.uniform2f(U.R, vw, vh); }
  }
  /* projection of the CI window for a frontal camera at (cx, cy, D) looking straight at the facade */
  function projRect(cx, cy, D){ var vw = G.vw, vh = G.vh, k = FOC * vw / D; return {x:vw / 2 + (WIN.x - cx) * k, y:vh / 2 + (WIN.y - cy) * k, w:WIN.w * k, h:WIN.h * k}; }
  function mixRect(a, b, p){ return {x:lerp(a.x, b.x, p), y:lerp(a.y, b.y, p), w:lerp(a.w, b.w, p), h:lerp(a.h, b.h, p)}; }
  function perimPoint(r, t){ t = t - Math.floor(t); var per = 2 * (r.w + r.h), d = t * per; if (d < r.w) return [r.x + d, r.y]; d -= r.w; if (d < r.h) return [r.x + r.w, r.y + d]; d -= r.h; if (d < r.w) return [r.x + r.w - d, r.y + r.h]; d -= r.w; return [r.x, r.y + r.h - d]; }

  var L = {sq: sq.getTotalLength(), ib: ib.getTotalLength(), c: cMask.getTotalLength()};
  function dash(el, len, p){ el.style.strokeDasharray = len; el.style.strokeDashoffset = len * (1 - p); }
  function erase(el, len, p){ el.style.strokeDasharray = '0 ' + (p * len) + ' ' + len; el.style.strokeDashoffset = 0; }   /* disappears from the start of the path onwards */
  var T = {
    aIn:.2, aFull:1.6, cntEnd:4.4,
    flyStart:1.3, flyEnd:4.9,
    sqStart:4.5, sqEnd:5.5, cStart:5.2, cEnd:6.0, iStart:5.8, iEnd:6.2, tStart:6.15, tEnd:6.8,
    lettersOut:7.0, lettersGone:7.5, sweepStart:7.05, sweepEnd:8.35, tightStart:7.0, tightEnd:7.6, bloom:8.35, bloomEnd:8.95,
    winOn:8.6, winFull:9.3, pushStart:9.3, pushEnd:11.1, vmStart:9.55, vmEnd:10.25, frOut:10.25, frGone:10.75,
    sideIn:8.8, sideFull:9.45, uiStart:10.7, uiEnd:11.7, end:11.95
  };
  var short = false; try { short = sessionStorage.getItem('ci-intro-v5') === '1'; } catch(e){}

  var UN = {};
  function camAt(t){
    /* the drone: starts high above the roof, to the right and far; swings round the corner ("like an arrow") and settles square to the CI window; then the dolly in */
    var fly = seg(t, T.flyStart, T.flyEnd, E.push), flyR = seg(t, T.flyStart - .2, T.flyEnd + .1, E.out);
    var phi = (1 - fly) * 1.0;                                        /* 57° → 0 */
    var r = lerp(G.Dend * 5.2, G.Dend, seg(t, T.flyStart + .5, T.flyEnd + .25, E.push));
    var y = lerp(YTOP - 2400, WC.y, seg(t, T.flyStart + .2, T.flyEnd + .1, E.push)) + Math.sin(t * 1.7) * 18 * (1 - fly);
    var pu = seg(t, T.pushStart, T.pushEnd, E.push);
    var D = Math.exp(lerp(Math.log(r), Math.log(G.Din), pu));
    var cx = WC.x + Math.sin(phi) * D + pmx * 60 * (1 - pu), cz = Math.cos(phi) * D;
    var drift = (t < T.flyStart) ? Math.sin(t * .9) * 60 : 0;
    return {cam:[cx + drift, y + pmy * 40 * (1 - pu), cz], tgt:[WC.x, WC.y, 0], D:D, fly:fly, pu:pu};
  }
  function render(t){
    var vw = G.vw, vh = G.vh;
    var C = camAt(t);
    /* act 1: fade in from black + blur, the counter */
    var aIn = seg(t, T.aIn, T.aFull, E.out);
    var c = Math.round(100 * seg(t, T.aIn, T.cntEnd, E.lin)); cnt.textContent = (c < 10 ? '0' : '') + c;
    pre.style.opacity = 1 - seg(t, T.cntEnd, T.cntEnd + .5, E.out);
    /* motion blur while the camera swings fast */
    var flyV = Math.sin(seg(t, T.flyStart, T.flyEnd, E.lin) * Math.PI);
    var blur = Math.max(1 - seg(t, T.aIn + .2, T.aFull + .4, E.out), flyV * .55, seg(t, T.pushStart + .6, T.pushEnd, E.out) * .75);
    /* the frontal projection of the window at the current distance (valid once the camera is frontal) */
    var RS = projRect(C.cam[0] - pmx * 60 * (1 - C.pu), C.cam[1] - pmy * 40 * (1 - C.pu), C.D);
    /* logo: draws clockwise, then erases clockwise while the glow sweeps behind it */
    dash(sq, L.sq, seg(t, T.sqStart, T.sqEnd, E.expo)); dash(cMask, L.c, seg(t, T.cStart, T.cEnd, E.expo)); dash(ib, L.ib, seg(t, T.iStart, T.iEnd, E.out));
    tMask.setAttribute('width', 560 * seg(t, T.tStart, T.tEnd, E.out));
    var lo = 1 - seg(t, T.lettersOut, T.lettersGone, E.expo); cF.style.opacity = lo; ib.style.opacity = lo; tF.style.opacity = lo;
    var sweep = seg(t, T.sweepStart, T.sweepEnd, E.expo);
    if (sweep > 0) erase(sq, L.sq, sweep); sq.style.opacity = sweep < 1 ? 1 : 0;
    var tight = seg(t, T.tightStart, T.tightEnd, E.out);
    var frRect = mixRect(G.lsq, RS, Math.max(tight, C.pu > 0 ? 1 : 0));
    var frameA = (t >= T.sweepStart ? 1 : 0) * (1 - seg(t, T.frOut, T.frGone, E.out));
    var bloom = seg(t, T.bloom, T.bloom + .25, E.out) * (1 - seg(t, T.bloom + .25, T.bloomEnd + .4, E.out));
    var winOn = seg(t, T.winOn, T.winFull, E.out);
    var inside = seg(t, T.pushEnd - .15, T.pushEnd + .05, E.out); state.inside = inside;
    var hp = perimPoint(frRect, sweep + (514 + .918 * 519) / (2 * (514 + 519))), headA = (sweep > 0 && sweep < 1) ? 1 : 0;
    UN.cam = C.cam; UN.tgt = C.tgt; UN.blur = blur; UN.lightsOff = 1; UN.winOn = winOn; UN.vidMix = seg(t, T.vmStart, T.vmEnd, E.out); UN.vidA = 1; UN.inside = inside;
    UN.fade = aIn; UN.fr = frRect; UN.trace = sweep; UN.glow = bloom; UN.frameA = frameA; UN.head = hp; UN.headA = headA;
    /* ui */
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
    if (!state.done) skip.style.opacity = (t > T.aFull ? 1 : 0) * (1 - seg(t, T.uiStart, T.uiStart + .3, E.out));
    draw();
  }
  var darkU = 0;
  function draw(){
    if (!GLOK) return;
    gl.uniform1f(U.T, performance.now() / 1000);
    var cm = UN.cam || [WC.x, WC.y, 3000], tg = UN.tgt || [WC.x, WC.y, 0];
    gl.uniform3f(U.cam, cm[0], cm[1], cm[2]); gl.uniform3f(U.tgt, tg[0], tg[1], tg[2]);
    gl.uniform1f(U.blur, UN.blur == null ? 1 : UN.blur); gl.uniform1f(U.lightsOff, UN.lightsOff == null ? 1 : UN.lightsOff); gl.uniform1f(U.winOn, UN.winOn || 0);
    gl.uniform1f(U.vidMix, UN.vidMix == null ? 1 : UN.vidMix); gl.uniform1f(U.vidA, vidTexOK ? (UN.vidA || 0) : 0); gl.uniform1f(U.inside, UN.inside || 0);
    gl.uniform1f(U.fade, UN.fade == null ? 0 : UN.fade); gl.uniform1f(U.dark, darkU); gl.uniform1f(U.grain, .035);
    var f = UN.fr || {x:0,y:0,w:0,h:0}; gl.uniform4f(U.fr, f.x, f.y, f.w, f.h);
    var r = G.VEnd || {x:0,y:0,w:1,h:1}; gl.uniform4f(U.rVs, r.x, r.y, r.w, r.h);
    gl.uniform1f(U.trace, UN.trace || 0); gl.uniform1f(U.glow, UN.glow || 0); gl.uniform1f(U.frameA, UN.frameA || 0);
    var h = UN.head || [-999,-999]; gl.uniform2f(U.head, h[0], h[1]); gl.uniform1f(U.headA, UN.headA || 0);
    gl.uniform2f(U.mo, pmx, pmy);
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
      if ((state.videoReady || vid.readyState >= 3) || hold >= maxHold) { state.gate = true; startVideo(); }
      else { hold += dt; t = T.winOn - .05; }
    }
    if (t > T.aIn - .05 && t < T.aIn && texLoaded < TEXN) { hold += dt; t = T.aIn - .05; }
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
    try { sessionStorage.setItem('ci-intro-v5', '1'); } catch(e){}
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
    if (!GLOK) { fallback.classList.add('on'); state.gate = true; startVideo(); finish(); return; }
    if (reduced) { state.gate = true; startVideo(); finish(); return; }
    if (short) { for (var k in T) T[k] = Math.round(T[k] * 55) / 100; }
    raf = requestAnimationFrame(tick);
  }
  go();
