import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return;

    if (user.role === 'TENANT') {
      const tenant = await prisma.tenant.findUnique({ where: { user_id: user.id } });
      if (!tenant) {
        res.status(404).json({ message: 'Không tìm thấy thông tin khách thuê' });
        return;
      }
      const invoices = await prisma.invoice.findMany({
        where: { contract: { tenant_id: tenant.id } },
        include: { contract: { include: { room: true } } },
        orderBy: { issue_date: 'desc' }
      });
      res.json(invoices);
    } else {
      const { status } = req.query;
      const where: any = {};
      if (status) where.status = status;
      
      const invoices = await prisma.invoice.findMany({
        where,
        include: { contract: { include: { room: true, tenant: true } } },
        orderBy: { issue_date: 'desc' }
      });
      res.json(invoices);
    }
  } catch (error) {
    console.error('[getInvoices]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contract_id, title, amount, due_date, description } = req.body;
    const invoice = await prisma.invoice.create({
      data: { contract_id, title, amount, due_date: new Date(due_date), description },
      include: {
        contract: {
          include: { tenant: true }
        }
      }
    });

    // Notify the tenant
    if (invoice.contract?.tenant?.user_id) {
      await prisma.notification.create({
        data: {
          user_id: invoice.contract.tenant.user_id,
          title: 'Hóa đơn mới',
          content: `Bạn có một hóa đơn mới: ${title} (${Number(amount).toLocaleString('vi-VN')} đ). Hạn chót: ${new Date(due_date).toLocaleDateString('vi-VN')}`,
          type: 'INVOICE'
        }
      });
    }

    res.json({ message: 'Tạo hóa đơn thành công', data: invoice });
  } catch (error) {
    console.error('[createInvoice]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: {
        contract: {
          include: { tenant: true }
        }
      }
    });

    // Notify the tenant if paid
    if (status === 'PAID' && invoice.contract?.tenant?.user_id) {
      await prisma.notification.create({
        data: {
          user_id: invoice.contract.tenant.user_id,
          title: 'Thanh toán thành công',
          content: `Hóa đơn "${invoice.title}" của bạn đã được xác nhận thanh toán.`,
          type: 'INVOICE'
        }
      });
    }

    res.json({ message: 'Cập nhật trạng thái thành công', data: invoice });
  } catch (error) {
    console.error('[updateInvoiceStatus]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
