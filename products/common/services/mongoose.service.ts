import mongoose from 'mongoose';
import debug from 'debug';

const log: debug.IDebugger = debug('app:mongoose-service');

class MongooseService {
    private count = 0;
    private mongooseOptions = {
        authSource: 'admin',
        serverSelectionTimeoutMS: 5000,
    };

    constructor() {
        this.connectWithRetry();
    }

    getMongoose() {
        return mongoose;
    }

    connectWithRetry = () => {
        log('Attempting MongoDB connection (will retry if needed)');
        mongoose
            // TODO: hardcoded, visible
            .connect('mongodb://test:test123@mongodb:27017/products', this.mongooseOptions)
            .then(() => {
                log('MongoDB is connected');
            })
            .catch((err: unknown) => {
                const retrySeconds = 5;
                log(
                    `MongoDB connection failed (will retry #${(++this
                        .count).toString()} after ${retrySeconds.toString()} seconds:`,
                    err
                );
                setTimeout(this.connectWithRetry, retrySeconds * 1000);
            });
    };
}
export default new MongooseService();
