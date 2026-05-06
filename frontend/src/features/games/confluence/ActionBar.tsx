import { useEffect, useRef, useState } from 'react'

interface ActionBarProps {
  selectedCount: number
  attemptsRemaining: number
  isPending: boolean
  oneAwayCount: number
  wrongCount: number
  gameOver: boolean
  onSubmit: () => void
  onDeselect: () => void
}

export function ActionBar({
  selectedCount,
  attemptsRemaining,
  isPending,
  oneAwayCount,
  wrongCount,
  gameOver,
  onSubmit,
  onDeselect,
}: ActionBarProps) {
  const [toastKind, setToastKind] = useState<'one-away' | 'not-quite' | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [shakeSubmit, setShakeSubmit] = useState(false)
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevWrongCount = useRef(0)
  const prevOneAwayCount = useRef(0)

  useEffect(() => {
    if (wrongCount > prevWrongCount.current) {
      const isOneAway = oneAwayCount > prevOneAwayCount.current
      prevWrongCount.current = wrongCount
      prevOneAwayCount.current = oneAwayCount
      setToastKind(isOneAway ? 'one-away' : 'not-quite')
      setShowToast(true)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setShowToast(false), 2000)
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [wrongCount, oneAwayCount])

  const handleSubmitClick = () => {
    if (selectedCount !== 4) {
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
      setShakeSubmit(true)
      shakeTimer.current = setTimeout(() => setShakeSubmit(false), 450)
      return
    }
    onSubmit()
  }

  useEffect(() => {
    return () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current)
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const canSubmit = selectedCount === 4 && !isPending && !gameOver

  return (
    <div className="mt-4 flex flex-col items-center gap-3">

      {/* Wrong-guess toast */}
      <div
        aria-live="polite"
        className={`transition-all duration-300 overflow-hidden ${
          showToast ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-1.5 rounded-md bg-stone-800 border border-stone-700">
          <span className={`font-display text-xs tracking-wider ${
            toastKind === 'one-away' ? 'text-amber-300' : 'text-stone-400'
          }`}>
            {toastKind === 'one-away' ? 'One away...' : 'Not quite.'}
          </span>
        </div>
      </div>

      {/* Attempt circles */}
      <div className="flex items-center gap-2">
        <span className="font-display text-[10px] tracking-widest text-stone-500 uppercase mr-1">Attempts</span>
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={[
              'w-3 h-3 rounded-full transition-colors duration-300',
              i < attemptsRemaining
                ? 'bg-stone-300'
                : 'border border-stone-600 bg-transparent',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onDeselect}
          disabled={selectedCount === 0 || gameOver}
          className="font-display text-xs tracking-widest uppercase px-4 py-2 rounded-full border
                     border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200
                     transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Deselect all
        </button>

        <button
          onClick={handleSubmitClick}
          disabled={isPending || gameOver}
          className={[
            'font-display text-xs tracking-widest uppercase px-5 py-2 rounded-full transition-colors',
            shakeSubmit ? 'animate-shake' : '',
            canSubmit
              ? 'bg-stone-200 text-stone-900 hover:bg-white'
              : 'bg-stone-800 text-stone-500 border border-stone-700',
            'disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {isPending ? 'Checking...' : 'Submit'}
        </button>
      </div>

      {/* Selected count hint */}
      {selectedCount > 0 && selectedCount < 4 && !gameOver && (
        <p className="font-display text-[10px] tracking-widest text-stone-600 uppercase">
          {4 - selectedCount} more to select
        </p>
      )}
    </div>
  )
}
