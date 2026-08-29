import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTenants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { full_name: { contains: String(search), mode: 'insensitive' } },
        { identity_number: { contains: String(search) } },
        { phone: { contains: String(search) } }
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: whereClause,
        include: {
          contracts: {
            where: { status: 'ACTIVE' },
            include: { room: true },
            take: 1
          }
        },
        orderBy: { created_at: sort === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.tenant.count({ where: whereClause })
    ]);

    const formattedTenants = tenants.map((tenant: any) => ({
      ...tenant,
      current_room: tenant.contracts.length > 0 ? tenant.contracts[0].room.room_number : null,
      status: tenant.contracts.length > 0 ? 'RENTING' : 'INACTIVE'
    }));

    res.json({
      data: formattedTenants,
      meta: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[getTenants error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: {
        contracts: {
          include: { room: true }
        }
      }
    });
    if (!tenant) {
      res.status(404).json({ message: 'Không tìm thấy khách thuê' });
      return;
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, identity_number, phone, email } = req.body;

    if (!full_name || !identity_number || !phone) {
      res.status(400).json({ message: 'Họ tên, CCCD/Passport và SĐT là bắt buộc' });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' });
      return;
    }

    const tenant = await prisma.tenant.create({
      data: {
        full_name,
        identity_number,
        phone,
        email: email || null
      }
    });
    res.status(201).json({ message: 'Thêm khách thuê thành công', data: tenant });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'CCCD/Passport đã tồn tại' });
      return;
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, identity_number, phone, email } = req.body;

    if (!full_name || !identity_number || !phone) {
      res.status(400).json({ message: 'Họ tên, CCCD/Passport và SĐT là bắt buộc' });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: 'Email không hợp lệ' });
      return;
    }

    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        full_name,
        identity_number,
        phone,
        email: email || null
      }
    });
    res.json({ message: 'Cập nhật khách thuê thành công', data: tenant });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'CCCD/Passport đã tồn tại' });
      return;
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    // Check for active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        tenant_id: id,
        status: 'ACTIVE'
      }
    });

    if (activeContracts > 0) {
      res.status(400).json({ message: 'Không thể xóa khách thuê đang có hợp đồng ACTIVE' });
      return;
    }

    await prisma.tenant.delete({
      where: { id }
    });

    res.json({ message: 'Xóa khách thuê thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
