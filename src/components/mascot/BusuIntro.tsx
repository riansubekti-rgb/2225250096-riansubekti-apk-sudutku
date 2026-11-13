import raw from '../../../content/mascot/busu.json';
import { BusuContentSchema } from '../../data/schemas';
import { Busu } from './Busu';
import { useSpeech } from './useSpeech';

const content = BusuContentSchema.parse(raw);
const intro = content.intro.map((l) => l.text).join(' ');

/**
 * Perkenalan Busu di halaman Masuk: satu kalimat utuh yang tampil di balon kata.
 * Busu baru berbicara saat diketuk (sekali jalan, tanpa dipecah); ketuk lagi untuk berhenti.
 */
export function BusuIntro() {
  const voice = useSpeech({ baseMood: content.intro[0]!.mood });

  return (
    <div className="flex flex-col items-center text-center">
      <button
        type="button"
        onClick={() => voice.toggle(intro, { whole: true })}
        aria-label={voice.speaking ? 'Hentikan suara Busu' : 'Ketuk Busu untuk mendengar perkenalannya'}
        className="rounded-full transition-transform active:scale-95"
      >
        <Busu mood={voice.speaking ? 'cheer' : 'happy'} size={128} talking={voice.speaking} />
      </button>
      {voice.available && (
        <p className="mt-1 text-sm font-bold text-accent">
          {voice.speaking ? '🔊 Busu sedang bicara… (ketuk untuk berhenti)' : '👆 Ketuk Busu untuk mendengarnya'}
        </p>
      )}
      <div className="relative mt-2 w-full rounded-card border border-line bg-surface px-4 py-3 text-left shadow-sm">
        <span aria-hidden className="absolute -top-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-line bg-surface" />
        <p className="text-[17px] font-bold leading-snug">{intro}</p>
      </div>
    </div>
  );
}
