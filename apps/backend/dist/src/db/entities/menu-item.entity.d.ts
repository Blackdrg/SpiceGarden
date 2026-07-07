import { MenuCategoryEntity } from './menu-category.entity';
import { HSNSACEntity } from './hsn-sac.entity';
import { MenuAddonEntity } from './menu-addon.entity';
export declare class MenuItemEntity {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    isVeg: boolean;
    spiceLevel: number;
    status: string;
    category: MenuCategoryEntity;
    hsnSacId?: string;
    hsnSac?: HSNSACEntity;
    addons?: MenuAddonEntity[];
    createdAt: Date;
    updatedAt: Date;
}
