import express from 'express';
import Asset from '../models/Asset.js';

const router = express.Router();

function formatAsset(a) {
  return {
    id: a._id.toString(),
    asset_id: a.asset_id,
    name: a.name,
    category: a.category,
    asset_type: a.asset_type || 'production_equipment',
    maintenance_type: a.maintenance_type || 'preventive',
    department_id: a.department_id ? a.department_id._id?.toString() || a.department_id.toString() : null,
    plant: a.plant || 'Renukoot Unit',
    location: a.location,
    manufacturer: a.manufacturer,
    model_number: a.model_number,
    serial_number: a.serial_number,
    purchase_date: a.purchase_date,
    warranty_expiry: a.warranty_expiry,
    last_maintenance_date: a.last_maintenance_date,
    next_maintenance_date: a.next_maintenance_date,
    health_score: a.health_score,
    status: a.status,
    image_url: a.image_url,
    qr_code: a.qr_code,
    criticality: a.criticality,
    purchase_cost: a.purchase_cost,
    notes: a.notes,
    created_by: a.created_by,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
    department: a.department_id && typeof a.department_id === 'object' && a.department_id.name ? {
      id: a.department_id._id.toString(),
      name: a.department_id.name,
      code: a.department_id.code,
      departmentType: a.department_id.departmentType || 'production',
      description: a.department_id.description,
      head_of_department: a.department_id.head_of_department,
      created_at: a.department_id.createdAt,
    } : null,
  };
}

// GET /api/assets
router.get('/', async (req, res) => {
  try {
    const assets = await Asset.find().populate('department_id').sort({ createdAt: -1 });
    res.json(assets.map(formatAsset));
  } catch (err) {
    console.error('[get-assets]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/assets/:id
router.get('/:id', async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id).populate('department_id');
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json(formatAsset(asset));
  } catch (err) {
    console.error('[get-asset]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/assets
router.post('/', async (req, res) => {
  try {
    const asset = await Asset.create(req.body);
    const populated = await Asset.findById(asset._id).populate('department_id');
    res.status(201).json(formatAsset(populated));
  } catch (err) {
    console.error('[create-asset]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/assets/:id
router.put('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('department_id');
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json(formatAsset(asset));
  } catch (err) {
    console.error('[update-asset]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Asset not found.' });
    res.json({ message: 'Asset deleted successfully.' });
  } catch (err) {
    console.error('[delete-asset]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
