import { nGain, nGainCategory, scoreTest, subscaleMeans, susScore } from './scoring';
import { hashSeed, makeRng, shuffle } from '../random';

describe('penilaian', () => {
  const items = [
    { id: 'P1', answer: 'A', score: 1, process: 'employ' },
    { id: 'P2', answer: 'A', score: 1, process: 'employ' },
    { id: 'P3', answer: 'A', score: 1, process: 'interpret' },
  ];

  it('skor tes & per proses PISA', () => {
    const r = scoreTest(items, { P1: 'A', P2: 'C', P3: 'A' });
    expect(r).toMatchObject({ score: 2, max: 3, answered: 3 });
    expect(r.byProcess).toEqual({ employ: { score: 1, max: 2 }, interpret: { score: 1, max: 1 } });
  });

  it('butir kosong = 0', () => expect(scoreTest(items, { P1: 'A' })).toMatchObject({ score: 1, answered: 1 }));

  it('N-gain Hake', () => {
    expect(nGain(4, 7, 10)).toBeCloseTo(0.5);
    expect(nGainCategory(0.5)).toBe('sedang');
    expect(nGainCategory(0.7)).toBe('tinggi');
    expect(nGain(10, 10, 10)).toBeNull();
  });

  it('SUS: contoh baku', () => {
    expect(susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1])).toBe(100);
    expect(susScore([3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toBe(50);
    expect(susScore([4, 2, 4, 2])).toBeNull();
  });

  it('rata-rata subskala', () => {
    expect(subscaleMeans([{ subscale: 'IL', value: 2 }, { subscale: 'IL', value: 4 }, { subscale: 'GL', value: 9 }])).toEqual({ IL: 3, GL: 9 });
  });
});

describe('acak opsi stabil per siswa', () => {
  it('seed sama → urutan sama; isi tetap lengkap', () => {
    const a = shuffle(makeRng(hashSeed('AK7QM9|literacy-pretest|PRE01')), ['A', 'B', 'C', 'D']);
    const b = shuffle(makeRng(hashSeed('AK7QM9|literacy-pretest|PRE01')), ['A', 'B', 'C', 'D']);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(['A', 'B', 'C', 'D']);
  });
});
