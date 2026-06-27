declare module 'crypto-js' {
  export interface AESStatic {
    encrypt(message: string, key: string): CipherParams;
    decrypt(ciphertext: string, key: string): CipherParams;
  }

  export interface CipherParams {
    toString(enc?: any): string;
  }

  export interface EncStatic {
    Utf8: any;
  }

  export const AES: AESStatic;
  export const enc: EncStatic;
}
