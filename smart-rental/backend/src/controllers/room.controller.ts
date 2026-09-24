import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const status = req.query.status as string;

    const skip = (page - 1) * limit;

    const where: any = {
      room_number: { contains: search, mode: 'insensitive' }
    };
    
    if (status) {
      where.status = status;
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          house: { select: { name: true } },
          contracts: {
            where: { status: 'ACTIVE' },
            include: { tenant: { select: { full_name: true, phone: true } } }
          }
        }
      }),
      prisma.room.count({ where })
    ]);

    res.json({
      data: rooms,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id as string },
      include: {
        house: true,
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
    const { room_number, house_id, capacity, room_type, price, area, description, status } = req.body;

    if (!house_id) { res.status(400).json({ message: 'Vui lòng chọn nhà trọ' }); return; }
    if (!room_number) { res.status(400).json({ message: 'Số phòng là bắt buộc' }); return; }

    const room = await prisma.room.create({
      data: {
        room_number,
        house_id,
        capacity: capacity ? Number(capacity) : 1,
        room_type,
        price: Number(price),
        area: Number(area),
        description,
        status: status || 'AVAILABLE'
      }
    });
    res.status(201).json({ message: 'Thêm phòng thành công', data: room });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(400).json({ message: 'Số phòng đã tồn tại' }); return; }
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { room_number, house_id, capacity, room_type, price, area, description, status } = req.body;

    const room = await prisma.room.update({
      where: { id: req.params.id as string },
      data: {
        room_number,
        house_id,
        capacity: capacity ? Number(capacity) : undefined,
        room_type,
        price: Number(price),
        area: Number(area),
        description,
        status
      }
    });
    res.json({ message: 'Cập nhật phòng thành công', data: room });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.room.delete({
      where: { id: req.params.id as string }
    });
    res.json({ message: 'Xóa phòng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server hoặc phòng đang có hợp đồng' });
  }
};
