import { create } from 'zustand';
import { db, type EndReason, type Profile } from './db';

/** Sesi aktif + multi-profil per perangkat (D12, architecture.md §12.1). */
export const IDLE_MS = 20 * 60 * 1000;
const KEY = 'sudutku.active';

interface Active {
  profileId: number;
  sessionId: number;
  lastActive: number;
}

function readActive(): Active | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Active) : null;
  } catch {
    return null;
  }
}

function writeActive(a: Active | null): void {
  try {
    if (a) localStorage.setItem(KEY, JSON.stringify(a));
    else localStorage.removeItem(KEY);
  } catch {
    /* penyimpanan diblokir — sesi tetap berjalan di memori */
  }
}

interface SessionState {
  ready: boolean;
  profile: Profile | null;
  sessionId: number | null;
  restore: () => Promise<void>;
  login: (p: Profile) => Promise<void>;
  logout: (reason: EndReason) => Promise<void>;
  touch: () => void;
}

export const useSession = create<SessionState>((set, get) => ({
  ready: false,
  profile: null,
  sessionId: null,

  /** Lanjutkan sesi setelah tab dimuat ulang, kecuali sudah lewat batas diam 20 menit. */
  async restore() {
    const a = readActive();
    if (a) {
      if (Date.now() - a.lastActive < IDLE_MS) {
        const p = await db.profiles.get(a.profileId);
        if (p) {
          set({ profile: p, sessionId: a.sessionId, ready: true });
          get().touch();
          return;
        }
      } else {
        await db.sessions.update(a.sessionId, { endedAt: a.lastActive, endReason: 'idle' });
      }
      writeActive(null);
    }
    set({ ready: true });
  },

  async login(p) {
    const now = Date.now();
    const sessionId = await db.sessions.add({ profileId: p.id, startedAt: now });
    writeActive({ profileId: p.id, sessionId, lastActive: now });
    set({ profile: p, sessionId });
  },

  async logout(reason) {
    const { sessionId } = get();
    if (sessionId != null) await db.sessions.update(sessionId, { endedAt: Date.now(), endReason: reason });
    writeActive(null);
    // Reset total agar tidak ada sisa state siswa sebelumnya.
    set({ profile: null, sessionId: null });
  },

  touch() {
    const { profile, sessionId } = get();
    if (profile && sessionId != null) writeActive({ profileId: profile.id, sessionId, lastActive: Date.now() });
  },
}));
