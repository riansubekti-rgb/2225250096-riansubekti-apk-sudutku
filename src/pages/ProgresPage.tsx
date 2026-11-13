import { useEffect, useState } from 'react';
import raw from '../../content/progress/badges.json';
import { BadgesSchema } from '../data/schemas';
import { loadProgress } from '../features/progress/progress';
import { RELATIONS, RELATION_LABEL, type Relation } from '../domain/geometry/relation';
import { findMastery, masteryStatus, type KC, type MasteryRec, type MasteryStatus } from '../domain/learner/mastery';
import { MascotBubble } from '../components/mascot/MascotBubble';

const data = BadgesSchema.parse(raw);
const KCS: KC[] = ['KC_IDENTIFY', 'KC_RULE', 'KC_NUMERIC', 'KC_ALGEBRA'];
const REL_VAR: Record<Relation, string> = {
  supplementary: 'var(--rel-sup)',
  complementary: 'var(--rel-comp)',
  vertical: 'var(--rel-vert)',
};
const STATUS: Record<MasteryStatus, { text: string; dots: number }> = {
  belum: { text: 'Masih belajar', dots: 1 },
  berkembang: { text: 'Berkembang', dots: 2 },
  menguasai: { text: 'Menguasai', dots: 3 },
};

/** Progres & lencana (F11): bahasa sederhana, tanpa papan peringkat (D8). */
export function ProgresPage() {
  const [state, setState] = useState<{ mastery: MasteryRec[]; earned: Set<string> } | null>(null);
  useEffect(() => {
    void loadProgress().then(setState);
  }, []);
  if (!state) return null;

  return (
    <div className="flex flex-col gap-4">
      <MascotBubble mood="happy">
        Kamu sudah mengumpulkan {state.earned.size} dari {data.badges.length} lencana. Terus semangat!
      </MascotBubble>

      <section aria-label="Lencana" className="grid grid-cols-3 gap-2">
        {data.badges.map((b) => {
          const got = state.earned.has(b.id);
          return (
            <div
              key={b.id}
              className={`flex flex-col items-center gap-1 rounded-card border-2 p-2 text-center ${
                got ? 'border-accent bg-surface' : 'border-dashed border-line opacity-50'
              }`}
            >
              <span aria-hidden className={`text-3xl ${got ? '' : 'grayscale'}`}>
                {b.icon}
              </span>
              <span className="text-xs font-bold leading-tight">{b.title}</span>
              <span className="text-[11px] leading-tight text-ink-muted">{got ? 'Didapat!' : b.desc}</span>
            </div>
          );
        })}
      </section>

      {RELATIONS.map((rel) => (
        <section key={rel} className="card">
          <h2 className="mb-2 font-bold" style={{ color: REL_VAR[rel] }}>
            {RELATION_LABEL[rel]}
          </h2>
          <ul className="flex flex-col gap-1">
            {KCS.map((kc) => {
              const st = STATUS[masteryStatus(findMastery(state.mastery, kc, rel))];
              return (
                <li key={kc} className="flex items-center justify-between gap-2 text-sm">
                  <span>{data.kcLabel[kc as keyof typeof data.kcLabel]}</span>
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="tracking-widest" style={{ color: REL_VAR[rel] }}>
                      {'●'.repeat(st.dots)}
                      <span className="text-line">{'●'.repeat(3 - st.dots)}</span>
                    </span>
                    <span className="w-24 text-right text-ink-muted">{st.text}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
