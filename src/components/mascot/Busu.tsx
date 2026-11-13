/**
 * Busu — maskot SudutKu: busur derajat setengah lingkaran (180°).
 * Aturan pemakaian (desain.md §9.2): besar & boleh bergerak hanya di Beranda/layar penutup;
 * saat mengerjakan soal tampil kecil, diam, dan hanya menyampaikan petunjuk/umpan balik.
 */
export type BusuMood = 'happy' | 'think' | 'cheer' | 'oops';

const LINE = '#3A2E1F';
const BODY = '#FFD166';
const BODY_DARK = '#F4B740';

export function Busu({ mood = 'happy', size = 72, bob = false }: { mood?: BusuMood; size?: number; bob?: boolean }) {
  const c = { x: 60, y: 84 };
  const ticks = [0, 30, 60, 90, 120, 150, 180].map((d) => {
    const r = (d * Math.PI) / 180;
    return { x1: c.x + 43 * Math.cos(r), y1: c.y - 43 * Math.sin(r), x2: c.x + 50 * Math.cos(r), y2: c.y - 50 * Math.sin(r) };
  });
  const look = mood === 'think' ? { dx: 1.5, dy: -2.5 } : { dx: 0, dy: 0 };

  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={(size * 100) / 120}
      role="img"
      aria-label="Busu, si busur derajat"
      className={bob ? 'busu-bob' : undefined}
    >
      {mood === 'cheer' && (
        <g stroke={LINE} strokeWidth={3} strokeLinecap="round">
          <line x1={16} y1={68} x2={5} y2={46} />
          <line x1={104} y1={68} x2={115} y2={46} />
          <circle cx={5} cy={44} r={4} fill={BODY} />
          <circle cx={115} cy={44} r={4} fill={BODY} />
        </g>
      )}
      {/* kaki */}
      <ellipse cx={44} cy={92} rx={9} ry={4.5} fill={BODY_DARK} stroke={LINE} strokeWidth={2.5} />
      <ellipse cx={76} cy={92} rx={9} ry={4.5} fill={BODY_DARK} stroke={LINE} strokeWidth={2.5} />
      {/* badan setengah lingkaran */}
      <path d="M10 84 A50 50 0 0 1 110 84 Z" fill={BODY} stroke={LINE} strokeWidth={3} strokeLinejoin="round" />
      <path d="M22 84 A38 38 0 0 1 98 84" fill="none" stroke={BODY_DARK} strokeWidth={2} />
      {ticks.map((t, i) => (
        <line key={i} {...t} stroke={LINE} strokeWidth={2} strokeLinecap="round" />
      ))}
      <rect x={8} y={82} width={104} height={6} rx={3} fill={BODY_DARK} stroke={LINE} strokeWidth={2.5} />
      {/* pipi */}
      <circle cx={35} cy={71} r={4.5} fill="#FF8FA3" opacity={0.55} />
      <circle cx={85} cy={71} r={4.5} fill="#FF8FA3" opacity={0.55} />
      {/* mata */}
      {[46, 74].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={60} rx={7} ry={8} fill="#fff" stroke={LINE} strokeWidth={2} />
          <circle cx={x + look.dx} cy={61 + look.dy} r={3.6} fill={LINE} />
          <circle cx={x + look.dx + 1.3} cy={59.6 + look.dy} r={1.2} fill="#fff" />
        </g>
      ))}
      {mood === 'oops' && (
        <g stroke={LINE} strokeWidth={2.2} strokeLinecap="round">
          <line x1={39} y1={47} x2={51} y2={50} />
          <line x1={81} y1={47} x2={69} y2={50} />
        </g>
      )}
      {/* mulut */}
      {mood === 'happy' && <path d="M52 71 Q60 78 68 71" fill="none" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />}
      {mood === 'cheer' && <path d="M50 69 Q60 83 70 69 Z" fill={LINE} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />}
      {mood === 'think' && <path d="M54 73 L66 71" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />}
      {mood === 'oops' && <ellipse cx={60} cy={73} rx={3.5} ry={4.5} fill={LINE} />}
    </svg>
  );
}
