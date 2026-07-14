import { Controller, Post, Get, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { PermissionGuard } from '../../security/permission.guard';
import { Roles } from '../../security/roles.decorator';
import { Permissions } from '../../security/permissions.decorator';
import { UserRole } from '../../shared/domain/user.interface';
import { type Request as ExpressRequest } from 'express';
import { CreateReviewDto } from './review.dto';

@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionGuard)
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Permissions('orders:read_own')
  async create(
    @Body() body: CreateReviewDto,
    @Request() req: ExpressRequest & { user: { id: string } },
  ) {
    return this.reviewService.create(req.user.id, body.restaurantId, body.orderId, body.rating, body.comment, body.images);
  }

  @Get('order/:orderId')
  async findByOrder(@Param('orderId') orderId: string) {
    return this.reviewService.findByOrder(orderId);
  }

  @Get('restaurant/:restaurantId')
  async findByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.reviewService.findByRestaurant(restaurantId);
  }

  @Get('restaurant/:restaurantId/rating')
  async getAverageRating(@Param('restaurantId') restaurantId: string) {
    return { averageRating: await this.reviewService.getAverageRating(restaurantId) };
  }
}