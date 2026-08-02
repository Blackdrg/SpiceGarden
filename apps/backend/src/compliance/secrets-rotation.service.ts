import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SecretRotationResult {
  secretName: string;
  rotated: boolean;
  previousRotated: boolean;
  error?: string;
}

@Injectable()
export class SecretsRotationService {
  private readonly logger = new Logger(SecretsRotationService.name);
  private readonly rotationHistory: Map<string, Date[]> = new Map();
  private readonly rotationLogPath: string;
  private readonly rotationScriptPath: string;

  constructor(private configService: ConfigService) {
    this.rotationLogPath = path.join(process.cwd(), 'secrets', 'rotation-history.json');
    this.rotationScriptPath = path.join(process.cwd(), 'infra', 'scripts', 'secrets-rotation.ps1.js');
    this.loadRotationHistory();
  }

  getSecretsRequiringRotation(): { name: string; lastRotation?: Date }[] {
    const secrets: { name: string; lastRotation?: Date }[] = [
      { name: 'JWT_SECRET', lastRotation: this.getLastRotation('jwt_secret') },
      { name: 'ENCRYPTION_SECRET', lastRotation: this.getLastRotation('encryption') },
      { name: 'STRIPE_SECRET_KEY', lastRotation: this.getLastRotation('stripe') },
      { name: 'DB_PASSWORD', lastRotation: this.getLastRotation('db_password') },
      { name: 'GRAFANA_ADMIN_PASSWORD', lastRotation: this.getLastRotation('grafana') },
    ];

    const rotationPeriod = this.configService.get<number>('SECRET_ROTATION_DAYS', 90);
    const now = Date.now();

    return secrets.filter(s => {
      if (!s.lastRotation) return true;
      return (now - s.lastRotation.getTime()) > (rotationPeriod * 24 * 60 * 60 * 1000);
    });
  }

  async validateRotationCapability(): Promise<{ canRotateAll: boolean; details: string[] }> {
    const secretsRequiringRotation = this.getSecretsRequiringRotation();

    if (!fs.existsSync(this.rotationScriptPath)) {
      return {
        canRotateAll: false,
        details: [`Rotation script not found at ${this.rotationScriptPath}`],
      };
    }

    const validationPromises = secretsRequiringRotation.map(async (secret) => {
      try {
        const { stdout } = await execAsync(`node "${this.rotationScriptPath}" validate`);
        const validation = JSON.parse(stdout);
        const hasScript = validation.rotationScript && validation.writeAccess;
        return `${secret.name}: ${hasScript ? 'Rotation script available and writable' : 'Manual rotation required via Vault/K8s secrets'} (${this.rotationScriptPath})`;
      } catch (error) {
        return `${secret.name}: Validation failed - ${error instanceof Error ? error.message : 'unknown error'}`;
      }
    });

    const details = await Promise.all(validationPromises);

    return {
      canRotateAll: details.every(d => d.includes('available and writable')),
      details,
    };
  }

  async rotateSecret(secretName: string): Promise<SecretRotationResult> {
    try {
      this.logger.log(`Initiating rotation for ${secretName}`);

      if (!fs.existsSync(this.rotationScriptPath)) {
        const errMsg = `Rotation script not found at ${this.rotationScriptPath}`;
        this.logger.error(`Failed to rotate ${secretName}: ${errMsg}`);
        return {
          secretName,
          rotated: false,
          previousRotated: false,
          error: errMsg,
        };
      }

      const scriptResult = await execAsync(`node "${this.rotationScriptPath}" rotate ${secretName}`);
      let rotationOutput;
      try {
        rotationOutput = JSON.parse(scriptResult.stdout);
      } catch {
        rotationOutput = { success: false, message: 'Invalid script output' };
      }

      if (!rotationOutput.success) {
        const errMsg = rotationOutput.message || 'Script returned failure';
        this.logger.error(`Failed to rotate ${secretName}: ${errMsg}`);
        return {
          secretName,
          rotated: false,
          previousRotated: false,
          error: errMsg,
        };
      }

      const rotationTime = new Date();
      this.recordRotation(secretName, rotationTime);
      await this.persistRotationHistory();

      this.logger.log(`Rotation completed for ${secretName} via script`);

      return {
        secretName,
        rotated: true,
        previousRotated: true,
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'any error';
      this.logger.error(`Failed to rotate ${secretName}: ${errMsg}`);

      return {
        secretName,
        rotated: false,
        previousRotated: false,
        error: errMsg,
      };
    }
  }

  private generateSecureRandom(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    const cryptoObj = require('crypto');
    const bytes = cryptoObj.randomBytes(32);

    for (let i = 0; i < 32; i++) {
      result += chars.charAt(bytes[i] % chars.length);
    }

    return result;
  }

  private getLastRotation(secretName: string): Date | undefined {
    const rotations = this.rotationHistory.get(secretName);
    return rotations?.[rotations.length - 1];
  }

  private recordRotation(secretName: string, date: Date): void {
    const rotations = this.rotationHistory.get(secretName) || [];
    rotations.push(date);
    this.rotationHistory.set(secretName, rotations);
  }

  private persistRotationHistory(): void {
    try {
      const dir = path.dirname(this.rotationLogPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data: Record<string, string[]> = {};
      this.rotationHistory.forEach((dates, key) => {
        data[key] = dates.map(d => d.toISOString());
      });
      fs.writeFileSync(this.rotationLogPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      this.logger.warn(`Failed to persist rotation history: ${(error as Error).message}`);
    }
  }

  private loadRotationHistory(): void {
    try {
      if (fs.existsSync(this.rotationLogPath)) {
        const content = fs.readFileSync(this.rotationLogPath, 'utf-8');
        const data: Record<string, string[]> = JSON.parse(content);
        Object.entries(data).forEach(([key, dates]) => {
          this.rotationHistory.set(key, dates.map(d => new Date(d)));
        });
        this.logger.log(`Loaded rotation history from ${this.rotationLogPath}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to load rotation history: ${(error as Error).message}`);
    }
  }

  async getRotationProof(): Promise<Record<string, any>> {
    return {
      rotationHistory: Object.fromEntries(
        Array.from(this.rotationHistory.entries()).map(([k, v]) => [k, v.map(d => d.toISOString())])
      ),
      secretsRequiringRotation: this.getSecretsRequiringRotation(),
      validation: await this.validateRotationCapability(),
      lastProofGenerated: new Date().toISOString(),
      rotationLogPath: this.rotationLogPath,
    };
  }
}