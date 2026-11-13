import { KAHP_LABEL, KAHP_ORDER, type KahpPhase } from '../app/strings';

/** Indikator langkah Kenali → Aturan → Hitung → Periksa (GL03). */
export function KahpSteps({ current }: { current: KahpPhase | 'done' }) {
  const idx = current === 'done' ? KAHP_ORDER.length : KAHP_ORDER.indexOf(current);
  return (
    <ol className="grid grid-cols-4 gap-1" aria-label="Langkah pengerjaan">
      {KAHP_ORDER.map((p, i) => {
        const state = i < idx ? 'done' : i === idx ? 'now' : 'next';
        return (
          <li
            key={p}
            aria-current={state === 'now' ? 'step' : undefined}
            className={`flex items-center justify-center gap-1 rounded-full border-2 py-1 text-xs font-bold ${
              state === 'now'
                ? 'border-accent bg-accent text-on-accent'
                : state === 'done'
                  ? 'border-accent text-accent'
                  : 'border-line text-ink-muted'
            }`}
          >
            <span aria-hidden>{state === 'done' ? '✓' : i + 1}</span>
            {KAHP_LABEL[p]}
          </li>
        );
      })}
    </ol>
  );
}
