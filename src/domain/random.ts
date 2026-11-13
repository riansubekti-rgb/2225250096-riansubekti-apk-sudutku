/** RNG ber-seed (mulberry32) agar soal yang dibangkitkan dapat direproduksi untuk penelitian. */
export type Rng = () => number;

export function makeRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bilangan bulat acak di [lo, hi], kelipatan `step`. */
export function randInt(rng: Rng, lo: number, hi: number, step = 1): number {
  const n = Math.floor((hi - lo) / step) + 1;
  return lo + Math.floor(rng() * n) * step;
}

/** Seed stabil dari teks (FNV-1a), mis. kode siswa + id instrumen → urutan opsi yang sama setiap dibuka. */
export function hashSeed(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Fisher–Yates; tidak mengubah array asli. */
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
