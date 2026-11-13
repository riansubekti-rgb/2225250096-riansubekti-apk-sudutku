/**
 * Suara Busu memakai mesin text-to-speech bawaan HP (Web Speech API) — offline di Android,
 * tanpa layanan luar. Diucapkan per kalimat agar ekspresi Busu bisa berganti mengikuti isi kalimat.
 */

/** Suara khas Busu: lebih tinggi (lucu) dan sedikit lebih cepat dari normal. */
export const VOICE = { rate: 1.2, pitch: 1.75 };

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
    .replace(/["“”]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Pecah teks menjadi kalimat (akhir . ! ?). */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Browser HP tidak mengizinkan suara sebelum pengguna menyentuh layar (kebijakan autoplay).
 * `hasBeenActive` = sudah pernah ada sentuhan di halaman ini.
 */
export function userHasInteracted(): boolean {
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return ua ? ua.hasBeenActive : true;
}

function indonesianVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'id-ID') ?? voices.find((v) => v.lang.toLowerCase().startsWith('id'));
}

// Daftar suara dimuat asinkron di Chrome — pancing sejak awal.
if (canSpeak()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => window.speechSynthesis.getVoices());
}

let current: (() => void) | null = null;

/** Hentikan suara Busu yang sedang berbicara (hanya satu Busu bicara pada satu waktu). */
export function stopAll(): void {
  current?.();
  current = null;
}

export interface SpeakHandlers {
  /** kalimat ke-i mulai diucapkan */
  onSentence?: (i: number) => void;
  /** posisi kata yang sedang diucapkan (0–1 dari panjang kalimat), bila mesin mendukung */
  onProgress?: (i: number, fraction: number) => void;
  /** selesai; `completed` = false bila dihentikan */
  onEnd: (completed: boolean) => void;
}

/** Ucapkan kalimat satu per satu; mengembalikan fungsi untuk menghentikan. */
export function speakSentences(sentences: string[], h: SpeakHandlers): () => void {
  stopAll();
  if (!canSpeak() || sentences.length === 0) {
    h.onEnd(false);
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = indonesianVoice();
  let cancelled = false;
  let ended = false;
  let i = 0;

  const finish = (completed: boolean) => {
    if (ended) return;
    ended = true;
    if (current === cancel) current = null;
    h.onEnd(completed);
  };
  const next = () => {
    if (cancelled) return;
    if (i >= sentences.length) return finish(true);
    const idx = i++;
    const spoken = toSpeakable(sentences[idx]!);
    const u = new SpeechSynthesisUtterance(spoken);
    u.lang = 'id-ID';
    if (voice) u.voice = voice;
    u.rate = VOICE.rate;
    u.pitch = VOICE.pitch;
    u.onstart = () => h.onSentence?.(idx);
    u.onboundary = (e) => h.onProgress?.(idx, Math.min(1, e.charIndex / Math.max(1, spoken.length)));
    u.onend = next;
    u.onerror = next;
    synth.speak(u);
  };
  const cancel = () => {
    cancelled = true;
    synth.cancel();
    finish(false);
  };
  current = cancel;
  next();
  return cancel;
}

/** Kompatibilitas: ucapkan satu teks utuh. */
export function speak(text: string, onEnd: () => void): () => void {
  return speakSentences(splitSentences(text), { onEnd: () => onEnd() });
}
