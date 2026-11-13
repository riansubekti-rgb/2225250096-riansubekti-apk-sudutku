import { strToU8, zipSync } from 'fflate';
import pre from '../../content/instruments/literacy-pretest.json';
import post from '../../content/instruments/literacy-posttest.json';
import { db, getDeviceId } from './db';
import { LiteracyTestSchema } from './schemas';
import { nGain, nGainCategory, scoreTest, subscaleMeans, susScore } from '../domain/scoring/scoring';
import { getPersistResult } from '../platform/storage';
import { displayMode } from '../platform/browserEnv';
import { DEFAULT_CONFIG } from '../domain/learner/mastery';
import pkg from '../../package.json';

/** Format ekspor penelitian (api.md §4). Nama panggilan TIDAK diekspor — hanya kode siswa. */

const TESTS = {
  'literacy-pretest': LiteracyTestSchema.parse(pre),
  'literacy-posttest': LiteracyTestSchema.parse(post),
};

type Cell = string | number | boolean | null | undefined;

export function csvCell(v: Cell): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(columns: string[], rows: Cell[][]): string {
  const lines = [columns.join(','), ...rows.map((r) => r.map(csvCell).join(','))];
  return '﻿' + lines.join('\r\n') + '\r\n'; // BOM agar langsung terbaca benar di Excel
}

/** Waktu ISO 8601 WIB (UTC+7). */
export function isoWib(ts: number | undefined): string {
  if (ts === undefined) return '';
  return new Date(ts + 7 * 3600_000).toISOString().replace('Z', '+07:00');
}

const round = (n: number | null | undefined, d = 3) => (n === null || n === undefined ? '' : Math.round(n * 10 ** d) / 10 ** d);

export async function buildExportFiles(): Promise<Record<string, string>> {
  const device = await getDeviceId();
  const [profiles, sessions, attempts, events, ratings, assessments, questionnaires, mastery] = await Promise.all([
    db.profiles.toArray(),
    db.sessions.toArray(),
    db.attempts.toArray(),
    db.events.toArray(),
    db.ratings.toArray(),
    db.assessments.toArray(),
    db.questionnaires.toArray(),
    db.mastery.toArray(),
  ]);
  const code = new Map(profiles.map((p) => [p.id, p.studentCode]));
  const sc = (profileId: number) => code.get(profileId) ?? `?${profileId}`;
  const files: Record<string, string> = {};

  files['sessions.csv'] = toCsv(
    ['device_id', 'local_id', 'student_code', 'started_iso', 'ended_iso', 'end_reason'],
    sessions.map((s) => [device, s.id, sc(s.profileId), isoWib(s.startedAt), isoWib(s.endedAt), s.endReason]),
  );

  files['attempts.csv'] = toCsv(
    ['device_id', 'local_id', 'student_code', 'session_id', 'ts_iso', 'problem_id', 'relation', 'kcs', 'mode', 'step', 'response', 'correct', 'misconception', 'hint_level', 'duration_ms'],
    attempts.map((a) => [device, a.id, sc(a.profileId), a.sessionId, isoWib(a.ts), a.problemId, a.relation, a.kcs.join('|'), a.mode, a.step, a.response, a.correct ? 1 : 0, a.misconception, a.hintLevel, a.durationMs]),
  );

  files['ratings.csv'] = toCsv(
    ['device_id', 'local_id', 'student_code', 'session_id', 'set_id', 'ts_iso', 'instrument_version', 'mental_effort', 'duration_ms'],
    ratings.map((r) => [device, r.id, sc(r.profileId), r.sessionId, r.setId, isoWib(r.ts), r.instrumentVersion, r.mentalEffort, r.durationMs]),
  );

  const itemMeta = new Map(
    Object.values(TESTS).flatMap((t) => t.items.map((i) => [i.id, i] as const)),
  );
  files['assessments.csv'] = toCsv(
    ['device_id', 'local_id', 'student_code', 'session_id', 'ts_iso', 'instrument_id', 'instrument_version', 'item_id', 'pisa_process', 'context', 'relation', 'response', 'shown_order', 'correct', 'score', 'duration_ms'],
    assessments.map((a) => {
      const m = itemMeta.get(a.itemId);
      return [device, a.id, sc(a.profileId), a.sessionId, isoWib(a.ts), a.instrumentId, a.instrumentVersion, a.itemId, m?.indicator.pisaProcess, m?.indicator.context, m?.indicator.relation, a.response, a.shownOrder, a.correct ? 1 : 0, a.score, a.durationMs];
    }),
  );

  // Ringkasan per siswa: skor pretest/posttest, N-gain, skor per proses PISA.
  const processes = ['formulate', 'employ', 'interpret'];
  const summaryRows: Cell[][] = profiles.map((p) => {
    const result = (id: keyof typeof TESTS) => {
      const answers = Object.fromEntries(
        assessments.filter((a) => a.profileId === p.id && a.instrumentId === id).map((a) => [a.itemId, a.response]),
      );
      if (!Object.keys(answers).length) return null;
      return scoreTest(
        TESTS[id].items.map((i) => ({ id: i.id, answer: i.answer, score: i.score, process: i.indicator.pisaProcess })),
        answers,
      );
    };
    const r1 = result('literacy-pretest');
    const r2 = result('literacy-posttest');
    const g = r1 && r2 ? nGain(r1.score, r2.score, r1.max) : null;
    return [
      device,
      p.studentCode,
      p.classCode,
      r1?.score,
      r2?.score,
      r1?.max ?? r2?.max,
      round(g),
      r1 && r2 ? nGainCategory(g) : '',
      ...processes.flatMap((pr) => [r1?.byProcess[pr]?.score, r2?.byProcess[pr]?.score]),
    ];
  });
  files['assessment_summary.csv'] = toCsv(
    ['device_id', 'student_code', 'class_code', 'pretest_score', 'posttest_score', 'max_score', 'n_gain', 'n_gain_category', ...processes.flatMap((pr) => [`pre_${pr}`, `post_${pr}`])],
    summaryRows,
  );

  files['questionnaires.csv'] = toCsv(
    ['device_id', 'local_id', 'student_code', 'session_id', 'ts_iso', 'instrument_id', 'instrument_version', 'meeting', 'item_id', 'subscale', 'value', 'text'],
    questionnaires.map((q) => [device, q.id, sc(q.profileId), q.sessionId, isoWib(q.ts), q.instrumentId, q.instrumentVersion, q.meeting, q.itemId, q.subscale, q.value, q.text]),
  );

  // Ringkasan kuesioner per siswa per pertemuan: rata-rata IL/EL/GL dan skor SUS.
  const qRows: Cell[][] = [];
  for (const p of profiles) {
    const mine = questionnaires.filter((q) => q.profileId === p.id);
    const meetings = [...new Set(mine.map((q) => q.meeting))].sort();
    for (const meeting of meetings) {
      const cl = mine.filter((q) => q.instrumentId === 'cl-questionnaire' && q.meeting === meeting && q.value !== null);
      const means = subscaleMeans(cl.map((q) => ({ subscale: q.subscale, value: q.value! })));
      const sus = mine.filter((q) => q.instrumentId === 'sus' && q.meeting === meeting && q.value !== null);
      const susVals = Array.from({ length: 10 }, (_, i) => sus.find((q) => q.itemId === `SUS${i + 1}`)?.value ?? NaN);
      qRows.push([device, p.studentCode, meeting, round(means.IL, 2), round(means.EL, 2), round(means.GL, 2), round(susScore(susVals), 1)]);
    }
  }
  files['questionnaire_summary.csv'] = toCsv(
    ['device_id', 'student_code', 'meeting', 'il_mean', 'el_mean', 'gl_mean', 'sus_score'],
    qRows,
  );

  files['mastery.csv'] = toCsv(
    ['device_id', 'student_code', 'kc', 'relation', 'p', 'n', 'updated_iso'],
    mastery.map((m) => [device, sc(m.profileId), m.kc, m.relation, round(m.p), m.n, isoWib(m.updatedAt)]),
  );

  files['events.csv'] = toCsv(
    ['device_id', 'local_id', 'student_code', 'session_id', 'ts_iso', 'type', 'payload_json'],
    events.map((e) => [device, e.id, sc(e.profileId), e.sessionId, isoWib(e.ts), e.type, JSON.stringify(e.payload)]),
  );

  files['meta.json'] = JSON.stringify(
    {
      app: 'SudutKu',
      appVersion: pkg.version,
      exportedAt: isoWib(Date.now()),
      deviceId: device,
      storagePersisted: getPersistResult(),
      displayMode: typeof window === 'undefined' ? null : displayMode(),
      userAgent: typeof navigator === 'undefined' ? null : navigator.userAgent,
      instruments: Object.fromEntries(Object.entries(TESTS).map(([k, t]) => [k, { version: t.version, validated: t.validated }])),
      adaptiveConfig: DEFAULT_CONFIG,
      counts: { profiles: profiles.length, attempts: attempts.length, assessments: assessments.length, questionnaires: questionnaires.length, ratings: ratings.length },
    },
    null,
    2,
  );
  return files;
}

export async function buildExportZip(classLabel = 'semua'): Promise<{ blob: Blob; filename: string }> {
  const files = await buildExportFiles();
  // Salin ke Uint8Array global: fflate membedakan file vs folder dengan `instanceof Uint8Array`,
  // yang bisa gagal bila TextEncoder berasal dari realm lain (mis. WebView/iframe/tes).
  const zipped = zipSync(Object.fromEntries(Object.entries(files).map(([k, v]) => [k, new Uint8Array(strToU8(v))])));
  const device = await getDeviceId();
  const stamp = isoWib(Date.now()).slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  return {
    blob: new Blob([zipped], { type: 'application/zip' }),
    filename: `sudutku_${classLabel}_${device}_${stamp}.zip`,
  };
}
