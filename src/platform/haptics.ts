/** Getaran halus (mis. saat sudut melewati 90°). Diabaikan bila tidak didukung. */
export function tick(ms = 10): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* tidak didukung — abaikan */
  }
}
