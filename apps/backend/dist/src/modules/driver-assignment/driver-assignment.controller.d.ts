import { DriverAssignmentService } from './driver-assignment.service';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
export declare class DriverAssignmentController {
    private readonly driverAssignmentService;
    constructor(driverAssignmentService: DriverAssignmentService);
    assignDriverToOrder(orderId: string): unknown;
    assignBatchDelivery(orderIds: string[], driverId: string): unknown;
    reassignOrder(assignmentId: string, newDriverId: string, reason?: string): unknown;
    getDriverAssignments(driverId: string, status?: string): unknown;
    getOrderAssignments(orderId: string): unknown;
    updateAssignmentStatus(assignmentId: string, status: DriverAssignmentEntity['status'], actualTimeMinutes?: number): unknown;
    updateAssignmentRoute(assignmentId: string, routeData: {
        start: {
            lat: number;
            lng: number;
        };
        end: {
            lat: number;
            lng: number;
        };
        waypoints: Array<{
            lat: number;
            lng: number;
            timestamp: Date;
        }>;
    }): unknown;
    getAvailableDrivers(lat: number, lng: number, radius?: number): unknown;
    updateDriverScore(driverId: string): unknown;
    calculateETA(orderId: string, driverId: string): unknown;
    recordDeliverySLA(data: {
        driverId: string;
        branchId: string;
        metricName: string;
        value: number;
        unit: string;
        targetValue?: number;
        targetUnit?: string;
        measurementPeriod?: string;
    }): unknown;
    getDeliverySLAMetrics(driverId?: string, branchId?: string, metricName?: string, limit?: number): unknown;
    recordFraudIncident(data: {
        driverId: string;
        orderId: string;
        branchId: string;
        fraudType: 'gps_spoofing' | 'fake_delivery' | 'late_delivery_abuse' | 'route_deviation' | 'other';
        evidence: any;
        severity: 'low' | 'medium' | 'high';
    }): unknown;
    getDriverFraudHistory(driverId: string): unknown;
    getAllFraudIncidents(driverId?: string, limit?: number): unknown;
}
