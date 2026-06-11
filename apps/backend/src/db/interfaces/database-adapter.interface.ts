export interface IDatabaseAdapter<T> {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(query: string, params?: unknown[]): Promise<unknown>;
  findOne(filter: unknown): Promise<T | null>;
  findMany(filter: unknown): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}
