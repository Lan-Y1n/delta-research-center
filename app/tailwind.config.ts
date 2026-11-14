import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { stage: 'var(--bg)', ink: 'var(--text)', accent: 'var(--accent)', muted: 'var(--muted)' }, borderRadius: { card: '24px', portrait: '30px' }, maxWidth: { content: '1280px' } } },
  plugins: []
} satisfies Config;
