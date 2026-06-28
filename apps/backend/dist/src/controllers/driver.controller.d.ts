import { UserRole } from '../shared/domain/user.interface';
import { DriverEntity } from '../db/entities/driver.entity';
import { OrderEntity } from '../db/entities/order.entity';
import { DriverAssignmentEntity } from '../db/entities/driver-assignment.entity';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { TrackingGateway } from '../infra/tracking/tracking.gateway';
import { NotificationService } from '../services/notifications/notification.service';
export declare class DriverController {
    private driverRepo;
    private assignmentRepo;
    private dataSource;
    private trackingGateway;
    constructor(driverRepo: Repository<DriverEntity>, assignmentRepo: Repository<DriverAssignmentEntity>, dataSource: DataSource, trackingGateway: TrackingGateway);
    getProfile(req: {
        user: {
            id: string;
        };
    }): Promise<DriverEntity | null>;
    getDriver(id: string, req: {
        user: {
            id: string;
            role: UserRole;
        };
    }): Promise<DriverEntity | null>;
    getEarnings(id: string, req: {
        user: {
            id: string;
            role: UserRole;
        };
    }): Promise<{
        availableBalance: number;
        pendingBalance: number;
        lifetimeEarnings: number;
        weeklyEarnings: number;
        todayEarnings: number;
    }>;
    updateLocation(id: string, body: {
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
    }, req: {
        user: {
            id: string;
            role: UserRole;
        };
    }): Promise<{
        status: string;
    }>;
    toggleAvailability(id: string, body: {
        isAvailable: boolean;
    }, req: {
        user: {
            id: string;
            role: UserRole;
        };
    }): Promise<{
        driverId: string;
        isAvailable: boolean;
    }>;
    getAvailableDrivers(lat: number, lng: number, radius?: number): Promise<DriverEntity[]>;
}
export declare class OrderDriverController {
    private orderRepo;
    private driverRepo;
    private assignmentRepo;
    private dataSource;
    private trackingGateway;
    private notificationService;
    constructor(orderRepo: Repository<OrderEntity>, driverRepo: Repository<DriverEntity>, assignmentRepo: Repository<DriverAssignmentEntity>, dataSource: DataSource, trackingGateway: TrackingGateway, notificationService: NotificationService);
    acceptOrder(id: string, body: {
        driverId: string;
    }): Promise<{
        orderId: string;
        status: string;
    }>;
    rejectOrder(id: string, body: {
        driverId: string;
    }): Promise<{
        orderId: string;
        status: string;
    }>;
    updateStatus(id: string, body: {
        status: 'pickedUp' | 'onTheWay' | 'delivered' | 'failed';
        actualTimeMinutes?: number;
        failureReason?: string;
    }): Promise<{
        orderId: string;
        status: "delivered" | "failed" | "pickedUp" | "onTheWay";
    }>;
    verifyOTP(id: string, body: {
        otp: string;
        driverId: string;
    }): Promise<{
        valid: boolean;
    }>;
    reportIssue(id: string, body: {
        issue: string;
        details: string;
    }): Promise<{
        status: string;
    }>;
}
