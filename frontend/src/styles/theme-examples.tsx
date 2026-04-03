/**
 * Theme Examples for Daily Stoic App
 * This file demonstrates how to use the new Stoic visual identity
 */

import React from 'react';

// Example: Quote Component using Stoic typography
export const StoicQuote: React.FC<{ text: string; author: string }> = ({ text, author }) => (
  <div className="bg-stoic-surface-paper dark:bg-stoic-dark-surface-paper p-8 rounded-lg shadow-paper-lg">
    {/* Quote text with Cormorant Garamond */}
    <blockquote className="font-serif text-quote-md text-stoic-text-primary dark:text-stoic-dark-text-primary mb-4">
      "{text}"
    </blockquote>
    {/* Author with Cinzel display font */}
    <cite className="font-display text-stoic-stone-600 dark:text-stoic-stone-400 text-lg">
      — {author}
    </cite>
  </div>
);

// Example: Card with Stoic colors
export const StoicCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-stoic-surface-paper dark:bg-stoic-dark-surface-paper rounded-lg shadow-paper-lg p-6 border border-stoic-stone-100 dark:border-stoic-stone-800">
    <h3 className="font-display text-xl text-stoic-text-primary dark:text-stoic-dark-text-primary mb-4">
      {title}
    </h3>
    <div className="text-stoic-text-secondary dark:text-stoic-dark-text-secondary">
      {children}
    </div>
  </div>
);

// Example: Button variants with Stoic palette
export const StoicButtons: React.FC = () => (
  <div className="flex gap-4">
    {/* Primary button - stone color */}
    <button className="btn-primary">
      Primary Action
    </button>
    
    {/* Secondary button - parchment surface */}
    <button className="btn-secondary">
      Secondary Action
    </button>
    
    {/* Accent buttons using earth tones */}
    <button className="px-4 py-2 rounded-lg bg-stoic-accent-sage text-white hover:brightness-110 transition-all shadow-paper">
      Success (Sage)
    </button>
    
    <button className="px-4 py-2 rounded-lg bg-stoic-accent-clay text-white hover:brightness-110 transition-all shadow-paper">
      Warning (Clay)
    </button>
    
    <button className="px-4 py-2 rounded-lg bg-stoic-accent-iron text-white hover:brightness-110 transition-all shadow-paper">
      Info (Iron)
    </button>
    
    <button className="px-4 py-2 rounded-lg bg-stoic-accent-ember text-white hover:brightness-110 transition-all shadow-paper">
      Error (Ember)
    </button>
  </div>
);

// Example: Typography showcase
export const StoicTypography: React.FC = () => (
  <div className="space-y-6">
    {/* Display headings with Cinzel */}
    <h1 className="font-display text-4xl text-stoic-text-primary dark:text-stoic-dark-text-primary">
      Daily Stoic - Display Heading
    </h1>
    
    {/* Quote text with Cormorant Garamond */}
    <p className="font-serif text-quote-lg text-stoic-text-primary dark:text-stoic-dark-text-primary">
      "The impediment to action advances action. What stands in the way becomes the way."
    </p>
    
    {/* Body text with Inter */}
    <p className="font-sans text-base text-stoic-text-secondary dark:text-stoic-dark-text-secondary">
      This is body text using Inter font. It's clean and readable for UI elements and general content.
    </p>
    
    {/* Muted text */}
    <p className="text-muted text-sm">
      This is muted text for secondary information.
    </p>
  </div>
);

// Example: Color palette showcase
export const StoicColorPalette: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {/* Surface colors */}
    <div className="space-y-2">
      <h4 className="font-display text-sm font-semibold">Surfaces</h4>
      <div className="bg-stoic-surface-base h-16 rounded border border-stoic-stone-200"></div>
      <div className="bg-stoic-surface-paper h-16 rounded border border-stoic-stone-200"></div>
      <div className="bg-stoic-surface-raised h-16 rounded border border-stoic-stone-200"></div>
      <div className="bg-stoic-surface-overlay h-16 rounded border border-stoic-stone-200"></div>
    </div>
    
    {/* Stone colors */}
    <div className="space-y-2">
      <h4 className="font-display text-sm font-semibold">Stone Palette</h4>
      <div className="bg-stoic-stone-300 h-16 rounded"></div>
      <div className="bg-stoic-stone-400 h-16 rounded"></div>
      <div className="bg-stoic-stone-500 h-16 rounded"></div>
      <div className="bg-stoic-stone-600 h-16 rounded"></div>
    </div>
    
    {/* Accent colors */}
    <div className="space-y-2">
      <h4 className="font-display text-sm font-semibold">Accents</h4>
      <div className="bg-stoic-accent-sage h-16 rounded"></div>
      <div className="bg-stoic-accent-clay h-16 rounded"></div>
      <div className="bg-stoic-accent-iron h-16 rounded"></div>
      <div className="bg-stoic-accent-ember h-16 rounded"></div>
    </div>
    
    {/* Text colors */}
    <div className="space-y-2">
      <h4 className="font-display text-sm font-semibold">Text</h4>
      <div className="bg-stoic-text-primary h-16 rounded"></div>
      <div className="bg-stoic-text-secondary h-16 rounded"></div>
      <div className="bg-stoic-text-tertiary h-16 rounded"></div>
      <div className="bg-stoic-text-muted h-16 rounded"></div>
    </div>
  </div>
);

// Usage Guide
export const ThemeUsageGuide = `
## Daily Stoic Theme Usage Guide

### Fonts
- **Headings & Titles**: Use \`font-display\` (Cinzel) for impact
- **Quotes & Body**: Use \`font-serif\` (Cormorant Garamond) for elegance
- **UI Elements**: Use \`font-sans\` (Inter) for clarity

### Colors
- **Primary Actions**: Use stone colors (stoic-stone-500/600)
- **Surfaces**: Use parchment colors (stoic-surface-base/paper)
- **Accents**: Use earth tones (sage, clay, iron, ember)

### Components
- Cards: Use \`.card\` class or \`bg-stoic-surface-paper\` with \`shadow-paper-lg\`
- Buttons: Use \`.btn-primary\` or \`.btn-secondary\` classes
- Text: Apply appropriate text color classes for hierarchy

### Dark Mode
All colors have dark mode variants prefixed with \`dark:\`
The theme automatically switches based on user preference.
`;