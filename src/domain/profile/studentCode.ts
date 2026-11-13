/**
 * Kode siswa berformat huruf kelompok + 2 digit + huruf cek, mis. "A07H" (prd.md F12, D12).
 * Huruf cek (mod 23, prima) menangkap salah ketik satu digit dan tertukarnya dua digit,
 * sehingga data siswa tidak terpecah ke profil yang salah.
 */
const CHECK = 'ABCDEFGHJKLMNPQRTUVWXYZ'; // 23 huruf, tanpa I, O, S (mirip 1, 0, 5)
const CODE_RE = /^([A-Z])(\d{2})([A-Z])$/;

export function checkLetter(prefix: string, n: number): string {
  const p = prefix.charCodeAt(0) - 65;
  return CHECK[(p * 7 + n) % CHECK.length]!;
}

export function makeStudentCode(prefix: string, n: number): string {
  return `${prefix}${String(n).padStart(2, '0')}${checkLetter(prefix, n)}`;
}

/** Huruf besar, buang spasi/tanda hubung. */
export function normalizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidStudentCode(code: string): boolean {
  const m = CODE_RE.exec(code);
  if (!m) return false;
  return checkLetter(m[1]!, Number(m[2])) === m[3];
}

/** Huruf pertama = kelompok/kelas. */
export function classOf(code: string): string {
  return code.charAt(0);
}
