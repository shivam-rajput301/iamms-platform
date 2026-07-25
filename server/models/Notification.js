import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type:    { type: String, required: true, trim: true },
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true },
    link:    { type: String, default: null },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user_id: 1 });
notificationSchema.index({ is_read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
