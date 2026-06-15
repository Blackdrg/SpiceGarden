import { Model } from 'mongoose';
import { ReviewDocument } from '../../db/schemas/review.schema';
export declare class ReviewService {
    private reviewModel;
    constructor(reviewModel: Model<ReviewDocument>);
    create(userId: string, restaurantId: string, orderId: string, rating: number, comment?: string, images?: string[]): Promise<ReviewDocument>;
    findByOrder(orderId: string): Promise<ReviewDocument | null>;
    findByRestaurant(restaurantId: string): Promise<ReviewDocument[]>;
    getAverageRating(restaurantId: string): Promise<number>;
}
