/** Daftar id adegan — sengaja tanpa impor Three.js agar bisa dipakai validasi konten & bundel utama. */
export const SCENE_IDS = ['crossbuck', 'door', 'garden', 'kite', 'chair', 'square'] as const;
export type SceneId = (typeof SCENE_IDS)[number];
