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
    const secretFiles: Record<string, string> = {
      jwt_secret: 'JWT_SECRET',
      encryption_secret: 'ENCRYPTION_SECRET',
      stripe_secret: 'STRIPE_SECRET_KEY',
      razorpay_key_id: 'RAZORPAY_KEY_ID',
      razorpay_key_secret: 'RAZORPAY_KEY_SECRET',
      fcm_server_key: 'FCM_SERVER_KEY',
      apns_private_key: 'APNS_PRIVATE_KEY',
      apns_key_id: 'APNS_KEY_ID',
      apns_team_id: 'APNS_TEAM_ID',
      sendgrid_api_key: 'SENDGRID_API_KEY',
      google_maps_api_key: 'GOOGLE_MAPS_API_KEY',
      twilio_account_sid: 'TWILIO_ACCOUNT_SID',
      twilio_auth_token: 'TWILIO_AUTH_TOKEN',
      db_password: 'DB_PASS',
      redis_password: 'REDIS_PASSWORD',
      vault_token: 'VAULT_TOKEN',
      stripe_webhook_secret: 'STRIPE_WEBHOOK_SECRET',
      razorpay_webhook_secret: 'RAZORPAY_WEBHOOK_SECRET',
      stripe_connect_secret: 'STRIPE_CONNECT_SECRET_KEY',
      stripe_connect_webhook_secret: 'STRIPE_CONNECT_WEBHOOK_SECRET',
    };

    for (const [secretName, envVarName] of Object.entries(secretFiles)) {
      const filePath = path.join(this.secretsDir, `${secretName}.txt`);
      if (fs.existsSync(filePath)) {
        const value = fs.readFileSync(filePath, 'utf8').trim();
        if (value && !value.includes('CHANGE_ME')) {
          process.env[envVarName] = value;
          this.logger.debug(`Loaded secret: ${envVarName}`);
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