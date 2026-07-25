import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name:               { type: String, required: true, trim: true },
    code:               { type: String, required: true, unique: true, uppercase: true, trim: true },
    departmentType:     { type: String, enum: ['production', 'maintenance', 'support'], default: 'production' },
    description:        { type: String, default: null },
    head_of_department: { type: String, default: null },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ departmentType: 1 });

const Department = mongoose.model('Department', departmentSchema);
export default Department;
