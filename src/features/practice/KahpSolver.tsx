import { useMemo, useRef, useState, type ReactNode } from 'react';
import raw from '../../../content/worked-examples/worked.json';
import { WorkedSchema } from '../../data/schemas';
import { AngleFigure } from '../../figure2d/AngleFigure';
import { MascotBubble } from '../../components/mascot/MascotBubble';
import { KahpSteps } from '../../components/KahpSteps';
import { NumPad } from '../../components/NumPad';
import { RELATIONS, RELATION_LABEL, RELATION_SYMBOL } from '../../domain/geometry/relation';
import { formatLinear } from '../../domain/algebra/linear';
import { angleTarget, figureFor, ruleOptions, solvePair, valueOf, type PairProblem } from '../../domain/problems/pair';
import {
  diagnoseAngle,
  diagnoseX,
  relationMisconception,
  type MisconceptionCode,
} from '../../domain/checker/misconception';
import { recordAttempt } from '../../data/log';
import type { KahpPhase } from '../../app/strings';
import { outcomeScore, type KC } from '../../domain/learner/mastery';

const content = WorkedSchema.parse(raw);
const MAX_TRIES = 3; // setelah 3 kali salah, jawaban ditunjukkan agar siswa tidak frustrasi

type Step = 'identify' | 'rule' | 'x' | 'angle' | 'check' | 'done';
const PHASE: Record<Step, KahpPhase | 'done'> = {
  identify: 'identify',
  rule: 'rule',
  x: 'compute',
  angle: 'compute',
  check: 'check',
  done: 'done',
};
const HINT_KEY = { identify: 'identify', rule: 'rule', x: 'computeX', angle: 'computeAngle' } as const;

interface Feedback {
  mood: 'cheer' | 'oops' | 'think';
  text: string;
}

export interface SolveSummary {
  hintsUsed: number;
  mistakes: number;
}

/**
 * Panel pengerjaan K-A-H-P (prd.md F5/F6). Gambar di atas, satu langkah aktif di bawah (P1, P2).
 * `given` = langkah yang sudah dikerjakan (soal melengkapi / fading, P5).
 */
export function KahpSolver({
  problem,
  mode,
  given = [],
  onDone,
  onStepResult,
}: {
  problem: PairProblem;
  mode: 'completion' | 'independent';
  given?: ('identify' | 'rule')[];
  onDone: (s: SolveSummary) => void;
  /** Dipanggil sekali per langkah yang dikerjakan siswa (untuk model penguasaan). */
  onStepResult?: (kc: KC, score: number) => void;
}) {
  const sol = useMemo(() => solvePair(problem), [problem]);
  const target = angleTarget(problem);
  const order: Step[] = (['identify', 'rule', 'x', 'angle', 'check'] as Step[]).filter(
    (s) => !(given as Step[]).includes(s) && !(s === 'angle' && !target),
  );
  const [stepIdx, setStepIdx] = useState(0);
  const step: Step = order[stepIdx] ?? 'done';
  const [tries, setTries] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [locked, setLocked] = useState(false);
  const totals = useRef({ hintsUsed: 0, mistakes: 0 });
  const shownAt = useRef(Date.now());

  const xKnown = stepIdx > order.indexOf('x') && order.includes('x');
  const showValues = step === 'check' || step === 'done';
  const done = (given as Step[]).concat(order.slice(0, stepIdx));

  const advance = () => {
    setStepIdx((i) => i + 1);
    setTries(0);
    setHintLevel(0);
    setFeedback(null);
    setLocked(false);
    shownAt.current = Date.now();
    if (stepIdx + 1 >= order.length) onDone(totals.current);
  };

  const log = (response: string, correct: boolean, misconception?: MisconceptionCode) =>
    void recordAttempt({
      problemId: problem.id,
      relation: problem.relation,
      kcs: kcsFor(step, problem),
      mode,
      step: PHASE[step],
      response,
      correct,
      misconception,
      hintLevel,
      durationMs: Date.now() - shownAt.current,
    });

  const judge = (response: string, correct: boolean, misconception?: MisconceptionCode, extra?: string) => {
    log(response, correct, correct ? undefined : misconception);
    const kc = kcsFor(step, problem)[0]!;
    if (correct) {
      onStepResult?.(kc, outcomeScore({ correct: true, hintLevel, mistakes: tries }));
      setFeedback({ mood: 'cheer', text: content.feedback.correct });
      setLocked(true);
      return;
    }
    totals.current.mistakes++;
    const n = tries + 1;
    setTries(n);
    const specific =
      misconception && misconception in content.feedback
        ? content.feedback[misconception as keyof typeof content.feedback].replace('{expr}', extra ?? '')
        : content.feedback.wrong;
    if (n >= MAX_TRIES) {
      onStepResult?.(kc, 0);
      setFeedback({ mood: 'think', text: `${content.feedback.reveal} ${answerText()}` });
      setLocked(true);
    } else setFeedback({ mood: 'oops', text: specific });
  };

  const answerText = () => {
    if (step === 'identify') return `Jawabannya: ${RELATION_LABEL[problem.relation]}.`;
    if (step === 'rule') return `Persamaannya: ${ruleOptions(problem).find((o) => o.relation === problem.relation)!.text}.`;
    if (step === 'x') return `x = ${sol.x}.`;
    if (step === 'angle' && target) return `${formatLinear(target)} = ${valueOf(target, sol.x)}°.`;
    return '';
  };

  const showHint = () => {
    if (step === 'check' || step === 'done') return;
    const list = content.hints[HINT_KEY[step]];
    // Level terakhir: tampilkan langkah pertama perhitungan dari mesin penyelesai.
    const extra = step === 'x' ? sol.steps.find((s) => s.kind !== 'rule')?.text : undefined;
    const all = extra ? [...list, `Langkah pertama: ${extra}`] : list;
    const lvl = Math.min(hintLevel + 1, all.length);
    if (lvl > hintLevel) totals.current.hintsUsed++;
    setHintLevel(lvl);
    setFeedback({ mood: 'think', text: all[lvl - 1]! });
  };

  const hintMax = step === 'x' ? content.hints.computeX.length + 1 : step === 'check' || step === 'done' ? 0 : content.hints[HINT_KEY[step]].length;

  return (
    <div className="flex flex-col gap-3">
      <div className="card p-2">
        <AngleFigure spec={figureFor(problem, showValues)} neutral={done.includes('identify') ? false : true} />
      </div>
      <KahpSteps current={PHASE[step]} />

      {/* Ringkasan langkah yang sudah selesai (satu baris), agar bisa dilihat ulang tanpa menggulir jauh. */}
      {done.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm text-ink-muted">
          {done.includes('identify') && <li>✓ {content.identify[problem.relation]}</li>}
          {done.includes('rule') && <li>✓ {ruleOptions(problem).find((o) => o.relation === problem.relation)!.text}</li>}
          {xKnown && <li>✓ x = {sol.x}</li>}
        </ul>
      )}

      <div className="card flex flex-col gap-3">
        {step === 'identify' && (
          <>
            <p className="font-bold">Kedua sudut ini termasuk hubungan apa?</p>
            {RELATIONS.map((rel) => (
              <ChoiceButton
                key={rel}
                disabled={locked}
                onClick={() => judge(rel, rel === problem.relation, relationMisconception(problem.relation, rel))}
              >
                <span aria-hidden className="w-12 shrink-0 text-sm">
                  {RELATION_SYMBOL[rel]}
                </span>
                {RELATION_LABEL[rel]}
              </ChoiceButton>
            ))}
          </>
        )}

        {step === 'rule' && (
          <>
            <p className="font-bold">Persamaan mana yang tepat?</p>
            {ruleOptions(problem).map((o) => (
              <ChoiceButton
                key={o.relation}
                disabled={locked}
                onClick={() => judge(o.text, o.relation === problem.relation, relationMisconception(problem.relation, o.relation))}
              >
                <span className="font-bold tabular-nums">{o.text}</span>
              </ChoiceButton>
            ))}
          </>
        )}

        {step === 'x' && (
          <NumPad
            label="x ="
            disabled={locked}
            onSubmit={(v) => judge(String(v), v === sol.x, diagnoseX(problem.relation, problem.e1, problem.e2, v))}
          />
        )}

        {step === 'angle' && target && (
          <NumPad
            label={`${formatLinear(target)} =`}
            suffix="°"
            disabled={locked}
            onSubmit={(v) =>
              judge(String(v), v === valueOf(target, sol.x), diagnoseAngle(sol.x, v), formatLinear(target))
            }
          />
        )}

        {step === 'check' && (
          <>
            <p className="text-center text-2xl font-bold tabular-nums">{sol.steps[sol.steps.length - 1]!.text}</p>
            <p className="text-center text-sm text-ink-muted">Apakah jawabanmu sesuai sifat {RELATION_LABEL[problem.relation].toLowerCase()}?</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                log('ok', true);
                advance();
              }}
            >
              Ya, cocok ✓
            </button>
          </>
        )}

        {feedback && (
          <MascotBubble mood={feedback.mood} live>
            {feedback.text}
          </MascotBubble>
        )}

        {step !== 'check' && step !== 'done' && (
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={showHint} disabled={locked || hintLevel >= hintMax}>
              💡 Petunjuk {hintLevel > 0 ? `(${hintLevel}/${hintMax})` : ''}
            </button>
            {locked && (
              <button type="button" className="btn-primary flex-1" onClick={advance}>
                Lanjut →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" className="btn-secondary justify-start text-left" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}

function kcsFor(step: Step, p: PairProblem): KC[] {
  if (step === 'identify') return ['KC_IDENTIFY'];
  if (step === 'rule') return ['KC_RULE'];
  // Soal bervariabel = ada sudut yang harus dihitung dari x (bukan sekadar "x").
  if (step === 'x' || step === 'angle') return [angleTarget(p) ? 'KC_ALGEBRA' : 'KC_NUMERIC'];
  return ['KC_INTERPRET'];
}
