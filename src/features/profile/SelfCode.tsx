import { useState, type FormEvent } from 'react';
import { CLASS_LETTERS, formatCode, makeStudentCode } from '../../domain/profile/studentCode';
import { makeRng } from '../../domain/random';
import { createProfile, findProfile } from '../../data/profiles';
import { copyText } from '../../platform/clipboard';
import { MascotBubble } from '../../components/mascot/MascotBubble';
import type { Profile } from '../../data/db';

const LETTERS = CLASS_LETTERS.slice(0, 8).split(''); // A–H cukup untuk satu sekolah

function randomSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]!;
}

/** Kode acak yang belum dipakai profil lain di HP ini. */
async function freshCode(cls: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const c = makeStudentCode(cls, makeRng(randomSeed()));
    if (!(await findProfile(c))) return c;
  }
  throw new Error('gagal membuat kode unik');
}

/**
 * Siswa membuat kode sendiri (D23): pilih huruf kelas + nama panggilan → kode acak unik.
 * Siswa WAJIB menyatakan sudah mencatat kodenya sebelum masuk, agar tidak membuat kode baru
 * di pertemuan berikutnya (data pretest–posttest harus satu kode). Profil ditandai `selfCreated`.
 */
export function SelfCode({ onCancel, onDone }: { onCancel: () => void; onDone: (p: Profile) => void }) {
  const [cls, setCls] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [made, setMade] = useState<Profile | null>(null);
  const [noted, setNoted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    if (!cls || !nickname.trim() || busy) return;
    setBusy(true);
    const code = await freshCode(cls);
    setMade(await createProfile(code, nickname, { selfCreated: true }));
    setBusy(false);
  };

  if (made) {
    const pretty = formatCode(made.studentCode);
    return (
      <div className="flex flex-col gap-4">
        <MascotBubble mood="proud" size={72}>
          {`Yeay, ini kode siswamu, ${made.nickname}! Tulis di buku atau foto layarnya, ya. Kode ini dipakai setiap kali kamu masuk.`}
        </MascotBubble>
        <div className="card flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">Kode siswamu</p>
          <p className="rounded-card border-4 border-dashed border-accent px-6 py-3 text-4xl font-bold tracking-[0.2em]" aria-label={`Kode siswamu ${pretty.split('').join(' ')}`}>
            {pretty}
          </p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void copyText(pretty).then((ok) => setCopied(ok))}
          >
            {copied ? '✓ Tersalin' : '📋 Salin kode'}
          </button>
          <label className="flex min-h-touch cursor-pointer items-center gap-3 text-left font-bold">
            <input type="checkbox" checked={noted} onChange={(e) => setNoted(e.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
            Aku sudah mencatat kodeku
          </label>
          <button type="button" className="btn-primary w-full" disabled={!noted} onClick={() => onDone(made)}>
            Masuk & mulai belajar →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void create(e)} className="flex flex-col gap-4">
      <MascotBubble mood="cheer" size={72}>
        Ayo buat kode siswamu sendiri! Pilih huruf kelasmu dan tulis nama panggilanmu.
      </MascotBubble>
      <div className="card flex flex-col gap-3">
        <p className="font-bold">Huruf kelasmu</p>
        <div role="radiogroup" aria-label="Huruf kelasmu" className="grid grid-cols-4 gap-2">
          {LETTERS.map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={cls === l}
              onClick={() => setCls(l)}
              className={`min-h-touch rounded-card border-2 text-xl font-bold ${cls === l ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface'}`}
            >
              {l}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-muted">Tidak tahu huruf kelasmu? Tanyakan ke guru, ya.</p>
        <label htmlFor="nama-baru" className="font-bold">
          Nama panggilan
        </label>
        <input
          id="nama-baru"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          autoComplete="off"
          className="min-h-touch rounded-card border-2 border-line bg-bg px-4 text-xl"
        />
        <p className="text-xs text-ink-muted">Cukup nama panggilan, bukan nama lengkap.</p>
        <button type="submit" className="btn-primary" disabled={!cls || !nickname.trim() || busy}>
          ✨ Buat kodeku
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Aku sudah punya kode
        </button>
      </div>
    </form>
  );
}
