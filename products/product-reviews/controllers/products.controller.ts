import { Request, Response } from 'express';
import * as httpProducts from '../types/http.products';
import productsService from '../services/products.service';
import redisClient from '../config/redis.config';
import debug from 'debug';

const log: debug.IDebugger = debug('app:products-controller');

class ProductsController {
    static readonly internalErrorMessage: string = 'Internal Server Error';

    listProducts = async (req: Request, res: Response) => {
        try {
            // TODO: Setting page and limit not implemented
            const limit = 100, page = 0;
            const products = await productsService.list(limit, page);

            res.status(200).send(products);
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }

    getProductById = async (req: httpProducts.ProductByIdRequest, res: Response) =>{
        try {
            const product = await productsService.readById(req.body.productId);

            if (product) {
                await redisClient.set(`product-${req.body.productId}`, JSON.stringify(product), {
                    EX: 3600 // Cache for 1 hour
                });
                res.status(200).send(product);
            } else {
                res.status(404).send({ error: `Product ${req.body.productId} not found` });
            }
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }

    createProduct = async (req: httpProducts.CreateProductRequest, res: Response)=> {
        try {
            const productId = await productsService.create(req.body);
            res.status(201).send({id: productId});
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    patchProduct = async (req: httpProducts.PatchProductRequest, res: Response)=> {
        try {
            log(await productsService.patchById(req.body.productId, req.body));
            await redisClient.del(`product-${req.body.productId}`); // Invalidate cache
            res.status(204).send();
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    removeProduct = async (req: httpProducts.ProductByIdRequest, res: Response)=> {
        try {
            log(await productsService.deleteById(req.body.productId));
            await redisClient.del(`product-${req.body.productId}`); // Delete from cache
            res.status(204).send();
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }
}

export default new ProductsController();
