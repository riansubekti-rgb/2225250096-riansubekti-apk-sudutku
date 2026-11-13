import {
  CODE_ALPHABET,
  EXAMPLE_CODE,
  formatCode,
  generateCodes,
  isValidStudentCode,
  makeStudentCode,
  normalizeCode,
} from './studentCode';
import { makeRng } from '../random';

describe('kode siswa acak', () => {
  const codes = generateCodes('A', 500, makeRng(7));

  it('kode buatan selalu sah, unik, dan berawalan huruf kelas', () => {
    expect(new Set(codes).size).toBe(500);
    for (const c of codes) {
      expect(isValidStudentCode(c)).toBe(true);
      expect(c[0]).toBe('A');
      expect(c).toHaveLength(6);
    }
  });

  it('acak — tidak berurutan seperti A01, A02, …', () => {
    const second = codes.map((c) => c[1]);
    expect(new Set(second).size).toBeGreaterThan(20);
  });

  it('kode lama berformat A07H & contoh di layar tidak sah', () => {
    expect(isValidStudentCode('A07H')).toBe(false);
    expect(isValidStudentCode(normalizeCode(EXAMPLE_CODE))).toBe(false);
  });

  it('menangkap salah ketik satu karakter', () => {
    for (const code of codes.slice(0, 60))
      for (let pos = 1; pos < 6; pos++)
        for (const ch of CODE_ALPHABET) {
          const typo = code.slice(0, pos) + ch + code.slice(pos + 1);
          if (typo !== code) expect(isValidStudentCode(typo)).toBe(false);
        }
  });

  it('menangkap dua karakter bersebelahan tertukar', () => {
    for (const code of codes.slice(0, 200))
      for (let pos = 1; pos < 5; pos++) {
        const sw = code.slice(0, pos) + code[pos + 1] + code[pos] + code.slice(pos + 2);
        if (sw !== code) expect(isValidStudentCode(sw)).toBe(false);
      }
  });

  it('seed sama → kode sama (daftar kartu bisa dibuat ulang)', () => {
    expect(makeStudentCode('B', makeRng(3))).toBe(makeStudentCode('B', makeRng(3)));
  });

  it('format & normalisasi', () => {
    expect(formatCode('AK7QM2')).toBe('AK7-QM2');
    expect(normalizeCode(' ak7-qm2 ')).toBe('AK7QM2');
  });

  it('menolak huruf kelas yang mirip angka', () => {
    expect(() => makeStudentCode('O', makeRng(1))).toThrow();
  });
});
