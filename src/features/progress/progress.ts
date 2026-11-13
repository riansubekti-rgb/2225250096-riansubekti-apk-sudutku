import { db } from '../../data/db';
import { useSession } from '../../data/session';
import { loadMastery } from '../../data/mastery';
import { masteryStatus, type MasteryRec } from '../../domain/learner/mastery';

/** Id misi yang sudah diselesaikan profil aktif. */
export async function loadDoneMissions(): Promise<Set<string>> {
  const profileId = useSession.getState().profile?.id;
  if (profileId == null) return new Set();
  const events = await db.events.where('profileId').equals(profileId).filter((e) => e.type === 'mission_complete').toArray();
  return new Set(events.map((e) => String(e.payload.missionId)));
}

/** Hitung lencana (F11) dari data milik profil aktif saja. */
export async function loadProgress(): Promise<{ mastery: MasteryRec[]; earned: Set<string> }> {
  const profileId = useSession.getState().profile?.id;
  const mastery = await loadMastery();
  const earned = new Set<string>();
  if (profileId == null) return { mastery, earned };
  const events = await db.events.where('profileId').equals(profileId).toArray();
  const sections = events.filter((e) => e.type === 'section_complete');
  if (sections.some((e) => e.payload.section === 'pemanasan')) earned.add('pemanasan');
  if (sections.some((e) => e.payload.section === 'kenali' && Number(e.payload.score) >= 5)) earned.add('pengenal');
  const labModes = new Set(events.filter((e) => e.type === 'lab_drag').map((e) => e.payload.relation));
  if (labModes.size >= 3) earned.add('peneliti-lab');
  if (mastery.some((m) => m.kc === 'KC_NUMERIC' && masteryStatus(m) === 'menguasai')) earned.add('penghitung');
  if (mastery.some((m) => m.kc === 'KC_ALGEBRA' && masteryStatus(m) === 'menguasai')) earned.add('penakluk-x');
  const missions = new Set(events.filter((e) => e.type === 'mission_complete').map((e) => e.payload.missionId));
  if (missions.size >= 3) earned.add('penjelajah');
  return { mastery, earned };
}
