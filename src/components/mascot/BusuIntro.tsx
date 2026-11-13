import { useCallback, useEffect, useRef, useState } from 'react';
import raw from '../../../content/mascot/busu.json';
import { BusuContentSchema } from '../../data/schemas';
import { Busu } from './Busu';
import { useVoice } from './voiceStore';
import { canSpeak, speakSentences, stopAll, userHasInteracted } from '../../platform/speech';

const content = BusuContentSchema.parse(raw);
const SEEN_KEY = 'sudutku.introSeen';
/** kecepatan teks muncul saat Busu bicara (≈ kecepatan suara rate 1.2) */
const CHAR_MS_VOICE = 52;
const CHAR_MS_SILENT = 28;

function seenBefore(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* abaikan */
  }
}

/**
 * Perkenalan Busu di halaman Masuk. Bila suara nyala: Busu bicara otomatis kalimat demi kalimat
 * (setelah sentuhan pertama — aturan autoplay browser), teks muncul mengikuti suara, lalu lanjut
 * sendiri. Bila suara mati/tidak didukung: teks diketik dan siswa menekan "Lanjut".
 */
export function BusuIntro() {
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const voiceOn = useVoice((s) => s.enabled) && canSpeak();
  const [lines, setLines] = useState(() => (seenBefore() ? [content.welcomeBack] : content.intro));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const [talking, setTalking] = useState(false);
  const [needTap, setNeedTap] = useState(false);
  const timers = useRef<number[]>([]);
  const line = lines[i]!;
  const last = i >= lines.length - 1;
  const done = shown >= line.text.length;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearInterval(t));
    timers.current = [];
  };

  /** Ketik baris k; bila `withVoice`, ucapkan sekaligus dan lanjut otomatis ke baris berikutnya. */
  const playLine = useCallback(
    (k: number, withVoice: boolean, all = lines) => {
      clearTimers();
      setI(k);
      setShown(0);
      const text = all[k]!.text;
      if (reduce) setShown(text.length);
      else {
        const id = window.setInterval(() => setShown((n) => (n >= text.length ? n : n + 1)), withVoice ? CHAR_MS_VOICE : CHAR_MS_SILENT);
        timers.current.push(id);
      }
      if (!withVoice) return;
      setTalking(true);
      speakSentences([text], {
        onProgress: (_, f) => setShown((n) => Math.max(n, Math.round(f * text.length))),
        onEnd: (completed) => {
          setTalking(false);
          setShown(text.length);
          if (completed && k < all.length - 1) {
            const t = window.setTimeout(() => playLine(k + 1, true, all), 450);
            timers.current.push(t);
          }
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reduce],
  );

  // Mulai: bicara langsung bila boleh; kalau belum ada sentuhan, tunggu ketukan pertama.
  useEffect(() => {
    const canAuto = voiceOn && userHasInteracted();
    setNeedTap(voiceOn && !canAuto);
    playLine(0, canAuto, lines);
    return () => {
      clearTimers();
      stopAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  // Ketukan pertama di mana saja → Busu mulai bicara dari kalimat yang sedang tampil.
  useEffect(() => {
    if (!needTap) return;
    const start = () => {
      setNeedTap(false);
      playLine(i, true, lines);
    };
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, [needTap, i, lines, playLine]);

  useEffect(() => {
    if (last && done && !talking) markSeen();
  }, [last, done, talking]);

  const replay = () => setLines([...content.intro]);

  return (
    <div className="flex flex-col items-center text-center">
      <button type="button" onClick={replay} aria-label="Putar ulang perkenalan Busu" className="rounded-full">
        <Busu mood={line.mood} size={128} bob={done && !talking} talking={talking || (!done && !reduce)} />
      </button>
      {needTap && (
        <p className="mt-1 animate-pulse rounded-full bg-accent px-3 py-1 text-sm font-bold text-on-accent">👆 Ketuk layar untuk mendengar Busu</p>
      )}
      <div className="relative mt-2 w-full rounded-card border border-line bg-surface px-4 py-3 text-left shadow-sm" aria-live="polite">
        <span aria-hidden className="absolute -top-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-line bg-surface" />
        <p className={`min-h-[3em] text-[17px] font-bold leading-snug ${done ? '' : 'type-caret'}`}>{line.text.slice(0, shown)}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          {lines.length > 1 ? (
            <span className="flex gap-1" aria-hidden>
              {lines.map((_, k) => (
                <span key={k} className={`h-2 w-2 rounded-full ${k <= i ? 'bg-accent' : 'bg-line'}`} />
              ))}
            </span>
          ) : (
            <span />
          )}
          {!last && !talking && done && (
            <button type="button" onClick={() => playLine(i + 1, voiceOn && userHasInteracted())} className="btn-secondary min-h-[40px] px-4 text-sm">
              Lanjut ▸
            </button>
          )}
          {!done && !talking && (
            <button type="button" onClick={() => setShown(line.text.length)} className="btn-secondary min-h-[40px] px-4 text-sm">
              Lewati ▸
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
