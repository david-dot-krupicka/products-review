import {NextFunction, Response} from 'express';
import * as httpReviews from '../types/http.reviews';
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

    validateUserReviewForProductExists = async (
        req: httpReviews.CreateReviewsRequest,
        res: Response,
        next: NextFunction
    )=> {
        const review = await reviewsService.readByUserIdProductId(req.body.userId, req.body.productId);
        if (review) {
            res.status(400).send({ error: `User already reviewed this product` });
        } else {
            next();
        }
    }

    validateReviewExists = async (
        req: httpReviews.ReviewByIdParamsRequest,
        res: Response,
        next: NextFunction
    )=> {
        const review = await reviewsService.readById(req.params.reviewId);
        if (review) {
            // Cache the product in the request
            // res.locals.product = product;
            next();
        } else {
            res.status(404).send({
                error: `Review ${req.params.reviewId} not found`,
            });
        }
    }

    saveProductId = (
        req: httpReviews.PatchReviewRequest,
        res: Response,
        next: NextFunction
    )=> {
        if (req.body.productId !== undefined) {
            res.locals.productId = req.body.productId;
        }
        next();
    }

    filterDtoFields = (
        req: httpReviews.PatchReviewRequest,
        res: Response,
        next: NextFunction
    )=> {
        /*
            TODO: Unfortunately, I didn't find suitable way to filter superfluous fields in the DTO,
            TODO: as it is interface. Could be implemented as a class.
            TODO: It's needed to disallow updating productId, for example.
            TODO
            TODO: Figure out if it's needed and find a way to implement it
         */
        const allowedKeys: string[] = [
            "reviewId",
            "text",
            "rating"
        ];
        const tempDict = {} as httpReviews.ReviewIdPatchBody;

        log('Removing superfluous fields from request body.');
        log('Original request body: ', req.body);
        allowedKeys.forEach((key) => {
            if (
                Object.prototype.hasOwnProperty.call(req.body, key) &&
                req.body[key] !== undefined
            ) {
                tempDict[key] = req.body[key];
            }
        });
        req.body = tempDict;

        log('Updated request body: ', req.body);
        next();
    }

    // Put productId into the request body
    extractReviewId = (
        req: httpReviews.ReviewByIdBodyRequest,
        res: Response,
        next: NextFunction
    ) => {
        req.body.reviewId = req.params.reviewId;
        next();
    }
}

export default new ReviewsMiddleware();
