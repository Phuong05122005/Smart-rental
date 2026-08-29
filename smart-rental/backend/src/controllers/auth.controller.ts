import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

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

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    // Audit Log
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
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ.' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  // In stateless JWT, logout is usually handled client-side by deleting the token.
  // We can just return success here, and optionally log the audit event if req.user exists.
  res.json({ message: 'Đăng xuất thành công' });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        full_name: true,
        role: true,
        status: true,
        created_at: true
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
