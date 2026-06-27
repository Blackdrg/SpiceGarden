"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSeederService = void 0;
const argon2 = __importStar(require("argon2"));
const crypto_1 = require("crypto");
const restaurant_entity_1 = require("../../db/entities/restaurant.entity");
const restaurant_branch_entity_1 = require("../../db/entities/restaurant-branch.entity");
const menu_category_entity_1 = require("../../db/entities/menu-category.entity");
const menu_item_entity_1 = require("../../db/entities/menu-item.entity");
const driver_entity_1 = require("../../db/entities/driver.entity");
const user_entity_1 = require("../../db/entities/user.entity");
const user_interface_1 = require("../../shared/domain/user.interface");
class BusinessSeederService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async seedAll() {
        console.log('[BusinessSeeder] Initializing business engine data...');
        const restaurantRepo = this.dataSource.getRepository(restaurant_entity_1.RestaurantEntity);
        const existingRestaurants = await restaurantRepo.count();
        if (existingRestaurants === 0) {
            await this.seedRestaurants();
        }
        else {
            console.log('[BusinessSeeder] Restaurants already seeded');
        }
        const driverRepo = this.dataSource.getRepository(driver_entity_1.DriverEntity);
        const existingDrivers = await driverRepo.count();
        if (existingDrivers === 0) {
            await this.seedDrivers();
        }
        else {
            console.log('[BusinessSeeder] Drivers already seeded');
        }
        console.log('[BusinessSeeder] Business engine ready');
    }
    async seedRestaurants() {
        const restaurantRepo = this.dataSource.getRepository(restaurant_entity_1.RestaurantEntity);
        const branchRepo = this.dataSource.getRepository(restaurant_branch_entity_1.RestaurantBranchEntity);
        const categoryRepo = this.dataSource.getRepository(menu_category_entity_1.MenuCategoryEntity);
        const itemRepo = this.dataSource.getRepository(menu_item_entity_1.MenuItemEntity);
        const downtownRestaurantId = (0, crypto_1.randomUUID)();
        const downtownBranchId = (0, crypto_1.randomUUID)();
        const mallRoadRestaurantId = (0, crypto_1.randomUUID)();
        const mallRoadBranchId = (0, crypto_1.randomUUID)();
        const gulshanRestaurantId = (0, crypto_1.randomUUID)();
        const gulshanBranchId = (0, crypto_1.randomUUID)();
        await restaurantRepo.save({
            id: downtownRestaurantId,
            name: 'Spice Garden - Downtown',
            slug: 'spice-garden-downtown',
            description: 'Authentic Pakistani cuisine in the heart of the city',
            status: 'active',
            location: { lat: 30.7333, lng: 76.7794 },
        });
        const savedDowntown = await categoryRepo.save([
            { id: (0, crypto_1.randomUUID)(), name: 'Main Course', sortOrder: 1, branch: { id: downtownBranchId } },
            { id: (0, crypto_1.randomUUID)(), name: 'Sides', sortOrder: 2, branch: { id: downtownBranchId } },
        ]);
        await itemRepo.save([
            { id: (0, crypto_1.randomUUID)(), name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', basePrice: 350, isVeg: false, spiceLevel: 3, category: savedDowntown[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Beef Karahi', description: 'Traditional beef curry cooked in wok', basePrice: 420, isVeg: false, spiceLevel: 4, category: savedDowntown[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Dal Makhani', description: 'Creamy black lentils', basePrice: 280, isVeg: true, spiceLevel: 2, category: savedDowntown[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Garlic Naan', description: 'Fresh baked bread with garlic', basePrice: 40, isVeg: true, spiceLevel: 1, category: savedDowntown[1] },
        ]);
        await restaurantRepo.save({
            id: mallRoadRestaurantId,
            name: 'Spice Garden - Mall Road',
            slug: 'spice-garden-mall-road',
            description: 'Fast food and quick bites for busy shoppers',
            status: 'active',
            location: { lat: 30.74, lng: 76.78 },
        });
        const savedMall = await categoryRepo.save([
            { id: (0, crypto_1.randomUUID)(), name: 'Main Course', sortOrder: 1, branch: { id: mallRoadBranchId } },
            { id: (0, crypto_1.randomUUID)(), name: 'Beverages', sortOrder: 2, branch: { id: mallRoadBranchId } },
        ]);
        await itemRepo.save([
            { id: (0, crypto_1.randomUUID)(), name: 'Zinger Burger', description: 'Spicy crispy chicken burger', basePrice: 250, isVeg: false, spiceLevel: 3, category: savedMall[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Chicken Burger', description: 'Grilled chicken burger', basePrice: 220, isVeg: false, spiceLevel: 2, category: savedMall[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Large Fries', description: 'Crispy golden fries', basePrice: 120, isVeg: true, spiceLevel: 0, category: savedMall[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Chocolate Shake', description: 'Rich chocolate milkshake', basePrice: 180, isVeg: true, spiceLevel: 0, category: savedMall[1] },
        ]);
        await restaurantRepo.save({
            id: gulshanRestaurantId,
            name: 'Spice Garden - Gulshan',
            slug: 'spice-garden-gulshan',
            description: 'Fine dining Italian and continental cuisine',
            status: 'active',
            location: { lat: 30.72, lng: 76.77 },
        });
        const savedGulshan = await categoryRepo.save([
            { id: (0, crypto_1.randomUUID)(), name: 'Main Course', sortOrder: 1, branch: { id: gulshanBranchId } },
            { id: (0, crypto_1.randomUUID)(), name: 'Appetizers', sortOrder: 2, branch: { id: gulshanBranchId } },
        ]);
        await itemRepo.save([
            { id: (0, crypto_1.randomUUID)(), name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', basePrice: 380, isVeg: true, spiceLevel: 1, category: savedGulshan[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Pepperoni Pizza', description: 'Spicy pepperoni topping', basePrice: 450, isVeg: false, spiceLevel: 2, category: savedGulshan[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', basePrice: 320, isVeg: true, spiceLevel: 0, category: savedGulshan[0] },
            { id: (0, crypto_1.randomUUID)(), name: 'Caesar Salad', description: 'Romaine with parmesan', basePrice: 220, isVeg: false, spiceLevel: 0, category: savedGulshan[1] },
        ]);
        console.log('[BusinessSeeder] Seeded 3 restaurants with menu items');
    }
    async seedDrivers() {
        const driverRepo = this.dataSource.getRepository(driver_entity_1.DriverEntity);
        const userRepo = this.dataSource.getRepository(user_entity_1.UserEntity);
        const driverNames = ['Raj Kumar', 'Amit Singh', 'Priya Sharma'];
        for (let i = 0; i < 3; i++) {
            const savedUser = await userRepo.save({
                id: (0, crypto_1.randomUUID)(),
                fullName: driverNames[i],
                email: `${driverNames[i].toLowerCase().replace(' ', '.')}@driver.spicegarden.com`,
                phone: `+92${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                passwordHash: await argon2.hash('SpiceGarden@2024'),
                role: user_interface_1.UserRole.DELIVERY_PARTNER,
                status: user_interface_1.UserStatus.ACTIVE,
            });
            await driverRepo.save({
                id: (0, crypto_1.randomUUID)(),
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
        }
        console.log('[BusinessSeeder] Seeded 3 drivers');
    }
}
exports.BusinessSeederService = BusinessSeederService;
