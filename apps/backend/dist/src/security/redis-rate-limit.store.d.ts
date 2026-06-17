import type { ClientRateLimitInfo, IncrementResponse, Options, Store } from 'express-rate-limit';
type RedisRateLimitStoreOptions = {
    redisUrl?: string;
    prefix?: string;
    fallbackToMemory?: boolean;
};
export declare class RedisRateLimitStore implements Store {
    readonly prefix: string;
    readonly localKeys = false;
    private readonly redisUrl;
    private readonly fallbackToMemory;
    private readonly memory;
    private client;
    private options;
    private redisAvailable;
    constructor(options?: RedisRateLimitStoreOptions);
    init(options: Options): Promise<void>;
    get(key: string): Promise<ClientRateLimitInfo | undefined>;
    increment(key: string): Promise<IncrementResponse>;
    decrement(key: string): Promise<void>;
    resetKey(key: string): Promise<void>;
    resetAll(): Promise<void>;
    shutdown(): Promise<void>;
    private redisKey;
}
export {};
