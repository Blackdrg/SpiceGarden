import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SecretLoaderService implements OnModuleInit {
    private configService;
    private readonly logger;
    private readonly secretsDir;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    private loadSecretsFromFile;
    private loadSecretsWithFileSuffix;
    static loadSecretFile(secretName: string): string | null;
}
