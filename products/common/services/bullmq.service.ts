import { EventEmitter } from "events";
import { JobData, JobResult } from '../types/jobdata';
import { Job, QueueEvents, Queue } from 'bullmq';
import debug from 'debug';

const log: debug.IDebugger = debug('app:bullmq-service');

class BullQueueService extends EventEmitter {
    totalShards = process.env.REPLICA_COUNT ?? '2';
    queues: Queue[] = [];
    queueEvents: QueueEvents[] = [];

    constructor() {
        super();    // Initialize the EventEmitter

        try {
            const connectionOptions = {
                connection: {
                    host: 'redis',
                    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
                }
            }

            // Create queues in loop
            for (let i = 0; i < parseInt(this.totalShards); i++) {
                const queueName = `reviews-${i.toString()}`;

                this.queues.push(new Queue(queueName, connectionOptions));

                const queueListener = new QueueEvents(queueName, connectionOptions);

                queueListener.on('completed', (event) => {
                    this.onJobCompleted(i, event).then(() => {
                        log(`Job in ${queueName} queue completed`);
                    }).catch((error: unknown) => {
                        log(error);
                        throw error;
                    });
                });

                queueListener.on('failed', (event) => {
                    log(event);
                    this.onJobFailed(i, event).then(() => {
                        log(`Job in ${queueName} queue failed`);
                    }).catch((error: unknown) => {
                        log(error);
                        throw error;
                    });
                });

                this.queueEvents.push(queueListener);

                log(`Queue ${queueName} created`);
            }
        } catch (error) {
            log('Error connecting to Redis', error);
        }
    }

    getQueueIndex(productId: string) {
        // Convert productId to number and get queue index
        return parseInt(productId, 16) % parseInt(this.totalShards);
    }

    async addJob(name: string, data: JobData) {
        const index = this.getQueueIndex(data.productId);
        // Here we could use some delay if needed.
        await this.queues[index].add(name, data);
        log(`Job ${name} added to queue reviews-${index.toString()}`);
    }

    private async onJobCompleted(queueIndex: number, { jobId }: { jobId: string }) {
        try {
            const job = await Job.fromId(this.queues[queueIndex], jobId)

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

    private async onJobFailed(queueIndex: number, { jobId }: { jobId: string }) {
        try {
            const job = await Job.fromId(this.queues[queueIndex], jobId)

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