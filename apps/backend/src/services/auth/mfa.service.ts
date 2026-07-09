import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserEntity } from '../../db/entities/user.entity';
import { MfaSecretEntity } from '../../db/entities/mfa.entity';
import { EncryptionService } from '../../security/encryption.service';
import type { AuthenticatedUser } from './auth.service';

@Injectable()
export class MfaService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(MfaSecretEntity)
        private readonly mfaSecretRepository: Repository<MfaSecretEntity>,
        private readonly encryptionService: EncryptionService,
    ) { }

    async generateSecret(user: AuthenticatedUser) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(
            user.email,
            'SpiceGarden',
            secret,
        );

        let mfaSecret = await this.mfaSecretRepository.findOne({ where: { user: { id: user.id } } });
        if (!mfaSecret) {
            mfaSecret = this.mfaSecretRepository.create({ user });
        }

        mfaSecret.secret = await this.encryptionService.encrypt(secret);
        await this.mfaSecretRepository.save(mfaSecret);

        return {
            otpAuthUrl,
            qrCodeDataUrl: await toDataURL(otpAuthUrl),
        };
    }

    async verifyCode(user: AuthenticatedUser, code: string): Promise<boolean> {
        const mfaSecret = await this.mfaSecretRepository.findOne({ where: { user: { id: user.id } } });
        if (!mfaSecret || !mfaSecret.secret) {
            return false;
        }

        const decryptedSecret = await this.encryptionService.decrypt(mfaSecret.secret);

        return authenticator.verify({
            token: code,
            secret: decryptedSecret,
        });
    }

    async enableMfa(userId: string, code: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user || !(await this.verifyCode(user, code))) return false;

        await this.userRepository.update(userId, { isMfaEnabled: true });
        return true;
    }

    async disableMfa(userId: string, code: string): Promise<boolean> {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user || !(await this.verifyCode(user, code))) return false;

        await this.userRepository.update(userId, { isMfaEnabled: false });
        return true;
    }
}