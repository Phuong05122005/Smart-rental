import { Router } from 'express';
import { getRequests, createRequest, updateRequestStatus } from '../controllers/maintenance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getRequests);
router.post('/', authorize(['TENANT']), createRequest);
router.put('/:id/status', authorize(['ADMIN', 'LANDLORD', 'STAFF']), updateRequestStatus);

export default router;
