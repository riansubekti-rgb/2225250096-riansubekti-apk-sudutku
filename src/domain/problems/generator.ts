import { formatLinear, solveRelation, type Linear } from '../algebra/linear';
import { isValidAngle, type Relation } from '../geometry/relation';
import { makeRng, randInt } from '../random';
import type { PairProblem } from './pair';

export type ProblemKind = 'numeric' | 'algebra';

/** Template soal (content/problems/templates.json, api.md §2.2). */
export interface ProblemTemplate {
  id: string;
  relation: Relation;
  kind: ProblemKind;
  /** numeric: rentang sudut yang diketahui */
  known?: [number, number];
  /** algebra: rentang koefisien & konstanta */
  a1?: [number, number];
  a2?: [number, number];
  b1?: [number, number];
  b2?: [number, number];
  bStep?: number;
}

/** Sudut terkecil agar gambar tetap terbaca di layar HP. */
const MIN_ANGLE = 10;

/**
 * Bangkitkan soal dari template dengan seed tertentu. Menolak hasil yang tidak sah
 * (x bukan bulat positif, sudut di luar rentang) dan pasangan yang sama dengan butir tes (`excluded`).
 */
export function generateFromTemplate(
  tpl: ProblemTemplate,
  seed: number,
  excluded: (key: string) => boolean = () => false,
): PairProblem {
  const rng = makeRng(seed);
  for (let attempt = 0; attempt < 500; attempt++) {
    let e1: Linear;
    let e2: Linear;
    if (tpl.kind === 'numeric') {
      const [lo, hi] = tpl.known ?? [10, 170];
      e1 = { a: 0, b: randInt(rng, lo, hi) };
      e2 = { a: 1, b: 0 };
    } else {
      const step = tpl.bStep ?? 5;
      const r = (range: [number, number] | undefined, s = 1) => randInt(rng, range?.[0] ?? 0, range?.[1] ?? 0, s);
      e1 = { a: r(tpl.a1), b: r(tpl.b1, step) };
      e2 = { a: r(tpl.a2), b: r(tpl.b2, step) };
      if (tpl.relation === 'vertical' && e1.a === e2.a) continue;
      // Soal aljabar harus punya sudut yang perlu dihitung dari x (bukan "x" dan "x").
      const trivial = (e: Linear) => e.a === 1 && e.b === 0;
      if (trivial(e1) && trivial(e2)) continue;
    }
    if (!isGood(tpl.relation, e1, e2)) continue;
    if (excluded(pairKey(tpl.relation, e1, e2))) continue;
    return { id: `${tpl.id}#${seed}`, relation: tpl.relation, e1, e2 };
  }
  throw new Error(`template ${tpl.id} tidak menghasilkan soal sah untuk seed ${seed}`);
}

function isGood(rel: Relation, e1: Linear, e2: Linear): boolean {
  try {
    const s = solveRelation(rel, e1, e2);
    if (!Number.isInteger(s.x) || s.x <= 0) return false;
    return [s.angle1, s.angle2].every((v) => Number.isInteger(v) && v >= MIN_ANGLE && isValidAngle(rel, v));
  } catch {
    return false;
  }
}

/** Kunci pembanding soal (urutan E1/E2 tidak penting). Soal angka dikunci oleh sudut yang diketahui. */
export function pairKey(rel: Relation, e1: Linear, e2: Linear): string {
  if (e1.a === 0 && e2.a === 1 && e2.b === 0) return `${rel}|num|${e1.b}`;
  const [p, q] = [formatLinear(e1), formatLinear(e2)].sort();
  return `${rel}|${p}|${q}`;
}
