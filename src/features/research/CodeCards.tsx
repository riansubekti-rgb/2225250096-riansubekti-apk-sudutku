import { useEffect, useState } from 'react';
import { CLASS_LETTERS, formatCode, generateCodes } from '../../domain/profile/studentCode';
import { makeRng } from '../../domain/random';
import { getCodeSheet, saveCodeSheet } from '../../data/research';
import { deliverFile } from '../../platform/share';
import { toCsv } from '../../data/export';

function randomSeed(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0]!;
}

/**
 * Kartu kode siswa ACAK (D22). Daftar kode tersimpan per kelas sehingga mencetak ulang selalu
 * menghasilkan kode yang sama; menambah kode tidak mengubah kode yang sudah dibagikan.
 * Pasangan kode ↔ nama siswa dicatat peneliti DI LUAR aplikasi (unduh CSV).
 */
export function CodeCards() {
  const [cls, setCls] = useState('A');
  const [count, setCount] = useState(30);
  const [codes, setCodes] = useState<string[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    void getCodeSheet(cls).then(setCodes);
  }, [cls]);

  const add = async () => {
    const fresh = generateCodes(cls, count, makeRng(randomSeed()), codes);
    const next = [...codes, ...fresh];
    await saveCodeSheet(cls, next);
    setCodes(next);
    setShow(true);
  };

  const download = () => {
    const csv = toCsv(
      ['no', 'kelas', 'kode_siswa', 'nama_siswa_diisi_peneliti'],
      codes.map((c, i) => [i + 1, cls, formatCode(c), '']),
    );
    void deliverFile(new Blob([csv], { type: 'text/csv' }), `kode-siswa-kelas-${cls}.csv`);
  };

  return (
    <section className="card flex flex-col gap-2">
      <p className="font-bold">Kartu kode siswa (acak)</p>
      <p className="text-sm text-ink-muted">
        Setiap siswa mendapat 1 kode acak, mis. <b>AK7-QM2</b>. Kode tersimpan di HP ini; mencetak ulang tidak mengubah kode.
      </p>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 text-sm">
          Huruf kelas
          <input
            value={cls}
            maxLength={1}
            aria-label="Huruf kelas"
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              if (CLASS_LETTERS.includes(v) && v.length === 1) setCls(v);
            }}
            className="min-h-touch w-14 rounded-card border-2 border-line bg-surface text-center font-bold"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Jumlah
          <input
            type="number"
            min={1}
            max={99}
            value={count}
            aria-label="Jumlah kode"
            onChange={(e) => setCount(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
            className="min-h-touch w-20 rounded-card border-2 border-line bg-surface text-center font-bold"
          />
        </label>
      </div>
      <p className="text-sm">
        Kelas <b>{cls}</b>: {codes.length} kode tersimpan.
      </p>
      <button type="button" className="btn-primary" onClick={() => void add()}>
        {codes.length ? `➕ Tambah ${count} kode acak` : `🎲 Buat ${count} kode acak`}
      </button>
      {codes.length > 0 && (
        <>
          <button type="button" className="btn-secondary" onClick={() => setShow((s) => !s)}>
            {show ? 'Sembunyikan' : 'Tampilkan'} kartu kode
          </button>
          <button type="button" className="btn-secondary" onClick={download}>
            ⬇️ Unduh daftar kode (CSV untuk mencatat nama siswa)
          </button>
        </>
      )}
      {show && codes.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 print:grid-cols-4">
            {codes.map((c, i) => (
              <div key={c} className="rounded-card border-2 border-dashed border-line p-2 text-center">
                <p className="text-xs text-ink-muted">
                  SudutKu · Kelas {cls} · No. {i + 1}
                </p>
                <p className="text-xl font-bold tracking-widest">{formatCode(c)}</p>
              </div>
            ))}
          </div>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            🖨️ Cetak kartu
          </button>
        </>
      )}
    </section>
  );
}
