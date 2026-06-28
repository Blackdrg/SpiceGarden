declare module 'crypto' {
  export function createHmac(algorithm: string, key: string | any): any;
  export function randomBytes(size: number): any;
}

declare const Buffer: any;
type BufferEncoding = "utf8" | "utf-8" | "ascii" | "base64" | "base64url" | "hex";
declare const crypto: any;

declare module 'compression' {
  export interface CompressionOptions {
    level?: number;
    threshold?: number;
    filter?: (req: any, res: any) => boolean;
  }
  function compression(options?: CompressionOptions): any;
  export default compression;
}

declare module 'crypto-js' {
  export interface CryptoJS {
    AES: {
      encrypt: (text: string, key: any) => any;
      decrypt: (ciphertext: string, key: any) => any;
    };
    enc: {
      Utf8: any;
    };
  }
  export const AES: {
    encrypt: (text: string, key: any) => any;
    decrypt: (ciphertext: string, key: any) => any;
  };
  export const enc: { Utf8: any };
  const CryptoJS: CryptoJS;
  export default CryptoJS;
}
