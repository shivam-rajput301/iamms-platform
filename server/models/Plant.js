import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, unique: true, trim: true },
    code:     { type: String, required: true, unique: true, uppercase: true, trim: true },
    company:  { type: String, default: 'Hindalco Industries Limited' },
    location: { type: String, default: 'Renukoot, Sonebhadra, Uttar Pradesh' },
    state:    { type: String, default: 'Uttar Pradesh' },
    country:  { type: String, default: 'India' },
    is_active:{ type: Boolean, default: true },
  },
  { timestamps: true }
);

plantSchema.index({ name: 1 });
plantSchema.index({ code: 1 });

const Plant = mongoose.model('Plant', plantSchema);
export default Plant;
