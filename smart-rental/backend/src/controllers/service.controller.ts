import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';

export const getServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, unit, price, description, house_id } = req.body;
    
    if (!name || !unit || price === undefined) {
      res.status(400).json({ error: 'Tên, đơn vị tính và đơn giá là bắt buộc' });
      return;
    }

    if (Number(price) < 0) {
      res.status(400).json({ error: 'Đơn giá không hợp lệ' });
      return;
    }

    const service = await prisma.service.create({
      data: {
        name,
        unit,
        price: Number(price),
        description,
        house_id
      }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, unit, price, description } = req.body;

    if (Number(price) < 0) {
      res.status(400).json({ error: 'Đơn giá không hợp lệ' });
      return;
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        unit,
        price: Number(price),
        description
      }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const count = await prisma.roomService.count({ where: { service_id: id } });
    if (count > 0) {
      res.status(400).json({ error: 'Không thể xóa dịch vụ đang được gán cho phòng' });
      return;
    }

    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
