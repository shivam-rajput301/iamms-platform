import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name:            { type: String,  required: true, trim: true },
    employeeId:      { type: String,  required: true, unique: true, uppercase: true, trim: true },
    email:           { type: String,  required: true, unique: true, lowercase: true, trim: true },
    phone:           { type: String,  trim: true, default: null },
    plant:           { type: String,  trim: true, default: null },
    area:            { type: String,  trim: true, default: null },
    department:      { type: String,  trim: true, default: null },
    designation:     { type: String,  trim: true, default: null },
    password:        { type: String,  required: true },           // bcrypt hash
    role: {
      type: String,
      enum: ['super_admin', 'manager', 'engineer', 'employee'],
      default: 'employee',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'blocked'],
      default: 'pending',
    },
    rejectionReason: { type: String,  default: null },
    isApproved:      { type: Boolean, default: false },
    isBlocked:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for common queries
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ plant: 1 });
userSchema.index({ department: 1 });

const User = mongoose.model('User', userSchema);
export default User;
