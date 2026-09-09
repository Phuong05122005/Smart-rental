import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logAudit } from '../utils/audit';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', status, sort = 'desc' } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { room_number: { contains: String(search), mode: 'insensitive' } },
        { room_type: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where: whereClause,
        include: {
          contracts: {
            where: { status: 'ACTIVE' },
            include: { tenant: true },
            take: 1
          }
        },
        orderBy: { created_at: sort === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.room.count({ where: whereClause })
    ]);

    const formattedRooms = rooms.map((room: any) => ({
      ...room,
      current_tenant: room.contracts.length > 0 ? room.contracts[0].tenant.full_name : null
    }));

    res.json({
      data: formattedRooms,
      meta: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[getRooms error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: (req.params.id as string) },
      include: {
        contracts: {
          include: { tenant: true }
        }
      }
    });
    if (!room) {
      res.status(404).json({ message: 'Không tìm thấy phòng' });
      return;
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room_number, room_type, price, area, description, status } = req.body;

    if (!room_number) {
      res.status(400).json({ message: 'Số phòng là bắt buộc' });
      return;
    }
    if (Number(price) <= 0) {
      res.status(400).json({ message: 'Giá phòng phải lớn hơn 0' });
      return;
    }
    if (Number(area) <= 0) {
      res.status(400).json({ message: 'Diện tích phải lớn hơn 0' });
      return;
    }

    const room = await prisma.room.create({
      data: {
        room_number,
        room_type,
        price: Number(price),
        area: Number(area),
        description,
        status: status || 'AVAILABLE'
      }
    });
    res.status(201).json({ message: 'Thêm phòng thành công', data: room });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Số phòng đã tồn tại' });
      return;
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room_number, room_type, price, area, description, status } = req.body;
    
    if (Number(price) <= 0) {
      res.status(400).json({ message: 'Giá phòng phải lớn hơn 0' });
      return;
    }
    if (Number(area) <= 0) {
      res.status(400).json({ message: 'Diện tích phải lớn hơn 0' });
      return;
    }

    const room = await prisma.room.update({
      where: { id: (req.params.id as string) },
      data: {
        room_number,
        room_type,
        price: Number(price),
        area: Number(area),
        description,
        status
      }
    });
    res.json({ message: 'Cập nhật phòng thành công', data: room });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Số phòng đã tồn tại' });
      return;
    }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req.params.id as string);

    // Check for active contracts
    const activeContracts = await prisma.contract.count({
      where: {
        room_id: id,
        status: 'ACTIVE'
      }
    });

    if (activeContracts > 0) {
      res.status(400).json({ message: 'Không thể xóa phòng đang có khách thuê (Hợp đồng ACTIVE)' });
      return;
    }

    await prisma.room.delete({
      where: { id: id as string }
    });

    res.json({ message: 'Xóa phòng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
