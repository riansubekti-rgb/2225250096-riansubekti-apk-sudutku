import { useEffect } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { PUBLIC_PATHS, ROUTES, titleFor } from './routes';
import { InAppBrowserNotice } from '../components/InAppBrowserNotice';
import { TanyaSheet } from '../features/assistant/TanyaSheet';
import { useTanya } from '../features/assistant/useTanya';
import { useVoice } from '../components/mascot/voiceStore';
import { MusicController } from '../components/music/MusicController';
import { useMusic } from '../components/music/musicStore';
import { canSpeak } from '../platform/speech';

/** Halaman belajar yang boleh membuka Tanya Busu (bukan tes/angket/peneliti). */
const ASK_PATHS = ['/pemanasan', '/kenali', '/lab', '/contoh', '/latihan', '/misi', '/progres'];
import { IDLE_MS, useSession } from '../data/session';

/**
 * Kerangka layar: header tipis + konten. Tinggi memakai dvh dan safe-area (desain.md §6).
 * Tombol back Android ditangani lewat History API (react-router).
 */
export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { ready, profile, logout, touch } = useSession();
  useIdleLogout(Boolean(profile), touch, () => {
    void logout('idle').then(() => navigate('/masuk', { replace: true }));
  });

  if (!ready) return null;
  if (!profile && !PUBLIC_PATHS.includes(pathname)) return <Navigate to="/masuk" replace />;

  const title = ROUTES.find((r) => r.path === pathname)?.title ?? titleFor(pathname) ?? 'SudutKu';
  const showBack = pathname !== '/' && pathname !== '/masuk';

  return (
    <div
      className="mx-auto flex min-h-[100dvh] max-w-content flex-col"
      style={{
        paddingTop: 'var(--safe-top)',
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
      }}
    >
      <header className="flex h-14 items-center gap-1 border-b border-line px-2">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-2xl"
            aria-label="Kembali"
          >
            ←
          </button>
        )}
        <h1 className={`flex-1 truncate text-lg font-bold ${showBack ? '' : 'px-2'}`}>{title}</h1>
        {!pathname.startsWith('/tes') && !pathname.startsWith('/angket') && <MusicToggle />}
        {!pathname.startsWith('/tes') && !pathname.startsWith('/angket') && <VoiceToggle />}
        {profile && ASK_PATHS.includes(pathname) && <AskButton />}
        {profile && pathname !== '/profil' && !pathname.startsWith('/tes') && (
          <Link
            to="/profil"
            className="flex min-h-touch items-center gap-1 rounded-full pl-1 pr-2 text-sm"
            aria-label={`Profil ${profile.nickname}`}
          >
            <span aria-hidden className="flex h-8 w-8 items-center justify-center rounded-full bg-bg text-lg">
              {profile.avatar ?? '🦊'}
            </span>
            <span className="max-w-[5.5rem] truncate font-bold text-ink">{profile.nickname}</span>
          </Link>
        )}
      </header>
      <InAppBrowserNotice />
      <TanyaSheet />
      <MusicController />
      <main className="flex flex-1 flex-col px-4 py-4">
        <Outlet />
      </main>
    </div>
  );
}

/** Tutup sesi otomatis setelah 20 menit tanpa sentuhan (ponsel dipakai bergantian, D12). */
function useIdleLogout(active: boolean, touch: () => void, onIdle: () => void) {
  useEffect(() => {
    if (!active) return;
    let timer = window.setTimeout(onIdle, IDLE_MS);
    let lastTouch = 0;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onIdle, IDLE_MS);
      const now = Date.now();
      if (now - lastTouch > 30_000) {
        lastTouch = now;
        touch();
      }
    };
    const evs = ['pointerdown', 'keydown'] as const;
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
    // onIdle sengaja tidak dimasukkan: cukup dipasang ulang saat status login berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

function AskButton() {
  const setOpen = useTanya((s) => s.setOpen);
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-xl"
      aria-label="Tanya Busu"
    >
      💬
    </button>
  );
}

/** Nyala/mati suara Busu — penting di kelas agar 30 HP tidak berbunyi bersamaan. */
function VoiceToggle() {
  const { enabled, setEnabled } = useVoice();
  if (!canSpeak()) return null;
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className="flex min-h-touch min-w-[40px] items-center justify-center rounded-full text-xl"
      aria-label={enabled ? 'Matikan suara Busu' : 'Nyalakan suara Busu'}
      aria-pressed={enabled}
    >
      {enabled ? '🔊' : '🔇'}
    </button>
  );
}

/** Nyala/mati backsound. Musik hanya berbunyi di layar santai (Masuk, Beranda, Progres). */
function MusicToggle() {
  const { enabled, setEnabled } = useMusic();
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      className="flex min-h-touch min-w-[40px] items-center justify-center rounded-full text-xl"
      aria-label={enabled ? 'Matikan musik' : 'Nyalakan musik'}
      aria-pressed={enabled}
    >
      {enabled ? '🎵' : '🔕'}
    </button>
  );
}
