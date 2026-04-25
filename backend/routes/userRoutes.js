import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// GET /api/users
// Only admins can see all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find()
    .select('-__v')
    .sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// PATCH /api/users/:id/role
// Admin changes a user's role
// :id means any user ID can go here e.g. /api/users/abc123/role
router.patch(
  '/:id/role', 
  protect, 
  authorize('admin'), 
  async (req, res) => {
    const { role } = req.body;

    if (!['user', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true } // return updated document not the old one
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user });
});

export default router;