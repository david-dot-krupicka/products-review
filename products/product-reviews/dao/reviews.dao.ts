import { CreateReviewDto } from '../dto/create.review.dto';
import { PatchReviewDto } from '../dto/patch.review.dto';

import mongooseService from '../../common/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:reviews-dao');

class ReviewsDao {
    Schema = mongooseService.getMongoose().Schema;

    reviewSchema = new this.Schema({
        userId: String,
        productId: { type: String, ref: 'Products' },
        firstName: String,
        lastName: String,
        text: String,
        rating: Number,
    }).index({ userId: 1, productId: 1 }, { unique: true }); // Compound index

    Reviews = mongooseService.getMongoose().model('Reviews', this.reviewSchema);
    constructor() {
        log('Created new instance of ReviewsDao.');
    }

    async addReview(reviewFields: CreateReviewDto) {
        const review = new this.Reviews({
            ...reviewFields,
        });
        // Add try catch here and return the error properly
        await review.save();
        return review._id;
    }

    // TODO: maybe only for debugging?
    async getReviewById(reviewId: string | number) {
        return this.Reviews.findOne({ _id: reviewId }).exec();
    }

    async getReviewByUserIdProductId(userId: string, productId: string ) {
        return this.Reviews.findOne({userId: userId, productId: productId }).exec();
    }

    async updateReviewById(
        reviewId: string | number,
        reviewFields: PatchReviewDto
    ) {
        return await this.Reviews.findOneAndUpdate(
            { _id: reviewId },
            { $set: reviewFields },
            { new: true }   // return the updated document
        ).exec();
    }

    async removeReviewById(reviewId: string | number) {
        return this.Reviews.deleteOne({ _id: reviewId }).exec();
    }
}

export default new ReviewsDao();
