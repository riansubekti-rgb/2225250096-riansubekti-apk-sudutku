import { useEffect, useMemo } from 'react';
import raw from '../../../content/mascot/busu.json';
import { BusuContentSchema } from '../../data/schemas';
import { WanderingBusu } from './WanderingBusu';
import { useSubtitleSpeech } from './useSubtitleSpeech';
import { chunkOf, chunkWords } from './subtitle';
import { userHasInteracted } from '../../platform/speech';

const content = BusuContentSchema.parse(raw);
const intro = content.intro.map((l) => l.text).join(' ');

/**
 * Perkenalan Busu di halaman Masuk. Busu langsung bicara SENDIRI (satu kali) dengan subtitle berjalan:
 * seketika bila layar sudah pernah disentuh, atau pada sentuhan pertama di mana pun (aturan
 * autoplay browser). Busu punya "rumah" di atas subtitle dan sesekali berjalan-jalan keliling layar.
 */
export function BusuIntro() {
  const s = useSubtitleSpeech(intro);
  const chunks = useMemo(() => chunkWords(s.words, 6), [s.words]);
  const chunk = s.word >= 0 ? chunkOf(chunks, s.word) : undefined;

  useEffect(() => {
    let done = false;
    const start = (e?: Event) => {
      // ketukan langsung pada Busu sudah ditangani tombolnya sendiri
      if (e && (e.target as Element | null)?.closest?.('[data-busu]')) return;
      if (done) return;
      done = true;
      s.play();
    };
    if (userHasInteracted()) {
      const t = window.setTimeout(() => start(), 400);
      return () => window.clearTimeout(t);
    }
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
    // hanya sekali saat halaman dibuka
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <WanderingBusu
        size={104}
        mood={content.intro[0]!.mood}
        talking={s.playing}
        onTap={s.play}
        label={s.playing ? 'Hentikan suara Busu' : 'Ketuk Busu untuk mendengar perkenalannya lagi'}
      />
      <div className="relative w-full rounded-card border-2 border-accent bg-surface px-4 py-3 shadow-sm">
        <span aria-hidden className="absolute -top-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-accent bg-surface" />
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
            <span className="text-ink-muted">👋 Hai! Sentuh layar, Busu mau kenalan!</span>
          )}
        </div>
      </div>
    </div>
  );
}
