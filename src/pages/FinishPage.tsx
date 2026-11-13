import { useNavigate } from 'react-router-dom';
import { Busu } from '../components/mascot/Busu';
import { useSession } from '../data/session';

/** "Selesai & Ganti Siswa" (prd.md F12): tutup sesi agar progres tidak tercampur. */
export function FinishPage() {
  const navigate = useNavigate();
  const { profile, logout } = useSession();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 pt-4 text-center">
      <Busu mood="cheer" size={130} />
      <p className="text-2xl font-bold">Kerja bagus, {profile?.nickname}!</p>
      <p className="text-ink-muted">Progresmu sudah tersimpan di HP ini. Kamu bisa lanjut lagi nanti dengan kode yang sama.</p>
      <div className="mt-2 flex w-full flex-col gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void logout('switch').then(() => navigate('/masuk', { replace: true }))}
        >
          Keluar &amp; ganti siswa
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
          Batal, lanjut belajar
        </button>
      </div>
    </div>
  );
}
