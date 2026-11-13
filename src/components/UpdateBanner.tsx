import { usePwa } from '../platform/pwa';

/**
 * "Versi baru tersedia" — hanya dirender di Beranda agar tidak memotong siswa di tengah soal
 * (architecture.md §9).
 */
export function UpdateBanner() {
  const { needRefresh, update } = usePwa();
  if (!needRefresh) return null;
  return (
    <div role="status" className="card flex items-center gap-3">
      <p className="flex-1 text-sm">Ada versi baru SudutKu.</p>
      <button type="button" className="btn-primary" onClick={update}>
        Perbarui
      </button>
    </div>
  );
}
