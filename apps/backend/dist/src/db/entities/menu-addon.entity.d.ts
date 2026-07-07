import { MenuItemEntity } from './menu-item.entity';
export declare class MenuAddonEntity {
    id: string;
    menuItemId: string;
    menuItem: MenuItemEntity;
    addonName: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}
