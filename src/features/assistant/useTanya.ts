import { create } from 'zustand';

/** Buka/tutup lembar Tanya Busu dari tombol 💬 di header halaman belajar. */
export const useTanya = create<{ open: boolean; setOpen: (v: boolean) => void }>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
