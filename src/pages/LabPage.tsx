import { useRef, useState } from 'react';
import { AngleFigure } from '../figure2d/AngleFigure';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { RELATIONS, RELATION_LABEL, RELATION_SYMBOL, partnerAngle, type Relation } from '../domain/geometry/relation';
import { snapClamp, type FigureSpec } from '../domain/geometry/figure';
import { tick } from '../platform/haptics';
import { logEvent } from '../data/log';

const REL_VAR: Record<Relation, string> = {
  supplementary: 'var(--rel-sup)',
  complementary: 'var(--rel-comp)',
  vertical: 'var(--rel-vert)',
};

const TIP: Record<Relation, string> = {
  supplementary: 'Geser titik bulatnya. Lihat, jumlah kedua sudut selalu 180°!',
  complementary: 'Sudut siku-siku dibagi dua. Jumlahnya selalu 90°!',
  vertical: 'Putar garisnya. Sudut yang berhadapan selalu sama besar!',
};

const START: Record<Relation, number> = { supplementary: 65, complementary: 35, vertical: 50 };

function specOf(rel: Relation, a: number): FigureSpec {
  const b = partnerAngle(rel, a);
  if (rel === 'vertical') return { type: rel, a, labels: [`${a}°`, `${a}°`, '', ''], highlight: [0, 1] };
  return { type: rel, a, labels: [`${a}°`, `${b}°`] };
}

/** Lab Sudut (F4, DS01): seret garis, besar sudut berubah langsung di gambar. */
export function LabPage() {
  const [rel, setRel] = useState<Relation>('supplementary');
  const [angles, setAngles] = useState(START);
  const [snap5, setSnap5] = useState(false);
  const last = useRef(angles[rel]);
  const a = angles[rel];
  const b = partnerAngle(rel, a);
  const color = REL_VAR[rel];
  const snap = snap5 ? 5 : 1;

  const update = (next: number) => {
    // Getaran halus saat melewati kelipatan 45° (mis. 90°).
    if (Math.floor(last.current / 45) !== Math.floor(next / 45) || next % 45 === 0) tick();
    last.current = next;
    setAngles((s) => ({ ...s, [rel]: next }));
  };
  const commit = (v: number) => void logEvent('lab_drag', { relation: rel, a: v });

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Jenis hubungan" className="grid grid-cols-3 gap-2">
        {RELATIONS.map((r) => (
          <button
            key={r}
            role="tab"
            aria-selected={r === rel}
            type="button"
            onClick={() => {
              setRel(r);
              last.current = angles[r];
            }}
            className="flex min-h-touch flex-col items-center justify-center rounded-card border-2 px-1 py-1 text-xs font-bold leading-tight"
            style={
              r === rel
                ? {
                    borderColor: REL_VAR[r],
                    color: REL_VAR[r],
                    background: `color-mix(in srgb, ${REL_VAR[r]} 14%, var(--surface))`,
                    borderWidth: 3,
                  }
                : { borderColor: 'var(--line)', color: 'var(--ink-muted)', background: 'var(--surface)' }
            }
          >
            <span aria-hidden>{RELATION_SYMBOL[r]}</span>
            <span>{RELATION_LABEL[r]}</span>
          </button>
        ))}
      </div>

      <div className="card p-2">
        <AngleFigure spec={specOf(rel, a)} onChange={update} onChangeEnd={commit} snap={snap} />
        {/* Persamaan hidup tepat di bawah gambar (kontiguitas, P2) */}
        <p className="pb-1 text-center text-3xl font-bold tabular-nums" style={{ color }} aria-live="polite">
          {rel === 'vertical' ? `${a}° = ${b}°` : `${a}° + ${b}° = ${rel === 'supplementary' ? 180 : 90}°`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary min-w-touch px-0 text-2xl"
          aria-label="Kecilkan sudut"
          onClick={() => {
            const v = snapClamp(rel, a - snap, snap);
            update(v);
            commit(v);
          }}
        >
          −
        </button>
        <button
          type="button"
          className="btn-secondary min-w-touch px-0 text-2xl"
          aria-label="Besarkan sudut"
          onClick={() => {
            const v = snapClamp(rel, a + snap, snap);
            update(v);
            commit(v);
          }}
        >
          +
        </button>
        <label className="ml-auto flex min-h-touch cursor-pointer items-center gap-2 text-sm font-bold">
          <input
            type="checkbox"
            checked={snap5}
            onChange={(e) => {
              setSnap5(e.target.checked);
              if (e.target.checked) update(snapClamp(rel, a, 5));
            }}
            className="h-5 w-5 accent-[var(--accent)]"
          />
          Kelipatan 5°
        </label>
      </div>

      <MascotBubble mood="happy" size={52}>
        {TIP[rel]}
      </MascotBubble>
    </div>
  );
}
