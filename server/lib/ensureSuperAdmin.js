import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export const DEMO_USERS = [
  {
    name:        process.env.SEED_ADMIN_NAME        || 'Shivam Kumar Singh',
    employeeId:  (process.env.SEED_ADMIN_EMPLOYEE_ID || 'IAMMS-ADM-001').toUpperCase(),
    email:       (process.env.SEED_ADMIN_EMAIL        || 'shivamkumarsingh241@gmail.com').toLowerCase(),
    password:    process.env.SEED_ADMIN_PASSWORD     || 'shivam123',
    role:        'super_admin',
    designation: 'System Administrator',
    department:  'IT Department',
    plant:       'Head Office',
    area:        'Administration',
    phone:       '+91 98765 43210',
  },
  {
    name:        'Rahul Sharma',
    employeeId:  'IAMMS-MGR-001',
    email:       'rahul.manager@iamms.com',
    password:    'manager123',
    role:        'manager',
    designation: 'Plant Maintenance Manager',
    department:  'Smelter Plant',
    plant:       'Smelter Plant',
    area:        'Production Bay A',
    phone:       '+91 98765 43211',
  },
  {
    name:        'Aman Verma',
    employeeId:  'IAMMS-ENG-001',
    email:       'aman.engineer@iamms.com',
    password:    'engineer123',
    role:        'engineer',
    designation: 'Senior Mechanical Engineer',
    department:  'Rolling Mill',
    plant:       'Rolling Mill',
    area:        'Mill Floor',
    phone:       '+91 98765 43212',
  },
  {
    name:        'Rohan Singh',
    employeeId:  'IAMMS-EMP-001',
    email:       'rohan.employee@iamms.com',
    password:    'employee123',
    role:        'employee',
    designation: 'Plant Operator',
    department:  'Fabrication Plant',
    plant:       'Fabrication Plant',
    area:        'Assembly Line 1',
    phone:       '+91 98765 43213',
  },
];

export function getSuperAdminConfig() {
  return DEMO_USERS[0];
}

/**
 * Idempotent — ensures all 4 demo accounts exist in MongoDB Atlas with bcrypt passwords.
 * Updates password & status to approved if account exists.
 */
export async function ensureDemoUsers(options = {}) {
  const log = options.log ?? console.log;
  const results = [];

  for (const demoUser of DEMO_USERS) {
    let existing = await User.findOne({
      $or: [{ email: demoUser.email }, { employeeId: demoUser.employeeId }],
    });

    if (existing) {
      let dirty = false;
      if (existing.role !== demoUser.role) {
        existing.role = demoUser.role;
        dirty = true;
      }
      if (existing.status !== 'approved') {
        existing.status = 'approved';
        dirty = true;
      }
      if (!existing.isApproved) {
        existing.isApproved = true;
        dirty = true;
      }
      if (existing.isBlocked) {
        existing.isBlocked = false;
        dirty = true;
      }

      // Check if password matches demoUser.password
      const isPasswordValid = await bcrypt.compare(demoUser.password, existing.password);
      if (!isPasswordValid) {
        existing.password = await bcrypt.hash(demoUser.password, 12);
        dirty = true;
      }

      if (dirty) await existing.save();
      log(`[seed] Demo user ready: ${demoUser.name} (${demoUser.employeeId} / ${demoUser.email})`);
      results.push({ created: false, user: existing });
    } else {
      const hashedPassword = await bcrypt.hash(demoUser.password, 12);
      const user = await User.create({
        name:        demoUser.name,
        employeeId:  demoUser.employeeId,
        email:       demoUser.email,
        password:    hashedPassword,
        role:        demoUser.role,
        designation: demoUser.designation,
        department:  demoUser.department,
        plant:       demoUser.plant,
        area:        demoUser.area,
        phone:       demoUser.phone,
        status:      'approved',
        isApproved:  true,
        isBlocked:   false,
      });
      log(`[seed] ✓ Demo user created: ${demoUser.name} (${demoUser.employeeId} / ${demoUser.email})`);
      results.push({ created: true, user });
    }
  }

  return results;
}

export async function ensureSuperAdmin(options = {}) {
  const results = await ensureDemoUsers(options);
  return results[0];
}
