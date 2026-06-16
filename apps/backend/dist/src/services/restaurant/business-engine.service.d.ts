import { Repository } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverEntity } from '../../db/entities/driver.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverAssignmentService } from '../../modules/driver-assignment/driver-assignment.service';
import { TrackingGateway } from '../../infra/tracking/tracking.gateway';
import { NotificationService } from '../notifications/notification.service';
import { AuditService } from '../../audit/audit.service';
export interface BusinessMetrics {
    gmv: number;
    totalOrders: number;
    completedOrders: number;
    activeRestaurants: number;
    onlineDrivers: number;
    avgPrepTime: number;
    avgDeliveryTime: number;
}
export interface DriverLocation {
    driverId: string;
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
    timestamp?: number;
}
export declare class BusinessEngineService {
    private readonly orderRepo;
    private readonly driverRepo;
    private readonly restaurantRepo;
    private readonly branchRepo;
    private readonly driverAssignmentService;
    private readonly trackingGateway;
    private readonly notificationService;
    private readonly auditService;
    private readonly logger;
    private readonly driverLocations;
    private readonly orderProcessingQueue;
    constructor(orderRepo: Repository<OrderEntity>, driverRepo: Repository<DriverEntity>, restaurantRepo: Repository<RestaurantEntity>, branchRepo: Repository<RestaurantBranchEntity>, driverAssignmentService: DriverAssignmentService, trackingGateway: TrackingGateway, notificationService: NotificationService, auditService: AuditService);
    getActiveRestaurants(): Promise<RestaurantEntity[]>;
    getRestaurantMenu(restaurantId: string): unknown;
    registerDriverLocation(driverId: string, location: {
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
    }): unknown;
    getLiveDrivers(): Promise<DriverLocation[]>;
    toggleDriverAvailability(driverId: string, isAvailable: boolean): unknown;
    processOrderFlow(orderId: string): any;
    getBusinessMetrics(): Promise<BusinessMetrics>;
    private getAvgPrepTime;
    private getAvgDeliveryTime;
    recordOrderCompleted(orderId: string, userId: string): any;
    getSystemUptime(): Promise<{
        uptime: number;
        lastCheck: string;
    }>;
    getRealtimeDashboard(): unknown;
}
