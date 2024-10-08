import {CreateReviewDto} from '../dto/create.review.dto';
import {PatchReviewDto} from '../dto/patch.review.dto';
import {JobData, JobDataDefinition} from '../../common/types/jobdata';

import mongooseService from '../../common/services/mongoose.service';
import bullmqService from '../../common/services/bullmq.service';
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
        rating: { type: Number, min: 1, max: 5 },
    }).index({ userId: 1, productId: 1 }, { unique: true }); // Compound index

    Reviews = mongooseService.getMongoose().model('Reviews', this.reviewSchema);

    // By this, I am trying to pass the correct schema to work on.
    // It could be done in a better way.
    JobDefinition: JobDataDefinition = {
        collectionName: 'reviews',
        productIdFieldName: 'productId',
        ratingFieldName: 'rating',
    }

    constructor() {
        log('Created new instance of ReviewsDao.');
    }

    private async addReviewJob(reviewId: string, productId: string) {
        const jobData: JobData = {
            definition: this.JobDefinition,
            productId: productId,
        };
        await bullmqService.addJob('average-' + reviewId, jobData);
    }

    async addReview(reviewFields: CreateReviewDto) {
        try {
            const review = new this.Reviews({
                ...reviewFields,
            });
            await review.save();
            await this.addReviewJob(review._id.toString(), reviewFields.productId);

            return review._id;
        } catch (error) {
            log('Error saving review: ', error);
            throw error;
        }
    }

    async listReviews(limit = 25, page = 0, productId: string | undefined) {
        try {
            const query = productId ? {productId: productId} : {};
            const reviews = await this.Reviews.find(query)
                .limit(limit)
                .skip(limit * page)
                .exec();
            return reviews;
        } catch (error) {
            log('Error listing reviews: ', error);
            throw error;
        }
    }

    async getReviewById(reviewId: string) {
        try {
            const review = await this.Reviews.findOne({_id: reviewId}).exec();
            return review;
        } catch (error) {
            log('Error getting review by id: ', error);
            throw error;
        }
    }

    async getReviewByUserIdProductId(userId: string, productId: string) {
        try {
            const review = await this.Reviews.findOne({userId: userId, productId: productId}).exec();
            return review;
        } catch (error) {
            log('Error getting review by user id and product id: ', error);
            throw error;
        }
    }

    async updateReviewById(
        reviewId: string,
        reviewFields: PatchReviewDto
    ) {
        try {
            log(reviewId, reviewFields);
            const review = await this.Reviews.findOneAndUpdate(
                {_id: reviewId},
                {$set: reviewFields},
                {new: true}   // return the updated document
            ).exec();
            log(review);

            if (review?.productId) {
                await this.addReviewJob(
                    review._id.toString(),
                    review.productId.toString()
                );
                return review;
            }
        } catch (error) {
            log('Error updating review by id: ', error);
            throw error;
        }
    }

    async removeReviewById(reviewId: string) {
        try {
            const review = await this.getReviewById(reviewId);
            await this.Reviews.deleteOne({_id: reviewId}).exec();

            if (review?.productId) {
                const productId = review.productId.toString();
                await this.addReviewJob(review._id.toString(), productId);
                // return productId to invalidate cache
                return productId;
            }
        } catch (error) {
            log('Error removing review by id: ', error);
            throw error;
        }
    }
}

export default new ReviewsDao();
