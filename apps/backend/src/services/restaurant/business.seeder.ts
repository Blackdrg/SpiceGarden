import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { randomInt, randomFloat } from '../../shared/random.utils';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { MenuCategoryEntity } from '../../db/entities/menu-category.entity';
import { MenuItemEntity } from '../../db/entities/menu-item.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { UserEntity } from '../../db/entities/user.entity';
import { CouponEntity, CouponType, CouponStatus, CouponScope } from '../../db/entities/coupon.entity';
import { RestaurantGSTEntity } from '../../db/entities/restaurant-gst.entity';
import { HSNSACEntity } from '../../db/entities/hsn-sac.entity';
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

    const couponRepo = this.dataSource.getRepository(CouponEntity);
    const existingCoupons = await couponRepo.count();
    if (existingCoupons === 0) {
      await this.seedCoupons();
    } else {
      this.logger.log('Coupons already seeded');
    }

    const gstRepo = this.dataSource.getRepository(RestaurantGSTEntity);
    const existingGst = await gstRepo.count();
    if (existingGst === 0) {
      await this.seedTaxConfigs();
    } else {
      this.logger.log('Tax configs already seeded');
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
          phone: `+92${randomInt(9000000000) + 1000000000}`,
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
          rating: 4.5 + randomFloat(0.5),
        } as any),
      ),
    );

    this.logger.log('Seeded 3 drivers');
  }

  private async seedCoupons() {
    const couponRepo = this.dataSource.getRepository(CouponEntity);
    const restaurantRepo = this.dataSource.getRepository(RestaurantEntity);
    const restaurants = await restaurantRepo.find();

    const coupons = [
      {
        code: 'WELCOME10',
        type: CouponType.PERCENTAGE,
        scope: CouponScope.GLOBAL,
        discountValue: 10,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        usageLimit: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        applicableForNewUsers: true,
      },
      {
        code: 'FLAT50',
        type: CouponType.FIXED_AMOUNT,
        scope: CouponScope.GLOBAL,
        discountValue: 50,
        minOrderAmount: 300,
        maxDiscountAmount: 50,
        usageLimit: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        applicableForNewUsers: false,
      },
      {
        code: 'FREEDEL',
        type: CouponType.FREE_DELIVERY,
        scope: CouponScope.RESTAURANT,
        restaurantId: restaurants[0]?.id,
        discountValue: 0,
        minOrderAmount: 150,
        usageLimit: 200,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        applicableForNewUsers: false,
      },
      {
        code: 'BOGO25',
        type: CouponType.BOGO,
        scope: CouponScope.ITEM,
        discountValue: 25,
        minOrderAmount: 250,
        usageLimit: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        applicableForNewUsers: false,
      },
    ];

    await couponRepo.save(coupons as any);
    this.logger.log(`Seeded ${coupons.length} coupons`);
  }

  private async seedTaxConfigs() {
    const gstRepo = this.dataSource.getRepository(RestaurantGSTEntity);
    const hsnRepo = this.dataSource.getRepository(HSNSACEntity);
    const restaurantRepo = this.dataSource.getRepository(RestaurantEntity);
    const itemRepo = this.dataSource.getRepository(MenuItemEntity);
    const restaurants = await restaurantRepo.find();
    const items = await itemRepo.find({ relations: { category: true } });

    const gstDetails = restaurants.map((restaurant, i) => ({
      gstin: `27AAAAA${1000 + i}0A1Z5`,
      legalNameOfBusiness: `${restaurant.name} Pvt Ltd`,
      tradeName: restaurant.name,
      address: `${100 + i} Main Street, Food City`,
      stateCode: '27',
      state: 'Maharashtra',
      registrationDate: new Date('2024-01-01'),
      isActive: true,
      email: `gst@${restaurant.slug}.com`,
      phone: `+91${9000000000 + i * 111111111}`,
      restaurant: { id: restaurant.id } as any,
    }));

    await gstRepo.save(gstDetails as any);

    const hsnCodes = [
      { hsnCode: '1006', description: 'Rice', gstRate: 5 },
      { hsnCode: '0202', description: 'Meat', gstRate: 5 },
      { hsnCode: '1905', description: 'Bread', gstRate: 5 },
      { hsnCode: '2106', description: 'Food preparations', gstRate: 18 },
      { hsnCode: '2206', description: 'Beverages', gstRate: 18 },
      { hsnCode: '3401', description: 'Soap', gstRate: 18 },
    ];

    for (const item of items) {
      const hsn = hsnCodes[randomInt(hsnCodes.length)];
      await hsnRepo.save({
        hsnCode: hsn.hsnCode,
        description: hsn.description,
        gstRate: hsn.gstRate,
        menuItem: { id: item.id } as any,
      } as any);
    }

    this.logger.log(`Seeded ${gstDetails.length} restaurant GST records and ${items.length} HSN/SAC codes`);
  }
}
