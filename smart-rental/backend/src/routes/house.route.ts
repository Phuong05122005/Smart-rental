import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse
} from '../controllers/house.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate as any);

// Routes for ADMIN, LANDLORD, and STAFF
router.get('/', getHouses as any);
router.get('/:id', getHouseById as any);

// Routes restricted to LANDLORD and ADMIN
router.post('/', authorize(['ADMIN', 'LANDLORD']) as any, createHouse as any);
router.put('/:id', authorize(['ADMIN', 'LANDLORD']) as any, updateHouse as any);
router.delete('/:id', authorize(['ADMIN', 'LANDLORD']) as any, deleteHouse as any);

export default router;
