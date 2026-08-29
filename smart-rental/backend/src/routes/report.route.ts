import { Router } from 'express';
import { getRevenueReport, getOccupancyReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.get('/revenue', authorize(['ADMIN', 'LANDLORD']), getRevenueReport);
router.get('/occupancy', authorize(['ADMIN', 'LANDLORD']), getOccupancyReport);

export default router;
