import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
}


// Hook to handle keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isTyping = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Don't trigger shortcuts if user is typing
      if (isTyping) {
        return;
      }

      shortcuts.forEach(({ key, ctrl, shift, alt, callback }) => {
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          (!ctrl || event.ctrlKey || event.metaKey) &&
          (!shift || event.shiftKey) &&
          (!alt || event.altKey)
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
