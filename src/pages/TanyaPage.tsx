import { TanyaBusu } from '../features/assistant/TanyaBusu';

/** Halaman penuh Tanya Busu (dibuka dari Beranda). */
export function TanyaPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TanyaBusu />
    </div>
  );
}
