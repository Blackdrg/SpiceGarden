import { Injectable } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * Provides content hashing, digital signing and tamper verification for
 * immutable legal / compliance records. Signatures use HMAC-SHA256 keyed by
 * the application signing secret so that any record modification is detectable.
 */
@Injectable()
export class LegalIntegrityService {
  private readonly signingKey: string;

  constructor(private readonly configService: ConfigService) {
    const secret =
      this.configService.get<string>('LEGAL_SIGNING_SECRET') ||
      this.configService.get<string>('ENCRYPTION_SECRET') ||
      'legal-integrity-default';
    this.signingKey = secret;
  }

  hashContent(payload: Record<string, any> | string): string {
    const normalized =
      typeof payload === 'string' ? payload : JSON.stringify(this.canonicalize(payload));
    return createHash('sha256').update(normalized).digest('hex');
  }

  sign(payload: Record<string, any> | string): string {
    const normalized =
      typeof payload === 'string' ? payload : JSON.stringify(this.canonicalize(payload));
    return createHmac('sha256', this.signingKey).update(normalized).digest('hex');
  }

  verify(payload: Record<string, any> | string, signature: string): boolean {
    const expected = this.sign(payload);
    if (signature.length !== expected.length) return false;
    let mismatch = 0;
    for (let i = 0; i < expected.length; i++) {
      mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return mismatch === 0;
  }

  private canonicalize(obj: Record<string, any>): Record<string, any> {
    if (Array.isArray(obj)) {
      return obj.map((v) => (typeof v === 'object' && v !== null ? this.canonicalize(v) : v)) as any;
    }
    const sorted: Record<string, any> = {};
    for (const key of Object.keys(obj).sort()) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Buffer.isBuffer(value)) {
        sorted[key] = this.canonicalize(value);
      } else {
        sorted[key] = value;
      }
    }
    return sorted;
  }
}
