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

    window.addEventListener('appinstalled', () => {
      setPromptEvent(null)
      setIsInstalled(true)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      mediaQuery.removeEventListener('change', onDisplayChange)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return false
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setPromptEvent(null)
    return outcome === 'accepted'
  }

  return {
    canInstall: !!promptEvent && !isInstalled,
    isInstalled,
    install,
  }
}
