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
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

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

function loadTexRaw(url){                                         /* sRGB pictures uploaded raw (RGBA8), decoded in the shader */
  return new Promise((res, rej) => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); decoded(t, res); }, undefined, rej));
}
function decoded(t, res){ const im = t.image; if (im && im.decode) im.decode().then(() => res(t), () => res(t)); else res(t); }   /* decode off the main thread */
function loadTexLin(url, nearest){
  return new Promise((res, rej) => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.NoColorSpace; if (nearest){ t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; } res(t); }, undefined, rej));
}
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
  const o = m.userData.over || 1;                                  /* optional overscan (sky: room for the mouse parallax) */
  m.scale.set(k * o, k * o, 1);
}

/* ---------------------------------------------------------------- shaders */
const vtx = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
/* the story's sketch: every surface swaps to its ink drawing (assets *_sk) in organic patches, as if redrawn by hand */
/* v7 (user 03.11 10:16): no raster sketch any more. Around the CI window the photo melts to black behind one soft, wavy front
   that spreads from the window (screen space, device px); the vector drawing (LN, below) is drawn by the same front */
const FRU = { uFC:{value:new THREE.Vector2()}, uFR:{value:-1e5}, uFW:{value:160}, uFN:{value:1 / 230}, uFS:{value:140} };
const SKGL = `
  vec3 s2l(vec3 c){ return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(.04045, c)); }   /* raw sRGB texel → linear */
  uniform vec2 uFC; uniform float uFR; uniform float uFW; uniform float uFN; uniform float uFS;
  float skH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float skN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(skH(i), skH(i + vec2(1., 0.)), f.x), mix(skH(i + vec2(0., 1.)), skH(i + 1.), f.x), f.y); }
  float skR(){ vec2 p = gl_FragCoord.xy;
    float d = length(p - uFC) + uFW * (skN(p * uFN + 1.7) * .75 + skN(p * uFN * 2.7 + 4.1) * .25 - .5);
    return 1. - smoothstep(uFR - uFS, uFR, d); }
  vec3 skMix(vec3 col, vec3 sk, vec2 uv, float k){ if (k <= 0.) return col; return col * (1. - skR()); }`;

function skyMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({ map:{value:tex}, uTime:U.time, uLift:{value:1}, skMap:{value:null}, uSk:{value:0}, uCityK:{value:.3}, uCityOut:{value:0}, uCityMode:{value:0} }, FRU),
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uTime; uniform float uLift; uniform sampler2D skMap; uniform float uSk; uniform float uCityK; uniform float uCityOut; uniform float uCityMode; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      ${SKGL}
      void main(){
        vec4 c = texture2D(map, vUv); c.rgb = s2l(c.rgb);
        float l = dot(c.rgb, vec3(.299,.587,.114));
        float m = smoothstep(.36, .8, l);                          /* city lights only */
        vec2 cell = floor(vUv * vec2(900., 650.));
        float t = uTime * 1.6 + h(cell) * 6.283;
        float tw = .72 + .28 * sin(t) * sin(t * .37 + h(cell + 3.1) * 4.0);
        float sp = pow(max(0., sin(uTime * (.7 + 1.5 * h(cell + 7.)) + h(cell) * 40.)), 26.) * step(.62, h(cell + 1.7));   /* glints */
        c.rgb *= mix(1., tw, m) * uLift;
        c.rgb += c.rgb * m * (.62 + 2.2 * sp);                     /* lights feed the bloom, some sparkle */
        if (uSk > 0.){                                              /* the city stays in the drawing: quiet, colourless (user 03.11 16:24) */
          float r = skR(), g;
          if (uCityMode > .5){ vec3 sk = texture2D(skMap, vUv).rgb; g = .55 * pow(clamp((pow(max(sk.g, 0.), 1. / 2.2) - .13) / .76, 0., 1.), 2.2); }
          else { g = dot(c.rgb, vec3(.2126, .7152, .0722)); g = uCityK * g / (1. + .9 * g); }   /* soft highlights: the lights stay quiet */
          c.rgb = mix(c.rgb, vec3(.93, .96, 1.) * g * (1. - uCityOut), r);
        }
        gl_FragColor = c;
        #include <colorspace_fragment>
      }`,
    depthWrite: false
  });
}
function facadeMat(tex, win){
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({ map:{value:tex}, winMap:{value:win}, winMask:{value:null}, uTime:U.time, uLife:{value:1}, skMap:{value:null}, uSk:{value:0} }, FRU),
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform sampler2D winMap; uniform sampler2D winMask; uniform float uTime; uniform float uLife;
      uniform sampler2D skMap; uniform float uSk; varying vec2 vUv;
      ${SKGL}
      void main(){ vec4 c = texture2D(map, vUv); if (c.a < .5) discard; c.rgb = s2l(c.rgb);
        vec3 w = texture2D(winMap, vUv).rgb; float id = w.r, m = texture2D(winMask, vUv).r;
        vec3 col = c.rgb;
        if (id > .002){
          float h1 = fract(id * 91.7), h2 = fract(id * 13.31 + .2), h3 = fract(id * 47.13 + .5);
          /* ~1 in 6 windows: a warm lamp slowly comes on and goes off (periods 9–18 s) */
          float lamp = h1 < .15 ? smoothstep(.15, .85, .5 + .5 * sin(uTime * (.3 + .3 * h2) + h3 * 6.283)) * (.11 + .08 * h2) : 0.;
          /* ~1 in 25: the cool, soft flicker of a TV */
          float tv = h1 > .975 ? (.05 + .025 * sin(uTime * 6.1 + h3 * 20.) + .015 * sin(uTime * 2.3 + h2 * 9.)) : 0.;
          vec3 warm = vec3(1., .5, .18) * (.8 + .2 * h3);
          vec3 tex = .45 + 3.5 * c.rgb;                                       /* keep the glass / curtain texture */
          col += m * (warm * lamp * tex + vec3(.35, .5, .9) * tv * tex) * uLife;
          /* windows that are already lit breathe a little */
          float lit = smoothstep(.12, .35, c.r - c.b) * smoothstep(.15, .4, c.r);
          col *= 1. + lit * .1 * sin(uTime * .7 + id * 40.) * uLife;
        }
        if (uSk > 0.) col = skMix(col, texture2D(skMap, vUv).rgb, vUv, uSk);
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }`
  });
}
function basicTex(tex, opts){ return new THREE.MeshBasicMaterial(Object.assign({ map: tex, transparent: true, toneMapped: false }, opts || {})); }

function unitLitMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: Object.assign({ map:{value:tex}, uOp:{value:0}, uGain:{value:1}, skMap:{value:null}, uSk:{value:0}, uCU:{value:new THREE.Vector4(0, 0, 1, 1)} }, FRU),
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uOp; uniform float uGain; uniform sampler2D skMap; uniform float uSk; uniform vec4 uCU; varying vec2 vUv;
      ${SKGL}
      void main(){ vec4 c = texture2D(map, vUv); vec3 col = s2l(c.rgb);
        float warm = smoothstep(.25,.8,dot(col, vec3(.5,.35,.15)));
        col *= mix(1., uGain, warm);
        if (uSk > 0. && (vUv.x < uCU.x || vUv.x > uCU.z || vUv.y < uCU.y || vUv.y > uCU.w)) col = skMix(col, vec3(0.), vUv, uSk);   /* only past the outline */
        gl_FragColor = vec4(col, c.a * uOp);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false
  });
}
/* the room photo is a relief, not a flat card: every vertex is pushed along its ray from the final eye position by the
   hand-built depth map (room_depth.png, metres) → from the final pose it is exactly the photo, and any camera move
   (mouse, the dive) shows real parallax: the sofa slides past the doorway, the dining room and the wine wall stay deep */
function roomMat(tex, dep, near){
  return new THREE.ShaderMaterial({
    defines: near ? { NEAR: 1 } : {},
    uniforms: { map:{value:tex}, dmap:{value:dep}, uEye:{value:new THREE.Vector3()}, uDK:{value:1}, uLight:{value:0}, uGain:{value:1}, uRaw:{value:0},
                skMap:{value:null}, uSk:{value:0}, uSkOk:{value:0} },
    transparent: !!near, depthWrite: !near,
    vertexShader: `uniform sampler2D dmap; uniform vec3 uEye; uniform float uDK; varying vec2 vUv;
      void main(){ vUv = position.xy + .5;                       /* = uv on the room plane; the near layer runs a bit past it */
        vec4 wp = modelMatrix * vec4(position, 1.);
        vec4 dd = textureLod(dmap, vUv, 0.);
        #ifdef NEAR
        float D = 1. + dd.g * 5.5;
        #else
        float D = 1. + dd.r * 5.5;                                   /* metres; the doorway wall (3.5 m) stays on the plane */
        #endif
        float s = pow(D / 3.5, .8);
        wp.xyz = uEye + (wp.xyz - uEye) * mix(1., s, uDK);
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform sampler2D map; uniform sampler2D dmap; uniform float uLight; uniform float uGain; uniform float uRaw;
      uniform sampler2D skMap; uniform float uSk; uniform float uSkOk; varying vec2 vUv;
      ${SKGL}
      void main(){ vec3 c = texture2D(map, vUv).rgb;
        c = uRaw > .5 ? pow(pow(c, vec3(1.08)) * .9, vec3(2.2)) : s2l(c);   /* a hero photo: its grade; the room 1450_34: plain sRGB → linear */
        #ifdef NEAR
        float al = texture2D(dmap, vUv).b; if (al < .004) discard;   /* the cut-out of the near furniture */
        #else
        float al = 1.;
        #endif
        vec3 night = c * vec3(1.08, .88, .66) * .8;               /* seen from outside at night: warm, dimmer */
        vec3 col = mix(c, night, 1. - uLight) * uGain;
        if (uSk > 0.){ vec3 sk = uSkOk > .5 ? texture2D(skMap, vUv).rgb : vec3(0.);
          col = skMix(col, sk, vUv, uSk); }
        gl_FragColor = vec4(col, al);
        #include <colorspace_fragment>
      }`
  });
}
function logoMat(tex){
  return new THREE.ShaderMaterial({
    uniforms: { map:{value:tex}, uProg:{value:0}, uOp:{value:0}, uAsp:{value:F.MARK.w / F.MARK.h}, uGain:{value:1}, uGlint:{value:-3}, uSpark:{value:0}, uHalo:{value:.5}, uSoft:{value:.04} },
    vertexShader: vtx,
    fragmentShader: `uniform sampler2D map; uniform float uProg; uniform float uOp; uniform float uAsp; uniform float uGain; uniform float uGlint; uniform float uSpark; uniform float uHalo; uniform float uSoft; varying vec2 vUv;
      void main(){ vec4 c = texture2D(map, vUv);
        /* a thin halo from the logo's own alpha (no global bloom on the letters → they stay crisp) */
        vec2 px = vec2(1. / 601., 1. / 687.); float h = 0.;
        for (int i = 0; i < 8; i++){ float an = float(i) * .785398; vec2 o = vec2(cos(an), sin(an));
          h += texture2D(map, vUv + o * px * 4.).a + texture2D(map, vUv + o * px * 9.).a * .5; }
        h /= 12.;
        float halo = max(h - c.a, 0.) * uHalo;
        vec2 p = vec2((vUv.x - .5) * uAsp, -(vUv.y - .5));
        float a = fract(atan(p.y, p.x) / 6.2831853 + 1.);              /* 0 at the right, clockwise on screen */
        float edge = uProg >= .999 ? 1. : smoothstep(uProg + .002, uProg - uSoft, a);   /* a soft sweep, not a hard cut */
        float head = exp(-abs(a - uProg) * 40.) * uSpark;
        float g = p.x * .9 - p.y * .55 - uGlint;                        /* a thin diagonal glint across the letters */
        float glint = exp(-g * g / .0012);
        float body = c.a, al = max(body, halo) * edge * uOp;
        vec3 col = mix(vec3(1.), c.rgb, body) * (uGain * .9 + (.5 * glint + .45 * head) * body);
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
  uniforms: { tDiffuse:{value:null}, uTime:{value:0}, uFade:{value:0}, uAb:{value:0}, uVig:{value:.32}, uRes:{value:new THREE.Vector2(1,1)},
              uSk:{value:0}, uKeep:{value:0}, uWin:{value:new THREE.Vector4(0,0,0,0)} },
  vertexShader: vtx,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform float uFade; uniform float uAb; uniform float uVig; uniform vec2 uRes;
    uniform float uSk; uniform float uKeep; uniform vec4 uWin; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){
      vec2 d = vUv - .5; float r2 = dot(d, d);
      vec2 o = d * uAb * r2;
      vec3 c = vec3(texture2D(tDiffuse, vUv + o).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - o).b);
      c *= 1. - uVig * smoothstep(.12, .62, r2 * 1.6);
      if (uKeep > 0.){                                                                /* keep only the CI window */
        vec2 pw = vec2(14.) / uRes;
        float inW = smoothstep(uWin.x - pw.x, uWin.x, vUv.x) * smoothstep(uWin.z + pw.x, uWin.z, vUv.x)
                  * smoothstep(uWin.y - pw.y, uWin.y, vUv.y) * smoothstep(uWin.w + pw.y, uWin.w, vUv.y);
        c = mix(c, vec3(0.), uKeep * (1. - inW));                                 /* black */
      }
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
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000);
  camera = new THREE.PerspectiveCamera(FOV, 1, 1, 30000);
  U.time = { value: 0 };

  const hi = hiDPI(), base = 'assets/v15/gl/';
  /* v7.2 (user 03.11 16:23, "the start lags a little"): everything the intro shows is uploaded here, under the still,
     never during the flight; sRGB pictures go up raw (3x cheaper on ANGLE/Metal) and are decoded in the shaders. On large
     screens the 2x sky/facade join if they arrive within 1 s of the rest, else the 1x fly and the 2x swap in after the intro. */
  const big = hi ? '2k' : '1k';
  const x2 = hi ? Promise.all([loadTexRaw(base + 'sky_2x.jpg'), loadTexRaw(base + 'facade_2x.webp')]).catch(() => null) : null;
  const [tSky1, tFac1, tUD, tUL, tJamb, tLogo, tWin, tWinM, tDep, tRoom, tRoomBg] = await Promise.all([
    loadTexRaw(base + 'sky_1x.jpg'), loadTexRaw(base + 'facade_1x.webp'), loadTex(base + 'unit_dark.jpg'), loadTexRaw(base + 'unit_lit.webp'),
    loadTex(base + 'jamb.jpg'), loadTex('assets/v15/logo_db.png'), loadTexLin(base + 'facade_win.png', true), loadTexLin(base + 'facade_winmask.webp'),
    new Promise((res, rej) => new THREE.TextureLoader().load(base + 'room_depth.png', t => { t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; res(t); }, undefined, rej)),
    loadTexRaw('assets/v15/room_' + big + '.jpg'), loadTexRaw(base + 'room_bg_' + big + '.jpg')
  ]);
  const two = x2 ? await Promise.race([x2, new Promise(r => setTimeout(() => r(null), 1000))]) : null;
  const tSky = two ? two[0] : tSky1, tFac = two ? two[1] : tFac1;
  if (x2 && !two) x2.then(v => { if (v) LATE.x2 = v; });
  layoutCamera();
  const clipEdge = [ new THREE.Plane(new THREE.Vector3(-1, 0, 0), F.EDGE - .5) ];       /* keep things left of the corner */

  M.sky = rectPlane(skyMat(tSky), { x:F.RX, y:F.RY, w:F.RW, h:F.RH }, SKYZ, true); M.sky.userData.over = 1.04; placeRect(M.sky); M.sky.renderOrder = 0; scene.add(M.sky);
  const facW = tFac.image.width / tSky.image.width * F.RW;
  M.fac = rectPlane((() => { const m = facadeMat(tFac, tWin); m.uniforms.winMask.value = tWinM; return m; })(), { x:F.RX - F.EXT, y:F.RY, w:facW, h:F.RH }, 0, false); M.fac.renderOrder = 5; scene.add(M.fac);
  /* the building's side wall round the corner: the facade texture repeated, in shadow, receding into the city */
  const SIDE = 2200;
  const tSide = M.tSide = tFac.clone(); tSide.wrapS = THREE.RepeatWrapping; tSide.repeat.set(SIDE / facW * .9, 1); tSide.offset.set(.05, 0); tSide.needsUpdate = true;
  M.side = new THREE.Mesh(new THREE.PlaneGeometry(SIDE, F.RH), new THREE.MeshBasicMaterial({ map: tSide, color: new THREE.Color(SIDEC[0], SIDEC[1], SIDEC[2]), alphaTest: .5, toneMapped: false }));
  M.side.rotation.y = Math.PI / 2; M.side.position.set(F.EDGE, -(F.RY + F.RH / 2), -SIDE / 2); M.side.renderOrder = 5; scene.add(M.side);
  /* recess: unit planes at −DEPTH, jambs between */
  const P = F.PATCH;
  M.ud = rectPlane(new THREE.MeshBasicMaterial({ map: tUD, transparent: true, depthWrite: false, toneMapped: false }), P, -DEPTH, false); M.ud.renderOrder = 3; scene.add(M.ud);
  M.ul = rectPlane(unitLitMat(tUL), P, -DEPTH + .5, false); M.ul.renderOrder = 4; scene.add(M.ul);
  M.ul.material.uniforms.uCU.value.set((F.OL.x - P.x) / P.w, 1 - (F.OL.y + F.OL.h - P.y) / P.h, (F.OL.x + F.OL.w - P.x) / P.w, 1 - (F.OL.y - P.y) / P.h);
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
  /* two layers: the room (furniture near us painted out) and, on top, the near furniture cut out — sofa, lamp, coffee
     table — each on its own depth, so the sofa really slides in front of the room instead of dragging it along */
  tRoom.minFilter = tRoomBg.minFilter = THREE.LinearMipmapLinearFilter;
  const roomGeo = new THREE.PlaneGeometry(1.12, 1.12, 224, 162);       /* edge texels stretch a little past the photo */
  M.room = new THREE.Mesh(roomGeo, roomMat(tRoomBg, tDep, 0)); M.room.material.clippingPlanes = clipEdge;
  M.room.position.set(H.x, H.y, ROOMZ); M.room.renderOrder = 1; scene.add(M.room);
  M.roomN = new THREE.Mesh(roomGeo, roomMat(tRoom, tDep, 1)); M.roomN.material.clippingPlanes = clipEdge;
  M.roomN.position.set(H.x, H.y, ROOMZ); M.roomN.renderOrder = 1.5; scene.add(M.roomN);
  [M.room, M.roomN].forEach(m => m.material.uniforms.uEye.value.set(H.x, H.y, ZEND));
  Object.assign(ROOMS, { bg: tRoomBg, o: tRoom, d: tDep, ar: ROOM_AR, k: 1.13, cur: -1 });
  /* a dark interior behind the photo: while the camera is in the window, rays that miss the photo hit this, not the city */
  M.roomBack = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshBasicMaterial({ color: 0x0c0a08, clippingPlanes: clipEdge, toneMapped: false }));
  M.roomBack.position.set(H.x, H.y, ROOMZ - 600); M.roomBack.renderOrder = .9; scene.add(M.roomBack);
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
  buildLines();
  if (/[?&]city=pencil/.test(location.search))                    /* option: the 02.11 pencil city instead of the quiet photo */
    new THREE.TextureLoader().load(base + 'sky_city_pencil.webp', t => { t.colorSpace = THREE.SRGBColorSpace; const u = M.sky.material.uniforms; u.skMap.value = t; u.uCityMode.value = 1; });

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .6, .38, .86); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  finalPass = new ShaderPass(FinalShader); composer.addPass(finalPass);
  resize();
  window.addEventListener('resize', resize);
  [tSky, tFac, tSide, tUD, tUL, tJamb, tRoom, tRoomBg, tLogo, tWin, tWinM, tDep].forEach(t => renderer.initTexture(t));
  renderer.compile(scene, camera); renderer.compile(LN.scene, camera);
  finalPass.uniforms.uFade.value = 0; composer.render(); composer.render();
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
  scaleRoom(); lineSize();
  if (SLD.ps) SLD.ps.forEach(ps => ps && layoutPhoto(ps));
}
const ZEND = -40;
/* room plane: covers the view from the final pose (camera at z = ZEND); a little overscan for the mouse parallax */
const ROOMS = { cur: -1, ar: 2400 / 1729, k: 1.13 };
function scaleRoom(){
  const dist = ZEND - ROOMZ, visH = 2 * dist * TAN, visW = visH * camera.aspect;
  const h = Math.max(visH, visW / ROOMS.ar) * ROOMS.k, w = h * ROOMS.ar;
  M.room.scale.set(w, h, 1); M.roomN.scale.set(w, h, 1);
}
function setRoomSk(sk, ok){ const ub = M.room.material.uniforms, un = M.roomN.material.uniforms; ub.skMap.value = sk.b; un.skMap.value = sk.o; ub.uSkOk.value = un.uSkOk.value = ok; }
/* the room behind the CI window shows room 1450_34 (i = −1) or hero photo i (its relief), so the story can fly out of any slide */
function setRoom(i){
  if (!M.room || ROOMS.cur === i) return;
  const t = i >= 0 && SLD.trip ? SLD.trip[i] : null, ub = M.room.material.uniforms, un = M.roomN.material.uniforms;
  ROOMS.cur = t ? i : -1;
  if (t){
    ub.map.value = t.b; un.map.value = t.o; ub.dmap.value = un.dmap.value = t.d; ub.uRaw.value = un.uRaw.value = 1; ROOMS.ar = t.o.image.width / t.o.image.height; ROOMS.k = 1.10;
    ub.uSkOk.value = un.uSkOk.value = 0;
  }
  else { ub.map.value = ROOMS.bg; un.map.value = ROOMS.o; ub.dmap.value = un.dmap.value = ROOMS.d; ub.uRaw.value = un.uRaw.value = 0; ROOMS.ar = ROOM_AR; ROOMS.k = 1.13;
    if (ROOMS.skb) setRoomSk({ b: ROOMS.skb, o: ROOMS.sko }, 1); else ub.uSkOk.value = un.uSkOk.value = 0; }
  scaleRoom();
}
const MP_OUT = 205, MP_IN = 32, MP_PH = 28;   /* … and on the hero photos */   /* mouse parallax: camera slide at the screen edge (×0.5), outside / in the room */

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
  /* mouse parallax: the camera slides with the cursor but keeps looking at a pivot point on its view axis —
     outside the pivot is 400 behind the facade (the tower drifts one way, the city the other), inside it is the
     doorway wall (the sofa slides one way, the dining room and the wine wall the other) */
  const dk = sm(Math.min(1, dive * 2.2)), mp = lerp(MP_OUT, MP_IN, dk);
  v3.set(lx - x, ly - y, lz - z); const L = v3.length(); v3.multiplyScalar((L + 520 * (1 - dk)) / L);
  look.set(x + v3.x, y + v3.y, z + v3.z);
  camera.position.set(x - mx * mp, y + my * mp * .7, z); camera.lookAt(look);
  return dive;
}

let lastT = null;
function skyK(e){ const k = (Zc - SKYZ) / Zc * (M.sky.userData.over || 1) * e; M.sky.scale.set(k, k, 1); }
function render3d(t, T, mx, my, scroll, toTex){
  lastT = T;
  if (SK.on){ SK.on = false; skyK(1); setSk(0); FRU.uFR.value = -1e5; finalPass.uniforms.uKeep.value = 0; }
  U.time.value = performance.now() / 1000;
  const dive = pose(t, T, mx || 0, my || 0, scroll || 0);
  /* frame 15: the logo draws clockwise, then shines (glint, brighter bloom), then erases counter-clockwise */
  const draw = sm((t - T.logoA) / (T.logoB - T.logoA)), er = sm((t - T.outA) / (T.outB - T.outA));
  const shine = clamp01((t - T.shineA) / (T.shineB - T.shineA)), shK = Math.sin(Math.PI * shine);
  const prog = t < T.outA ? draw : 1 - er, lvis = draw > 0 && er < 1 ? 1 : 0;
  const lu = M.logo.material.uniforms;
  lu.uProg.value = prog; lu.uOp.value = lvis * (1 - Math.pow(er, 1.4));
  lu.uSoft.value = t < T.outA ? .05 : .05 + .1 * er;
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
  for (const m of [M.room, M.roomN]){
    m.material.uniforms.uLight.value = sm((t - T.push - .35) / .9);
    m.material.uniforms.uGain.value = lit * (1 + .18 * bloomK);
  }
  /* the glass unit dissolves as the camera reaches the window */
  const cz = camera.position.z, through = 1 - clamp01((cz - 6) / 70);
  if (through > 0){ M.ul.material.uniforms.uOp.value = lit * (1 - through); M.ud.material.opacity *= (1 - through); }
  M.spill.material.uniforms.uOp.value = lit * (.32 + .25 * bloomK) * (1 - sm(dive * 2.2));
  /* post */
  bloom.strength = .5 + .22 * bloomK;
  finalPass.uniforms.uTime.value = U.time.value;
  finalPass.uniforms.uFade.value = PRE3D.noFade || PRE3D.still ? 1 : sm(t / T.fadeIn);   /* opened on the still: no fade from black */
  life(); if (LATE.x2 && t > T.end) lateSwap();
  finalPass.uniforms.uAb.value = .022 * Math.sin(Math.PI * clamp01(dive * 1.1));
  if (toTex){ composer.renderToScreen = false; composer.render(); composer.renderToScreen = true; return composer.readBuffer.texture; }
  composer.render();
}

/* ---------------------------------------------------------------- the story (blocks 2–3), scroll-driven
   From the hero the camera flies back out: out of the room, through the window (the intro's dive reversed), then pulls
   back from the facade on the window's axis; the golden outline draws round the window again (counter-clockwise); the
   picture redraws itself as an ink sketch, everything but the CI window fades, and site.js takes over with the squares.
   o: { fly 0..1, ol 0..1 (outline drawn), olOp, sketch 0..1, keep 0..1, mx, my, T } */
const SK = { on: false }, SPLIT = .58, SKZ = 1.28;
const SIDEC = [.065, .067, .085];   /* the side wall's shade (its texture is raw sRGB, read as linear) */
function storyFrame(o){
  const T = o.T; lastT = T; SK.on = true;
  U.time.value = performance.now() / 1000;
  const f = clamp01(o.fly || 0), mx = o.mx || 0, my = o.my || 0;
  /* the camera stays on the window's axis and backs away: distance to the room plane grows geometrically (an even zoom rate),
     shaped so the first part — out of the room, through the glass — takes its time and the end settles */
  /* stop where the CI window is exactly the size of the text square (o.winPx), not back at the drone view (user 03.11 08:50) */
  const winPx = o.winPx || 380, zEnd = F.OL.w * vh / (2 * TAN * winPx);
  const g = Math.pow(sm(f), 1.6), dIn = (ZEND - ROOMZ) * (1 - (o.push || 0)), dOut = zEnd - ROOMZ;
  const dist = dIn * Math.pow(dOut / dIn, g), z = ROOMZ + dist;
  const out = sm((dist - 290) / Math.max(120, (dOut - 290) * .8)), mp = lerp(MP_IN, Math.max(MP_IN, z * .1), out);   /* parallax scales with the distance */
  camera.position.set(H.x - mx * mp, H.y + my * mp * .7, z); look.set(H.x, H.y, lerp(ROOMZ, -520, out)); camera.lookAt(look);
  const dive = 1 - out, u = 0;
  skyK(1 + .32 * u);
  const lu = M.logo.material.uniforms; lu.uOp.value = 0; lu.uSpark.value = 0; M.shadow.material.uniforms.uOp.value = 0;
  const ol = clamp01(o.ol || 0); M.ol.material.uniforms.uOp.value = 0;            /* v7: the gold outline is retired; a hairline draws it (LN.ol) */
  M.ud.material.opacity = 0;
  M.ul.material.uniforms.uOp.value = 1; M.ul.material.uniforms.uGain.value = 1;
  for (const m of [M.room, M.roomN]){ m.material.uniforms.uLight.value = 1 - out; m.material.uniforms.uGain.value = 1; }
  const cz = camera.position.z, through = 1 - clamp01((cz - 6) / 70);
  if (through > 0) M.ul.material.uniforms.uOp.value = 1 - through;
  M.spill.material.uniforms.uOp.value = .32 * (1 - sm(dive * 2.2));
  bloom.strength = .5;
  const fu = finalPass.uniforms;
  fu.uTime.value = U.time.value; fu.uFade.value = 1; fu.uAb.value = 0;            /* no colour fringes */
  life();
  const draw = clamp01(o.draw || 0), back = clamp01(o.out || 0); setSk(draw); bloom.strength = .5 * (1 - .6 * draw);
  M.sky.material.uniforms.uCityOut.value = back;                                  /* the city goes with the drawing */
  fu.uKeep.value = 0;
  const r = winRect(); fu.uWin.value.set(r.x0 / vw, 1 - r.y1 / vh, r.x1 / vw, 1 - r.y0 / vh);
  /* the front: from the CI window's centre out past the farthest corner of the screen (device px) */
  const pr = renderer.getPixelRatio(), fcx = (r.x0 + r.x1) / 2 * pr, fcy = (vh - (r.y0 + r.y1) / 2) * pr;
  const rmax = Math.hypot(Math.max(fcx, vw * pr - fcx), Math.max(fcy, vh * pr - fcy));
  FRU.uFC.value.set(fcx, fcy); FRU.uFW.value = 260 * pr; FRU.uFN.value = 1 / (300 * pr); FRU.uFS.value = 340 * pr;   /* a wide, soft, wavy band */
  LNU.uLCap.value = 260 * pr; LNU.uLMax.value = rmax;
  const span = rmax + FRU.uFW.value + FRU.uFS.value, lspan = rmax + FRU.uFW.value + LNU.uLCap.value * LNU.uLSp.value + .35 * FRU.uFS.value;
  FRU.uFR.value = draw > 0 ? lerp(-FRU.uFW.value, span, draw) : -1e5;
  LNU.uLR.value = draw > 0 ? lerp(-FRU.uFW.value, lspan, draw) - .35 * FRU.uFS.value : -1e5;          /* lines surface inside the band */
  LNU.uLR2.value = back > 0 ? lerp(lspan, -FRU.uFW.value - 2, back) : 1e9;
  LNU.uOL.value = ol; LN.ol.material.uniforms.uOp.value = o.olOp == null ? 1 : o.olOp;
  LN.fac.visible = draw > 0 && back < 1; LN.ol.visible = ol > 0 && LN.ol.material.uniforms.uOp.value > 0;
  renderer.setRenderTarget(null);
  if (o.toTex){ composer.renderToScreen = false; composer.render(); composer.renderToScreen = true; return r; }
  composer.render();
  if (LN.fac.visible || LN.ol.visible){ renderer.autoClear = false; renderer.render(LN.scene, camera); renderer.autoClear = true; }
  return r;
}
/* the photo around the CI window melts with the front; the window itself stays a live photo (user 03.11 10:21);
   the stone in the recess, the side wall and the light spill go dark as soon as the front leaves the window */
function setSk(k){
  for (const m of [M.sky, M.fac, M.ul]) m.material.uniforms.uSk.value = k > 0 ? 1 : 0;   /* M.ul: only outside the outline */
  for (const m of [M.room, M.roomN]) m.material.uniforms.uSk.value = 0;
  const j = clamp01(k * 4);
  M.side.material.color.setRGB(SIDEC[0] * (1 - j), SIDEC[1] * (1 - j), SIDEC[2] * (1 - j));
  M.jamb.children.forEach(q => q.material.color.setHex(0x6a5f58).multiplyScalar(1 - j));
  if (k > 0) M.spill.material.uniforms.uOp.value *= 1 - j;
}
/* the drawings load quietly after the slider has warmed up (≈ 2.3 MB); a hero photo's drawing loads when the story starts from it */
/* ---------------------------------------------------------------- v7: the drawing, in true vector hairlines
   An architect's elevation of the facade, built from the facade's own grid (facade_win.png: 7 floors, 5 triple + 4 single bays),
   in 3D: openings on the face, the glass 14 units back with its mullions and transoms, the recess corners joining them, the
   two-storey surrounds with their caps, sills and spandrels, the flat arches over the single windows, the building's corner;
   dashed: the floor lines and the CI window's own guides. 1 CSS px, CI Bright Gray, no glow, rendered after the post (MSAA).
   Every segment grows from its end nearer the CI window as the front passes it, and later retracts into the window. */
const LN = { on: false, mats: [] };
const LNU = { uLC: FRU.uFC, uLR:{value:-1e5}, uLR2:{value:1e9}, uLW: FRU.uFW, uLN: FRU.uFN, uLSp:{value:1.5}, uLCap:{value:260}, uLMax:{value:1000},
              uOL:{value:0}, uInk:{value:new THREE.Color(0xEBEBEB)} };
const LNV = `
  uniform vec2 uLC; uniform float uLR; uniform float uLR2; uniform float uLW; uniform float uLN; uniform float uLSp; uniform float uLCap; uniform float uLMax;
  uniform float uSeq; uniform float uOL;
  varying float vVis; varying float vB;
  float lnH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float lnN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
    return mix(mix(lnH(i), lnH(i + vec2(1., 0.)), f.x), mix(lnH(i + vec2(0., 1.)), lnH(i + 1.), f.x), f.y); }
`;
const LNCUT = `
  { vec4 cs = projectionMatrix * start, ce = projectionMatrix * end;
    vec2 ps = (cs.xy / cs.w * .5 + .5) * resolution, pe = (ce.xy / ce.w * .5 + .5) * resolution;
    float kk; vB = instanceColorStart.r;
    if (uSeq > .5) kk = clamp(uOL * 4. - instanceColorStart.g * 4., 0., 1.);           /* the window's outline: edge after edge */
    else {
      float d0 = length(ps - uLC), ds = d0 + uLW * (lnN(ps * uLN + 1.7) * .75 + lnN(ps * uLN * 2.7 + 4.1) * .25 - .5);
      float lc = min(max(length(pe - ps), 1.), uLCap) * uLSp;
      kk = min(clamp((uLR - ds) / lc, 0., 1.), clamp((uLR2 - ds) / lc, 0., 1.));
      vB *= 1. - .55 * smoothstep(.3, 1., d0 / uLMax);                                  /* quieter towards the edges */
    }
    vVis = kk > .002 ? 1. : 0.;
    end = mix(start, end, kk);
    #ifdef USE_DASH
    vLineDistance = dashScale * mix(instanceDistanceStart, instanceDistanceEnd, position.y < .5 ? 0. : kk);
    #endif
  }
`;
function lineMat(o){
  const m = new LineMaterial({ color: 0xffffff, linewidth: 1, vertexColors: true, transparent: true, depthTest: false, depthWrite: false,
                               dashed: !!o.dash, dashSize: o.dash || 1, gapSize: o.gap || 1 });
  Object.assign(m.uniforms, LNU, { uSeq: { value: o.seq ? 1 : 0 }, uOp: { value: 1 } });
  m.vertexShader = m.vertexShader.replace('void main() {', LNV + '\nvoid main() {')
    .replace('vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );', 'vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );' + LNCUT);
  m.fragmentShader = m.fragmentShader.replace('void main() {', 'uniform vec3 uInk; uniform float uOp; varying float vVis; varying float vB;\nvoid main() {')
    .replace('gl_FragColor = vec4( diffuseColor.rgb, alpha );', 'gl_FragColor = vec4( uInk, alpha * vB * vVis * uOp );');
  if (m.vertexShader.indexOf('uLR2') < 0 || m.fragmentShader.indexOf('uInk') < 0) console.warn('[pre3d] line shader patch failed');
  m.userData.lw = o.lw || 1; LN.mats.push(m);
  return m;
}
function lineObj(segs, mat){
  const g = new LineSegmentsGeometry(), pos = new Float32Array(segs.length * 6), col = new Float32Array(segs.length * 6);
  segs.forEach((q, i) => { pos.set(q.slice(0, 6), i * 6); col.set([q[6], q[7] || 0, 0, q[6], q[7] || 0, 0], i * 6); });
  g.setPositions(pos); g.setColors(col);
  const o = new LineSegments2(g, mat); if (mat.dashed) o.computeLineDistances(); o.frustumCulled = false; o.renderOrder = 20;
  return o;
}
function facadeLines(){
  /* facade texture px (x → right, y → down) to world: x − 969, 251 − y; the CI window = F.OL */
  const ROWS = [[8,168],[234,400],[475,629],[707,870],[940,1090],[1156,1302],[1363,1474]];
  const TRI = [[[67,100],[120,190],[209,232]], [[523,556],[576,646],[665,688]], [[979,1012],[1032,1102],[1121,1144]],
               [[1383,1413],[1433,1508],[1528,1566]], [[1843,1869],[1890,1966],[1986,2009]]];
  const ONE = [[315,406],[771,862],[1227,1318],[1661,1757]];
  const CIX0 = F.OL.x + 969, CIX1 = CIX0 + F.OL.w, CIY0 = F.OL.y + 251, CIY1 = CIY0 + F.OL.h, CORNER = F.EDGE + 969;
  const cx = F.OL.x + F.OL.w / 2, cy = -(F.OL.y + F.OL.h / 2), S = [], D = [], O = [];
  const put = (arr, ax, ay, az, bx, by, bz, B) => {
    let p = [ax - 969, 251 - ay, az], q = [bx - 969, 251 - by, bz];
    const dx = q[0] - p[0], dy = q[1] - p[1], L2 = dx * dx + dy * dy, t = L2 > 0 ? ((cx - p[0]) * dx + (cy - p[1]) * dy) / L2 : 0;
    if (t > .02 && t < .98){                                                          /* passes the window: grow both ways from it */
      const m = [p[0] + dx * t, p[1] + dy * t, p[2] + (q[2] - p[2]) * t];
      arr.push([m[0], m[1], m[2], p[0], p[1], p[2], B], [m[0], m[1], m[2], q[0], q[1], q[2], B]); return;
    }
    if (Math.hypot(q[0] - cx, q[1] - cy) < Math.hypot(p[0] - cx, p[1] - cy)) { const u = p; p = q; q = u; }
    arr.push([p[0], p[1], p[2], q[0], q[1], q[2], B]);
  };
  const ln = (ax, ay, bx, by, B, z = 0, arr = S) => put(arr, ax, ay, z, bx, by, z, B);
  const rect = (x0, y0, x1, y1, B, z = 0, arr = S) => { ln(x0, y0, x1, y0, B, z, arr); ln(x1, y0, x1, y1, B, z, arr); ln(x1, y1, x0, y1, B, z, arr); ln(x0, y1, x0, y0, B, z, arr); };
  const GZ = -14, IN = 3;
  const pane = (x0, x1, y0, y1) => {
    rect(x0, y0, x1, y1, .42);                                                       /* the opening */
    rect(x0 + IN, y0 + IN, x1 - IN, y1 - IN, .17, GZ);                               /* the glass, set back */
    for (const [a, b, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x1, y1, -1, -1], [x0, y1, 1, -1]]) put(S, a, b, 0, a + sx * IN, b + sy * IN, GZ, .15);
    const ty = y0 + .23 * (y1 - y0); ln(x0 + IN, ty, x1 - IN, ty, .14, GZ);          /* transom */
    if (x1 - x0 >= 60) ln((x0 + x1) / 2, y0 + IN, (x0 + x1) / 2, y1 - IN, .14, GZ);   /* mullion */
  };
  ROWS.forEach((r, ri) => {
    TRI.forEach((g, gi) => { if (ri === 3 && gi === 4) return; g.forEach(q => pane(q[0], q[1], r[0], r[1])); });
    ONE.forEach(q => {
      pane(q[0], q[1], r[0], r[1]);
      rect(q[0] - 8, r[1] + 4, q[1] + 8, r[1] + 11, .22);                              /* sill */
      const yb = r[0] - 2, yt = r[0] - 24, a0 = q[0] - 2, a1 = q[1] + 2, b0 = q[0] - 5, b1 = q[1] + 5;     /* flat arch */
      ln(b0, yt, b1, yt, .18); ln(a0, yb, b0, yt, .14); ln(a1, yb, b1, yt, .14);
      for (let k = 1; k < 9; k++){ const t = k / 9; if (k === 4 || k === 5) continue; ln(a0 + (a1 - a0) * t, yb, b0 + (b1 - b0) * t, yt, .08); }
      ln(a0 + (a1 - a0) * 4 / 9, yb, b0 + (b1 - b0) * 4 / 9, yt, .14); ln(a0 + (a1 - a0) * 5 / 9, yb, b0 + (b1 - b0) * 5 / 9, yt, .14);   /* keystone */
    });
  });
  [[0, 1], [2, 3], [4, 5], [6, -1]].forEach(([a, b]) => {                             /* two-storey surrounds of the triple bays */
    const top = ROWS[a], bot = b >= 0 ? ROWS[b] : null;
    TRI.forEach(g => {
      const x0 = g[0][0] - 10, x1 = g[2][1] + 10, y0 = top[0] - 20, y1 = bot ? bot[1] + 10 : 1500;
      ln(x0, y0, x1, y0, .26); ln(x0, y0, x0, y1, .26); ln(x1, y0, x1, y1, .26); if (bot) ln(x0, y1, x1, y1, .26);
      rect(x0 - 6, y0 - 9, x1 + 6, y0, .22);                                          /* cap */
      if (bot){
        ln(x0, bot[1] + 4, x1, bot[1] + 4, .18);                                      /* lower sill */
        const sy0 = top[1] + 9; ln(x0, sy0, x1, sy0, .2);                             /* upper sill / spandrel */
        for (const x of [g[0][1], g[1][0], g[1][1], g[2][0]]) ln(x, sy0, x, bot[0], .15);
      }
    });
  });
  ln(CORNER, -60, CORNER, 1540, .4);                                                   /* the building's corner */
  /* the CI window's recess in 3D (no dashed lines: user 03.11 16:24) */
  rect(CIX0 + 2, CIY0 + 2, CIX1 - 2, CIY1 - 2, .2, -DEPTH);
  for (const [a, b, sx, sy] of [[CIX0, CIY0, 1, 1], [CIX1, CIY0, -1, 1], [CIX1, CIY1, -1, -1], [CIX0, CIY1, 1, -1]]) put(S, a, b, 0, a + sx * 2, b + sy * 2, -DEPTH, .24);
  /* the outline itself, counter-clockwise from the top-right corner (r = brightness, g = order) */
  const W = (ax, ay, bx, by, i) => O.push([ax - 969, 251 - ay, 0, bx - 969, 251 - by, 0, 1, i / 4]);
  W(CIX1, CIY0, CIX0, CIY0, 0); W(CIX0, CIY0, CIX0, CIY1, 1); W(CIX0, CIY1, CIX1, CIY1, 2); W(CIX1, CIY1, CIX1, CIY0, 3);
  return { S, D, O };
}
function buildLines(){
  const L = facadeLines();
  LN.scene = new THREE.Scene();
  LN.fac = lineObj(L.S, lineMat({ lw: 1 })); LN.ol = lineObj(L.O, lineMat({ lw: 1, seq: true }));
  LN.scene.add(LN.fac, LN.ol);
  LN.n = L.S.length + L.O.length;
}
function lineSize(){
  if (!LN.scene) return;
  const pr = renderer.getPixelRatio();
  for (const m of LN.mats){ m.resolution.set(vw * pr, vh * pr); m.linewidth = m.userData.lw * pr; }
}
/* the lamps in the windows come on gently once the flight starts; the 2x sky/facade, if they came late, swap in after the
   intro (the camera is in the room then, the facade out of sight) */
const LIFE = { t0: 0 }, LATE = { x2: null };
function life(){
  if (PRE3D.still){ M.fac.material.uniforms.uLife.value = 0; return; }
  if (!LIFE.t0) LIFE.t0 = performance.now();
  M.fac.material.uniforms.uLife.value = sm((performance.now() - LIFE.t0) / 2500);
}
function lateSwap(){
  const v = LATE.x2; if (!v) return; LATE.x2 = null;
  M.sky.material.uniforms.map.value = v[0]; M.fac.material.uniforms.map.value = v[1];
  const old = M.side.material.map, t = v[1].clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.copy(old.repeat); t.offset.copy(old.offset); t.needsUpdate = true;
  M.side.material.map = t;
}
/* every program and GPU resource the intro will touch, used once while the still covers the canvas */
function warm(T){
  for (const t of [.9, 3.7, 4.7, 5.6, 0]) render3d(t, T, 0, 0, 0);
  LIFE.t0 = 0;
}
function loadSketch(){ return Promise.resolve(); }                /* v7: the raster drawings are retired */

/* the CI window (the outline's rect) on screen, CSS px */
function winRect(){
  const r = F.OL, xs = [], ys = [];
  for (const [x, y] of [[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]]){
    v3.set(x, -y, 0).project(camera); xs.push((v3.x * .5 + .5) * vw); ys.push((.5 - v3.y * .5) * vh);
  }
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/* ---------------------------------------------------------------- the hero slider: interiors through fluted glass
   After the intro the hero cycles slide 0 (this 3D room) and the interior photos. A change is a wave of reeded glass
   (the CI guideline's fluted-glass texture): vertical glass ribs sweep across the screen left → right, each rib bends the
   picture into a mirrored, compressed slice with a lit edge, and at the strongest bend the rib swaps the old interior for
   the new one; the old picture dollies in, the new one settles out of a slight zoom. Photos get a slow push-in, the cursor
   parallax and the same grade/grain as the 3D room. Everything works in display (sRGB) values: the room comes from the
   composer's output buffer, the photos are loaded raw (NoColorSpace), the quad writes them straight out. */
const SLD = { tex: [], ps: [], ready: false, rt: [null, null] };
const PD = 260;                                                   /* photo relief: plane distance from the eye (as the room) */
const SlideShader = {
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader: `uniform sampler2D tA; uniform sampler2D tB; uniform vec4 fA; uniform vec4 fB; uniform float uPhA; uniform float uPhB;
    uniform float uP; uniform float uN; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    vec3 grade(vec3 c, float ph, vec2 uv){                     /* photos: a touch moodier + the room's vignette */
      vec2 d = uv - .5; float r2 = dot(d, d);
      vec3 g = pow(c, vec3(1.08)) * .9 * (1. - .3 * smoothstep(.12, .62, r2 * 1.6));
      return mix(c, g, ph);
    }
    vec3 sA(vec2 uv){ return texture2D(tA, uv * fA.xy + fA.zw).rgb; }
    vec3 sB(vec2 uv){ return texture2D(tB, uv * fB.xy + fB.zw).rgb; }
    /* frosted glass: a 7-tap soft kernel, slightly taller than wide */
    vec3 fA7(vec2 q, float r){ return sA(q) * .22 + (sA(q + vec2(r, 0.)) + sA(q - vec2(r, 0.))) * .17 + (sA(q + vec2(r * 2., r * .5)) + sA(q - vec2(r * 2., r * .5))) * .11 + (sA(q + vec2(-r * .6, r * 1.6)) + sA(q - vec2(-r * .6, r * 1.6))) * .11; }
    vec3 fB7(vec2 q, float r){ return sB(q) * .22 + (sB(q + vec2(r, 0.)) + sB(q - vec2(r, 0.))) * .17 + (sB(q + vec2(r * 2., r * .5)) + sB(q - vec2(r * 2., r * .5))) * .11 + (sB(q + vec2(-r * .6, r * 1.6)) + sB(q - vec2(-r * .6, r * 1.6))) * .11; }
    void main(){
      vec2 uv = vUv;
      float spread = .85;                                       /* the wave: ribs start one after another, left → right */
      float x = uv.x * uN, cell = floor(x), fx = fract(x) - .5;   /* ribs stay perfectly straight (user, 18:35) */
      float pr = clamp(uP * (1. + spread) - (cell + .5) / uN * spread - (1. - uv.y) * .1 + .05, 0., 1.);
      float e = pr * pr * (3. - 2. * pr);
      float g = sin(3.14159265 * e);                            /* how much glass this rib is right now */
      float k = smoothstep(.38, .62, e);                        /* old → new, swapped where the bend is strongest */
      vec3 col;
      if (g < .003) col = mix(sA(uv), sB(uv), k);
      else {
        float bulge = 1. - 4. * fx * fx;                        /* thick in the middle of a rib, thin at its edges */
        float m = mix(1., -.6, g);                              /* clear → compressed → mirrored slice (a cylindrical lens) */
        vec2 q = vec2((cell + .5) / uN + fx / uN * m + .03 * g, uv.y);
        float br = .012 * g * (.5 + .5 * bulge);                /* frosted, most in the thick middle */
        vec3 a = fA7(q, br), b = fB7(q, br);                    /* no colour fringes: clear glass only (user, 18:39) */
        col = mix(a, b, k);
        col *= 1. + g * .28 * (-fx * 2.);                       /* each rib lit from the left */
        float spec = exp(-pow((fx + .2) * 9., 2.)) * (.75 + .25 * sin(uv.y * 4. + uTime * 1.2));
        col += g * .32 * spec * vec3(1., .97, .92);             /* a glossy streak down every rib */
        col += g * .14 * smoothstep(.38, .46, abs(fx)) * (1. - smoothstep(.46, .5, abs(fx))) * vec3(1., .95, .9);   /* lit edge */
        col *= 1. - g * .38 * smoothstep(.465, .5, abs(fx));    /* the seam between ribs */
        col += vec3(1., .8, .6) * g * .03;                      /* warm light in the glass */
      }
      float ph = mix(uPhA, uPhB, k);
      col = grade(col, ph, uv);
      col += (h(uv * uRes + fract(uTime * 37.)) - .5) * .045 * ph;
      gl_FragColor = vec4(col, 1.);
    }`
};
/* a hero photo as a relief (the same two-layer build as the room): background with the near things painted out + the near
   things cut out on top, each pushed along its ray by assets/hero/NAME_dep.png (Depth Anything V2 + hand-picked objects) */
function photoScene(tO, tB, tD){
  const sc = new THREE.Scene(), geo = new THREE.PlaneGeometry(1.12, 1.12, 224, 162);
  const bg = new THREE.Mesh(geo, roomMat(tB, tD, 0)), nr = new THREE.Mesh(geo, roomMat(tO, tD, 1));
  for (const m of [bg, nr]){ const u = m.material.uniforms; u.uLight.value = 1; u.uGain.value = 1; u.uEye.value.set(0, 0, 0); m.position.set(0, 0, -PD); sc.add(m); }
  bg.renderOrder = 1; nr.renderOrder = 2;
  const ps = { sc, cam: new THREE.PerspectiveCamera(FOV, 1, 1, 5000), bg, nr, ar: tO.image.width / tO.image.height };
  layoutPhoto(ps); return ps;
}
function layoutPhoto(ps){
  ps.cam.aspect = vw / vh; ps.cam.updateProjectionMatrix();
  const visH = 2 * PD * TAN, visW = visH * ps.cam.aspect;
  const h = Math.max(visH, visW / ps.ar) * 1.10, w = h * ps.ar;   /* overscan for the cursor parallax */
  ps.bg.scale.set(w, h, 1); ps.nr.scale.set(w, h, 1);
}
function slotRT(i){
  const s = renderer.getDrawingBufferSize(new THREE.Vector2());
  let rt = SLD.rt[i];
  if (!rt){ rt = SLD.rt[i] = new THREE.WebGLRenderTarget(s.x, s.y, { depthBuffer: true }); rt.texture.generateMipmaps = false; }
  else if (rt.width !== s.x || rt.height !== s.y) rt.setSize(s.x, s.y);
  return rt;
}
/* GPU uploads one per frame, so a dozen big photos arriving together never stall a frame */
const upQ = []; let upOn = false;
function upload(t, res){ upQ.push([t, res]); if (!upOn){ upOn = true; let rest = false; requestAnimationFrame(function f(){ if (!rest){ const j = upQ.shift(); if (j){ renderer.initTexture(j[0]); j[1](j[0]); } } rest = !rest; if (upQ.length) requestAnimationFrame(f); else upOn = false; }); } }   /* one upload every other frame */
/* decode off the main thread (ImageBitmap), so the upload itself is cheap; plain <img> loading where that is missing */
const IBL = typeof createImageBitmap === 'function' ? new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none', colorSpaceConversion: 'none' }) : null;
function loadAny(u, prep){
  return new Promise((res, rej) => {
    if (IBL) IBL.load(u, bmp => { const t = new THREE.Texture(bmp); t.flipY = false; t.needsUpdate = true; prep(t); upload(t, res); }, undefined, rej);
    else new THREE.TextureLoader().load(u, t => { prep(t); upload(t, res); }, undefined, rej);
  });
}
function loadRaw(u){ return loadAny(u, t => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.minFilter = THREE.LinearMipmapLinearFilter; }); }
function loadDep(u){ return loadAny(u, t => { t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }); }
/* list: [{ src, bg?, dep? }] — with bg + dep a photo becomes a relief, else a flat picture */
function slidesInit(list){
  if (SLD.mat) return SLD.promise;
  SLD.mat = new THREE.ShaderMaterial({
    uniforms: { tA:{value:null}, tB:{value:null}, fA:{value:new THREE.Vector4(1,1,0,0)}, fB:{value:new THREE.Vector4(1,1,0,0)}, uPhA:{value:0}, uPhB:{value:1},
                uP:{value:0}, uN:{value:20}, uTime:{value:0}, uRes:{value:new THREE.Vector2(1,1)} },
    vertexShader: SlideShader.vertexShader, fragmentShader: SlideShader.fragmentShader, depthTest: false, depthWrite: false
  });
  SLD.scene = new THREE.Scene(); SLD.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  SLD.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), SLD.mat));
  SLD.promise = Promise.all(list.map(it => {
    if (typeof it === 'string') it = { src: it };
    const parts = [loadRaw(it.src)];
    if (it.bg && it.dep) parts.push(loadRaw(it.bg), loadDep(it.dep));
    return Promise.all(parts);
  })).then(async sets => {
    SLD.tex = sets.map(s => s[0]);
    SLD.trip = sets.map((s, i) => s.length === 3 ? { o: s[0], b: s[1], d: s[2], skUrl: list[i].sko ? { o: list[i].sko, b: list[i].skb } : null } : null);
    SLD.ps = sets.map(s => s.length === 3 ? photoScene(s[0], s[1], s[2]) : null);
    /* v7.2: the programs compile without blocking (KHR_parallel_shader_compile), both the off-screen and the on-screen
       variants; the warm-up then runs one step per frame, so the hero never freezes while the slider gets ready */
    const nf = () => new Promise(r => requestAnimationFrame(() => r()));
    const rt = new THREE.WebGLRenderTarget(64, 64), u = SLD.mat.uniforms;
    try {
      renderer.setRenderTarget(rt);
      const jobs = [renderer.compileAsync(SLD.scene, SLD.cam)].concat(SLD.ps.filter(Boolean).map(ps => renderer.compileAsync(ps.sc, ps.cam)));
      renderer.setRenderTarget(null); jobs.push(renderer.compileAsync(SLD.scene, SLD.cam));
      await Promise.all(jobs);
    } catch (e) { renderer.setRenderTarget(null); renderer.compile(SLD.scene, SLD.cam); }
    for (const ps of SLD.ps) if (ps){ await nf(); renderer.setRenderTarget(rt); ps.cam.position.set(0, 0, 0); ps.cam.lookAt(0, 0, -PD); renderer.render(ps.sc, ps.cam); renderer.setRenderTarget(null); }
    await nf();
    const room = lastT ? render3d(lastT.end + 1, lastT, 0, 0, 0, true) : SLD.tex[0];
    [room].concat(SLD.tex).forEach((t, i, all) => { u.tA.value = t; u.tB.value = all[(i + 1) % all.length]; u.uP.value = .5; renderer.setRenderTarget(rt); renderer.render(SLD.scene, SLD.cam); });
    renderer.setRenderTarget(null); rt.dispose(); u.uP.value = 0;
    await nf();
    if (lastT){ storyFrame({ T: lastT, fly: .9, ol: 1, draw: .6, toTex: true });   /* the story's pass, warmed off screen */
      LN.mats.forEach(m => m.uniforms.uOp.value = 0); renderer.autoClear = false; renderer.render(LN.scene, camera); renderer.autoClear = true;   /* + the lines' screen program, invisibly */
      LN.mats.forEach(m => m.uniforms.uOp.value = 1); }
    const i0 = SLD.ps.findIndex(Boolean);                               /* full-size slots allocated now, not on the first change */
    if (i0 >= 0){ const o0 = { mx: 0, my: 0, scroll: 0 }; await nf(); drawPhoto(i0, 0, 0, 0, o0); renderer.setRenderTarget(null); await nf(); drawPhoto(i0, 1, 0, 0, o0); renderer.setRenderTarget(null); }
    SLD.ready = true;
    setTimeout(loadSketch, 1500);
  });
  return SLD.promise;
}
/* cover-fit a texture to the screen, zoomed by z about (.5,.5) and shifted by (px, py) in screen fractions */
function fit(v, tw, th, z, px, py){
  const sa = vw / vh, ta = tw / th;
  let sx = 1, sy = 1; if (ta > sa) sx = sa / ta; else sy = ta / sa;
  sx /= z; sy /= z;
  v.set(sx, sy, .5 - sx * .5 + px * sx, .5 - sy * .5 + py * sy);
}
/* draw photo i's relief into render slot `slot`: slow dolly-in (k), the change's own dolly (zx, fraction of the distance),
   the cursor moves the camera and it keeps looking at the doorway-depth pivot — the same 3D as the room */
function drawPhoto(i, slot, k, zx, o){
  const ps = SLD.ps[i], rt = slotRT(slot);
  ps.cam.position.set(-o.mx * MP_PH, o.my * MP_PH * .7, -PD * (.05 * k + zx + o.scroll));
  ps.cam.lookAt(0, 0, -PD);
  renderer.setRenderTarget(rt); renderer.clear(); renderer.render(ps.sc, ps.cam);
  return rt.texture;
}
/* o: { a, b (photo index, −1 = the 3D room), p (0..1), ka, kb (push-in progress 0..1 of each slide), mx, my, scroll, T } */
function slideFrame(o){
  if (!SLD.ready) return;
  const u = SLD.mat.uniforms, p = o.p || 0;
  let roomTex = null;
  if (o.a < 0 || o.b < 0) roomTex = render3d(o.T.end + 1, o.T, o.mx, o.my, o.scroll, true);
  const side = (i, k, slot, zx, zT) => {                         /* zx: relief dolly, zT: flat zoom during the change */
    if (i < 0) return { t: roomTex, w: vw, h: vh, z: zT, px: 0, py: 0, ph: 0 };
    if (SLD.ps[i]) return { t: drawPhoto(i, slot, k, zx, o), w: vw, h: vh, z: 1, px: 0, py: 0, ph: 1 };
    const t = SLD.tex[i];
    return { t, w: t.image.width, h: t.image.height, z: (1.05 + .06 * k) * zT * (1 + o.scroll), px: o.mx * .014, py: -o.my * .01, ph: 1 };
  };
  const A = side(o.a, o.ka || 0, 0, .07 * p, 1 + .07 * p);
  const B = (o.b === o.a && p === 0) ? A : side(o.b, o.kb || 0, 1, .06 * (1 - p), 1 + .06 * (1 - p));
  u.tA.value = A.t; u.tB.value = B.t; u.uPhA.value = A.ph; u.uPhB.value = B.ph;
  fit(u.fA.value, A.w, A.h, A.z, A.px, A.py); fit(u.fB.value, B.w, B.h, B.z, B.px, B.py);
  u.uP.value = p; u.uN.value = Math.max(6, Math.round(vw / 92)); u.uTime.value = performance.now() / 1000;
  u.uRes.value.set(vw, vh);
  renderer.setRenderTarget(null); renderer.render(SLD.scene, SLD.cam);
}

(async () => {
  try {
    if (!canvas) throw new Error('no canvas');
    await build();
    PRE3D.roomReady = true; PRE3D.warm = warm;
    PRE3D.render = render3d; PRE3D.resize = resize; PRE3D.slidesInit = slidesInit; PRE3D.slideFrame = slideFrame; PRE3D.storyFrame = storyFrame; PRE3D.winRect = winRect; PRE3D.setRoom = setRoom; PRE3D.ok = true; PRE3D.state = 'ready';
  } catch (e) {
    console.warn('[pre3d] fallback to DOM:', e && e.message);
    PRE3D.state = 'error';
  }
})();
