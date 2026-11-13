import { isValidStudentCode, makeStudentCode, normalizeCode } from './studentCode';

describe('kode siswa', () => {
  it('kode buatan selalu valid', () => {
    for (const p of ['A', 'B', 'H', 'Z']) for (let n = 1; n <= 99; n++) expect(isValidStudentCode(makeStudentCode(p, n))).toBe(true);
  });

  it('menangkap salah ketik satu digit', () => {
    for (let n = 1; n <= 99; n++) {
      const code = makeStudentCode('A', n);
      for (let pos = 1; pos <= 2; pos++)
        for (let d = 0; d <= 9; d++) {
          const typo = code.slice(0, pos) + d + code.slice(pos + 1);
          if (typo !== code) expect(isValidStudentCode(typo)).toBe(false);
        }
    }
  });

  it('menangkap dua digit tertukar', () => {
    for (let n = 10; n <= 99; n++) {
      const code = makeStudentCode('A', n);
      const swapped = code[0]! + code[2] + code[1] + code[3];
      if (swapped !== code) expect(isValidStudentCode(swapped)).toBe(false);
    }
  });

  it('normalisasi masukan', () => expect(normalizeCode(' a-07 h ')).toBe('A07H'));
  it('menolak format salah', () => expect(isValidStudentCode('A7')).toBe(false));
});
