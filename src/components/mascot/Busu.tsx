import { useState } from 'react';

/**
 * Busu — maskot SudutKu: busur derajat setengah lingkaran (180°).
 * Aturan pemakaian (desain.md §9.2): besar & boleh bergerak hanya di Masuk/Beranda/layar penutup/Tanya Busu;
 * saat mengerjakan soal tampil kecil, diam, dan hanya menyampaikan petunjuk/umpan balik.
 */
export type BusuMood = 'happy' | 'think' | 'cheer' | 'oops' | 'wink' | 'wow' | 'sad' | 'proud';


const LINE = '#3A2E1F';
const BODY = '#FFD166';
const BODY_DARK = '#F4B740';

function Eye({ x, mood }: { x: number; mood: BusuMood }) {
  const left = x < 60;
  if (mood === 'wink' && !left) {
    return <path d={`M ${x - 6} 61 Q ${x} 56 ${x + 6} 61`} fill="none" stroke={LINE} strokeWidth={2.6} strokeLinecap="round" />;
  }
  if (mood === 'proud') {
    // mata bintang
    const pts = Array.from({ length: 10 }, (_, i) => {
      const r = i % 2 === 0 ? 7 : 3;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      return `${x + r * Math.cos(a)},${60 + r * Math.sin(a)}`;
    }).join(' ');
    return <polygon points={pts} fill={LINE} />;
  }
  if (mood === 'cheer') {
    return <path d={`M ${x - 6} 62 Q ${x} 54 ${x + 6} 62`} fill="none" stroke={LINE} strokeWidth={2.6} strokeLinecap="round" />;
  }
  const look = mood === 'think' ? { dx: 1.5, dy: -2.5 } : mood === 'sad' ? { dx: 0, dy: 1.5 } : { dx: 0, dy: 0 };
  const ry = mood === 'wow' ? 9.5 : 8;
  return (
    <g>
      <ellipse cx={x} cy={60} rx={7} ry={ry} fill="#fff" stroke={LINE} strokeWidth={2} />
      <circle cx={x + look.dx} cy={61 + look.dy} r={mood === 'wow' ? 2.6 : 3.6} fill={LINE} />
      <circle cx={x + look.dx + 1.3} cy={59.6 + look.dy} r={1.2} fill="#fff" />
    </g>
  );
}

function Mouth({ mood, talking }: { mood: BusuMood; talking: boolean }) {
  if (talking) {
    // mulut membuka-menutup saat Busu berbicara
    return <ellipse className="busu-talk" cx={60} cy={73} rx={5} ry={4} fill={LINE} />;
  }
  switch (mood) {
    case 'cheer':
    case 'proud':
      return <path d="M50 69 Q60 83 70 69 Z" fill={LINE} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />;
    case 'think':
      return <path d="M54 73 L66 71" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />;
    case 'oops':
      return <ellipse cx={60} cy={73} rx={3.5} ry={4.5} fill={LINE} />;
    case 'wow':
      return <ellipse cx={60} cy={74} rx={4.5} ry={5.5} fill={LINE} />;
    case 'sad':
      return <path d="M52 75 Q60 69 68 75" fill="none" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />;
    case 'wink':
      return <path d="M51 70 Q60 79 69 70" fill="none" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />;
    default:
      return <path d="M52 71 Q60 78 68 71" fill="none" stroke={LINE} strokeWidth={2.5} strokeLinecap="round" />;
  }
}

/** jeda acak per Busu agar beberapa Busu di layar tidak bergerak serempak */
let seq = 0;

export function Busu({
  mood = 'happy',
  size = 72,
  bob = false,
  talking = false,
}: {
  mood?: BusuMood;
  size?: number;
  /** (lama) diabaikan — Busu kini selalu bergerak sendiri sesekali */
  bob?: boolean;
  talking?: boolean;
}) {
  void bob;
  const [delay] = useState(() => `${-((seq++ * 1.7) % 6).toFixed(1)}s`);
  // Busu besar melompat & bergoyang sesekali; Busu kecil (di balon soal) hanya memiringkan badan
  // agar tetap hidup tanpa terlalu mengganggu konsentrasi.
  const idle = size > 60 ? 'busu-idle' : 'busu-idle-sm';
  const c = { x: 60, y: 84 };
  const ticks = [0, 30, 60, 90, 120, 150, 180].map((d) => {
    const r = (d * Math.PI) / 180;
    return { x1: c.x + 43 * Math.cos(r), y1: c.y - 43 * Math.sin(r), x2: c.x + 50 * Math.cos(r), y2: c.y - 50 * Math.sin(r) };
  });
  const armsUp = mood === 'cheer' || mood === 'proud';

  return (
    <svg
      viewBox="0 0 120 100"
      width={size}
      height={(size * 100) / 120}
      role="img"
      aria-label="Busu, si busur derajat"
      className={talking ? 'busu-hop' : idle}
      style={talking ? undefined : { animationDelay: delay }}
    >
      {armsUp && (
        <g stroke={LINE} strokeWidth={3} strokeLinecap="round">
          <line x1={16} y1={68} x2={5} y2={46} />
          <line x1={104} y1={68} x2={115} y2={46} />
          <circle cx={5} cy={44} r={4} fill={BODY} />
          <circle cx={115} cy={44} r={4} fill={BODY} />
        </g>
      )}
      {mood === 'think' && (
        <g stroke={LINE} strokeWidth={3} strokeLinecap="round">
          <line x1={104} y1={70} x2={92} y2={62} />
          <circle cx={90} cy={61} r={4} fill={BODY} />
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
      <circle cx={35} cy={71} r={4.5} fill="#FF8FA3" opacity={mood === 'proud' || mood === 'wink' ? 0.8 : 0.55} />
      <circle cx={85} cy={71} r={4.5} fill="#FF8FA3" opacity={mood === 'proud' || mood === 'wink' ? 0.8 : 0.55} />
      {/* alis */}
      {(mood === 'oops' || mood === 'sad') && (
        <g stroke={LINE} strokeWidth={2.2} strokeLinecap="round">
          <line x1={39} y1={mood === 'sad' ? 50 : 47} x2={51} y2={mood === 'sad' ? 47 : 50} />
          <line x1={81} y1={mood === 'sad' ? 50 : 47} x2={69} y2={mood === 'sad' ? 47 : 50} />
        </g>
      )}
      {mood === 'wow' && (
        <g stroke={LINE} strokeWidth={2.2} strokeLinecap="round">
          <line x1={40} y1={46} x2={51} y2={45} />
          <line x1={69} y1={45} x2={80} y2={46} />
        </g>
      )}
      <Eye x={46} mood={mood} />
      <Eye x={74} mood={mood} />
      <Mouth mood={mood} talking={talking} />
      {mood === 'sad' && <ellipse cx={34} cy={66} rx={2} ry={3} fill="#7FC8F8" />}
    </svg>
  );
}
