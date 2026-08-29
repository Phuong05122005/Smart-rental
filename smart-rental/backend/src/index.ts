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

// Load environment variables
dotenv.config({ path: '../.env' });

import { initCronJobs } from './jobs/cron';

initCronJobs();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/tenants', tenantRoute);
app.use('/api/contracts', contractRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/reports', reportRoute);
app.use('/api/audit-logs', auditRoute);

// Start server
app.listen(port, () => {
  console.log(`[Server]: Backend is running at http://localhost:${port}`);
});
