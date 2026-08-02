import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DriverEntity } from '../../db/entities/driver.entity';
import { OrderEntity } from '../../db/entities/order.entity';
import { DriverAssignmentEntity } from '../../db/entities/driver-assignment.entity';
import { RestaurantBranchEntity } from '../../db/entities/restaurant-branch.entity';
import { DriverScoreEntity } from '../../db/entities/driver-score.entity';
import { DeliverySLAEntity } from '../../db/entities/delivery-sla.entity';
import { DriverFraudEntity } from '../../db/entities/driver-fraud.entity';
import { OrderStatus } from '../../shared/domain/order.interface';
import { rankDrivers, haversineKm } from '../../common/driver-ranking.util';

@Injectable()
export class DispatchEngineService {
  constructor(
    @InjectRepository(DriverEntity)
    private readonly driverRepo: Repository<DriverEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private readonly assignmentRepo: Repository<DriverAssignmentEntity>,
    @InjectRepository(RestaurantBranchEntity)
    private readonly branchRepo: Repository<RestaurantBranchEntity>,
    @InjectRepository(DriverScoreEntity)
    private readonly scoreRepo: Repository<DriverScoreEntity>,
    @InjectRepository(DeliverySLAEntity)
    private readonly slaRepo: Repository<DeliverySLAEntity>,
    @InjectRepository(DriverFraudEntity)
    private readonly fraudRepo: Repository<DriverFraudEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  /**
   * Core dispatch logic - assigns drivers to orders based on multiple factors
   */
  async dispatchOrder(orderId: string): Promise<DriverAssignmentEntity> {
    // Start transaction for consistency
    return this.dataSource.transaction(async (manager) => {
      // 1. Get the order details
const order = await manager.findOne(OrderEntity, {
         where: { id: orderId },
         relations: { branch: true }
       });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // 2. Get restaurant branch (simplified - in reality you'd get branch from restaurant)
      const branch = await manager.findOne(RestaurantBranchEntity, {
        where: { restaurant: { id: order.restaurantId } } // Adjust based on your entity relations
      });

      if (!branch) {
        throw new NotFoundException('Restaurant branch not found');
      }

      // 3. Find available drivers based on multiple criteria
      const drivers = await manager.find(DriverEntity, {
        where: {
          isOnline: true,
          kycStatus: 'approved',
          isFraudSuspicious: false
        }
      });

      const originLat = branch?.location ? Number(branch.location.lat) : 0;
      const originLng = branch?.location ? Number(branch.location.lng) : 0;
      const maxDistance = branch?.location ? 10 : Infinity;
      const requireLocation = !!branch?.location;
      const ranked = rankDrivers(drivers, order, branch, originLat, originLng, maxDistance, requireLocation);

      if (!ranked || ranked.length === 0) {
        throw new BadRequestException('No available drivers found');
      }

      // 4. Select best driver based on unified scoring algorithm
      const bestRanked = ranked[0];
      const bestDriver = drivers.find((d) => d.id === bestRanked.driverId) as DriverEntity;

      // 5. Create assignment
      const assignment = await this.createAssignment(
        bestDriver,
        order,
        branch,
        'single', // assignment type
        manager
      );

      // 6. Update order with driver assignment
      await manager.update(OrderEntity, orderId, {
        driverId: bestDriver.id,
        status: OrderStatus.DRIVER_ASSIGNED
      });

      return assignment;
    });
  }

  /**
   * Create a driver assignment record
   */
  private async createAssignment(
    driver: DriverEntity,
    order: OrderEntity,
    branch: RestaurantBranchEntity,
    assignmentType: 'single' | 'batch' | 'stacked',
    manager: any
  ): Promise<DriverAssignmentEntity> {
    const driverLoc = driver.currentLocation;
    const branchLoc = branch.location;
    let distanceKm = 5.0;
    let estimatedMinutes = 30;

    if (driverLoc && branchLoc) {
      distanceKm = haversineKm(driverLoc, branchLoc);
      const avgSpeedKmh = Math.max(driver.averageSpeed, 15);
      estimatedMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
    }

    const assignment = manager.create(DriverAssignmentEntity, {
      driver,
      order,
      branch,
      assignmentType,
      status: 'assigned',
      distance: Math.round(distanceKm * 100) / 100,
      estimatedTimeMinutes: estimatedMinutes,
      isPriority: false,
      retryCount: 0
    });

    return manager.save(DriverAssignmentEntity, assignment);
  }

  /**
   * Handle batch delivery assignments (multiple orders to one driver)
   */
  async assignBatchDelivery(
    orderIds: string[],
    driverId: string
  ): Promise<DriverAssignmentEntity[]> {
    return this.dataSource.transaction(async (manager) => {
      const driver = await manager.findOne(DriverEntity, { where: { id: driverId } });
      if (!driver) {
        throw new NotFoundException('Driver not found');
      }

      const orders = await manager.find(OrderEntity, {
        where: { id: In(orderIds) }
      });

      if (orders.length !== orderIds.length) {
        throw new NotFoundException('Some orders not found');
      }

      // Get branch from first order (assuming all orders are from same restaurant)
      const branch = (await manager.findOne(RestaurantBranchEntity, {
        where: { restaurant: { id: orders[0].restaurantId } }
      }))!;

      const assignments = [];

      for (const order of orders) {
        const driverLoc = driver.currentLocation;
        const branchLoc = branch.location;
        let distanceKm = 5.0;
        let estimatedMinutes = 30;
        if (driverLoc && branchLoc) {
          distanceKm = haversineKm(driverLoc, branchLoc);
          const avgSpeedKmh = Math.max(driver.averageSpeed, 15);
          estimatedMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
        }

        const assignment = manager.create(DriverAssignmentEntity, {
          driver,
          order,
          branch,
          assignmentType: 'batch',
          batchId: `batch_${Date.now()}`,
          status: 'assigned',
          distance: Math.round(distanceKm * 100) / 100,
          estimatedTimeMinutes: estimatedMinutes,
          isPriority: false,
          retryCount: 0
        });

        assignments.push(await manager.save(DriverAssignmentEntity, assignment));

        // Update order
        await manager.update(OrderEntity, order.id, {
          driverId: driver.id,
          status: OrderStatus.DRIVER_ASSIGNED
        });
      }

      return assignments;
    });
  }

  /**
   * Handle order reassignment (when driver fails to pickup or complete)
   */
  async reassignOrder(
    assignmentId: string,
    newDriverId: string,
    reason: string
  ): Promise<DriverAssignmentEntity> {
    return this.dataSource.transaction(async (manager) => {
      // Get current assignment
const currentAssignment = await manager.findOne(DriverAssignmentEntity, {
         where: { id: assignmentId },
         relations: { driver: true, order: true, branch: true }
       });

      if (!currentAssignment) {
        throw new NotFoundException('Assignment not found');
      }

      // Get new driver
      const newDriver = await manager.findOne(DriverEntity, { where: { id: newDriverId } });
      if (!newDriver) {
        throw new NotFoundException('New driver not found');
      }

      // Update current assignment as reassigned
      currentAssignment.status = 'reassigned';
      currentAssignment.reassignedFrom = currentAssignment.driver.id;
      currentAssignment.retryCount += 1;

      await manager.save(DriverAssignmentEntity, currentAssignment);

      // Create new assignment
      const newAssignment = manager.create(DriverAssignmentEntity, {
        driver: newDriver,
        order: currentAssignment.order,
        branch: currentAssignment.branch,
        assignmentType: currentAssignment.assignmentType,
        batchId: currentAssignment.batchId,
        status: 'assigned',
        distance: currentAssignment.distance,
        estimatedTimeMinutes: currentAssignment.estimatedTimeMinutes,
        isPriority: currentAssignment.isPriority,
        reassignedFrom: currentAssignment.driver.id,
        retryCount: 0
      });

      const savedAssignment = await manager.save(DriverAssignmentEntity, newAssignment);

      // Update order with new driver
      await manager.update(OrderEntity, currentAssignment.order.id, {
        driverId: newDriver.id
      });

      return savedAssignment;
    });
  }
}