import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { music } from '../../platform/music';
import { onSpeakingChange, userHasInteracted } from '../../platform/speech';
import { useMusic } from './musicStore';

/**
 * Musik hanya di layar santai — TIDAK di materi, soal, tes, atau angket
 * (prinsip koherensi: musik latar menambah beban kognitif saat berpikir).
 */
const MUSIC_PATHS = ['/masuk', '/', '/progres', '/selesai', '/kode'];

/** Menyalakan/mematikan backsound sesuai halaman, dan mengecilkannya saat Busu bicara. */
export function MusicController() {
  const { pathname } = useLocation();
  const enabled = useMusic((s) => s.enabled);
  const allowed = enabled && MUSIC_PATHS.includes(pathname);

  useEffect(() => {
    const apply = () => (allowed && document.visibilityState === 'visible' ? music.start() : music.stop());
    if (allowed && !userHasInteracted()) {
      // Aturan browser: suara baru boleh setelah sentuhan pertama.
      window.addEventListener('pointerdown', apply, { once: true });
    } else apply();
    document.addEventListener('visibilitychange', apply);
    return () => {
      window.removeEventListener('pointerdown', apply);
      document.removeEventListener('visibilitychange', apply);
    };
  }, [allowed]);

  useEffect(() => onSpeakingChange((speaking) => music.duck(speaking)), []);

  return null;
}
