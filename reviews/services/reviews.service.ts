import { Worker, Job } from 'bullmq';
import { JobData, JobDataDefinition, JobResult } from '../types/jobdata';
import mongooseService from './mongoose.service';
import debug from 'debug';

const
    hostname: string = process.env["HOSTNAME"] || "",
    log: debug.IDebugger = debug(`app-${hostname}:reviews-service`);

class ReviewsService {
    private worker!: Worker<JobData>;
    private mongoose = mongooseService.getMongoose();

    constructor() {
        log('Created new instance of ReviewsService.');
        try {
            this.worker = new Worker<JobData>(
                'reviewQueue',
                async (job: Job<JobData>) => {
                    log(`Processing job ${job.id} of type ${job.name}`);

                    const { definition, productId} = job.data;
                    return await this.calculateAverageRating(definition, productId);
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

    private async calculateAverageRating(definition: JobDataDefinition, productId: string) {
        try {
            const reviewsCollection = this.mongoose.connection.collection(definition.collectionName);
            const result = await reviewsCollection.aggregate([
                {
                    $match: { [definition.productIdFieldName]: productId }
                },
                {
                    $group: {
                        _id: '$' + definition.productIdFieldName,
                        avgRating: { $avg: '$' + definition.ratingFieldName }
                    }
                },
                {
                    $addFields: {
                        avgRatingRounded: { $round: ['$avgRating', 2] },
                    }
                }
            ]).toArray();

            log('Result', result[0]);
            return result[0] as JobResult;
        } catch (error) {
            log('Error processing job', error);
            throw error;
        }
    }
}

export default ReviewsService;
