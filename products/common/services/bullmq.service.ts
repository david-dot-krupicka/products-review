import { EventEmitter } from "events";
import { JobData, JobResult } from '../types/jobdata';
import { Job, QueueEvents, Queue } from 'bullmq';
import debug from 'debug';

const log: debug.IDebugger = debug('app:bullmq-service');

class BullQueueService extends EventEmitter {
    reviewQueue!: Queue;
    queueEvents!: QueueEvents;

    constructor() {
        super();    // Initialize the EventEmitter

        try {
            this.reviewQueue = new Queue('reviewQueue', {
                connection: {
                    host: 'redis',
                    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                }
            });

            this.queueEvents = new QueueEvents('reviewQueue', {
                connection: {
                    host: 'redis',
                    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                }
            });

            this.queueEvents.on('completed', (event) => {
                this.onJobCompleted(event).then(() => {
                    log('Job completed');
                }).catch((error: unknown) => {
                    log(error);
                    throw error;
                });
            });
            this.queueEvents.on('failed', (event) => {
                this.onJobFailed(event).then(() => {
                    log('Job failed');
                }).catch((error: unknown) => {
                    log(error);
                    throw error;
                });
            });

        } catch (error) {
            log('Error connecting to Redis', error);
        }
    }

    getQueues() {
        // TODO: should be more queues based on totalShards count
        return this.reviewQueue;
    }

    async addJob(name: string, data: JobData) {
        // Here we could use some delay if needed.
        await this.reviewQueue.add(name, data);
    }

    async getJobs() {
        return await this.reviewQueue.getJobs([], 0, 100, true)
    }

    private async onJobCompleted({ jobId }: { jobId: string }) {
        try {
            const job = await Job.fromId(this.reviewQueue, jobId)

            if (job?.id !== undefined) {
                const result: JobResult = job.returnvalue as JobResult;
                log(`Job ${job.id} completed with result: ${(result.avgRatingRounded).toString()}`);

                // Emit event for product.dao to update the average rating
                this.emit('jobCompleted', result);
                // Remove the job from the queue
                await job.remove();
            } else {
                log(`Job ${jobId} not found`);
            }
        } catch (error) {
            log(`Error processing job ${jobId}`, error);
        }
    }

    private async onJobFailed({ jobId }: { jobId: string }) {
        try {
            const job = await Job.fromId(this.reviewQueue, jobId)

            if (job?.id !== undefined) {
                log(`Job ${job.id} failed with reason: ${job.failedReason}`);
                // We could have also some retry policy set
                await job.remove();
            } else {
                log(`Job ${jobId} not found`);
            }
        } catch (error) {
            log(`Error processing job ${jobId}`, error);
        }
    }
}

export default new BullQueueService();