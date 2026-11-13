import { db } from './db';
import { useSession } from './session';
import {
  DEFAULT_CONFIG,
  findMastery,
  updateMastery,
  type KC,
  type MasteryRec,
} from '../domain/learner/mastery';
import type { Relation } from '../domain/geometry/relation';

/** Penguasaan milik profil aktif saja (isolasi data antarsiswa). */
export async function loadMastery(): Promise<MasteryRec[]> {
  const profileId = useSession.getState().profile?.id;
  if (profileId == null) return [];
  const rows = await db.mastery.where('profileId').equals(profileId).toArray();
  return rows.map(({ kc, relation, p, n }) => ({ kc, relation, p, n }));
}

/** Perbarui satu keterampilan dan simpan; mengembalikan daftar penguasaan terbaru. */
export async function applyOutcome(
  current: MasteryRec[],
  kc: KC,
  relation: Relation,
  score: number,
): Promise<MasteryRec[]> {
  const next = updateMastery(findMastery(current, kc, relation), score, DEFAULT_CONFIG);
  const profileId = useSession.getState().profile?.id;
  if (profileId != null) await db.mastery.put({ profileId, ...next, updatedAt: Date.now() });
  return [...current.filter((m) => !(m.kc === kc && m.relation === relation)), next];
}
