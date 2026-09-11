import { useEffect, useRef } from 'react'

/**
 * Moves focus into a modal panel when it opens and restores focus to the
 * element that was focused beforehand when it closes, so keyboard and
 * screen-reader users land inside the dialog instead of the page behind it.
 * Attach the returned ref (with tabIndex={-1}) to the modal's outer panel.
 */
export function useModalFocus<T extends HTMLElement>(isOpen: boolean) {
  const panelRef = useRef<T>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => {
      previouslyFocused.current?.focus?.()
    }
  }, [isOpen])

  return panelRef
}
