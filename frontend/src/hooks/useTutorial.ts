import { useState } from 'react';

/**
 * Manages tutorial visibility for a feature.
 * Auto-shows on first visit (key not in localStorage), re-openable via openTutorial().
 */
export function useTutorial(storageKey: string) {
  // Lazy initializer reads localStorage synchronously — no flash on first render
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem(storageKey));

  const dismissTutorial = () => {
    localStorage.setItem(storageKey, '1');
    setShowTutorial(false);
  };

  const openTutorial = () => setShowTutorial(true);

  return { showTutorial, dismissTutorial, openTutorial };
}
