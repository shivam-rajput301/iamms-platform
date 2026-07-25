import express from 'express';
import InventoryItem from '../models/InventoryItem.js';

const router = express.Router();

function formatInventory(i) {
  return {
    id: i._id.toString(),
    item_name: i.item_name,
    part_number: i.part_number,
    category: i.category,
    quantity: i.quantity,
    minimum_stock: i.minimum_stock,
    unit: i.unit,
    supplier: i.supplier,
    unit_price: i.unit_price,
    storage_location: i.storage_location,
    last_restocked: i.last_restocked,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  };
}

// GET /api/inventory
router.get('/', async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ item_name: 1 });
    res.json(items.map(formatInventory));
  } catch (err) {
    console.error('[get-inventory]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/inventory
router.post('/', async (req, res) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json(formatInventory(item));
  } catch (err) {
    console.error('[create-inventory]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/inventory/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ error: 'Inventory item not found.' });
    res.json(formatInventory(item));
  } catch (err) {
    console.error('[update-inventory]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/inventory/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found.' });
    res.json({ message: 'Inventory item deleted successfully.' });
  } catch (err) {
    console.error('[delete-inventory]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/inventory/:id/decrement
router.put('/:id/decrement', async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found.' });

    item.quantity = Math.max(0, item.quantity - (quantity || 1));
    await item.save();
    res.json(formatInventory(item));
  } catch (err) {
    console.error('[decrement-inventory]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
