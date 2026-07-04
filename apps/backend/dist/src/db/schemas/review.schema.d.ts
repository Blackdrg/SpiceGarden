import { Document } from 'mongoose';
export declare class ReviewDocument extends Document {
    userId: string;
    restaurantId: string;
    orderId: string;
    rating: number;
    comment: string;
    images: string[];
}
export declare const ReviewSchema: mongoose.Schema<TClass>;
