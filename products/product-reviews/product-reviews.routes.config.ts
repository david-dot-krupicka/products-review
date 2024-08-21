import { Application } from "express";
import AsyncHandler from "express-async-handler";
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
            .get(AsyncHandler(ProductsController.listProducts))
            .post(
                AsyncHandler(ProductsMiddleware.validateRequiredProductBodyFields),
                AsyncHandler(ProductsMiddleware.validateProductWithSameNameExists),
                AsyncHandler(ProductsController.createProduct)
            );

        this.app.param(`productId`, ProductsMiddleware.extractProductId);
        this.app
            .route(`/products/:productId`)
            .all(AsyncHandler(
                ProductsMiddleware.validateProductExists))
            .get(AsyncHandler(
                ProductsController.getProductById))
            .delete(AsyncHandler(
                ProductsController.removeProduct))
            .patch(
                AsyncHandler(ProductsMiddleware.validatePatchProductName),
                AsyncHandler(ProductsController.patchProduct)
            );

        // TODO: This is for product controllers
        // TODO: Although list in CRUD interface must be implemented in the service
        /*this.app
            .route(`/products/:productId/reviews`)
            .all(ProductsMiddleware.validateProductExists)
            .get(ReviewsController.listReviewsByProductId);*/

        this.app.route(`/reviews`)
            // TODO: userId from JWT
            .get(
                AsyncHandler(ProductsMiddleware.validateProductExists),
                AsyncHandler(ReviewsController.listReviewsByProductId)
            )
            .post(
                AsyncHandler(ProductsMiddleware.validateProductExists),
                AsyncHandler(ReviewsMiddleware.validateUserReviewForProductExists),
                AsyncHandler(ReviewsController.createReview)
            );

        this.app.param(`reviewId`, ReviewsMiddleware.extractReviewId);
        this.app
            .route(`/reviews/:reviewId`)
            .all(AsyncHandler(
                ReviewsMiddleware.validateReviewExists))
            .get(AsyncHandler(
                ReviewsController.getReviewById))
            .delete(AsyncHandler(
                ReviewsController.removeReview))
            .patch(
                AsyncHandler(ReviewsMiddleware.saveProductId),
                AsyncHandler(ReviewsMiddleware.filterDtoFields),
                AsyncHandler(ReviewsController.patchReview)
            );

        return this.app;
    }
}
