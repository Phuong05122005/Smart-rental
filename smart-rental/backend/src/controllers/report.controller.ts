import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getRevenueReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const contracts = await prisma.contract.findMany({
      where: { status: 'ACTIVE' },
      select: { rent_price: true, start_date: true, end_date: true }
    });

    const totalRevenue = contracts.reduce((sum: number, c: any) => sum + Number(c.rent_price), 0);
    const totalContracts = contracts.length;

    // Mock timeline for past 6 months based on active contracts
    // Real implementation would look at transactions/invoices, but we approximate using contract prices per month
    const timeline = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = `T${d.getMonth() + 1}`;
      
      // Assume all active contracts contribute to revenue this month if they started before end of month
      timeline.push({
        name: monthLabel,
        revenue: totalRevenue // simplified for demo
      });
    }

    res.json({
      totalRevenue,
      totalContracts,
      timeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const getOccupancyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalRooms, availableRooms, rentedRooms, maintenanceRooms] = await Promise.all([
      prisma.room.count(),
      prisma.room.count({ where: { status: 'AVAILABLE' } }),
      prisma.room.count({ where: { status: 'RENTED' } }),
      prisma.room.count({ where: { status: 'MAINTENANCE' } })
    ]);

    const occupancyRate = totalRooms > 0 ? (rentedRooms / totalRooms) * 100 : 0;

    res.json({
      totalRooms,
      availableRooms,
      rentedRooms,
      maintenanceRooms,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      chartData: [
        { name: 'Đã thuê', value: rentedRooms },
        { name: 'Trống', value: availableRooms },
        { name: 'Bảo trì', value: maintenanceRooms }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
