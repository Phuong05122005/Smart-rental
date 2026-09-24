import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getServices,
  createService,
  updateService,
  deleteService
} from '../controllers/service.controller';

const router = Router();

router.use(authenticate as any);

router.get('/', getServices as any);
router.post('/', authorize(['ADMIN', 'LANDLORD']) as any, createService as any);
router.put('/:id', authorize(['ADMIN', 'LANDLORD']) as any, updateService as any);
router.delete('/:id', authorize(['ADMIN', 'LANDLORD']) as any, deleteService as any);

export default router;
