import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    asset_id:              { type: String, required: true, unique: true, trim: true },
    name:                  { type: String, required: true, trim: true },
    category:              { type: String, required: true, trim: true },
    asset_type: {
      type: String,
      enum: [
        'production_equipment',
        'mechanical_equipment',
        'electrical_equipment',
        'instrumentation',
        'it_asset',
        'facility_asset',
        'vehicle',
        'tool',
      ],
      default: 'production_equipment',
    },
    maintenance_type: {
      type: String,
      enum: ['preventive', 'corrective', 'predictive', 'emergency', 'inspection'],
      default: 'preventive',
    },
    department_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    plant:                 { type: String, default: 'Renukoot Unit' },
    location:              { type: String, default: null },
    manufacturer:          { type: String, default: null },
    model_number:          { type: String, default: null },
    serial_number:         { type: String, default: null },
    purchase_date:         { type: String, default: null },
    warranty_expiry:       { type: String, default: null },
    last_maintenance_date: { type: String, default: null },
    next_maintenance_date: { type: String, default: null },
    health_score:          { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['operational', 'active', 'under_maintenance', 'breakdown', 'idle', 'retired'],
      default: 'operational',
    },
    image_url:             { type: String, default: null },
    qr_code:               { type: String, default: null },
    criticality: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    purchase_cost:         { type: Number, default: 0 },
    notes:                 { type: String, default: null },
    created_by:            { type: String, default: null },
  },
  { timestamps: true }
);

assetSchema.index({ status: 1 });
assetSchema.index({ criticality: 1 });
assetSchema.index({ department_id: 1 });
assetSchema.index({ asset_type: 1 });

const Asset = mongoose.model('Asset', assetSchema);
export default Asset;
