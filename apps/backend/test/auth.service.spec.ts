import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/services/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UserEntity } from '../src/db/entities/user.entity';
import { SessionEntity } from '../src/db/entities/session.entity';
import { MfaService } from '../src/services/auth/mfa.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<UserEntity>;
  let sessionRepo: Repository<SessionEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(30),
          },
        },
        {
          provide: MfaService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SessionEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    sessionRepo = module.get<Repository<SessionEntity>>(getRepositoryToken(SessionEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password using argon2', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      const result = await service.hashPassword('test-password');
      expect(result).toBe('hashed-password');
      expect(argon2.hash).toHaveBeenCalledWith('test-password');
    });
  });

  describe('verifyPassword', () => {
    it('should verify a password against a hash', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      const result = await service.verifyPassword('test-password', 'hash');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      const result = await service.verifyPassword('wrong-password', 'hash');
      expect(result).toBe(false);
    });
  });

  describe('createSession', () => {
    it('should create and save a session', async () => {
      const mockSession = { id: 'session-id', userId: 'user-id', deviceName: 'mobile', deviceType: 'mobile', ipAddress: '127.0.0.1' };
      (sessionRepo.create as jest.Mock).mockReturnValue(mockSession);
      (sessionRepo.save as jest.Mock).mockResolvedValue(mockSession);

      const result = await service.createSession('user-id', { name: 'mobile', type: 'mobile', ip: '127.0.0.1' });

      expect(sessionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          deviceName: 'mobile',
          deviceType: 'mobile',
          ipAddress: '127.0.0.1',
        }),
      );
      expect(sessionRepo.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should create a new refresh token session and return token pair', async () => {
      const user = { id: 'user-id', email: 'test@test.com', role: 'customer', status: 'active' } as any;
      const savedSession = { id: 'session-id', userId: 'user-id', refreshToken: 'refresh-token' };

      (sessionRepo.create as jest.Mock).mockReturnValue({ userId: 'user-id', refreshToken: 'refresh-token' });
      (sessionRepo.save as jest.Mock).mockResolvedValue(savedSession);

      const result = await service.login(user, { name: 'mobile', type: 'ios', ip: '127.0.0.1' });

      expect(result).toEqual({ access_token: 'mock-jwt-token', refresh_token: expect.stringMatching(/^[0-9a-f]{60}$/) });
      expect(sessionRepo.save).toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should rotate refresh token for an active unexpired session', async () => {
      const user = { id: 'user-id', email: 'test@test.com', role: 'customer', status: 'active' } as any;
      const session = {
        id: 'session-id',
        refreshToken: 'old-refresh-token',
        expiresAt: new Date(Date.now() + 60_000),
        user,
        lastActiveAt: undefined,
      };

      (sessionRepo.findOne as jest.Mock).mockResolvedValue(session);
      (sessionRepo.save as jest.Mock).mockResolvedValue({ ...session, refreshToken: 'new-refresh-token' });

      const result = await service.refreshAccessToken('old-refresh-token', { name: 'web', type: 'chrome', ip: '127.0.0.1' });

      expect(session.refreshToken).toMatch(/^[0-9a-f]{60}$/);
      expect(session.lastActiveAt).toBeInstanceOf(Date);
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.refresh_token).toMatch(/^[0-9a-f]{60}$/);
    });

    it('should reject expired refresh tokens', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue({
        id: 'session-id',
        refreshToken: 'old-refresh-token',
        expiresAt: new Date(Date.now() - 1),
        user: { id: 'user-id', email: 'test@test.com', role: 'customer', status: 'active' },
      });

      await expect(service.refreshAccessToken('old-refresh-token', { name: 'web', type: 'chrome', ip: '127.0.0.1' }))
        .rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('revokeSession', () => {
    it('should deactivate an existing session', async () => {
      const session = { id: 'session-id', refreshToken: 'refresh-token', isActive: true, lastActiveAt: undefined } as any;
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(session);
      (sessionRepo.save as jest.Mock).mockResolvedValue({ ...session, isActive: false });

      await service.revokeSession('refresh-token');

      expect(session.isActive).toBe(false);
      expect(session.lastActiveAt).toBeInstanceOf(Date);
      expect(sessionRepo.save).toHaveBeenCalled();
    });

    it('should reject unknown refresh tokens', async () => {
      (sessionRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.revokeSession('unknown')).rejects.toThrow('Invalid or expired refresh token');
    });
  });

  describe('validateUser', () => {
    it('should throw error for missing credentials', async () => {
      await expect(service.validateUser('', '')).rejects.toThrow('Credentials required');
    });

    it('should throw error for non-existent user', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.validateUser('nonexistent@test.com', 'password')).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue({ email: 'test@test.com', passwordHash: 'hash' });
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      await expect(service.validateUser('test@test.com', 'wrong')).rejects.toThrow('Invalid email or password');
    });

    it('should return user without password hash for valid credentials', async () => {
      const mockUser = { id: 'user-id', email: 'test@test.com', passwordHash: 'hash', role: 'customer' };
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@test.com', 'password');

      expect(result).toEqual({ id: 'user-id', email: 'test@test.com', role: 'customer' });
    });
  });
});
