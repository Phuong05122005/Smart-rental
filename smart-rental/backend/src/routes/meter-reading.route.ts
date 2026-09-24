import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getMeterReadings, saveMeterReading } from '../controllers/meter-reading.controller';

const router = Router();

router.use(authenticate as any);

// STAFF should be able to read and save meter readings
router.get('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, getMeterReadings as any);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, saveMeterReading as any);

export default router;
