import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const hashedPassword = await bcrypt.hash('123456', 10);
  
  // Tạo hoặc cập nhật tài khoản Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartrental.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@smartrental.com',
      password_hash: hashedPassword,
      full_name: 'System Admin',
      phone: '0901234567',
      role: 'ADMIN',
    } as any,
  });

  console.log('Created Admin:', admin.email);

  // Tạo phòng mẫu
  const room1 = await prisma.room.upsert({
    where: { room_number: '101' },
    update: {},
    create: {
      room_number: '101',
      price: 2500000,
      area: 25,
      status: 'AVAILABLE',
      description: 'Phòng đơn full nội thất có ban công',
    } as any,
  });

  const room2 = await prisma.room.upsert({
    where: { room_number: '102' },
    update: {},
    create: {
      room_number: '102',
      price: 3200000,
      area: 35,
      status: 'AVAILABLE',
      description: 'Phòng đôi có gác lửng',
    } as any,
  });

  console.log('Created sample rooms:', (room1 as any).room_number, (room2 as any).room_number);
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });