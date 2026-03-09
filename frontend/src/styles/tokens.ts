/**
 * Design Tokens for Daily Stoic App
 * Centralized design system constants for use in inline styles and JS logic
 */

// Color Palette - Primary (Stone/Parchment)
export const colors = {
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
  
  // Accent colors
  accent: {
    DEFAULT: '#8b7355',  // warm bronze — CTAs, active states, streak flame
    light:   '#c4a882',  // hover states, badges
    dark:    '#5c4a2a',  // pressed states, focus rings
  },
  
  // Surface colors
  surface: {
    base:     '#f2f0ea',  // app-wide background
    card:     '#ece9e1',  // quote card, modals
    elevated: '#e6e3da',  // hover card, dropdown menus
  },
  
  // Semantic colors
  semantic: {
    success: '#5a7a5a',   // streak active, confirmation
    warning: '#a07840',   // approaching gate, soft alerts
    danger:  '#8a4a3a',   // errors, destructive actions
  },
} as const;

// Typography
export const typography = {
  fontFamily: {
    serif:   '"Cormorant Garamond", Georgia, Cambria, serif',
    display: '"Cinzel", "Trajan Pro", Georgia, serif',
    sans:    '"Inter", system-ui, -apple-system, sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  
  fontSize: {
    // Base sizes
    xs:   '0.75rem',    // 12px
    sm:   '0.875rem',   // 14px
    base: '1rem',       // 16px
    lg:   '1.125rem',   // 18px
    xl:   '1.25rem',    // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    
    // Quote-specific sizes
    quoteSm: '1.125rem',  // 18px
    quoteMd: '1.375rem',  // 22px
    quoteLg: '1.75rem',   // 28px
    quoteXl: '2.25rem',   // 36px
  },
  
  fontWeight: {
    light:    300,
    normal:   400,
    medium:   500,
    semibold: 600,
    bold:     700,
  },
  
  lineHeight: {
    none:    1,
    tight:   1.25,
    snug:    1.375,
    normal:  1.5,
    relaxed: 1.625,
    loose:   2,
    
    // Quote-specific line heights
    quoteSm: 1.85,
    quoteMd: 1.8,
    quoteLg: 1.7,
    quoteXl: 1.6,
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight:   '-0.025em',
    normal:  '0',
    wide:    '0.025em',
    wider:   '0.05em',
    widest:  '0.1em',
    
    // Quote-specific letter spacing
    quoteSm: '0.01em',
    quoteMd: '0.005em',
    quoteLg: '0',
    quoteXl: '-0.01em',
  },
} as const;

// Shadows
export const shadows = {
  card:     '0 1px 4px rgba(38,35,28,0.08), 0 4px 16px rgba(38,35,28,0.06)',
  modal:    '0 8px 48px rgba(38,35,28,0.18)',
  elevated: '0 2px 8px rgba(38,35,28,0.10)',
  inner:    'inset 0 2px 4px 0 rgba(38,35,28,0.06)',
} as const;

// Border Radius
export const borderRadius = {
  none:  '0',
  stone: '2px',   // near-square — classical, not bubbly
  sm:    '4px',
  card:  '6px',
  modal: '8px',
  lg:    '12px',
  full:  '9999px',
} as const;

// Spacing Scale
export const spacing = {
  0:    '0',
  px:   '1px',
  0.5:  '0.125rem',  // 2px
  1:    '0.25rem',   // 4px
  1.5:  '0.375rem',  // 6px
  2:    '0.5rem',    // 8px
  2.5:  '0.625rem',  // 10px
  3:    '0.75rem',   // 12px
  3.5:  '0.875rem',  // 14px
  4:    '1rem',      // 16px
  5:    '1.25rem',   // 20px
  6:    '1.5rem',    // 24px
  7:    '1.75rem',   // 28px
  8:    '2rem',      // 32px
  9:    '2.25rem',   // 36px
  10:   '2.5rem',    // 40px
  11:   '2.75rem',   // 44px
  12:   '3rem',      // 48px
  14:   '3.5rem',    // 56px
  16:   '4rem',      // 64px
  20:   '5rem',      // 80px
  24:   '6rem',      // 96px
  28:   '7rem',      // 112px
  32:   '8rem',      // 128px
  36:   '9rem',      // 144px
  40:   '10rem',     // 160px
  44:   '11rem',     // 176px
  48:   '12rem',     // 192px
  52:   '13rem',     // 208px
  56:   '14rem',     // 224px
  60:   '15rem',     // 240px
  64:   '16rem',     // 256px
  72:   '18rem',     // 288px
  80:   '20rem',     // 320px
  96:   '24rem',     // 384px
} as const;

// Animation Durations
export const transitions = {
  duration: {
    75:   '75ms',
    100:  '100ms',
    150:  '150ms',
    200:  '200ms',
    300:  '300ms',
    500:  '500ms',
    700:  '700ms',
    1000: '1000ms',
  },
  
  timing: {
    linear:    'linear',
    in:        'cubic-bezier(0.4, 0, 1, 1)',
    out:       'cubic-bezier(0, 0, 0.2, 1)',
    inOut:     'cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Custom easings for Stoic animations
    quoteEnter:    'cubic-bezier(0.22, 1, 0.36, 1)',
    milestoneBurst: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    modalRise:     'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const;

// Z-Index Scale
export const zIndex = {
  0:        0,
  10:       10,
  20:       20,
  30:       30,
  40:       40,
  50:       50,
  dropdown: 1000,
  sticky:   1020,
  fixed:    1030,
  modalBg:  1040,
  modal:    1050,
  popover:  1060,
  tooltip:  1070,
} as const;

// Breakpoints
export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const;

// Export all tokens as a single object for convenience
export const tokens = {
  colors,
  typography,
  shadows,
  borderRadius,
  spacing,
  transitions,
  zIndex,
  breakpoints,
} as const;

export default tokens;