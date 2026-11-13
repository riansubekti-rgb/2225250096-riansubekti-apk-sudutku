import { useCallback, useEffect, useRef, useState } from 'react';
import { canSpeak, speakSentences, splitSentences, userHasInteracted } from '../../platform/speech';
import { logEvent } from '../../data/log';
import { moodFromText } from './moodFromText';
import { useVoice } from './voiceStore';
import type { BusuMood } from './Busu';

/**
 * Suara Busu untuk satu balon kata.
 * - `auto`: langsung bicara saat teks muncul/berubah (bila suara nyala & layar sudah pernah disentuh).
 * - `mood`: ekspresi yang mengikuti kalimat yang sedang diucapkan (null bila diam).
 */
export function useSpeech(opts: { text?: string; auto?: boolean; baseMood?: BusuMood } = {}) {
  const enabled = useVoice((s) => s.enabled);
  const [speaking, setSpeaking] = useState(false);
  const [mood, setMood] = useState<BusuMood | null>(null);
  const cancel = useRef<(() => void) | null>(null);
  const base = opts.baseMood ?? 'happy';

  const play = useCallback(
    (text: string) => {
      const sentences = splitSentences(text);
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
    if (!opts.auto || !opts.text || !enabled || !canSpeak() || !userHasInteracted()) return;
    const t = window.setTimeout(() => play(opts.text!), 150);
    return () => window.clearTimeout(t);
    // bicara ulang hanya bila teksnya berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.text, opts.auto, enabled]);

  const toggle = (text?: string) => {
    if (speaking) {
      cancel.current?.();
      return;
    }
    const t = text ?? opts.text;
    if (!t) return;
    void logEvent('busu_speak', { length: t.length });
    play(t);
  };

  return { speaking, mood, toggle, available: canSpeak() };
}
