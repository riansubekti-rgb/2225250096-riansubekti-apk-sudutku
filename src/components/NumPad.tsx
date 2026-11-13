import { useState } from 'react';

/**
 * Papan angka milik aplikasi — menggantikan keyboard sistem agar gambar sudut tidak tertutup
 * (prd.md F6, desain.md §4.1).
 */
export function NumPad({
  label,
  suffix = '',
  onSubmit,
  disabled = false,
}: {
  label: string;
  suffix?: string;
  onSubmit: (value: number) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const press = (d: string) => setValue((v) => (v.length >= 3 ? v : v === '0' ? d : v + d));
  const submit = () => {
    if (!value) return;
    onSubmit(Number(value));
    setValue('');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-bold">{label}</span>
        <output
          aria-live="polite"
          aria-label={`${label} ${value || 'kosong'}${suffix}`}
          className="flex min-h-touch flex-1 items-center justify-end rounded-card border-2 border-accent bg-surface px-4 text-2xl font-bold tabular-nums"
        >
          {value || <span className="text-ink-muted">…</span>}
          {value && suffix}
        </output>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['7', '8', '9', '⌫', '4', '5', '6', '0', '1', '2', '3'].map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => (k === '⌫' ? setValue((v) => v.slice(0, -1)) : press(k))}
            className="btn-secondary min-h-[52px] px-0 text-xl"
            aria-label={k === '⌫' ? 'Hapus' : k}
          >
            {k}
          </button>
        ))}
        <button type="button" className="btn-primary min-h-[52px] px-0" disabled={disabled || !value} onClick={submit}>
          Cek
        </button>
      </div>
    </div>
  );
}
