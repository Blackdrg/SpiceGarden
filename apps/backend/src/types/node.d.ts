declare module "node" {
  interface BufferConstructor {
    new(size: number): Buffer;
    new(size: number[]): Buffer;
    new(buffer: ArrayBuffer | SharedArrayBuffer): Buffer;
    new(buffer: ArrayBuffer | SharedArrayBuffer, byteOffset: number, length?: number): Buffer;
    new(str: string, encoding?: BufferEncoding): Buffer;
    new(data: Uint8Array | readonly number[]): Buffer;
    from(data: number[] | string | Buffer | ArrayBuffer | Uint8Array): Buffer;
  }
  const Buffer: BufferConstructor;
  export { Buffer };
}
