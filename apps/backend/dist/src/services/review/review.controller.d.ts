import { ReviewService } from './review.service';
import { type Request as ExpressRequest } from 'express';
export declare class ReviewController {
    private reviewService;
    constructor(reviewService: ReviewService);
    create(body: {
        restaurantId: string;
        orderId: string;
        rating: number;
        comment?: string;
        images?: string[];
    }, req: ExpressRequest & {
        user: {
            id: string;
        };
    }): Promise<import("../../db/schemas/review.schema").ReviewDocument>;
    findByOrder(orderId: string): Promise<import("../../db/schemas/review.schema").ReviewDocument | null>;
    findByRestaurant(restaurantId: string): Promise<import("../../db/schemas/review.schema").ReviewDocument[]>;
    getAverageRating(restaurantId: string): Promise<{
        averageRating: number;
    }>;
}
