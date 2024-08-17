import { Application } from "express";
import { CommonRoutesConfig } from "../common/common.routes.config";
import ProductsController from "./controllers/products.controller";
import ProductsMiddleware from "./middleware/products.middleware";

export class ProductsRoutesConfig extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, "ProductRoutes");
    }

    protected configureRoutes() {

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

        return this.app;
    }
}
