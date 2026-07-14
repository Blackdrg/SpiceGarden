import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { RolesGuard } from '../security/roles.guard';
import { Roles } from '../security/roles.decorator';
import { PermissionGuard } from '../security/permission.guard';
import { Permissions } from '../security/permissions.decorator';
import { UserRole } from '../shared/domain/user.interface';
import { DriverEntity } from '../db/entities/driver.entity';
import { OrderEntity } from '../db/entities/order.entity';
import { DriverAssignmentEntity } from '../db/entities/driver-assignment.entity';
import { Repository } from 'typeorm';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TrackingGateway } from '../infra/tracking/tracking.gateway';
import { OrderStatus } from '@/shared/domain/order.interface';
import { NotificationService } from '../services/notifications/notification.service';
import {
  AcceptOrderDto,
  RejectOrderDto,
  ReportIssueDto,
  ToggleAvailabilityDto,
  UpdateLocationDto,
  UpdateStatusDto,
  VerifyOtpDto,
} from './driver.dto';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class DriverController {
  constructor(
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private assignmentRepo: Repository<DriverAssignmentEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private trackingGateway: TrackingGateway,
  ) {}

  @Get('me')
  @Roles(UserRole.DELIVERY_PARTNER)
  @Permissions('deliveries:manage_assigned')
  async getProfile(@Request() req: { user: { id: string } }) {
const driver = await this.driverRepo.findOne({
       where: { userId: req.user.id },
       relations: { user: true },
     });
    return driver;
  }

  @Get(':id')
  @Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async getDriver(@Param('id') id: string, @Request() req: { user: { id: string; role: UserRole } }) {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Driver profile access denied');
    }
const driver = await this.driverRepo.findOne({
       where: { id },
       relations: { user: true },
     });
    return driver;
  }

  @Get(':id/earnings')
  @Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async getEarnings(@Param('id') id: string, @Request() req: { user: { id: string; role: UserRole } }) {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Driver earnings access denied');
    }
const assignments = await this.assignmentRepo.find({
       where: { driver: { id } as any, status: 'delivered' } as any,
       relations: { order: true },
     });

    const totalEarnings = assignments.reduce((sum, a) => sum + (a.order?.grandTotal || 0), 0);
    const todayAssignments = assignments.filter(a => {
      const today = new Date();
      const assignmentDate = new Date(a.createdAt);
      return assignmentDate.toDateString() === today.toDateString();
    });
    const todayEarnings = todayAssignments.reduce((sum, a) => sum + (a.order?.grandTotal || 0), 0);

    return {
      availableBalance: totalEarnings * 0.8,
      pendingBalance: totalEarnings * 0.2,
      lifetimeEarnings: totalEarnings,
      weeklyEarnings: totalEarnings,
      todayEarnings,
    };
  }

  @Post(':id/location')
  @Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async updateLocation(
    @Param('id') id: string,
    @Body() body: UpdateLocationDto,
    @Request() req: { user: { id: string; role: UserRole } },
  ) {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Driver location update denied');
    }
    await this.driverRepo.update(id, {
      currentLocation: { lat: body.lat, lng: body.lng },
      lastLocationUpdate: new Date(),
    });

    await this.trackingGateway.publishToRoom(`driver:${id}`, {
      type: 'locationUpdate',
      driverId: id,
      lat: body.lat,
      lng: body.lng,
      heading: body.heading,
      speed: body.speed,
      timestamp: new Date().toISOString(),
    });

    return { status: 'updated' };
  }

  @Post(':id/availability')
  @Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async toggleAvailability(
    @Param('id') id: string,
    @Body() body: ToggleAvailabilityDto,
    @Request() req: { user: { id: string; role: UserRole } },
  ) {
    if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.SUPER_ADMIN && req.user.id !== id) {
      throw new ForbiddenException('Driver availability update denied');
    }
    await this.driverRepo.update(id, { isAvailable: body.isAvailable });
    return { driverId: id, isAvailable: body.isAvailable };
  }

  @Get('available')
  @Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('deliveries:manage_assigned')
  async getAvailableDrivers(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number = 5
  ) {
    const radiusInMeters = radius * 1000;
    return this.driverRepo
      .createQueryBuilder('driver')
      .where('driver.isOnline = :online', { online: true })
      .andWhere('driver.kycStatus = :status', { status: 'approved' })
      .andWhere('driver.isAvailable = :available', { available: true })
      .andWhere(
        `ST_DistanceSphere(driver.currentLocation::geometry, ST_MakePoint(:lng, :lat)::geometry) <= :radius`,
        { lng, lat, radius: radiusInMeters }
      )
      .getMany();
  }
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
@Roles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN)
@Permissions('deliveries:manage_assigned')
export class OrderDriverController {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepo: Repository<OrderEntity>,
    @InjectRepository(DriverEntity)
    private driverRepo: Repository<DriverEntity>,
    @InjectRepository(DriverAssignmentEntity)
    private assignmentRepo: Repository<DriverAssignmentEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    private trackingGateway: TrackingGateway,
    private notificationService: NotificationService,
  ) {}

  @Post(':id/accept')
  async acceptOrder(@Param('id') id: string, @Body() body: AcceptOrderDto) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.dataSource.manager.transaction(async (manager) => {
      await manager.update(OrderEntity, id, {
        driverId: body.driverId,
        status: OrderStatus.DRIVER_ASSIGNED,
      });

      const assignment = manager.create(DriverAssignmentEntity, {
        order: { id } as any,
        driver: { id: body.driverId } as any,
        status: 'accepted',
        distance: 5,
        estimatedTimeMinutes: 30,
      });
      await manager.save(DriverAssignmentEntity, assignment);
    });

    await this.trackingGateway.publishToRoom(`order:${id}`, {
      type: 'driverAssigned',
      driverId: body.driverId,
      orderId: id,
    });

    await this.notificationService.notifyDeliveryLifecycle(
      id,
      'driver_assigned',
      order.userId,
      { eta: 30 }
    );

    return { orderId: id, status: 'accepted' };
  }

  @Post(':id/reject')
  async rejectOrder(@Param('id') id: string, @Body() body: RejectOrderDto) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepo.update(id, { status: OrderStatus.PLACED });
    
    const assignment = await this.assignmentRepo.findOne({
      where: { order: { id } } as any,
    });
    if (assignment) {
      await this.assignmentRepo.update(assignment.id, { status: 'failed' });
    }

    return { orderId: id, status: 'rejected' };
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto
  ) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const statusMap: Record<string, OrderStatus> = {
      pickedUp: OrderStatus.ON_THE_WAY,
      onTheWay: OrderStatus.ON_THE_WAY,
      delivered: OrderStatus.DELIVERED,
      failed: OrderStatus.CANCELLED,
    };

    await this.orderRepo.update(id, { 
      status: statusMap[body.status] || OrderStatus.DELIVERED,
    });

    const assignment = await this.assignmentRepo.findOne({
      where: { order: { id } } as any,
    });
    if (assignment) {
      await this.assignmentRepo.update(assignment.id, {
        status: body.status as any,
        actualTimeMinutes: body.actualTimeMinutes,
      });
    }

    await this.trackingGateway.publishToRoom(`order:${id}`, {
      type: 'orderStatusUpdate',
      status: body.status,
      orderId: id,
    });

    const eventMap: Record<string, 'picked_up' | 'nearby' | 'delivered'> = {
      pickedUp: 'picked_up',
      onTheWay: 'nearby',
      delivered: 'delivered',
    };

    if (body.status in eventMap) {
      await this.notificationService.notifyDeliveryLifecycle(
        id,
        eventMap[body.status],
        order.userId,
        { eta: 15 }
      );
    } else if (body.status === 'failed') {
      await this.notificationService.notifyOrderUpdate(
        order.userId,
        id,
        'cancelled'
      );
    }

    return { orderId: id, status: body.status };
  }

  @Post(':id/verify-otp')
  async verifyOTP(
    @Param('id') id: string,
    @Body() body: VerifyOtpDto
  ) {
const assignment = await this.assignmentRepo.findOne({
       where: { order: { id } } as any,
       relations: { order: true },
     });

    if (!assignment || !assignment.order.otpCode) {
      return { valid: false };
    }

    const isValid = assignment.order.otpCode === body.otp;
    return { valid: isValid };
  }

  @Post(':id/issues')
  async reportIssue(
    @Param('id') id: string,
    @Body() body: ReportIssueDto
  ) {
    console.log(`Issue reported for order ${id}:`, body.issue, body.details);
    return { status: 'reported' };
  }
}