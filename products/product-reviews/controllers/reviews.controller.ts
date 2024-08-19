import { Request, Response } from 'express';
import reviewsService from '../services/reviews.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:reviews-controller');

class ReviewsController {
    static readonly internalErrorMessage: string = 'Internal Server Error';

    async getReviewById(req: Request, res: Response) {
        try {
            const review = await reviewsService.readById(req.body.reviewId);
            log("Fetched review");
            log(review);
            res.status(200).send(review);
        } catch (error) {
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    async createReview(req: Request, res: Response) {
        try {
            const reviewId = await reviewsService.create(req.body);
            res.status(201).send({id: reviewId});
        } catch (error) {
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    async patchReview(req: Request, res: Response) {
        try {
            log(await reviewsService.patchById(req.body.reviewId, req.body));
            res.status(204).send();
        } catch (error) {
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    async removeReview(req: Request, res: Response) {
        try {
            log(await reviewsService.deleteById(req.body.reviewId));
            res.status(204).send();
        } catch (error) {
            res.status(500).send(ReviewsController.internalErrorMessage);
        }
    }
}

export default new ReviewsController();
