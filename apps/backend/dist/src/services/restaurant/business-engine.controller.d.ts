import { BusinessEngineService, BusinessMetrics } from './business-engine.service';
export declare class BusinessEngineController {
    private readonly businessEngine;
    constructor(businessEngine: BusinessEngineService);
    getMetrics(): Promise<BusinessMetrics>;
    getRestaurants(): unknown;
    getMenu(restaurantId: string): unknown;
    getLiveDrivers(): unknown;
    updateDriverLocation(driverId: string, location: {
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
    }): unknown;
    setDriverAvailability(driverId: string, body: {
        isAvailable: boolean;
    }): unknown;
    getDashboard(): unknown;
    getUptime(): unknown;
}
