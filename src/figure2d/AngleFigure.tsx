import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  angleAt,
  arcPath,
  pointerToAngle,
  polar,
  snapClamp,
  VERT_BASE,
  wedgePath,
  type FigureSpec,
  type Pt,
} from '../domain/geometry/figure';
import { RELATION_LABEL } from '../domain/geometry/relation';

const REL_COLOR = {
  supplementary: 'var(--rel-sup)',
  complementary: 'var(--rel-comp)',
  vertical: 'var(--rel-vert)',
} as const;

interface ArcDef {
  from: number;
  to: number;
  label: string;
  colored: boolean;
  /** Sudut kedua pada pasangan bersebelahan digambar dengan busur lebih besar & warna lebih tipis
   *  agar terlihat sebagai DUA sudut, bukan satu busur menyatu. */
  outer?: boolean;
}

interface Layout {
  c: Pt;
  r: number;
  lines: [Pt, Pt][];
  arcs: ArcDef[];
  handle: Pt;
  rightMark?: string;
}

function layout(spec: FigureSpec): Layout {
  const a = spec.a;
  if (spec.type === 'supplementary') {
    const c = { x: 160, y: 170 };
    const R = 130;
    return {
      c,
      r: 44,
      lines: [
        [polar(c, R, 0), polar(c, R, 180)],
        [c, polar(c, R, a)],
      ],
      arcs: [
        { from: 0, to: a, label: spec.labels[0], colored: true },
        { from: a, to: 180, label: spec.labels[1], colored: true, outer: true },
      ],
      handle: polar(c, R, a),
    };
  }
  if (spec.type === 'complementary') {
    const c = { x: 105, y: 195 };
    const R = 165;
    const m = 16;
    return {
      c,
      r: 58,
      lines: [
        [c, polar(c, R, 0)],
        [c, polar(c, R, 90)],
        [c, polar(c, R, a)],
      ],
      arcs: [
        { from: 0, to: a, label: spec.labels[0], colored: true },
        { from: a, to: 90, label: spec.labels[1], colored: true, outer: true },
      ],
      handle: polar(c, R, a),
      // P3: tanda siku-siku adalah isyarat kunci berpenyiku (IL05)
      rightMark: `M ${c.x + m} ${c.y} L ${c.x + m} ${c.y - m} L ${c.x} ${c.y - m}`,
    };
  }
  const c = { x: 160, y: 110 };
  const R = 100;
  const b = VERT_BASE;
  const hl = spec.highlight ?? [0, 1];
  const spans: [number, number][] = [
    [b, b + a],
    [b + 180, b + 180 + a],
    [b + a, b + 180],
    [b + 180 + a, b + 360],
  ];
  return {
    c,
    r: 32,
    lines: [
      [polar(c, R, b), polar(c, R, b + 180)],
      [polar(c, R, b + a), polar(c, R, b + a + 180)],
    ],
    arcs: spans.map(([from, to], i) => ({ from, to, label: spec.labels[i]!, colored: hl.includes(i) })),
    handle: polar(c, R, b + a),
  };
}

function describe(spec: FigureSpec, neutral: boolean): string {
  const shown = spec.labels.filter((l) => l !== '').map((l) => (l === '?' ? 'ditanyakan' : l));
  if (neutral) return `Gambar dua sudut: ${shown.join(' dan ')}.`;
  return `Dua sudut ${RELATION_LABEL[spec.type].toLowerCase()}: ${shown.join(' dan ')}.`;
}

export interface AngleFigureProps {
  spec: FigureSpec;
  /** Warna netral (mis. kuis identifikasi) agar warna tidak membocorkan jawaban. */
  neutral?: boolean;
  onChange?: (a: number) => void;
  onChangeEnd?: (a: number) => void;
  snap?: number;
  className?: string;
}

/** Gambar sudut SVG: label & angka di dalam gambar (P2), warna token + simbol (P3). */
export function AngleFigure({ spec, neutral = false, onChange, onChangeEnd, snap = 1, className }: AngleFigureProps) {
  const L = layout(spec);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [focused, setFocused] = useState(false);
  const interactive = Boolean(onChange);

  const radius = (arc: ArcDef) => L.r + (arc.outer ? 16 : 0);

  const colorOf = (arc: ArcDef) => {
    if (!arc.colored) return 'var(--ink-muted)';
    if (arc.label === '?') return 'var(--ask)';
    return neutral ? 'var(--accent)' : REL_COLOR[spec.type];
  };

  const toSvg = (e: PointerEvent): Pt | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const onMove = (e: PointerEvent) => {
    if (!dragging || !onChange) return;
    const p = toSvg(e);
    if (p) onChange(pointerToAngle(spec.type, angleAt(L.c, p), snap));
  };

  const onKey = (e: KeyboardEvent) => {
    if (!onChange) return;
    const step = snap > 1 ? snap : 1;
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? -step : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? step : 0;
    if (!delta) return;
    e.preventDefault();
    const next = snapClamp(spec.type, spec.a + delta, snap);
    onChange(next);
    onChangeEnd?.(next);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 220"
      className={className ?? 'mx-auto block h-auto w-full max-w-[420px]'}
      role="img"
      aria-label={describe(spec, neutral)}
      style={interactive ? { touchAction: 'none' } : undefined}
    >
      {L.arcs.map((arc, i) =>
        arc.colored ? (
          <path
            key={`w${i}`}
            d={wedgePath(L.c, radius(arc), arc.from, arc.to)}
            fill={colorOf(arc)}
            opacity={arc.outer ? 0.08 : 0.22}
          />
        ) : null,
      )}
      {L.lines.map(([p, q], i) => (
        <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
      ))}
      {L.rightMark && <path d={L.rightMark} fill="none" stroke="var(--ink)" strokeWidth={2} />}
      {L.arcs.map((arc, i) => {
        if (!arc.colored && arc.label === '') return null;
        const span = arc.to - arc.from;
        const mid = (arc.from + arc.to) / 2;
        // Label panjang (mis. "2x − 10") digeser lebih jauh agar tidak menempel pada garis.
        const longText = Math.max(0, arc.label.length - 4) * 5;
        const lp = polar(L.c, radius(arc) + (span < 30 ? 36 : 22) + longText, mid);
        const color = colorOf(arc);
        return (
          <g key={`a${i}`}>
            <path
              d={arcPath(L.c, radius(arc), arc.from, arc.to)}
              fill="none"
              stroke={color}
              strokeWidth={arc.colored ? 3.5 : 1.5}
            />
            {arc.label && (
              <text
                x={lp.x}
                y={lp.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={17}
                fontWeight={700}
                fill={color}
                stroke="var(--bg)"
                strokeWidth={4}
                paintOrder="stroke"
              >
                {arc.label}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={L.c.x} cy={L.c.y} r={3.5} fill="var(--ink)" />
      {interactive && (
        <g>
          {(focused || dragging) && (
            <circle cx={L.handle.x} cy={L.handle.y} r={21} fill="none" stroke="var(--accent)" strokeWidth={3} />
          )}
          <circle
            cx={L.handle.x}
            cy={L.handle.y}
            r={13}
            fill={REL_COLOR[spec.type]}
            stroke="var(--surface)"
            strokeWidth={3}
            pointerEvents="none"
          />
          {/* area sentuh 56px (desain.md §3) */}
          <circle
            cx={L.handle.x}
            cy={L.handle.y}
            r={28}
            fill="transparent"
            role="slider"
            tabIndex={0}
            aria-label="Geser untuk mengubah besar sudut"
            aria-valuemin={1}
            aria-valuemax={spec.type === 'complementary' ? 89 : 179}
            aria-valuenow={spec.a}
            style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', outline: 'none' }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
            }}
            onPointerMove={onMove}
            onPointerUp={() => {
              setDragging(false);
              onChangeEnd?.(spec.a);
            }}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={onKey}
          />
        </g>
      )}
    </svg>
  );
}
