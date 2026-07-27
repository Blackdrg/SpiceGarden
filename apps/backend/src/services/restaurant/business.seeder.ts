import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';

export class BusinessSeederService {
  private readonly logger = new Logger(BusinessSeederService.name);
  constructor(private dataSource: DataSource) {}

  async seedAll(): Promise<void> {
    this.logger.log('Initializing business engine data...');
    
    const restaurantRepo = this.dataSource.getRepository(RestaurantEntity);
    const existingRestaurants = await restaurantRepo.count();
    
    if (existingRestaurants === 0) {
      await this.seedRestaurants();
    } else {
      this.logger.log('Restaurants already seeded');
    }
    
    const driverRepo = this.dataSource.getRepository(DriverEntity);
    const existingDrivers = await driverRepo.count();
    
    if (existingDrivers === 0) {
      await this.seedDrivers();
    } else {
      this.logger.log('Drivers already seeded');
    }
    
    this.logger.log('Business engine ready');
  }

  private async seedRestaurants() {
    const restaurantRepo = this.dataSource.getRepository(RestaurantEntity);
    const branchRepo = this.dataSource.getRepository(RestaurantBranchEntity);
    const categoryRepo = this.dataSource.getRepository(MenuCategoryEntity);
    const itemRepo = this.dataSource.getRepository(MenuItemEntity);

    // Generate dynamic IDs
    const downtownRestaurantId = randomUUID();
    const downtownBranchId = randomUUID();
    const mallRoadRestaurantId = randomUUID();
    const mallRoadBranchId = randomUUID();
    const gulshanRestaurantId = randomUUID();
    const gulshanBranchId = randomUUID();

    // Spice Garden - Downtown
    await restaurantRepo.save({
      id: downtownRestaurantId,
      name: 'Spice Garden - Downtown',
      slug: 'spice-garden-downtown',
      description: 'Authentic Pakistani cuisine in the heart of the city',
      status: 'active',
      location: { lat: 30.7333, lng: 76.7794 },
    } as any);

    const savedDowntown = await categoryRepo.save([
      { id: randomUUID(), name: 'Main Course', sortOrder: 1, branch: { id: downtownBranchId } as any },
      { id: randomUUID(), name: 'Sides', sortOrder: 2, branch: { id: downtownBranchId } as any },
    ] as any) as MenuCategoryEntity[];

    await itemRepo.save([
      { id: randomUUID(), name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', basePrice: 350, isVeg: false, spiceLevel: 3, category: savedDowntown[0] },
      { id: randomUUID(), name: 'Beef Karahi', description: 'Traditional beef curry cooked in wok', basePrice: 420, isVeg: false, spiceLevel: 4, category: savedDowntown[0] },
      { id: randomUUID(), name: 'Dal Makhani', description: 'Creamy black lentils', basePrice: 280, isVeg: true, spiceLevel: 2, category: savedDowntown[0] },
      { id: randomUUID(), name: 'Garlic Naan', description: 'Fresh baked bread with garlic', basePrice: 40, isVeg: true, spiceLevel: 1, category: savedDowntown[1] },
    ] as any);

    // Spice Garden - Mall Road
    await restaurantRepo.save({
      id: mallRoadRestaurantId,
      name: 'Spice Garden - Mall Road',
      slug: 'spice-garden-mall-road',
      description: 'Fast food and quick bites for busy shoppers',
      status: 'active',
      location: { lat: 30.74, lng: 76.78 },
    } as any);

    const savedMall = await categoryRepo.save([
      { id: randomUUID(), name: 'Main Course', sortOrder: 1, branch: { id: mallRoadBranchId } as any },
      { id: randomUUID(), name: 'Beverages', sortOrder: 2, branch: { id: mallRoadBranchId } as any },
    ] as any) as MenuCategoryEntity[];

    await itemRepo.save([
      { id: randomUUID(), name: 'Zinger Burger', description: 'Spicy crispy chicken burger', basePrice: 250, isVeg: false, spiceLevel: 3, category: savedMall[0] },
      { id: randomUUID(), name: 'Chicken Burger', description: 'Grilled chicken burger', basePrice: 220, isVeg: false, spiceLevel: 2, category: savedMall[0] },
      { id: randomUUID(), name: 'Large Fries', description: 'Crispy golden fries', basePrice: 120, isVeg: true, spiceLevel: 0, category: savedMall[0] },
      { id: randomUUID(), name: 'Chocolate Shake', description: 'Rich chocolate milkshake', basePrice: 180, isVeg: true, spiceLevel: 0, category: savedMall[1] },
    ] as any);

    // Spice Garden - Gulshan
    await restaurantRepo.save({
      id: gulshanRestaurantId,
      name: 'Spice Garden - Gulshan',
      slug: 'spice-garden-gulshan',
      description: 'Fine dining Italian and continental cuisine',
      status: 'active',
      location: { lat: 30.72, lng: 76.77 },
    } as any);

    const savedGulshan = await categoryRepo.save([
      { id: randomUUID(), name: 'Main Course', sortOrder: 1, branch: { id: gulshanBranchId } as any },
      { id: randomUUID(), name: 'Appetizers', sortOrder: 2, branch: { id: gulshanBranchId } as any },
    ] as any) as MenuCategoryEntity[];

    await itemRepo.save([
      { id: randomUUID(), name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', basePrice: 380, isVeg: true, spiceLevel: 1, category: savedGulshan[0] },
      { id: randomUUID(), name: 'Pepperoni Pizza', description: 'Spicy pepperoni topping', basePrice: 450, isVeg: false, spiceLevel: 2, category: savedGulshan[0] },
      { id: randomUUID(), name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', basePrice: 320, isVeg: true, spiceLevel: 0, category: savedGulshan[0] },
      { id: randomUUID(), name: 'Caesar Salad', description: 'Romaine with parmesan', basePrice: 220, isVeg: false, spiceLevel: 0, category: savedGulshan[1] },
    ] as any);

    this.logger.log('Seeded 3 restaurants with menu items');
  }

  private async seedDrivers() {
    const driverRepo = this.dataSource.getRepository(DriverEntity);
    const userRepo = this.dataSource.getRepository(UserEntity);

    const driverNames = ['Raj Kumar', 'Amit Singh', 'Priya Sharma'];

    const savedUsers = await Promise.all(
      Array.from({ length: 3 }, async (_, i) => {
        return await userRepo.save({
          id: randomUUID(),
          fullName: driverNames[i],
          email: `${driverNames[i].toLowerCase().replace(' ', '.')}@driver.spicegarden.com`,
          phone: `+92${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          passwordHash: await argon2.hash('SpiceGarden@2024'),
          role: UserRole.DELIVERY_PARTNER,
          status: UserStatus.ACTIVE,
        } as any) as unknown as UserEntity;
      }),
    );

    await Promise.all(
      savedUsers.map((savedUser, i) =>
        driverRepo.save({
          id: randomUUID(),
          userId: savedUser.id,
          licenseNumber: `DL${String(i + 1).padStart(3, '0')}`,
          vehicleNumber: `CAR-${1000 + i}`,
          vehicleType: 'motorcycle',
          kycStatus: 'approved',
          isOnline: true,
          isAvailable: true,
          currentLocation: { lat: 30.73 + i * 0.01, lng: 76.77 + i * 0.01 },
          rating: 4.5 + Math.random() * 0.5,
        } as any),
      ),
    );

    this.logger.log('Seeded 3 drivers');
  }
}