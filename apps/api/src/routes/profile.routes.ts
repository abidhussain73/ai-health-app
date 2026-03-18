import { Router } from 'express';
import { setupProfile } from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/setup', authenticate, setupProfile);

export default router;
