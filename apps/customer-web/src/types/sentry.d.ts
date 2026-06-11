export {};

declare module '@sentry/nextjs' {
  import { BrowserTracing as Tracing } from '@sentry/browser';
  
  export interface BrowserTracing extends Tracing {}
  
  export function init(config: {
    dsn: string;
    tracesSampleRate?: number;
    profilesSampleRate?: number;
    environment?: string;
    integrations?: BrowserTracing[];
  }): void;
  
  export { ErrorBoundary } from '@sentry/react';
}