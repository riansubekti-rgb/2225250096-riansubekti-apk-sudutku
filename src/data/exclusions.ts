import pre from '../../content/instruments/literacy-pretest.json';
import post from '../../content/instruments/literacy-posttest.json';
import { LiteracyTestSchema } from './schemas';
import { parseLinear } from '../domain/algebra/linear';
import { pairKey } from '../domain/problems/generator';

/**
 * Kunci soal yang TIDAK boleh muncul di latihan karena sama dengan butir pretest/posttest
 * (mencegah kebocoran tes yang membiaskan N-gain).
 */
function buildTestKeys(): Set<string> {
  const keys = new Set<string>();
  for (const t of [LiteracyTestSchema.parse(pre), LiteracyTestSchema.parse(post)]) {
    for (const item of t.items) {
      const f = item.figure;
      if (!f) continue;
      const [l1, l2] = f.labels;
      if (l1 && l2 && /x/.test(l1) && /x/.test(l2)) {
        keys.add(pairKey(f.type, parseLinear(l1), parseLinear(l2)));
      } else if (f.labels.includes('?')) {
        keys.add(pairKey(f.type, { a: 0, b: f.a }, { a: 1, b: 0 }));
      }
    }
  }
  return keys;
}

const TEST_KEYS = buildTestKeys();

export const isTestItem = (key: string): boolean => TEST_KEYS.has(key);
export const testKeyCount = TEST_KEYS.size;
