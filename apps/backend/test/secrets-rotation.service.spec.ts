import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SecretsRotationService } from '../src/compliance/secrets-rotation.service';

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.mock('util', () => ({
  promisify: jest.fn((fn: any) => fn),
}));

describe('SecretsRotationService', () => {
  let service: SecretsRotationService;
  let configService: jest.Mocked<ConfigService>;

  const mockExec = require('child_process').exec;

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    } as any;

    mockExec.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        { provide: ConfigService, useValue: configService },
        SecretsRotationService,
      ],
    }).compile();

    service = module.get<SecretsRotationService>(SecretsRotationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSecretsRequiringRotation', () => {
    it('should return all secrets when no rotation history exists', () => {
      configService.get.mockReturnValue(90);

      const result = service.getSecretsRequiringRotation();

      expect(result).toHaveLength(5);
      expect(result.map(s => s.name)).toEqual([
        'JWT_SECRET',
        'ENCRYPTION_SECRET',
        'STRIPE_SECRET_KEY',
        'DB_PASSWORD',
        'GRAFANA_ADMIN_PASSWORD',
      ]);
    });

    it('should filter secrets rotated within the retention period', () => {
      configService.get.mockReturnValue(90);
      const now = new Date();
      const recentDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oldDate = new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000);

      (service as any).rotationHistory.set('jwt_secret', [recentDate]);
      (service as any).rotationHistory.set('encryption', [oldDate]);

      const result = service.getSecretsRequiringRotation();

      expect(result.map(s => s.name)).toEqual([
        'ENCRYPTION_SECRET',
        'STRIPE_SECRET_KEY',
        'DB_PASSWORD',
        'GRAFANA_ADMIN_PASSWORD',
      ]);
    });
  });

  describe('validateRotationCapability', () => {
    it('should return failure when rotation script is missing', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await service.validateRotationCapability();

      expect(result.canRotateAll).toBe(false);
      expect(result.details[0]).toContain('Rotation script not found');

      jest.restoreAllMocks();
    });

    it('should validate rotation capability via script execution', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(service as any, 'getSecretsRequiringRotation').mockReturnValue([{ name: 'JWT_SECRET' }]);
      mockExec.mockResolvedValue({
        stdout: JSON.stringify({
          secretsDirectory: true,
          rotationScript: true,
          cryptoModule: true,
          writeAccess: true,
          k8sManifestExists: true,
        }),
        stderr: '',
      });

      const result = await service.validateRotationCapability();

      expect(result.canRotateAll).toBe(true);
      expect(result.details[0]).toContain('available and writable');

      jest.restoreAllMocks();
    });

    it('should handle script execution failure gracefully', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(service as any, 'getSecretsRequiringRotation').mockReturnValue([{ name: 'JWT_SECRET' }]);
      mockExec.mockRejectedValue(new Error('Script execution failed'));

      const result = await service.validateRotationCapability();

      expect(result.canRotateAll).toBe(false);
      expect(result.details[0]).toContain('Validation failed');

      jest.restoreAllMocks();
    });
  });

  describe('rotateSecret', () => {
    it('should return failure when rotation script is missing', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      const result = await service.rotateSecret('jwt_secret');

      expect(result.rotated).toBe(false);
      expect(result.error).toContain('Rotation script not found');

      jest.restoreAllMocks();
    });

    it('should rotate secret successfully via script execution', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      mockExec.mockResolvedValue({
        stdout: JSON.stringify({
          success: true,
          totalRotated: 1,
          results: [
            {
              secretName: 'jwt_secret',
              rotated: true,
              oldValueHash: 'abc123',
              newValueHash: 'def456',
            },
          ],
        }),
        stderr: '',
      });

      const result = await service.rotateSecret('jwt_secret');

      expect(result.rotated).toBe(true);
      expect(mockExec).toHaveBeenCalled();
      expect(mockExec.mock.calls[0][0]).toContain('secrets-rotation.ps1.js" rotate jwt_secret');

      jest.restoreAllMocks();
    });

    it('should return failure when script reports failure', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      mockExec.mockResolvedValue({
        stdout: JSON.stringify({
          success: false,
          message: 'Permission denied',
        }),
        stderr: '',
      });

      const result = await service.rotateSecret('jwt_secret');

      expect(result.rotated).toBe(false);
      expect(result.error).toContain('Permission denied');

      jest.restoreAllMocks();
    });

    it('should handle script execution errors gracefully', async () => {
      const fs = require('fs');
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      mockExec.mockRejectedValue(new Error('Process exited with code 1'));

      const result = await service.rotateSecret('jwt_secret');

      expect(result.rotated).toBe(false);
      expect(result.error).toContain('Process exited with code 1');

      jest.restoreAllMocks();
    });
  });

  describe('getRotationProof', () => {
    it('should return rotation proof with validation', async () => {
      jest.spyOn(service as any, 'getSecretsRequiringRotation').mockReturnValue([]);
      jest.spyOn(service, 'validateRotationCapability').mockResolvedValue({
        canRotateAll: true,
        details: ['All scripts available'],
      });

      const result = await service.getRotationProof();

      expect(result.validation).toEqual({ canRotateAll: true, details: ['All scripts available'] });
      expect(result.rotationLogPath).toBeDefined();
      expect(result.lastProofGenerated).toBeDefined();

      jest.restoreAllMocks();
    });
  });
});
