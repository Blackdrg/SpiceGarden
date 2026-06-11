declare module '@sentry/nextjs' {
  export const init: (options: Record<string, unknown>) => void;
  export const captureException: (error: unknown) => void;
  export const captureMessage: (message: string) => void;
  export const withSentry: (options: Record<string, unknown>) => unknown;
  export const captureEvent: (event: Record<string, unknown>) => void;
  export const setContext: (key: string, context: Record<string, unknown>) => void;
  export const setUser: (user: Record<string, unknown> | null) => void;
  export const configureScope: (callback: (scope: unknown) => void) => void;
  export class BrowserTracing {
    constructor(options: Record<string, unknown>);
  }
}
