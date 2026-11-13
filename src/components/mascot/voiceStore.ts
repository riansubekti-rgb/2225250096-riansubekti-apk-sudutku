import { create } from 'zustand';
import { stopAll } from '../../platform/speech';

const KEY = 'sudutku.voice';

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

/** Nyala/mati suara Busu (disimpan per HP). Bawaan: nyala (keputusan peneliti, D17). */
export const useVoice = create<{ enabled: boolean; setEnabled: (v: boolean) => void }>((set) => ({
  enabled: read(),
  setEnabled: (enabled) => {
    try {
      localStorage.setItem(KEY, enabled ? 'on' : 'off');
    } catch {
      /* abaikan */
    }
    if (!enabled) stopAll();
    set({ enabled });
  },
}));
