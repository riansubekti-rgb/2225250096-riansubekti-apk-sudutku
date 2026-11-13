import type { Relation } from './relation';

/**
 * Spesifikasi gambar 2D (api.md §2.3).
 * Untuk `vertical`, urutan label = [∠A, ∠A' (bertolak belakang dg A), ∠B, ∠B'].
 */
export type FigureSpec =
  | { type: 'supplementary'; a: number; labels: [string, string] }
  | { type: 'complementary'; a: number; labels: [string, string] }
  | { type: 'vertical'; a: number; labels: [string, string, string, string]; highlight?: [number, number] };

export interface Pt {
  x: number;
  y: number;
}

/** Kemiringan garis pertama pada gambar bertolak belakang (agar tidak tampak seperti sumbu). */
export const VERT_BASE = 15;

const rad = (d: number) => (d * Math.PI) / 180;
const f = (n: number) => Math.round(n * 100) / 100;

/** Titik pada sudut `deg` (berlawanan arah jarum jam dari kanan), koordinat layar (y ke bawah). */
export function polar(c: Pt, r: number, deg: number): Pt {
  return { x: f(c.x + r * Math.cos(rad(deg))), y: f(c.y - r * Math.sin(rad(deg))) };
}

export function arcPath(c: Pt, r: number, from: number, to: number): string {
  const p1 = polar(c, r, from);
  const p2 = polar(c, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 0 ${p2.x} ${p2.y}`;
}

export function wedgePath(c: Pt, r: number, from: number, to: number): string {
  const p1 = polar(c, r, from);
  const p2 = polar(c, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${c.x} ${c.y} L ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 0 ${p2.x} ${p2.y} Z`;
}

/** Sudut (0–360) titik p dilihat dari pusat c. */
export function angleAt(c: Pt, p: Pt): number {
  const d = (Math.atan2(c.y - p.y, p.x - c.x) * 180) / Math.PI;
  return (d + 360) % 360;
}

/** Bulatkan ke kelipatan `snap` dan jaga rentang sah per hubungan. */
export function snapClamp(rel: Relation, a: number, snap = 1): number {
  const max = rel === 'complementary' ? 90 : 180;
  const lo = snap > 1 ? snap : 1;
  const s = Math.round(a / snap) * snap;
  return Math.min(max - lo, Math.max(lo, s));
}

/** Ubah sudut penunjuk jari (0–360) menjadi besar sudut `a` yang sah untuk Lab Sudut. */
export function pointerToAngle(rel: Relation, rawDeg: number, snap = 1): number {
  const d = ((rawDeg % 360) + 360) % 360;
  let a: number;
  if (rel === 'vertical') {
    const rel0 = (((d - VERT_BASE) % 360) + 360) % 360;
    a = rel0 > 180 ? rel0 - 180 : rel0; // sisi mana pun dari garis sama saja
  } else if (rel === 'supplementary') {
    a = d <= 180 ? d : d <= 270 ? 179 : 1;
  } else {
    a = d <= 90 ? d : d <= 225 ? 89 : 1;
  }
  return snapClamp(rel, a, snap);
}
