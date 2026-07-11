import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { getRequiredSecret } from '../common/errors/missing-env.error';

@Injectable()
export class EncryptionService {
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const secret = getRequiredSecret(this.configService, 'ENCRYPTION_SECRET');
    const salt = crypto.createHash('sha256').update(secret).digest().slice(0, 16);
    this.key = crypto.scryptSync(secret, salt, 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const plaintext = Buffer.from(text, 'utf-8');
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('base64')}.${ciphertext.toString('base64')}.${Buffer.from(authTag).toString('base64')}`;
  }

  decrypt(payload: string): string {
    try {
      const [ivB64, ciphertextB64, tagB64] = payload.split('.');
      if (!ivB64 || !ciphertextB64 || !tagB64) throw new Error('Invalid payload format');
      const iv = Buffer.from(ivB64, 'base64');
      const ciphertext = Buffer.from(ciphertextB64, 'base64');
      const authTag = Buffer.from(tagB64, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);
      const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return plaintext.toString('utf-8');
    } catch {
      throw new Error('Decryption failed');
    }
  }

  encryptPiiFields(obj: any, fields: string[]): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    const encrypted = { ...(obj as Record<string, any>) };
    for (const field of fields) {
      const value = encrypted[field];
      if (typeof value === 'string') {
        encrypted[field] = this.encrypt(value);
      }
    }
    return encrypted as any;
  }

  decryptPiiFields(obj: any, fields: string[]): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    const decrypted = { ...(obj as Record<string, any>) };
    for (const field of fields) {
      const value = decrypted[field];
      if (typeof value === 'string') {
        try {
          decrypted[field] = this.decrypt(value);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'unknown';
          throw new Error(`Failed to decrypt field ${field}: ${errMsg}`);
        }
      }
    }
    return decrypted as any;
  }
}
