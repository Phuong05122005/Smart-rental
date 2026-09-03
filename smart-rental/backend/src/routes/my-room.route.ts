import { Router } from 'express';
import { getMyRoom } from '../controllers/my-room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['TENANT']), getMyRoom);

export default router;
