import { angleTarget, figureFor, makePair, ruleOptions } from './pair';
import { diagnoseAngle, diagnoseX } from '../checker/misconception';

describe('PairProblem', () => {
  const alg = makePair('t1', 'complementary', '2x', '4x');
  const num = makePair('t2', 'supplementary', '65', 'x');

  it('gambar memakai ekspresi lalu besar sudut', () => {
    expect(figureFor(alg, false)).toEqual({ type: 'complementary', a: 30, labels: ['2x', '4x'] });
    expect(figureFor(alg, true)).toEqual({ type: 'complementary', a: 30, labels: ['30°', '60°'] });
    expect(figureFor(num, false).labels).toEqual(['65°', 'x']);
  });

  it('target substitusi', () => {
    expect(angleTarget(alg)).toEqual({ a: 2, b: 0 });
    expect(angleTarget(num)).toBeNull();
  });

  it('tiga pilihan aturan', () => {
    expect(ruleOptions(makePair('t', 'supplementary', '3x+15', '2x-10')).map((o) => o.text)).toEqual([
      '(3x + 15) + (2x − 10) = 180',
      '(3x + 15) + (2x − 10) = 90',
      '3x + 15 = 2x − 10',
    ]);
  });
});

describe('diagnosis miskonsepsi', () => {
  it('x hasil memakai 180 pada soal berpenyiku', () => {
    // 2x + 4x = 180 → x = 30 (seharusnya 15)
    expect(diagnoseX('complementary', { a: 2, b: 0 }, { a: 4, b: 0 }, 30)).toBe('M_COMP_AS_SUP');
  });
  it('x hasil memakai 90 pada soal berpelurus', () => {
    expect(diagnoseX('supplementary', { a: 0, b: 65 }, { a: 1, b: 0 }, 25)).toBe('M_SUP_AS_COMP');
  });
  it('salah hitung biasa', () => {
    expect(diagnoseX('supplementary', { a: 0, b: 65 }, { a: 1, b: 0 }, 105)).toBe('M_ARITH');
  });
  it('menjawab x sebagai besar sudut', () => {
    expect(diagnoseAngle(15, 15)).toBe('M_X_NOT_ANGLE');
    expect(diagnoseAngle(15, 31)).toBe('M_SUBST_ERR');
  });
});
