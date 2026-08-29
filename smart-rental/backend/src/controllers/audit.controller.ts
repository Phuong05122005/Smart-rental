import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search = '', action, target_type, startDate, endDate } = req.query;
    
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { actor: { full_name: { contains: String(search), mode: 'insensitive' } } },
        { target_id: { contains: String(search) } }
      ];
    }
    if (action) {
      whereClause.action = action;
    }
    if (target_type) {
      whereClause.target_type = target_type;
    }
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at.gte = new Date(String(startDate));
      if (endDate) whereClause.created_at.lte = new Date(String(endDate));
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          actor: { select: { full_name: true, username: true } }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNumber
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    res.json({
      data: logs.map((l: any) => ({
        ...l,
        actor_name: l.actor ? l.actor.full_name : 'Hệ thống'
      })),
      meta: {
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('[getAuditLogs error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
