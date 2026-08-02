import * as Sentry from '@sentry/nextjs';

const CONSENT_STORAGE_KEY = 'sg_cookie_consent'

function hasSentryConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    return typeof parsed?.prefs?.performance === 'boolean' ? parsed.prefs.performance : false
  } catch {
    return false
  }
}

export function initSentry(): void {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN
  if (!hasSentryConsent()) return
  if (dsn && !dsn.includes('[key]')) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 0.05,
      profilesSampleRate: 0.05,
    })
  }
}

export default initSentry
