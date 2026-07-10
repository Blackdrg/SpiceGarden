import { Repository } from 'typeorm';
import { UserEntity } from '../../db/entities/user.entity';
import { MfaSecretEntity } from '../../db/entities/mfa.entity';
import { EncryptionService } from '../../security/encryption.service';
import type { AuthenticatedUser } from './auth.service';
export declare class MfaService {
    private readonly userRepository;
    private readonly mfaSecretRepository;
    private readonly encryptionService;
    constructor(userRepository: Repository<UserEntity>, mfaSecretRepository: Repository<MfaSecretEntity>, encryptionService: EncryptionService);
    generateSecret(user: AuthenticatedUser): Promise<{
        otpAuthUrl: string;
        qrCodeDataUrl: string;
    }>;
    verifyCode(user: AuthenticatedUser, code: string): Promise<boolean>;
    enableMfa(userId: string, code: string): Promise<boolean>;
    disableMfa(userId: string, code: string): Promise<boolean>;
}
