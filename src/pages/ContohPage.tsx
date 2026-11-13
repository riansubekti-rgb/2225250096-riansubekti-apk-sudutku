import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import raw from '../../content/worked-examples/worked.json';
import { WorkedSchema } from '../data/schemas';
import { AngleFigure } from '../figure2d/AngleFigure';
import { KahpSteps } from '../components/KahpSteps';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { Busu } from '../components/mascot/Busu';
import { KahpSolver } from '../features/practice/KahpSolver';
import { figureFor, makePair, solvePair, type PairProblem } from '../domain/problems/pair';
import type { SolveStepKind } from '../domain/algebra/linear';
import type { KahpPhase } from '../app/strings';
import { logEvent } from '../data/log';

const data = WorkedSchema.parse(raw);

const PHASE_OF: Record<SolveStepKind | 'identify', KahpPhase> = {
  identify: 'identify',
  rule: 'rule',
  combine: 'compute',
  move: 'compute',
  divide: 'compute',
  substitute: 'compute',
  check: 'check',
};

/**
 * Contoh Bertahap (F5): contoh lengkap dibuka satu langkah per ketukan (P1, P8),
 * lalu soal kembar dikerjakan siswa sebagai soal melengkapi (P5 fading).
 */
export function ContohPage() {
  const [params, setParams] = useSearchParams();
  const idx = Math.min(Math.max(Number(params.get('contoh') ?? 0) || 0, 0), data.examples.length);
  const stage = params.get('tahap') === 'coba' ? 'coba' : 'lihat';
  const ex = data.examples[idx];

  const go = (i: number, t: 'lihat' | 'coba') => setParams({ contoh: String(i), tahap: t });

  if (!ex) return <DoneView />;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${((idx * 2 + (stage === 'coba' ? 1 : 0) + 1) / (data.examples.length * 2)) * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold text-ink-muted">
          {idx + 1}/{data.examples.length}
        </span>
      </div>
      <h2 className="text-xl font-bold">
        {stage === 'lihat' ? 'Contoh' : 'Giliranmu'}: {ex.title}
      </h2>

      {stage === 'lihat' ? (
        <WorkedView key={ex.id} problem={makePair(ex.id, ex.relation, ex.e1, ex.e2)} onFinish={() => go(idx, 'coba')} />
      ) : (
        <TwinView
          key={`${ex.id}-twin`}
          problem={makePair(`${ex.id}-twin`, ex.relation, ex.twin.e1, ex.twin.e2)}
          onNext={() => go(idx + 1, 'lihat')}
        />
      )}
    </div>
  );
}

function WorkedView({ problem, onFinish }: { problem: PairProblem; onFinish: () => void }) {
  const sol = useMemo(() => solvePair(problem), [problem]);
  const steps = useMemo(
    () => [
      { kind: 'identify' as const, text: data.identify[problem.relation], note: 'Kenali hubungannya dari gambar' },
      ...sol.steps,
    ],
    [problem, sol],
  );
  const [shown, setShown] = useState(1);
  const current = steps[shown - 1]!;
  const lastCompute = steps.map((s) => PHASE_OF[s.kind]).lastIndexOf('compute');
  const showValues = shown - 1 >= lastCompute;
  const all = shown >= steps.length;

  return (
    <>
      <div className="card p-2">
        <AngleFigure spec={figureFor(problem, showValues)} />
      </div>
      <KahpSteps current={all ? 'done' : PHASE_OF[current.kind]} />
      <ol className="flex flex-col gap-2" aria-live="polite">
        {steps.slice(0, shown).map((s, i) => {
          const active = i === shown - 1;
          return (
            <li
              key={i}
              className={`rounded-card border px-3 py-2 ${active ? 'border-accent bg-surface shadow-sm' : 'border-transparent text-ink-muted'}`}
            >
              <p className={`tabular-nums ${active ? 'text-lg font-bold text-ink' : 'text-sm'}`}>{s.text}</p>
              {active && <p className="text-sm text-ink-muted">↳ {s.note}</p>}
            </li>
          );
        })}
      </ol>
      {all ? (
        <>
          <MascotBubble mood="cheer">Sekarang giliranmu mencoba soal yang mirip!</MascotBubble>
          <button type="button" className="btn-primary" onClick={onFinish}>
            Aku coba sendiri →
          </button>
        </>
      ) : (
        <button type="button" className="btn-primary" onClick={() => setShown((n) => n + 1)}>
          Tunjukkan langkah berikutnya
        </button>
      )}
    </>
  );
}

function TwinView({ problem, onNext }: { problem: PairProblem; onNext: () => void }) {
  const [finished, setFinished] = useState<null | { hintsUsed: number; mistakes: number }>(null);
  return (
    <>
      <KahpSolver
        problem={problem}
        mode="completion"
        given={['identify']}
        onDone={(s) => {
          setFinished(s);
          void logEvent('twin_complete', { problemId: problem.id, ...s });
        }}
      />
      {finished && (
        <>
          <MascotBubble mood="cheer" live>
            {finished.mistakes === 0 ? 'Hebat, semua langkah benar!' : 'Bagus, kamu berhasil menyelesaikannya!'}
          </MascotBubble>
          <button type="button" className="btn-primary" onClick={onNext}>
            Contoh berikutnya →
          </button>
        </>
      )}
    </>
  );
}

function DoneView() {
  return (
    <div className="flex flex-col items-center gap-3 pt-4 text-center">
      <Busu mood="cheer" size={130} />
      <p className="text-2xl font-bold">Semua contoh selesai!</p>
      <p className="text-ink-muted">Kamu sudah berlatih Kenali, Aturan, Hitung, dan Periksa.</p>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        <Link to="/" className="btn-primary">
          Kembali ke Peta Belajar
        </Link>
        <Link to="/contoh?contoh=0&tahap=lihat" className="btn-secondary">
          Ulangi contoh
        </Link>
      </div>
    </div>
  );
}
