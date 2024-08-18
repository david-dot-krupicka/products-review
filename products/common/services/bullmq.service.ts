import { Queue } from 'bullmq';
import debug from 'debug';

const log: debug.IDebugger = debug('app:redis-service');

class BullQueueService {
    reviewQueue!: Queue;

    constructor() {
        try {
            this.reviewQueue = new Queue('reviewQueue', {
                connection: {
                    host: 'redis',
                    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                }
            });
        } catch (error) {
            log('Error connecting to Redis', error);
        }
    }

    getQueues() {
        // TODO: should be more queues based on totalShards count
        return this.reviewQueue;
    }

    async addJob(name: string) {
        // TODO: Use delay to schedule a job, so workers will pick up more of them, if possible
        await this.reviewQueue.add(name, { productId: '123', reviewId: '456' });
    }

    async getJobs() {
        return await this.reviewQueue.getJobs([], 0, 100, true)
    }
}

export default new BullQueueService();