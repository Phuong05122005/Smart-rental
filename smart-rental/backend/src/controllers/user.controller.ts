import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
        status: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('[Get Users Error]:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password, full_name, role } = req.body;
    
    if (!username || !password || !full_name) {
      res.status(400).json({ message: 'Vui lòng nhập đủ thông tin.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username,
        password_hash,
        full_name,
        role: role || 'STAFF'
      },
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true
      }
    });

    res.json({ message: 'Tạo tài khoản thành công', data: user });
  } catch (error) {
    console.error('[Create User Error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = (req.params.id as string) as string;
    
    if (id === req.user?.id) {
      res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
      return;
    }

    const newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    
    await prisma.user.update({
      where: { id: id as string },
      data: { status: newStatus }
    });

    res.json({ message: `Đã ${newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} tài khoản thành công.` });
  } catch (error) {
    console.error('[Toggle Status Error]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = (req.params.id as string) as string;

    if (id === req.user?.id) {
      res.status(400).json({ message: 'Không thể tự xóa tài khoản của chính mình.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
      return;
    }

    // Delete user
    await prisma.user.delete({ where: { id: id as string } });

    res.json({ message: 'Đã xóa tài khoản thành công.' });
  } catch (error) {
    console.error('[Delete User Error]', error);
    res.status(500).json({ message: 'Lỗi server. Tài khoản này có thể đang ràng buộc dữ liệu khác.' });
  }
};
