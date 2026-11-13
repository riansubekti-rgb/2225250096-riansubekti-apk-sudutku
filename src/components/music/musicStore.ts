import { create } from 'zustand';

const KEY = 'sudutku.music';

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

/** Nyala/mati backsound (tersimpan per HP). Bawaan: nyala (permintaan peneliti, D18). */
export const useMusic = create<{ enabled: boolean; setEnabled: (v: boolean) => void }>((set) => ({
  enabled: read(),
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(KEY, enabled ? 'on' : 'off');
    } catch {
      /* abaikan */
    }
    set({ enabled });
  },
}));
