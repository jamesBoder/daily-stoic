// Shared brand wordmark: Daily 🔥 Xam
// Used in Header, Footer, and OnboardingFlow.

function FlameIcon() {
  return (
    <svg
      viewBox="0 0 10 14"
      fill="currentColor"
      aria-hidden="true"
      style={{
        width: '0.52em',
        height: '0.75em',
        display: 'inline-block',
        verticalAlign: '-0.03em',
        margin: '0 0.08em',
      }}
    >
      {/* Outer flame — pointed tip, widest at mid, rounded base */}
      <path d="M5,0 C3,2.5 1,5.5 1,8.5 C1,11.5 2.7,14 5,14 C7.3,14 9,11.5 9,8.5 C9,5.5 7,2.5 5,0Z" />
    </svg>
  )
}

export function WordMark() {
  return (
    <>Daily<FlameIcon />Xam</>
  )
}
