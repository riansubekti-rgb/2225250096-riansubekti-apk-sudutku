import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/**
 * Mesin 3D SudutKu (architecture.md §7):
 * - render on demand (tidak ada loop terus-menerus) → hemat baterai HP kelas bawah;
 * - busur & label sudut selalu terlihat (depthTest off) agar tidak tertutup objek (P2);
 * - dispose() membersihkan semua sumber daya GPU agar tidak bocor memori di WebView.
 */

export interface ArcSpec {
  from: number;
  to: number;
  label: string;
  colored: boolean;
  /** busur luar sedikit lebih besar agar dua sudut bersebelahan tampak terpisah */
  outer?: boolean;
}

export interface PlaneSpec {
  origin: THREE.Vector3;
  u: THREE.Vector3;
  v: THREE.Vector3;
}

export interface CamSpec {
  pos: [number, number, number];
  target: [number, number, number];
}

export interface BuiltScene {
  root: THREE.Object3D;
  plane: PlaneSpec;
  arcs: ArcSpec[];
  arcRadius: number;
  rightMark?: boolean;
  camera: CamSpec;
  planar: CamSpec;
}

export interface Colors {
  rel: string;
  ask: string;
  muted: string;
}

export interface Engine {
  toPlanar: () => Promise<void>;
  resetView: () => Promise<void>;
  dispose: () => void;
}

const TAU = Math.PI / 180;

function planePoint(p: PlaneSpec, r: number, deg: number): THREE.Vector3 {
  return p.origin
    .clone()
    .addScaledVector(p.u, r * Math.cos(deg * TAU))
    .addScaledVector(p.v, r * Math.sin(deg * TAU));
}

function makeArc(p: PlaneSpec, r: number, arc: ArcSpec, color: string): THREE.Object3D {
  const g = new THREE.Group();
  const n = Math.max(8, Math.ceil(Math.abs(arc.to - arc.from) / 4));
  const pts = Array.from({ length: n + 1 }, (_, i) => planePoint(p, r, arc.from + ((arc.to - arc.from) * i) / n));
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.03, 6, false),
    new THREE.MeshBasicMaterial({ color, depthTest: false }),
  );
  tube.renderOrder = 10;
  g.add(tube);
  if (arc.colored) {
    // Sektor transparan (triangle fan) untuk menandai daerah sudut.
    const verts: number[] = [];
    for (let i = 0; i < n; i++) verts.push(...p.origin.toArray(), ...pts[i]!.toArray(), ...pts[i + 1]!.toArray());
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const fan = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: arc.outer ? 0.12 : 0.28, side: THREE.DoubleSide, depthTest: false, depthWrite: false }),
    );
    fan.renderOrder = 9;
    g.add(fan);
  }
  if (arc.label) {
    const div = document.createElement('div');
    div.textContent = arc.label;
    div.style.cssText = `font: 700 16px var(--font); color: ${color}; background: var(--surface); border: 2px solid ${color}; border-radius: 10px; padding: 1px 7px; white-space: nowrap;`;
    const lbl = new CSS2DObject(div);
    lbl.position.copy(planePoint(p, r + 0.42 + Math.max(0, arc.label.length - 4) * 0.06, (arc.from + arc.to) / 2));
    g.add(lbl);
  }
  return g;
}

function makeRightMark(p: PlaneSpec, size: number, color: string): THREE.Object3D {
  const pts = [
    planePoint(p, size, 0),
    planePoint(p, size * Math.SQRT2, 45),
    planePoint(p, size, 90),
  ];
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, depthTest: false }));
  line.renderOrder = 11;
  return line;
}

export function createEngine(
  container: HTMLElement,
  built: BuiltScene,
  colors: Colors,
  opts: { reduceMotion: boolean; onLost: () => void },
): Engine {
  const w = container.clientWidth || 320;
  const h = container.clientHeight || 260;

  const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.domElement.style.touchAction = 'none';
  container.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.setSize(w, h);
  labels.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  container.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a94a6, 1.8));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 6, 4);
  scene.add(sun);
  scene.add(built.root);

  const arcColor = (a: ArcSpec) => (!a.colored ? colors.muted : a.label === '?' ? colors.ask : colors.rel);
  for (const a of built.arcs) scene.add(makeArc(built.plane, built.arcRadius + (a.outer ? 0.18 : 0), a, arcColor(a)));
  if (built.rightMark) scene.add(makeRightMark(built.plane, 0.22, colors.rel));

  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
  camera.position.set(...built.camera.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...built.camera.target);
  controls.enablePan = false;
  controls.minDistance = 3;
  controls.maxDistance = 14;
  controls.update();

  const render = () => {
    renderer.render(scene, camera);
    labels.render(scene, camera);
  };
  controls.addEventListener('change', render);

  const ro = new ResizeObserver(() => {
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (!W || !H) return;
    renderer.setSize(W, H);
    labels.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    render();
  });
  ro.observe(container);

  const lost = (e: Event) => {
    e.preventDefault();
    opts.onLost();
  };
  renderer.domElement.addEventListener('webglcontextlost', lost);

  let raf = 0;
  const flyTo = (to: CamSpec) =>
    new Promise<void>((resolve) => {
      cancelAnimationFrame(raf);
      const p0 = camera.position.clone();
      const t0 = controls.target.clone();
      const p1 = new THREE.Vector3(...to.pos);
      const t1 = new THREE.Vector3(...to.target);
      const dur = opts.reduceMotion ? 0 : 600;
      const start = performance.now();
      const step = (now: number) => {
        const k = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
        const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2;
        camera.position.lerpVectors(p0, p1, e);
        controls.target.lerpVectors(t0, t1, e);
        controls.update();
        render();
        if (k < 1) raf = requestAnimationFrame(step);
        else resolve();
      };
      raf = requestAnimationFrame(step);
    });

  render();

  return {
    toPlanar: () => flyTo(built.planar),
    resetView: () => flyTo(built.camera),
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      labels.domElement.remove();
    },
  };
}
