import cron from 'node-cron';
import prisma from '../utils/prisma';

// Chạy vào 00:00 mỗi ngày: '0 0 * * *'
// Để test, có thể dùng: '* * * * *' (mỗi phút)
export const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running contract expiration check...');
    try {
      const now = new Date();
      const next30Days = new Date();
      next30Days.setDate(next30Days.getDate() + 30);

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

      // Fetch admin/landlords to notify
      const managers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'LANDLORD'] } }
      });

      for (const contract of expiringContracts) {
        const type = `EXPIRING_${contract.id}`;
        
        for (const manager of managers) {
          // Check duplicate
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
      console.log(`[Cron] Processed ${expiringContracts.length} expiring contracts.`);
    } catch (error) {
      console.error('[Cron] Error checking expiring contracts:', error);
    }
  });
};
