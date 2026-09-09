import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
      return;
    }

    if (user.status === 'LOCKED') {
      res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      res.status(401).json({ message: 'Tài khoản hoặc mật khẩu không đúng.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    await prisma.auditLog.create({
      data: {
        actor_id: user.id,
        action: 'LOGIN',
        target_type: 'USER',
        target_id: user.id,
      }
    });

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        bank_name: (user as any).bank_name || null,
        bank_account: (user as any).bank_account || null,
        bank_owner: (user as any).bank_owner || null
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Đăng xuất thành công' });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
        phone: true,
        bank_name: true,
        bank_account: true,
        bank_owner: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server nội bộ.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      res.status(401).json({ message: 'Chưa đăng nhập' });
      return;
    }
    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Vui lòng nhập đủ thông tin.' });
      return;
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, dbUser.password_hash);
    if (!isMatch) {
      res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword }
    });

    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    console.error('[changePassword]', error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { full_name, bank_name, bank_account, bank_owner } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        full_name,
        bank_name: bank_name || null,
        bank_account: bank_account || null,
        bank_owner: bank_owner || null
      },
      select: {
        id: true,
        username: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
        phone: true,
        bank_name: true,
        bank_account: true,
        bank_owner: true
      }
    });

    if (user.role === 'TENANT') {
      await prisma.tenant.updateMany({
        where: { user_id: user.id },
        data: { full_name }
      });
    }

    res.json({ message: 'Cập nhật thông tin thành công!', data: updatedUser });
  } catch (error) {
    console.error('[updateProfile]', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};
