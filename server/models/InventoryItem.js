import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema(
  {
    item_name:        { type: String, required: true, trim: true },
    part_number:      { type: String, required: true, unique: true, uppercase: true, trim: true },
    category:         { type: String, default: null },
    quantity:         { type: Number, default: 0 },
    minimum_stock:    { type: Number, default: 5 },
    unit:             { type: String, default: 'pcs' },
    supplier:         { type: String, default: null },
    unit_price:       { type: Number, default: 0 },
    storage_location: { type: String, default: null },
    last_restocked:   { type: String, default: null },
  },
  { timestamps: true }
);

inventoryItemSchema.index({ item_name: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
export default InventoryItem;
