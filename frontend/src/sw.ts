/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst, NetworkOnly } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

declare const self: ServiceWorkerGlobalScope

// ── Lifecycle: skip waiting + claim clients immediately on deploy ─────────────
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ── Precache compiled assets ──────────────────────────────────────────────────
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// ── Navigation fallback ───────────────────────────────────────────────────────
// All page navigations → serve index.html (SPA). If offline and not cached,
// fall back to the offline page.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'), {
    denylist: [/^\/offline\.html$/],
  })
)

// ── Auth routes — never cache ─────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/auth/'),
  new NetworkOnly()
)

// ── Daily quote — stale-while-revalidate (fast load + fresh data) ─────────────
registerRoute(
  ({ url }) => url.pathname === '/api/quotes/daily',
  new StaleWhileRevalidate({
    cacheName: 'daily-quote',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 7, maxAgeSeconds: 60 * 60 * 24 * 2 }),
    ],
  })
)

// ── Static reference data — cache-first, 7-day TTL ───────────────────────────
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/traditions') ||
    url.pathname.startsWith('/api/authors'),
  new CacheFirst({
    cacheName: 'reference-data',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
)

// ── Theme images — cache-first, 30-day TTL ───────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/images/themes/') && url.pathname.endsWith('.webp'),
  new CacheFirst({
    cacheName: 'theme-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
)

// ── Google Fonts — cache-first ────────────────────────────────────────────────
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
)

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return
  const data = event.data.json() as {
    title?: string
    body?: string
    icon?: string
    url?: string
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'DailyXam', {
      body: data.body,
      icon: data.icon ?? '/logo192.png',
      badge: '/logo192.png',
      data: { url: data.url ?? '/' },
      actions: [
        { action: 'open', title: 'Read Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    } as NotificationOptions)
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const relUrl: string = (event.notification.data as { url?: string })?.url ?? '/'
  const absUrl = new URL(relUrl, self.registration.scope).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        const clientPath = new URL(client.url).pathname
        const targetPath = new URL(absUrl).pathname
        if (clientPath === targetPath && 'focus' in client) {
          return (client as WindowClient).navigate(absUrl).then(c => c?.focus())
        }
      }
      return self.clients.openWindow(absUrl)
    })
  )
})
