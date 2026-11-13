import { arcPath, polar } from '../domain/geometry/figure';

export type BasicAngleSpec = { kind: 'angle'; deg: number; label?: string } | { kind: 'right' } | { kind: 'straight' };

/** Gambar satu sudut untuk Pemanasan (istilah dasar, P7). Warna netral — belum ada hubungan sudut. */
export function BasicAngle({ spec }: { spec: BasicAngleSpec }) {
  // Sudut lurus memanjang ke dua arah → pusat di tengah; lainnya hanya ke kanan → geser ke kiri.
  const c = { x: spec.kind === 'straight' ? 160 : 110, y: 160 };
  const R = 120;
  const deg = spec.kind === 'angle' ? spec.deg : spec.kind === 'right' ? 90 : 180;
  const end = polar(c, R, deg);
  const desc =
    spec.kind === 'right' ? 'Sudut siku-siku dengan tanda kotak kecil' : spec.kind === 'straight' ? 'Sudut lurus berupa garis lurus' : `Sudut ${spec.label ?? ''}`;
  const label = spec.kind === 'angle' ? spec.label : spec.kind === 'right' ? '90°' : '180°';
  const lp = polar(c, 62, deg / 2);
  return (
    <svg viewBox="0 0 320 200" className="mx-auto block h-auto w-full max-w-[380px]" role="img" aria-label={desc}>
      {spec.kind !== 'right' && (
        <path d={arcPath(c, 40, 0, deg)} fill="none" stroke="var(--accent)" strokeWidth={3} />
      )}
      {spec.kind === 'right' && (
        <path d={`M ${c.x + 18} ${c.y} L ${c.x + 18} ${c.y - 18} L ${c.x} ${c.y - 18}`} fill="none" stroke="var(--accent)" strokeWidth={3} />
      )}
      <line x1={c.x} y1={c.y} x2={c.x + R} y2={c.y} stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
      <line x1={c.x} y1={c.y} x2={end.x} y2={end.y} stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={c.x} cy={c.y} r={4.5} fill="var(--ask)" />
      {spec.kind === 'angle' && !spec.label && (
        <text x={c.x - 6} y={c.y + 24} textAnchor="middle" fontSize={14} fill="var(--ink-muted)">
          titik sudut
        </text>
      )}
      {label && (
        <text
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={18}
          fontWeight={700}
          fill="var(--accent)"
          stroke="var(--bg)"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </svg>
  );
}
