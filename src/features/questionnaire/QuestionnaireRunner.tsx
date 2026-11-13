import { useState } from 'react';
import type { Questionnaire } from '../../data/schemas';
import { saveQuestionnaireAnswer } from '../../data/research';

/**
 * Kuesioner skala (IL/EL/GL, SUS, respons siswa): satu butir per layar, tombol besar,
 * tanpa warna hubungan sudut & tanpa maskot (desain.md §9.1–9.2).
 */
export function QuestionnaireRunner({
  q,
  meeting,
  onDone,
}: {
  q: Questionnaire;
  meeting: number;
  onDone: () => void;
}) {
  const steps = [...q.items.map((it) => ({ kind: 'scale' as const, ...it })), ...(q.open ?? []).map((o) => ({ kind: 'open' as const, subscale: 'open', ...o }))];
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, number>>({});
  const [text, setText] = useState('');
  const step = steps[index]!;
  const nums = Array.from({ length: q.scale.max - q.scale.min + 1 }, (_, i) => q.scale.min + i);
  // Kelas ditulis lengkap agar terdeteksi Tailwind.
  const cols = nums.length > 6 ? 'grid-cols-6' : nums.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  const next = async () => {
    if (step.kind === 'scale') {
      await saveQuestionnaireAnswer({
        instrumentId: q.id,
        instrumentVersion: q.version,
        meeting,
        itemId: step.id,
        subscale: step.subscale,
        value: values[step.id]!,
      });
    } else {
      await saveQuestionnaireAnswer({
        instrumentId: q.id,
        instrumentVersion: q.version,
        meeting,
        itemId: step.id,
        subscale: 'open',
        value: null,
        text: text.trim().slice(0, 500),
      });
    }
    if (index + 1 >= steps.length) onDone();
    else setIndex(index + 1);
  };

  const canNext = step.kind === 'open' || values[step.id] !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-line px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-muted">{q.title}</span>
        <span className="text-sm font-bold text-ink-muted">
          {index + 1}/{steps.length}
        </span>
      </div>
      {index === 0 && <p className="text-sm text-ink-muted">{q.intro}</p>}
      <p className="text-xl font-bold leading-snug">{step.text}</p>

      {step.kind === 'scale' ? (
        <>
          <div role="radiogroup" aria-label={step.text} className={`grid ${cols} gap-2`}>
            {nums.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={values[step.id] === n}
                aria-label={`${n}${n === q.scale.min ? `, ${q.scale.minLabel}` : n === q.scale.max ? `, ${q.scale.maxLabel}` : ''}`}
                onClick={() => setValues((v) => ({ ...v, [step.id]: n }))}
                className={`flex min-h-[52px] items-center justify-center rounded-card border-2 text-lg font-bold ${
                  values[step.id] === n ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-4 text-sm text-ink-muted">
            <span>
              {q.scale.min} = {q.scale.minLabel}
            </span>
            <span className="text-right">
              {q.scale.max} = {q.scale.maxLabel}
            </span>
          </div>
        </>
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={500}
          className="rounded-card border-2 border-line bg-surface p-3"
          aria-label={step.text}
        />
      )}

      <div className="flex gap-3">
        <button type="button" className="btn-secondary flex-1" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Kembali
        </button>
        <button type="button" className="btn-primary flex-[2]" disabled={!canNext} onClick={() => void next()}>
          {index + 1 >= steps.length ? 'Kirim' : 'Berikutnya →'}
        </button>
      </div>
    </div>
  );
}
