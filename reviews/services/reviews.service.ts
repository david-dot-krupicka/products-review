/*
import ReviewsDao from '../dao/reviews.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateReviewDto } from '../dto/create.review.dto';
import { PatchReviewDto } from '../dto/patch.review.dto';
*/
import { Worker } from 'bullmq';
import debug from 'debug';

const
    hostname: string = process.env["HOSTNAME"] || "",
    log: debug.IDebugger = debug(`app-${hostname}:reviews-service`);

class ReviewsService {
    reviewWorker!: Worker;

    constructor() {
        try {
            this.reviewWorker = new Worker(
               'reviewQueue',
               async (job) => {
                    log(`Processing job ${job.id} of type ${job.name}`);
                    log(job.data);
                },
               {
                    connection: {
                        host: 'redis',
                        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                    }
                }
            );
        } catch (error) {
            log('Error connecting to Redis', error);
        }
    }
    async logFromService() {
       return log("Hello from ReviewsService");
    }

    /*
    async create(resource: CreateReviewDto) {
        return ReviewsDao.addReview(resource);
    }

    async readById(id: string | number) {
        return ReviewsDao.getReviewById(id);
    }

    async readByUserIdProductId(id: string, productId: string ) {
        return ReviewsDao.getReviewByUserIdProductId(id, productId);
    }

    async patchById(id: string | number, resource: PatchReviewDto) {
        return ReviewsDao.updateReviewById(id, resource);
    }

    async deleteById(id: string | number) {
        return ReviewsDao.removeReviewById(id);
    }
    */

    /* comment */
}

export default new ReviewsService();
