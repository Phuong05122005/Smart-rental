import { Router } from 'express';
import { getInvoices, createInvoice, updateInvoiceStatus } from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getInvoices);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']), createInvoice);
router.put('/:id/status', authorize(['ADMIN', 'LANDLORD', 'STAFF']), updateInvoiceStatus);

export default router;
