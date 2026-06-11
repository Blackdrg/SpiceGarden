declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
    NEXT_PUBLIC_SENTRY_DSN?: string;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
