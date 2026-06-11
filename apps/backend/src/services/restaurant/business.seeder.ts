import { DataSource } from 'typeorm';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { UserRole, UserStatus } from '../../shared/domain/user.interface';

export class BusinessSeederService {
  constructor(private dataSource: DataSource) {}

  async seedAll(): Promise<void> {
    console.log('[BusinessSeeder] Initializing business engine data...');
    
    const restaurantRepo = this.dataSource.getRepository(RestaurantEntity);
    const existingRestaurants = await restaurantRepo.count();
    
    if (existingRestaurants === 0) {
      await this.seedRestaurants();
    } else {
      console.log('[BusinessSeeder] Restaurants already seeded');
    }
    
    const driverRepo = this.dataSource.getRepository(DriverEntity);
    const existingDrivers = await driverRepo.count();
    
    if (existingDrivers === 0) {
      await this.seedDrivers();
    } else {
      console.log('[BusinessSeeder] Drivers already seeded');
    }
    
    console.log('[BusinessSeeder] Business engine ready');
  }

  private async seedRestaurants() {
    const restaurantRepo = this.dataSource.getRepository(RestaurantEntity);
    const branchRepo = this.dataSource.getRepository(RestaurantBranchEntity);
    const categoryRepo = this.dataSource.getRepository(MenuCategoryEntity);
    const itemRepo = this.dataSource.getRepository(MenuItemEntity);

    // Spice Garden - Downtown
    const downtown = restaurantRepo.create({
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Spice Garden - Downtown',
      slug: 'spice-garden-downtown',
      description: 'Authentic Pakistani cuisine in the heart of the city',
      status: 'active',
      commissionType: 'percentage',
      commissionValue: 15,
      location: { lat: 30.7333, lng: 76.7794 },
    });
    await restaurantRepo.save(downtown);

    const downtownBranch = branchRepo.create({
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      branchName: 'Downtown Branch',
      address: '123 Main Street, Downtown',
      location: { lat: 30.7333, lng: 76.7794 },
      openingTime: '10:00:00',
      closingTime: '23:00:00',
      isOnline: true,
      restaurant: downtown,
    });
    await branchRepo.save(downtownBranch);

    const downtownMain = categoryRepo.create({ name: 'Main Course', sortOrder: 1, branch: downtownBranch });
    const downtownSides = categoryRepo.create({ name: 'Sides', sortOrder: 2, branch: downtownBranch });
    await categoryRepo.save([downtownMain, downtownSides]);

    await itemRepo.save([
      itemRepo.create({ name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', basePrice: 350, isVeg: false, spiceLevel: 3, category: downtownMain }),
      itemRepo.create({ name: 'Beef Karahi', description: 'Traditional beef curry cooked in wok', basePrice: 420, isVeg: false, spiceLevel: 4, category: downtownMain }),
      itemRepo.create({ name: 'Dal Makhani', description: 'Creamy black lentils', basePrice: 280, isVeg: true, spiceLevel: 2, category: downtownMain }),
      itemRepo.create({ name: 'Garlic Naan', description: 'Fresh baked bread with garlic', basePrice: 40, isVeg: true, spiceLevel: 1, category: downtownSides }),
    ]);

    // Spice Garden - Mall Road
    const mallRoad = restaurantRepo.create({
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      name: 'Spice Garden - Mall Road',
      slug: 'spice-garden-mall-road',
      description: 'Fast food and quick bites for busy shoppers',
      status: 'active',
      commissionType: 'percentage',
      commissionValue: 18,
      location: { lat: 30.74, lng: 76.78 },
    });
    await restaurantRepo.save(mallRoad);

    const mallRoadBranch = branchRepo.create({
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      branchName: 'Mall Road Branch',
      address: '456 Mall Road, Shopping District',
      location: { lat: 30.74, lng: 76.78 },
      openingTime: '09:00:00',
      closingTime: '22:00:00',
      isOnline: true,
      restaurant: mallRoad,
    });
    await branchRepo.save(mallRoadBranch);

    const mallMain = categoryRepo.create({ name: 'Main Course', sortOrder: 1, branch: mallRoadBranch });
    const mallBev = categoryRepo.create({ name: 'Beverages', sortOrder: 2, branch: mallRoadBranch });
    await categoryRepo.save([mallMain, mallBev]);

    await itemRepo.save([
      itemRepo.create({ name: 'Zinger Burger', description: 'Spicy crispy chicken burger', basePrice: 250, isVeg: false, spiceLevel: 3, category: mallMain }),
      itemRepo.create({ name: 'Chicken Burger', description: 'Grilled chicken burger', basePrice: 220, isVeg: false, spiceLevel: 2, category: mallMain }),
      itemRepo.create({ name: 'Large Fries', description: 'Crispy golden fries', basePrice: 120, isVeg: true, spiceLevel: 0, category: mallMain }),
      itemRepo.create({ name: 'Chocolate Shake', description: 'Rich chocolate milkshake', basePrice: 180, isVeg: true, spiceLevel: 0, category: mallBev }),
    ]);

    // Spice Garden - Gulshan
    const gulshan = restaurantRepo.create({
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      name: 'Spice Garden - Gulshan',
      slug: 'spice-garden-gulshan',
      description: 'Fine dining Italian and continental cuisine',
      status: 'active',
      commissionType: 'percentage',
      commissionValue: 20,
      location: { lat: 30.72, lng: 76.77 },
    });
    await restaurantRepo.save(gulshan);

    const gulshanBranch = branchRepo.create({
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
      branchName: 'Gulshan Branch',
      address: '789 Gulshan Avenue, Upmarket District',
      location: { lat: 30.72, lng: 76.77 },
      openingTime: '11:00:00',
      closingTime: '23:30:00',
      isOnline: true,
      restaurant: gulshan,
    });
    await branchRepo.save(gulshanBranch);

    const gulshanMain = categoryRepo.create({ name: 'Main Course', sortOrder: 1, branch: gulshanBranch });
    const gulshanApp = categoryRepo.create({ name: 'Appetizers', sortOrder: 2, branch: gulshanBranch });
    await categoryRepo.save([gulshanMain, gulshanApp]);

    await itemRepo.save([
      itemRepo.create({ name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', basePrice: 380, isVeg: true, spiceLevel: 1, category: gulshanMain }),
      itemRepo.create({ name: 'Pepperoni Pizza', description: 'Spicy pepperoni topping', basePrice: 450, isVeg: false, spiceLevel: 2, category: gulshanMain }),
      itemRepo.create({ name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', basePrice: 320, isVeg: true, spiceLevel: 0, category: gulshanMain }),
      itemRepo.create({ name: 'Caesar Salad', description: 'Romaine with parmesan', basePrice: 220, isVeg: false, spiceLevel: 0, category: gulshanApp }),
    ]);

    console.log('[BusinessSeeder] Seeded 3 restaurants with menu items');
  }

  private async seedDrivers() {
    const driverRepo = this.dataSource.getRepository(DriverEntity);
    const userRepo = this.dataSource.getRepository(UserEntity);

    const driverNames = ['Raj Kumar', 'Amit Singh', 'Priya Sharma'];
    
    for (let i = 0; i < 3; i++) {
      const userData: Partial<UserEntity> = {
        fullName: driverNames[i],
        email: `${driverNames[i].toLowerCase().replace(' ', '.')}@driver.spicegarden.com`,
        phone: `+92${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        passwordHash: '$argon2$placeholder',
        role: UserRole.DELIVERY_PARTNER,
        status: UserStatus.ACTIVE,
      };
      const savedUser = await userRepo.save(userData);

      const driver = driverRepo.create({
        id: `driver-${savedUser.id.substring(0, 8)}`,
        userId: savedUser.id,
        licenseNumber: `DL${String(i + 1).padStart(3, '0')}`,
        vehicleNumber: `CAR-${1000 + i}`,
        vehicleType: 'motorcycle',
        kycStatus: 'approved',
        isOnline: true,
        isAvailable: true,
        currentLocation: { lat: 30.73 + i * 0.01, lng: 76.77 + i * 0.01 },
        rating: 4.5 + Math.random() * 0.5,
      });
      await driverRepo.save(driver);
    }

    console.log('[BusinessSeeder] Seeded 3 drivers');
  }
}