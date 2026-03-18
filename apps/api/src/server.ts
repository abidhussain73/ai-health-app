import 'dotenv/config';
import { app } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(env.PORT, () => {
      logger.info(`API server listening on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(`Startup failed: ${String(error)}`);
    process.exit(1);
  }
};

void start();
