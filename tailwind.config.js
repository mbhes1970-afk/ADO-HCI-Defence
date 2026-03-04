/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── HCI brand tokens (via CSS vars, same pattern as CMOFMO) ──
        brand: {
          primary:        'var(--color-primary)',
          'primary-light':'var(--color-primary-light)',
          'primary-dim':  'var(--color-primary-dim)',
          accent:         'var(--color-accent)',
          bg:             'var(--color-bg)',
          'bg-card':      'var(--color-bg-card)',
          'bg-elevated':  'var(--color-bg-elevated)',
          border:         'var(--color-border)',
          text:           'var(--color-text)',
          'text-dim':     'var(--color-text-dim)',
          'text-bright':  'var(--color-text-bright)',
        },
        // ── ADO military status colours ──
        ado: {
          green:   'var(--ado-green)',
          amber:   'var(--ado-amber)',
          red:     'var(--ado-red)',
          blue:    'var(--ado-blue)',
          'green-dim': 'var(--ado-green-dim)',
          'amber-dim': 'var(--ado-amber-dim)',
          'red-dim':   'var(--ado-red-dim)',
          'blue-dim':  'var(--ado-blue-dim)',
        },
      },
      fontFamily: {
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono:  ['Geist Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fade-in 0.3s ease-out forwards',
        'slide-in':   'slide-in 0.25s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
