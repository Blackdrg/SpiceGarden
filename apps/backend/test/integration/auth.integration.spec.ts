import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../../src/services/auth/auth.service';
import { MfaService } from '../../src/services/auth/mfa.service';
import { UserEntity } from '../../src/db/entities/user.entity';
import { SessionEntity } from '../../src/db/entities/session.entity';
import { MfaSecretEntity } from '../../src/db/entities/mfa.entity';
import { UserRole, UserStatus } from '../../src/shared/domain/user.interface';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Auth Service Integration', () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let userRepo: Repository<UserEntity>;
  let sessionRepo: Repository<SessionEntity>;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity, SessionEntity, MfaSecretEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([UserEntity, SessionEntity, MfaSecretEntity]),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '60m' },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [
        AuthService,
        MfaService,
        {
          provide: MfaService,
          useValue: {
            verifyCode: async () => true,
          },
        },
      ],
    }).compile();

    authService = moduleRef.get(AuthService);
    userRepo = moduleRef.get(getRepositoryToken(UserEntity));
    sessionRepo = moduleRef.get(getRepositoryToken(SessionEntity));
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await sessionRepo.clear();
    await userRepo.clear();
  });

  function createUser(overrides: Partial<UserEntity> = {}): UserEntity {
    const user = new UserEntity();
    user.email = overrides.email || 'test@example.com';
    user.fullName = overrides.fullName || 'Test User';
    user.phone = overrides.phone || '+1234567890';
    user.passwordHash = overrides.passwordHash || 'hashed-password';
    user.role = overrides.role || UserRole.CUSTOMER;
    user.status = overrides.status || UserStatus.ACTIVE;
    user.emailVerified = overrides.emailVerified ?? false;
    user.phoneVerified = overrides.phoneVerified ?? false;
    user.isMfaEnabled = overrides.isMfaEnabled ?? false;
    return user;
  }

  describe('Password Management', () => {
    it('should hash a password', async () => {
      const password = 'SecurePass123!';
      const hash = await authService.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should verify a correct password', async () => {
      const password = 'SecurePass123!';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const hash = await authService.hashPassword('SecurePass123!');
      const isValid = await authService.verifyPassword('WrongPass456!', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('User Validation', () => {
    it('should validate user with correct credentials', async () => {
      const passwordHash = await authService.hashPassword('SecurePass123!');
      const user = createUser({ email: 'test@example.com', passwordHash });
      await userRepo.save(user);

      const validated = await authService.validateUser('test@example.com', 'SecurePass123!');
      expect(validated).toBeDefined();
      expect(validated.email).toBe('test@example.com');
      expect(validated.passwordHash).toBeUndefined();
    });

    it('should reject invalid credentials', async () => {
      await expect(authService.validateUser('nonexistent@example.com', 'wrongpass')).rejects.toThrow();
    });
  });

  describe('Session Management', () => {
    it('should create a session', async () => {
      const passwordHash = await authService.hashPassword('SecurePass123!');
      const user = createUser({ email: 'session-test@example.com', passwordHash });
      const savedUser = await userRepo.save(user);

      const session = await authService.createSession(savedUser.id, { name: 'test', type: 'web', ip: '127.0.0.1' }, 'refresh-token-123');

      expect(session).toBeDefined();
      expect(session.userId).toBe(savedUser.id);
      expect(session.refreshToken).toBe('refresh-token-123');
      expect(session.isActive).toBe(true);

      const dbSession = await sessionRepo.findOne({ where: { refreshToken: 'refresh-token-123' } });
      expect(dbSession).toBeDefined();
      expect(dbSession!.userId).toBe(savedUser.id);
    });

    it('should revoke a session', async () => {
      const passwordHash = await authService.hashPassword('SecurePass123!');
      const user = createUser({ email: 'revoke-test@example.com', passwordHash });
      const savedUser = await userRepo.save(user);

      await authService.createSession(savedUser.id, { name: 'test', type: 'web', ip: '127.0.0.1' }, 'refresh-to-revoke');
      await authService.revokeSession('refresh-to-revoke');

      const session = await sessionRepo.findOne({ where: { refreshToken: 'refresh-to-revoke' } });
      expect(session).toBeDefined();
      expect(session!.isActive).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate login tokens', async () => {
      const passwordHash = await authService.hashPassword('SecurePass123!');
      const user = createUser({ email: 'token-test@example.com', passwordHash });
      const savedUser = await userRepo.save(user);

      const validated = { ...savedUser, passwordHash: undefined } as any;
      const tokens = await authService.login(validated, { name: 'test', type: 'web', ip: '127.0.0.1' });

      expect(tokens.access_token).toBeDefined();
      expect(tokens.refresh_token).toBeDefined();
      expect(tokens.access_token.length).toBeGreaterThan(0);
      expect(tokens.refresh_token.length).toBeGreaterThan(0);

      const sessions = await sessionRepo.find({ where: { userId: savedUser.id } });
      expect(sessions.length).toBe(1);
    });

    it('should refresh access token', async () => {
      const passwordHash = await authService.hashPassword('SecurePass123!');
      const user = createUser({ email: 'refresh-test@example.com', passwordHash });
      const savedUser = await userRepo.save(user);

      const validated = { ...savedUser, passwordHash: undefined } as any;
      const initialTokens = await authService.login(validated, { name: 'test', type: 'web', ip: '127.0.0.1' });

      const refreshed = await authService.refreshAccessToken(initialTokens.refresh_token, { name: 'test', type: 'web', ip: '127.0.0.1' });

      expect(refreshed.access_token).toBeDefined();
      expect(refreshed.refresh_token).toBeDefined();
      expect(refreshed.refresh_token).not.toBe(initialTokens.refresh_token);
    });
  });
});
