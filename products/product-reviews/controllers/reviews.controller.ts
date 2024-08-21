import { Response } from 'express';
import * as httpReviews from "../types/http.reviews";
import reviewsService from '../services/reviews.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:reviews-controller');

class ReviewsController {
    static readonly internalErrorMessage: string = 'Internal Server Error';

    getReviewById = async (req: httpReviews.ReviewByIdRequest, res: Response)=> {
        try {
            const review = await reviewsService.readById(req.body.reviewId);
            log("Fetched review");
            log(review);
            res.status(200).send(review);
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    createReview = async (req: httpReviews.CreateReviewsRequest, res: Response)=> {
        try {
            const reviewId = await reviewsService.create(req.body);
            res.status(201).send({id: reviewId});
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    patchReview = async (req: httpReviews.PatchReviewRequest, res: httpReviews.ReviewLocalsResponse)=> {
        try {
            log(await reviewsService.patchById(
                req.body.reviewId,
                req.body,
                res.locals.productId,
            ));
            res.status(204).send();
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    removeReview = async (req: httpReviews.ReviewByIdRequest, res: httpReviews.ReviewLocalsResponse)=> {
        try {
            log(await reviewsService.deleteById(req.body.reviewId, res.locals.productId,));
            res.status(204).send();
        } catch (error) {
            log(error);
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }
}

export default new ReviewsController();
