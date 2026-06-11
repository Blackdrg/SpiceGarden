import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  async create(
    @Body() body: { userId: string; restaurantId: string; orderId: string; rating: number; comment?: string; images?: string[] },
  ) {
    return this.reviewService.create(body.userId, body.restaurantId, body.orderId, body.rating, body.comment, body.images);
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