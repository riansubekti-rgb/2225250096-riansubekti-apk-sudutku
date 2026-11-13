/** Urutan alur belajar (prd.md F1). `ready: false` = halaman masih placeholder. */
export interface RouteDef {
  path: string;
  title: string;
  feature: string;
  icon: string;
  ready: boolean;
}

export const ROUTES: RouteDef[] = [
  { path: '/', title: 'Peta Belajar', feature: 'F1', icon: '🗺️', ready: true },
  { path: '/pemanasan', title: 'Pemanasan', feature: 'F2', icon: '✏️', ready: true },
  { path: '/kenali', title: 'Kenali Hubungan', feature: 'F3', icon: '🔍', ready: true },
  { path: '/lab', title: 'Lab Sudut', feature: 'F4', icon: '🧪', ready: true },
  { path: '/contoh', title: 'Contoh Bertahap', feature: 'F5', icon: '🪜', ready: true },
  { path: '/latihan', title: 'Latihan', feature: 'F6', icon: '🎯', ready: true },
  { path: '/misi', title: 'Misi Dunia Nyata', feature: 'F7', icon: '🌏', ready: true },
  { path: '/progres', title: 'Progres', feature: 'F11', icon: '⭐', ready: true },
];

export const LEARNING_PATH = ROUTES.filter((r) => r.path !== '/' && r.path !== '/progres');

/** Judul halaman di luar alur belajar. */
export const EXTRA_TITLES: Record<string, string> = {
  '/masuk': 'Masuk',
  '/selesai': 'Selesai Belajar',
  '/tes/awal': 'Tes Awal',
  '/tes/akhir': 'Tes Akhir',
  '/peneliti': 'Mode Peneliti',
  '/kode': 'Kode dari Guru',
};

/** Halaman yang boleh dibuka tanpa login siswa. */
export const PUBLIC_PATHS = ['/masuk', '/peneliti'];

export function titleFor(pathname: string): string | undefined {
  if (pathname.startsWith('/angket/')) return 'Angket';
  return EXTRA_TITLES[pathname];
}
