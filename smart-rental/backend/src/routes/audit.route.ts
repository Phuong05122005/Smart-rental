import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

// ONLY ADMIN
router.get('/', authorize(['ADMIN']), getAuditLogs);

export default router;
