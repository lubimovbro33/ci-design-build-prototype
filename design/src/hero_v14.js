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

  /* ================================================================== 01 HERO v14 — one continuous take on the reel's own render
     act 1: the reel's drone shot with the light line retouched out of every frame (assets/reel/drone_*.mp4/webm, 0–2.6 s).
     At its last frame the GL takes over with the SAME image: the frame was rectified onto the facade plane (assets/reel/F.jpg,
     3300×2228, homography M in F_geom) so the camera can keep turning — a homography interpolation from the drone's view to a
     frontal view of the window side, lights off (mask), no cut. Then: the official logo draws clockwise with its square exactly on
     a square window of the bay (F 1098,908,300,294); letters dissolve; the square erases clockwise while the warm light traces
     clockwise and settles on the glass; the window lights up with the interior video; we push through the glass — inside. UI,
     then the hero becomes the interiors slider. */
  var cvs=$('gl'), vid=$('vid'), reel=$('reel'), reel2=$('reel2'), logo=$('logo'), pre=$('pre'), cnt=$('cnt'), hdr=$('hdr'), skip=$('skip'), veil=$('veil'), dark=$('dark'),
      cur=$('cur'), hero=$('hero'), heroIn=qs('.hero-ui'), heroTitle=$('title'), fallback=$('glFallback'), slidesEl=$('slides'), preview=$('preview');
  var sq=$('sq'), ib=$('ib'), cMask=$('cMask'), tMask=$('tMask'), cF=$('cF'), tF=$('tF');
  var LOGO = {w:710, h:797, sq:{x:92, y:105, w:514, h:519}};
  var RW = 1916, RH = 1078;                                                  /* clip pixels */
  var FW = 3300, FH = 2228;                                                  /* rectified plate */
  var MF = [[0.90242836, 0.0, 0.91226753], [-0.37741899, 1.08302693, 528.91516292], [-0.00029389, 0.0, 1.0]];   /* clip px → plate px (F_geom.json) */
  var WIN = {x:1098, y:908, w:300, h:294};                                   /* the CI window (glass) in F px — a square window of the bay */
  var G = {}, state = {t:0, gate:false, videoReady:false, done:false, skipped:false, inside:0, cut:false, phase:'pre'};
  var mx = 0, my = 0, pmx = 0, pmy = 0, scrollZoom = 0;

  /* ---------- GL */
  var gl = cvs.getContext('webgl', {alpha:false, antialias:false, premultipliedAlpha:false, powerPreference:'high-performance'});
  var GLOK = !!gl;
  var VS = 'attribute vec2 a;varying vec2 v;void main(){v=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
  var FS = [
  'precision highp float;varying vec2 v;',
  'uniform vec2 R;uniform float T;',
  'uniform sampler2D tF,tFb,tV,tM;',
  'uniform mat3 HS;',                /* screen px → plate px */
  'uniform vec2 FS_;',               /* plate size */
  'uniform vec4 rS;',                /* window glass on screen, px */
  'uniform vec4 rV;',                /* video plane on screen, px */
  'uniform vec4 fr;',                /* glow frame rect on screen */
  'uniform float blurW,fade,winOn,trace,trace0,glow,frameA,inside,dark,grain,vidA,vidMix,lightsOff;',
  'uniform vec2 mo,head;uniform float headA;',
  'float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'void main(){',
  '  vec2 s=vec2(v.x*R.x,(1.-v.y)*R.y);',
  '  vec2 par=mo*vec2(14.,10.);',
  '  vec3 h=HS*vec3(s+par*.6,1.); vec2 fp=h.xy/h.z; vec2 uv=fp/FS_;',
  '  vec2 cu=clamp(uv,0.001,0.999);',
  '  vec3 cw=mix(texture2D(tF,cu).rgb, texture2D(tFb,cu).rgb, blurW);',
  '  float m=texture2D(tM,cu).r;',
  '  float lum=dot(cw,vec3(.3,.59,.11));',
  '  vec3 off=vec3(lum*.12)+vec3(.012,.018,.034);',
  '  vec3 fac=mix(cw,off,m*lightsOff);',
  '  vec2 q=(s-rS.xy)/rS.zw;',
  '  vec2 vq=(s+par*1.6-rV.xy)/rV.zw;',
  '  vec3 vc=texture2D(tV,clamp(vq,0.,1.)).rgb;',
  '  float inG=step(0.,q.x)*step(q.x,1.)*step(0.,q.y)*step(q.y,1.);',
  '  vec3 lit=mix(cw*vec3(1.25,1.2,1.1)+vec3(.12,.09,.04), mix(vc*vec3(1.02,.98,.92), cw, .12), vidMix*vidA);',
  '  vec3 col=mix(fac, mix(fac,lit,winOn), inG);',
  '  col=mix(col, vc, inside);',
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
  '  col*=mix(1.,clamp(vig,0.,1.),.45);',
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
    ['R','T','tF','tFb','tV','tM','HS','FS_','rS','rV','fr','blurW','fade','winOn','trace','trace0','glow','frameA','inside','dark','grain','vidA','vidMix','lightsOff','mo','head','headA'].forEach(function(n){ U[n] = gl.getUniformLocation(prog, n); });
    for (var ui = 0; ui < 4; ui++) TEX[ui] = mkTex(ui);
    gl.uniform1i(U.tF, 0); gl.uniform1i(U.tFb, 1); gl.uniform1i(U.tV, 2); gl.uniform1i(U.tM, 3);
    gl.uniform2f(U.FS_, FW, FH);
    gl.uniform1f(U.trace0, (514 + .918 * 519) / (2 * (514 + 519)));
  }
  var texLoaded = 0, TEXN = 3;
  function texDone(){ texLoaded++; }
  if (GLOK) { loadTex(0, 'assets/reel/F.jpg', texDone); loadTex(1, 'assets/reel/F_blur.jpg', texDone); loadTex(3, 'assets/reel/F_mask.png', texDone); }
  var vidTexOK = false;
  function uploadVideo(){
    if (!GLOK || vid.readyState < 2) return;
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, TEX[2]);
    try { gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, vid); vidTexOK = true; } catch(e){}
  }

  /* ---------- homography helpers (3×3 row-major) */
  function m3mul(a, b){ var r = [[0,0,0],[0,0,0],[0,0,0]]; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) r[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j]; return r; }
  function m3inv(m){ var a=m[0][0],b=m[0][1],c=m[0][2],d=m[1][0],e=m[1][1],f=m[1][2],g=m[2][0],h=m[2][1],i=m[2][2]; var A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,D=-(b*i-c*h),E=a*i-c*g,F=-(a*h-b*g),Gg=b*f-c*e,H=-(a*f-c*d),I=a*e-b*d; var det=a*A+b*B+c*C; return [[A/det,D/det,Gg/det],[B/det,E/det,H/det],[C/det,F/det,I/det]]; }
  function m3apply(m, x, y){ var X = m[0][0]*x+m[0][1]*y+m[0][2], Y = m[1][0]*x+m[1][1]*y+m[1][2], Z = m[2][0]*x+m[2][1]*y+m[2][2]; return [X/Z, Y/Z]; }
  /* unit square → quad (Heckbert) */
  function sqToQuad(p){ var x0=p[0][0],y0=p[0][1],x1=p[1][0],y1=p[1][1],x2=p[2][0],y2=p[2][1],x3=p[3][0],y3=p[3][1];
    var dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
    var g,h; if (Math.abs(dx3)<1e-9 && Math.abs(dy3)<1e-9) { g=0; h=0; return [[x1-x0,x2-x1,x0],[y1-y0,y2-y1,y0],[0,0,1]]; }
    var den=dx1*dy2-dx2*dy1; g=(dx3*dy2-dx2*dy3)/den; h=(dx1*dy3-dx3*dy1)/den;
    var a=x1-x0+g*x1, b=x3-x0+h*x3, c=x0, d=y1-y0+g*y1, e=y3-y0+h*y3, f=y0;
    return [[a,b,c],[d,e,f],[g,h,1]]; }
  /* plate rect (x,y,w,h in F px) → screen quad [TL,TR,BR,BL] ⇒ H (F px → screen px) */
  function rectToQuad(r, q){ var S = [[1/r.w,0,-r.x/r.w],[0,1/r.h,-r.y/r.h],[0,0,1]]; return m3mul(sqToQuad(q), S); }

  /* ---------- geometry */
  var RECT = {x:500, y:700, w:1300.0, h:746.269};                                /* the reel's light-frame rectangle on the plate (reference quad) */
  function layout(){
    var vw = window.innerWidth, vh = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    G = plateGeom(vw, vh); G.vw = vw; G.vh = vh;
    /* p = 0: the clip as object-fit: cover */
    var s = Math.max(vw / RW, vh / RH), px = (vh > vw) ? .38 : .5, ox = (vw - RW * s) * px, oy = (vh - RH * s) * .5;
    reel.style.objectPosition = (px * 100) + '% 50%';
    var Minv = m3inv(MF);                                                      /* F px → clip px */
    G.q0 = [[RECT.x,RECT.y],[RECT.x+RECT.w,RECT.y],[RECT.x+RECT.w,RECT.y+RECT.h],[RECT.x,RECT.y+RECT.h]].map(function(c){ var f = m3apply(Minv, c[0], c[1]); return [ox + f[0]*s, oy + f[1]*s]; });
    /* p = 1: frontal, the window centred, its glass = 30 % of the viewport height (≤ 34 % of its width) */
    var hT = Math.min(vh * .26, vw * .30 * WIN.h / WIN.w);
    G.k1 = hT / WIN.h; G.wc = [WIN.x + WIN.w/2, WIN.y + WIN.h/2];
    G.q1 = [[RECT.x,RECT.y],[RECT.x+RECT.w,RECT.y],[RECT.x+RECT.w,RECT.y+RECT.h],[RECT.x,RECT.y+RECT.h]].map(function(c){ return [vw/2 + (c[0]-G.wc[0])*G.k1, vh/2 + (c[1]-G.wc[1])*G.k1]; });
    G.R0 = {x:vw/2 - WIN.w*G.k1/2, y:vh/2 - WIN.h*G.k1/2, w:WIN.w*G.k1, h:WIN.h*G.k1};
    var k = G.R0.w / LOGO.sq.w;                                                /* logo: its square is exactly as wide as the window glass, centred on it */
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

  /* timeline: act 1 on the clip's own clock (0 → T.cut), the rest on the wall clock */
  var T = {
    cut:2.6, turn:2.6, turnEnd:4.0, offA:3.0, offB:3.8,
    sqStart:4.25, sqEnd:5.25, cStart:4.9, cEnd:5.7, iStart:5.5, iEnd:5.9, tStart:5.85, tEnd:6.5,
    lettersOut:6.65, lettersGone:7.2, sweepStart:6.75, sweepEnd:8.05, tightStart:6.7, tightEnd:7.3, bloom:8.05, bloomEnd:8.65,
    winOn:8.3, winFull:9.0, pushStart:9.0, pushEnd:10.8, vmStart:9.25, vmEnd:9.95, frOut:9.95, frGone:10.45,
    uiStart:10.4, end:11.25
  };
  var short = false; try { short = sessionStorage.getItem('ci-intro-v9') === '1'; } catch(e){}

  var UN = {};
  function render(t){
    var vw = G.vw, vh = G.vh;
    /* logo */
    var sweep = seg(t, T.sweepStart, T.sweepEnd, E.expo);
    if (sweep > 0) erase(sq, L.sq, sweep); else dash(sq, L.sq, seg(t, T.sqStart, T.sqEnd, E.expo));
    sq.style.opacity = sweep < 1 ? 1 : 0;
    dash(cMask, L.c, seg(t, T.cStart, T.cEnd, E.expo)); dash(ib, L.ib, seg(t, T.iStart, T.iEnd, E.out));
    tMask.setAttribute('width', 560 * seg(t, T.tStart, T.tEnd, E.out));
    var lo = 1 - seg(t, T.lettersOut, T.lettersGone, E.expo); cF.style.opacity = lo; ib.style.opacity = lo; tF.style.opacity = lo;
    /* the camera: from the clip's last view to the frontal view — the plate's reference quad glides between its two screen positions */
    var turn = seg(t, T.turn, T.turnEnd, E.expo), whip = Math.sin(turn * Math.PI);
    var pu = seg(t, T.pushStart, T.pushEnd, E.push);
    var RS = zoomRect(G.R0, G.REnd, pu), RV = zoomRect(G.V0, G.VEnd, pu);
    var q = [];
    if (pu > 0) { /* push: similarity about the window centre */
      var kz = RS.w / WIN.w, cxs = RS.x + RS.w/2, cys = RS.y + RS.h/2;
      q = [[RECT.x,RECT.y],[RECT.x+RECT.w,RECT.y],[RECT.x+RECT.w,RECT.y+RECT.h],[RECT.x,RECT.y+RECT.h]].map(function(c){ return [cxs + (c[0]-G.wc[0])*kz, cys + (c[1]-G.wc[1])*kz]; });
    } else {
      for (var i = 0; i < 4; i++) q.push([lerp(G.q0[i][0], G.q1[i][0], turn), lerp(G.q0[i][1], G.q1[i][1], turn)]);
    }
    var Hf = rectToQuad(RECT, q); UN.HS = m3inv(Hf);
    /* frame = the logo square, tightening onto the glass */
    var mv = seg(t, T.tightStart, T.tightEnd, E.out);
    var frRect = mixRect(G.lsq, G.R0, mv);
    var frameA = (t >= T.sweepStart ? 1 : 0) * (1 - seg(t, T.frOut, T.frGone, E.out));
    var bloom = seg(t, T.bloom, T.bloom + .25, E.out) * (1 - seg(t, T.bloom + .25, T.bloomEnd + .4, E.out));
    var winOn = seg(t, T.winOn, T.winFull, E.out);
    var inside = seg(t, T.pushEnd - .15, T.pushEnd + .05, E.out); state.inside = inside;
    var hp = perimPoint(frRect, sweep + TRACE0), headA = (sweep > 0 && sweep < 1) ? 1 : 0;
    UN.fade = state.cut ? 1 : 0;
    UN.blurW = Math.max(whip * .9, seg(t, T.pushStart + .5, T.pushEnd, E.out) * .75);
    UN.lightsOff = seg(t, T.offA, T.offB, E.out);
    UN.winOn = winOn; UN.trace = sweep; UN.glow = bloom; UN.frameA = frameA; UN.inside = inside;
    UN.vidMix = seg(t, T.vmStart, T.vmEnd, E.out);
    UN.fr = pu > 0 ? RS : frRect; UN.rS = pu > 0 ? RS : G.R0; UN.rV = pu > 0 ? RV : G.V0; UN.head = hp; UN.headA = headA; UN.vidA = 1;
    if (!state.done && t >= T.uiStart) uiOn();
    if (!state.done) skip.classList.toggle('on', t > .6 && t < T.uiStart);
    draw();
  }
  var darkU = 0;
  function draw(){
    if (!GLOK) return;
    gl.uniform1f(U.T, performance.now() / 1000);
    var H = UN.HS || [[1,0,0],[0,1,0],[0,0,1]];
    gl.uniformMatrix3fv(U.HS, false, new Float32Array([H[0][0],H[1][0],H[2][0], H[0][1],H[1][1],H[2][1], H[0][2],H[1][2],H[2][2]]));
    gl.uniform1f(U.fade, UN.fade || 0); gl.uniform1f(U.blurW, UN.blurW || 0); gl.uniform1f(U.lightsOff, UN.lightsOff == null ? 1 : UN.lightsOff);
    gl.uniform1f(U.winOn, UN.winOn || 0); gl.uniform1f(U.trace, UN.trace || 0); gl.uniform1f(U.glow, UN.glow || 0); gl.uniform1f(U.frameA, UN.frameA || 0); gl.uniform1f(U.inside, UN.inside || 0);
    gl.uniform1f(U.dark, darkU); gl.uniform1f(U.grain, .03); gl.uniform1f(U.vidMix, UN.vidMix == null ? 1 : UN.vidMix); gl.uniform1f(U.vidA, vidTexOK ? (UN.vidA || 0) : 0);
    var f = UN.fr || {x:0,y:0,w:0,h:0}, r = UN.rS || {x:0,y:0,w:1,h:1};
    gl.uniform4f(U.fr, f.x, f.y, f.w, f.h); gl.uniform4f(U.rS, r.x, r.y, r.w, r.h); var rv = UN.rV || r; gl.uniform4f(U.rV, rv.x, rv.y, rv.w, rv.h);
    gl.uniform2f(U.mo, pmx, pmy); var h = UN.head || [-999,-999]; gl.uniform2f(U.head, h[0], h[1]); gl.uniform1f(U.headA, UN.headA || 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ---------- sources */
  function markReady(){ state.videoReady = true; }
  vid.addEventListener('canplaythrough', markReady); vid.addEventListener('canplay', markReady);
  function startVideo(){ var pr = vid.play(); if (pr && pr.catch) pr.catch(function(){}); }
  (function(){ var big = window.innerWidth >= 900 && GLOK; var s = $('vsrc'); s.src = big ? 'assets/night/int_night_1080.mp4' : 'assets/night/int_night_720.mp4'; vid.load(); })();
  var reelCan = false, bigScreen = Math.min(window.innerWidth, window.innerHeight) >= 520;
  (function pickClip(){
    var vp9 = !!reel.canPlayType && reel.canPlayType('video/webm; codecs="vp9"') === 'probably';
    var src = !bigScreen ? 'assets/reel/drone_720.mp4' : (vp9 ? 'assets/reel/drone_1080.webm' : 'assets/reel/drone_1080.mp4');
    var s = document.createElement('source'); s.src = src; s.type = /webm/.test(src) ? 'video/webm' : 'video/mp4'; reel.appendChild(s);
    if (!vp9 || !bigScreen) { var s2 = document.createElement('source'); s2.src = bigScreen ? 'assets/reel/drone_1080.mp4' : 'assets/reel/drone_720.mp4'; s2.type = 'video/mp4'; if (s2.src !== s.src) reel.appendChild(s2); }
    reel.addEventListener('canplay', function(){ reelCan = true; }); reel.addEventListener('canplaythrough', function(){ reelCan = true; });
    reel.load();
  })();

  /* ---------- preloader */
  var pre0 = performance.now(), preDone = false, shown = 0;
  function buffered(){ try { if (reel.buffered.length && reel.duration) return reel.buffered.end(reel.buffered.length - 1) / reel.duration; } catch(e){} return 0; }
  function preTick(now){
    if (preDone) return;
    var el = (now - pre0) / 1000;
    var target = Math.max(Math.min(.9, el / 1.6), Math.min(1, buffered()) * (texLoaded >= TEXN ? 1 : .8));
    if ((reelCan || reel.readyState >= 3) && (texLoaded >= TEXN || !GLOK) || el > 5 || short && el > .5) target = 1;
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
    var p = reel.play(); if (p && p.catch) p.catch(function(){ doCut(performance.now()); });
    raf = requestAnimationFrame(tick);
  }
  function doCut(now){
    if (state.cut) return; state.cut = true;
    render(T.cut); reel.pause(); reel.classList.add('cut');
    wall0 = now - T.cut * 1000; lastNow = now; state.phase = 'intro';
  }
  function tick(now){
    var t;
    if (!state.cut) {
      t = reel.currentTime || 0;
      if (t >= T.cut - .025 || reel.ended) { doCut(now); t = T.cut; }
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
    try { sessionStorage.setItem('ci-intro-v9', '1'); } catch(e){}
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
  function idleLoop(){ (function f(){ if (slide.cur === 0) { pmx += (mx - pmx) * .06; pmy += (my - pmy) * .06; uploadVideo(); draw(); } requestAnimationFrame(f); })(); }

  /* ================================================================== the hero slider (interiors) — the full reel is loaded only now */
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
  function loadReel2(){
    if (reel2.getAttribute('data-loaded')) return; reel2.setAttribute('data-loaded', '1');
    var vp9 = !!reel2.canPlayType && reel2.canPlayType('video/webm; codecs="vp9"') === 'probably';
    var src = !bigScreen ? 'assets/reel/reel_720.mp4' : (vp9 ? 'assets/reel/reel_1080.webm' : 'assets/reel/reel_1080.mp4');
    var s = document.createElement('source'); s.src = src; s.type = /webm/.test(src) ? 'video/webm' : 'video/mp4'; reel2.appendChild(s);
    if (!vp9 || !bigScreen) { var s2 = document.createElement('source'); s2.src = bigScreen ? 'assets/reel/reel_1080.mp4' : 'assets/reel/reel_720.mp4'; s2.type = 'video/mp4'; if (s2.src !== s.src) reel2.appendChild(s2); }
    reel2.load();
  }
  function buildSlides(){
    SL.forEach(function(s, i){
      if (s.k === 'img') { var im = document.createElement('img'); im.className = 'sl'; im.src = s.src; im.alt = ''; im.decoding = 'async'; slidesEl.appendChild(im); slide.els[i] = im; s.th = s.src; }
    });
  }
  function setPreview(){
    for (var j = 0; j < pvImgs.length; j++) { var s = SL[(slide.cur + 1 + j) % SL.length]; pvImgs[j].src = s.th; pvImgs[j].parentNode.setAttribute('data-i', (slide.cur + 1 + j) % SL.length); }
  }
  function reelEnd(){ var s = SL[slide.cur]; if (s.k === 'reel' && reel2.currentTime >= s.b) { reel2.removeEventListener('timeupdate', reelEnd); nextSlide(); } }
  function showSlide(i){
    var prev = SL[slide.cur], next = SL[i];
    clearTimeout(slide.timer); reel2.removeEventListener('timeupdate', reelEnd);
    if (prev.k === 'reel') { reel2.classList.remove('on'); reel2.classList.add('fade'); setTimeout(function(){ if (SL[slide.cur].k !== 'reel') reel2.pause(); }, 1200); }
    if (prev.k === 'img') slide.els[slide.cur].classList.remove('on');
    slide.cur = i;
    if (next.k === 'gl') { slide.timer = setTimeout(nextSlide, next.dur * 1000); }
    else if (next.k === 'img') { slide.els[i].classList.add('on'); slide.timer = setTimeout(nextSlide, next.dur * 1000); }
    else { try { reel2.currentTime = next.a; } catch(e){} reel2.playbackRate = next.rate; reel2.classList.remove('fade'); reel2.classList.add('on'); var p = reel2.play(); if (p && p.catch) p.catch(function(){}); reel2.addEventListener('timeupdate', reelEnd); slide.timer = setTimeout(nextSlide, ((next.b - next.a) / next.rate + 1.5) * 1000); }
    setPreview();
  }
  function nextSlide(){ if (!slide.on) return; showSlide((slide.cur + 1) % SL.length); }
  function startSlider(){
    if (slide.on) return; slide.on = true; buildSlides(); setPreview(); loadReel2();
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
