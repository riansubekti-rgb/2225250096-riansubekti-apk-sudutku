import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../data/session';
import { formatCode } from '../domain/profile/studentCode';
import { AVATARS, loadMyStats, updateMyProfile, type MyStats } from '../features/profile/profileData';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { useVoice } from '../components/mascot/voiceStore';
import { useMusic } from '../components/music/musicStore';

/** Profil siswa: avatar, nama panggilan, kode, statistik belajar, pengaturan suara/musik, keluar. */
export function ProfilPage() {
  const navigate = useNavigate();
  const { profile, logout } = useSession();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [name, setName] = useState(profile?.nickname ?? '');
  const [saved, setSaved] = useState(false);
  const voice = useVoice();
  const music = useMusic();

  useEffect(() => {
    void loadMyStats().then(setStats);
  }, []);

  if (!profile) return null;
  const avatar = profile.avatar ?? '🦊';

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await updateMyProfile({ nickname: name });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  const tiles: [string, string, string][] = stats
    ? [
        ['📝', String(stats.answered), 'soal dijawab'],
        ['✅', stats.correctPct === null ? '–' : `${stats.correctPct}%`, 'jawaban benar'],
        ['⭐', `${stats.badges}/6`, 'lencana'],
        ['🌏', String(stats.missions), 'misi selesai'],
        ['⏱️', `${stats.minutes}`, 'menit belajar'],
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <section
        className="flex items-center gap-4 rounded-card p-4 shadow-sm"
        style={{ background: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))', color: 'var(--on-hero)' }}
      >
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-5xl" aria-hidden>
          {avatar}
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold">{profile.nickname}</p>
          <p className="text-sm opacity-90">Kelas {profile.classCode}</p>
          <p className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 font-bold tracking-widest">
            {formatCode(profile.studentCode)}
          </p>
        </div>
      </section>

      <MascotBubble mood="wink" size={48}>
        Ini profilmu! Catat kode siswamu, ya. Kode itu kunci untuk melanjutkan belajar di HP mana pun.
      </MascotBubble>

      <section className="card">
        <h2 className="mb-2 font-bold">Statistik belajarku</h2>
        <div className="grid grid-cols-3 gap-2">
          {tiles.map(([icon, value, label]) => (
            <div key={label} className="flex flex-col items-center rounded-card bg-bg p-2 text-center">
              <span aria-hidden className="text-xl">
                {icon}
              </span>
              <span className="text-xl font-bold tabular-nums">{value}</span>
              <span className="text-xs leading-tight text-ink-muted">{label}</span>
            </div>
          ))}
        </div>
        <Link to="/progres" className="btn-secondary mt-3 w-full">
          ⭐ Lihat progres &amp; lencana
        </Link>
      </section>

      <section className="card">
        <h2 className="mb-2 font-bold">Pilih avatar</h2>
        <div role="radiogroup" aria-label="Pilih avatar" className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={a === avatar}
              aria-label={`Avatar ${a}`}
              onClick={() => void updateMyProfile({ avatar: a })}
              className={`flex aspect-square items-center justify-center rounded-full border-2 text-2xl ${
                a === avatar ? 'border-accent bg-surface' : 'border-transparent bg-bg'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={(e) => void saveName(e)} className="card flex flex-col gap-2">
        <label htmlFor="nama-profil" className="font-bold">
          Nama panggilan
        </label>
        <div className="flex gap-2">
          <input
            id="nama-profil"
            value={name}
            maxLength={12}
            onChange={(e) => setName(e.target.value)}
            className="min-h-touch min-w-0 flex-1 rounded-card border-2 border-line bg-bg px-3"
          />
          <button type="submit" className="btn-primary px-4" disabled={!name.trim() || name.trim() === profile.nickname}>
            {saved ? '✓ Tersimpan' : 'Simpan'}
          </button>
        </div>
        <p className="text-xs text-ink-muted">Cukup nama panggilan, bukan nama lengkap.</p>
      </form>

      <section className="card divide-y divide-line">
        <label className="flex min-h-touch cursor-pointer items-center justify-between gap-3 py-2">
          <span>🔊 Suara Busu</span>
          <input type="checkbox" checked={voice.enabled} onChange={(e) => voice.setEnabled(e.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
        </label>
        <label className="flex min-h-touch cursor-pointer items-center justify-between gap-3 py-2">
          <span>🎵 Musik latar</span>
          <input type="checkbox" checked={music.enabled} onChange={(e) => music.setEnabled(e.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
        </label>
      </section>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => void logout('switch').then(() => navigate('/masuk', { replace: true }))}
      >
        Keluar &amp; ganti siswa
      </button>
    </div>
  );
}
