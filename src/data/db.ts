import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Relation } from '../domain/geometry/relation';
import type { KC } from '../domain/learner/mastery';

/** Skema penyimpanan lokal (api.md §3). Ubah skema hanya lewat db.version(n).upgrade(). */
export interface Profile {
  id: number;
  studentCode: string;
  nickname: string;
  classCode: string;
  createdAt: number;
}

export type EndReason = 'switch' | 'idle' | 'close';

export interface Session {
  id: number;
  profileId: number;
  startedAt: number;
  endedAt?: number;
  endReason?: EndReason;
}

export interface Attempt {
  id: number;
  profileId: number;
  sessionId: number;
  problemId: string;
  /** kosong untuk cek prasyarat (Pemanasan) */
  relation?: Relation;
  kcs: string[];
  mode: string;
  step: string;
  response: string;
  correct: boolean;
  misconception?: string;
  hintLevel: number;
  durationMs: number;
  ts: number;
}

export interface EventRow {
  id: number;
  profileId: number;
  sessionId: number;
  type: string;
  payload: Record<string, unknown>;
  ts: number;
}

export interface MasteryRow {
  profileId: number;
  kc: KC;
  relation: Relation;
  p: number;
  n: number;
  updatedAt: number;
}

export interface Rating {
  id: number;
  profileId: number;
  sessionId: number;
  setId: string;
  instrumentVersion: string;
  mentalEffort: number;
  durationMs: number;
  ts: number;
}

export interface AssessmentRow {
  id: number;
  profileId: number;
  sessionId: number;
  instrumentId: string;
  instrumentVersion: string;
  itemId: string;
  /** id opsi ASLI yang dipilih (A–D di file instrumen), bukan posisi di layar */
  response: string;
  correct: boolean;
  score: number;
  /** urutan opsi yang ditampilkan, mis. "C,A,D,B" */
  shownOrder: string;
  durationMs: number;
  ts: number;
}

export interface QuestionnaireRow {
  id: number;
  profileId: number;
  sessionId: number;
  instrumentId: string;
  instrumentVersion: string;
  meeting: number;
  itemId: string;
  subscale: string;
  value: number | null;
  text?: string;
  ts: number;
}

export interface Setting {
  key: string;
  value: unknown;
}

export const db = new Dexie('sudutku') as Dexie & {
  profiles: EntityTable<Profile, 'id'>;
  sessions: EntityTable<Session, 'id'>;
  attempts: EntityTable<Attempt, 'id'>;
  events: EntityTable<EventRow, 'id'>;
  settings: EntityTable<Setting, 'key'>;
  mastery: Table<MasteryRow, [number, KC, Relation]>;
  ratings: EntityTable<Rating, 'id'>;
  assessments: EntityTable<AssessmentRow, 'id'>;
  questionnaires: EntityTable<QuestionnaireRow, 'id'>;
};

db.version(1).stores({
  profiles: '++id, &studentCode, classCode, createdAt',
  sessions: '++id, profileId, startedAt',
  mastery: '[profileId+kc+relation], profileId, updatedAt',
  attempts: '++id, profileId, problemId, sessionId, ts',
  events: '++id, profileId, sessionId, type, ts',
  ratings: '++id, profileId, sessionId, setId, ts',
  assessments: '++id, profileId, instrumentId, itemId, ts',
  questionnaires: '++id, profileId, instrumentId, itemId, ts',
  settings: 'key',
});

/** ID acak per perangkat (bukan ID hardware) untuk penggabungan data lintas ponsel. */
export async function getDeviceId(): Promise<string> {
  const row = await db.settings.get('deviceId');
  if (row) return row.value as string;
  const id = crypto.randomUUID().slice(0, 8);
  await db.settings.put({ key: 'deviceId', value: id });
  return id;
}
