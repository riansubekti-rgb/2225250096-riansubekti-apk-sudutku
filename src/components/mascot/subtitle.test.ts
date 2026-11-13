import { chunkOf, chunkWords, wordAtFraction, wordDuration, wordStarts } from './subtitle';

const text =
  'Hai! Aku Busu, si busur derajat yang suka sudut, yang dibuat oleh Kak Rian Subekti, mahasiswa S1 Pendidikan Matematika, agar membuat kamu mudah memahami materi garis dan sudut.';
const words = text.split(' ');

describe('subtitle berjalan', () => {
  it('memotong di tanda baca dan maksimal 6 kata', () => {
    const c = chunkWords(words, 6).map((k) => words.slice(k.start, k.end + 1).join(' '));
    expect(c[0]).toBe('Hai!');
    expect(c[1]).toBe('Aku Busu,');
    expect(c.every((s) => s.split(' ').length <= 6)).toBe(true);
    expect(c.join(' ')).toBe(text); // tidak ada kata yang hilang
  });

  it('menemukan potongan untuk kata tertentu', () => {
    const chunks = chunkWords(words, 6);
    expect(chunkOf(chunks, 0)).toEqual({ start: 0, end: 0 });
    expect(chunkOf(chunks, 2)).toEqual({ start: 1, end: 2 });
  });

  it('posisi huruf → kata yang sedang diucapkan', () => {
    const s = wordStarts(words);
    expect(wordAtFraction(s, text.length, 0)).toBe(0);
    expect(wordAtFraction(s, text.length, 0.999)).toBe(words.length - 1);
  });

  it('kata panjang & bertanda baca lebih lama', () => {
    expect(wordDuration('Matematika,', 1)).toBeGreaterThan(wordDuration('si', 1));
  });
});
