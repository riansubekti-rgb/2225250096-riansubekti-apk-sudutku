import { useEffect } from 'react';
import { TanyaBusu } from './TanyaBusu';
import { useTanya } from './useTanya';

/**
 * Tanya Busu sebagai lembar melayang di atas halaman belajar: siswa bisa bertanya tanpa
 * meninggalkan soal yang sedang dikerjakan (progres latihan tidak hilang).
 */
export function TanyaSheet() {
  const { open, setOpen } = useTanya();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="Tanya Busu" className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="mx-auto flex h-full w-full max-w-content flex-col px-4" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line">
          <h2 className="flex-1 text-lg font-bold">💬 Tanya Busu</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn-secondary min-h-[40px] px-4 text-sm"
          >
            Tutup ✕
          </button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col pt-3">
          <TanyaBusu />
        </div>
      </div>
    </div>
  );
}
