// src/features/quote/TraditionBadge.tsx
import type { Tradition } from '../../types/quote'

export const TraditionBadge = ({ tradition }: { tradition: Tradition }) => (
  <span className="font-display text-xs tracking-widest uppercase text-accent border border-accent/30 rounded-stone px-2.5 py-0.5">
    {tradition.name}
  </span>
)