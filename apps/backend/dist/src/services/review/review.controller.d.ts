import { ReviewService } from './review.service';
export declare class ReviewController {
    private reviewService;
    constructor(reviewService: ReviewService);
    create(body: {
        userId: string;
        restaurantId: string;
        orderId: string;
        rating: number;
        comment?: string;
        images?: string[];
    }): Promise<import("../../db/schemas/review.schema").ReviewDocument>;
    findByOrder(orderId: string): Promise<import("../../db/schemas/review.schema").ReviewDocument | null>;
    findByRestaurant(restaurantId: string): Promise<import("../../db/schemas/review.schema").ReviewDocument[]>;
    getAverageRating(restaurantId: string): Promise<{
        averageRating: number;
    }>;
}
