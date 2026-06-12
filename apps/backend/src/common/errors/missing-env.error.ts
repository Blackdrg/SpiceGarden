export class MissingEnvError extends Error {
  constructor(public readonly key: string, public readonly hint?: string) {
    super(`Required environment variable "${key}" is missing${hint ? ` — ${hint}` : ''}`);
    this.name = 'MissingEnvError';
  }
}

export function requireEnv(keys: string[], configService: any): void {
  for (const key of keys) {
    const value: string | undefined = configService.get(key);
    if (!value || value.trim() === '') {
      throw new MissingEnvError(
        key,
        'Copy .env.example to .env and fill in all required values before starting the server.'
      );
    }
  }
}

export function requireOneOf(keys: string[], configService: any): string {
  for (const key of keys) {
    const value: string | undefined = configService.get(key);
    if (value && value.trim() !== '' && !value.includes('CHANGE_ME')) {
      return value;
    }
  }
  throw new MissingEnvError(
    keys.join(' or '),
    'Set at least one of the listed variables to a real, non-placeholder value.'
  );
}
