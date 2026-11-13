import { useInstallPrompt } from '../platform/installPrompt';
import { isStandalone } from '../platform/browserEnv';

export function InstallButton() {
  const { available, install } = useInstallPrompt();
  if (isStandalone()) return null;

  if (available) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className="min-h-touch rounded-card bg-accent px-4 font-bold text-on-accent"
      >
        Pasang aplikasi
      </button>
    );
  }
  return (
    <p className="text-sm text-ink-muted">
      Agar bisa dipakai tanpa internet: ketuk ⋮ di Chrome, lalu pilih <b>Tambahkan ke layar utama</b>.
    </p>
  );
}
