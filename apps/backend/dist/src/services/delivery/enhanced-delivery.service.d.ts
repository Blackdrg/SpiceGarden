import { Repository, DataSource } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { BatchEntity } from '../../db/entities/batch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { GeoService } from '../../services/geo/geo.service';
interface GeoPoint {
    lat: number;
    lng: number;
}
export declare class EnhancedDeliveryService {
    private driverRepo;
    private orderRepo;
    private batchRepo;
    private driverAssignmentRepo;
    private geoService;
    private dataSource;
    private readonly logger;
    private surgeZones;
    private incentiveRules;
    constructor(driverRepo: Repository<DriverEntity>, orderRepo: Repository<OrderEntity>, batchRepo: Repository<BatchEntity>, driverAssignmentRepo: Repository<DriverAssignmentEntity>, geoService: GeoService, dataSource: DataSource);
    private initializeSurgeZones;
    private initializeIncentiveRules;
    registerDriver(userId: string, data: any): unknown;
    updateLocation(driverId: string, lat: number, lng: number): unknown;
    findAvailableDrivers(lat: number, lng: number, radiusInKm?: number): Promise<DriverEntity[]>;
    assignOrderToDriver(orderId: string, driverId: string): Promise<void>;
    calculateTrafficAwareRoute(restaurantLocation: GeoPoint, customerLocation: GeoPoint, historicalSpeed?: number): {
        eta: number;
        distance: number;
        duration: number;
        trafficFactor: number;
    };
    getTimeOfDayTrafficFactor(): number;
    getSurgeMultiplier(location: GeoPoint): number;
    calculateSurgeForOrder(orderId: string, restaurantLocation: GeoPoint): Promise<number>;
    handleFailedDelivery(orderId: string, driverId: string, failureReason: string, reasonDetails?: string): Promise<void>;
    private handleDriverNoShow;
    reassignOrder(restaurantLat: number, restaurantLng: number, orderId: string, excludeDriverId?: string): Promise<boolean>;
    detectFakeGPS(driverId: string, location: {
        lat?: number | null;
        lng?: number | null;
        timestamp?: number | string;
    }, speed?: number): {
        isFake: boolean;
        reason: string;
        driverId: string;
    };
    verifyDriverLocation(driverId: string, reportedLocation: GeoPoint): Promise<{
        verified: boolean;
        reason: string;
    }>;
    detectRouteManipulation(assignmentId: string): Promise<{
        suspicious: boolean;
        reason?: string;
    }>;
    handleDriverNoShowAutomatic(driverId: string, orderId: string, assignmentId: string): Promise<void>;
    autoReassignOnNoShow(orderId: string, previousDriverId?: string): Promise<boolean>;
    calculateDeliveryIncentives(driverId: string, date?: Date): Promise<{
        totalIncentive: number;
        breakdown: {
            [key: string]: number;
        };
    }>;
    validateGeoFence(driverId: string, centerLat: number, centerLng: number, radiusKm?: number): Promise<boolean>;
    rerouteDriver(driverId: string, orderId: string, newDestination: GeoPoint, reason: string): Promise<void>;
}
export {};
