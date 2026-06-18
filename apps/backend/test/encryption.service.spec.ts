import { describe, it, expect, beforeEach } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from '../src/security/encryption.service';
import { ConfigService } from '@nestjs/config';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncryptionService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-encryption-secret-key-32ch'),
          },
        },
      ],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  describe('encrypt', () => {
    it('should encrypt a string value', () => {
      const result = service.encrypt('sensitive-data');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('sensitive-data');
    });

    it('should produce different ciphertext for same input', () => {
      const result1 = service.encrypt('test-data');
      const result2 = service.encrypt('test-data');
      expect(result1).not.toBe(result2);
    });
  });

describe('decrypt', () => {
    it('should decrypt an encrypted value', () => {
      const original = 'sensitive-data';
      const encrypted = service.encrypt(original);
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(original);
    });
  });

  describe('encryptPiiFields', () => {
    it('should encrypt specified string fields in an object', () => {
      const obj = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const result = service.encryptPiiFields(obj, ['name', 'email']);
      
      expect(result.name).not.toBe('John Doe');
      expect(result.email).not.toBe('john@example.com');
      expect(result.age).toBe(30);
    });

    it('should handle null input gracefully', () => {
      const result = service.encryptPiiFields(null, ['name']);
      expect(result).toBeNull();
    });

    it('should handle non-object input gracefully', () => {
      const result = service.encryptPiiFields('string', ['name']);
      expect(result).toBe('string');
    });
  });

describe('decryptPiiFields', () => {
    it('should decrypt specified string fields in an object', () => {
      const obj = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const encrypted = { name: service.encrypt('John Doe'), email: service.encrypt('john@example.com'), age: 30 };
      const result = service.decryptPiiFields(encrypted, ['name', 'email']);
      
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.age).toBe(30);
    });

    it('should handle null input gracefully', () => {
      const result = service.decryptPiiFields(null, ['name']);
      expect(result).toBeNull();
    });

    it('should handle non-object input gracefully', () => {
      const result = service.decryptPiiFields('string', ['name']);
      expect(result).toBe('string');
    });
  });
});
