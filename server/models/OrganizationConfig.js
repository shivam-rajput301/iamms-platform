import mongoose from 'mongoose';

const organizationConfigSchema = new mongoose.Schema(
  {
    company_name:   { type: String, default: 'Not Configured' },
    plant_name:     { type: String, default: 'Not Configured' },
    logo_url:       { type: String, default: null },
    address:        { type: String, default: null },
    contact_email:  { type: String, default: null },
    contact_phone:  { type: String, default: null },
  },
  { timestamps: true }
);

const OrganizationConfig = mongoose.model('OrganizationConfig', organizationConfigSchema);
export default OrganizationConfig;
