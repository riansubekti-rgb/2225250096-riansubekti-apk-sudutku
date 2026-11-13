import { planNext } from './policy';
import { makeRng } from '../random';
import { masteryStatus, outcomeScore, updateMastery, type MasteryRec } from '../learner/mastery';
import { RELATIONS } from '../geometry/relation';
import { generateFromTemplate, pairKey, type ProblemTemplate } from '../problems/generator';
import { solveRelation } from '../algebra/linear';
import { isValidAngle } from '../geometry/relation';

describe('model penguasaan', () => {
  it('EMA naik bertahap dan butuh minimal 4 percobaan untuk "menguasai"', () => {
    let m: MasteryRec = { kc: 'KC_RULE', relation: 'complementary', p: 0, n: 0 };
    for (let i = 0; i < 3; i++) m = updateMastery(m, 1);
    expect(m.p).toBeCloseTo(0.657, 3);
    expect(masteryStatus(m)).toBe('berkembang');
    for (let i = 0; i < 2; i++) m = updateMastery(m, 1);
    expect(masteryStatus(m)).toBe('menguasai');
  });

  it('skor hasil langkah', () => {
    expect(outcomeScore({ correct: true, hintLevel: 0, mistakes: 0 })).toBe(1);
    expect(outcomeScore({ correct: true, hintLevel: 1, mistakes: 0 })).toBe(0.6);
    expect(outcomeScore({ correct: true, hintLevel: 2, mistakes: 2 })).toBe(0.3);
    expect(outcomeScore({ correct: false, hintLevel: 3, mistakes: 3 })).toBe(0);
  });
});

describe('planNext', () => {
  it('siswa baru: soal angka dengan bantuan penuh', () => {
    const p = planNext([], null, makeRng(1));
    expect(p.kind).toBe('numeric');
    expect(p.level).toBe('belum');
    expect(p.given).toEqual(['identify', 'rule']);
  });

  it('aljabar terbuka setelah soal angka berkembang', () => {
    const strong = (relation: (typeof RELATIONS)[number]): MasteryRec[] => [
      { kc: 'KC_IDENTIFY', relation, p: 0.9, n: 6 },
      { kc: 'KC_RULE', relation, p: 0.9, n: 6 },
      { kc: 'KC_NUMERIC', relation, p: 0.9, n: 6 },
    ];
    const p = planNext([...strong('supplementary'), ...strong('complementary'), ...strong('vertical')], null, makeRng(2));
    expect(p.kind).toBe('algebra');
  });

  it('menyelingi hubungan bila penguasaan setara', () => {
    for (let s = 0; s < 20; s++) expect(planNext([], 'vertical', makeRng(s)).relation).not.toBe('vertical');
  });

  it('bantuan berkurang bila semua keterampilan dikuasai', () => {
    const all: MasteryRec[] = RELATIONS.flatMap((relation) =>
      (['KC_IDENTIFY', 'KC_RULE', 'KC_NUMERIC', 'KC_ALGEBRA'] as const).map((kc) => ({ kc, relation, p: 0.95, n: 8 })),
    );
    expect(planNext(all, null, makeRng(3)).given).toEqual([]);
  });
});

describe('generator soal', () => {
  const templates: ProblemTemplate[] = [
    { id: 'n', relation: 'complementary', kind: 'numeric', known: [10, 80] },
    { id: 'a', relation: 'supplementary', kind: 'algebra', a1: [1, 5], a2: [1, 5], b1: [-30, 30], b2: [-30, 30] },
    { id: 'v', relation: 'vertical', kind: 'algebra', a1: [2, 6], a2: [1, 4], b1: [-40, 40], b2: [-40, 40] },
  ];

  it.each(templates.map((t) => [t.id, t] as const))('template %s: 1000 seed selalu sah', (_, t) => {
    for (let seed = 1; seed <= 1000; seed++) {
      const p = generateFromTemplate(t, seed);
      const s = solveRelation(p.relation, p.e1, p.e2);
      expect(Number.isInteger(s.x) && s.x > 0).toBe(true);
      expect(isValidAngle(p.relation, s.angle1) && isValidAngle(p.relation, s.angle2)).toBe(true);
    }
  });

  it('seed sama → soal sama (dapat direproduksi)', () => {
    expect(generateFromTemplate(templates[1]!, 42)).toEqual(generateFromTemplate(templates[1]!, 42));
  });

  it('menghindari pasangan yang dikecualikan', () => {
    const banned = new Set<string>();
    for (let k = 10; k <= 80; k++) if (k !== 33) banned.add(pairKey('complementary', { a: 0, b: k }, { a: 1, b: 0 }));
    const p = generateFromTemplate(templates[0]!, 7, (key) => banned.has(key));
    expect(p.e1.b).toBe(33);
  });
});
