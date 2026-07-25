import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

function formatProfile(u) {
  return {
    id: u._id.toString(),
    full_name: u.name,
    email: u.email,
    role: u.role,
    department_id: null,
    phone: u.phone || null,
    avatar_url: null,
    employee_id: u.employeeId,
    designation: u.designation || null,
    is_active: u.status === 'approved' && !u.isBlocked,
    created_at: u.createdAt,
    updated_at: u.updatedAt,
    department: u.department ? { id: '', name: u.department } : null,
  };
}

// GET /api/profiles
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ status: 'approved' }).sort({ name: 1 });
    res.json(users.map(formatProfile));
  } catch (err) {
    console.error('[profiles]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/profiles/engineers
router.get('/engineers', async (req, res) => {
  try {
    const engineers = await User.find({
      role: 'engineer',
      status: 'approved',
      isBlocked: false,
    }).sort({ name: 1 });
    res.json(engineers.map(formatProfile));
  } catch (err) {
    console.error('[engineers]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/profiles/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { full_name, phone, designation } = req.body;
    const updates = {};
    if (full_name) updates.name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (designation !== undefined) updates.designation = designation;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(formatProfile(user));
  } catch (err) {
    console.error('[update-profile]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
