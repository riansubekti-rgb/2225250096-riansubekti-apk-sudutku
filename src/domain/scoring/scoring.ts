/** Penilaian instrumen (architecture.md §8). Fungsi murni — data mentah tetap diekspor untuk dihitung ulang. */

export interface TestItemMeta {
  id: string;
  answer: string;
  score: number;
  process: string;
}

export interface TestResult {
  score: number;
  max: number;
  answered: number;
  byProcess: Record<string, { score: number; max: number }>;
}

/** Skor tes pilihan ganda: butir kosong dihitung 0. */
export function scoreTest(items: TestItemMeta[], answers: Record<string, string | undefined>): TestResult {
  const byProcess: TestResult['byProcess'] = {};
  let score = 0;
  let max = 0;
  let answered = 0;
  for (const it of items) {
    const got = answers[it.id];
    if (got !== undefined) answered++;
    const s = got === it.answer ? it.score : 0;
    score += s;
    max += it.score;
    const bp = (byProcess[it.process] ??= { score: 0, max: 0 });
    bp.score += s;
    bp.max += it.score;
  }
  return { score, max, answered, byProcess };
}

/** N-gain ternormalisasi (Hake, 1998): (post − pre) / (max − pre). null bila pre = max. */
export function nGain(pre: number, post: number, max: number): number | null {
  if (max - pre === 0) return null;
  return (post - pre) / (max - pre);
}

export function nGainCategory(g: number | null): 'tinggi' | 'sedang' | 'rendah' | '-' {
  if (g === null) return '-';
  if (g >= 0.7) return 'tinggi';
  if (g >= 0.3) return 'sedang';
  return 'rendah';
}

/** Skor SUS 0–100 (Brooke, 1996). `values` = 10 jawaban skala 1–5 berurutan SUS1..SUS10. */
export function susScore(values: number[]): number | null {
  if (values.length !== 10 || values.some((v) => !Number.isFinite(v))) return null;
  const sum = values.reduce((acc, v, i) => acc + (i % 2 === 0 ? v - 1 : 5 - v), 0);
  return sum * 2.5;
}

/** Rata-rata per subskala, mis. { IL: 4.3, EL: 2, GL: 7.5 }. */
export function subscaleMeans(rows: { subscale: string; value: number }[]): Record<string, number> {
  const acc: Record<string, { s: number; n: number }> = {};
  for (const r of rows) {
    const a = (acc[r.subscale] ??= { s: 0, n: 0 });
    a.s += r.value;
    a.n++;
  }
  return Object.fromEntries(Object.entries(acc).map(([k, v]) => [k, v.s / v.n]));
}
