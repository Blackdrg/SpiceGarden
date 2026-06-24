declare module '@sentry/node' {
  export interface SentryOptions {
    dsn?: string;
    tracesSampleRate?: number;
    environment?: string;
    release?: string;
  }

  export interface RequestHandlerOptions {
    request?: boolean;
    tracing?: boolean;
  }

  export class Sentry {
    static init(options: SentryOptions): void;
    static Handlers: {
      requestHandler: () => (req: any, res: any, next: any) => void;
      tracingHandler: () => (req: any, res: any, next: any) => void;
    };
    static captureException(error: Error): void;
    static captureMessage(message: string): void;
  }

  export default Sentry;
}