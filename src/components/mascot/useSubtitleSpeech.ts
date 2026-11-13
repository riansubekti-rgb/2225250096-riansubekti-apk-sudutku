import { useEffect, useMemo, useRef, useState } from 'react';
import { canSpeak, speakSentences, VOICE } from '../../platform/speech';
import { useVoice } from './voiceStore';
import { wordAtFraction, wordDuration, wordStarts } from './subtitle';
import { logEvent } from '../../data/log';

/**
 * Busu mengucapkan satu teks utuh sambil menampilkan subtitle berjalan.
 * Posisi kata diambil dari mesin suara bila ada; bila tidak, diperkirakan dengan pewaktu.
 * Bila suara mati/tidak tersedia, subtitle tetap berjalan tanpa suara.
 */
export function useSubtitleSpeech(text: string) {
  const enabled = useVoice((s) => s.enabled);
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const starts = useMemo(() => wordStarts(words), [words]);
  const [word, setWord] = useState(-1); // -1 = diam
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | null>(null);
  const cancel = useRef<(() => void) | null>(null);
  const voiceActive = useRef(false);

  const clearTimer = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const finish = () => {
    clearTimer();
    voiceActive.current = false;
    setWord(words.length - 1);
    timer.current = window.setTimeout(() => {
      setPlaying(false);
      setWord(-1);
    }, 1400);
  };

  const runTimer = (from: number) => {
    clearTimer();
    let i = from;
    const tick = () => {
      i++;
      if (i >= words.length) {
        if (!voiceActive.current) finish();
        return; // dengan suara: tunggu suara selesai
      }
      setWord((p) => Math.max(p, i));
      timer.current = window.setTimeout(tick, wordDuration(words[i]!, VOICE.rate));
    };
    timer.current = window.setTimeout(tick, wordDuration(words[from]!, VOICE.rate));
  };

  const stop = () => {
    cancel.current?.();
    cancel.current = null;
    clearTimer();
    voiceActive.current = false;
    setPlaying(false);
    setWord(-1);
  };

  const play = () => {
    if (playing) return stop();
    void logEvent('busu_speak', { length: text.length, subtitle: true });
    setPlaying(true);
    setWord(0);
    if (enabled && canSpeak()) {
      voiceActive.current = true;
      cancel.current = speakSentences([text], {
        onSentence: () => runTimer(0),
        onProgress: (_, f) => setWord((p) => Math.max(p, wordAtFraction(starts, text.length, f))),
        onEnd: (completed) => {
          cancel.current = null;
          if (completed) finish();
        },
      });
    } else {
      runTimer(0);
    }
  };

  useEffect(
    () => () => {
      cancel.current?.();
      clearTimer();
    },
    [],
  );

  return { words, word, playing, play };
}
