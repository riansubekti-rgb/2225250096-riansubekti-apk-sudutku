/** Pengganti modul virtual vite-plugin-pwa saat tes (tidak ada service worker di jsdom). */
export function registerSW() {
  return async () => {};
}
