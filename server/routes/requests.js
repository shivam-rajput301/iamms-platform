import express from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest.js';
import MaintenanceLog from '../models/MaintenanceLog.js';

const router = express.Router();

function formatProfile(u) {
  if (!u) return null;
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

function formatAsset(a) {
  if (!a) return undefined;
  return {
    id: a._id.toString(),
    asset_id: a.asset_id,
    name: a.name,
    category: a.category,
    department_id: a.department_id ? (a.department_id._id?.toString() || a.department_id.toString()) : null,
    plant: a.plant,
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
  };
}

function formatRequest(r) {
  return {
    id: r._id.toString(),
    request_code: r.request_code,
    asset_id: r.asset_id?._id?.toString() || r.asset_id?.toString() || '',
    title: r.title,
    description: r.description,
    priority: r.priority,
    status: r.status,
    requested_by: r.requested_by?._id?.toString() || r.requested_by?.toString() || '',
    assigned_engineer: r.assigned_engineer?._id?.toString() || r.assigned_engineer?.toString() || null,
    assigned_by: r.assigned_by?._id?.toString() || r.assigned_by?.toString() || null,
    images: r.images || [],
    repair_notes: r.repair_notes,
    repair_images: r.repair_images || [],
    estimated_hours: r.estimated_hours,
    actual_hours: r.actual_hours,
    maintenance_cost: r.maintenance_cost,
    downtime_hours: r.downtime_hours,
    rating: r.rating ?? null,
    feedback_comment: r.feedback_comment ?? null,
    assigned_at: r.assigned_at,
    started_at: r.started_at,
    completed_at: r.completed_at,
    closed_at: r.closed_at,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    asset: typeof r.asset_id === 'object' ? formatAsset(r.asset_id) : undefined,
    requester: typeof r.requested_by === 'object' ? formatProfile(r.requested_by) : undefined,
    engineer: typeof r.assigned_engineer === 'object' ? formatProfile(r.assigned_engineer) : null,
    assigner: typeof r.assigned_by === 'object' ? formatProfile(r.assigned_by) : null,
  };
}

function formatLog(l) {
  return {
    id: l._id.toString(),
    request_id: l.request_id?._id?.toString() || l.request_id?.toString() || '',
    author_id: l.author_id?._id?.toString() || l.author_id?.toString() || '',
    note: l.note,
    images: l.images || [],
    progress: l.progress,
    log_type: l.log_type,
    created_at: l.createdAt,
    author: typeof l.author_id === 'object' ? formatProfile(l.author_id) : undefined,
  };
}

// GET /api/requests
router.get('/', async (req, res) => {
  try {
    const { status, priority, requested_by, engineer_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (requested_by) filter.requested_by = requested_by;
    if (engineer_id) filter.assigned_engineer = engineer_id;

    const requests = await MaintenanceRequest.find(filter)
      .populate('asset_id')
      .populate('requested_by')
      .populate('assigned_engineer')
      .populate('assigned_by')
      .sort({ createdAt: -1 });

    res.json(requests.map(formatRequest));
  } catch (err) {
    console.error('[get-requests]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/requests/:id
router.get('/:id', async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('asset_id')
      .populate('requested_by')
      .populate('assigned_engineer')
      .populate('assigned_by');

    if (!request) return res.status(404).json({ error: 'Request not found.' });

    const logs = await MaintenanceLog.find({ request_id: request._id })
      .populate('author_id')
      .sort({ createdAt: 1 });

    res.json({
      request: formatRequest(request),
      logs: logs.map(formatLog),
    });
  } catch (err) {
    console.error('[get-request-by-id]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/requests
router.post('/', async (req, res) => {
  try {
    const count = await MaintenanceRequest.countDocuments();
    const requestCode = req.body.request_code || `REQ-2026-${String(count + 1).padStart(3, '0')}`;
    const request = await MaintenanceRequest.create({ ...req.body, request_code: requestCode });
    const populated = await MaintenanceRequest.findById(request._id)
      .populate('asset_id')
      .populate('requested_by')
      .populate('assigned_engineer')
      .populate('assigned_by');
    res.status(201).json(formatRequest(populated));
  } catch (err) {
    console.error('[create-request]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/requests/:id
router.put('/:id', async (req, res) => {
  try {
    const request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('asset_id')
      .populate('requested_by')
      .populate('assigned_engineer')
      .populate('assigned_by');
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(formatRequest(request));
  } catch (err) {
    console.error('[update-request]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/requests/:id/rating
router.put('/:id/rating', async (req, res) => {
  try {
    const { rating, feedback_comment } = req.body;
    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { rating, feedback_comment },
      { new: true }
    )
      .populate('asset_id')
      .populate('requested_by')
      .populate('assigned_engineer')
      .populate('assigned_by');

    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(formatRequest(request));
  } catch (err) {
    console.error('[rate-request]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/requests/logs
router.post('/logs', async (req, res) => {
  try {
    const log = await MaintenanceLog.create(req.body);
    const populated = await MaintenanceLog.findById(log._id).populate('author_id');
    res.status(201).json(formatLog(populated));
  } catch (err) {
    console.error('[add-log]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
