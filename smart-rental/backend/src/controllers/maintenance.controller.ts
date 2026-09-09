import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) return;

    if (user.role === 'TENANT') {
      const tenant = await prisma.tenant.findUnique({ where: { user_id: user.id } });
      if (!tenant) {
        res.status(404).json({ message: 'Không tìm thấy thông tin khách thuê' });
        return;
      }
      const requests = await prisma.maintenanceRequest.findMany({
        where: { tenant_id: tenant.id },
        include: { room: true },
        orderBy: { created_at: 'desc' }
      });
      res.json(requests);
    } else {
      const requests = await prisma.maintenanceRequest.findMany({
        include: { room: true, tenant: true },
        orderBy: { created_at: 'desc' }
      });
      res.json(requests);
    }
  } catch (error) {
    console.error('[getRequests]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || user.role !== 'TENANT') {
      res.status(403).json({ message: 'Chỉ khách thuê mới được báo cáo sự cố' });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { user_id: user.id },
      include: {
        contracts: { where: { status: 'ACTIVE' }, take: 1, include: { room: true } }
      }
    });

    if (!tenant || tenant.contracts.length === 0) {
      res.status(400).json({ message: 'Bạn chưa có phòng để báo cáo sự cố' });
      return;
    }

    const room = tenant.contracts[0].room;
    const room_id = room.id;
    const { title, description } = req.body;

    const request: any = await prisma.maintenanceRequest.create({
      data: { tenant_id: tenant.id, room_id, title, description }
    });

    // Notify admins and landlords
    const staffAndAdmins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'LANDLORD', 'STAFF'] } }
    });

    for (const staff of staffAndAdmins) {
      await prisma.notification.create({
        data: {
          user_id: staff.id,
          title: 'Sự cố mới báo cáo',
          content: `Phòng ${room.room_number} vừa báo cáo sự cố: ${title}`,
          type: 'SYSTEM'
        }
      });
    }

    res.json({ message: 'Gửi báo cáo thành công', data: request });
  } catch (error) {
    console.error('[createRequest]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = (req.params.id as string) as string;
    const { status } = req.body;
    const request: any = await prisma.maintenanceRequest.update({
      where: { id: id as string },
      data: { status },
      include: { tenant: true }
    });

    // Notify the tenant
    let statusText = 'Đang xử lý';
    if (status === 'RESOLVED') statusText = 'Đã hoàn tất';
    if (status === 'REJECTED') statusText = 'Đã bị từ chối';

    if ((request as any).tenant?.user_id) {
      await prisma.notification.create({
        data: {
          user_id: request.tenant.user_id,
          title: 'Cập nhật sự cố',
          content: `Sự cố "${request.title}" của bạn đã được chuyển sang trạng thái: ${statusText}.`,
          type: 'SYSTEM'
        }
      });
    }

    res.json({ message: 'Cập nhật trạng thái thành công', data: request });
  } catch (error) {
    console.error('[updateRequestStatus]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
