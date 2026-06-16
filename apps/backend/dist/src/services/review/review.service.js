"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_schema_1 = require("../../db/schemas/review.schema");
let ReviewService = class ReviewService {
    reviewModel;
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async create(userId, restaurantId, orderId, rating, comment, images) {
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
    async findByOrder(orderId) {
        return this.reviewModel.findOne({ orderId }).exec();
    }
    async findByRestaurant(restaurantId) {
        return this.reviewModel.find({ restaurantId }).exec();
    }
    async getAverageRating(restaurantId) {
        const result = await this.reviewModel.aggregate([
            { $match: { restaurantId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' } } },
        ]);
        return result.length > 0 ? result[0].avgRating : 0;
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_schema_1.ReviewDocument.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof mongoose_2.Model !== "undefined" && mongoose_2.Model) === "function" ? _a : Object])
], ReviewService);
