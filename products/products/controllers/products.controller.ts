// we import express to add types to the request/response objects from our controller functions
import express from 'express';

// we import our newly created user services
import productsService from '../services/products.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:products-controller');

class ProductsController {
    async listProducts(req: express.Request, res: express.Response) {
        const products = await productsService.list(100, 0);
        res.status(200).send(products);
    }

    async getProductById(req: express.Request, res: express.Response) {
        const product = await productsService.readById(req.body.id);
        log("Fetched product");
        log(product);
        res.status(200).send(product);
    }

    async createProduct(req: express.Request, res: express.Response) {
        const productId = await productsService.create(req.body);
        res.status(201).send({ id: productId });
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    async patchProduct(req: express.Request, res: express.Response) {
        log(await productsService.patchById(req.body.id, req.body));
        res.status(204).send();
    }

    // 204 Ref. RFC 7231: https://tools.ietf.org/html/rfc7231#section-6.3.5
    async removeProduct(req: express.Request, res: express.Response) {
        log(await productsService.deleteById(req.body.id));
        res.status(204).send();
    }
}

export default new ProductsController();
