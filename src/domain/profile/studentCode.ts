import type { Rng } from '../random';

/**
 * Kode siswa ACAK (prd.md F12, D12, D22): 6 karakter = 1 huruf kelas + 4 karakter acak + 1 karakter cek.
 * Ditampilkan berkelompok "AK7-QM2". Karakter yang mirip (I/1, O/0, S) tidak dipakai.
 * Karakter cek (bobot 1–5, mod 31 — bilangan prima) menangkap salah ketik satu karakter
 * dan tertukarnya dua karakter bersebelahan, sehingga data siswa tidak terpecah ke profil yang salah.
 */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXYZ23456789'; // 31 karakter
export const CLASS_LETTERS = 'ABCDEFGHJKLMNPQRTUVWXYZ';
const CODE_RE = new RegExp(`^[${CLASS_LETTERS}][${CODE_ALPHABET}]{5}$`);

function checkChar(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) sum += (i + 1) * CODE_ALPHABET.indexOf(body[i]!);
  return CODE_ALPHABET[sum % CODE_ALPHABET.length]!;
}

/** Satu kode acak untuk kelas tertentu. */
export function makeStudentCode(classLetter: string, rng: Rng): string {
  const cls = classLetter.toUpperCase();
  if (!CLASS_LETTERS.includes(cls) || cls.length !== 1) throw new Error(`huruf kelas tidak sah: ${classLetter}`);
  let body = cls;
  for (let i = 0; i < 4; i++) body += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)]!;
  return body + checkChar(body);
}

/** `count` kode acak yang berbeda satu sama lain (dan berbeda dari `existing`). */
export function generateCodes(classLetter: string, count: number, rng: Rng, existing: Iterable<string> = []): string[] {
  const seen = new Set(existing);
  const out: string[] = [];
  while (out.length < count) {
    const c = makeStudentCode(classLetter, rng);
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

/** Huruf besar, buang spasi/tanda hubung. */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidStudentCode(code: string): boolean {
  return CODE_RE.test(code) && checkChar(code.slice(0, 5)) === code[5];
}

/** "AK7QM2" → "AK7-QM2" agar mudah dibaca & disalin. */
export function formatCode(code: string): string {
  return code.length === 6 ? `${code.slice(0, 3)}-${code.slice(3)}` : code;
}

/** Huruf pertama = kelas. */
export function classOf(code: string): string {
  return code.charAt(0);
}

/** Contoh format untuk petunjuk di layar — SENGAJA tidak sah (huruf ceknya salah). */
export const EXAMPLE_CODE = 'AK7-QM2';
