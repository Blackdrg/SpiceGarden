import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface VaultConfig {
    enabled: boolean;
    address: string;
    token: string;
    secretPath: string;
}
export declare class VaultService implements OnModuleInit {
    private configService;
    private readonly logger;
    private vaultEnabled;
    private vaultAddress;
    private vaultToken;
    private secretPath;
    private cache;
    private readonly cacheTtlMs;
    constructor(configService: ConfigService);
    onModuleInit(): any;
    private initializeVault;
    getSecret<T = string>(key: string, fallback?: T): Promise<T>;
    private fetchSecretFromVault;
    private fetchFromVault;
    rotateSecret(key: string, newValue: string): Promise<boolean>;
    auditSecrets(): Promise<{
        missing: string[];
        valid: string[];
    }>;
    isVaultConfigured(): boolean;
}
