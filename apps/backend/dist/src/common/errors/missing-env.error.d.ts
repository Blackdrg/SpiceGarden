interface EnvConfigService {
    get<T = string>(key: string, defaultValue?: T): T | undefined;
}
export declare class MissingEnvError extends Error {
    readonly key: string;
    readonly hint?: string | undefined;
    constructor(key: string, hint?: string | undefined);
}
export declare function isPlaceholderValue(value?: string): boolean;
export declare function getRequiredSecret(configService: EnvConfigService, key: string): string;
export declare function requireSecrets(keys: string[], configService: EnvConfigService): void;
export declare function requireEnv(keys: string[], configService: EnvConfigService): void;
export declare function requireOneOf(keys: string[], configService: EnvConfigService): string;
export {};
