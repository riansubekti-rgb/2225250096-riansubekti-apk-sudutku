import { useEffect, useMemo, useRef, useState } from 'react';
import type { LiteracyTest } from '../../data/schemas';
import { AngleFigure } from '../../figure2d/AngleFigure';
import { hashSeed, makeRng, shuffle } from '../../domain/random';
import { loadAssessmentAnswers, saveAssessmentAnswer } from '../../data/research';

const LETTERS = ['A', 'B', 'C', 'D'];

/**
 * Mode tes (prd.md F10, desain.md §9.1): satu butir per layar, tanpa petunjuk, tanpa umpan balik
 * benar/salah, tanpa maskot. Urutan opsi diacak per siswa (stabil) dan dicatat.
 */
export function TestRunner({
  test,
  studentCode,
  onSubmit,
}: {
  test: LiteracyTest;
  studentCode: string;
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [review, setReview] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const elapsed = useRef<Record<string, number>>({});
  const enteredAt = useRef(Date.now());

  const orders = useMemo(
    () =>
      Object.fromEntries(
        test.items.map((it) => [
          it.id,
          it.shuffleOptions ? shuffle(makeRng(hashSeed(`${studentCode}|${test.id}|${it.id}`)), it.options) : it.options,
        ]),
      ),
    [test, studentCode],
  );

  // Lanjutkan jawaban yang sudah tersimpan (mis. setelah HP mati).
  useEffect(() => {
    void loadAssessmentAnswers(test.id).then((rows) => {
      setAnswers(Object.fromEntries(rows.map((r) => [r.itemId, r.response])));
      for (const r of rows) elapsed.current[r.itemId] = r.durationMs;
      setLoaded(true);
    });
  }, [test.id]);

  const item = test.items[index]!;

  const leave = () => {
    const now = Date.now();
    elapsed.current[item.id] = (elapsed.current[item.id] ?? 0) + (now - enteredAt.current);
    enteredAt.current = now;
  };
  const goTo = (i: number) => {
    leave();
    setReview(false);
    setIndex(i);
  };

  const choose = (optionId: string) => {
    leave();
    setAnswers((a) => ({ ...a, [item.id]: optionId }));
    void saveAssessmentAnswer({
      instrumentId: test.id,
      instrumentVersion: test.version,
      itemId: item.id,
      response: optionId,
      correct: optionId === item.answer,
      score: optionId === item.answer ? item.score : 0,
      shownOrder: orders[item.id]!.map((o) => o.id).join(','),
      durationMs: elapsed.current[item.id] ?? 0,
    });
  };

  if (!loaded) return null;
  const unanswered = test.items.filter((it) => !answers[it.id]);

  if (review) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-xl font-bold">Periksa sebelum mengirim</p>
        <div className="grid grid-cols-5 gap-2">
          {test.items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => goTo(i)}
              className={`flex min-h-touch items-center justify-center rounded-card border-2 font-bold ${
                answers[it.id] ? 'border-accent text-accent' : 'border-dashed border-line text-ink-muted'
              }`}
              aria-label={`Soal ${i + 1}${answers[it.id] ? ' sudah dijawab' : ' belum dijawab'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <p className="text-ink-muted">
          {unanswered.length === 0
            ? 'Semua soal sudah dijawab.'
            : `${unanswered.length} soal belum dijawab. Ketuk nomornya untuk mengerjakan.`}
        </p>
        <button type="button" className="btn-primary" onClick={() => onSubmit(answers)}>
          Kirim jawaban
        </button>
        <button type="button" className="btn-secondary" onClick={() => setReview(false)}>
          Kembali ke soal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-line px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
          {test.title}
        </span>
        <span className="text-sm font-bold text-ink-muted">
          Soal {index + 1} dari {test.items.length}
        </span>
      </div>
      <p className="text-lg leading-snug">{item.stem}</p>
      {item.figure && (
        <div className="card p-2">
          {/* Netral: warna hubungan tidak boleh membocorkan jawaban di mode tes. */}
          <AngleFigure spec={item.figure} neutral />
        </div>
      )}
      <div role="radiogroup" aria-label={`Pilihan jawaban soal ${index + 1}`} className="flex flex-col gap-2">
        {orders[item.id]!.map((o, i) => {
          const chosen = answers[item.id] === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={chosen}
              onClick={() => choose(o.id)}
              className={`btn justify-start border-2 text-left font-normal ${chosen ? 'border-accent bg-surface' : 'border-line bg-surface'}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  chosen ? 'border-accent bg-accent text-on-accent' : 'border-line'
                }`}
              >
                {LETTERS[i]}
              </span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" className="btn-secondary flex-1" disabled={index === 0} onClick={() => goTo(index - 1)}>
          ← Sebelumnya
        </button>
        {index + 1 < test.items.length ? (
          <button type="button" className="btn-primary flex-1" onClick={() => goTo(index + 1)}>
            Berikutnya →
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => {
              leave();
              setReview(true);
            }}
          >
            Selesai
          </button>
        )}
      </div>
    </div>
  );
}
