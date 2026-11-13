import { db, type AssessmentRow, type QuestionnaireRow } from './db';
import { useSession } from './session';

/** Status instrumen penelitian per perangkat — diatur dari Mode Peneliti (prd.md F13). */
export interface ResearchState {
  pretestOpen: boolean;
  posttestOpen: boolean;
  clOpen: boolean;
  susOpen: boolean;
  /** Pertemuan ke- (D9: 2 pertemuan); dicatat pada kuesioner IL/EL/GL. */
  meeting: number;
  /** Siswa boleh membuat kode sendiri di halaman Masuk (D23). */
  allowSelfCode: boolean;
}

export const DEFAULT_RESEARCH: ResearchState = {
  pretestOpen: false,
  posttestOpen: false,
  clOpen: false,
  susOpen: false,
  meeting: 1,
  allowSelfCode: true,
};

export async function getResearch(): Promise<ResearchState> {
  const row = await db.settings.get('research');
  return { ...DEFAULT_RESEARCH, ...((row?.value as Partial<ResearchState>) ?? {}) };
}

export async function setResearch(patch: Partial<ResearchState>): Promise<ResearchState> {
  const next = { ...(await getResearch()), ...patch };
  await db.settings.put({ key: 'research', value: next });
  return next;
}

/** Kunci penyelesaian instrumen; IL/EL/GL dicatat per pertemuan. */
export function completionKey(profileId: number, instrumentKey: string): string {
  return `done:${profileId}:${instrumentKey}`;
}

export async function isDone(instrumentKey: string): Promise<boolean> {
  const id = useSession.getState().profile?.id;
  if (id == null) return false;
  return Boolean(await db.settings.get(completionKey(id, instrumentKey)));
}

export async function markDone(instrumentKey: string): Promise<void> {
  const id = useSession.getState().profile?.id;
  if (id == null) return;
  await db.settings.put({ key: completionKey(id, instrumentKey), value: Date.now() });
}

function active() {
  const { profile, sessionId } = useSession.getState();
  return profile && sessionId != null ? { profileId: profile.id, sessionId } : null;
}

/** Simpan jawaban tes segera (tahan force-close); satu baris per siswa+instrumen+butir. */
export async function saveAssessmentAnswer(
  row: Omit<AssessmentRow, 'id' | 'profileId' | 'sessionId' | 'ts'>,
): Promise<void> {
  const a = active();
  if (!a) return;
  await db.transaction('rw', db.assessments, async () => {
    await db.assessments
      .where('profileId')
      .equals(a.profileId)
      .filter((r) => r.instrumentId === row.instrumentId && r.itemId === row.itemId)
      .delete();
    await db.assessments.add({ ...row, ...a, ts: Date.now() });
  });
}

export async function loadAssessmentAnswers(instrumentId: string): Promise<AssessmentRow[]> {
  const a = active();
  if (!a) return [];
  return db.assessments
    .where('profileId')
    .equals(a.profileId)
    .filter((r) => r.instrumentId === instrumentId)
    .toArray();
}

export async function saveQuestionnaireAnswer(
  row: Omit<QuestionnaireRow, 'id' | 'profileId' | 'sessionId' | 'ts'>,
): Promise<void> {
  const a = active();
  if (!a) return;
  await db.transaction('rw', db.questionnaires, async () => {
    await db.questionnaires
      .where('profileId')
      .equals(a.profileId)
      .filter((r) => r.instrumentId === row.instrumentId && r.itemId === row.itemId && r.meeting === row.meeting)
      .delete();
    await db.questionnaires.add({ ...row, ...a, ts: Date.now() });
  });
}

/* ---------- PIN peneliti (disimpan sebagai hash, architecture.md §11) ---------- */

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hasPin(): Promise<boolean> {
  return Boolean(await db.settings.get('pinHash'));
}

export async function setPin(pin: string): Promise<void> {
  await db.settings.put({ key: 'pinHash', value: await sha256(`sudutku:${pin}`) });
}

export async function checkPin(pin: string): Promise<boolean> {
  const row = await db.settings.get('pinHash');
  return Boolean(row) && row!.value === (await sha256(`sudutku:${pin}`));
}

/* ---------- daftar kode siswa acak per kelas (D22) ---------- */

export async function getCodeSheet(classLetter: string): Promise<string[]> {
  return ((await db.settings.get(`codes:${classLetter}`))?.value as string[] | undefined) ?? [];
}

export async function saveCodeSheet(classLetter: string, codes: string[]): Promise<void> {
  await db.settings.put({ key: `codes:${classLetter}`, value: codes });
}
