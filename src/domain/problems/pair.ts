import { evalLinear, formatLinear, parseLinear, solveRelation, type Linear, type Solution } from '../algebra/linear';
import { RELATIONS, type Relation } from '../geometry/relation';
import type { FigureSpec } from '../geometry/figure';

/** Soal dua sudut: E1 dan E2 dengan hubungan tertentu (dipakai Contoh Bertahap & Latihan). */
export interface PairProblem {
  id: string;
  relation: Relation;
  e1: Linear;
  e2: Linear;
}

export function makePair(id: string, relation: Relation, e1: string, e2: string): PairProblem {
  return { id, relation, e1: parseLinear(e1), e2: parseLinear(e2) };
}

export function solvePair(p: PairProblem): Solution {
  return solveRelation(p.relation, p.e1, p.e2);
}

/** Label di gambar: konstanta → "65°", ekspresi → "2x + 10". */
export function labelOf(e: Linear): string {
  return e.a === 0 ? `${e.b}°` : formatLinear(e);
}

/** Gambar soal; `showValues` mengganti ekspresi dengan besar sudut setelah dihitung (desain.md §4.5). */
export function figureFor(p: PairProblem, showValues: boolean): FigureSpec {
  const s = solvePair(p);
  const l1 = showValues ? `${s.angle1}°` : labelOf(p.e1);
  const l2 = showValues ? `${s.angle2}°` : labelOf(p.e2);
  if (p.relation === 'vertical') return { type: 'vertical', a: s.angle1, labels: [l1, l2, '', ''], highlight: [0, 1] };
  return { type: p.relation, a: s.angle1, labels: [l1, l2] };
}

/** Ekspresi yang besar sudutnya perlu dihitung setelah x ditemukan (null = cukup x). */
export function angleTarget(p: PairProblem): Linear | null {
  return [p.e1, p.e2].find((e) => e.a !== 0 && !(e.a === 1 && e.b === 0)) ?? null;
}

export function valueOf(e: Linear, x: number): number {
  return evalLinear(e, x);
}

/** Tiga pilihan persamaan untuk langkah "Aturan"; `relation` = aturan yang diwakili. */
export function ruleOptions(p: PairProblem): { relation: Relation; text: string }[] {
  const t = (e: Linear) => (e.a !== 0 && e.b !== 0 ? `(${formatLinear(e)})` : formatLinear(e));
  return RELATIONS.map((relation) => ({
    relation,
    text:
      relation === 'vertical'
        ? `${formatLinear(p.e1)} = ${formatLinear(p.e2)}`
        : `${t(p.e1)} + ${t(p.e2)} = ${relation === 'supplementary' ? 180 : 90}`,
  }));
}
