import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import raw from '../../../content/mascot/tanya.json';
import { TanyaSchema } from '../../data/schemas';
import { answer, buildVocab, type Answer, type KbEntry } from '../../domain/assistant/assistant';
import { Busu, type BusuMood } from '../../components/mascot/Busu';
import { useSpeech } from '../../components/mascot/useSpeech';
import { AngleFigure } from '../../figure2d/AngleFigure';
import { logEvent } from '../../data/log';

const data = TanyaSchema.parse(raw);
const kb = data.entries as KbEntry[];
// bangun kosakata sekali saja
buildVocab(kb);

type Msg = { from: 'user'; text: string } | { from: 'busu'; a: Answer };

function BusuMsg({ a, onAsk }: { a: Answer; onAsk: (q: string) => void }) {
  const { speaking, toggle, available } = useSpeech();
  const speakText = [a.text, ...(a.steps ?? []).map((s) => `${s.text}. ${s.note}.`)].join(' ');
  return (
    <div className="flex items-start gap-2">
      <div className="shrink-0 pt-1">
        <Busu mood={a.mood as BusuMood} size={46} talking={speaking} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="rounded-card rounded-tl-sm border border-line bg-surface px-3 py-2 text-[15px] leading-snug shadow-sm">
          <p>{a.text}</p>
          {a.steps && a.steps.length > 0 && (
            <ol className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
              {a.steps.map((s, i) => (
                <li key={i}>
                  <p className="font-bold tabular-nums">{s.text}</p>
                  <p className="text-sm text-ink-muted">↳ {s.note}</p>
                </li>
              ))}
            </ol>
          )}
          {a.figure && (
            <div className="mt-2 rounded-card border border-line p-1">
              <AngleFigure spec={a.figure} />
            </div>
          )}
          {available && (
            <button
              type="button"
              onClick={() => toggle(speakText)}
              aria-label={speaking ? 'Hentikan suara Busu' : 'Dengarkan jawaban Busu'}
              className="mt-2 flex h-9 items-center gap-1 rounded-full border border-line bg-bg px-3 text-sm"
            >
              {speaking ? '⏹ Berhenti' : '🔊 Dengar'}
            </button>
          )}
        </div>
        {a.followups && a.followups.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {a.followups.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onAsk(f)}
                className="rounded-full border-2 border-accent bg-surface px-3 py-1.5 text-left text-sm font-bold text-accent"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tanya Busu: asisten tanya-jawab OFFLINE (bukan AI daring). Pertanyaan tidak dikirim ke mana pun
 * dan tidak disimpan; yang dicatat hanya jenis jawaban (untuk penelitian).
 */
export function TanyaBusu() {
  const greeting = useMemo<Answer>(
    () => ({ kind: 'kb', id: 'greeting', mood: 'happy', text: data.greeting, followups: data.suggestions }),
    [],
  );
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'busu', a: greeting }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end', behavior: 'smooth' });
  }, [msgs, thinking]);

  const ask = (q: string) => {
    const text = q.trim().slice(0, 200);
    if (!text || thinking) return;
    setMsgs((m) => [...m, { from: 'user', text }]);
    setInput('');
    setThinking(true);
    // jeda singkat agar terasa seperti Busu sedang berpikir
    window.setTimeout(() => {
      const a = answer(kb, data.fallback, text);
      setMsgs((m) => [...m, { from: 'busu', a }]);
      setThinking(false);
      void logEvent('ask_busu', { kind: a.kind, answerId: a.id, length: text.length });
    }, 450);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-3" aria-live="polite">
        {msgs.map((m, i) =>
          m.from === 'user' ? (
            <div key={i} className="ml-12 self-end rounded-card rounded-tr-sm bg-accent px-3 py-2 text-[15px] text-on-accent">
              {m.text}
            </div>
          ) : (
            <BusuMsg key={i} a={m.a} onAsk={ask} />
          ),
        )}
        {thinking && (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <Busu mood="think" size={40} /> Busu sedang berpikir…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="sticky bottom-0 -mx-4 flex gap-2 border-t border-line bg-bg px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={200}
          placeholder="Tulis pertanyaan atau soalmu…"
          aria-label="Pertanyaan untuk Busu"
          className="min-h-touch min-w-0 flex-1 rounded-card border-2 border-line bg-surface px-3"
        />
        <button type="submit" className="btn-primary px-4" disabled={!input.trim() || thinking} aria-label="Kirim pertanyaan">
          Kirim
        </button>
      </form>
      <p className="-mt-1 pb-1 text-center text-xs text-ink-muted">Busu menjawab dari HP ini. Pertanyaanmu tidak dikirim ke mana pun.</p>
    </div>
  );
}
