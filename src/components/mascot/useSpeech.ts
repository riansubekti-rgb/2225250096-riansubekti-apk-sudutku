import { useEffect, useRef, useState } from 'react';
import { canSpeak, speak } from '../../platform/speech';
import { logEvent } from '../../data/log';

/** Status bicara Busu untuk satu balon kata. Menghentikan suara saat komponen dilepas. */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);

  const toggle = (text: string) => {
    if (speaking) {
      stop.current?.();
      return;
    }
    setSpeaking(true);
    void logEvent('busu_speak', { length: text.length });
    stop.current = speak(text, () => {
      setSpeaking(false);
      stop.current = null;
    });
  };

  return { speaking, toggle, available: canSpeak() };
}
