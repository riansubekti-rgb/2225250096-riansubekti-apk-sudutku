import { isValidElement, useEffect, useRef, type ReactNode } from 'react';
import { Busu, type BusuMood } from './Busu';
import { useSpeech } from './useSpeech';

/** Ambil teks biasa dari isi balon (termasuk <b>…</b>, angka, dan gabungan) untuk dibacakan. */
function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeToText(node.props.children);
  return '';
}

/**
 * Busu + balon kata pendek (≤ 2 kalimat). Ketuk Busu (atau 🔊) agar Busu membacakannya;
 * ekspresinya berganti mengikuti kalimat yang sedang diucapkan.
 */
export function MascotBubble({
  mood = 'happy',
  size = 56,
  live = false,
  say,
  autoSpeak = false,
  children,
}: {
  mood?: BusuMood;
  size?: number;
  live?: boolean;
  /** teks yang dibacakan; default = isi balon bila berupa string */
  say?: string;
  autoSpeak?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const text = say ?? (nodeToText(children).trim() || undefined);
  const voice = useSpeech({ text, auto: autoSpeak, baseMood: mood });

  // Umpan balik bisa muncul di bawah lipatan layar HP 360×640 → gulirkan agar terlihat.
  useEffect(() => {
    if (live) ref.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [live, children]);

  return (
    <div ref={ref} className="flex scroll-mb-24 items-end gap-2">
      <button
        type="button"
        className="shrink-0 rounded-full transition-transform active:scale-90"
        onClick={() => text && voice.toggle(text)}
        aria-label={voice.speaking ? 'Hentikan suara Busu' : 'Ketuk Busu untuk mendengarnya'}
        tabIndex={text && voice.available ? 0 : -1}
      >
        <Busu mood={voice.mood ?? mood} size={size} talking={voice.speaking} />
      </button>
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
        {text && voice.available && (
          <button
            type="button"
            onClick={() => voice.toggle(text)}
            aria-label={voice.speaking ? 'Hentikan suara Busu' : 'Dengarkan Busu'}
            className="float-right -mb-1 -mr-1 ml-2 mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-bg text-base"
          >
            {voice.speaking ? '⏹' : '🔊'}
          </button>
        )}
      </div>
    </div>
  );
}
