import { BusinessEngineService, BusinessMetrics } from './business-engine.service';
export declare class BusinessEngineController {
    private readonly businessEngine;
    constructor(businessEngine: BusinessEngineService);
    getMetrics(): Promise<BusinessMetrics>;
    getRestaurants(): Promise<import("../../db/entities").RestaurantEntity[]>;
    getMenu(restaurantId: string): Promise<{
        id: string;
        name: string;
        price: number;
        categoryId: string;
        categoryName: string;
    }[]>;
    getLiveDrivers(): Promise<import("./business-engine.service").DriverLocation[]>;
    updateDriverLocation(driverId: string, location: {
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
    }): Promise<{
        status: string;
        driverId: string;
    }>;
    setDriverAvailability(driverId: string, body: {
        isAvailable: boolean;
    }): Promise<{
        driverId: string;
        isAvailable: boolean;
    }>;
    getDashboard(): Promise<{
        metrics: any;
        liveDrivers: any;
        recentOrders: any;
        timestamp: string;
    }>;
    getUptime(): Promise<{
        uptime: number;
        lastCheck: string;
    }>;
}
