import mongoose from 'mongoose';

const maintenanceLogSchema = new mongoose.Schema(
  {
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceRequest', required: true },
    author_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note:       { type: String, required: true },
    images:     [{ type: String }],
    progress:   { type: Number, default: 0 },
    log_type: {
      type: String,
      enum: ['update', 'assignment', 'completion', 'note'],
      default: 'note',
    },
  },
  { timestamps: true }
);

maintenanceLogSchema.index({ request_id: 1 });
maintenanceLogSchema.index({ author_id: 1 });

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);
export default MaintenanceLog;
