import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';

export const getMeterReadings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, house_id } = req.query;
    
    let where: any = {};
    if (month) where.month = Number(month);
    if (year) where.year = Number(year);
    if (house_id) {
      where.room = { house_id: String(house_id) };
    }

    const readings = await prisma.meterReading.findMany({
      where,
      include: {
        room: {
          select: { room_number: true, house: { select: { name: true } } }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { room: { room_number: 'asc' } }
      ]
    });
    res.json(readings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch meter readings' });
  }
};

export const saveMeterReading = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { room_id, type, month, year, old_index, new_index } = req.body;

    if (!room_id || !type || !month || !year || old_index === undefined || new_index === undefined) {
      res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      return;
    }

    const oldVal = Number(old_index);
    const newVal = Number(new_index);

    if (newVal < oldVal) {
      res.status(400).json({ error: 'Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ' });
      return;
    }
    
    if (oldVal < 0 || newVal < 0) {
      res.status(400).json({ error: 'Chỉ số không được âm' });
      return;
    }

    const consumption = newVal - oldVal;

    const existing = await prisma.meterReading.findUnique({
      where: {
        room_id_type_month_year: {
          room_id,
          type,
          month: Number(month),
          year: Number(year)
        }
      }
    });

    if (existing) {
      // Update
      const updated = await prisma.meterReading.update({
        where: { id: existing.id },
        data: { old_index: oldVal, new_index: newVal, consumption }
      });
      res.json(updated);
    } else {
      // Create
      const created = await prisma.meterReading.create({
        data: {
          room_id,
          type,
          month: Number(month),
          year: Number(year),
          old_index: oldVal,
          new_index: newVal,
          consumption
        }
      });
      res.status(201).json(created);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save meter reading' });
  }
};
