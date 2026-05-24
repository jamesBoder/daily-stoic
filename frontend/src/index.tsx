import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './i18n'
import './index.css'
import App from './App'
import { quotesApi } from './services/api/quotes'
import { quoteCardImageUrl } from './utils/themeImage'

// Seed the cache from localStorage so the quote is available synchronously
// before React even renders (eliminates the skeleton flash for returning visitors).
try {
  const raw = localStorage.getItem('dq-cache')
  const ts = localStorage.getItem('dq-cache-ts')
  if (raw) {
    const cached = JSON.parse(raw)
    queryClient.setQueryData(['daily-quote'], cached, {
      updatedAt: ts ? parseInt(ts, 10) : 0,
    })
    // Preload the LCP image immediately — before React renders — so the
    // fetch is already in-flight when QuoteCard mounts and requests it.
    const imgUrl = quoteCardImageUrl(cached?.quote?.image_url, cached?.quote?.themes?.[0])
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = imgUrl
    document.head.appendChild(link)
  }
} catch { /* ignore */ }

// Pre-warm the QuoteCard chunk so it downloads in parallel with the API call.
// By the time the API responds, the chunk is likely already parsed.
import('./features/quote/QuoteCard')

// Kick off the daily quote fetch immediately — before React initialises —
// so the API response is in-flight (or even resolved) by the time
// DailyQuote mounts and calls useDailyQuote().
queryClient.prefetchQuery({
  queryKey: ['daily-quote'],
  queryFn: quotesApi.getDaily,
  staleTime: 60 * 60 * 1000,
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
