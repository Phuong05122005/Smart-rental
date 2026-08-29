import { Router } from 'express';
import { getTenants, getTenant, createTenant, updateTenant, deleteTenant } from '../controllers/tenant.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// App auth middleware
router.use(authenticate);

// CRUD routes for tenants (allow ADMIN, LANDLORD, STAFF)
router.get('/', getTenants);
router.get('/:id', getTenant);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']), createTenant);
router.put('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), updateTenant);
router.delete('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), deleteTenant);

export default router;
