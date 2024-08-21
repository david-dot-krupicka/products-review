import { Response } from 'express';
import * as httpReviews from "../types/http.reviews";
import reviewsService from '../services/reviews.service';
import debug from 'debug';
import redisClient from "../config/redis.config";

const log: debug.IDebugger = debug('app:reviews-controller');

class ReviewsController {
    static readonly internalErrorMessage: string = 'Internal Server Error';

    getReviewById = async (req: httpReviews.ReviewByIdRequest, res: Response)=> {
        try {
            const review = await reviewsService.readById(req.body.reviewId);

            if (review) {
                await redisClient.set(`review-${req.body.reviewId}`, JSON.stringify(review), {
                    EX: 3600 // Cache for 1 hour
                });
                res.status(200).send(review);
            } else {
                res.status(404).send({ error: `Product ${req.body.reviewId} not found` });
            }
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    listReviewsByProductId = async (req: httpReviews.ReviewsByProductIdBodyRequest, res: Response)=> {
        try {
            // TODO: Setting page and limit not implemented
            const reviews = await reviewsService.list(100, 0, req.body.productId);
            res.status(200).send(reviews);
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    createReview = async (req: httpReviews.CreateReviewsRequest, res: Response)=> {
        try {
            const reviewId = await reviewsService.create(req.body);
            await redisClient.del(`product-${req.body.productId}`); // Invalidate cache
            res.status(201).send({id: reviewId});
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    patchReview = async (req: httpReviews.PatchReviewRequest, res: httpReviews.ReviewLocalsResponse)=> {
        try {
            const review = await reviewsService.patchById(
                req.body.reviewId,
                req.body,
            );
            if (review?.productId) {
                await redisClient.del(`review-${req.body.reviewId}`); // Invalidate cache
                await redisClient.del(`product-${review.productId}`); // Invalidate cache
                res.status(204).send();
            } else {
                res.status(404).send({ error: `Review ${req.body.reviewId} not found` });
            }
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    removeReview = async (req: httpReviews.ReviewByIdRequest, res: httpReviews.ReviewLocalsResponse)=> {
        try {
            const productId = await reviewsService.deleteById(req.body.reviewId);
            if (productId) {
                await redisClient.del(`review-${req.body.reviewId}`); // Delete cache
                await redisClient.del(`product-${productId}`); // Invalidate cache
                res.status(204).send();
            } else {
                res.status(404).send({ error: `Review ${req.body.reviewId} not found` });
                return;
            }
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }
}

export default new ReviewsController();
