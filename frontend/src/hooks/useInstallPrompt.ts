import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const useInstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mediaQuery.matches)
    const onDisplayChange = (e: MediaQueryListEvent) => setIsInstalled(e.matches)
    mediaQuery.addEventListener('change', onDisplayChange)

    const onInstalled = () => {
      setPromptEvent(null)
      setIsInstalled(true)
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      mediaQuery.removeEventListener('change', onDisplayChange)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return false
    try {
      await promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      return outcome === 'accepted'
    } catch {
      return false
    } finally {
      // A BeforeInstallPromptEvent can only be prompted once, regardless of
      // outcome — clear it either way so a second tap doesn't re-invoke a
      // used-up event (which browsers reject/throw).
      setPromptEvent(null)
    }
  }

  return {
    canInstall: !!promptEvent && !isInstalled,
    isInstalled,
    install,
  }
}
