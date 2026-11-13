import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import raw from '../../content/warmup/warmup.json';
import { WarmupSchema } from '../data/schemas';
import { BasicAngle } from '../figure2d/BasicAngle';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { Busu } from '../components/mascot/Busu';
import { NumPad } from '../components/NumPad';
import { logEvent, recordAttempt } from '../data/log';

const data = WarmupSchema.parse(raw);

/** Pemanasan (F2): kartu istilah dasar lalu cek prasyarat; jawaban salah → kartu remedial singkat. */
export function PemanasanPage() {
  const [params, setParams] = useSearchParams();
  const total = data.cards.length + data.checks.length + 1;
  const step = Math.min(Math.max(Number(params.get('langkah') ?? 0) || 0, 0), total - 1);
  const go = (n: number) => setParams({ langkah: String(n) });
  const [results, setResults] = useState<Record<string, boolean>>({});

  const card = data.cards[step];
  const check = data.checks[step - data.cards.length];
  const canNext = !check || results[check.id] !== undefined;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
      <div className="flex-1" key={step}>
        {card && (
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-bold">{card.title}</h2>
            <div className="card p-2">
              <BasicAngle spec={card.figure} />
            </div>
            <MascotBubble>{card.text}</MascotBubble>
          </div>
        )}
        {check && (
          <CheckView
            check={check}
            number={step - data.cards.length + 1}
            result={results[check.id]}
            onResult={(ok) => setResults((r) => ({ ...r, [check.id]: ok }))}
          />
        )}
        {!card && !check && <Done correct={Object.values(results).filter(Boolean).length} />}
      </div>
      {(card || check) && (
        <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-bg px-4 py-3">
          <button type="button" className="btn-secondary flex-1" disabled={step === 0} onClick={() => go(step - 1)}>
            Kembali
          </button>
          <button type="button" className="btn-primary flex-[2]" disabled={!canNext} onClick={() => go(step + 1)}>
            Lanjut →
          </button>
        </div>
      )}
    </div>
  );
}

type Check = (typeof data.checks)[number];

function CheckView({ check, number, result, onResult }: { check: Check; number: number; result?: boolean; onResult: (ok: boolean) => void }) {
  const [shownAt] = useState(Date.now());
  const remedial = check.remedial ? data.cards.find((c) => c.id === check.remedial) : undefined;

  const submit = (response: string, ok: boolean) => {
    if (result !== undefined) return;
    onResult(ok);
    void recordAttempt({
      problemId: check.id,
      kcs: ['KC_PREREQ'],
      mode: 'independent',
      step: 'prereq',
      response,
      correct: ok,
      hintLevel: 0,
      durationMs: Date.now() - shownAt,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">Cek cepat {number} dari {data.checks.length}</p>
      <p className="text-xl font-bold">{check.question}</p>
      {check.type === 'choice' ? (
        <div className="flex flex-col gap-2">
          {check.options.map((o, i) => (
            <button
              key={o}
              type="button"
              className="btn-secondary justify-start"
              disabled={result !== undefined && i !== check.answer}
              onClick={() => submit(o, i === check.answer)}
            >
              {o} {result !== undefined && i === check.answer && <span className="ml-auto">✓</span>}
            </button>
          ))}
        </div>
      ) : (
        result === undefined && <NumPad label="=" onSubmit={(v) => submit(String(v), v === check.answer)} />
      )}
      {result !== undefined && (
        <MascotBubble mood={result ? 'cheer' : 'oops'} live>
          {result ? 'Yeay, benar!' : `Ups, belum tepat. Jawabannya ${check.type === 'choice' ? check.options[check.answer] : check.answer}.`}{' '}
          {!result && check.type === 'number' && check.hint}
        </MascotBubble>
      )}
      {result === false && remedial && (
        <div className="card p-2">
          <p className="px-2 pt-1 font-bold">Ingat lagi: {remedial.title}</p>
          <BasicAngle spec={remedial.figure} />
          <p className="px-2 pb-1 text-sm">{remedial.text}</p>
        </div>
      )}
    </div>
  );
}

function Done({ correct }: { correct: number }) {
  useEffect(() => {
    void logEvent('section_complete', { section: 'pemanasan', score: correct, of: data.checks.length });
  }, [correct]);
  return (
    <div className="flex flex-col items-center gap-3 pt-4 text-center">
      <Busu mood="cheer" size={130} bob />
      <p className="text-2xl font-bold">Pemanasan selesai!</p>
      <p className="text-ink-muted">Kamu siap mengenal hubungan antar sudut.</p>
      <Link to="/kenali" className="btn-primary mt-2 w-full max-w-sm">
        Lanjut ke Kenali Hubungan →
      </Link>
    </div>
  );
}
