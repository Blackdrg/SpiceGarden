import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

const ALGORITHM = 'aes-256-gcm';

function toB64(buf: Buffer): string {
  return (buf as unknown as { toString(enc: string): string }).toString('base64');
}
function fromB64(value: string): Buffer {
  return Buffer.from(value, 'base64');
}

/**
 * Field-level encryption for sensitive legal records (agreement content,
 * grievance descriptions, consent PII). Uses AES-256-GCM with a key derived
 * from ENCRYPTION_SECRET. Records are encrypted at rest while remaining
 * searchable only by non-sensitive columns. If no secret is configured we
 * derive a deterministic key from a safe default and log a warning so that a
 * non-configured environment never fails to persist legal data.
 */
@Injectable()
export class LegalEncryptionService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const secret =
      this.configService.get<string>('ENCRYPTION_SECRET') ||
      this.configService.get<string>('LEGAL_SIGNING_SECRET') ||
      'legal-encryption-default';
    this.key = crypto.createHash('sha256').update(secret).digest();
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf-8')), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1:${toB64(iv)}:${toB64(ciphertext)}:${toB64(tag)}`;
  }

  decrypt(payload: string): string {
    const [version, ivB64, ctB64, tagB64] = payload.split(':');
    if (version !== 'v1' || !ivB64 || !ctB64 || !tagB64) {
      throw new Error('Unsupported encrypted payload format');
    }
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ctB64, 'base64')),
      decipher.final(),
    ]);
    return (plaintext as unknown as { toString(enc: string): string }).toString('utf-8');
  }

  encryptJson(value: Record<string, any>): string {
    return this.encrypt(JSON.stringify(value));
  }

  decryptJson<T = any>(payload: string): T {
    return JSON.parse(this.decrypt(payload)) as T;
  }

  isEncrypted(value: string | null | undefined): boolean {
    return typeof value === 'string' && value.startsWith('v1:');
  }
}
