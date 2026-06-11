import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReviewDocument } from '../../db/schemas/review.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(ReviewDocument.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(userId: string, restaurantId: string, orderId: string, rating: number, comment?: string, images?: string[]): Promise<ReviewDocument> {
    const createdReview = new this.reviewModel({
      userId,
      restaurantId,
      orderId,
      rating,
      comment,
      images,
    });
    return createdReview.save();
  }

  async findByOrder(orderId: string): Promise<ReviewDocument | null> {
    return this.reviewModel.findOne({ orderId }).exec();
  }

  async findByRestaurant(restaurantId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ restaurantId }).exec();
  }

  async getAverageRating(restaurantId: string): Promise<number> {
    const result = await this.reviewModel.aggregate([
      { $match: { restaurantId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);
    return result.length > 0 ? result[0].avgRating : 0;
  }
}