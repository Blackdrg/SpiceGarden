declare module '@sentry/nextjs' {
  export interface SentryOptions {
    dsn?: string;
    environment?: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
  }

  export function init(options: SentryOptions): void;
  export function captureException(error: unknown, options?: Record<string, unknown>): void;
  export function captureMessage(message: string, options?: Record<string, unknown>): void;
  export const ErrorBoundary: React.FC<{ fallback?: React.ReactNode; children: React.ReactNode }>;
  export interface BrowserClientOptions extends SentryOptions {}
  export interface ServerOptions extends SentryOptions {}
}
