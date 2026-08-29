import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middlewares/auth.middleware';

// Helper to auto-expire contracts
const checkAndExpireContracts = async () => {
  const now = new Date();
  
  const expiredContracts = await prisma.contract.findMany({
    where: {
      status: 'ACTIVE',
      end_date: {
        lt: now
      }
    }
  });

  if (expiredContracts.length === 0) return;

  for (const contract of expiredContracts) {
    await prisma.$transaction(async (tx: any) => {
      await tx.contract.update({
        where: { id: contract.id },
        data: { status: 'EXPIRED' }
      });

      const activeContractsForRoom = await tx.contract.count({
        where: {
          room_id: contract.room_id,
          status: 'ACTIVE'
        }
      });

      if (activeContractsForRoom === 0) {
        await tx.room.update({
          where: { id: contract.room_id },
          data: { status: 'AVAILABLE' }
        });
      }
    });
  }
};

export const getContracts = async (req: Request, res: Response): Promise<void> => {
  try {
    await checkAndExpireContracts();

    const { page = 1, limit = 10, search = '', status, sort = 'desc' } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { tenant: { full_name: { contains: String(search), mode: 'insensitive' } } },
        { room: { room_number: { contains: String(search) } } }
      ];
    }

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where: whereClause,
        include: {
          tenant: true,
          room: true
        },
        orderBy: { created_at: sort === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.contract.count({ where: whereClause })
    ]);

    const formattedContracts = contracts.map((c: any) => ({
      ...c,
      tenant_name: c.tenant.full_name,
      room_number: c.room.room_number
    }));

    res.json({
      data: formattedContracts,
      meta: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[getContracts error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: req.params.id },
      include: {
        tenant: true,
        room: true
      }
    });
    if (!contract) {
      res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
      return;
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenant_id, room_id, start_date, end_date, rent_price, deposit } = req.body;

    if (!tenant_id || !room_id || !start_date || !end_date || !rent_price) {
      res.status(400).json({ message: 'Vui lòng nhập đủ thông tin bắt buộc' });
      return;
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (end <= start) {
      res.status(400).json({ message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu' });
      return;
    }

    if (Number(rent_price) <= 0) {
      res.status(400).json({ message: 'Giá thuê phải lớn hơn 0' });
      return;
    }

    if (Number(deposit) < 0) {
      res.status(400).json({ message: 'Tiền cọc không được âm' });
      return;
    }

    await prisma.$transaction(async (tx: any) => {
      const room = await tx.room.findUnique({ where: { id: room_id } });
      if (!room) throw new Error('Phòng không tồn tại');
      if (room.status !== 'AVAILABLE') throw new Error(`Phòng ${room.room_number} không ở trạng thái trống`);

      const tenant = await tx.tenant.findUnique({ where: { id: tenant_id } });
      if (!tenant) throw new Error('Khách thuê không tồn tại');

      const overlapping = await tx.contract.findFirst({
        where: {
          room_id,
          status: 'ACTIVE',
          start_date: { lt: end },
          end_date: { gt: start }
        }
      });

      if (overlapping) throw new Error('Phòng đã có hợp đồng khác trong khoảng thời gian này');

      const contract = await tx.contract.create({
        data: {
          tenant_id,
          room_id,
          start_date: start,
          end_date: end,
          rent_price: Number(rent_price),
          deposit: Number(deposit),
          status: 'ACTIVE'
        }
      });

      await tx.room.update({
        where: { id: room_id },
        data: { status: 'RENTED' }
      });

      return contract;
    });

    res.status(201).json({ message: 'Tạo hợp đồng thành công' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi server' });
  }
};

export const updateContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const contractId = req.params.id;
    
    await prisma.$transaction(async (tx: any) => {
      const contract = await tx.contract.findUnique({ where: { id: contractId } });
      if (!contract) throw new Error('Không tìm thấy hợp đồng');

      const updatedContract = await tx.contract.update({
        where: { id: contractId },
        data: { status }
      });

      if (status !== 'ACTIVE' && contract.status === 'ACTIVE') {
        const activeContractsForRoom = await tx.contract.count({
          where: {
            room_id: contract.room_id,
            status: 'ACTIVE',
            id: { not: contractId }
          }
        });

        if (activeContractsForRoom === 0) {
          await tx.room.update({
            where: { id: contract.room_id },
            data: { status: 'AVAILABLE' }
          });
        }
      }

      return updatedContract;
    });

    res.json({ message: 'Cập nhật hợp đồng thành công' });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Lỗi server' });
  }
};
