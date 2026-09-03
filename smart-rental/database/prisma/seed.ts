import { PrismaClient } from '@prisma/client';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

const parseCSV = (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

async function main() {
  console.log('Bắt đầu đọc dữ liệu từ Dataset...');
  const datasetPath = path.join(__dirname, '../../dataset');

  const users = await parseCSV(path.join(datasetPath, 'users.csv'));
  const rooms = await parseCSV(path.join(datasetPath, 'rooms.csv'));
  const tenants = await parseCSV(path.join(datasetPath, 'tenants.csv'));
  const contracts = await parseCSV(path.join(datasetPath, 'contracts.csv'));
  const notifications = await parseCSV(path.join(datasetPath, 'notifications.csv'));
  const auditLogs = await parseCSV(path.join(datasetPath, 'audit_logs.csv'));

  console.log('Xóa dữ liệu cũ (Reset)...');
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');
  for (const u of users) {
    // Basic hash for '123456' generated from bcryptjs
    const password_hash = '$2b$10$4WaF9UOyo.3PAHvkfpF/OuCpBHYz.zWPc2VYU6Tg6128Vw8o.WTPu';
    await prisma.user.create({
      data: {
        id: u.id,
        username: u.username,
        full_name: u.full_name,
        password_hash,
        role: u.role as any,
        status: u.status as any,
      }
    });
  }

  console.log('Seeding Rooms...');
  for (const r of rooms) {
    await prisma.room.create({
      data: {
        id: r.id,
        room_number: r.room_number,
        room_type: r.room_type,
        price: Number(r.price),
        area: Number(r.area),
        status: r.status as any,
        description: r.description
      }
    });
  }

  console.log('Seeding Tenants...');
  for (const t of tenants) {
    await prisma.tenant.create({
      data: {
        id: t.id,
        full_name: t.full_name,
        identity_number: t.identity_number,
        phone: t.phone,
        email: t.email
      }
    });
  }

  console.log('Seeding Contracts...');
  for (const c of contracts) {
    await prisma.contract.create({
      data: {
        id: c.id,
        tenant_id: c.tenant_id,
        room_id: c.room_id,
        start_date: new Date(c.start_date),
        end_date: new Date(c.end_date),
        rent_price: Number(c.rent_price),
        deposit: Number(c.deposit),
        status: c.status as any,
      }
    });
  }

  console.log('Seeding Notifications...');
  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        content: n.content,
        type: n.type,
        is_read: n.is_read === 'true',
        created_at: new Date(n.created_at)
      }
    });
  }

  console.log('Seeding Audit Logs...');
  for (const a of auditLogs) {
    await prisma.auditLog.create({
      data: {
        id: a.id,
        actor_id: a.actor_id,
        action: a.action,
        target_type: a.target_type,
        target_id: a.target_id,
        old_value: a.old_value,
        new_value: a.new_value,
        created_at: new Date(a.created_at)
      }
    });
  }

  console.log('✅ Đã Seed toàn bộ 50 Rooms, 30 Tenants, 30 Contracts, 5 Users, Notifications, Audit Logs thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
