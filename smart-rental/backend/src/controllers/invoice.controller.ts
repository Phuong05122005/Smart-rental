import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return;

    const includeCreator = {
      select: { id: true, full_name: true, bank_name: true, bank_account: true, bank_owner: true }
    };

    if (user.role === 'TENANT') {
      const tenant = await prisma.tenant.findUnique({ where: { user_id: user.id } });
      if (!tenant) {
        res.status(404).json({ message: 'Không tìm thấy thông tin khách thuê' });
        return;
      }
      const invoices = await prisma.invoice.findMany({
        where: { contract: { tenant_id: tenant.id } },
        include: { contract: { include: { room: true, tenant: true } }, creator: includeCreator, items: true, receipts: true },
        orderBy: { issue_date: 'desc' }
      });
      res.json(invoices);
    } else {
      const { status } = req.query;
      const where: any = {};
      if (status) where.status = status;
      
      const invoices = await prisma.invoice.findMany({
        where,
        include: { contract: { include: { room: true, tenant: true } }, creator: includeCreator, items: true, receipts: true },
        orderBy: { issue_date: 'desc' }
      });
      res.json(invoices);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { contract_id, title, amount, due_date, description, issue_date, status } = req.body;
    const invoice = await prisma.invoice.create({
      data: {
        contract_id,
        title,
        description: description || null,
        amount,
        issue_date: issue_date ? new Date(issue_date) : new Date(),
        due_date: new Date(due_date),
        status: status || 'UNPAID',
        creator_id: req.user?.id
      }
    });
    res.json({ message: 'Tạo hóa đơn thành công', data: invoice });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status }
    });
    res.json({ message: 'Cập nhật trạng thái thành công', data: invoice });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const payInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { amount, payment_method, reference_code, note } = req.body;
    const collector_id = req.user?.id;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ message: 'Số tiền thanh toán phải lớn hơn 0' });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { receipts: true, contract: { include: { tenant: true } } }
    });

    if (!invoice) {
      res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
      return;
    }

    const totalAmount = Number(invoice.amount);
    const paidAmount = invoice.receipts.reduce((sum, r) => sum + Number(r.amount), 0);
    const remaining = totalAmount - paidAmount;

    if (Number(amount) > remaining) {
      res.status(400).json({ message: `Số tiền thanh toán vượt quá số tiền còn nợ (${remaining})` });
      return;
    }

    await prisma.paymentReceipt.create({
      data: {
        invoice_id: id,
        collector_id,
        amount: Number(amount),
        payment_method: payment_method || 'CASH',
        reference_code,
        note
      }
    });

    const newPaidAmount = paidAmount + Number(amount);
    let newStatus = invoice.status;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: newStatus },
      include: { receipts: true }
    });

    res.json({ message: 'Ghi nhận thanh toán thành công', data: updatedInvoice });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi ghi nhận thanh toán' });
  }
};

export const generateInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { house_id, month, year } = req.body;
    if (!house_id || !month || !year) {
      res.status(400).json({ message: 'Thiếu thông tin nhà trọ, tháng hoặc năm' });
      return;
    }

    const title = `Hóa đơn Tháng ${month}/${year}`;

    const contracts = await prisma.contract.findMany({
      where: { status: 'ACTIVE', room: { house_id } },
      include: { room: true }
    });

    let generated = 0;

    for (const contract of contracts) {
      const existingInvoice = await prisma.invoice.findFirst({
        where: { contract_id: contract.id, title: title }
      });

      if (existingInvoice) continue;

      let items = [];
      let totalAmount = 0;

      const rentAmount = Number(contract.rent_price);
      items.push({
        type: 'RENT',
        description: 'Tiền phòng',
        quantity: 1,
        unit_price: rentAmount,
        amount: rentAmount
      });
      totalAmount += rentAmount;

      const meterReadings = await prisma.meterReading.findMany({
        where: { room_id: contract.room_id, month: Number(month), year: Number(year) }
      });

      const services = await prisma.service.findMany({
        where: { OR: [{ house_id }, { house_id: null }] }
      });
      const eleService = services.find(s => s.name.toLowerCase().includes('điện'));
      const watService = services.find(s => s.name.toLowerCase().includes('nước'));

      for (const reading of meterReadings) {
        if (reading.type === 'ELECTRICITY' && eleService) {
          const amount = reading.consumption * Number(eleService.price);
          items.push({
            type: 'ELECTRICITY',
            description: `Tiền điện (Chỉ số: ${reading.old_index} - ${reading.new_index})`,
            quantity: reading.consumption,
            unit_price: Number(eleService.price),
            amount
          });
          totalAmount += amount;
        }
        if (reading.type === 'WATER' && watService) {
          const amount = reading.consumption * Number(watService.price);
          items.push({
            type: 'WATER',
            description: `Tiền nước (Chỉ số: ${reading.old_index} - ${reading.new_index})`,
            quantity: reading.consumption,
            unit_price: Number(watService.price),
            amount
          });
          totalAmount += amount;
        }
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);

      await prisma.invoice.create({
        data: {
          contract_id: contract.id,
          title,
          description: `Hóa đơn tiền phòng và dịch vụ tháng ${month}/${year}`,
          amount: totalAmount,
          due_date: dueDate,
          creator_id: req.user?.id,
          items: { create: items }
        }
      });
      
      generated++;
    }

    res.json({ message: `Tạo thành công ${generated} hóa đơn.` });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo hóa đơn hàng loạt' });
  }
};
