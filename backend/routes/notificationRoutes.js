import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// GET /api/notifications
router.get('/', protect, getNotifications);

// PATCH /api/notifications/read-all
// Must be BEFORE /:id route
// Otherwise Express thinks 'read-all' is an :id
router.patch('/read-all', protect, markAllAsRead);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', protect, deleteNotification);

export default router;