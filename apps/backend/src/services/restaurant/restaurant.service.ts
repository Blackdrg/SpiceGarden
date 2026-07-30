import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { RedisAdapter } from '../../db/redis.adapter';
import { PaginationDto } from '../../shared/pagination/pagination.dto';

const CACHE_TTL_SECONDS = 300;
const CACHE_PREFIX = 'restaurant:';

@Injectable()
export class RestaurantService {
  private readonly logger = new Logger(RestaurantService.name);

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectDataSource()
    private readonly connection: DataSource,
    private readonly redisAdapter: RedisAdapter,
  ) {}

  async getAllRestaurants(pagination?: PaginationDto) {
    const page = pagination?.pageNumber ?? 1;
    const limit = pagination?.pageSize ?? 20;
    const cacheKey = `${CACHE_PREFIX}all:page:${page}:limit:${limit}`;
    const cached = await this.redisAdapter.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const [data, total] = await this.restaurantRepo.findAndCount({
      relations: { branches: true },
      where: { status: 'active' },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const result = { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    await this.redisAdapter.set(cacheKey, JSON.stringify(result), CACHE_TTL_SECONDS);
    return result;
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusInKm: number = 5,
    pagination?: PaginationDto,
  ) {
    const page = pagination?.pageNumber ?? 1;
    const limit = pagination?.pageSize ?? 20;
    const clampedRadius = Math.min(Math.max(radiusInKm, 0.1), 100);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return this.getOnlineBranches(page, limit);
    }

    const cacheKey = `${CACHE_PREFIX}nearby:${lat}:${lng}:${clampedRadius}:page:${page}:limit:${limit}`;
    let cached: string | null = null;
    try {
      cached = await this.redisAdapter.get(cacheKey);
    } catch (e) {
      this.logger.warn(`Redis get failed for nearby cache: ${e instanceof Error ? e.message : String(e)}`);
    }

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.warn(`Corrupted nearby cache, ignoring: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

      try {
        const radius = clampedRadius * 1000;
        const skip = (page - 1) * limit;
        const [results, total] = await this.branchRepo
          .createQueryBuilder('branch')
          .leftJoinAndSelect('branch.restaurant', 'restaurant')
          .select([
            'branch',
            'restaurant',
            `ST_DistanceSphere(ST_MakePoint(CAST(SUBSTRING(branch.location FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING(branch.location FROM ' ([^)]+)') AS float)), ST_MakePoint(:lng, :lat)) AS distance`,
          ])
          .where(
            `ST_DistanceSphere(ST_MakePoint(CAST(SUBSTRING(branch.location FROM '\\(([^ ]+)') AS float), CAST(SUBSTRING(branch.location FROM ' ([^)]+)') AS float)), ST_MakePoint(:lng, :lat)) <= :radius`,
            { lng, lat, radius },
          )
          .andWhere('branch.isOnline = :isOnline', { isOnline: true })
          .orderBy('distance', 'ASC')
          .skip(skip)
          .take(limit)
          .getManyAndCount();
        const result = {
          data: results,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
        try {
          await this.redisAdapter.set(cacheKey, JSON.stringify(result), CACHE_TTL_SECONDS);
        } catch (e) {
          this.logger.warn(`Redis set failed for nearby cache: ${e instanceof Error ? e.message : String(e)}`);
        }
        return result;
      } catch (e) {
      this.logger.error(
        'PostGIS query failed, falling back',
        e instanceof Error ? e.message : String(e),
      );
      return this.getOnlineBranches(page, limit);
    }
  }

  async getRestaurantDetails(slug: string) {
    const cacheKey = `${CACHE_PREFIX}details:${slug}`;
    const cached = await this.redisAdapter.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const restaurant = await this.restaurantRepo.findOne({
      where: { slug },
      relations: {
        branches: {
          categories: {
            items: true,
          },
        },
      },
    });
    if (restaurant) {
      await this.redisAdapter.set(cacheKey, JSON.stringify(restaurant), CACHE_TTL_SECONDS);
    }
    return restaurant;
  }

  async searchRestaurants(query: string, pagination?: PaginationDto) {
    if (!query || query.trim().length === 0) {
      return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    }
    const page = pagination?.pageNumber ?? 1;
    const limit = pagination?.pageSize ?? 20;
    const cacheKey = `${CACHE_PREFIX}search:${query.trim().toLowerCase()}:page:${page}:limit:${limit}`;
    const cached = await this.redisAdapter.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    const [data, total] = await this.restaurantRepo.findAndCount({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
      relations: { branches: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    const result = { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    await this.redisAdapter.set(cacheKey, JSON.stringify(result), CACHE_TTL_SECONDS);
    return result;
  }

  async updateBranchStatus(branchId: string, isOnline: boolean) {
    if (isOnline) {
      await this.redisAdapter.del(`${CACHE_PREFIX}all:*`);
      await this.redisAdapter.del(`${CACHE_PREFIX}nearby:*`);
    }
    return this.branchRepo.update(branchId, { isOnline });
  }

  private async getOnlineBranches(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.branchRepo.findAndCount({
      where: { isOnline: true },
      relations: { restaurant: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
