import type { Config } from 'tailwindcss';

// Warna diambil dari token CSS (src/styles/tokens.css) — jangan tulis hex di komponen.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-muted': 'var(--ink-muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        'on-accent': 'var(--on-accent)',
        'rel-sup': 'var(--rel-sup)',
        'rel-comp': 'var(--rel-comp)',
        'rel-vert': 'var(--rel-vert)',
        ask: 'var(--ask)',
      },
      fontFamily: { sans: ['var(--font)'] },
      borderRadius: { card: 'var(--radius)' },
      minHeight: { touch: '48px' },
      minWidth: { touch: '48px' },
      maxWidth: { content: '1040px' },
    },
  },
  plugins: [],
} satisfies Config;
