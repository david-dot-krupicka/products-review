/* eslint-disable */
// TODO: fix eslint-disable later
import { expect } from 'chai';
import { ProductReviewsRoutesConfig } from '../../product-reviews/product-reviews.routes.config';
import express from 'express';

describe('ProductReviewsRoutesConfig', () => {
    it('should configure product-reviews routes', () => {
        const app = express();
        new ProductReviewsRoutesConfig(app);
        const routes = app._router.stack.filter((layer: any) => layer.route);
        const routePaths = routes.map((layer: any) => layer.route.path);

        console.log(routePaths);

        expect(routePaths).to.include('/products');
        expect(routePaths).to.include('/products/:productId');
        expect(routePaths).to.include('/reviews');
        expect(routePaths).to.include('/reviews/:reviewId');
    });
});
