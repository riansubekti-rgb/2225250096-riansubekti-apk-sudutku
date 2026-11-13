/**
 * Suara Busu memakai mesin text-to-speech bawaan HP (Web Speech API) — offline di Android,
 * tanpa layanan luar. Selalu dipicu oleh ketukan siswa (tidak auto-play, desain.md §9).
 */

/** Ubah teks matematika menjadi kalimat yang enak dibacakan. */
export function toSpeakable(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}✓ⓘ⭐]/gu, '')
    .replace(/∠\s?/g, 'sudut ')
    .replace(/(\d)\s*°/g, '$1 derajat')
    .replace(/°/g, ' derajat')
    .replace(/∟/g, 'siku-siku')
    .replace(/\s[−-]\s/g, ' kurang ')
    .replace(/\s\+\s/g, ' tambah ')
    .replace(/\s=\s/g, ' sama dengan ')
    .replace(/·/g, ' kali ')
    .replace(/(\d)x\b/g, '$1 x')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function indonesianVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'id-ID') ?? voices.find((v) => v.lang.toLowerCase().startsWith('id'));
}

/** Bacakan teks; mengembalikan fungsi untuk menghentikan. */
export function speak(text: string, onEnd: () => void): () => void {
  if (!canSpeak()) {
    onEnd();
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.cancel(); // hanya satu suara pada satu waktu
  const u = new SpeechSynthesisUtterance(toSpeakable(text));
  u.lang = 'id-ID';
  const v = indonesianVoice();
  if (v) u.voice = v;
  u.rate = 0.95;
  u.pitch = 1.35; // suara ceria khas maskot
  u.onend = onEnd;
  u.onerror = onEnd;
  synth.speak(u);
  return () => {
    synth.cancel();
    onEnd();
  };
}
