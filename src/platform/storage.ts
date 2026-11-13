/** Penyimpanan persisten agar IndexedDB tidak dikosongkan browser (prd.md F12, risiko data hilang). */
export type PersistResult = 'granted' | 'denied' | 'unsupported';

let lastResult: PersistResult | null = null;

export async function requestPersistentStorage(): Promise<PersistResult> {
  try {
    if (!navigator.storage?.persist) return (lastResult = 'unsupported');
    if (await navigator.storage.persisted()) return (lastResult = 'granted');
    return (lastResult = (await navigator.storage.persist()) ? 'granted' : 'denied');
  } catch {
    return (lastResult = 'unsupported');
  }
}

/** Hasil terakhir — dicatat ke meta.json saat ekspor. */
export function getPersistResult(): PersistResult | null {
  return lastResult;
}
