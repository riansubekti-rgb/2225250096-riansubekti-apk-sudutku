import type { BusuMood } from './Busu';

/**
 * Pilih ekspresi Busu yang cocok dengan isi kalimat yang sedang diucapkan,
 * agar wajahnya "ikut berbicara". Urutan aturan penting (yang pertama cocok menang).
 */
const w = (words: string) => new RegExp(`(?<![a-z])(${words})(?![a-z])`, 'i');

const RULES: [RegExp, BusuMood][] = [
  [w('belum tepat|salah|keliru|ups|oops|kurang tepat|belum paham'), 'oops'],
  [w('tidak apa|jangan khawatir|jangan sedih|bingung|sulit|susah'), 'sad'],
  [w('wah|wow|hihi|geli|lho|astaga'), 'wow'],
  [w('hebat|tepat|benar|bagus|keren|pintar|selamat|semangat|berhasil|yuk|ayo|yeay|hore|asyik|haiii|seru'), 'cheer'],
  [w('aku dibuat|bangga|tahukah|aku busu|jadi x'), 'proud'],
  [w('ingat|kuncinya|rahasia|tips|gampang'), 'wink'],
  [/\?\s*$/, 'think'],
];

export function moodFromText(sentence: string, base: BusuMood = 'happy'): BusuMood {
  for (const [re, mood] of RULES) if (re.test(sentence)) return mood;
  return base;
}
