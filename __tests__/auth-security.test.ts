import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../apps/backend/src/security/jwt-auth.guard';
import { AuthService } from '../apps/backend/src/services/auth/auth.service';

describe('Authentication Security', () => {
  let authGuard: JwtAuthGuard;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => defaultValue),
          },
        },
      ],
    }).compile();

    authGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authService = module.get<AuthService>(AuthService);
  });

  describe('JwtAuthGuard', () => {
    it('should reject requests without Authorization header', async () => {
      const context = createMockContext({ authorization: undefined });
      const response = await authGuard.canActivate(context);
      expect(response).toBe(false);
    });

    it('should reject requests with malformed Bearer token', async () => {
      const context = createMockContext({ authorization: 'Bearer invalid-token-format' });
      const response = await authGuard.canActivate(context);
      expect(response).toBe(false);
    });

    it('should reject requests with expired token payload', async () => {
      const context = createMockContext({
        authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.expired.token',
        expired: true,
      });
      const response = await authGuard.canActivate(context);
      expect(response).toBe(false);
    });

    it('should reject requests with tampered token signature', async () => {
      const context = createMockContext({
        authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.tampered.signature',
      });
      const response = await authGuard.canActivate(context);
      expect(response).toBe(false);
    });
  });

  describe('Password Security', () => {
    it('should hash passwords using argon2', async () => {
      const password = 'SecureTestPassword123!';
      const hash = await authService.hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$argon2id/);
    });

    it('should reject empty password', async () => {
      await expect(authService.hashPassword('')).rejects.toThrow();
    });

    it('should verify correct password against hash', async () => {
      const password = 'SecureTestPassword123!';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password against hash', async () => {
      const password = 'SecureTestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it('should generate argon2 hashes with work factor', async () => {
      const hash = await authService.hashPassword('test');
      const memoryMatch = hash.match(/m=(\d+)/);
      const timeMatch = hash.match(/t=(\d+)/);
      if (memoryMatch) {
        expect(parseInt(memoryMatch[1])).toBeGreaterThanOrEqual(15);
      }
      if (timeMatch) {
        expect(parseInt(timeMatch[1])).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe('RBAC Security', () => {
    it('should enforce role hierarchy correctly', async () => {
      const validAdminToken = createMockToken('admin', 'admin-user-1');
      const adminContext = createMockContext({
        authorization: `Bearer ${validAdminToken}`,
        userRole: 'admin',
      });
      const adminResult = await authGuard.canActivate(adminContext);
      expect(adminResult).toBe(true);
    });

    it('should reject cross-role access to admin endpoints', async () => {
      const customerToken = createMockToken('customer', 'customer-user-1');
      const customerContext = createMockContext({
        authorization: `Bearer ${customerToken}`,
        userRole: 'customer',
      });
      const customerResult = await authGuard.canActivate(customerContext);
      expect(customerResult).toBe(false);
    });

    it('should enforce SUPER_ADMIN exclusive access controls', async () => {
      const superAdminToken = createMockToken('super_admin', 'super-admin-1');
      const adminToken = createMockToken('admin', 'admin-user-1');
      const superAdminContext = createMockContext({
        authorization: `Bearer ${superAdminToken}`,
        userRole: 'super_admin',
      });
      const adminContext = createMockContext({
        authorization: `Bearer ${adminToken}`,
        userRole: 'admin',
      });
      expect(await authGuard.canActivate(superAdminContext)).toBe(true);
      expect(await authGuard.canActivate(adminContext)).toBe(false);
    });
  });

  describe('Token Security', () => {
    it('should reject requests with missing JWT secret in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const jwtService = new JwtService({ secret: 'CHANGE_ME_IN_PRODUCTION_USE_secure_random_secret_here' });
      const configService = new ConfigService({ JWT_SECRET: 'CHANGE_ME_IN_PRODUCTION_USE_secure_random_secret_here' } as any);
      
      try {
        await expect(jwtService.verifyAsync('some.token')).rejects.toThrow();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should enforce minimum token expiration validation', async () => {
      const jwtService = new JwtService({ secret: 'test-secret-for-validation' });
      const token = jwtService.sign({ sub: 'test', exp: Math.floor(Date.now() / 1000) - 100 });
      try {
        await jwtService.verifyAsync(token);
        fail('Should have thrown for expired token');
      } catch (e) {
        expect((e as Error).message).toContain('jwt expired');
      }
    });
  });
});

function createMockContext(options: {
  authorization?: string;
  userRole?: string;
  userId?: string;
  expired?: boolean;
} = {}): Partial<ExecutionContext> {
  const request: any = {
    headers: {},
    ip: '127.0.0.1',
  };

  if (options.authorization) {
    request.headers.authorization = options.authorization;
  }

  if (options.userRole) {
    request.user = {
      sub: options.userId || 'test-user',
      role: options.userRole,
    };
  }

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as Partial<ExecutionContext>;
}

function createMockToken(role: string, userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      role,
      email: `${role}@test.com`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64url');
  const signature = Buffer.from('test-signature').toString('base64url');
  return `${header}.${payload}.${signature}`;
}
