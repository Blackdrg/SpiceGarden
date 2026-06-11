declare module '@sentry/nextjs' {
  export interface SentryOptions {
    dsn?: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
  }

  export function init(options: SentryOptions): void;

  export const ErrorBoundary: React.FC<{ fallback?: React.ReactNode; children: React.ReactNode }>;
}