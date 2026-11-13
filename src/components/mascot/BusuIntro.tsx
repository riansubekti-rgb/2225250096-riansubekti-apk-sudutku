import { useEffect, useState } from 'react';
import raw from '../../../content/mascot/busu.json';
import { BusuContentSchema } from '../../data/schemas';
import { Busu } from './Busu';
import { useSpeech } from './useSpeech';

const content = BusuContentSchema.parse(raw);
const SEEN_KEY = 'sudutku.introSeen';

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

/** Ketik teks huruf demi huruf; `instant` bila siswa minta gerak dikurangi. */
function useTypewriter(text: string, instant: boolean) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((k) => {
        if (k >= text.length) {
          window.clearInterval(id);
          return k;
        }
        return k + 1;
      });
    }, 28);
    return () => window.clearInterval(id);
  }, [text, instant]);
  return { shown: text.slice(0, n), done: n >= text.length, finish: () => setN(text.length) };
}

/**
 * Perkenalan Busu di halaman Masuk: kalimat diketik seperti sedang berbicara, ekspresi berganti,
 * suara bisa diputar (🔊). Pertama kali ditampilkan penuh; berikutnya cukup sapaan singkat
 * (ketuk Busu untuk memutar ulang perkenalan).
 */
export function BusuIntro() {
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const [lines, setLines] = useState(() => (seenBefore() ? [content.welcomeBack] : content.intro));
  const [i, setI] = useState(0);
  const line = lines[i]!;
  const { shown, done, finish } = useTypewriter(line.text, reduce);
  const { speaking, toggle, available } = useSpeech();
  const last = i >= lines.length - 1;

  useEffect(() => {
    if (last && done) markSeen();
  }, [last, done]);

  const replay = () => {
    setLines(content.intro);
    setI(0);
  };

  return (
    <div className="flex flex-col items-center text-center">
      <button type="button" onClick={replay} aria-label="Putar ulang perkenalan Busu" className="rounded-full">
        <Busu mood={line.mood} size={128} bob={done} talking={!done || speaking} />
      </button>
      <div
        className="relative mt-2 w-full rounded-card border border-line bg-surface px-4 py-3 text-left shadow-sm"
        onClick={() => !done && finish()}
        aria-live="polite"
      >
        <span aria-hidden className="absolute -top-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-line bg-surface" />
        <p className={`min-h-[3em] text-[17px] font-bold leading-snug ${done ? '' : 'type-caret'}`}>{shown}</p>
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
          <span className="flex gap-2">
            {available && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(lines.slice(i).map((l) => l.text).join(' '));
                }}
                aria-label={speaking ? 'Hentikan suara Busu' : 'Dengarkan Busu'}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-bg"
              >
                {speaking ? '⏹' : '🔊'}
              </button>
            )}
            {!last && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!done) finish();
                  else setI(i + 1);
                }}
                className="btn-secondary min-h-[40px] px-4 text-sm"
              >
                {done ? 'Lanjut ▸' : 'Lewati ▸'}
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
