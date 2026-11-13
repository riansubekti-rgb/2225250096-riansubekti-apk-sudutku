import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { BusuIntro } from '../components/mascot/BusuIntro';
import { MascotBubble } from '../components/mascot/MascotBubble';
import { CODE_SHAPE, formatCode, isExampleCode, isValidStudentCode, normalizeCode } from '../domain/profile/studentCode';
import { createProfile, findProfile } from '../data/profiles';
import { useSession } from '../data/session';
import type { Profile } from '../data/db';
import { SelfCode } from '../features/profile/SelfCode';
import { getResearch } from '../data/research';

type Step = { kind: 'code' } | { kind: 'self' } | { kind: 'nickname'; code: string } | { kind: 'confirm'; profile: Profile };

/**
 * Masuk dengan MENGETIK kode siswa (bukan memilih dari daftar) agar tidak salah masuk ke profil teman
 * di ponsel yang dipakai bergantian (D12).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { profile, login } = useSession();
  const [step, setStep] = useState<Step>({ kind: 'code' });
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [allowSelf, setAllowSelf] = useState(false);

  useEffect(() => {
    void getResearch().then((r) => setAllowSelf(r.allowSelfCode));
  }, []);

  if (profile) return <Navigate to="/" replace />;

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    const c = normalizeCode(code);
    if (isExampleCode(c)) {
      setError('Itu hanya contoh bentuk kode. Ketik kode yang tertulis di kartu dari gurumu, ya.');
      return;
    }
    if (!isValidStudentCode(c)) {
      setError(`Kode "${c ? formatCode(c) : '…'}" belum tepat. Cek lagi kartumu, ya.`);
      return;
    }
    setError('');
    const existing = await findProfile(c);
    setStep(existing ? { kind: 'confirm', profile: existing } : { kind: 'nickname', code: c });
  };

  const submitNickname = async (e: FormEvent) => {
    e.preventDefault();
    if (step.kind !== 'nickname' || !nickname.trim()) return;
    const p = await createProfile(step.code, nickname);
    await login(p);
    navigate('/', { replace: true });
  };

  const confirm = async () => {
    if (step.kind !== 'confirm') return;
    await login(step.profile);
    navigate('/', { replace: true });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 pt-2">
      {step.kind === 'code' && (
        <>
          <BusuIntro />
          <form onSubmit={submitCode} className="card flex flex-col gap-3">
            <label htmlFor="kode" className="font-bold">
              Ketik kode siswamu
            </label>
            <input
              id="kode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder={CODE_SHAPE}
              className="min-h-touch rounded-card border-2 border-line bg-bg px-4 text-center text-2xl font-bold tracking-[0.3em] uppercase"
              aria-describedby="kode-help"
            />
            <p id="kode-help" className="text-sm text-ink-muted">
              Ketik 6 huruf/angka dari <b>kartu kode</b> atau kode yang pernah kamu buat.
            </p>
            {error && (
              <p role="alert" className="text-sm font-bold" style={{ color: 'var(--ask)' }}>
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary" disabled={!code}>
              Masuk
            </button>
            {allowSelf && (
              <button type="button" className="btn-secondary" onClick={() => setStep({ kind: 'self' })}>
                ✨ Belum punya kode? Buat kode sendiri
              </button>
            )}
          </form>
          <Link to="/peneliti" className="mx-auto py-3 text-sm text-ink-muted underline">
            Mode Peneliti
          </Link>
        </>
      )}

      {step.kind === 'self' && (
        <SelfCode
          onCancel={() => setStep({ kind: 'code' })}
          onDone={(p) => void login(p).then(() => navigate('/', { replace: true }))}
        />
      )}

      {step.kind === 'nickname' && (
        <form onSubmit={submitNickname} className="flex flex-col gap-4">
          <MascotBubble mood="cheer" size={72}>
            Senang bertemu kamu! Siapa nama panggilanmu?
          </MascotBubble>
          <div className="card flex flex-col gap-3">
            <label htmlFor="nama" className="font-bold">
              Nama panggilan
            </label>
            <input
              id="nama"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              autoComplete="off"
              className="min-h-touch rounded-card border-2 border-line bg-bg px-4 text-xl"
            />
            <p className="text-sm text-ink-muted">Cukup nama panggilan saja, bukan nama lengkap.</p>
            <button type="submit" className="btn-primary" disabled={!nickname.trim()}>
              Mulai belajar
            </button>
            <button type="button" className="btn-secondary" onClick={() => setStep({ kind: 'code' })}>
              Ganti kode
            </button>
          </div>
        </form>
      )}

      {step.kind === 'confirm' && (
        <div className="flex flex-col gap-4">
          <MascotBubble mood="think" size={72}>
            Apakah kamu <b>{step.profile.nickname}</b> ({formatCode(step.profile.studentCode)})?
          </MascotBubble>
          <button type="button" className="btn-primary" onClick={() => void confirm()}>
            Ya, itu aku
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setCode('');
              setStep({ kind: 'code' });
            }}
          >
            Bukan, ganti kode
          </button>
        </div>
      )}
    </div>
  );
}
