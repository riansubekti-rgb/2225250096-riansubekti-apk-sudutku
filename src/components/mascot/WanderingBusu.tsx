import { useEffect, useRef, useState } from 'react';
import { Busu, type BusuMood } from './Busu';

const STEP_MS = 1500; // lama berjalan ke satu titik
const PAUSE_MS = 500; // berhenti sebentar di tiap titik

/**
 * Busu yang punya "rumah" (tempat asalnya di halaman). Setiap 6–10 detik ia keluar berjalan-jalan
 * keliling layar (atas, bawah, kiri, kanan — menghadap arah jalannya), lalu kembali ke rumahnya.
 * Saat berbicara ia pulang & diam. Hanya untuk layar santai (Masuk, Beranda); mati bila
 * siswa memilih "kurangi gerakan".
 */
export function WanderingBusu({
  size,
  mood,
  talking,
  onTap,
  label,
}: {
  size: number;
  mood: BusuMood;
  talking: boolean;
  onTap: () => void;
  label: string;
}) {
  const reduce = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const home = useRef<HTMLDivElement>(null);
  const [roaming, setRoaming] = useState(false);
  const [pos, setPosState] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const setPos = (p: { x: number; y: number }) => {
    posRef.current = p;
    setPosState(p);
  };
  const [faceLeft, setFaceLeft] = useState(false);
  const [walking, setWalking] = useState(false);
  const timers = useRef<number[]>([]);
  const height = (size * 100) / 120;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const homeXY = () => {
    const r = home.current!.getBoundingClientRect();
    return { x: r.left, y: r.top };
  };

  /** Pulang ke rumah lalu kembali tampil di tempat asalnya. */
  const goHome = (after?: () => void) => {
    const h = homeXY();
    setFaceLeft(h.x < posRef.current.x);
    setPos(h);
    setWalking(true);
    later(() => {
      setWalking(false);
      setRoaming(false);
      after?.();
    }, STEP_MS + 50);
  };

  useEffect(() => {
    if (reduce || talking) return;
    clear();
    const schedule = () =>
      later(() => {
        if (!home.current) return;
        const start = homeXY();
        setPos(start);
        setRoaming(true);
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const points = Array.from({ length: 3 }, () => ({
          x: 8 + Math.random() * Math.max(10, vw - size - 16),
          y: 70 + Math.random() * Math.max(10, vh - height - 150),
        }));
        let prev = start;
        points.forEach((p, i) => {
          later(() => {
            setFaceLeft(p.x < prev.x);
            prev = p;
            setWalking(true);
            setPos(p);
            later(() => setWalking(false), STEP_MS);
          }, 60 + i * (STEP_MS + PAUSE_MS));
        });
        later(() => goHome(schedule), 60 + points.length * (STEP_MS + PAUSE_MS));
      }, 6000 + Math.random() * 4000);
    schedule();
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, talking, size]);

  // Mulai bicara saat sedang berjalan-jalan → pulang dulu.
  useEffect(() => {
    if (talking && roaming) {
      clear();
      goHome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talking]);

  const busu = (
    <span className={walking && !talking ? 'busu-walk block' : 'block'} style={{ transform: faceLeft ? 'scaleX(-1)' : undefined }}>
      <Busu mood={talking ? mood : walking ? 'wink' : mood} size={size} talking={talking} />
    </span>
  );

  return (
    <div ref={home} style={{ width: size, height }} className="relative mx-auto shrink-0">
      {!roaming || !pos ? (
        <button key="home" type="button" data-busu onClick={onTap} aria-label={label} className="absolute inset-0 rounded-full active:scale-95">
          {busu}
        </button>
      ) : (
        // key berbeda: elemen baru, agar animasi berangkat dari rumah — bukan dari pojok layar
        <button
          key="roam"
          type="button"
          data-busu
          onClick={onTap}
          aria-label={label}
          className="fixed z-40 rounded-full"
          style={{
            left: pos.x,
            top: pos.y,
            width: size,
            height,
            transition: `left ${STEP_MS}ms ease-in-out, top ${STEP_MS}ms ease-in-out`,
            filter: 'drop-shadow(0 6px 8px rgba(0,0,0,.2))',
          }}
        >
          {busu}
        </button>
      )}
    </div>
  );
}
