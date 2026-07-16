import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface VaultConfig {
  enabled: boolean;
  address: string;
  token: string;
  secretPath: string;
}

@Injectable()
export class VaultService implements OnModuleInit {
  private readonly logger = new Logger(VaultService.name);
  private vaultEnabled: boolean;
  private vaultAddress: string;
  private vaultToken: string;
  private secretPath: string;
  private cache: Map<string, { value: string; timestamp: number }>;
  private readonly cacheTtlMs: number = 5 * 60 * 1000;

  constructor(private configService: ConfigService) {
    this.vaultEnabled = this.configService.get<boolean>('VAULT_ENABLED', false);
    this.vaultAddress = this.configService.get<string>('VAULT_ADDR', 'http://vault:8200');
    this.vaultToken = this.configService.get<string>('VAULT_TOKEN', '');
    this.secretPath = this.configService.get<string>('VAULT_SECRET_PATH', 'secret/spicegarden');
    this.cache = new Map();
  }

  async onModuleInit() {
    if (this.vaultEnabled) {
      await this.initializeVault();
    } else {
      this.logger.log('Vault integration disabled - using local secrets');
    }
  }

  private async initializeVault(): Promise<void> {
    try {
      const response = await this.fetchFromVault(`${this.vaultAddress}/v1/sys/health`);
      if (response.initialized && response.healthy) {
        this.logger.log('Vault connection verified');
      } else {
        this.logger.warn('Vault not healthy - falling back to local secrets');
      }
    } catch (error) {
      this.logger.warn(`Vault initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSecret<T = string>(key: string, fallback?: T): Promise<T> {
    if (this.vaultEnabled) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
        return cached.value as T;
      }

      try {
        const secretValue = await this.fetchSecretFromVault(key);
        this.cache.set(key, { value: secretValue, timestamp: Date.now() });
        return secretValue as T;
      } catch (error) {
        this.logger.warn(`Failed to fetch secret ${key} from Vault: ${error instanceof Error ? error.message : String(error)}`);
        if (fallback !== undefined) {
          return fallback;
        }
      }
    }
    return fallback as T;
  }

  private async fetchSecretFromVault(key: string): Promise<string> {
    const response = await this.fetchFromVault(`${this.vaultAddress}/v1/${this.secretPath}/${key}`);
    return response.data.value;
  }

  private async fetchFromVault(url: string): Promise<any> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Vault-Token': this.vaultToken,
      },
    });

    if (!response.ok) {
      throw new BadRequestException(`Vault request failed: ${response.status}`);
    }

    return response.json();
  }

  async rotateSecret(key: string, newValue: string): Promise<boolean> {
    if (!this.vaultEnabled) {
      this.logger.warn('Vault not enabled - cannot rotate secret');
      return false;
    }

    try {
      const response = await fetch(`${this.vaultAddress}/v1/${this.secretPath}/${key}`, {
        method: 'POST',
        headers: {
          'X-Vault-Token': this.vaultToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { value: newValue } }),
      });

      if (response.ok) {
        this.cache.set(key, { value: newValue, timestamp: Date.now() });
        this.logger.log(`Secret ${key} rotated successfully`);
        return true;
      }
    } catch (error) {
      this.logger.error(`Failed to rotate secret ${key}: ${error instanceof Error ? error.message : String(error)}`);
    }

    return false;
  }

  async auditSecrets(): Promise<{ missing: string[]; valid: string[] }> {
    const requiredSecrets = [
      'JWT_SECRET',
      'ENCRYPTION_SECRET',
      'STRIPE_SECRET_KEY',
      'RAZORPAY_KEY_SECRET',
      'STRIPE_WEBHOOK_SECRET',
      'RAZORPAY_WEBHOOK_SECRET',
    ];

    const missing: string[] = [];
    const valid: string[] = [];

    for (const secret of requiredSecrets) {
      try {
        const value = await this.getSecret(secret, process.env[secret]);
        if (value && !value.includes('CHANGE_ME') && !value.includes('placeholder')) {
          valid.push(secret);
        } else {
          missing.push(secret);
        }
      } catch {
        missing.push(secret);
      }
    }

    return { missing, valid };
  }

  isVaultConfigured(): boolean {
    return this.vaultEnabled && !!this.vaultToken;
  }
}