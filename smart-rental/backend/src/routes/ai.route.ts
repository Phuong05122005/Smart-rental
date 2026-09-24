import { Router } from 'express';
import { predictRoomPrice } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate as any);

// API cho dự đoán giá phòng (Chỉ Admin và Landlord được phép xài)
router.post('/predict-price', authorize(['ADMIN', 'LANDLORD']) as any, predictRoomPrice as any);

export default router;
