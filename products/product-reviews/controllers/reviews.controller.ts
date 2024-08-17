import { Request, Response } from 'express';
import reviewsService from '../services/reviews.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:reviews-controller');

class ReviewsController {
    async getReviewById(req: Request, res: Response) {
        const review = await reviewsService.readById(req.body.reviewId);
        log("Fetched review");
        log(review);
        res.status(200).send(review);
    }

    async createReview(req: Request, res: Response) {
        const reviewId = await reviewsService.create(req.body);
        res.status(201).send({ id: reviewId });
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    async patchReview(req: Request, res: Response) {
        log(await reviewsService.patchById(req.body.reviewId, req.body));
        res.status(204).send();
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    async removeReview(req: Request, res: Response) {
        log(await reviewsService.deleteById(req.body.reviewId));
        res.status(204).send();
    }
}

export default new ReviewsController();
