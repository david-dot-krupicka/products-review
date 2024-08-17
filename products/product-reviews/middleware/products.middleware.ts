import { Request, Response, NextFunction } from 'express';
import productsService from '../services/products.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:products-middleware');

class ProductsMiddleware {
    async validateRequiredProductBodyFields(req: Request, res: Response, next: NextFunction) {
        if (req.body && req.body.name && req.body.description && req.body.price) {
            // TODO: Validate using DTO and class-validator
            next();
        } else {
            res.status(400).send({ error: `Missing required fields: name, description and price` });
        }
    }

    async validateProductExists(req: Request, res: Response, next: NextFunction) {
        const product = await productsService.readById(req.body.productId);
        if (product) {
            // Cache the product in the request
            // res.locals.product = product;
            next();
        } else {
            res.status(404).send({
                error: `Product ${req.body.productId} not found`,
            });
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

    validatePatchProductName = async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.name) {
            log('Validating product name', req.body.name);
            await this.validateProductWithSameNameExists(req, res, next);
        } else {
            next();
        }
    }

    // Put productId into the request body
    async extractProductId(req: Request, res: Response, next: NextFunction) {
        req.body.productId = req.params.productId;
        next();
    }
}

export default new ProductsMiddleware();
