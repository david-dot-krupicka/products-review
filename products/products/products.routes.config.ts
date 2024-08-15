import { Application, Request, Response, NextFunction } from 'express';
import { CommonRoutesConfig } from '../common/common.routes.config';
import ProductsController from './controllers/products.controller';

export class ProductsRoutesConfig extends CommonRoutesConfig {
    constructor(app: Application) {
        super(app, "ProductRoutes");
    }

    protected configureRoutes() {

        this.app.route(`/products`)
            .get(async (req: Request, res: Response) => {
                await ProductsController.listProducts(req, res);
            })
            .post(async (req: Request, res: Response) => {
                // TODO: middleware to validate request
                await ProductsController.createProduct(req, res);
            });

        // TODO: Extract id to param?
        this.app.route(`/products/:productId`)
            .all((req: Request, res: Response, next: NextFunction) => {
                // TODO: middleware to validate request
                next();
            })
            .get(async (req: Request, res: Response) => {
                await ProductsController.getProductById(req, res);
            })
            .delete(async (req: Request, res: Response) => {
                await ProductsController.removeProduct(req, res);
            });

        this.app.patch(`/products/:productId`, async (req: Request, res: Response) => {
            // TODO: middleware different validation?
            await ProductsController.patchProduct(req, res);
        });

        return this.app;
    }
}
