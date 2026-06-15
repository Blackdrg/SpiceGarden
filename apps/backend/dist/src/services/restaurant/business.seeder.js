"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessSeederService = void 0;
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
        await restaurantRepo.save({
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            name: 'Spice Garden - Downtown',
            slug: 'spice-garden-downtown',
            description: 'Authentic Pakistani cuisine in the heart of the city',
            status: 'active',
            location: { lat: 30.7333, lng: 76.7794 },
        });
        const downtown = await restaurantRepo.findOne({ where: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' } });
        const downtownBranch = await branchRepo.save({
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            branchName: 'Downtown Branch',
            address: '123 Main Street, Downtown',
            location: { lat: 30.7333, lng: 76.7794 },
            openingTime: '10:00:00',
            closingTime: '23:00:00',
            isOnline: true,
            restaurant: downtown,
        });
        const savedDowntown = await categoryRepo.save([
            { name: 'Main Course', sortOrder: 1, branch: downtownBranch },
            { name: 'Sides', sortOrder: 2, branch: downtownBranch },
        ]);
        await itemRepo.save([
            { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', basePrice: 350, isVeg: false, spiceLevel: 3, category: savedDowntown[0] },
            { name: 'Beef Karahi', description: 'Traditional beef curry cooked in wok', basePrice: 420, isVeg: false, spiceLevel: 4, category: savedDowntown[0] },
            { name: 'Dal Makhani', description: 'Creamy black lentils', basePrice: 280, isVeg: true, spiceLevel: 2, category: savedDowntown[0] },
            { name: 'Garlic Naan', description: 'Fresh baked bread with garlic', basePrice: 40, isVeg: true, spiceLevel: 1, category: savedDowntown[1] },
        ]);
        await restaurantRepo.save({
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            name: 'Spice Garden - Mall Road',
            slug: 'spice-garden-mall-road',
            description: 'Fast food and quick bites for busy shoppers',
            status: 'active',
            location: { lat: 30.74, lng: 76.78 },
        });
        const mallRoad = await restaurantRepo.findOne({ where: { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' } });
        const mallRoadBranch = await branchRepo.save({
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            branchName: 'Mall Road Branch',
            address: '456 Mall Road, Shopping District',
            location: { lat: 30.74, lng: 76.78 },
            openingTime: '09:00:00',
            closingTime: '22:00:00',
            isOnline: true,
            restaurant: mallRoad,
        });
        const savedMall = await categoryRepo.save([
            { name: 'Main Course', sortOrder: 1, branch: mallRoadBranch },
            { name: 'Beverages', sortOrder: 2, branch: mallRoadBranch },
        ]);
        await itemRepo.save([
            { name: 'Zinger Burger', description: 'Spicy crispy chicken burger', basePrice: 250, isVeg: false, spiceLevel: 3, category: savedMall[0] },
            { name: 'Chicken Burger', description: 'Grilled chicken burger', basePrice: 220, isVeg: false, spiceLevel: 2, category: savedMall[0] },
            { name: 'Large Fries', description: 'Crispy golden fries', basePrice: 120, isVeg: true, spiceLevel: 0, category: savedMall[0] },
            { name: 'Chocolate Shake', description: 'Rich chocolate milkshake', basePrice: 180, isVeg: true, spiceLevel: 0, category: savedMall[1] },
        ]);
        await restaurantRepo.save({
            id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            name: 'Spice Garden - Gulshan',
            slug: 'spice-garden-gulshan',
            description: 'Fine dining Italian and continental cuisine',
            status: 'active',
            location: { lat: 30.72, lng: 76.77 },
        });
        const gulshan = await restaurantRepo.findOne({ where: { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' } });
        const gulshanBranch = await branchRepo.save({
            id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23',
            branchName: 'Gulshan Branch',
            address: '789 Gulshan Avenue, Upmarket District',
            location: { lat: 30.72, lng: 76.77 },
            openingTime: '11:00:00',
            closingTime: '23:30:00',
            isOnline: true,
            restaurant: gulshan,
        });
        const savedGulshan = await categoryRepo.save([
            { name: 'Main Course', sortOrder: 1, branch: gulshanBranch },
            { name: 'Appetizers', sortOrder: 2, branch: gulshanBranch },
        ]);
        await itemRepo.save([
            { name: 'Margherita Pizza', description: 'Classic tomato and mozzarella', basePrice: 380, isVeg: true, spiceLevel: 1, category: savedGulshan[0] },
            { name: 'Pepperoni Pizza', description: 'Spicy pepperoni topping', basePrice: 450, isVeg: false, spiceLevel: 2, category: savedGulshan[0] },
            { name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', basePrice: 320, isVeg: true, spiceLevel: 0, category: savedGulshan[0] },
            { name: 'Caesar Salad', description: 'Romaine with parmesan', basePrice: 220, isVeg: false, spiceLevel: 0, category: savedGulshan[1] },
        ]);
        console.log('[BusinessSeeder] Seeded 3 restaurants with menu items');
    }
    async seedDrivers() {
        const driverRepo = this.dataSource.getRepository(driver_entity_1.DriverEntity);
        const userRepo = this.dataSource.getRepository(user_entity_1.UserEntity);
        const driverNames = ['Raj Kumar', 'Amit Singh', 'Priya Sharma'];
        for (let i = 0; i < 3; i++) {
            const savedUser = await userRepo.save({
                fullName: driverNames[i],
                email: `${driverNames[i].toLowerCase().replace(' ', '.')}@driver.spicegarden.com`,
                phone: `+92${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                passwordHash: '$argon2$placeholder',
                role: user_interface_1.UserRole.DELIVERY_PARTNER,
                status: user_interface_1.UserStatus.ACTIVE,
            });
            await driverRepo.save({
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
        }
        console.log('[BusinessSeeder] Seeded 3 drivers');
    }
}
exports.BusinessSeederService = BusinessSeederService;
