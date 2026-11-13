/** Teks antarmuka umum (bukan materi). Materi & soal tetap di /content. */
export const KAHP_LABEL = {
  identify: 'Kenali',
  rule: 'Aturan',
  compute: 'Hitung',
  check: 'Periksa',
} as const;

export type KahpPhase = keyof typeof KAHP_LABEL;
export const KAHP_ORDER: KahpPhase[] = ['identify', 'rule', 'compute', 'check'];
