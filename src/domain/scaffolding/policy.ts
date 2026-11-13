import { RELATIONS, type Relation } from '../geometry/relation';
import {
  DEFAULT_CONFIG,
  findMastery,
  masteryStatus,
  type AdaptiveConfig,
  type KC,
  type MasteryRec,
  type MasteryStatus,
} from '../learner/mastery';
import type { ProblemKind } from '../problems/generator';
import type { Rng } from '../random';

export type GivenStep = 'identify' | 'rule';

export interface Plan {
  relation: Relation;
  kind: ProblemKind;
  /** Langkah yang sudah dikerjakan (backward fading, P5/P6). */
  given: GivenStep[];
  level: MasteryStatus;
}

/** Fading mundur: makin lemah, makin banyak langkah awal yang dicontohkan. */
export const GIVEN_BY_LEVEL: Record<MasteryStatus, GivenStep[]> = {
  belum: ['identify', 'rule'],
  berkembang: ['identify'],
  menguasai: [],
};

function kcsOf(kind: ProblemKind): KC[] {
  return ['KC_IDENTIFY', 'KC_RULE', kind === 'numeric' ? 'KC_NUMERIC' : 'KC_ALGEBRA'];
}

/**
 * Pilih soal berikutnya (architecture.md §6):
 * 1. Soal aljabar untuk suatu hubungan terbuka setelah soal angkanya tidak lagi "belum".
 * 2. Prioritaskan kombinasi dengan penguasaan terendah.
 * 3. Selingi hubungan (interleaving): hindari hubungan yang sama berturut-turut bila ada pilihan setara.
 * 4. Tingkat bantuan mengikuti keterampilan terlemah pada soal itu (expertise reversal).
 */
export function planNext(
  mastery: MasteryRec[],
  lastRelation: Relation | null,
  rng: Rng,
  cfg: AdaptiveConfig = DEFAULT_CONFIG,
): Plan {
  const candidates: { relation: Relation; kind: ProblemKind; weakest: MasteryRec }[] = [];
  for (const relation of RELATIONS) {
    const kinds: ProblemKind[] = ['numeric'];
    if (masteryStatus(findMastery(mastery, 'KC_NUMERIC', relation), cfg) !== 'belum') kinds.push('algebra');
    for (const kind of kinds) {
      const recs = kcsOf(kind).map((kc) => findMastery(mastery, kc, relation));
      const weakest = recs.reduce((a, b) => (b.p < a.p ? b : a));
      candidates.push({ relation, kind, weakest });
    }
  }
  // Acak dulu agar seri tidak selalu jatuh ke urutan yang sama, lalu urutkan berdasarkan p.
  candidates.sort(() => rng() - 0.5);
  candidates.sort((a, b) => a.weakest.p - b.weakest.p);

  let pick = candidates[0]!;
  if (pick.relation === lastRelation) {
    const alt = candidates.find((c) => c.relation !== lastRelation && c.weakest.p - pick.weakest.p <= 0.15);
    if (alt) pick = alt;
  }
  const level = masteryStatus(pick.weakest, cfg);
  return { relation: pick.relation, kind: pick.kind, given: GIVEN_BY_LEVEL[level], level };
}
