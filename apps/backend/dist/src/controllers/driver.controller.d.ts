import { DriverEntity } from '../db/entities/driver.entity';
import { OrderEntity } from '../db/entities/order.entity';
import { Repository } from 'typeorm';
import { DriverAssignmentEntity } from '../db/entities/driver-assignment.entity';
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
    }): unknown;
    getDriver(id: string): unknown;
    getEarnings(id: string): unknown;
    updateLocation(id: string, body: {
        lat: number;
        lng: number;
        heading?: number;
        speed?: number;
    }): unknown;
    toggleAvailability(id: string, body: {
        isAvailable: boolean;
    }): unknown;
    getAvailableDrivers(lat: number, lng: number, radius?: number): unknown;
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
    }): unknown;
    rejectOrder(id: string, body: {
        driverId: string;
    }): unknown;
    updateStatus(id: string, body: {
        status: 'pickedUp' | 'onTheWay' | 'delivered' | 'failed';
        actualTimeMinutes?: number;
        failureReason?: string;
    }): unknown;
    verifyOTP(id: string, body: {
        otp: string;
        driverId: string;
    }): unknown;
    reportIssue(id: string, body: {
        issue: string;
        details: string;
    }): unknown;
}
