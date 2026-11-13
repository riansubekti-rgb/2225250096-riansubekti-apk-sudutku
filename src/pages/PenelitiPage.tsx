import { useEffect, useState, type FormEvent } from 'react';
import { checkPin, getResearch, hasPin, setPin, setResearch, type ResearchState } from '../data/research';
import { buildExportZip } from '../data/export';
import { deliverFile } from '../platform/share';
import { getPersistResult } from '../platform/storage';
import { db } from '../data/db';
import { ALL_VALIDATED } from '../features/research/instruments';
import { makeStudentCode } from '../domain/profile/studentCode';
import codesRaw from '../../content/instruments/access-codes.json';
import { AccessCodesSchema } from '../data/schemas';

const ACCESS = AccessCodesSchema.parse(codesRaw);

/** Mode Peneliti (F13): dilindungi PIN; buka/kunci instrumen, pertemuan, ekspor data, kartu kode. */
export function PenelitiPage() {
  const [stage, setStage] = useState<'loading' | 'create' | 'enter' | 'open'>('loading');
  useEffect(() => {
    void hasPin().then((h) => setStage(h ? 'enter' : 'create'));
  }, []);

  if (stage === 'loading') return null;
  if (stage !== 'open') return <PinForm create={stage === 'create'} onOk={() => setStage('open')} />;
  return <Dashboard />;
}

function PinForm({ create, onOk }: { create: boolean; onOk: () => void }) {
  const [pin, setPinValue] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (create) {
      if (!/^\d{4,8}$/.test(pin)) return setError('PIN harus 4–8 angka.');
      if (pin !== pin2) return setError('PIN tidak sama.');
      await setPin(pin);
      onOk();
    } else if (await checkPin(pin)) onOk();
    else setError('PIN salah.');
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto flex w-full max-w-sm flex-col gap-3 pt-4">
      <p className="text-xl font-bold">{create ? 'Buat PIN peneliti' : 'Masukkan PIN peneliti'}</p>
      {create && <p className="text-sm text-ink-muted">PIN ini hanya untuk peneliti/guru. Jangan beri tahu siswa.</p>}
      <input
        type="password"
        inputMode="numeric"
        autoComplete="off"
        aria-label="PIN"
        value={pin}
        onChange={(e) => setPinValue(e.target.value)}
        className="min-h-touch rounded-card border-2 border-line bg-surface px-4 text-center text-2xl tracking-[0.4em]"
      />
      {create && (
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          aria-label="Ulangi PIN"
          placeholder="Ulangi PIN"
          value={pin2}
          onChange={(e) => setPin2(e.target.value)}
          className="min-h-touch rounded-card border-2 border-line bg-surface px-4 text-center text-2xl tracking-[0.4em]"
        />
      )}
      {error && (
        <p role="alert" className="text-sm font-bold" style={{ color: 'var(--ask)' }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary">
        {create ? 'Simpan PIN' : 'Buka'}
      </button>
    </form>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-touch cursor-pointer items-center gap-3 py-2">
      <span className="flex-1">
        <span className="block font-bold">{label}</span>
        <span className="block text-sm text-ink-muted">{desc}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-6 w-6 accent-[var(--accent)]" />
    </label>
  );
}

function Dashboard() {
  const [r, setR] = useState<ResearchState | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [lastExport, setLastExport] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [prefix, setPrefix] = useState('A');
  const [count, setCount] = useState(30);
  const [showCards, setShowCards] = useState(false);

  const refresh = async () => {
    setR(await getResearch());
    setCounts({
      siswa: await db.profiles.count(),
      jawaban: await db.attempts.count(),
      tes: await db.assessments.count(),
      angket: await db.questionnaires.count(),
    });
    setLastExport(((await db.settings.get('lastExport'))?.value as number | undefined) ?? null);
  };
  useEffect(() => {
    void refresh();
  }, []);

  if (!r) return null;
  const update = async (patch: Partial<ResearchState>) => setR(await setResearch(patch));

  const doExport = async () => {
    setBusy(true);
    setMsg('');
    try {
      const { blob, filename } = await buildExportZip();
      const how = await deliverFile(blob, filename);
      await db.settings.put({ key: 'lastExport', value: Date.now() });
      setMsg(how === 'shared' ? `Terkirim: ${filename}` : `Tersimpan di folder Download: ${filename}`);
      await refresh();
    } catch (e) {
      setMsg(`Gagal mengekspor: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const persisted = getPersistResult();

  return (
    <div className="flex flex-col gap-4">
      {!ALL_VALIDATED && (
        <p role="note" className="rounded-card border-2 p-3 text-sm" style={{ borderColor: 'var(--ask)' }}>
          ⚠️ Sebagian instrumen masih <b>DRAF</b> (belum divalidasi). Ganti isinya sebelum penelitian sebenarnya.
        </p>
      )}

      <section className="card">
        <p className="mb-1 font-bold">Pertemuan</p>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => void update({ meeting: m })}
              className={`btn ${r.meeting === m ? 'bg-accent text-on-accent' : 'border-2 border-line bg-surface'}`}
            >
              Pertemuan {m}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <p className="font-bold">Kode untuk papan tulis</p>
        <p className="mb-2 text-sm text-ink-muted">Siswa mengetik kode ini di Beranda (🔑 Punya kode dari guru?) untuk membuka tes/angket di HP masing-masing.</p>
        <ul className="flex flex-col gap-1 text-sm">
          {ACCESS.codes.map((c) => (
            <li key={c.code} className="flex justify-between gap-2">
              <span className="font-bold tracking-widest">{c.code}</span>
              <span className="text-right text-ink-muted">{c.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card divide-y divide-line">
        <Toggle label="Tes Awal (pretest)" desc="Siswa wajib mengerjakan sebelum materi terbuka." checked={r.pretestOpen} onChange={(v) => void update({ pretestOpen: v })} />
        <Toggle label="Tes Akhir (posttest)" desc="Buka di akhir pertemuan terakhir." checked={r.posttestOpen} onChange={(v) => void update({ posttestOpen: v })} />
        <Toggle label="Angket beban belajar (IL/EL/GL)" desc={`Dicatat untuk pertemuan ${r.meeting}.`} checked={r.clOpen} onChange={(v) => void update({ clOpen: v })} />
        <Toggle label="Angket kemudahan (SUS) + pendapat siswa" desc="Buka setelah tes akhir." checked={r.susOpen} onChange={(v) => void update({ susOpen: v })} />
      </section>

      <section className="card flex flex-col gap-2">
        <p className="font-bold">Data di HP ini</p>
        <p className="text-sm">
          {counts.siswa} siswa · {counts.jawaban} jawaban latihan · {counts.tes} jawaban tes · {counts.angket} jawaban angket
        </p>
        <p className="text-sm text-ink-muted">
          Ekspor terakhir: {lastExport ? new Date(lastExport).toLocaleString('id-ID') : 'belum pernah'} · Penyimpanan
          permanen: {persisted === 'granted' ? 'ya' : persisted === 'denied' ? 'TIDAK — rajin ekspor!' : 'tidak diketahui'}
        </p>
        <button type="button" className="btn-primary" disabled={busy} onClick={() => void doExport()}>
          {busy ? 'Menyiapkan…' : '⬇️ Ekspor data (ZIP berisi CSV)'}
        </button>
        {msg && (
          <p role="status" className="text-sm">
            {msg}
          </p>
        )}
      </section>

      <section className="card flex flex-col gap-2">
        <p className="font-bold">Kartu kode siswa</p>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm">
            Huruf kelas
            <input
              value={prefix}
              maxLength={1}
              onChange={(e) => setPrefix(e.target.value.toUpperCase().replace(/[^A-Z]/g, '') || 'A')}
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
              onChange={(e) => setCount(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
              className="min-h-touch w-20 rounded-card border-2 border-line bg-surface text-center font-bold"
            />
          </label>
        </div>
        <button type="button" className="btn-secondary" onClick={() => setShowCards((s) => !s)}>
          {showCards ? 'Sembunyikan' : 'Tampilkan'} kartu kode
        </button>
        {showCards && (
          <>
            <div className="grid grid-cols-3 gap-2 print:grid-cols-4">
              {Array.from({ length: count }, (_, i) => makeStudentCode(prefix, i + 1)).map((c, i) => (
                <div key={c} className="rounded-card border-2 border-dashed border-line p-2 text-center">
                  <p className="text-xs text-ink-muted">No. {i + 1}</p>
                  <p className="text-xl font-bold tracking-widest">{c}</p>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary" onClick={() => window.print()}>
              🖨️ Cetak
            </button>
          </>
        )}
      </section>
    </div>
  );
}
