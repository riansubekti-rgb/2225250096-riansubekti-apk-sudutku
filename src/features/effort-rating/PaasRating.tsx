import { useRef, useState } from 'react';
import { paas } from './paas';

/**
 * Skala usaha mental Paas 9 poin (prd.md F9, desain.md §4.8): satu pertanyaan, tombol besar,
 * tanpa emoji wajah dan tanpa maskot (instrumen penelitian, desain.md §9.2).
 */
export function PaasRating({ onSubmit }: { onSubmit: (value: number, durationMs: number) => void }) {
  const [value, setValue] = useState<number | null>(null);
  const shownAt = useRef(Date.now());
  const nums = Array.from({ length: paas.max - paas.min + 1 }, (_, i) => paas.min + i);

  return (
    <div className="flex flex-col gap-4 pt-2">
      <p className="rounded-full bg-line/60 px-3 py-1 text-center text-xs font-bold uppercase tracking-wide text-ink-muted">
        Pertanyaan singkat
      </p>
      <p className="text-xl font-bold">{paas.question}</p>
      <div role="radiogroup" aria-label={paas.question} className="grid grid-cols-9 gap-1">
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n}${n === paas.min ? `, ${paas.minLabel}` : n === paas.max ? `, ${paas.maxLabel}` : ''}`}
            onClick={() => setValue(n)}
            className={`flex min-h-[52px] items-center justify-center rounded-card border-2 text-lg font-bold ${
              value === n ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-ink-muted">
        <span>← {paas.minLabel}</span>
        <span>{paas.maxLabel} →</span>
      </div>
      <button
        type="button"
        className="btn-primary"
        disabled={value === null}
        onClick={() => value !== null && onSubmit(value, Date.now() - shownAt.current)}
      >
        Kirim
      </button>
    </div>
  );
}
