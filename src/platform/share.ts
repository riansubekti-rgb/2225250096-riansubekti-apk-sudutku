/** Kirim file ekspor: Web Share (files) bila didukung, jika tidak unduh ke folder Download. */
export async function deliverFile(blob: Blob, filename: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename });
      return 'shared';
    }
  } catch (err) {
    // Pengguna membatalkan dialog berbagi → tetap sediakan unduhan sebagai cadangan.
    if ((err as DOMException)?.name !== 'AbortError') console.warn('share gagal', err);
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return 'downloaded';
}
