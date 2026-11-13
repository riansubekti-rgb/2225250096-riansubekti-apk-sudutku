import { Busu } from './Busu';

/**
 * Layar pembuka "Ketuk untuk mulai!". Browser HP melarang suara sebelum layar disentuh;
 * ketukan di sini memberi izin itu sehingga Busu langsung memperkenalkan diri dan musik menyala.
 */
export function StartGate({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      aria-label="Ketuk untuk mulai"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: 'linear-gradient(160deg, var(--hero-from), var(--hero-to))', color: 'var(--on-hero)' }}
    >
      <span className="rounded-full bg-white/15 p-5">
        <Busu mood="cheer" size={170} talking />
      </span>
      <span className="text-4xl font-bold tracking-tight">SudutKu</span>
      <span className="text-lg opacity-95">Belajar sudut bareng Busu, seru banget!</span>
      <span className="mt-4 animate-pulse rounded-full bg-white px-8 py-4 text-xl font-bold" style={{ color: 'var(--hero-from)' }}>
        👆 Ketuk untuk mulai! ✨
      </span>
    </button>
  );
}
