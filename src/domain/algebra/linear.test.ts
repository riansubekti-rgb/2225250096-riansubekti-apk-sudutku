import { formatLinear, parseLinear, solveRelation, ParseError } from './linear';

describe('parseLinear', () => {
  it.each([
    ['3x-5', { a: 3, b: -5 }],
    ['x', { a: 1, b: 0 }],
    ['2x + 10', { a: 2, b: 10 }],
    ['40', { a: 0, b: 40 }],
    ['3x − 20', { a: 3, b: -20 }],
    ['-x+30', { a: -1, b: 30 }],
  ])('%s', (src, expected) => expect(parseLinear(src)).toEqual(expected));

  it('menolak masukan tidak valid', () => {
    expect(() => parseLinear('')).toThrow(ParseError);
    expect(() => parseLinear('2y')).toThrow(ParseError);
    expect(() => parseLinear('3x*2')).toThrow(ParseError);
  });
});

describe('formatLinear', () => {
  it('format rapi', () => {
    expect(formatLinear({ a: 2, b: 10 })).toBe('2x + 10');
    expect(formatLinear({ a: 1, b: -5 })).toBe('x − 5');
    expect(formatLinear({ a: 3, b: 0 })).toBe('3x');
    expect(formatLinear({ a: 0, b: 7 })).toBe('7');
  });
});

/** Tiga contoh acuan dari api.md §1.2. */
describe('solveRelation', () => {
  it('berpenyiku 2x dan 3x → x = 18, sudut 36° dan 54°', () => {
    const s = solveRelation('complementary', { a: 2, b: 0 }, { a: 3, b: 0 });
    expect([s.x, s.angle1, s.angle2]).toEqual([18, 36, 54]);
    expect(s.steps.map((t) => t.text)).toEqual([
      '2x + 3x = 90',
      '5x = 90',
      'x = 18',
      '2x = 2·18 = 36°,  3x = 3·18 = 54°',
      '36° + 54° = 90° ✓',
    ]);
  });

  it('berpelurus (2x + 10) dan (3x − 5) → x = 35, sudut 80° dan 100°', () => {
    const s = solveRelation('supplementary', { a: 2, b: 10 }, { a: 3, b: -5 });
    expect([s.x, s.angle1, s.angle2]).toEqual([35, 80, 100]);
    expect(s.steps.map((t) => t.kind)).toEqual(['rule', 'combine', 'move', 'divide', 'substitute', 'check']);
    expect(s.steps[2]!.text).toBe('5x = 175');
  });

  it('bertolak belakang 3x − 20 = x + 40 → x = 30, sudut 70°', () => {
    const s = solveRelation('vertical', { a: 3, b: -20 }, { a: 1, b: 40 });
    expect([s.x, s.angle1, s.angle2]).toEqual([30, 70, 70]);
    expect(s.steps[1]!.text).toBe('2x = 60');
  });

  it('soal angka: 65 + x = 180 → x = 115 tanpa langkah berlebih', () => {
    const s = solveRelation('supplementary', { a: 0, b: 65 }, { a: 1, b: 0 });
    expect(s.steps.map((t) => t.text)).toEqual(['65 + x = 180', 'x = 115', '65° + 115° = 180° ✓']);
  });

  it('bertolak belakang 70 = x → x = 70 (tanpa −x)', () => {
    const s = solveRelation('vertical', { a: 0, b: 70 }, { a: 1, b: 0 });
    expect(s.x).toBe(70);
    expect(s.steps.map((t) => t.text)).toEqual(['70 = x', 'x = 70', '70° = 70° ✓']);
  });

  it('pengecekan akhir selalu konsisten', () => {
    for (let a1 = 1; a1 <= 5; a1++)
      for (let a2 = 1; a2 <= 5; a2++) {
        const s = solveRelation('supplementary', { a: a1, b: 0 }, { a: a2, b: 0 });
        expect(s.angle1 + s.angle2).toBeCloseTo(180);
      }
  });
});
