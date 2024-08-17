import { Request, Response, NextFunction } from 'express';
import reviewsService from '../services/reviews.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:reviews-middleware');

class ReviewsMiddleware {
    /*
    async validateRequiredProductBodyFields(req: Request, res: Response, next: NextFunction) {
        if (req.body && req.body.name && req.body.description && req.body.price) {
            // TODO: Validate using DTO and class-validator
            next();
        } else {
            res.status(400).send({ error: `Missing required fields: name, description and price` });
        }
    }

    async validateProductWithSameNameExists(req: Request, res: Response, next: NextFunction) {
        const product = await productsService.readByName(req.body.name);
        if (product) {
            res.status(400).send({ error: `Product name already exists` });
        } else {
            next();
        }
    }
    */

    async validateUserReviewForProductExists(req: Request, res: Response, next: NextFunction) {
        const review = await reviewsService.readByUserIdProductId(req.body.userId, req.body.productId);
        if (review) {
            res.status(400).send({ error: `User already reviewed this product` });
        } else {
            next();
        }
    }

    async validateReviewExists(req: Request, res: Response, next: NextFunction) {
        const review = await reviewsService.readById(req.body.reviewId);
        if (review) {
            // Cache the product in the request
            // res.locals.product = product;
            next();
        } else {
            res.status(404).send({
                error: `Review ${req.body.reviewId} not found`,
            });
        }
    }

    async filterDtoFields(req: Request, res: Response, next: NextFunction) {
        // TODO: Unfortunately, I didn't find suitable way to filter fields in the DTO,
        // TODO: as it is interface. Could be implemented as a class.
        // TODO: It's needed to disallow updating productId, for example.
        const allowedFields = ['reviewId', 'text', 'rating'];
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key) && !allowedFields.includes(key)) {
                log('Deleting field', key);
                delete req.body[key];
            }
        }
        next();
    }

    // Put productId into the request body
    async extractReviewId(req: Request, res: Response, next: NextFunction) {
        req.body.reviewId = req.params.reviewId;
        next();
    }
}

export default new ReviewsMiddleware();
