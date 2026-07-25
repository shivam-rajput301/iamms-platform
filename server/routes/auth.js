import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/** Resolve login identifier to a MongoDB user (email or employee ID). */
function findUserByIdentifier(identifier) {
  const raw = String(identifier ?? '').trim();
  if (!raw) return null;
  if (raw.includes('@')) {
    return User.findOne({ email: raw.toLowerCase() });
  }
  return User.findOne({ employeeId: raw.toUpperCase() });
}

/* ══════════════════════════════════════════════════════════════
   GET /api/auth/me
   Private — returns authenticated MongoDB user details via JWT
══════════════════════════════════════════════════════════════ */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.isBlocked || user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked.' });
    }
    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Your account is awaiting administrator approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Your request has been rejected.' });
    }

    res.json({
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        employeeId:  user.employeeId,
        department:  user.department,
        designation: user.designation,
        plant:       user.plant,
        area:        user.area,
        status:      user.status,
        phone:       user.phone || null,
        isApproved:  user.isApproved,
        isBlocked:   user.isBlocked,
      },
    });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   POST /api/auth/request-access
   Public — creates a new pending registration
══════════════════════════════════════════════════════════════ */
router.post('/request-access', async (req, res) => {
  try {
    const { name, employeeId, email, phone, plant, area, department, designation, password } = req.body;

    // ── Validate required fields ──
    const missing = [];
    if (!name)        missing.push('name');
    if (!employeeId)  missing.push('employeeId');
    if (!email)       missing.push('email');
    if (!password)    missing.push('password');
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // ── Check for duplicates ──
    const byEmail = await User.findOne({ email: email.toLowerCase() });
    if (byEmail) {
      return res.status(409).json({ error: 'This email address is already registered.' });
    }
    const byEmpId = await User.findOne({ employeeId: employeeId.toUpperCase() });
    if (byEmpId) {
      return res.status(409).json({ error: 'This Employee ID is already registered.' });
    }

    // ── Hash password ──
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user ──
    const user = await User.create({
      name,
      employeeId: employeeId.toUpperCase(),
      email:      email.toLowerCase(),
      phone:      phone   || null,
      plant:      plant   || null,
      area:       area    || null,
      department: department || null,
      designation: designation || null,
      password:   hashedPassword,
      status:     'pending',
      role:       'employee',
      isApproved: false,
    });

    res.status(201).json({
      message: 'Your registration request has been submitted successfully. Please wait for administrator approval.',
      userId: user._id,
    });
  } catch (err) {
    console.error('[request-access]', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   POST /api/auth/check-status
   Public — checks registration status for Employee ID or email
   Returns status + rejectionReason without leaking credentials
══════════════════════════════════════════════════════════════ */
router.post('/check-status', async (req, res) => {
  try {
    const identifier = req.body.identifier ?? req.body.email;
    if (!identifier) {
      return res.status(400).json({ error: 'Employee ID or email is required.' });
    }

    const user = await findUserByIdentifier(identifier).select('status rejectionReason name role email');
    if (!user) {
      return res.json({ status: 'not_found' });
    }

    return res.json({
      status: user.status,
      rejectionReason: user.rejectionReason || null,
      name: user.name,
      role: user.role,
      email: user.email,
    });
  } catch (err) {
    console.error('[check-status]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   POST /api/auth/login
   Public — validates credentials and issues a backend JWT.
   Also used by super_admin to get an admin JWT for API calls.
══════════════════════════════════════════════════════════════ */
router.post('/login', async (req, res) => {
  try {
    const identifier = req.body.identifier ?? req.body.email;
    const { password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Employee ID or email and password are required.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // ── Status gate ──
    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Your account is awaiting administrator approval.',
        status: 'pending',
      });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({
        error: 'Your request has been rejected.',
        status: 'rejected',
        rejectionReason: user.rejectionReason || null,
      });
    }
    if (user.status === 'blocked' || user.isBlocked) {
      return res.status(403).json({
        error: 'Your account has been blocked. Please contact the administrator.',
        status: 'blocked',
      });
    }

    // ── Validate password ──
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // ── Issue JWT ──
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id:          user._id,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        employeeId:  user.employeeId,
        department:  user.department,
        designation: user.designation,
        plant:       user.plant,
        area:        user.area,
        status:      user.status,
      },
    });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
