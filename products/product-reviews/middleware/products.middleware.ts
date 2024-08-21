import { Response, NextFunction } from 'express';
import productsService from '../services/products.service';
import debug from 'debug';
import * as httpProducts from "../types/http.products";
import {CreateReviewsRequest} from "../types/http.reviews";

const log: debug.IDebugger = debug('app:products-middleware');

class ProductsMiddleware {
    validateRequiredProductBodyFields = (req: httpProducts.CreateProductRequest, res: Response, next: NextFunction)=> {
        if (req.body.price >= 0) {
            // TODO: Validate using DTO and class-validator
            next();
        } else {
            res.status(400).send({ error: `The price must not be lower than zero` });
        }
    }

    validateProductExists = async (
        req: httpProducts.ProductByIdRequest | CreateReviewsRequest,
        res: Response,
        next: NextFunction
    )=> {
        if (req.body.productId) {
            const product = await productsService.readById(req.body.productId);
            if (product) {
                next();
            } else {
                res.status(404).send({
                    error: `Product ${req.body.productId} not found`,
                });
            }
        } else {
            next();
        }
    }

    validateProductWithSameNameExists = async (
        req: httpProducts.CreateProductRequest | httpProducts.PatchProductRequest,
        res: Response,
        next: NextFunction
    )=> {
        if (req.body.name) {
            const product = await productsService.readByName(req.body.name);
            if (product) {
                res.status(400).send({error: `Product name already exists`});
            } else {
                next();
            }
        } else {
            res.status(400).send({error: `Missing required field: name`});
        }
    }

    validatePatchProductName = async (req: httpProducts.PatchProductRequest, res: Response, next: NextFunction) => {
        if (req.body.name) {
            log('Validating product name', req.body.name);
            await this.validateProductWithSameNameExists(req, res, next);
        } else {
            next();
        }
    }

    // Put productId into the request body
    extractProductId = (
        req: httpProducts.ProductByIdBodyRequest,
        res: Response,
        next: NextFunction
    )=> {
        req.body.productId = req.params.productId;
        next();
    }
}

export default new ProductsMiddleware();
