// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f5f5f0',  // parchment white — page backgrounds
          100: '#e8e6df',  // card surfaces, input backgrounds
          200: '#d4d0c4',  // borders, dividers
          300: '#b8b2a0',  // disabled text, placeholders
          400: '#9c9480',  // secondary labels
          500: '#7d7560',  // muted olive-stone — primary UI text
          600: '#635d4c',  // navigation, metadata
          700: '#4d4839',  // body text on light surfaces
          800: '#38342a',  // headings, strong emphasis
          900: '#26231c',  // near-black — quote text, max contrast
        },
        accent: {
          DEFAULT: '#8b7355',  // warm bronze — CTAs, active states, streak flame
          light:   '#c4a882',  // hover states, badges
          dark:    '#5c4a2a',  // pressed states, focus rings
        },
        surface: {
          base:    '#eae6db',  // app-wide background — deeper parchment for worn scroll feel
          card:    '#e4e0d5',  // quote card, modals
          elevated:'#dedad0',  // hover card, dropdown menus
        },
        // Semantic
        success: '#5a7a5a',   // streak active, confirmation
        warning: '#a07840',   // approaching gate, soft alerts
        danger:  '#8a4a3a',   // errors, destructive actions
      },

      fontFamily: {
        serif:   ['"Cormorant Garamond"', 'Georgia', 'Cambria', 'serif'],
        display: ['"Cinzel"', '"Trajan Pro"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },

      fontSize: {
        // Quote-specific scale — generous for readability and presence
        'quote-sm':  ['1.125rem', { lineHeight: '1.85', letterSpacing: '0.01em' }],
        'quote-md':  ['1.375rem', { lineHeight: '1.8',  letterSpacing: '0.005em' }],
        'quote-lg':  ['1.75rem',  { lineHeight: '1.7',  letterSpacing: '0' }],
        'quote-xl':  ['2.25rem',  { lineHeight: '1.6',  letterSpacing: '-0.01em' }],
      },

      borderRadius: {
        'stone': '2px',   // near-square — classical, not bubbly
        'card':  '6px',
        'modal': '8px',
      },

      boxShadow: {
        'card':          '0 2px 8px rgba(38,35,28,0.14), 0 8px 32px rgba(38,35,28,0.10)',
        'card-hover':    '0 4px 16px rgba(38,35,28,0.18), 0 16px 48px rgba(38,35,28,0.14)',
        'modal':         '0 8px 48px rgba(38,35,28,0.18)',
        'elevated':      '0 2px 8px rgba(38,35,28,0.10)',
        'header-scroll': '0 2px 20px rgba(38,35,28,0.14), 0 4px 12px rgba(38,35,28,0.08)',
      },

      keyframes: {
        // Quote entrance — fade in with subtle upward drift
        'quote-enter': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Streak flame pulse — organic, breathing
        'flame-pulse': {
          '0%, 100%': { transform: 'scaleY(1)',    filter: 'brightness(1)' },
          '50%':      { transform: 'scaleY(1.08)', filter: 'brightness(1.15)' },
        },
        // Milestone burst — radial reveal for day-7 / day-30 modal
        'milestone-burst': {
          '0%':   { transform: 'scale(0.7)', opacity: '0' },
          '60%':  { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        // Modal arrive — rises from below with ease
        'modal-rise': {
          '0%':   { transform: 'translateY(24px) scale(0.98)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)',       opacity: '1' },
        },
        // Page shimmer — skeleton loading state
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Reveal text — char-by-char feeling without JS (CSS mask)
        'text-reveal': {
          '0%':   { clipPath: 'inset(0 100% 0 0)' },
          '100%': { clipPath: 'inset(0 0% 0 0)' },
        },
        // Confetti drop — milestone celebration
        'confetti-fall': {
          '0%':   { transform: 'translateY(-20px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(80px) rotate(360deg)', opacity: '0' },
        },
        // Float — gentle perpetual lift for the quote card
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
        // Title glow — warm bronze breath on headlines
        'title-glow': {
          '0%, 100%': { textShadow: '0 0 0px rgba(139,115,85,0)' },
          '50%':      { textShadow: '0 0 18px rgba(139,115,85,0.35), 0 0 36px rgba(139,115,85,0.15)' },
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
      },
    },
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  plugins: [],
}