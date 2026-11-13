import { useEffect, useRef, type ReactNode } from 'react';
import { Busu, type BusuMood } from './Busu';

/** Busu + balon kata pendek (≤ 2 kalimat). `live` untuk umpan balik agar dibacakan pembaca layar. */
export function MascotBubble({
  mood = 'happy',
  size = 56,
  live = false,
  children,
}: {
  mood?: BusuMood;
  size?: number;
  live?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Umpan balik bisa muncul di bawah lipatan layar HP 360×640 → gulirkan agar terlihat.
  useEffect(() => {
    if (live) ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [live, children]);
  return (
    <div ref={ref} className="flex scroll-mb-24 items-end gap-2">
      <div className="shrink-0">
        <Busu mood={mood} size={size} />
      </div>
      <div
        role={live ? 'status' : undefined}
        aria-live={live ? 'polite' : undefined}
        className="relative mb-2 rounded-card border border-line bg-surface px-3 py-2 text-[15px] leading-snug shadow-sm"
      >
        <span
          aria-hidden
          className="absolute -left-[7px] bottom-3 h-3 w-3 rotate-45 border-b border-l border-line bg-surface"
        />
        {children}
      </div>
    </div>
  );
}
