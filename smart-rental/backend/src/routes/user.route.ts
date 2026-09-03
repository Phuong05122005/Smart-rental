import { Router } from 'express';
import { getUsers, createUser, toggleUserStatus, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only ADMIN can view and manage users
router.get('/', authenticate, authorize(['ADMIN']), getUsers);
router.post('/', authenticate, authorize(['ADMIN']), createUser);
router.patch('/:id/toggle-status', authenticate, authorize(['ADMIN']), toggleUserStatus);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteUser);

export default router;
