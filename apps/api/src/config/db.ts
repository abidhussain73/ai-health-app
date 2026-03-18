import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 5000
  });

  logger.info(`MongoDB connected: ${conn.connection.host}`);
};
