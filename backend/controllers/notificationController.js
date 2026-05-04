import Notification from '../models/Notification.js';

// ─────────────────────────────────────────
// GET MY NOTIFICATIONS
// GET /api/notifications
// Access: any logged in user
// ─────────────────────────────────────────
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,  // only MY notifications
  })
    .populate('complaint', 'title status')
    .sort({ createdAt: -1 }) // newest first
    .limit(20);              // max 20 notifications

  // Count unread notifications
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({
    success: true,
    unreadCount,
    notifications,
  });
};

// ─────────────────────────────────────────
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// Access: notification owner only
// ─────────────────────────────────────────
export const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  // Make sure only the recipient can mark it as read
  if (!notification.recipient.equals(req.user._id)) {
    return res.status(403).json({
      message: 'Not authorized',
    });
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
};

// ─────────────────────────────────────────
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// Access: any logged in user
// ─────────────────────────────────────────
export const markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    {
      recipient: req.user._id,
      isRead: false,
    },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
};

// ─────────────────────────────────────────
// DELETE A NOTIFICATION
// DELETE /api/notifications/:id
// Access: notification owner only
// ─────────────────────────────────────────
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  if (!notification.recipient.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: 'Notification deleted',
  });
};
