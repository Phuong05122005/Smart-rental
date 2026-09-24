import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  generateInvoices,
  payInvoice
} from '../controllers/invoice.controller';

const router = Router();

router.use(authenticate as any);

router.get('/', getInvoices as any);
router.post('/', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, createInvoice as any);
router.post('/generate', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, generateInvoices as any);
router.put('/:id/status', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, updateInvoiceStatus as any);
router.post('/:id/pay', authorize(['ADMIN', 'LANDLORD', 'STAFF']) as any, payInvoice as any);

export default router;
