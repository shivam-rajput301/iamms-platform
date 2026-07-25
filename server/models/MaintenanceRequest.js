import mongoose from 'mongoose';

const maintenanceRequestSchema = new mongoose.Schema(
  {
    request_code:      { type: String, required: true, unique: true, trim: true },
    asset_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    title:             { type: String, required: true, trim: true },
    description:       { type: String, default: null },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'completed', 'closed'],
      default: 'pending',
    },
    requested_by:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigned_engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assigned_by:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    images:            [{ type: String }],
    repair_notes:      { type: String, default: null },
    repair_images:     [{ type: String }],
    estimated_hours:   { type: Number, default: null },
    actual_hours:      { type: Number, default: null },
    maintenance_cost:  { type: Number, default: 0 },
    downtime_hours:    { type: Number, default: 0 },
    rating:            { type: Number, default: null },
    feedback_comment:  { type: String, default: null },
    assigned_at:       { type: String, default: null },
    started_at:        { type: String, default: null },
    completed_at:      { type: String, default: null },
    closed_at:         { type: String, default: null },
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ status: 1 });
maintenanceRequestSchema.index({ priority: 1 });
maintenanceRequestSchema.index({ asset_id: 1 });
maintenanceRequestSchema.index({ requested_by: 1 });
maintenanceRequestSchema.index({ assigned_engineer: 1 });

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
export default MaintenanceRequest;
