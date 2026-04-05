import { useState, ReactNode } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { UpgradeModal } from '../../features/subscription/UpgradeModal'

interface Props {
  children?: ReactNode
  /** inline=true renders a compact lock badge instead of a full overlay */
  inline?: boolean
}

export const PremiumGate = ({ children, inline = false }: Props) => {
  const { isPremium } = useSubscription()
  const [modalOpen, setModalOpen] = useState(false)

  if (isPremium) return <>{children}</>

  if (inline) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 font-sans text-xs text-accent border border-accent/30 rounded-full px-2.5 py-1 hover:bg-accent/10 transition-colors"
        >
          <span>🔒</span>
          <span>Unlock</span>
        </button>
        {modalOpen && <UpgradeModal onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <div className="relative">
        {/* Blurred content preview */}
        <div className="pointer-events-none select-none blur-sm opacity-40">
          {children}
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-card/70 rounded-card">
          <span className="text-accent text-2xl mb-3">✦</span>
          <p className="font-display text-sm text-primary-800 mb-1">Practitioner Content</p>
          <p className="font-sans text-xs text-primary-500 mb-4 text-center px-4">
            Unlock all traditions and premium wisdom
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="font-display text-xs tracking-wider uppercase bg-accent text-white rounded-stone px-5 py-2 hover:bg-accent-dark transition-colors"
          >
            Unlock Wisdom
          </button>
        </div>
      </div>
      {modalOpen && <UpgradeModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
