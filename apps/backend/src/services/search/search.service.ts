import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly menuRepo: Repository<MenuItemEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
  ) {}

  async search(query: string) {
    const restaurants = await this.restaurantRepo.find({
      where: [
        { name: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
      ],
    });

const items = await this.menuRepo.find({
       where: [
         { name: Like(`%${query}%`) },
         { description: Like(`%${query}%`) },
       ],
       relations: { 
         category: { 
           branch: { 
             restaurant: true 
           } 
         } 
       },
     });

    return { restaurants, items };
  }

  async getTrending() {
    return this.menuRepo.find({ take: 5 });
  }

  async getRecommended(userId: string) {
    return this.menuRepo.find({ take: 5 });
  }
}
