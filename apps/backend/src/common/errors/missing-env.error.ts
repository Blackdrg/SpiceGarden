const PLACEHOLDER_MARKERS = [
  'CHANGE_ME',
  'secret_here',
  'placeholder',
  'sk_test_placeholder',
  'rzp_test_placeholder',
  'whsec_test_placeholder',
  'test_placeholder',
  '<fill',
  '<must replace',
];

interface EnvConfigService {
  get<T = string>(key: string, defaultValue?: T): T | undefined;
}

export class MissingEnvError extends Error {
  constructor(public readonly key: string, public readonly hint?: string) {
    super(`Required environment variable "${key}" is missing${hint ? ` — ${hint}` : ''}`);
    this.name = 'MissingEnvError';
  }
}

export function isPlaceholderValue(value?: string): boolean {
  if (!value || value.trim() === '') {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker.toLowerCase()));
}

export function getRequiredSecret(configService: EnvConfigService, key: string): string {
  const value = configService.get<string>(key);
  if (isPlaceholderValue(value)) {
    throw new MissingEnvError(
      key,
      'Set a real, non-placeholder value before starting the server.'
    );
  }

  return value as string;
}

export function requireSecrets(keys: string[], configService: EnvConfigService): void {
  for (const key of keys) {
    getRequiredSecret(configService, key);
  }
}

export function requireEnv(keys: string[], configService: EnvConfigService): void {
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

export function requireOneOf(keys: string[], configService: EnvConfigService): string {
  for (const key of keys) {
    const value: string | undefined = configService.get(key);
    if (value && value.trim() !== '' && !isPlaceholderValue(value)) {
      return value;
    }
  }
  throw new MissingEnvError(
    keys.join(' or '),
    'Set at least one of the listed variables to a real, non-placeholder value.'
  );
}
