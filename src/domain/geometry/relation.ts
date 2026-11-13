/** Hubungan antar sudut (architecture.md §4.1). Nama kode Inggris, label UI Indonesia. */
export type Relation = 'supplementary' | 'complementary' | 'vertical';

export const RELATIONS: readonly Relation[] = ['supplementary', 'complementary', 'vertical'];

/** Jumlah kedua sudut; null = sama besar (bertolak belakang). */
export const RELATION_TOTAL: Record<Relation, number | null> = {
  supplementary: 180,
  complementary: 90,
  vertical: null,
};

export const RELATION_LABEL: Record<Relation, string> = {
  supplementary: 'Berpelurus',
  complementary: 'Berpenyiku',
  vertical: 'Bertolak belakang',
};

/** Simbol pendamping warna — warna tidak boleh berdiri sendiri (desain.md §2). */
export const RELATION_SYMBOL: Record<Relation, string> = {
  supplementary: '— 180°',
  complementary: '∟ 90°',
  vertical: '✕ =',
};

/** Besar sudut pasangan bila satu sudut diketahui. */
export function partnerAngle(rel: Relation, known: number): number {
  const total = RELATION_TOTAL[rel];
  return total === null ? known : total - known;
}

/** Rentang sah: berpenyiku 0<a<90; berpelurus & bertolak belakang 0<a<180. */
export function isValidAngle(rel: Relation, deg: number): boolean {
  const max = rel === 'complementary' ? 90 : 180;
  return Number.isFinite(deg) && deg > 0 && deg < max;
}
