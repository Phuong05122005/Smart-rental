import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoute from './routes/health.route';
import authRoute from './routes/auth.route';
import roomRoute from './routes/room.route';
import tenantRoute from './routes/tenant.route';
import contractRoute from './routes/contract.route';
import dashboardRoute from './routes/dashboard.route';
import notificationRoute from './routes/notification.route';
import reportRoute from './routes/report.route';
import auditRoute from './routes/audit.route';
import userRoute from './routes/user.route';
import myRoomRoute from './routes/my-room.route';
import invoiceRoute from './routes/invoice.route';
import maintenanceRoute from './routes/maintenance.route';
import houseRoute from './routes/house.route';
import serviceRoute from './routes/service.route';
import meterReadingRoute from './routes/meter-reading.route';
import aiRoute from './routes/ai.route';

dotenv.config({ path: '../.env' });

import { initCronJobs } from './jobs/cron';
initCronJobs();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/tenants', tenantRoute);
app.use('/api/contracts', contractRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/reports', reportRoute);
app.use('/api/audit-logs', auditRoute);
app.use('/api/users', userRoute);
app.use('/api/my-room', myRoomRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/maintenance', maintenanceRoute);
app.use('/api/houses', houseRoute);
app.use('/api/services', serviceRoute);
app.use('/api/meter-readings', meterReadingRoute);
app.use('/api/ai', aiRoute);
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Smart Rental API is running',
    healthCheck: '/api/health'
  });
});
app.listen(port, () => {
  console.log(`[Server]: Backend is running at http://localhost:${port}`);
});
