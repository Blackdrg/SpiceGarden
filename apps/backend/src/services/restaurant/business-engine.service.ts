import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { OrderEntity } from '../../db/entities/order.entity';
import { OrderStatus, PaymentStatus } from '../../shared/domain/order.interface';
import { DriverEntity } from '../../db/entities/driver.entity';
import { RestaurantEntity } from '../../db/entities/restaurant.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
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

@Injectable()
export class BusinessEngineService {
  private readonly logger = new Logger(BusinessEngineService.name);
  private readonly driverLocations = new Map<string, DriverLocation>();
  private readonly orderProcessingQueue = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(RestaurantEntity)
    private readonly restaurantRepo: Repository<RestaurantEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    private readonly driverAssignmentService: DriverAssignmentService,
    private readonly trackingGateway: TrackingGateway,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
  ) {}

  // Restaurant Operations
  async getActiveRestaurants(): Promise<RestaurantEntity[]> {
    return this.restaurantRepo.find({
      where: { status: 'active' },
      relations: { 
        branches: { 
          categories: { 
            items: true 
          } 
        } 
      },
    });
  }

  async getRestaurantMenu(restaurantId: string) {
    const restaurant = await this.restaurantRepo.findOne({
      where: { id: restaurantId },
      relations: { 
        branches: { 
          categories: { 
            items: true 
          } 
        } 
      },
    });

    if (!restaurant) return [];

    const menuItems: { id: string; name: string; price: number; categoryId: string; categoryName: string }[] = [];
    
    for (const branch of restaurant.branches) {
      for (const category of branch.categories || []) {
        for (const item of category.items || []) {
          menuItems.push({
            id: item.id,
            name: item.name,
            price: Number(item.basePrice),
            categoryId: category.id,
            categoryName: category.name,
          });
        }
      }
    }

    return menuItems;
  }

  // Driver Operations - Live driver management
  async registerDriverLocation(driverId: string, location: { lat: number; lng: number; heading?: number; speed?: number }) {
    this.driverLocations.set(driverId, {
      driverId,
      lat: location.lat,
      lng: location.lng,
      heading: location.heading,
      speed: location.speed,
      timestamp: Date.now(),
    });

    await this.driverRepo.update(driverId, {
      currentLocation: { lat: location.lat, lng: location.lng },
      lastLocationUpdate: new Date(),
    });

    // Broadcast location update via WebSocket
    await this.trackingGateway.publishToRoom(`driver:${driverId}`, {
      event: 'locationUpdate',
      driverId,
      lat: location.lat,
      lng: location.lng,
      heading: location.heading,
      speed: location.speed,
      timestamp: new Date().toISOString(),
    });

    return { status: 'updated', driverId };
  }

  async getLiveDrivers(): Promise<DriverLocation[]> {
    const drivers = await this.driverRepo.find({
      where: { isOnline: true, kycStatus: 'approved' },
    });

    return drivers.map(d => ({
      driverId: d.id,
      lat: d.currentLocation?.lat || 0,
      lng: d.currentLocation?.lng || 0,
      speed: d.averageSpeed ? Number(d.averageSpeed) : 0,
      timestamp: d.lastLocationUpdate?.getTime() || Date.now(),
    }));
  }

  async toggleDriverAvailability(driverId: string, isAvailable: boolean) {
    await this.driverRepo.update(driverId, { isAvailable });
    return { driverId, isAvailable };
  }

  // Order Flow - Real order processing with driver assignment
  async processOrderFlow(orderId: string) {
const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { branch: { restaurant: true } },
    });

    if (!order) return;

    // Step 1: Push to Kitchen (via WebSocket)
    await this.trackingGateway.publishToRoom(`kds:${order.restaurantId}`, {
      event: 'newOrder',
      orderId: order.id,
      restaurantId: order.restaurantId,
      items: [],
      grandTotal: order.grandTotal,
      createdAt: order.createdAt,
    });

    // Step 2: Simulate restaurant acceptance after delay
    this.orderProcessingQueue.set(orderId, setTimeout(async () => {
      await this.orderRepo.update(orderId, { status: OrderStatus.RESTAURANT_ACCEPTED });
      
      // Step 3: Assign driver
      try {
        const branch = await this.branchRepo.findOne({ 
          where: { id: order.branchId || order.restaurantId },
          relations: { restaurant: true }
        });

        if (branch && branch.location) {
          const availableDrivers = await this.driverAssignmentService.getAvailableDrivers(
            branch.location.lat,
            branch.location.lng,
            5
          );

          if (availableDrivers.length > 0) {
            const driver = availableDrivers[0];
            const assignment = await this.driverAssignmentService.assignDriverToOrder(orderId);
            
            await this.orderRepo.update(orderId, {
              driverId: driver.id,
              status: OrderStatus.DRIVER_ASSIGNED,
            });

            // Notify driver via WebSocket
            await this.trackingGateway.publishToRoom(`driver:${driver.id}`, {
              event: 'orderAssigned',
              orderId: order.id,
              branchId: order.branchId,
              customerLocation: { lat: 0, lng: 0 },
            });
          }
        }
      } catch (error) {
        this.logger.error(`Failed to assign driver to order ${orderId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 1000)); // Simulate 1 second for restaurant acceptance
  }

  // Metrics and GMV
  async getBusinessMetrics(): Promise<BusinessMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      completedOrders,
      activeRestaurants,
      onlineDrivers,
      avgPrepTime,
      avgDeliveryTime,
      gmvResult,
    ] = await Promise.all([
      this.orderRepo.count({ where: { createdAt: Between(today, new Date()) } }),
      this.orderRepo.count({ where: { status: OrderStatus.DELIVERED, createdAt: Between(today, new Date()) } }),
      this.restaurantRepo.count({ where: { status: 'active' } }),
      this.driverRepo.count({ where: { isOnline: true, kycStatus: 'approved' } }),
      this.getAvgPrepTime(),
      this.getAvgDeliveryTime(),
      this.orderRepo.createQueryBuilder('order')
        .select('SUM(order.grandTotal)', 'gmv')
        .where('order.status = :status', { status: OrderStatus.DELIVERED })
        .andWhere('order.createdAt >= :today', { today })
        .getRawOne(),
    ]);

    return {
      gmv: Number(gmvResult?.gmv) || 0,
      totalOrders,
      completedOrders,
      activeRestaurants,
      onlineDrivers,
      avgPrepTime: avgPrepTime || 0,
      avgDeliveryTime: avgDeliveryTime || 0,
    };
  }

  private async getAvgPrepTime(): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('AVG(EXTRACT(EPOCH FROM (order.readyAt - order.createdAt)) / 60)', 'avgPrep')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();
    
    return Math.round(Number(result?.avgPrep)) || 15;
  }

  private async getAvgDeliveryTime(): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('AVG(EXTRACT(EPOCH FROM (order.deliveredAt - order.readyAt)) / 60)', 'avgDelivery')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .getRawOne();
    
    return Math.round(Number(result?.avgDelivery)) || 25;
  }

  // Retention tracking
  async recordOrderCompleted(orderId: string, userId: string) {
    const now = new Date();
    await this.orderRepo.update(orderId, {
      status: OrderStatus.DELIVERED,
      deliveredAt: now,
    });

    // Emit completion event
    await this.trackingGateway.publishToRoom(`order:${orderId}`, {
      event: 'orderCompleted',
      orderId,
      timestamp: now.toISOString(),
    });

    // Record retention metrics
    this.auditService.log('order_completed', userId, 'order', orderId, { completedAt: now });
  }

  // Uptime check
  async getSystemUptime(): Promise<{ uptime: number; lastCheck: string }> {
    return {
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
    };
  }

  // Real-time dashboard data
  async getRealtimeDashboard() {
    const [metrics, liveDrivers, recentOrders] = await Promise.all([
      this.getBusinessMetrics(),
      this.getLiveDrivers(),
      this.orderRepo.find({
        where: { status: OrderStatus.PLACED },
        order: { createdAt: 'DESC' },
        take: 10,
        relations: { branch: { restaurant: true } },
      }),
    ]);

    return {
      metrics,
      liveDrivers,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        restaurant: o.branch?.restaurant?.name || 'any',
        amount: o.grandTotal,
        status: o.status,
        createdAt: o.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }
}