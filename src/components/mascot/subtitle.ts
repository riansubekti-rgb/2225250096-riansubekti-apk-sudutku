/**
 * Logika subtitle berjalan (murni, mudah diuji): memecah kalimat menjadi potongan pendek
 * dan memperkirakan lama tiap kata saat mesin suara tidak mengirim posisi kata.
 */

export interface Chunk {
  start: number; // indeks kata pertama
  end: number; // indeks kata terakhir (inklusif)
}

/** Potong setelah tanda baca (, . ! ?) atau bila sudah `max` kata. */
export function chunkWords(words: string[], max = 6): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;
  words.forEach((w, i) => {
    const count = i - start + 1;
    const last = i === words.length - 1;
    if (last || /[,.!?]$/.test(w) || count >= max) {
      chunks.push({ start, end: i });
      start = i + 1;
    }
  });
  return chunks;
}

export function chunkOf(chunks: Chunk[], wordIndex: number): Chunk | undefined {
  return chunks.find((c) => wordIndex >= c.start && wordIndex <= c.end);
}

/** Posisi huruf awal setiap kata dalam teks yang dipisah spasi tunggal. */
export function wordStarts(words: string[]): number[] {
  let c = 0;
  return words.map((w) => {
    const s = c;
    c += w.length + 1;
    return s;
  });
}

/** Kata ke berapa yang sedang diucapkan, dari posisi huruf (0–1 dari panjang teks). */
export function wordAtFraction(starts: number[], textLength: number, fraction: number): number {
  const ch = fraction * textLength;
  let idx = 0;
  for (let i = 0; i < starts.length; i++) if (starts[i]! <= ch) idx = i;
  return idx;
}

/** Perkiraan lama mengucapkan satu kata (ms) — dipakai bila posisi kata tidak tersedia. */
export function wordDuration(word: string, rate: number): number {
  const pause = /[,.!?]$/.test(word) ? 220 : 0;
  return (150 + 48 * word.replace(/[^\p{L}\p{N}]/gu, '').length + pause) / rate;
}
