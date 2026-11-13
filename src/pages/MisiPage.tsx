import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import raw from '../../content/literacy/missions.json';
import { MissionsSchema, type Mission } from '../data/schemas';
import { AngleFigure } from '../figure2d/AngleFigure';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { Busu } from '../components/mascot/Busu';
import { KahpSolver } from '../features/practice/KahpSolver';
import { figureFor, labelOf, makePair, solvePair } from '../domain/problems/pair';
import { RELATIONS, RELATION_LABEL, RELATION_SYMBOL, type Relation } from '../domain/geometry/relation';
import { relationMisconception } from '../domain/checker/misconception';
import { hasWebGL } from '../platform/webgl';
import { logEvent, recordAttempt } from '../data/log';
import type { Scene3DHandle } from '../three/Scene3D';

const Scene3D = lazy(() => import('../three/Scene3D'));
const data = MissionsSchema.parse(raw);
const WEBGL = typeof document !== 'undefined' && hasWebGL();

type Phase = 'formulate' | 'employ' | 'interpret' | 'done';
const PHASE_LABEL: Record<Exclude<Phase, 'done'>, string> = {
  formulate: '1 Rumuskan',
  employ: '2 Terapkan',
  interpret: '3 Tafsirkan',
};

/** Misi Dunia Nyata (F7): literasi matematis PISA — rumuskan → terapkan → tafsirkan, dengan ilustrasi 3D. */
export function MisiPage() {
  const [params, setParams] = useSearchParams();
  const idx = Math.min(Math.max(Number(params.get('misi') ?? 0) || 0, 0), data.missions.length);
  const m = data.missions[idx];
  if (!m) return <AllDone />;
  return <MissionView key={m.id} m={m} no={idx + 1} onNext={() => setParams({ misi: String(idx + 1) })} />;
}

function MissionView({ m, no, onNext }: { m: Mission; no: number; onNext: () => void }) {
  const pair = useMemo(() => makePair(m.id, m.relation, m.e1, m.e2), [m]);
  const sol = useMemo(() => solvePair(pair), [pair]);
  const [phase, setPhase] = useState<Phase>('formulate');
  const [use3d, setUse3d] = useState(WEBGL);
  const [planar, setPlanar] = useState(false);
  const [choice, setChoice] = useState<Relation | null>(null);
  const [tries, setTries] = useState(0);
  const [interp, setInterp] = useState<number | null>(null);
  const scene = useRef<Scene3DHandle>(null);
  const shownAt = useRef(Date.now());

  const lbl = (e: typeof pair.e1) => (e.a === 1 && e.b === 0 ? '?' : labelOf(e));
  const labels: [string, string] = [lbl(pair.e1), lbl(pair.e2)];
  const solvedFormulate = choice === m.relation || tries >= 2;

  const pickRelation = (rel: Relation) => {
    if (solvedFormulate) return;
    const ok = rel === m.relation;
    setChoice(rel);
    setTries((t) => t + 1);
    void recordAttempt({
      problemId: m.id,
      relation: m.relation,
      kcs: ['KC_FORMULATE'],
      mode: 'independent',
      step: 'formulate',
      response: rel,
      correct: ok,
      misconception: ok ? undefined : relationMisconception(m.relation, rel),
      hintLevel: 0,
      durationMs: Date.now() - shownAt.current,
    });
  };

  const showPlanar = async () => {
    await scene.current?.toPlanar();
    setPlanar(true);
    void logEvent('scene3d_to2d', { missionId: m.id });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold leading-tight">
          Misi {no}: {m.title}
        </h2>
      </div>
      <ol className="grid grid-cols-3 gap-1 text-center text-xs font-bold" aria-label="Tahap misi">
        {(Object.keys(PHASE_LABEL) as Exclude<Phase, 'done'>[]).map((p) => (
          <li
            key={p}
            aria-current={p === phase ? 'step' : undefined}
            className={`rounded-full border-2 py-1 ${p === phase ? 'border-accent bg-accent text-on-accent' : 'border-line text-ink-muted'}`}
          >
            {PHASE_LABEL[p]}
          </li>
        ))}
      </ol>
      <p className="leading-snug">{m.context}</p>

      {phase === 'formulate' && (
        <>
          <div className="card p-2">
            {use3d ? (
              <Suspense fallback={<div className="flex h-[280px] items-center justify-center text-ink-muted">Memuat 3D…</div>}>
                <Scene3D
                  ref={scene}
                  sceneId={m.sceneId}
                  a={sol.angle1}
                  labels={labels}
                  relation={m.relation}
                  onFail={() => setUse3d(false)}
                  ariaLabel={`Ilustrasi 3D: ${m.title}. Geser untuk memutar.`}
                />
              </Suspense>
            ) : (
              <AngleFigure spec={figureFor(pair, false)} />
            )}
            {use3d && (
              <div className="flex gap-2 pt-2">
                <button type="button" className="btn-secondary flex-1 text-sm" onClick={() => void scene.current?.resetView()}>
                  ↺ Atur ulang
                </button>
                <button type="button" className="btn-secondary flex-1 text-sm" onClick={() => void showPlanar()}>
                  ⬚ Lihat sebagai 2D
                </button>
              </div>
            )}
          </div>
          {use3d && planar && (
            <div className="card p-2">
              <p className="px-2 pt-1 text-sm font-bold text-ink-muted">Model matematikanya:</p>
              <AngleFigure spec={figureFor(pair, false)} neutral={!solvedFormulate} />
            </div>
          )}
          {use3d && !planar && <p className="text-sm text-ink-muted">Geser gambar untuk memutarnya. Cubit untuk memperbesar.</p>}
          <p className="text-lg font-bold">Sudut-sudut yang ditandai membentuk hubungan apa?</p>
          <div className="flex flex-col gap-2">
            {RELATIONS.map((rel) => (
              <button
                key={rel}
                type="button"
                className="btn-secondary justify-start"
                disabled={solvedFormulate && rel !== m.relation}
                aria-pressed={choice === rel}
                onClick={() => pickRelation(rel)}
              >
                <span aria-hidden className="w-12 shrink-0 text-sm">
                  {RELATION_SYMBOL[rel]}
                </span>
                {RELATION_LABEL[rel]}
                {solvedFormulate && rel === m.relation && <span className="ml-auto">✓</span>}
              </button>
            ))}
          </div>
          {choice && (
            <MascotBubble mood={choice === m.relation ? 'cheer' : solvedFormulate ? 'think' : 'oops'} live>
              {choice === m.relation
                ? `Tepat! Ini sudut ${RELATION_LABEL[m.relation].toLowerCase()}.`
                : solvedFormulate
                  ? `Jawabannya: ${RELATION_LABEL[m.relation].toLowerCase()}. Coba lihat gambarnya sebagai 2D.`
                  : 'Belum tepat. Coba putar gambarnya atau lihat sebagai 2D.'}
            </MascotBubble>
          )}
          {solvedFormulate && (
            <button type="button" className="btn-primary" onClick={() => setPhase('employ')}>
              Lanjut: hitung →
            </button>
          )}
        </>
      )}

      {phase === 'employ' && (
        <>
          <p className="font-bold">{m.ask}</p>
          <KahpSolver
            problem={pair}
            mode="independent"
            given={['identify']}
            onDone={() => setPhase('interpret')}
          />
        </>
      )}

      {phase === 'interpret' && (
        <>
          <div className="card p-2">
            <AngleFigure spec={figureFor(pair, true)} />
          </div>
          <p className="text-lg font-bold">{m.interpret.question}</p>
          <div className="flex flex-col gap-2">
            {m.interpret.options.map((o, i) => (
              <button
                key={o}
                type="button"
                className="btn-secondary justify-start text-left font-normal"
                disabled={interp !== null && i !== m.interpret.answer && i !== interp}
                aria-pressed={interp === i}
                onClick={() => {
                  if (interp !== null) return;
                  setInterp(i);
                  void recordAttempt({
                    problemId: m.id,
                    relation: m.relation,
                    kcs: ['KC_INTERPRET'],
                    mode: 'independent',
                    step: 'interpret',
                    response: String(i),
                    correct: i === m.interpret.answer,
                    hintLevel: 0,
                    durationMs: 0,
                  });
                }}
              >
                {o}
                {interp !== null && i === m.interpret.answer && <span className="ml-auto pl-2">✓</span>}
              </button>
            ))}
          </div>
          {interp !== null && (
            <>
              <MascotBubble mood={interp === m.interpret.answer ? 'cheer' : 'think'} live>
                <b>{interp === m.interpret.answer ? 'Tepat!' : 'Belum tepat.'}</b> {m.interpret.explain}
              </MascotBubble>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  void logEvent('mission_complete', { missionId: m.id, interpretCorrect: interp === m.interpret.answer });
                  onNext();
                }}
              >
                Misi berikutnya →
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function AllDone() {
  return (
    <div className="flex flex-col items-center gap-3 pt-4 text-center">
      <Busu mood="cheer" size={130} bob />
      <p className="text-2xl font-bold">Semua misi selesai!</p>
      <p className="text-ink-muted">Kamu sudah memakai hubungan sudut untuk memecahkan masalah sehari-hari.</p>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        <Link to="/progres" className="btn-primary">
          Lihat progresku ⭐
        </Link>
        <Link to="/" className="btn-secondary">
          Kembali ke Peta Belajar
        </Link>
      </div>
    </div>
  );
}
