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
    }): unknown;
    findByOrder(orderId: string): unknown;
    findByRestaurant(restaurantId: string): unknown;
    getAverageRating(restaurantId: string): unknown;
}
