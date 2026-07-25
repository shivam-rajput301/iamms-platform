import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/* ──────────────────────────────────────────────────────────────
   All admin routes require a valid JWT + super_admin role.
────────────────────────────────────────────────────────────── */
router.use(requireAuth, requireRole('super_admin'));

/* ══════════════════════════════════════════════════════════════
   GET /api/admin/pending-count
   Returns the number of pending registrations (for sidebar badge).
══════════════════════════════════════════════════════════════ */
router.get('/pending-count', async (req, res) => {
  try {
    const count = await User.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    console.error('[pending-count]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   GET /api/admin/pending-registrations
   Alias for pending users list, newest first.
══════════════════════════════════════════════════════════════ */
router.get('/pending-registrations', async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    console.error('[pending-registrations]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   GET /api/admin/pending-users
   Returns all users with status = 'pending', newest first.
══════════════════════════════════════════════════════════════ */
router.get('/pending-users', async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) {
    console.error('[pending-users]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   GET /api/admin/users
   Returns all users with optional filters + pagination.
══════════════════════════════════════════════════════════════ */
router.get('/users', async (req, res) => {
  try {
    const { search, plant, department, status, role, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name:       { $regex: search, $options: 'i' } },
        { email:      { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (plant)      query.plant      = plant;
    if (department) query.department = department;
    if (status)     query.status     = status;
    if (role)       query.role       = role;

    const skip  = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error('[users]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   POST /api/admin/users
   Creates a new user directly (by Super Admin).
══════════════════════════════════════════════════════════════ */
router.post('/users', async (req, res) => {
  try {
    const { name, employeeId, email, phone, role, plant, department, password } = req.body;
    if (!name || !employeeId || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields: Name, Employee ID, Email, Password, Role.' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employeeId }],
    });
    if (existing) {
      return res.status(409).json({ error: 'User with this Email or Employee ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      employeeId,
      email: email.toLowerCase(),
      phone: phone || null,
      role,
      plant: plant || null,
      department: department || null,
      password: hashedPassword,
      status: 'approved',
      isApproved: true,
      isBlocked: false,
    });

    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ message: 'User created successfully.', user: userObj });
  } catch (err) {
    console.error('[create-user]', err);
    res.status(500).json({ error: 'Server error creating user.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   PUT /api/admin/users/:id
   Updates an existing user (Name, Phone, Role, Plant, Dept, Status).
══════════════════════════════════════════════════════════════ */
router.put('/users/:id', async (req, res) => {
  try {
    const { name, phone, role, plant, department, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (plant !== undefined) user.plant = plant;
    if (department !== undefined) user.department = department;
    if (status) {
      user.status = status;
      if (status === 'blocked') user.isBlocked = true;
      else if (status === 'approved') {
        user.isBlocked = false;
        user.isApproved = true;
      }
    }

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ message: 'User updated successfully.', user: userObj });
  } catch (err) {
    console.error('[update-user]', err);
    res.status(500).json({ error: 'Server error updating user.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   PUT /api/admin/approve/:id
   Approves a pending user and assigns a role.
══════════════════════════════════════════════════════════════ */
router.put('/approve/:id', async (req, res) => {
  try {
    const { role = 'employee' } = req.body;
    const validRoles = ['employee', 'engineer', 'manager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be employee, engineer, or manager.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.status === 'approved') {
      return res.status(409).json({ error: 'User is already approved.' });
    }

    user.status     = 'approved';
    user.isApproved = true;
    user.role       = role;
    user.isBlocked  = false;
    await user.save();

    res.json({
      message:   `User approved as ${role}.`,
      setupLink: null,
      user:      { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    console.error('[approve]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   PUT /api/admin/reject/:id
   Rejects a pending user with a mandatory reason.
══════════════════════════════════════════════════════════════ */
router.put('/reject/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Rejection reason is required.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason.trim(), isApproved: false },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: 'User rejected.', user });
  } catch (err) {
    console.error('[reject]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   PUT /api/admin/change-role/:id
   Changes the role of an existing user.
══════════════════════════════════════════════════════════════ */
router.put('/change-role/:id', async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['employee', 'engineer', 'manager', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, { role }, { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ message: `Role changed to ${role}.`, user });
  } catch (err) {
    console.error('[change-role]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   PUT /api/admin/block/:id
   Toggles blocked/unblocked status on an approved user.
══════════════════════════════════════════════════════════════ */
router.put('/block/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot block the Super Admin.' });
    }

    const nowBlocked = !user.isBlocked;
    user.isBlocked   = nowBlocked;
    user.status      = nowBlocked ? 'blocked' : 'approved';
    await user.save();

    res.json({ message: nowBlocked ? 'User blocked.' : 'User unblocked.', user });
  } catch (err) {
    console.error('[block]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   PUT /api/admin/reset-password/:id
   Resets user password in MongoDB.
══════════════════════════════════════════════════════════════ */
router.put('/reset-password/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const defaultPassword = 'Password@123';
    user.password = await bcrypt.hash(defaultPassword, 12);
    await user.save();

    res.json({
      message: 'Password reset successfully to default password: Password@123',
      resetLink: null,
    });
  } catch (err) {
    console.error('[reset-password]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ══════════════════════════════════════════════════════════════
   DELETE /api/admin/user/:id
   Deletes a user from MongoDB.
══════════════════════════════════════════════════════════════ */
router.delete('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete the Super Admin.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted.' });
  } catch (err) {
    console.error('[delete]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
