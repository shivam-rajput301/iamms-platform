import express from 'express';
import Department from '../models/Department.js';

const router = express.Router();

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    const formatted = departments.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      code: d.code,
      departmentType: d.departmentType || 'production',
      description: d.description,
      head_of_department: d.head_of_department,
      created_at: d.createdAt,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('[departments]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
