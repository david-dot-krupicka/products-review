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
    // We have the hostnames set for this purpose
    private queueName = process.env["HOSTNAME"] ?? "reviews-0";

    constructor() {
        try {
            this.worker = new Worker<JobData>(
                this.queueName,
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
            log('Creating new instance of ReviewsService. Listening to queue', this.queueName);
        } catch (error) {
            log('Error connecting to Redis', error);
        }
    }

    test() {
        log('Test method called');
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
