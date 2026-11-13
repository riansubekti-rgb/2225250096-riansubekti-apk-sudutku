import { useCallback, useEffect, useRef, useState } from 'react';
import { canSpeak, speakSentences, splitSentences, userHasInteracted } from '../../platform/speech';
import { logEvent } from '../../data/log';
import { moodFromText } from './moodFromText';
import { useVoice } from './voiceStore';
import type { BusuMood } from './Busu';

/**
 * Suara Busu untuk satu balon kata. `auto`: Busu langsung bicara sendiri saat teks muncul/berubah
 * (setelah sentuhan pertama di halaman — aturan autoplay browser). `toggle`: ketuk untuk ulang/berhenti.
 * `mood` = ekspresi yang mengikuti kalimat yang sedang diucapkan (null bila diam).
 */
export function useSpeech(opts: { text?: string; auto?: boolean; baseMood?: BusuMood } = {}) {
  const enabled = useVoice((s) => s.enabled);
  const [speaking, setSpeaking] = useState(false);
  const [mood, setMood] = useState<BusuMood | null>(null);
  const cancel = useRef<(() => void) | null>(null);
  const base = opts.baseMood ?? 'happy';

  const play = useCallback(
    (text: string, whole = false) => {
      // whole: ucapkan sekali jalan tanpa dipecah per kalimat (perkenalan di halaman Masuk)
      const sentences = whole ? [text] : splitSentences(text);
      setSpeaking(true);
      setMood(moodFromText(sentences[0] ?? '', base));
      cancel.current = speakSentences(sentences, {
        onSentence: (i) => setMood(moodFromText(sentences[i]!, base)),
        onEnd: () => {
          setSpeaking(false);
          setMood(null);
          cancel.current = null;
        },
      });
    },
    [base],
  );

  useEffect(() => () => cancel.current?.(), []);

  useEffect(() => {
    if (!opts.auto || !opts.text || !enabled || !canSpeak()) return;
    const go = () => play(opts.text!);
    if (!userHasInteracted()) {
      // Aturan autoplay browser: tunggu sentuhan pertama, lalu langsung bicara.
      window.addEventListener('pointerdown', go, { once: true });
      return () => window.removeEventListener('pointerdown', go);
    }
    const t = window.setTimeout(go, 200);
    return () => window.clearTimeout(t);
    // bicara hanya bila teksnya berubah (mis. setelah Busu diketuk)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.text, opts.auto, enabled]);

  const toggle = (text?: string, o: { whole?: boolean } = {}) => {
    if (speaking) {
      cancel.current?.();
      return;
    }
    const t = text ?? opts.text;
    if (!t || !enabled) return;
    void logEvent('busu_speak', { length: t.length });
    play(t, o.whole);
  };

  return { speaking, mood, toggle, available: canSpeak() && enabled };
}
