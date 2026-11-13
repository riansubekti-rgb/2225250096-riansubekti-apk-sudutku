import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import raw from '../../content/concepts/concepts.json';
import { ConceptsSchema, type CompareCard, type ConceptCard, type QuizCard } from '../data/schemas';
import { AngleFigure } from '../figure2d/AngleFigure';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { Busu } from '../components/mascot/Busu';
import { RELATIONS, RELATION_LABEL, RELATION_SYMBOL, type Relation } from '../domain/geometry/relation';
import { logEvent, recordAttempt } from '../data/log';

const data = ConceptsSchema.parse(raw);
const QUIZ_COUNT = data.cards.filter((c) => c.kind === 'quiz').length;

const REL_VAR: Record<Relation, string> = {
  supplementary: 'var(--rel-sup)',
  complementary: 'var(--rel-comp)',
  vertical: 'var(--rel-vert)',
};

/** Kenali Hubungan (F3): satu kartu per layar; langkah tersimpan di URL agar tombol back Android bekerja. */
export function KenaliPage() {
  const [params, setParams] = useSearchParams();
  const total = data.cards.length + 1; // + layar penutup
  const step = Math.min(Math.max(Number(params.get('langkah') ?? 0) || 0, 0), total - 1);
  const [answers, setAnswers] = useState<Record<string, { choice: Relation; correct: boolean }>>({});
  const go = (n: number) => setParams({ langkah: String(n) });

  const card = data.cards[step];
  const canNext = card?.kind !== 'quiz' || answers[card.id] !== undefined;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>

      <div className="flex-1" key={step}>
        {card?.kind === 'concept' && <ConceptView card={card} />}
        {card?.kind === 'compare' && <CompareView card={card} />}
        {card?.kind === 'quiz' && (
          <QuizView
            card={card}
            number={data.cards.slice(0, step + 1).filter((c) => c.kind === 'quiz').length}
            answer={answers[card.id]}
            onAnswer={(choice, correct) => setAnswers((a) => ({ ...a, [card.id]: { choice, correct } }))}
          />
        )}
        {!card && <DoneView score={Object.values(answers).filter((a) => a.correct).length} />}
      </div>

      {card && (
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

function ConceptView({ card }: { card: ConceptCard }) {
  const color = REL_VAR[card.relation];
  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-2xl font-bold" style={{ color }}>
        <span aria-hidden className="text-lg">
          {RELATION_SYMBOL[card.relation]}
        </span>
        {card.title}
      </h2>
      <div className="card p-2">
        <AngleFigure spec={card.figure} />
      </div>
      <MascotBubble mood="happy">{card.core}</MascotBubble>
      <p
        className="rounded-card border-2 py-3 text-center text-2xl font-bold"
        style={{ borderColor: color, color }}
      >
        {card.formula}
      </p>
      <details className="card">
        <summary className="min-h-touch cursor-pointer font-bold leading-[48px]">Kenapa begitu?</summary>
        <p className="pb-1">{card.why}</p>
      </details>
    </div>
  );
}

function CompareView({ card }: { card: CompareCard }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold">{card.title}</h2>
      <div className="grid grid-cols-2 gap-2">
        {[card.left, card.right].map((side) => (
          <div key={side.relation} className="card flex flex-col items-center gap-1 p-2 text-center">
            <p className="font-bold" style={{ color: REL_VAR[side.relation] }}>
              {RELATION_LABEL[side.relation]}
            </p>
            <AngleFigure spec={side.figure} />
            <p className="text-sm font-bold">{side.cue}</p>
            <p className="text-lg font-bold" style={{ color: REL_VAR[side.relation] }}>
              {side.total}
            </p>
          </div>
        ))}
      </div>
      <MascotBubble mood="think">{card.tip}</MascotBubble>
    </div>
  );
}

function misconceptionFor(answer: Relation, choice: Relation): string {
  if (answer === 'supplementary' && choice === 'complementary') return 'M_SUP_AS_COMP';
  if (answer === 'complementary' && choice === 'supplementary') return 'M_COMP_AS_SUP';
  if (answer === 'vertical' && choice === 'supplementary') return 'M_VERT_AS_SUP';
  return 'M_UNKNOWN';
}

function QuizView({
  card,
  number,
  answer,
  onAnswer,
}: {
  card: QuizCard;
  number: number;
  answer?: { choice: Relation; correct: boolean };
  onAnswer: (choice: Relation, correct: boolean) => void;
}) {
  const shownAt = useRef(Date.now());

  const choose = (choice: Relation) => {
    if (answer) return;
    const correct = choice === card.answer;
    onAnswer(choice, correct);
    void recordAttempt({
      problemId: card.id,
      relation: card.answer,
      kcs: ['KC_IDENTIFY'],
      mode: 'independent',
      step: 'identify',
      response: choice,
      correct,
      misconception: correct ? undefined : misconceptionFor(card.answer, choice),
      hintLevel: 0,
      durationMs: Date.now() - shownAt.current,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">
        Tantangan {number} dari {QUIZ_COUNT}
      </p>
      <div className="card p-2">
        {/* Warna netral sebelum menjawab agar warna tidak membocorkan jawaban; berwarna setelah menjawab. */}
        <AngleFigure spec={card.figure} neutral={!answer} />
      </div>
      <p className="text-lg font-bold">{data.quizPrompt}</p>
      <div className="flex flex-col gap-2" role="group" aria-label="Pilihan jawaban">
        {RELATIONS.map((rel) => {
          const isChoice = answer?.choice === rel;
          const isKey = answer && rel === card.answer;
          return (
            <button
              key={rel}
              type="button"
              onClick={() => choose(rel)}
              disabled={Boolean(answer) && !isChoice && !isKey}
              aria-pressed={isChoice}
              className="btn-secondary justify-start text-left"
              style={isKey ? { borderColor: REL_VAR[rel], color: REL_VAR[rel] } : undefined}
            >
              <span aria-hidden className="w-12 shrink-0 text-sm">
                {RELATION_SYMBOL[rel]}
              </span>
              <span className="flex-1">{RELATION_LABEL[rel]}</span>
              {isKey && <span aria-label="jawaban benar">✓</span>}
              {isChoice && !answer?.correct && <span aria-label="pilihanmu">ⓘ</span>}
            </button>
          );
        })}
      </div>
      {answer && (
        <MascotBubble mood={answer.correct ? 'cheer' : 'oops'} live>
          <b>{answer.correct ? data.feedback.correct : data.feedback.wrong}</b> {data.feedback[card.answer]}
        </MascotBubble>
      )}
    </div>
  );
}

function DoneView({ score }: { score: number }) {
  const logged = useRef(false);
  if (!logged.current) {
    logged.current = true;
    void logEvent('section_complete', { section: 'kenali', score, of: QUIZ_COUNT });
  }
  const great = score >= QUIZ_COUNT - 1;
  return (
    <div className="flex flex-col items-center gap-3 pt-4 text-center">
      <Busu mood={great ? 'cheer' : 'happy'} size={130} />
      <p className="text-2xl font-bold">
        Kamu benar {score} dari {QUIZ_COUNT}!
      </p>
      <p className="text-ink-muted">
        {great ? 'Hebat! Kamu sudah bisa membedakan ketiga hubungan sudut.' : 'Bagus! Coba ulangi sekali lagi supaya makin yakin.'}
      </p>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-3">
        <Link to="/lab" className="btn-primary">
          Coba di Lab Sudut 🧪
        </Link>
        {!great && (
          <Link to="/kenali?langkah=0" className="btn-secondary">
            Ulangi
          </Link>
        )}
        <Link to="/" className="btn-secondary">
          Kembali ke Peta Belajar
        </Link>
      </div>
    </div>
  );
}
