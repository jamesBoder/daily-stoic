import { useState, useEffect, useCallback } from 'react'
import apiClient from '../services/api/client'

const isSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return view
}

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading]       = useState(false)
  const [vapidKey, setVapidKey]         = useState<string | null>(null)

  // Fetch VAPID public key once
  useEffect(() => {
    if (!isSupported) return
    apiClient.get<{ public_key: string }>('/api/push/vapid-key')
      .then(r => setVapidKey(r.data.public_key))
      .catch(() => {/* VAPID not configured */})
  }, [])

  // Check current subscription state
  useEffect(() => {
    if (!isSupported || !vapidKey) return
    navigator.serviceWorker.ready.then(async reg => {
      const sub = await reg.pushManager.getSubscription()
      if (!sub) { setIsSubscribed(false); return }
      try {
        const keys = sub.toJSON().keys ?? {}
        const res = await apiClient.post<{ subscribed: boolean }>('/api/push/status', {
          endpoint: sub.endpoint,
          auth: keys.auth,
          p256dh: keys.p256dh,
        })
        setIsSubscribed(res.data.subscribed)
      } catch {
        setIsSubscribed(false)
      }
    })
  }, [vapidKey])

  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidKey) return
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const json = sub.toJSON()
      const keys = json.keys ?? {}
      await apiClient.post('/api/push/subscribe', {
        endpoint: sub.endpoint,
        auth: keys.auth,
        p256dh: keys.p256dh,
      })
      setIsSubscribed(true)
    } catch (err) {
      console.error('Push subscribe failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [vapidKey])

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return
    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await apiClient.post('/api/push/unsubscribe', { endpoint: sub.endpoint })
        await sub.unsubscribe()
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('Push unsubscribe failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isSupported,
    isSubscribed,
    isLoading,
    canEnable: isSupported && !!vapidKey,
    subscribe,
    unsubscribe,
  }
}
