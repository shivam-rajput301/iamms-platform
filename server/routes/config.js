import express from 'express';
import OrganizationConfig from '../models/OrganizationConfig.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/* GET /api/config/organization (Public) */
router.get('/organization', async (req, res) => {
  try {
    let config = await OrganizationConfig.findOne();
    if (!config) {
      config = {
        company_name: 'Not Configured',
        plant_name: 'Not Configured',
        logo_url: null,
        address: null,
        contact_email: null,
        contact_phone: null,
      };
    }
    res.json(config);
  } catch (err) {
    console.error('[get-config]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* PUT /api/config/organization (Requires Super Admin) */
router.put('/organization', requireAuth, requireRole('super_admin'), async (req, res) => {
  try {
    let config = await OrganizationConfig.findOne();
    if (!config) {
      config = new OrganizationConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }
    await config.save();
    res.json(config);
  } catch (err) {
    console.error('[update-config]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
