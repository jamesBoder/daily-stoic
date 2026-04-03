// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f5f0',
          100: '#e8e6df',
          200: '#d4d0c4',
          300: '#b8b2a0',
          400: '#9c9480',
          500: '#7d7560',
          600: '#635d4c',
          700: '#4d4839',
          800: '#38342a',
          900: '#26231c',
        },
        accent: {
          DEFAULT: '#8b7355',
          light:   '#c4a882',
          dark:    '#5c4a2a',
        },
        surface: {
          base:    '#eae6db',
          card:    '#e4e0d5',
          elevated:'#dedad0',
        },
        // ── Night palette (dark mode) ──────────────────────────────────
        night: {
          50:  '#f0f2f8',
          100: '#d8dce8',
          200: '#b0b8d0',
          300: '#8892b8',
          400: '#5c6a96',
          500: '#3e4e7a',
          600: '#2a3660',
          700: '#1a2444',
          800: '#0f1830',
          900: '#080f1e',
          950: '#040810',
        },
        // Star gold — accent for dark mode (replaces bronze)
        'star-gold': {
          DEFAULT: '#d4a853',
          light:   '#f0cc80',
          dark:    '#9a7030',
        },
        semantic: {
          success: '#5a7a5a',
          warning: '#a07840',
          danger:  '#8a4a3a',
        },
      },

      fontFamily: {
        serif:   ['"Cormorant Garamond"', 'Georgia', 'Cambria', 'serif'],
        display: ['"Cinzel"', '"Trajan Pro"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        'quote-sm':  ['1.125rem', { lineHeight: '1.85', letterSpacing: '0.01em' }],
        'quote-md':  ['1.375rem', { lineHeight: '1.8',  letterSpacing: '0.005em' }],
        'quote-lg':  ['1.75rem',  { lineHeight: '1.7',  letterSpacing: '0' }],
        'quote-xl':  ['2.25rem',  { lineHeight: '1.6',  letterSpacing: '-0.01em' }],
      },

      borderRadius: {
        'stone': '2px',
        'card':  '6px',
        'modal': '8px',
      },

      boxShadow: {
        'card':          '0 2px 8px rgba(38,35,28,0.14), 0 8px 32px rgba(38,35,28,0.10)',
        'card-hover':    '0 4px 16px rgba(38,35,28,0.18), 0 16px 48px rgba(38,35,28,0.14)',
        'modal':         '0 8px 48px rgba(38,35,28,0.18)',
        'elevated':      '0 2px 8px rgba(38,35,28,0.10)',
        'header-scroll': '0 2px 20px rgba(38,35,28,0.14), 0 4px 12px rgba(38,35,28,0.08)',
        // ── Glass shadows (dark mode) ─────────────────────────────────
        'glass':         '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-hover':   '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.09)',
        'glass-glow':    '0 0 24px rgba(212,168,83,0.18), 0 4px 32px rgba(0,0,0,0.5)',
      },

      backdropBlur: {
        'xs': '4px',
        'glass': '20px',
      },

      keyframes: {
        'quote-enter': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'flame-pulse': {
          '0%, 100%': { transform: 'scaleY(1)',    filter: 'brightness(1)' },
          '50%':      { transform: 'scaleY(1.08)', filter: 'brightness(1.15)' },
        },
        'milestone-burst': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'modal-rise': {
          '0%':   { transform: 'translateY(24px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)',       opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'text-reveal': {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        'confetti-fall': {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(80px) rotate(360deg)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
        'title-glow': {
          '0%, 100%': { textShadow: '0 0 0px rgba(139,115,85,0)' },
          '50%':      { textShadow: '0 0 18px rgba(139,115,85,0.35), 0 0 36px rgba(139,115,85,0.15)' },
        },
        // ── Night mode ────────────────────────────────────────────────
        'star-twinkle': {
          '0%, 100%': { opacity: '1',    transform: 'scale(1)' },
          '50%':      { opacity: '0.45', transform: 'scale(0.7)' },
        },
        'star-drift': {
          '0%':   { transform: 'translateY(0) translateX(0)' },
          '100%': { transform: 'translateY(-100vh) translateX(20px)' },
        },
        'gold-glow-pulse': {
          '0%, 100%': { textShadow: '0 0 8px rgba(212,168,83,0.4), 0 0 20px rgba(212,168,83,0.15)' },
          '50%':      { textShadow: '0 0 16px rgba(212,168,83,0.7), 0 0 40px rgba(212,168,83,0.3)' },
        },
      },

      animation: {
        'quote-enter':     'quote-enter 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'flame-pulse':     'flame-pulse 2.4s ease-in-out infinite',
        'milestone-burst': 'milestone-burst 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'modal-rise':      'modal-rise 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        'shimmer':         'shimmer 1.6s linear infinite',
        'text-reveal':     'text-reveal 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'confetti-fall':   'confetti-fall 1.2s ease-in forwards',
        'float':           'float 5s ease-in-out infinite',
        'title-glow':      'title-glow 4s ease-in-out infinite',
        'star-twinkle':    'star-twinkle 3s ease-in-out infinite',
        'gold-glow-pulse': 'gold-glow-pulse 3.5s ease-in-out infinite',
      },
    },
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  plugins: [],
}
