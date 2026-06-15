export declare class MissingEnvError extends Error {
    readonly key: string;
    readonly hint?: string | undefined;
    constructor(key: string, hint?: string | undefined);
}
export declare function requireEnv(keys: string[], configService: any): void;
export declare function requireOneOf(keys: string[], configService: any): string;
