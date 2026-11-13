/** Deteksi WebGL sebelum memuat chunk Three.js; bila tidak ada → gambar 2D cadangan. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}
