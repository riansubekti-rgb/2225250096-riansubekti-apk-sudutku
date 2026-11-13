import { db, type Profile } from '../../data/db';
import { useSession } from '../../data/session';
import { loadDoneMissions, loadProgress } from '../progress/progress';

/** Pilihan avatar profil (emoji — tanpa foto, menjaga privasi anak). */
export const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐙', '🦄', '🐧', '🐨', '🦁', '🐰', '🐳', '🦉'];

/** Ubah nama panggilan/avatar profil aktif dan segarkan sesi. */
export async function updateMyProfile(patch: Partial<Pick<Profile, 'nickname' | 'avatar'>>): Promise<void> {
  const p = useSession.getState().profile;
  if (!p) return;
  const clean = { ...patch, ...(patch.nickname !== undefined ? { nickname: patch.nickname.trim().slice(0, 12) } : {}) };
  await db.profiles.update(p.id, clean);
  const fresh = await db.profiles.get(p.id);
  if (fresh) useSession.setState({ profile: fresh });
}

export interface MyStats {
  answered: number;
  correctPct: number | null;
  badges: number;
  missions: number;
  minutes: number;
}

/** Statistik belajar milik profil aktif saja. */
export async function loadMyStats(): Promise<MyStats> {
  const p = useSession.getState().profile;
  if (!p) return { answered: 0, correctPct: null, badges: 0, missions: 0, minutes: 0 };
  const [attempts, sessions, progress, missions] = await Promise.all([
    db.attempts.where('profileId').equals(p.id).toArray(),
    db.sessions.where('profileId').equals(p.id).toArray(),
    loadProgress(),
    loadDoneMissions(),
  ]);
  const now = Date.now();
  const ms = sessions.reduce((sum, s) => sum + Math.max(0, (s.endedAt ?? now) - s.startedAt), 0);
  return {
    answered: attempts.length,
    correctPct: attempts.length ? Math.round((attempts.filter((a) => a.correct).length / attempts.length) * 100) : null,
    badges: progress.earned.size,
    missions: missions.size,
    minutes: Math.round(ms / 60000),
  };
}
