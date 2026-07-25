/**
 * IAMMS Demo Users & Data Seed Script
 *
 * Usage:
 *   cd server
 *   npm run seed
 *   — or —
 *   node seed.js
 *
 * Idempotent — running multiple times will not create duplicate MongoDB users.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ensureDemoUsers, DEMO_USERS } from './lib/ensureSuperAdmin.js';
import { seedData } from './seedData.js';

dotenv.config();

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error('[seed] MONGODB_URI is not set in server/.env');
    process.exit(1);
  }

  console.log('[seed] Connecting to MongoDB Atlas…');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[seed] Connected.');

  await ensureDemoUsers();
  await seedData();

  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                         IAMMS DEMO ACCOUNTS SEEDED                             ║');
  console.log('╠════════════════════════════════════════════════════════════════════════════════╣');
  for (const u of DEMO_USERS) {
    console.log(`║ ${u.role.toUpperCase().padEnd(12)} | Emp ID: ${u.employeeId.padEnd(14)} | Email: ${u.email.padEnd(28)} | Pass: ${u.password.padEnd(12)} ║`);
  }
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Fatal error:', err);
  mongoose.disconnect();
  process.exit(1);
});
