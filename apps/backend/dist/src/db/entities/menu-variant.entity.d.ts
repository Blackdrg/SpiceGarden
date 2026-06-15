import { MenuItemEntity } from './menu-item.entity';
export declare class MenuVariantEntity {
    id: string;
    menuItemId: string;
    menuItem: MenuItemEntity;
    payload: any;
    price: number;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
