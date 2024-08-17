import { Application } from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import ProductsController from "./controllers/products.controller";
import ProductsMiddleware from "./middleware/products.middleware";
import ReviewsController from "./controllers/reviews.controller";
import ReviewsMiddleware from "./middleware/reviews.middleware";

export class ProductReviewsRoutesConfig extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, "ProductReviewsRoutes");
    }

    protected configureRoutes() {
        // TODO: middleware require valid JWT token and decoded userId to create a review
        this.app.route(`/products`)
            .get(ProductsController.listProducts)
            .post(
                ProductsMiddleware.validateRequiredProductBodyFields,
                ProductsMiddleware.validateProductWithSameNameExists,
                ProductsController.createProduct
            );

        this.app.param(`productId`, ProductsMiddleware.extractProductId);
        this.app
            .route(`/products/:productId`)
            .all(ProductsMiddleware.validateProductExists)
            .get(ProductsController.getProductById)
            .delete(ProductsController.removeProduct)
            .patch(
                ProductsMiddleware.validatePatchProductName,
                ProductsController.patchProduct
            );

        // TODO: This is for product controllers
        // TODO: Although list in CRUD interface must be implemented in the service
        /*this.app
            .route(`/products/:productId/reviews`)
            .all(ProductsMiddleware.validateProductExists)
            .get(ReviewsController.listReviewsByProductId);*/

        this.app.route(`/reviews`)
            // TODO: userId from JWT
            .post(
                ProductsMiddleware.validateProductExists,
                ReviewsMiddleware.validateUserReviewForProductExists,
                ReviewsController.createReview
            );

        this.app.param(`reviewId`, ReviewsMiddleware.extractReviewId);
        this.app
            .route(`/reviews/:reviewId`)
            // TODO: productId required in the request body
            .all(ReviewsMiddleware.validateReviewExists)
            .get(ReviewsController.getReviewById)
            .delete(ReviewsController.removeReview)
            .patch(
                ReviewsMiddleware.filterDtoFields,
                ReviewsController.patchReview
            );

        return this.app;
    }
}
