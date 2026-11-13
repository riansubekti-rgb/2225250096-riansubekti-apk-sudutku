import type { Relation } from '../geometry/relation';
import { RELATION_TOTAL } from '../geometry/relation';

/** Ekspresi linear satu variabel: a·x + b (api.md §1.2). */
export interface Linear {
  a: number;
  b: number;
}

export class ParseError extends Error {}

/** "3x-5" → {a:3,b:-5}; "x" → {a:1,b:0}; "40" → {a:0,b:40}. Menerima spasi dan tanda minus Unicode. */
export function parseLinear(src: string): Linear {
  const s = src.replace(/\s+/g, '').replace(/[−–]/g, '-').toLowerCase();
  if (!s) throw new ParseError('kosong');
  const terms = s.match(/[+-]?[^+-]+/g);
  if (!terms || terms.join('') !== s) throw new ParseError(`tidak dikenali: ${src}`);
  let a = 0;
  let b = 0;
  for (const t of terms) {
    const m = /^([+-]?)(\d*)(x?)$/.exec(t);
    if (!m || (m[2] === '' && m[3] === '')) throw new ParseError(`suku tidak dikenali: ${t}`);
    const sign = m[1] === '-' ? -1 : 1;
    const n = m[2] === '' ? 1 : Number(m[2]);
    if (m[3]) a += sign * n;
    else b += sign * n;
  }
  return { a, b };
}

/** {a:2,b:10} → "2x + 10"; {a:1,b:-5} → "x − 5". */
export function formatLinear(e: Linear, v = 'x'): string {
  const parts: string[] = [];
  if (e.a !== 0) parts.push(`${e.a === 1 ? '' : e.a === -1 ? '−' : e.a}${v}`);
  if (e.b !== 0 || parts.length === 0) {
    if (parts.length === 0) parts.push(e.b < 0 ? `−${-e.b}` : String(e.b));
    else parts.push(e.b < 0 ? `− ${-e.b}` : `+ ${e.b}`);
  }
  return parts.join(' ');
}

export function evalLinear(e: Linear, x: number): number {
  return e.a * x + e.b;
}

export type SolveStepKind = 'identify' | 'rule' | 'combine' | 'move' | 'divide' | 'substitute' | 'check';

/** Satu baris pengerjaan. `note` = penjelasan singkat apa yang berubah (desain.md §4.5). */
export interface SolveStep {
  kind: SolveStepKind;
  text: string;
  note: string;
}

export interface Solution {
  x: number;
  angle1: number;
  angle2: number;
  steps: SolveStep[];
}

const sum = (p: Linear, q: Linear): Linear => ({ a: p.a + q.a, b: p.b + q.b });
/** Kurung hanya untuk ekspresi dua suku, mis. (2x + 10). */
const paren = (e: Linear) => (e.a !== 0 && e.b !== 0 ? `(${formatLinear(e)})` : formatLinear(e));

/**
 * Selesaikan E1 + E2 = total (berpelurus/berpenyiku) atau E1 = E2 (bertolak belakang),
 * lengkap dengan langkah K-A-H-P untuk ditampilkan satu per satu.
 */
export function solveRelation(rel: Relation, e1: Linear, e2: Linear): Solution {
  const total = RELATION_TOTAL[rel];
  const steps: SolveStep[] = [];
  let A: number; // koefisien x setelah digabung
  let B: number; // ruas kanan setelah konstanta dipindah

  if (total !== null) {
    steps.push({ kind: 'rule', text: `${paren(e1)} + ${paren(e2)} = ${total}`, note: `Jumlah kedua sudut ${total}°` });
    const s = sum(e1, e2);
    const needCombine = (e1.a !== 0 && e2.a !== 0) || (e1.b !== 0 && e2.b !== 0);
    if (needCombine) {
      steps.push({ kind: 'combine', text: `${formatLinear(s)} = ${total}`, note: 'Gabungkan suku x dan suku angka' });
    }
    A = s.a;
    B = total - s.b;
    if (s.b !== 0) {
      steps.push({
        kind: 'move',
        text: `${formatLinear({ a: A, b: 0 })} = ${B}`,
        note: s.b > 0 ? `Kurangi kedua ruas dengan ${s.b}` : `Tambah kedua ruas dengan ${-s.b}`,
      });
    }
  } else {
    steps.push({ kind: 'rule', text: `${formatLinear(e1)} = ${formatLinear(e2)}`, note: 'Sudut bertolak belakang sama besar' });
    A = e1.a - e2.a;
    B = e2.b - e1.b;
    if (A === 0) throw new Error('koefisien x sama: tidak ada penyelesaian tunggal');
    if (A < 0) {
      // Kumpulkan x di ruas yang koefisiennya positif agar tidak muncul "−x = −70".
      A = -A;
      B = -B;
    }
    steps.push({
      kind: 'move',
      text: `${formatLinear({ a: A, b: 0 })} = ${B}`,
      note: 'Kumpulkan suku x di kiri dan angka di kanan',
    });
  }

  const x = B / A;
  if (A !== 1) steps.push({ kind: 'divide', text: `x = ${fmtNum(x)}`, note: `Bagi kedua ruas dengan ${A}` });

  const angle1 = evalLinear(e1, x);
  const angle2 = evalLinear(e2, x);
  // Hanya sudut yang memuat x dan bukan sekadar "x" yang perlu disubstitusi.
  const parts = [e1, e2]
    .filter((e) => e.a !== 0 && !(e.a === 1 && e.b === 0))
    .map((e) => `${formatLinear(e)} = ${subst(e, x)} = ${fmtNum(evalLinear(e, x))}°`);
  if (parts.length) steps.push({ kind: 'substitute', text: parts.join(',  '), note: `Ganti x dengan ${fmtNum(x)}` });
  steps.push({
    kind: 'check',
    text:
      total !== null
        ? `${fmtNum(angle1)}° + ${fmtNum(angle2)}° = ${fmtNum(angle1 + angle2)}° ✓`
        : `${fmtNum(angle1)}° = ${fmtNum(angle2)}° ✓`,
    note: 'Periksa dengan sifat hubungannya',
  });
  return { x, angle1, angle2, steps };
}

function fmtNum(n: number): string {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

function subst(e: Linear, x: number): string {
  const ax = e.a === 1 ? fmtNum(x) : `${e.a}·${fmtNum(x)}`;
  if (e.b === 0) return ax;
  return `${ax} ${e.b < 0 ? '−' : '+'} ${Math.abs(e.b)}`;
}
