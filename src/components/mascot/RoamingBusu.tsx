import { useEffect, useState } from 'react';
import { Busu, type BusuMood } from './Busu';

const TOP_MIN = 14; // % tinggi layar
const TOP_MAX = 72;

/**
 * Busu yang mondar-mandir naik-turun di sisi kanan layar setiap beberapa detik agar terasa hidup.
 * Berhenti saat berbicara. Hanya dipakai di layar santai (bukan saat mengerjakan soal).
 * Mati bila siswa memilih "kurangi gerakan".
 */
export function RoamingBusu({
  talking,
  mood,
  onTap,
  label,
}: {
  talking: boolean;
  mood: BusuMood;
  onTap: () => void;
  label: string;
}) {
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const [top, setTop] = useState(30);
  const [walking, setWalking] = useState(false);

  useEffect(() => {
    if (talking || reduce) return;
    let alive = true;
    let t = 0;
    const wander = () => {
      // diam 2,5–5 detik, lalu jalan ke posisi baru (selisih ≥ 18%)
      t = window.setTimeout(() => {
        if (!alive) return;
        setTop((prev) => {
          let next = prev;
          while (Math.abs(next - prev) < 18) next = TOP_MIN + Math.random() * (TOP_MAX - TOP_MIN);
          return next;
        });
        setWalking(true);
        t = window.setTimeout(() => {
          if (!alive) return;
          setWalking(false);
          wander();
        }, 2200);
      }, 2500 + Math.random() * 2500);
    };
    wander();
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, [talking, reduce]);

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={label}
      className="fixed right-1 z-40 rounded-full"
      style={{
        top: `${top}%`,
        transition: reduce ? undefined : 'top 2.2s ease-in-out',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.18))',
      }}
    >
      <span className={walking && !talking ? 'busu-walk block' : 'block'}>
        <Busu mood={talking ? mood : walking ? 'wink' : 'happy'} size={76} talking={talking} />
      </span>
    </button>
  );
}
