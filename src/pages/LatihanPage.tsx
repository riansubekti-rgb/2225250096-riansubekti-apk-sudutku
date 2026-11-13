import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import raw from '../../content/problems/templates.json';
import { TemplatesSchema } from '../data/schemas';
import { KahpSolver } from '../features/practice/KahpSolver';
import { PaasRating } from '../features/effort-rating/PaasRating';
import { PAAS_VERSION } from '../features/effort-rating/paas';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { Busu } from '../components/mascot/Busu';
import { RELATIONS, RELATION_LABEL, type Relation } from '../domain/geometry/relation';
import { findMastery, masteryStatus, type MasteryRec, type MasteryStatus } from '../domain/learner/mastery';
import { planNext, type Plan } from '../domain/scaffolding/policy';
import { generateFromTemplate } from '../domain/problems/generator';
import type { PairProblem } from '../domain/problems/pair';
import { makeRng } from '../domain/random';
import { applyOutcome, loadMastery } from '../data/mastery';
import { isTestItem } from '../data/exclusions';
import { db } from '../data/db';
import { useSession } from '../data/session';
import { logEvent } from '../data/log';

const { templates } = TemplatesSchema.parse(raw);
/** ≈ 4–6 soal per set, lalu skala Paas (prd.md F9). */
export const SET_SIZE = 5;

const STATUS_TEXT: Record<MasteryStatus, string> = {
  belum: 'Masih belajar',
  berkembang: 'Berkembang',
  menguasai: 'Menguasai ⭐',
};

const REL_VAR: Record<Relation, string> = {
  supplementary: 'var(--rel-sup)',
  complementary: 'var(--rel-comp)',
  vertical: 'var(--rel-vert)',
};

function pickProblem(plan: Plan, seed: number): PairProblem {
  const rng = makeRng(seed);
  const options = templates.filter((t) => t.relation === plan.relation && t.kind === plan.kind);
  const tpl = options[Math.floor(rng() * options.length)]!;
  return generateFromTemplate(tpl, seed, isTestItem);
}

interface Current {
  plan: Plan;
  problem: PairProblem;
}

/** Latihan adaptif (F6): soal dipilih & bantuan diatur oleh model penguasaan (architecture.md §6). */
export function LatihanPage() {
  const sessionId = useSession((s) => s.sessionId);
  const [mastery, setMastery] = useState<MasteryRec[] | null>(null);
  const [phase, setPhase] = useState<'solve' | 'rate' | 'summary'>('solve');
  const [setNo, setSetNo] = useState(1);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState<Current | null>(null);
  const [solved, setSolved] = useState(false);
  const lastRelation = useRef<Relation | null>(null);
  const masteryRef = useRef<MasteryRec[]>([]);

  const next = (m: MasteryRec[]) => {
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const plan = planNext(m, lastRelation.current, makeRng(seed));
    lastRelation.current = plan.relation;
    setCurrent({ plan, problem: pickProblem(plan, seed) });
    setSolved(false);
  };

  useEffect(() => {
    void loadMastery().then((m) => {
      masteryRef.current = m;
      setMastery(m);
      next(m);
    });
  }, []);

  if (!mastery || !current) return null;

  const setId = `latihan-${sessionId}-${setNo}`;

  if (phase === 'rate') {
    return (
      <PaasRating
        onSubmit={(value, durationMs) => {
          const { profile } = useSession.getState();
          if (profile && sessionId != null)
            void db.ratings.add({
              profileId: profile.id,
              sessionId,
              setId,
              instrumentVersion: PAAS_VERSION,
              mentalEffort: value,
              durationMs,
              ts: Date.now(),
            });
          setPhase('summary');
        }}
      />
    );
  }

  if (phase === 'summary') {
    return (
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Busu mood="cheer" size={110} bob />
        <p className="text-2xl font-bold">Set {setNo} selesai!</p>
        <div className="card w-full text-left">
          <p className="mb-2 text-sm text-ink-muted">Kemampuan menghitungmu:</p>
          <ul className="flex flex-col gap-2">
            {RELATIONS.map((rel) => {
              const st = masteryStatus(findMastery(masteryRef.current, 'KC_NUMERIC', rel));
              return (
                <li key={rel} className="flex items-center justify-between gap-2">
                  <span className="font-bold" style={{ color: REL_VAR[rel] }}>
                    {RELATION_LABEL[rel]}
                  </span>
                  <span className="rounded-full bg-bg px-3 py-1 text-sm font-bold">{STATUS_TEXT[st]}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSetNo((n) => n + 1);
              setIndex(0);
              setPhase('solve');
              next(masteryRef.current);
            }}
          >
            Set berikutnya →
          </button>
          <Link to="/" className="btn-secondary">
            Kembali ke Peta Belajar
          </Link>
        </div>
      </div>
    );
  }

  const { plan, problem } = current;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((index + 1) / SET_SIZE) * 100}%` }} />
        </div>
        <span className="text-xs font-bold text-ink-muted">
          Soal {index + 1}/{SET_SIZE}
        </span>
      </div>
      {plan.given.length > 0 && index === 0 && (
        <MascotBubble mood="happy" size={44}>
          Beberapa langkah sudah aku bantu. Kerjakan sisanya, ya!
        </MascotBubble>
      )}
      <KahpSolver
        key={problem.id}
        problem={problem}
        mode={plan.given.length ? 'completion' : 'independent'}
        given={plan.given}
        onStepResult={(kc, score) => {
          void applyOutcome(masteryRef.current, kc, problem.relation, score).then((m) => {
            masteryRef.current = m;
            setMastery(m);
          });
        }}
        onDone={(s) => {
          setSolved(true);
          void logEvent('practice_problem_done', { problemId: problem.id, level: plan.level, ...s });
        }}
      />
      {solved && (
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (index + 1 >= SET_SIZE) {
              setPhase('rate');
              return;
            }
            setIndex((i) => i + 1);
            next(masteryRef.current);
          }}
        >
          {index + 1 >= SET_SIZE ? 'Selesai set ini →' : 'Soal berikutnya →'}
        </button>
      )}
    </div>
  );
}
