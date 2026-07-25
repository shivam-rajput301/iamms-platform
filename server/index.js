import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes  from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import departmentRoutes from './routes/departments.js';
import profileRoutes from './routes/profiles.js';
import assetRoutes from './routes/assets.js';
import requestRoutes from './routes/requests.js';
import inventoryRoutes from './routes/inventory.js';
import notificationRoutes from './routes/notifications.js';
import configRoutes from './routes/config.js';
import { ensureSuperAdmin } from './lib/ensureSuperAdmin.js';
import { seedData } from './seedData.js';

dotenv.config();

/* ── Validate critical env vars ── */
const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required env var: ${key}`);
    process.exit(1);
  }
}

const app = express();

/* ── Middleware ── */
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

/* ── Routes ── */
app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/departments',   departmentRoutes);
app.use('/api/profiles',      profileRoutes);
app.use('/api/assets',        assetRoutes);
app.use('/api/requests',      requestRoutes);
app.use('/api/inventory',     inventoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/config',        configRoutes);

/* ── Health check ── */
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

/* ── 404 catch ── */
app.use((_, res) => res.status(404).json({ error: 'Not found.' }));

/* ── Global error handler ── */
app.use((err, req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'Internal server error.' });
});

/* ── Connect to MongoDB then start server ── */
const PORT = Number(process.env.PORT) || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('[db] MongoDB Atlas connected');
    try {
      await ensureSuperAdmin();
      await seedData();
    } catch (err) {
      console.warn('[seed] Seeding step completed with warning:', err?.message ?? err);
    }
    app.listen(PORT, () => {
      console.log(`[server] IAMMS backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  });
