import { Router } from 'express';
import { getContracts, getContract, createContract, updateContract } from '../controllers/contract.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getContracts);
router.get('/:id', getContract);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']), createContract);
router.put('/:id', authorize(['ADMIN', 'LANDLORD', 'STAFF']), updateContract);

export default router;
