import { registerSW } from 'virtual:pwa-register';
import { create } from 'zustand';

/**
 * Daftarkan service worker SEGERA saat aplikasi dibuka (bukan menunggu Beranda), agar halaman Masuk
 * pun langsung tersimpan untuk offline. Status "versi baru" disimpan untuk banner di Beranda.
 */
export const usePwa = create<{ needRefresh: boolean; update: () => void }>(() => ({
  needRefresh: false,
  update: () => {},
}));

export function initPwa(): void {
  if (!('serviceWorker' in navigator)) return;
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => usePwa.setState({ needRefresh: true }),
  });
  usePwa.setState({ update: () => void updateSW(true) });
}
