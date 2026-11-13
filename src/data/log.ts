import { db, type Attempt } from './db';
import { useSession } from './session';

/** Semua penulisan data selalu terikat ke profil & sesi aktif (isolasi data antarsiswa). */
function active() {
  const { profile, sessionId } = useSession.getState();
  return profile && sessionId != null ? { profileId: profile.id, sessionId } : null;
}

export async function logEvent(type: string, payload: Record<string, unknown> = {}): Promise<void> {
  const a = active();
  if (!a) return;
  await db.events.add({ ...a, type, payload, ts: Date.now() });
}

export async function recordAttempt(
  attempt: Omit<Attempt, 'id' | 'profileId' | 'sessionId' | 'ts'>,
): Promise<void> {
  const a = active();
  if (!a) return;
  await db.attempts.add({ ...attempt, ...a, ts: Date.now() });
}
