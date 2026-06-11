import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SecretLoaderService implements OnModuleInit {
  private readonly logger = new Logger(SecretLoaderService.name);
  private readonly secretsDir = process.env.SECRETS_DIR || path.join(process.cwd(), 'secrets');

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.loadSecretsFromFile();
  }

  private loadSecretsFromFile() {
    const secretFiles = [
      'jwt_secret',
      'encryption_secret',
      'stripe_secret',
      'razorpay_key_id',
      'razorpay_key_secret',
      'fcm_server_key',
      'apns_private_key',
      'apns_key_id',
      'apns_team_id',
      'sendgrid_api_key',
      'google_maps_api_key',
      'twilio_account_sid',
      'twilio_auth_token',
      'db_password',
      'redis_password',
      'vault_token',
      'stripe_webhook_secret',
      'razorpay_webhook_secret',
      'stripe_connect_secret',
      'stripe_connect_webhook_secret',
    ];

    for (const secretName of secretFiles) {
      const filePath = path.join(this.secretsDir, `${secretName}.txt`);
      if (fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, 'utf8').trim();
        if (value && !value.includes('CHANGE_ME')) {
          process.env[secretName.toUpperCase()] = value;
          this.logger.debug(`Loaded secret: ${secretName}`);
        }
      }
    }

    this.loadSecretsWithFileSuffix();
  }

  private loadSecretsWithFileSuffix() {
    for (const [key, value] of Object.entries(process.env)) {
      if (key.endsWith('_FILE') && value) {
        const filePath = value;
        if (fs.existsSync(filePath)) {
          const secretValue = fs.readFileSync(filePath, 'utf8').trim();
          const envVarName = key.replace('_FILE', '');
          process.env[envVarName] = secretValue;
          this.logger.debug(`Loaded ${envVarName} from ${filePath}`);
        } else {
          this.logger.warn(`Secret file not found: ${filePath}`);
        }
      }
    }
  }

  static loadSecretFile(secretName: string): string | null {
    const secretsDir = process.env.SECRETS_DIR || path.join(process.cwd(), 'secrets');
    const filePath = path.join(secretsDir, `${secretName}.txt`);

    if (fs.existsSync(filePath)) {
      const value = fs.readFileSync(filePath, 'utf8').trim();
      if (value && !value.includes('CHANGE_ME')) {
        return value;
      }
    }
    return null;
  }
}