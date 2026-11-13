import { strFromU8, unzipSync } from 'fflate';
import { db } from './db';
import { useSession } from './session';
import { createProfile } from './profiles';
import { saveAssessmentAnswer, saveQuestionnaireAnswer, checkPin, setPin } from './research';
import { buildExportFiles, buildExportZip, csvCell } from './export';
import { TESTS } from '../features/research/instruments';
import { makeStudentCode } from '../domain/profile/studentCode';
import { makeRng } from '../domain/random';

beforeEach(async () => {
  localStorage.clear();
  useSession.setState({ ready: true, profile: null, sessionId: null });
  await Promise.all(db.tables.map((t) => t.clear()));
});

async function answerTest(kind: 'awal' | 'akhir', correctCount: number) {
  const t = TESTS[kind];
  for (const [i, it] of t.items.entries()) {
    const response = i < correctCount ? it.answer : it.options.find((o) => o.id !== it.answer)!.id;
    await saveAssessmentAnswer({
      instrumentId: t.id,
      instrumentVersion: t.version,
      itemId: it.id,
      response,
      correct: response === it.answer,
      score: response === it.answer ? 1 : 0,
      shownOrder: 'A,B,C,D',
      durationMs: 1000,
    });
  }
}

describe('ekspor data penelitian', () => {
  it('ringkasan memuat skor pretest/posttest dan N-gain yang benar; tanpa nama panggilan', async () => {
    const p = await createProfile(makeStudentCode('A', makeRng(7)), 'RahasiaNama');
    await useSession.getState().login(p);
    await answerTest('awal', 4);
    await answerTest('awal', 4); // simpan ulang tidak boleh menggandakan baris
    await answerTest('akhir', 7);
    for (const [i, v] of [5, 1, 5, 1, 5, 1, 5, 1, 5, 1].entries())
      await saveQuestionnaireAnswer({ instrumentId: 'sus', instrumentVersion: 't', meeting: 2, itemId: `SUS${i + 1}`, subscale: 'SUS', value: v });

    const files = await buildExportFiles();
    const summary = files['assessment_summary.csv']!.trim().split('\r\n');
    const head = summary[0]!.replace('﻿', '').split(',');
    const row = summary[1]!.split(',');
    const col = (name: string) => row[head.indexOf(name)];
    expect(col('student_code')).toBe(makeStudentCode('A', makeRng(7)));
    expect(col('pretest_score')).toBe('4');
    expect(col('posttest_score')).toBe('7');
    expect(col('n_gain')).toBe('0.5');
    expect(col('n_gain_category')).toBe('sedang');

    expect(files['assessments.csv']!.trim().split('\r\n')).toHaveLength(1 + 20);
    expect(files['questionnaire_summary.csv']).toContain(',100');
    expect(Object.values(files).join('')).not.toContain('RahasiaNama');
  });

  it('ZIP berisi semua file', async () => {
    const { blob, filename } = await buildExportZip();
    expect(filename).toMatch(/^sudutku_semua_[0-9a-f]{8}_\d{8}-\d{4}\.zip$/);
    const buf = await new Promise<ArrayBuffer>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as ArrayBuffer);
      fr.readAsArrayBuffer(blob);
    });
    const files = unzipSync(new Uint8Array(buf));
    expect(Object.keys(files).sort()).toEqual(
      ['assessment_summary.csv', 'assessments.csv', 'attempts.csv', 'events.csv', 'mastery.csv', 'meta.json', 'questionnaire_summary.csv', 'questionnaires.csv', 'ratings.csv', 'sessions.csv'].sort(),
    );
    expect(JSON.parse(strFromU8(files['meta.json']!)).app).toBe('SudutKu');
  });

  it('sel CSV di-escape', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('kata "kutip"')).toBe('"kata ""kutip"""');
    expect(csvCell(null)).toBe('');
  });

  it('PIN disimpan sebagai hash dan dapat diverifikasi', async () => {
    await setPin('2468');
    expect(await checkPin('2468')).toBe(true);
    expect(await checkPin('1111')).toBe(false);
    expect(JSON.stringify(await db.settings.get('pinHash'))).not.toContain('2468');
  });
});
