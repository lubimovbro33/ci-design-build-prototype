/* ================================================================== CI · v15 preloader in 3D (three.js r170, WebGL)
   The user's Figma frames 13 → 15 → 16 → 14 as a real camera move instead of a slideshow:
     · a drone-like arc from an angle onto the facade (the facade is a flat plane, so the photo stays physically right in perspective),
       the Chicago skyline is a separate far plane → true parallax at the building corner; city lights twinkle;
     · the official CI DESIGN + BUILD logo draws itself clockwise on the window (frame 15), with bloom;
     · a warm light runs round the window and leaves the outline (frame 16);
     · the window bay is a real recess (jambs + a glass unit 22 units deep); it lights up (frame 14) — the panes are clear and behind them
       is room 1450_34 at depth, so the camera flies THROUGH the window into the room, no cut;
     · post: bloom on lights, film grain, vignette, a touch of chromatic aberration during the dive.
   World units = Figma frame px (1920×1080 frame), y up (world y = −frame y), facade plane at z = 0.
   API (window.__pre3d): state 'loading' | 'ready' | 'error', render(t, T, mx, my, scroll), resize(). site.js keeps the timeline/UI,
   adds .gl on #v15 when the scene is ready (DOM layers = fallback). Source copy: src/v15/pre3d.js. */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const PRE3D = window.__pre3d = { state: 'loading', ok: false, render(){}, resize(){} };

const F = { RX:-57, RY:-251, RW:2033, RH:1477, EDGE:1110.5, EXT:912,
            PATCH:{x:874, y:442, w:167, h:179}, OL:{x:877, y:448, w:163, h:164}, MARK:{x:865, y:432, w:190, h:217} };
const FOV = 30, TAN = Math.tan(FOV / 2 * Math.PI / 180);
const DEPTH = 22;            /* window recess */
const ROOMZ = -300;          /* room photo plane */
const SKYZ = -5200;          /* skyline plane */
const H = { x: F.PATCH.x + F.PATCH.w / 2, y: -(F.PATCH.y + F.PATCH.h / 2) };   /* window centre, world */
const C = { x: 960, y: -540 };                                                 /* frame centre, world */
const ROOM_AR = 2400 / 1729;

const canvas = document.getElementById('v15gl');
const stage = document.getElementById('v15');
let renderer, scene, camera, composer, bloom, finalPass;
const M = {};               /* meshes */
const U = {};               /* shared uniforms */
let Zc = 2015, vw = 1, vh = 1;

const clamp01 = x => Math.max(0, Math.min(1, x));
const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const ease = x => { x = clamp01(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const expoIO = x => { x = clamp01(x); if (x === 0 || x === 1) return x; return x < .5 ? Math.pow(2, 20 * x - 10) / 2 : 1 - Math.pow(2, -20 * x + 10) / 2; };
const lerp = (a, b, t) => a + (b - a) * t;

function hiDPI(){ return Math.max(window.innerWidth, window.innerHeight * 16 / 9) * Math.min(window.devicePixelRatio || 1, 2) > 2200; }

function loadTex(url){
  return new Promise((res, rej) => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); res(t); }, undefined, rej));
}
/* a plane covering frame rect (x,y,w,h) at depth z, scaled about the frontal camera axis so it projects onto that rect exactly */
function rectPlane(mat, r, z, axis){
  const k = axis ? (Zc - z) / Zc : 1;
  const g = new THREE.PlaneGeometry(r.w, r.h);
  const m = new THREE.Mesh(g, mat);
  m.userData = { r, z, axis };
  placeRect(m);
  return m;
}
function placeRect(m){
  const { r, z, axis } = m.userData, k = axis ? (Zc - z) / Zc : 1;
  const cx = r.x + r.w / 2, cy = -(r.y + r.h / 2);
  m.position.set(C.x + (cx - C.x) * k, C.y + (cy - C.y) * k, z);
  m.scale.set(k, k, 1);
}

/* ---------------------------------------------------------------- shaders */
const vtx = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

function skyMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: { map:{value:tex}, uTime:U.time, uLift:{value:1} },
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uTime; uniform float uLift; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      void main(){
        vec4 c = texture2D(map, vUv);
        float l = dot(c.rgb, vec3(.299,.587,.114));
        float m = smoothstep(.42, .85, l);                         /* city lights only */
        vec2 cell = floor(vUv * vec2(900., 650.));
        float t = uTime * 1.6 + h(cell) * 6.283;
        float tw = .82 + .18 * sin(t) * sin(t * .37 + h(cell + 3.1) * 4.0);
        c.rgb *= mix(1., tw, m) * uLift;
        c.rgb += c.rgb * m * .35;                                  /* lights feed the bloom */
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`,
    depthWrite: false
  });
}
function basicTex(tex, opts){ return new THREE.MeshBasicMaterial(Object.assign({ map: tex, transparent: true, toneMapped: false }, opts || {})); }

function unitLitMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: { map:{value:tex}, uOp:{value:0}, uGain:{value:1} },
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uOp; uniform float uGain; varying vec2 vUv;
      void main(){ vec4 c = texture2D(map, vUv); vec3 col = c.rgb;
        float warm = smoothstep(.25,.8,dot(col, vec3(.5,.35,.15)));
        col *= mix(1., uGain, warm);
        gl_FragColor = vec4(col, c.a * uOp);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false
  });
}
function roomMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: { map:{value:tex}, uLight:{value:0}, uGain:{value:1} },
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uLight; uniform float uGain; varying vec2 vUv;
      void main(){ vec3 c = texture2D(map, vUv).rgb;
        vec3 night = c * vec3(1.08, .88, .66) * .8;               /* seen from outside at night: warm, dimmer */
        vec3 col = mix(c, night, 1. - uLight) * uGain;
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }`
  });
}
function logoMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: { map:{value:tex}, uProg:{value:0}, uOp:{value:0}, uAsp:{value:F.MARK.w / F.MARK.h}, uGain:{value:1}, uGlint:{value:-3}, uSpark:{value:0}, uHalo:{value:.5} },
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uProg; uniform float uOp; uniform float uAsp; uniform float uGain; uniform float uGlint; uniform float uSpark; uniform float uHalo; varying vec2 vUv;
      void main(){ vec4 c = texture2D(map, vUv);
        /* a thin halo from the logo's own alpha (no global bloom on the letters → they stay crisp) */
        vec2 px = vec2(1. / 601., 1. / 687.); float h = 0.;
        for (int i = 0; i < 8; i++){ float an = float(i) * .785398; vec2 o = vec2(cos(an), sin(an));
          h += texture2D(map, vUv + o * px * 4.).a + texture2D(map, vUv + o * px * 9.).a * .5; }
        h /= 12.;
        float halo = max(h - c.a, 0.) * uHalo;
        vec2 p = vec2((vUv.x - .5) * uAsp, -(vUv.y - .5));
        float a = fract(atan(p.y, p.x) / 6.2831853 + 1.);              /* 0 at the right, clockwise on screen */
        float edge = uProg >= .999 ? 1. : smoothstep(uProg, uProg - .012, a);
        float head = exp(-abs(a - uProg) * 60.) * uSpark;
        float g = p.x * .9 - p.y * .55 - uGlint;                        /* a thin diagonal glint across the letters */
        float glint = exp(-g * g / .0012);
        float body = c.a, al = max(body, halo) * edge * uOp;
        vec3 col = mix(vec3(1.), c.rgb, body) * (uGain * .9 + .5 * glint * body + .5 * head);
        gl_FragColor = vec4(col, al);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false
  });
}
function outlineMat(){
  const pad = 46, r = F.OL;
  return { pad, mat: new THREE.ShaderMaterial({
    uniforms: { uFront:{value:1}, uOp:{value:0}, uHead:{value:0}, uSize:{value:new THREE.Vector2(r.w, r.h)}, uPad:{value:pad}, uCol:{value:new THREE.Color(0xF8BD79)}, uGlow:{value:new THREE.Color(255/255, 208/255, 150/255)} },
    vertexShader: vtx,
    fragmentShader: `uniform float uFront; uniform float uOp; uniform float uHead; uniform vec2 uSize; uniform float uPad; uniform vec3 uCol; uniform vec3 uGlow; varying vec2 vUv;
      void main(){
        vec2 full = uSize + 2. * uPad;
        vec2 p = vec2(vUv.x * full.x - uPad, (1. - vUv.y) * full.y - uPad);          /* rect px, y down */
        float ins = 1.5; vec2 a0 = vec2(ins), b0 = uSize - ins;                         /* 3 px stroke inside */
        vec2 q = clamp(p, a0, b0);
        float dx = min(abs(p.x - a0.x), abs(p.x - b0.x)), dy = min(abs(p.y - a0.y), abs(p.y - b0.y));
        bool inside = p.x > a0.x && p.x < b0.x && p.y > a0.y && p.y < b0.y;
        float d = inside ? min(dx, dy) : length(p - q);
        vec2 r = p - uSize * .5;
        float ang = fract(atan(r.y, r.x) / 6.2831853 + 1.);                             /* same angle as the logo's wipe */
        float on = uFront <= .0005 ? 1. : smoothstep(uFront - .004, uFront + .004, ang);
        float core = smoothstep(ins + .9, ins - .4, d) * on;
        float glow = exp(-d / 8.6) * .6 * on;
        float da = abs(ang - uFront); da = min(da, 1. - da);
        float head = exp(-(d + da * 650.) / 7.) * uHead * 2.6;                          /* the golden light running ahead */
        vec3 col = uCol * core * 1.7 + uGlow * (glow + head);
        float al = clamp(core + glow + head, 0., 1.) * uOp;
        gl_FragColor = vec4(col, al);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  })};
}
function shadowMat(){
  return new THREE.ShaderMaterial({
    uniforms: { uOp:{value:0} },
    vertexShader: vtx,
    fragmentShader: `uniform float uOp; varying vec2 vUv;
      void main(){ vec2 p = vUv - .5; float r2 = dot(p, p);
        float a = exp(-r2 / .055) * .42 * uOp;                       /* big radius, barely there */
        gl_FragColor = vec4(0., 0., 0., a); }`,
    transparent: true, depthWrite: false
  });
}
function spillMat(){
  return new THREE.ShaderMaterial({
    uniforms: { uOp:{value:0} },
    vertexShader: vtx,
    fragmentShader: `uniform float uOp; varying vec2 vUv;
      void main(){ vec2 p = (vUv - .5) * vec2(1., 1.); float r = length(p);
        float g = exp(-r * r / .045) * .55 + exp(-r * r / .006) * .35;
        gl_FragColor = vec4(vec3(1., .66, .36) * g * uOp, 1.); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
}
const FinalShader = {
  uniforms: { tDiffuse:{value:null}, uTime:{value:0}, uFade:{value:0}, uAb:{value:0}, uVig:{value:.32}, uRes:{value:new THREE.Vector2(1,1)} },
  vertexShader: vtx,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform float uFade; uniform float uAb; uniform float uVig; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - .5; float r2 = dot(d, d);
      vec2 o = d * uAb * r2;
      vec3 c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b);
      c *= 1. - uVig * smoothstep(.12, .62, r2 * 1.6);
      float g = h(vUv * uRes + fract(uTime * 37.)) - .5;
      c += g * .045;
      gl_FragColor = vec4(c * uFade, 1.);
    }`
};

/* ---------------------------------------------------------------- build */
async function build(){
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.localClippingEnabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070b);
  camera = new THREE.PerspectiveCamera(FOV, 1, 1, 30000);
  U.time = { value: 0 };

  const hi = hiDPI(), base = 'assets/v15/gl/';
  const [tSky, tFac, tUD, tUL, tJamb, tRoom, tLogo] = await Promise.all([
    loadTex(base + (hi ? 'sky_2x.jpg' : 'sky_1x.jpg')), loadTex(base + (hi ? 'facade_2x.webp' : 'facade_1x.webp')),
    loadTex(base + 'unit_dark.jpg'), loadTex(base + 'unit_lit.webp'), loadTex(base + 'jamb.jpg'),
    loadTex('assets/v15/' + (hi ? 'room_2k.jpg' : 'room_1k.jpg')), loadTex('assets/v15/logo_db.png')
  ]);
  layoutCamera();
  const clipEdge = [ new THREE.Plane(new THREE.Vector3(-1, 0, 0), F.EDGE - .5) ];       /* keep things left of the corner */

  M.sky = rectPlane(skyMat(tSky), { x:F.RX, y:F.RY, w:F.RW, h:F.RH }, SKYZ, true); M.sky.renderOrder = 0; scene.add(M.sky);
  const facW = tFac.image.width / tSky.image.width * F.RW;
  M.fac = rectPlane(basicTex(tFac, { alphaTest: .5, transparent: false }), { x:F.RX - F.EXT, y:F.RY, w:facW, h:F.RH }, 0, false); M.fac.renderOrder = 5; scene.add(M.fac);
  /* the building's side wall round the corner: the facade texture repeated, in shadow, receding into the city */
  const SIDE = 2200;
  const tSide = tFac.clone(); tSide.wrapS = THREE.RepeatWrapping; tSide.repeat.set(SIDE / facW * .9, 1); tSide.offset.set(.05, 0); tSide.needsUpdate = true;
  M.side = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, F.RH), new THREE.MeshBasicMaterial({ map: tSide, color: new THREE.Color(.16, .165, .2), alphaTest: .5, toneMapped: false }));
  M.side.rotation.y = Math.PI / 2; M.side.position.set(F.EDGE, -(F.RY + F.RH / 2), -SIDE / 2); M.side.renderOrder = 5; scene.add(M.side);
  /* recess: unit planes at −DEPTH, jambs between */
  const P = F.PATCH;
  M.ud = rectPlane(new THREE.MeshBasicMaterial({ map: tUD, transparent: true, depthWrite: false, toneMapped: false }), P, -DEPTH, false); M.ud.renderOrder = 3; scene.add(M.ud);
  M.ul = rectPlane(unitLitMat(tUL), P, -DEPTH + .5, false); M.ul.renderOrder = 4; scene.add(M.ul);
  tJamb.wrapS = tJamb.wrapT = THREE.RepeatWrapping;
  const jm = new THREE.MeshBasicMaterial({ map: tJamb, color: 0x6a5f58, side: THREE.DoubleSide, toneMapped: false });
  M.jamb = new THREE.Group();
  const x0 = P.x, x1 = P.x + P.w, y0 = -P.y, y1 = -(P.y + P.h);
  const quad = (ax, ay, bx, by) => {                       /* a strip from edge (a→b) at z=0 back to z=−DEPTH */
    const g = new THREE.BufferGeometry();
    const v = new Float32Array([ax,ay,0, bx,by,0, bx,by,-DEPTH, ax,ay,-DEPTH]);
    g.setAttribute('position', new THREE.BufferAttribute(v, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0,1, 1,1, 1,0, 0,0]), 2));
    g.setIndex([0,1,2, 0,2,3]); return new THREE.Mesh(g, jm);
  };
  M.jamb.add(quad(x0,y0,x1,y0), quad(x1,y1,x0,y1), quad(x0,y1,x0,y0), quad(x1,y0,x1,y1));
  M.jamb.renderOrder = 2; scene.add(M.jamb);
  /* the room behind the window */
  tRoom.minFilter = THREE.LinearMipmapLinearFilter;
  M.room = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), roomMat(tRoom)); M.room.material.clippingPlanes = clipEdge;
  M.room.position.set(H.x, H.y, ROOMZ); M.room.renderOrder = 1; scene.add(M.room);
  /* light spill on the stone */
  M.spill = new THREE.Mesh(new THREE.PlaneGeometry(1100, 1100), spillMat()); M.spill.material.clippingPlanes = clipEdge;
  M.spill.position.set(H.x, H.y, .6); M.spill.renderOrder = 6; scene.add(M.spill);
  /* outline (frame 16) and logo (frame 15) */
  const om = outlineMat();
  M.ol = rectPlane(om.mat, { x:F.OL.x - om.pad, y:F.OL.y - om.pad, w:F.OL.w + 2 * om.pad, h:F.OL.h + 2 * om.pad }, 1, false); M.ol.renderOrder = 7; scene.add(M.ol);
  const SH = 2.6;                                                   /* shadow plane = 2.6 × the logo */
  M.shadow = rectPlane(shadowMat(), { x:F.MARK.x - F.MARK.w * (SH - 1) / 2, y:F.MARK.y - F.MARK.h * (SH - 1) / 2, w:F.MARK.w * SH, h:F.MARK.h * SH }, 1.5, false);
  M.shadow.material.clippingPlanes = clipEdge; M.shadow.renderOrder = 7; scene.add(M.shadow);
  M.logo = rectPlane(logoMat(tLogo), F.MARK, 2, false); M.logo.renderOrder = 8; scene.add(M.logo);

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .6, .38, .86); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  finalPass = new ShaderPass(FinalShader); composer.addPass(finalPass);
  resize();
  window.addEventListener('resize', resize);
}

function layoutCamera(){
  vw = canvas.clientWidth || window.innerWidth; vh = canvas.clientHeight || window.innerHeight;
  const asp = vw / vh, visH = Math.min(1080, 1920 / asp);
  Zc = visH / 2 / TAN;
  camera.aspect = asp; camera.updateProjectionMatrix();
}
function resize(){
  if (!renderer) return;
  layoutCamera();
  renderer.setSize(vw, vh, false);
  composer.setSize(vw, vh);
  bloom.resolution.set(vw / 2, vh / 2);
  finalPass.uniforms.uRes.value.set(vw, vh);
  scene.traverse(o => { if (o.userData && o.userData.r) placeRect(o); });
  /* room plane: covers the view from the final pose (camera at z = ZEND) */
  const dist = ZEND - ROOMZ, visH = 2 * dist * TAN, visW = visH * camera.aspect;
  const h = Math.max(visH, visW / ROOM_AR) * 1.04, w = h * ROOM_AR;
  M.room.scale.set(w, h, 1);
}
const ZEND = -40;

/* ---------------------------------------------------------------- camera path + state */
const v3 = new THREE.Vector3(), look = new THREE.Vector3();
function pose(t, T, mx, my, scroll){
  /* A: angled & further (drone), F: frontal (= the Figma frame), E: inside, in the room */
  const A = { x: C.x + .30 * Zc, y: C.y + .06 * Zc, z: Zc * 1.24, lx: 905, ly: -525 };
  const Fp = { x: C.x, y: C.y, z: Zc, lx: C.x, ly: C.y };
  let x, y, z, lx, ly, lz = 0;
  const arc = ease(t / T.orbit);
  /* arc: interpolate the angle round the window (not a straight line) */
  const r0 = Math.hypot(A.x - H.x, A.z), r1 = Math.hypot(Fp.x - H.x, Fp.z);
  const a0 = Math.atan2(A.x - H.x, A.z), a1 = Math.atan2(Fp.x - H.x, Fp.z);
  const a = lerp(a0, a1, arc), rr = lerp(r0, r1, arc);
  x = H.x + Math.sin(a) * rr; z = Math.cos(a) * rr; y = lerp(A.y, Fp.y, arc);
  lx = lerp(A.lx, Fp.lx, arc); ly = lerp(A.ly, Fp.ly, arc);
  const fl = (1 - arc) * .0035 * Zc;                                     /* drone float */
  x += Math.sin(t * 1.3) * fl; y += Math.sin(t * 1.7 + 1.) * fl * .6;
  if (t > T.orbit){ const s = sm((t - T.orbit) / (T.push - T.orbit)); z *= 1 - .02 * s; }
  /* dive through the window */
  let dive = 0;
  if (t > T.push){
    dive = clamp01((t - T.push) / (T.pushEnd - T.push));
    const e = expoIO(dive), c = sm(Math.min(1, dive * 1.6));
    const d0 = z - ROOMZ, d1 = ZEND * (1 - .08 * scroll) - ROOMZ;
    z = ROOMZ + Math.pow(d0, 1 - e) * Math.pow(d1, e);
    x = lerp(x, H.x, c); y = lerp(y, H.y, c); lx = lerp(lx, H.x, c); ly = lerp(ly, H.y, c); lz = lerp(0, ROOMZ, c);
  }
  /* mouse parallax (stronger outside, gentle in the room) */
  const mp = dive > .99 ? 4 : 18 * (1 - dive) + 4;
  x += -mx * mp; y += my * mp * .7;
  camera.position.set(x, y, z); look.set(lx - mx * mp * .3, ly + my * mp * .2, lz); camera.lookAt(look);
  return dive;
}

function render3d(t, T, mx, my, scroll){
  U.time.value = performance.now() / 1000;
  const dive = pose(t, T, mx || 0, my || 0, scroll || 0);
  /* frame 15: the logo draws clockwise, then shines (glint, brighter bloom), then erases counter-clockwise */
  const draw = sm((t - T.logoA) / (T.logoB - T.logoA)), er = sm((t - T.outA) / (T.outB - T.outA));
  const shine = clamp01((t - T.shineA) / (T.shineB - T.shineA)), shK = Math.sin(Math.PI * shine);
  const prog = t < T.outA ? draw : 1 - er, lvis = draw > 0 && er < 1 ? 1 : 0;
  const lu = M.logo.material.uniforms;
  lu.uProg.value = prog; lu.uOp.value = lvis;
  M.shadow.material.uniforms.uOp.value = sm(draw * 1.4) * (1 - er);
  lu.uSpark.value = ((draw > 0 && draw < 1) || (er > 0 && er < 1)) ? 1 : 0;
  lu.uGain.value = 1.0 + .08 * shK; lu.uHalo.value = .42 + .22 * shK;
  lu.uGlint.value = shine > 0 && shine < 1 ? lerp(-.95, .95, ease(clamp01((shine - .15) / .7))) : -3.;
  /* frame 16: the golden light follows the eraser (counter-clockwise) and leaves the outline */
  const front = 1 - sm((t - T.olA) / (T.olB - T.olA)), oa = t < T.olA ? 0 : 1 - sm((t - T.olOutA) / (T.olOutB - T.olOutA));
  const ou = M.ol.material.uniforms;
  ou.uFront.value = front; ou.uOp.value = oa; ou.uHead.value = front > .001 && front < .999 ? 1 : 0;
  /* frame 14: the window lights */
  const lit = sm((t - T.litA) / (T.litB - T.litA)), bloomK = Math.sin(Math.PI * clamp01((t - T.litA) / .9));
  M.ud.material.opacity = 1 - lit;
  M.ul.material.uniforms.uOp.value = lit; M.ul.material.uniforms.uGain.value = 1 + .22 * bloomK;
  M.room.material.uniforms.uLight.value = sm((t - T.push - .35) / .9);
  M.room.material.uniforms.uGain.value = lit * (1 + .18 * bloomK);
  /* the glass unit dissolves as the camera reaches the window */
  const cz = camera.position.z, through = 1 - clamp01((cz - 6) / 70);
  if (through > 0){ M.ul.material.uniforms.uOp.value = lit * (1 - through); M.ud.material.opacity *= (1 - through); }
  M.spill.material.uniforms.uOp.value = lit * (.32 + .25 * bloomK) * (1 - sm(dive * 2.2));
  /* post */
  bloom.strength = .5 + .22 * bloomK;
  finalPass.uniforms.uTime.value = U.time.value;
  finalPass.uniforms.uFade.value = sm(t / T.fadeIn);
  finalPass.uniforms.uAb.value = .022 * Math.sin(Math.PI * clamp01(dive * 1.1));
  composer.render();
}

(async () => {
  try {
    if (!canvas) throw new Error('no canvas');
    await build();
    PRE3D.render = render3d; PRE3D.resize = resize; PRE3D.ok = true; PRE3D.state = 'ready';
  } catch (e) {
    console.warn('[pre3d] fallback to DOM:', e && e.message);
    PRE3D.state = 'error';
  }
})();
