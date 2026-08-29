import { Router } from 'express';
import { getRooms, getRoom, createRoom, updateRoom, deleteRoom } from '../controllers/room.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);
// Restrict modifications to ADMIN and LANDLORD only, STAFF can view
// but let's say LANDLORD/ADMIN can create/update/delete. STAFF might only be able to view?
// Actually, prompt says STAFF: Rooms, Tenants, Contracts, Notifications. 
// It doesn't strictly say STAFF can't edit rooms, but usually they shouldn't. I'll let everyone with access to the route do CRUD for now, or just restrict DELETE to ADMIN/LANDLORD.
// For now, allow all roles that have access to the route to use it as requested in previous step (Rooms -> ADMIN, LANDLORD, STAFF).

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']), createRoom);
router.put('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), updateRoom);
router.delete('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), deleteRoom);

export default router;
