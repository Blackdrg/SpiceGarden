import React from 'react'
import * as Sentry from '@sentry/nextjs'

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

interface ErrorBoundaryState {
  hasError: boolean
}

class SentryErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (hasSentryConsent()) {
      Sentry.captureException(error, { contexts: { react: errorInfo } })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>We've been notified and are working on a fix.</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false })
              window.location.reload()
            }}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default SentryErrorBoundary
