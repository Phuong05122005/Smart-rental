import { Router } from 'express';
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom, requestRentRoom } from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate as any);

router.get('/', getRooms as any);
router.get('/:id', getRoomById as any);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, createRoom as any);
router.put('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, updateRoom as any);
router.delete('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, deleteRoom as any);
router.post('/:id/rent-request', requestRentRoom as any);

export default router;
