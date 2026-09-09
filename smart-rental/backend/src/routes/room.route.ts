import { Router } from 'express';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom, requestRent } from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']), createRoom);
router.put('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), updateRoom);
router.delete('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), deleteRoom);

// Route for tenants to request renting a room
router.post('/:id/rent-request', authorize(['TENANT']), requestRent);

export default router;
