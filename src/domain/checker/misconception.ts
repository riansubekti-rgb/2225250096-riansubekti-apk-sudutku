import type { Relation } from '../geometry/relation';
import { RELATIONS } from '../geometry/relation';
import { solveRelation, type Linear } from '../algebra/linear';

/** Kode miskonsepsi (architecture.md §5). */
export type MisconceptionCode =
  | 'M_SUP_AS_COMP'
  | 'M_COMP_AS_SUP'
  | 'M_VERT_AS_SUP'
  | 'M_X_NOT_ANGLE'
  | 'M_SUBST_ERR'
  | 'M_ARITH'
  | 'M_UNKNOWN';

/** Siswa memilih/menerapkan aturan `used` padahal hubungannya `actual`. */
export function relationMisconception(actual: Relation, used: Relation): MisconceptionCode {
  if (actual === 'supplementary' && used === 'complementary') return 'M_SUP_AS_COMP';
  if (actual === 'complementary' && used === 'supplementary') return 'M_COMP_AS_SUP';
  if (actual === 'vertical' && used === 'supplementary') return 'M_VERT_AS_SUP';
  return 'M_UNKNOWN';
}

/** Diagnosis jawaban x yang salah: apakah cocok dengan aturan hubungan lain? */
export function diagnoseX(actual: Relation, e1: Linear, e2: Linear, answer: number): MisconceptionCode {
  for (const rel of RELATIONS) {
    if (rel === actual) continue;
    try {
      if (solveRelation(rel, e1, e2).x === answer) return relationMisconception(actual, rel);
    } catch {
      /* aturan lain tidak punya penyelesaian — lewati */
    }
  }
  return 'M_ARITH';
}

/** Diagnosis jawaban besar sudut yang salah. */
export function diagnoseAngle(x: number, answer: number): MisconceptionCode {
  return answer === x ? 'M_X_NOT_ANGLE' : 'M_SUBST_ERR';
}
