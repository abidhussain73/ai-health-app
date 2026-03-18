import { Router } from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis';

const router = Router();

router.get('/health', async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const redisAlive = redis.isOpen ? (await redis.ping()) === 'PONG' : false;

  res.json({
    status: 'ok',
    db: dbState === 1 ? 'connected' : 'disconnected',
    redis: redisAlive ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

export default router;
