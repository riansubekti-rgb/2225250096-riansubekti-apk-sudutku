import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import raw from '../../content/instruments/access-codes.json';
import { AccessCodesSchema } from '../data/schemas';
import { setResearch } from '../data/research';
import { logEvent } from '../data/log';

const data = AccessCodesSchema.parse(raw);

/**
 * "Kode dari guru": siswa membuka tes/angket di HP-nya sendiri dengan kode yang ditulis guru
 * di papan tulis — tidak perlu peneliti mengatur 30 HP satu per satu.
 */
export function KodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const found = data.codes.find((x) => x.code === c);
    if (!found) {
      setError('Kode tidak dikenal. Cek lagi tulisan di papan, ya.');
      return;
    }
    await setResearch(found.patch);
    await logEvent('access_code', { code: found.code });
    navigate('/', { replace: true });
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mx-auto flex w-full max-w-sm flex-col gap-3 pt-4">
      <label htmlFor="kode-guru" className="text-xl font-bold">
        Ketik kode dari gurumu
      </label>
      <input
        id="kode-guru"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={12}
        className="min-h-touch rounded-card border-2 border-line bg-surface px-4 text-center text-2xl font-bold tracking-widest"
      />
      {error && (
        <p role="alert" className="text-sm font-bold" style={{ color: 'var(--ask)' }}>
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary" disabled={!code}>
        Buka
      </button>
    </form>
  );
}
