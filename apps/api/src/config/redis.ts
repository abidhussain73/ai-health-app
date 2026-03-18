import { createClient } from 'redis';
import { logger } from '../utils/logger';

export const redis = createClient({
  url: process.env.REDIS_URL
});

export const connectRedis = async (): Promise<void> => {
  redis.on('error', (err) => logger.error(`Redis error: ${String(err)}`));
  await redis.connect();
  await redis.ping();
  logger.info('Redis connected');
};
