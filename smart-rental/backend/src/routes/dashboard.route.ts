import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/', authorize(['ADMIN', 'LANDLORD']), getDashboardData);

export default router;
