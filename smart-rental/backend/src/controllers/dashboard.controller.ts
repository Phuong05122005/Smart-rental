import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalRooms, availableRooms, rentedRooms, maintenanceRooms, activeContracts] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.room.count({ where: { status: 'RENTED' } }),
      prisma.room.count({ where: { status: 'MAINTENANCE' } }),
      prisma.contract.count({ where: { status: 'ACTIVE' } })
    ]);

    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const expiringContracts = await prisma.contract.count({
      where: {
        status: 'ACTIVE',
        end_date: { lte: next30Days, gt: new Date() }
      }
    });

    const activeContractsData = await prisma.contract.findMany({
      where: { status: 'ACTIVE' },
      select: { rent_price: true }
    });

    const revenue = activeContractsData.reduce((sum: number, c: any) => sum + Number(c.rent_price), 0);
    const occupancyRate = totalRooms > 0 ? (rentedRooms / totalRooms) * 100 : 0;

    res.json({
      totalRooms,
      availableRooms,
      rentedRooms,
      maintenanceRooms,
      activeContracts,
      expiringContracts,
      revenue,
      occupancyRate: Math.round(occupancyRate * 10) / 10
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
