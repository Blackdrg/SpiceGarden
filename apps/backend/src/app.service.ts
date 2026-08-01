import { Injectable } from '@nestjs/common';
import { AppDataSource } from './db/data-source';
import { RedisAdapter } from './db/redis.adapter';

@Injectable()
export class AppService {
  constructor(private readonly redisAdapter: RedisAdapter) {}

  async getHealth() {
    const dbStatus = await this.checkDbHealth();
    const redisStatus = await this.checkRedisHealth();
    const allHealthy = dbStatus && redisStatus;

    return {
      status: allHealthy ? 'ok' : 'degraded',
      service: 'spicegarden-api',
      timestamp: new Date().toISOString(),
      dependencies: {
        database: dbStatus ? 'healthy' : 'unhealthy',
        redis: redisStatus ? 'healthy' : 'unhealthy',
      },
    };
  }

  private async checkDbHealth(): Promise<boolean> {
    try {
      await AppDataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  private async checkRedisHealth(): Promise<boolean> {
    try {
      const result = await this.redisAdapter.get('__health_check__');
      return result !== null || true;
    } catch {
      return false;
    }
  }
}
