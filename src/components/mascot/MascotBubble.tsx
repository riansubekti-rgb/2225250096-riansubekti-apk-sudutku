import { useEffect, useRef, type ReactNode } from 'react';
import { Busu, type BusuMood } from './Busu';
import { useSpeech } from './useSpeech';

/**
 * Busu + balon kata pendek (≤ 2 kalimat). `live` untuk umpan balik agar dibacakan pembaca layar.
 * Tombol 🔊 membacakan isi balon (bila `say` diisi atau isi balon berupa teks biasa).
 */
export function MascotBubble({
  mood = 'happy',
  size = 56,
  live = false,
  say,
  children,
}: {
  mood?: BusuMood;
  size?: number;
  live?: boolean;
  /** teks yang dibacakan; default = isi balon bila berupa string */
  say?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { speaking, toggle, available } = useSpeech();
  const text = say ?? (typeof children === 'string' ? children : undefined);

  // Umpan balik bisa muncul di bawah lipatan layar HP 360×640 → gulirkan agar terlihat.
  useEffect(() => {
    if (live) ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [live, children]);

  return (
    <div ref={ref} className="flex scroll-mb-24 items-end gap-2">
      <div className="shrink-0">
        <Busu mood={mood} size={size} talking={speaking} />
      </div>
      <div
        role={live ? 'status' : undefined}
        aria-live={live ? 'polite' : undefined}
        className="relative mb-2 flex-1 rounded-card border border-line bg-surface px-3 py-2 text-[15px] leading-snug shadow-sm"
      >
        <span
          aria-hidden
          className="absolute -left-[7px] bottom-3 h-3 w-3 rotate-45 border-b border-l border-line bg-surface"
        />
        {children}
        {text && available && (
          <button
            type="button"
            onClick={() => toggle(text)}
            aria-label={speaking ? 'Hentikan suara Busu' : 'Dengarkan Busu'}
            className="float-right -mb-1 -mr-1 ml-2 mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg text-base"
          >
            {speaking ? '⏹' : '🔊'}
          </button>
        )}
      </div>
    </div>
  );
}
