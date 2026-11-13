import { RELATION_LABEL, RELATION_SYMBOL, type Relation } from '../domain/geometry/relation';

const COLOR_VAR: Record<Relation, string> = {
  supplementary: 'var(--rel-sup)',
  complementary: 'var(--rel-comp)',
  vertical: 'var(--rel-vert)',
};

/** Chip hubungan sudut: warna token + simbol + teks (tidak bergantung warna saja). */
export function RelationChip({ relation }: { relation: Relation }) {
  const color = COLOR_VAR[relation];
  return (
    <span
      className="inline-flex min-h-[36px] items-center gap-2 rounded-full border-2 px-3 text-sm font-bold"
      style={{ borderColor: color, color }}
    >
      <span aria-hidden>{RELATION_SYMBOL[relation]}</span>
      <span>{RELATION_LABEL[relation]}</span>
    </span>
  );
}
