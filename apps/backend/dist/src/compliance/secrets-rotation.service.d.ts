import { ConfigService } from '@nestjs/config';
export interface SecretRotationResult {
    secretName: string;
    rotated: boolean;
    previousRotated: boolean;
    error?: string;
}
export declare class SecretsRotationService {
    private configService;
    private readonly logger;
    private readonly rotationHistory;
    constructor(configService: ConfigService);
    getSecretsRequiringRotation(): {
        name: string;
        lastRotation?: Date;
    }[];
    validateRotationCapability(): Promise<{
        canRotateAll: boolean;
        details: string[];
    }>;
    rotateSecret(secretName: string): Promise<SecretRotationResult>;
    private generateSecureRandom;
    private getLastRotation;
    private recordRotation;
    private checkRotationScriptExists;
    getRotationProof(): Promise<Record<string, any>>;
}
