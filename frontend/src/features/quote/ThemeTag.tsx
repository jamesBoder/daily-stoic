// src/features/quote/ThemeTag.tsx
export const ThemeTag = ({ theme }: { theme: string }) => (
  <span className="font-sans text-xs text-primary-500 bg-primary-100 rounded-stone px-2 py-0.5">
    {theme}
  </span>
)