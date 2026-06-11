import { Injectable, Optional } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IDatabaseAdapter } from './interfaces/database-adapter.interface';

@Injectable()
export class MongoAdapter<T> implements IDatabaseAdapter<T> {
  private connection: Connection | null = null;

  constructor(@Optional() @InjectConnection() connection?: Connection) {
    this.connection = connection || null;
  }

  async connect(): Promise<void> {
    // Mongoose handles connection automatically
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }
  }

  async query(query: string, params?: unknown[]): Promise<unknown> {
    if (this.connection) {
      return this.connection.db?.command({ ping: 1 });
    }
    return null;
  }

  async findOne(filter: unknown): Promise<T | null> { return null; }
  async findMany(filter: unknown): Promise<T[]> { return []; }
  async create(data: Partial<T>): Promise<T> { return data as T; }
  async update(id: string, data: Partial<T>): Promise<T> { return data as T; }
  async delete(id: string): Promise<boolean> { return true; }
}
