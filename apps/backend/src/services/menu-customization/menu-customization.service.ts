import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuAddonEntity } from '../../db/entities/menu-addon.entity';

@Injectable()
export class MenuCustomizationService {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(MenuCategoryEntity)
    private readonly categoryRepo: Repository<MenuCategoryEntity>,
    @InjectRepository(MenuAddonEntity)
    private readonly addonRepo: Repository<MenuAddonEntity>,
  ) { }

  async getMenuItems(restaurantId: string, category?: string) {
    const whereClause: any = category
      ? { category: { branch: { restaurant: { id: restaurantId } }, name: category } }
      : { category: { branch: { restaurant: { id: restaurantId } } } };

    const items = await this.menuItemRepo.find({
      where: whereClause,
      relations: { addons: true, category: true },
      order: { createdAt: 'DESC' },
    });

    return items.map((item: MenuItemEntity) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.basePrice),
      image: item.imageUrl,
      category: item.category?.name,
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel,
      addons: item.addons?.map((addon: MenuAddonEntity) => ({
        id: addon.id,
        name: addon.addonName,
        price: Number(addon.price),
      })) || [],
    }));
  }

  async getItemDetails(itemId: string) {
    const item = await this.menuItemRepo.findOne({
      where: { id: itemId },
      relations: { addons: true, category: true },
    });

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: Number(item.basePrice),
      image: item.imageUrl,
      category: item.category?.name,
      isVeg: item.isVeg,
      spiceLevel: item.spiceLevel,
      status: item.status,
      addons: item.addons?.map((addon: MenuAddonEntity) => ({
        id: addon.id,
        name: addon.addonName,
        price: Number(addon.price),
      })) || [],
    };
  }

  async getItemAddons(itemId: string) {
    return this.addonRepo.find({ where: { menuItemId: itemId } });
  }

  async getCategories(restaurantId: string) {
    return this.categoryRepo.find({
      where: { branch: { restaurant: { id: restaurantId } } } as any,
      order: { sortOrder: 'ASC' }
    });
  }
}