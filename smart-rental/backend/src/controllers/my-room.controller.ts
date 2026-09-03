import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMyRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'TENANT') {
      res.status(403).json({ message: 'Không có quyền truy cập' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { user_id: user.id },
      include: {
        contracts: {
          where: { status: 'ACTIVE' },
          include: { room: true },
          orderBy: { start_date: 'desc' },
          take: 1
        }
      }
    });

    if (!tenant) {
      res.status(404).json({ message: 'Không tìm thấy thông tin khách thuê' });
      return;
    }

    if (tenant.contracts.length === 0) {
      res.json({ message: 'Bạn chưa có hợp đồng thuê phòng nào' });
      return;
    }

    const contract = tenant.contracts[0];
    res.json({
      tenant: {
        full_name: tenant.full_name,
        phone: tenant.phone,
      },
      room: contract.room,
      contract: {
        start_date: contract.start_date,
        end_date: contract.end_date,
        rent_price: contract.rent_price,
        deposit: contract.deposit,
        status: contract.status,
      }
    });
  } catch (error) {
    console.error('[getMyRoom error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
