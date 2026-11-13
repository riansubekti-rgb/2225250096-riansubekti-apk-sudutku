import * as THREE from 'three';
import type { BuiltScene } from './engine';
import type { SceneId } from './sceneIds';

/**
 * Adegan 3D low-poly prosedural (tanpa file model → ringan & offline). Warna objek netral;
 * hanya busur sudut yang memakai warna hubungan (desain.md §7).
 */

const mat = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
const R = Math.PI / 180;

function box(w: number, h: number, d: number, color: number) {
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
}

/** Rambu silang (X) — bidang tegak XY. Sudut atas a, sudut bawah bertolak belakang. */
function crossbuck(a: number, labels: [string, string]): BuiltScene {
  const root = new THREE.Group();
  const c = new THREE.Vector3(0, 1.2, 0);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.4, 12), mat(0x9aa0a6));
  pole.position.set(0, -0.2, -0.1);
  root.add(pole);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(2.4, 32), mat(0xd9d4c7));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.9;
  root.add(ground);
  for (const deg of [90 - a / 2, 90 + a / 2]) {
    const border = box(2.7, 0.42, 0.04, 0xc62828);
    const face = box(2.6, 0.32, 0.05, 0xf7f7f7);
    for (const [m, z] of [[border, 0], [face, 0.01]] as const) {
      m.rotation.z = deg * R;
      m.position.set(c.x, c.y, z + (deg > 90 ? 0.06 : 0));
      root.add(m);
    }
  }
  return {
    root,
    plane: { origin: new THREE.Vector3(0, 1.2, 0.14), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0) },
    arcs: [
      { from: 90 - a / 2, to: 90 + a / 2, label: labels[0], colored: true },
      { from: 270 - a / 2, to: 270 + a / 2, label: labels[1], colored: true },
    ],
    arcRadius: 0.55,
    camera: { pos: [2.4, 1.6, 5], target: [0, 0.9, 0] },
    planar: { pos: [0, 1.2, 6.2], target: [0, 1.2, 0] },
  };
}

/** Pintu (dilihat dari atas) — bidang lantai XZ. Sudut pintu–ambang a, pintu–dinding 180° − a. */
function door(a: number, labels: [string, string]): BuiltScene {
  const root = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.4), mat(0xe9e4da));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -1);
  root.add(floor);
  const wall = box(2.9, 0.5, 0.14, 0xbcaaa4);
  wall.position.set(-1.45, 0.25, 0);
  root.add(wall);
  const wallR = box(1.0, 0.5, 0.14, 0xbcaaa4);
  wallR.position.set(2.3, 0.25, 0);
  root.add(wallR);
  const sill = box(1.8, 0.02, 0.14, 0x6d4c41); // ambang pintu
  sill.position.set(0.9, 0.01, 0);
  root.add(sill);
  const leaf = box(1.7, 1.1, 0.06, 0x8d6e63);
  leaf.rotation.y = a * R;
  leaf.position.set(0.85 * Math.cos(a * R), 0.55, -0.85 * Math.sin(a * R));
  root.add(leaf);
  return {
    root,
    plane: { origin: new THREE.Vector3(0, 0.03, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, -1) },
    arcs: [
      { from: 0, to: a, label: labels[0], colored: true },
      { from: a, to: 180, label: labels[1], colored: true, outer: true },
    ],
    arcRadius: 0.7,
    camera: { pos: [2.6, 4.2, 4.2], target: [0, 0, -0.6] },
    planar: { pos: [0, 7.5, -0.59], target: [0, 0, -0.6] },
  };
}

/** Pojok taman (dilihat dari atas) — dua pagar siku-siku dan jalan setapak dari pojok. */
function garden(a: number, labels: [string, string]): BuiltScene {
  const root = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), mat(0x9ccc65));
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(2.1, 0, -2.1);
  root.add(grass);
  const fence = (along: 'x' | 'z') => {
    for (let i = 0; i <= 5; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), mat(0x795548));
      post.position.set(along === 'x' ? i * 0.8 : 0, 0.3, along === 'z' ? -i * 0.8 : 0);
      root.add(post);
    }
    const rail = box(along === 'x' ? 4 : 0.06, 0.06, along === 'z' ? 4 : 0.06, 0x795548);
    rail.position.set(along === 'x' ? 2 : 0, 0.45, along === 'z' ? -2 : 0);
    root.add(rail);
  };
  fence('x');
  fence('z');
  const path = box(4.4, 0.02, 0.4, 0xd7c29e);
  path.rotation.y = a * R;
  path.position.set(2.2 * Math.cos(a * R), 0.02, -2.2 * Math.sin(a * R));
  root.add(path);
  return {
    root,
    plane: { origin: new THREE.Vector3(0, 0.05, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, -1) },
    arcs: [
      { from: 0, to: a, label: labels[0], colored: true },
      { from: a, to: 90, label: labels[1], colored: true, outer: true },
    ],
    arcRadius: 0.9,
    rightMark: true,
    camera: { pos: [-2.2, 4.6, 3.2], target: [1.2, 0, -1.2] },
    planar: { pos: [1.2, 7.8, -1.19], target: [1.2, 0, -1.2] },
  };
}

/** Rangka layang-layang hias — dua bilah bersilangan di bidang XY. Sudut bersebelahan a dan 180° − a. */
function kite(a: number, labels: [string, string]): BuiltScene {
  const root = new THREE.Group();
  const L = 1.5;
  const end = (deg: number, r = L) => new THREE.Vector2(r * Math.cos(deg * R), r * Math.sin(deg * R));
  const sail = new THREE.Shape([end(0), end(a, 2.0), end(180), end(a + 180, 2.0)]);
  const sailMesh = new THREE.Mesh(
    new THREE.ShapeGeometry(sail),
    new THREE.MeshStandardMaterial({ color: 0xd9c7f2, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
  );
  sailMesh.position.z = -0.05;
  root.add(sailMesh);
  const stick = (deg: number, len: number) => {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 8), mat(0xa1887f));
    s.rotation.z = (deg - 90) * R;
    root.add(s);
  };
  stick(0, 2 * L);
  stick(a, 4.0);
  return {
    root,
    plane: { origin: new THREE.Vector3(0, 0, 0.08), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0) },
    arcs: [
      { from: 0, to: a, label: labels[0], colored: true },
      { from: a, to: 180, label: labels[1], colored: true, outer: true },
    ],
    arcRadius: 0.5,
    camera: { pos: [2.2, 1.0, 5.4], target: [0, 0, 0] },
    planar: { pos: [0, 0, 6.4], target: [0, 0, 0] },
  };
}

/** Kursi lipat pantai — dua pasang kaki bersilangan (huruf X), bidang XY. Sudut atas a, bawah bertolak belakang. */
function chair(a: number, labels: [string, string]): BuiltScene {
  const root = new THREE.Group();
  const L = 1.7;
  const half = (a / 2) * R;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), mat(0xd9d4c7));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -L * Math.cos(half);
  root.add(floor);
  for (const z of [-0.45, 0.45]) {
    for (const deg of [90 - a / 2, 90 + a / 2]) {
      const leg = box(2 * L, 0.09, 0.09, 0x8d6e63);
      leg.rotation.z = deg * R;
      leg.position.set(0, 0, z + (deg > 90 ? 0.05 : 0));
      root.add(leg);
    }
  }
  const seat = box(2 * L * Math.sin(half), 0.05, 1.0, 0xef9a9a);
  seat.position.set(0, L * Math.cos(half), 0);
  root.add(seat);
  return {
    root,
    plane: { origin: new THREE.Vector3(0, 0, 0.56), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0) },
    arcs: [
      { from: 90 - a / 2, to: 90 + a / 2, label: labels[0], colored: true },
      { from: 270 - a / 2, to: 270 + a / 2, label: labels[1], colored: true },
    ],
    arcRadius: 0.5,
    camera: { pos: [2.6, 1.2, 4.6], target: [0, 0, 0] },
    planar: { pos: [0, 0, 6.2], target: [0, 0, 0] },
  };
}

/** Penggaris siku tukang kayu + garis miring dari pojoknya — bidang XY. Sudut a dan 90° − a. */
function square(a: number, labels: [string, string]): BuiltScene {
  const root = new THREE.Group();
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.2), mat(0xe6cfa7));
  board.position.set(1.1, 0.9, -0.05);
  root.add(board);
  const armH = box(2.9, 0.28, 0.05, 0x90a4ae);
  armH.position.set(1.17, -0.14, 0);
  root.add(armH);
  const armV = box(0.28, 2.3, 0.05, 0x90a4ae);
  armV.position.set(-0.14, 1.15, 0);
  root.add(armV);
  const line = box(2.5, 0.03, 0.01, 0x37474f);
  line.rotation.z = a * R;
  line.position.set(1.25 * Math.cos(a * R), 1.25 * Math.sin(a * R), 0.01);
  root.add(line);
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), mat(0xffca28));
  pencil.rotation.z = (a - 90) * R;
  pencil.position.set(2.75 * Math.cos(a * R), 2.75 * Math.sin(a * R), 0.12);
  root.add(pencil);
  return {
    root,
    plane: { origin: new THREE.Vector3(0, 0, 0.06), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0) },
    arcs: [
      { from: 0, to: a, label: labels[0], colored: true },
      { from: a, to: 90, label: labels[1], colored: true, outer: true },
    ],
    arcRadius: 0.75,
    rightMark: true,
    camera: { pos: [2.2, 1.4, 4.8], target: [0.9, 0.8, 0] },
    planar: { pos: [0.9, 0.9, 5.8], target: [0.9, 0.9, 0] },
  };
}

export const SCENES: Record<SceneId, (a: number, labels: [string, string]) => BuiltScene> = {
  crossbuck,
  door,
  garden,
  kite,
  chair,
  square,
};
