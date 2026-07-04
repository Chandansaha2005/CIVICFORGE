import { Router } from 'express';
import { getPriorityMatrix } from '../controllers/priorityController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', verifyToken as any, requireRole('mp') as any, getPriorityMatrix as any);

export default router;
