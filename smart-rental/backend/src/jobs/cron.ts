import cron from 'node-cron';
import prisma from '../utils/prisma';

export const initCronJobs = () => {
  // Chạy mỗi phút (* * * * *) để tiện demo báo cáo
  cron.schedule('* * * * *', async () => {
    console.log('[Cron] Running scheduled checks (Contracts & Invoices)...');
    try {
      const now = new Date();
      const next30Days = new Date();
      next30Days.setDate(next30Days.getDate() + 30);

      // 1. Check expiring contracts
      const expiringContracts = await prisma.contract.findMany({
        where: {
          status: 'ACTIVE',
          end_date: {
            lte: next30Days,
            gt: now
          }
        },
        include: { room: true }
      });

      const managers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'LANDLORD'] } }
      });

      for (const contract of expiringContracts) {
        const type = `EXPIRING_${contract.id}`;
        for (const manager of managers) {
          const exists = await prisma.notification.findFirst({
            where: { user_id: manager.id, type }
          });
          if (!exists) {
            await prisma.notification.create({
              data: {
                user_id: manager.id,
                title: 'Hợp đồng sắp hết hạn',
                content: `Hợp đồng phòng ${contract.room.room_number} sẽ hết hạn vào ngày ${contract.end_date.toLocaleDateString('vi-VN')}.`,
                type,
                is_read: false
              }
            });
          }
        }
      }

      // 2. Check overdue invoices
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'UNPAID',
          due_date: {
            lt: now // Đã quá hạn
          }
        },
        include: {
          contract: {
            include: { tenant: true }
          }
        }
      });

      // Để không gửi thông báo liên tục mỗi phút, ta gắn kèm ngày hôm nay vào type
      const todayStr = now.toISOString().split('T')[0];

      for (const invoice of overdueInvoices) {
        const tenantUserId = invoice.contract?.tenant?.user_id;
        if (tenantUserId) {
          const type = `OVERDUE_${invoice.id}_${todayStr}`; // Mỗi ngày nhắc 1 lần
          const exists = await prisma.notification.findFirst({
            where: { user_id: tenantUserId, type }
          });

          if (!exists) {
            await prisma.notification.create({
              data: {
                user_id: tenantUserId,
                title: 'Nhắc nhở thanh toán hóa đơn',
                content: `Hóa đơn "${invoice.title}" (Số tiền: ${Number(invoice.amount).toLocaleString('vi-VN')} đ) đã quá hạn thanh toán. Vui lòng thanh toán sớm nhất có thể.`,
                type,
                is_read: false
              }
            });
          }
        }
      }

      console.log(`[Cron] Processed ${expiringContracts.length} expiring contracts, ${overdueInvoices.length} overdue invoices.`);
    } catch (error) {
      console.error('[Cron] Error running checks:', error);
    }
  });
};
