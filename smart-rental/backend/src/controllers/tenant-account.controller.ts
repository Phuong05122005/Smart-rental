import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

export const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = (req.params.id as string);
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ message: 'Không tìm thấy khách thuê' });
      return;
    }
    if (tenant.user_id) {
      res.status(400).json({ message: 'Khách thuê này đã có tài khoản' });
      return;
    }
    const username = tenant.phone;
    const password_hash = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        username,
        password_hash,
        full_name: tenant.full_name,
        role: 'TENANT',
        status: 'ACTIVE'
      }
    });
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { user_id: user.id }
    });
    res.json({ message: 'Tạo tài khoản thành công', data: { username, password: '123456' } });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'Tên đăng nhập (SĐT) đã tồn tại trong hệ thống' });
      return;
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
