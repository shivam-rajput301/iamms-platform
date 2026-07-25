import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

function formatNotification(n) {
  return {
    id: n._id.toString(),
    user_id: n.user_id ? n.user_id.toString() : null,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    is_read: n.is_read,
    created_at: n.createdAt,
  };
}

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications.map(formatNotification));
  } catch (err) {
    console.error('[get-notifications]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ is_read: false }, { is_read: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[mark-all-read]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: 'Notification not found.' });
    res.json(formatNotification(notification));
  } catch (err) {
    console.error('[mark-read]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
