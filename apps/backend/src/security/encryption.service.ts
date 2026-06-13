import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class EncryptionService {
  private readonly secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('ENCRYPTION_SECRET')!;
    if (!this.secretKey || this.secretKey.includes('CHANGE_ME')) {
      throw new Error(
        'ENCRYPTION_SECRET not configured. Set secure random secret before starting.',
      );
    }
  }

  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.secretKey).toString();
  }

  decrypt(ciphertext: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
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
          const errMsg = error instanceof Error ? error.message : 'any';
          throw new Error(`Failed to decrypt field ${field}: ${errMsg}`);
        }
      }
    }
    return decrypted as any;
  }
}
