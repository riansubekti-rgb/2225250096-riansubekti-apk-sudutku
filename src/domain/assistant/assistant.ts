import { formatLinear, parseLinear, type Linear } from '../algebra/linear';
import { isValidAngle, RELATION_LABEL, type Relation } from '../geometry/relation';
import type { FigureSpec } from '../geometry/figure';

/**
 * "Otak" Tanya Busu — sepenuhnya offline & deterministik (tanpa AI/LLM, tanpa internet):
 * 1. kalkulator langkah demi langkah untuk persamaan x dan pasangan sudut;
 * 2. pencocokan kata kunci ke bank tanya-jawab (content/mascot/tanya.json);
 * 3. jawaban jujur "belum paham" bila tidak ada yang cocok.
 */

export interface KbEntry {
  id: string;
  /** frasa kata kunci; "a&b" = semua bagian harus ada */
  keywords: string[];
  answer: string;
  mood: string;
  figure?: FigureSpec;
  followups?: string[];
}

export interface Step {
  text: string;
  note: string;
}

export interface Answer {
  kind: 'kb' | 'equation' | 'partner' | 'fallback';
  id: string;
  mood: string;
  text: string;
  steps?: Step[];
  figure?: FigureSpec;
  followups?: string[];
}

/* ---------------- normalisasi bahasa siswa ---------------- */

const SYNONYMS: [RegExp, string][] = [
  [/\bber(pelurus|penyiku)\b/g, '$1'],
  [/\bbertolak\b/g, 'tolak'],
  [/\bsiku[\s-]?siku\b|\bsiku2\b/g, 'siku'],
  [/\b(brp|brapa)\b/g, 'berapa'],
  [/\b(gmn|gimana|bgmn|bagaimanakah)\b/g, 'bagaimana'],
  [/\b(knp|kenapa|mengapa|napa)\b/g, 'kenapa'],
  [/\b(ga|gak|nggak|ngga|enggak|tdk)\b/g, 'tidak'],
  [/\b(ngerti|mengerti|faham)\b/g, 'paham'],
  [/\b(drajat|derjat)\b|°/g, ' derajat '],
  [/\b(bedanya|perbedaan|membedakan|bedain|beda)\b/g, 'beda'],
  [/\b(sm|sma)\b/g, 'sama'],
  [/\b(dgn|dg)\b/g, 'dengan'],
  [/\b(utk)\b/g, 'untuk'],
  [/\b(yg)\b/g, 'yang'],
  [/\b(makasi|makasih|mksh|thx|thanks|trims)\b/g, 'terima kasih'],
];

export function normalize(text: string): string {
  let s = ` ${text.toLowerCase().replace(/[−–]/g, '-')} `;
  for (const [re, rep] of SYNONYMS) s = s.replace(re, rep);
  return s.replace(/[^a-z0-9+\-=x ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length]!;
}

/** Perbaiki salah ketik ringan (jarak 1) terhadap kosakata kata kunci, untuk kata ≥ 5 huruf. */
function fixTypos(tokens: string[], vocab: Set<string>): string[] {
  return tokens.map((t) => {
    if (t.length < 5 || vocab.has(t) || /\d/.test(t)) return t;
    for (const v of vocab) if (Math.abs(v.length - t.length) <= 1 && levenshtein(t, v) <= 1) return v;
    return t;
  });
}

/* ---------------- kalkulator ---------------- */

const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

/** "2x + 4x = 90" → langkah penyelesaian. Mengembalikan null bila bukan persamaan x. */
export function solveEquationText(raw: string): Answer | null {
  const cleaned = raw.toLowerCase().replace(/[−–]/g, '-').replace(/°|derajat/g, '').replace(/[()]/g, '');
  const m = /([0-9x+\-\s.]+)=([0-9x+\-\s.]+)/.exec(cleaned);
  if (!m || !/x/.test(m[0])) return null;
  let L: Linear;
  let R: Linear;
  try {
    L = parseLinear(m[1]!);
    R = parseLinear(m[2]!);
  } catch {
    return null;
  }
  const a = L.a - R.a;
  const steps: Step[] = [{ text: `${formatLinear(L)} = ${formatLinear(R)}`, note: 'Tulis persamaannya dan gabungkan suku yang sejenis' }];
  if (a === 0) {
    return {
      kind: 'equation',
      id: 'eq-none',
      mood: 'think',
      text: 'Hmm, suku x-nya habis saat dipindahkan, jadi persamaan ini tidak punya satu nilai x. Coba cek lagi soalnya, ya.',
      steps,
    };
  }
  const B = R.b - L.b;
  if (R.a !== 0) steps.push({ text: `${formatLinear({ a, b: L.b })} = ${fmtNum(R.b)}`, note: 'Pindahkan suku x ke ruas kiri (tandanya berubah)' });
  if (L.b !== 0)
    steps.push({ text: `${formatLinear({ a, b: 0 })} = ${fmtNum(B)}`, note: L.b > 0 ? `Kurangi kedua ruas dengan ${L.b}` : `Tambah kedua ruas dengan ${-L.b}` });
  const x = B / a;
  if (a !== 1) steps.push({ text: `x = ${fmtNum(x)}`, note: `Bagi kedua ruas dengan ${a}` });

  let hint = '';
  if (R.a === 0 && R.b === 180) hint = ' Persamaan "= 180" dipakai untuk sudut berpelurus.';
  if (R.a === 0 && R.b === 90) hint = ' Persamaan "= 90" dipakai untuk sudut berpenyiku.';
  const intOk = Number.isInteger(x) && x > 0;
  return {
    kind: 'equation',
    id: 'eq-solve',
    mood: intOk ? 'proud' : 'think',
    text: intOk
      ? `Jadi x = ${fmtNum(x)}.${hint} Jangan lupa: ganti x ke setiap sudut untuk mendapat besar sudutnya!`
      : `Hasilnya x = ${fmtNum(x)}. Biasanya x di soal sudut berupa bilangan bulat positif, jadi coba cek lagi soalnya.${hint}`,
    steps,
  };
}

const REL_WORD: [RegExp, Relation][] = [
  [/\bpelurus\b/, 'supplementary'],
  [/\bpenyiku\b/, 'complementary'],
  [/\btolak\b/, 'vertical'],
];

/** "penyiku dari 35 berapa" → 55°, dengan langkah & gambar. */
export function partnerFromText(norm: string): Answer | null {
  if (norm.includes('=')) return null;
  const rel = REL_WORD.find(([re]) => re.test(norm))?.[1];
  const num = /\b(\d{1,3})\b/.exec(norm);
  if (!rel || !num) return null;
  const n = Number(num[1]);
  if (n === 90 || n === 180 || n === 360) return null; // kemungkinan pertanyaan konsep, bukan menghitung
  const label = RELATION_LABEL[rel].toLowerCase();
  if (!isValidAngle(rel, n)) {
    const max = rel === 'complementary' ? 90 : 180;
    return {
      kind: 'partner',
      id: `partner-invalid-${rel}`,
      mood: 'wow',
      text: `Wah, ${n}° tidak bisa menjadi sudut ${label}. Sudut ${label} harus lebih dari 0° dan kurang dari ${max}°.`,
    };
  }
  if (rel === 'vertical') {
    return {
      kind: 'partner',
      id: 'partner-vertical',
      mood: 'wink',
      text: `Sudut yang bertolak belakang dengan ${n}° juga ${n}°, karena sudut bertolak belakang selalu sama besar.`,
      steps: [{ text: `∠b = ∠a = ${n}°`, note: 'Bertolak belakang → sama besar' }],
      figure: { type: 'vertical', a: n, labels: [`${n}°`, `${n}°`, '', ''], highlight: [0, 1] },
    };
  }
  const total = rel === 'supplementary' ? 180 : 90;
  const p = total - n;
  return {
    kind: 'partner',
    id: `partner-${rel}`,
    mood: 'proud',
    text: `Pasangan ${label} dari ${n}° adalah ${p}°.`,
    steps: [
      { text: `${n}° + ∠b = ${total}°`, note: `Sudut ${label} berjumlah ${total}°` },
      { text: `∠b = ${total}° − ${n}° = ${p}°`, note: `Kurangi ${total}° dengan ${n}°` },
      { text: `Periksa: ${n}° + ${p}° = ${total}° ✓`, note: 'Cocok dengan sifatnya' },
    ],
    figure: { type: rel, a: n, labels: [`${n}°`, `${p}°`] },
  };
}

/* ---------------- bank tanya-jawab ---------------- */

export function buildVocab(kb: KbEntry[]): Set<string> {
  const v = new Set<string>();
  for (const e of kb) for (const k of e.keywords) for (const w of normalize(k.replace(/&/g, ' ')).split(' ')) if (w) v.add(w);
  return v;
}

/** Skor = jumlah kata pada kata kunci yang cocok (frasa lebih panjang = lebih kuat). */
export function matchKb(kb: KbEntry[], text: string, vocab = buildVocab(kb)): KbEntry | null {
  const tokens = fixTypos(normalize(text).split(' '), vocab);
  const padded = ` ${tokens.join(' ')} `;
  let best: { e: KbEntry; score: number } | null = null;
  for (const e of kb) {
    let score = 0;
    for (const k of e.keywords) {
      const parts = k.split('&').map((p) => normalize(p)).filter(Boolean);
      if (parts.every((p) => padded.includes(` ${p} `))) {
        score = Math.max(score, parts.reduce((s, p) => s + p.split(' ').length, 0));
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { e, score };
  }
  return best?.e ?? null;
}

export function answer(kb: KbEntry[], fallback: Omit<Answer, 'kind' | 'id'>, text: string): Answer {
  const eq = solveEquationText(text);
  if (eq) return eq;
  const norm = normalize(text);
  const partner = partnerFromText(norm);
  if (partner) return partner;
  const e = matchKb(kb, text);
  if (e) return { kind: 'kb', id: e.id, mood: e.mood, text: e.answer, figure: e.figure, followups: e.followups };
  return { kind: 'fallback', id: 'fallback', ...fallback };
}
