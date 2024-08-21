import { Request, Response } from 'express';
import * as httpProducts from '../types/http.products';
import productsService from '../services/products.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:products-controller');

class ProductsController {
    static readonly internalErrorMessage: string = 'Internal Server Error';

    listProducts = async (req: Request, res: Response) => {
        try {
            const products = await productsService.list(100, 0);
            res.status(200).send(products);
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }

    getProductById = async (req: httpProducts.ProductByIdRequest, res: Response) =>{
        try {
            const product = await productsService.readById(req.body.productId);
            log("Fetched product");
            log(product);
            res.status(200).send(product);
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
            res.status(204).send();
        } catch (error) {
            log(error);
            res.status(500).send(ProductsController.internalErrorMessage);
        }
    }
}

export default new ProductsController();
