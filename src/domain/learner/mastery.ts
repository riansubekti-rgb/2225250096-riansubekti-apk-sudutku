import type { Relation } from '../geometry/relation';

/** Keterampilan (architecture.md §4.2). */
export type KC = 'KC_IDENTIFY' | 'KC_RULE' | 'KC_NUMERIC' | 'KC_ALGEBRA' | 'KC_INTERPRET' | 'KC_FORMULATE';

export type MasteryStatus = 'belum' | 'berkembang' | 'menguasai';

export interface MasteryRec {
  kc: KC;
  relation: Relation;
  p: number;
  n: number;
}

export interface AdaptiveConfig {
  alpha: number;
  lowThreshold: number;
  masteryThreshold: number;
  minAttempts: number;
  effortDowngrade: number;
}

/** Parameter awal (architecture.md §6) — dapat diubah dari Mode Peneliti nanti. */
export const DEFAULT_CONFIG: AdaptiveConfig = {
  alpha: 0.3,
  lowThreshold: 0.4,
  masteryThreshold: 0.8,
  minAttempts: 4,
  effortDowngrade: 7,
};

/** Nilai satu langkah: benar tanpa bantuan 1; sedikit bantuan 0,6; banyak bantuan 0,3; gagal 0. */
export function outcomeScore(o: { correct: boolean; hintLevel: number; mistakes: number }): number {
  if (!o.correct) return 0;
  if (o.hintLevel === 0 && o.mistakes === 0) return 1;
  if (o.hintLevel <= 1 && o.mistakes <= 1) return 0.6;
  return 0.3;
}

/** Exponential moving average: p ← p + α(skor − p). Dipilih karena mudah dijelaskan di skripsi. */
export function updateMastery(m: MasteryRec, score: number, cfg: AdaptiveConfig = DEFAULT_CONFIG): MasteryRec {
  return { ...m, p: m.p + cfg.alpha * (score - m.p), n: m.n + 1 };
}

export function masteryStatus(m: Pick<MasteryRec, 'p' | 'n'>, cfg: AdaptiveConfig = DEFAULT_CONFIG): MasteryStatus {
  if (m.p < cfg.lowThreshold) return 'belum';
  if (m.p >= cfg.masteryThreshold && m.n >= cfg.minAttempts) return 'menguasai';
  return 'berkembang';
}

export function findMastery(list: MasteryRec[], kc: KC, relation: Relation): MasteryRec {
  return list.find((m) => m.kc === kc && m.relation === relation) ?? { kc, relation, p: 0, n: 0 };
}
