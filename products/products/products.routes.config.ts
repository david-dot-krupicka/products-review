import express from "express";

import {CommonRoutesConfig} from "../common/common.routes.config";

export class ProductsRoutesConfig extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "ProductRoutes");
    }

    protected configureRoutes() {
        this.app.route(`/products`)
            // List of products
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send(`List of products`);
            })
            // Create a product
            .post((req: express.Request, res: express.Response) => {
                res.status(200).send(`Create product`);
            });

        this.app.route(`/products/:productId`)
            .all((req: express.Request, res: express.Response, next: express.NextFunction) => {
                next();
            })
            // Get product by id
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send(`GET product by id ${req.params.productId}`);
            })

            // Implement only patch for partial updates
            .patch((req: express.Request, res: express.Response) => {
                res.status(200).send(`PATCH requested for id ${req.params.productId}`);
            })
            // Delete product by id
            .delete((req: express.Request, res: express.Response) => {
                res.status(200).send(`DELETE requested for id ${req.params.productId}`);
            });

        return this.app;
    }
}
