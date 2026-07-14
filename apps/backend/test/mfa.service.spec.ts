import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MfaService } from '../src/services/auth/mfa.service';
import { UserEntity } from '../src/db/entities/user.entity';
import { MfaSecretEntity } from '../src/db/entities/mfa.entity';
import { EncryptionService } from '../src/security/encryption.service';
import { AuthenticatedUser } from '../src/services/auth/auth.service';

jest.mock('otplib', () => ({
  authenticator: {
    generateSecret: jest.fn(() => 'RAWSECRET'),
    keyuri: jest.fn((email: string, issuer: string, secret: string) => `otpauth://totp/${issuer}:${email}?secret=${secret}`),
    verify: jest.fn(),
  },
}));
jest.mock('qrcode', () => ({ toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,XX')) }));

describe('MfaService', () => {
  let service: MfaService;
  let userRepo: Repository<UserEntity>;
  let mfaRepo: Repository<MfaSecretEntity>;
  let encryptionService: EncryptionService;

  const user: AuthenticatedUser = { id: 'u1', email: 'a@b.com', fullName: 'T', role: 'customer' as any, status: 'active' as any, isMfaEnabled: false };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        { provide: getRepositoryToken(UserEntity), useValue: { findOneBy: jest.fn(), update: jest.fn() } },
        { provide: getRepositoryToken(MfaSecretEntity), useValue: { findOne: jest.fn(), create: jest.fn(), save: jest.fn() } },
        { provide: EncryptionService, useValue: { encrypt: jest.fn().mockResolvedValue('ENC'), decrypt: jest.fn().mockResolvedValue('RAWSECRET') } },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    mfaRepo = module.get<Repository<MfaSecretEntity>>(getRepositoryToken(MfaSecretEntity));
    encryptionService = module.get<EncryptionService>(EncryptionService);
  });

  it('generates a secret, qr code and persists encrypted secret (new record)', async () => {
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue(null);
    jest.spyOn(mfaRepo, 'create').mockReturnValue({ user } as MfaSecretEntity);
    jest.spyOn(mfaRepo, 'save').mockResolvedValue({} as MfaSecretEntity);

    const result = await service.generateSecret(user);

    expect(result.otpAuthUrl).toContain('otpauth://totp/SpiceGarden:a@b.com');
    expect(result.qrCodeDataUrl).toBe('data:image/png;base64,XX');
    expect(encryptionService.encrypt).toHaveBeenCalledWith('RAWSECRET');
    expect(mfaRepo.save).toHaveBeenCalled();
  });

  it('reuses an existing mfa secret record when generating', async () => {
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue({ id: 'm1', user } as MfaSecretEntity);
    jest.spyOn(mfaRepo, 'save').mockResolvedValue({} as MfaSecretEntity);

    await service.generateSecret(user);
    expect(mfaRepo.create).not.toHaveBeenCalled();
    expect(mfaRepo.save).toHaveBeenCalled();
  });

  it('verifyCode returns false when no secret record exists', async () => {
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue(null);
    expect(await service.verifyCode(user, '123456')).toBe(false);
  });

  it('verifyCode returns false when the stored secret is empty', async () => {
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue({ secret: '' } as MfaSecretEntity);
    expect(await service.verifyCode(user, '123456')).toBe(false);
  });

  it('verifyCode decrypts the secret and delegates to authenticator.verify', async () => {
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue({ secret: 'ENC' } as MfaSecretEntity);
    const authenticator = require('otplib').authenticator;
    (authenticator.verify as jest.Mock).mockReturnValue(true);

    const result = await service.verifyCode(user, '123456');
    expect(encryptionService.decrypt).toHaveBeenCalledWith('ENC');
    expect(authenticator.verify).toHaveBeenCalledWith({ token: '123456', secret: 'RAWSECRET' });
    expect(result).toBe(true);
  });

  it('enableMfa returns false when user missing', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);
    expect(await service.enableMfa('u1', '123456')).toBe(false);
  });

  it('enableMfa returns false when code invalid', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as UserEntity);
    const authenticator = require('otplib').authenticator;
    (authenticator.verify as jest.Mock).mockReturnValue(false);
    expect(await service.enableMfa('u1', '000000')).toBe(false);
  });

  it('enableMfa enables MFA on valid code', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as UserEntity);
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue({ secret: 'ENC' } as MfaSecretEntity);
    const authenticator = require('otplib').authenticator;
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    jest.spyOn(userRepo, 'update').mockResolvedValue(undefined as any);

    expect(await service.enableMfa('u1', '123456')).toBe(true);
    expect(userRepo.update).toHaveBeenCalledWith('u1', { isMfaEnabled: true });
  });

  it('disableMfa returns false when user missing', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(null);
    expect(await service.disableMfa('u1', '123456')).toBe(false);
  });

  it('disableMfa returns false when code invalid', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as UserEntity);
    const authenticator = require('otplib').authenticator;
    (authenticator.verify as jest.Mock).mockReturnValue(false);
    expect(await service.disableMfa('u1', '000000')).toBe(false);
  });

  it('disableMfa disables MFA on valid code', async () => {
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValue(user as UserEntity);
    jest.spyOn(mfaRepo, 'findOne').mockResolvedValue({ secret: 'ENC' } as MfaSecretEntity);
    const authenticator = require('otplib').authenticator;
    (authenticator.verify as jest.Mock).mockReturnValue(true);
    jest.spyOn(userRepo, 'update').mockResolvedValue(undefined as any);

    expect(await service.disableMfa('u1', '123456')).toBe(true);
    expect(userRepo.update).toHaveBeenCalledWith('u1', { isMfaEnabled: false });
  });
});
