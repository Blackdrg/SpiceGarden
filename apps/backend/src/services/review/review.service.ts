import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReviewDocument } from '../../db/schemas/review.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(ReviewDocument.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(userId: string, restaurantId: string, orderId: string, rating: number, comment?: string, images?: string[]): Promise<ReviewDocument> {
    if (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }
    if (!restaurantId || typeof restaurantId !== 'string') {
      throw new BadRequestException('Invalid restaurantId');
    }
    if (!orderId || typeof orderId !== 'string') {
      throw new BadRequestException('Invalid orderId');
    }

    const createdReview = new this.reviewModel({
      userId,
      restaurantId,
      orderId,
      rating,
      comment: comment ? String(comment).slice(0, 1000) : undefined,
      images: Array.isArray(images) ? images.slice(0, 5) : [],
    });
    return createdReview.save();
  }

  async findByOrder(orderId: string): Promise<ReviewDocument | null> {
    if (!orderId || typeof orderId !== 'string') return null;
    return this.reviewModel.findOne({ orderId }).exec();
  }

  async findByRestaurant(restaurantId: string): Promise<ReviewDocument[]> {
    if (!restaurantId || typeof restaurantId !== 'string') return [];
    return this.reviewModel.find({ restaurantId }).exec();
  }

  async getAverageRating(restaurantId: string): Promise<number> {
    if (!restaurantId || typeof restaurantId !== 'string') return 0;
    const result = await this.reviewModel.aggregate([
      { $match: { restaurantId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    return result.length > 0 && typeof result[0]?.avgRating === 'number'
      ? Math.round(result[0].avgRating * 10) / 10
      : 0;
  }
}