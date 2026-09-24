import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import { logAudit } from '../utils/audit';

export const getHouses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let whereClause = {};
    if (role === 'LANDLORD') {
      whereClause = { landlord_id: userId };
    } else if (role === 'STAFF') {
      whereClause = { staffs: { some: { id: userId } } };
    }

    const houses = await prisma.house.findMany({
      where: whereClause,
      include: {
        landlord: {
          select: {
            id: true,
            full_name: true,
            username: true
          }
        },
        _count: {
          select: { rooms: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(houses);
  } catch (error) {
    console.error('Error fetching houses:', error);
    res.status(500).json({ error: 'Failed to fetch houses' });
  }
};

export const getHouseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    const role = req.user?.role;
    const userId = req.user?.id;

    let whereClause: any = { id };
    if (role === 'LANDLORD') {
      whereClause.landlord_id = userId;
    } else if (role === 'STAFF') {
      whereClause.staffs = { some: { id: userId } };
    }

    const house = await prisma.house.findFirst({
      where: whereClause,
      include: {
        rooms: true,
        staffs: {
          select: { id: true, full_name: true, username: true }
        },
        landlord: {
          select: { full_name: true, phone: true }
        }
      }
    });

    if (!house) {
      res.status(404).json({ error: 'House not found or access denied' });
      return;
    }

    res.json(house);
  } catch (error) {
    console.error('Error fetching house:', error);
    res.status(500).json({ error: 'Failed to fetch house' });
  }
};

export const createHouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, address, floors, description, image_url } = req.body;
    const landlord_id = req.user?.id;

    if (!name || !address || !landlord_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const house = await prisma.house.create({
      data: {
        name,
        address,
        floors: floors ? parseInt(floors) : null,
        description,
        image_url,
        landlord_id
      }
    });

    await logAudit(landlord_id, 'CREATE_HOUSE', 'House', house.id);

    res.status(201).json(house);
  } catch (error) {
    console.error('Error creating house:', error);
    res.status(500).json({ error: 'Failed to create house' });
  }
};

export const updateHouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, address, floors, description, image_url } = req.body;
    const userId = req.user?.id;

    const existingHouse = await prisma.house.findUnique({ where: { id } });
    if (!existingHouse) {
      res.status(404).json({ error: 'House not found' });
      return;
    }
    
    if (req.user?.role !== 'ADMIN' && existingHouse.landlord_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const house = await prisma.house.update({
      where: { id },
      data: {
        name,
        address,
        floors: floors ? parseInt(floors) : null,
        description,
        image_url
      }
    });

    if (userId) {
      await logAudit(userId, 'UPDATE_HOUSE', 'House', house.id, existingHouse, house);
    }

    res.json(house);
  } catch (error) {
    console.error('Error updating house:', error);
    res.status(500).json({ error: 'Failed to update house' });
  }
};

export const deleteHouse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    const existingHouse = await prisma.house.findUnique({ 
      where: { id },
      include: {
        _count: { select: { rooms: true } }
      }
    });
    
    if (!existingHouse) {
      res.status(404).json({ error: 'House not found' });
      return;
    }

    if (req.user?.role !== 'ADMIN' && existingHouse.landlord_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    if (existingHouse._count.rooms > 0) {
      res.status(400).json({ error: 'Cannot delete house with existing rooms. Delete rooms first.' });
      return;
    }

    await prisma.house.delete({ where: { id } });

    if (userId) {
      await logAudit(userId, 'DELETE_HOUSE', 'House', id, existingHouse);
    }

    res.json({ message: 'House deleted successfully' });
  } catch (error) {
    console.error('Error deleting house:', error);
    res.status(500).json({ error: 'Failed to delete house' });
  }
};
