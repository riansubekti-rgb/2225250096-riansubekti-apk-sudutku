import pre from '../../content/instruments/literacy-pretest.json';
import post from '../../content/instruments/literacy-posttest.json';
import concepts from '../../content/concepts/concepts.json';
import worked from '../../content/worked-examples/worked.json';
import templates from '../../content/problems/templates.json';
import warmup from '../../content/warmup/warmup.json';
import missions from '../../content/literacy/missions.json';
import paas from '../../content/instruments/paas.json';
import access from '../../content/instruments/access-codes.json';
import { AccessCodesSchema, ConceptsSchema, LiteracyTestSchema, MissionsSchema, PaasSchema, TemplatesSchema, WarmupSchema, WorkedSchema } from './schemas';
import { generateFromTemplate, pairKey } from '../domain/problems/generator';
import { isTestItem, testKeyCount } from './exclusions';
import { parseLinear, solveRelation } from '../domain/algebra/linear';
import { isValidAngle } from '../domain/geometry/relation';

describe('pemanasan & misi', () => {
  it('pemanasan lolos skema; kartu remedial ada', () => {
    const w = WarmupSchema.parse(warmup);
    for (const c of w.checks) if (c.remedial) expect(w.cards.some((k) => k.id === c.remedial)).toBe(true);
  });

  const ms = MissionsSchema.parse(missions).missions;
  it.each(ms.map((m) => [m.id, m] as const))('misi %s: angka sah & bukan butir tes', (_, m) => {
    const e1 = parseLinear(m.e1);
    const e2 = parseLinear(m.e2);
    const s = solveRelation(m.relation, e1, e2);
    expect(Number.isInteger(s.x) && s.x > 0).toBe(true);
    for (const v of [s.angle1, s.angle2]) expect(Number.isInteger(v) && isValidAngle(m.relation, v)).toBe(true);
    expect(isTestItem(pairKey(m.relation, e1, e2))).toBe(false);
    expect(m.interpret.answer).toBeLessThan(m.interpret.options.length);
  });

  it('konteks misi berbeda dari konteks butir tes', () => {
    const testWords = ['gunting', 'laptop', 'palang', 'jalan merdeka', 'kertas'];
    for (const m of ms) for (const w of testWords) expect(m.context.toLowerCase()).not.toContain(w);
  });
});

describe('template latihan', () => {
  it('lolos skema & daftar butir tes yang dikecualikan terisi', () => {
    expect(TemplatesSchema.parse(templates).templates.length).toBeGreaterThanOrEqual(6);
    expect(testKeyCount).toBeGreaterThanOrEqual(10);
  });
  it('generator tidak pernah menghasilkan butir tes (300 seed per template)', () => {
    for (const t of TemplatesSchema.parse(templates).templates)
      for (let seed = 1; seed <= 300; seed++) {
        const p = generateFromTemplate(t, seed, isTestItem);
        expect(isTestItem(pairKey(p.relation, p.e1, p.e2))).toBe(false);
      }
  });
  it('skala Paas lolos skema', () => expect(PaasSchema.parse(paas).max).toBe(9));
  it('kode dari guru unik & lolos skema', () => {
    const c = AccessCodesSchema.parse(access).codes.map((x) => x.code);
    expect(new Set(c).size).toBe(c.length);
  });
});

describe('contoh bertahap (agents.md §7)', () => {
  const w = WorkedSchema.parse(worked);
  const pairs = w.examples.flatMap((ex) => [
    { id: ex.id, relation: ex.relation, e1: ex.e1, e2: ex.e2 },
    { id: `${ex.id}/kembar`, relation: ex.relation, ...ex.twin },
  ]);

  it.each(pairs.map((p) => [p.id, p] as const))('%s: x & sudut bilangan bulat positif yang sah', (_, p) => {
    const s = solveRelation(p.relation, parseLinear(p.e1), parseLinear(p.e2));
    expect(Number.isInteger(s.x) && s.x > 0).toBe(true);
    for (const ang of [s.angle1, s.angle2]) {
      expect(Number.isInteger(ang)).toBe(true);
      expect(isValidAngle(p.relation, ang)).toBe(true);
    }
  });

  it('tidak ada pasangan ekspresi yang sama dengan butir pretest/posttest (mencegah bocor)', () => {
    const testStems = [...pre.items, ...post.items].map((i) => i.stem.replace(/\s+/g, ''));
    for (const p of pairs) {
      if (/^\d+$/.test(p.e1)) continue; // soal angka diperiksa terpisah
      const a = p.e1.replace(/-/g, '−');
      const b = p.e2.replace(/-/g, '−');
      const leak = testStems.some((s) => s.includes(`(${a})`) && s.includes(`(${b})`));
      expect(leak, `${p.id} sama dengan butir tes`).toBe(false);
    }
  });
});

describe('konten Kenali Hubungan', () => {
  it('lolos skema (termasuk batas kata kalimat inti)', () => {
    const c = ConceptsSchema.parse(concepts);
    expect(c.cards.filter((k) => k.kind === 'concept')).toHaveLength(3);
    expect(c.cards.filter((k) => k.kind === 'quiz').length).toBeGreaterThanOrEqual(6);
  });
  it('kuis memuat ketiga hubungan', () => {
    const c = ConceptsSchema.parse(concepts);
    const answers = new Set(c.cards.flatMap((k) => (k.kind === 'quiz' ? [k.answer] : [])));
    expect(answers.size).toBe(3);
  });
});
import { partnerAngle } from '../domain/geometry/relation';

const pretest = LiteracyTestSchema.parse(pre);
const posttest = LiteracyTestSchema.parse(post);

describe('instrumen literasi (D10)', () => {
  it('lolos skema', () => {
    expect(pretest.items).toHaveLength(10);
    expect(posttest.items).toHaveLength(10);
  });

  it('pretest & posttest paralel: indikator dan kesulitan sama per nomor', () => {
    pretest.items.forEach((p, i) => {
      const q = posttest.items[i]!;
      expect(p.parallelOf).toBe(q.id);
      expect(q.parallelOf).toBe(p.id);
      expect(q.indicator).toEqual(p.indicator);
      expect(q.difficulty).toBe(p.difficulty);
    });
  });

  it('sebaran proses PISA: merumuskan 3, menerapkan 4, menafsirkan 3', () => {
    for (const t of [pretest, posttest]) {
      const count = (p: string) => t.items.filter((i) => i.indicator.pisaProcess === p).length;
      expect([count('formulate'), count('employ'), count('interpret')]).toEqual([3, 4, 3]);
    }
  });

  it('opsi tidak ada yang kembar dan kunci ada di daftar opsi', () => {
    for (const item of [...pretest.items, ...posttest.items]) {
      const texts = item.options.map((o) => o.text);
      expect(new Set(texts).size).toBe(4);
      expect(item.options.some((o) => o.id === item.answer)).toBe(true);
    }
  });

  it('kunci butir numerik sesuai partnerAngle', () => {
    for (const item of [...pretest.items, ...posttest.items]) {
      const fig = item.figure;
      const key = item.options.find((o) => o.id === item.answer)!.text;
      if (!fig || !/^\d+°$/.test(key) || !fig.labels.includes('?')) continue;
      expect(key).toBe(`${partnerAngle(fig.type, fig.a)}°`);
    }
  });
});
