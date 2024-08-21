import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis.config';
import debug from 'debug';

const log: debug.IDebugger = debug('app:cache-middleware');

class CacheMiddleware {
    checkCache = async (req: Request, res: Response, next: NextFunction)=> {
        const { productId, reviewId } = req.params;
        let id = 'product-';
        if (productId) {
            id += productId;
        } else if (reviewId) {
            id = `review-${reviewId}`;
        }

        try {
            const cachedData = await redisClient.get(id);

            if (cachedData) {
                log(`Cache hit for id: ${id}`);
                res.status(200).send(JSON.parse(cachedData));
            } else {
                log(`Cache miss for id: ${id}`);
                next();
            }
        } catch (error) {
            log('Error checking cache', error);
            next();
        }
    }

    /* TODO: Not implemented, it requires more processing
       TODO: * pagination
       TODO: * if we store lists in cache, or, pages, we need to inspect them to properly invalidate such entries.
    checkCacheList = async (req: Request, res: Response, next: NextFunction)=> {
        try {
            // TODO: Pagination is currently hardcoded, not implemented
            const cachedData = await redisClient.get('products-100-0');

            if (cachedData) {
                log('Cache hit for product list "products-100-0"');
                res.status(200).send(JSON.parse(cachedData));
            } else {
                log('Cache miss for product list "products-100-0"');
                next();
            }
        } catch (error) {
            log('Error checking cache', error);
            next();
        }
    }
     */
}

export default new CacheMiddleware();
