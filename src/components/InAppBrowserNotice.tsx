import { isInAppBrowser } from '../platform/browserEnv';

/** Link sering dibagikan via WhatsApp → arahkan siswa membuka di Chrome (architecture.md §9). */
export function InAppBrowserNotice() {
  if (!isInAppBrowser()) return null;
  return (
    <div role="alert" className="mx-4 mt-3 rounded-card border-2 border-ask bg-surface p-3 text-sm">
      Buka di <b>Chrome</b> agar progresmu tersimpan: ketuk ⋮ di pojok kanan atas, lalu pilih{' '}
      <b>Buka di Chrome</b>.
    </div>
  );
}
