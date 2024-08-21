import { createClient } from 'redis';
import debug from 'debug';

const log: debug.IDebugger = debug('app:redis');

const redisClient = createClient({
    url: 'redis://localhost:6379',
    socket: {
        connectTimeout: 5000 // 5 seconds timeout
    }
});

redisClient.on('error', (err) => {
    log('Redis Client Error', err)
});

redisClient.connect()
    .then(() => { log('Connected to local Redis') })
    .catch((error: unknown) => { log('Error connecting to local Redis', error) });

export default redisClient;