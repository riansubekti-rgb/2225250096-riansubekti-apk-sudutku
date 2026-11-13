import { useMemo } from 'react';
import raw from '../../../content/mascot/busu.json';
import { BusuContentSchema } from '../../data/schemas';
import { RoamingBusu } from './RoamingBusu';
import { useSubtitleSpeech } from './useSubtitleSpeech';
import { chunkOf, chunkWords } from './subtitle';

const content = BusuContentSchema.parse(raw);
const intro = content.intro.map((l) => l.text).join(' ');

/**
 * Perkenalan Busu di halaman Masuk: Busu mondar-mandir di sisi layar; saat diketuk ia berhenti
 * dan mengucapkan perkenalan (satu kali bicara) dengan **subtitle berjalan** — potongan pendek,
 * kata yang sedang diucapkan disorot. Teks lengkap tetap tersedia untuk pembaca layar.
 */
export function BusuIntro() {
  const s = useSubtitleSpeech(intro);
  const chunks = useMemo(() => chunkWords(s.words, 6), [s.words]);
  const chunk = s.word >= 0 ? chunkOf(chunks, s.word) : undefined;

  return (
    <>
      <RoamingBusu
        talking={s.playing}
        mood={content.intro[0]!.mood}
        onTap={s.play}
        label={s.playing ? 'Hentikan suara Busu' : 'Ketuk Busu untuk mendengar perkenalannya'}
      />
      <div className="relative w-full rounded-card border-2 border-accent bg-surface px-4 py-3 shadow-sm">
        <p className="sr-only">{intro}</p>
        <div aria-hidden className="flex min-h-[4.6em] items-center justify-center text-center text-[19px] font-bold leading-snug">
          {chunk ? (
            <span key={chunk.start} className="subtitle-in">
              {s.words.slice(chunk.start, chunk.end + 1).map((w, k) => {
                const i = chunk.start + k;
                const state = i < s.word ? 'said' : i === s.word ? 'now' : 'next';
                return (
                  <span
                    key={i}
                    className={`inline-block transition-colors duration-150 ${
                      state === 'now' ? 'scale-110 text-accent' : state === 'said' ? 'text-ink' : 'text-ink-muted opacity-40'
                    }`}
                  >
                    {w}&nbsp;
                  </span>
                );
              })}
            </span>
          ) : (
            <span className="text-ink-muted">
              👋 Hai! Ketuk <b className="text-accent">Busu</b> di samping untuk berkenalan!
            </span>
          )}
        </div>
      </div>
    </>
  );
}
