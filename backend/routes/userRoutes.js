import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { completeOnboarding } from '../controllers/onboardingController.js';
import { getAllStaff, getStaffByGroup } from '../controllers/staffController.js';
import { deleteMyAccount, deleteUserByAdmin } from '../controllers/userController.js';

const router = express.Router();

// PATCH /api/users/onboarding
// Must be above /:id/role so Express doesn't treat "onboarding" as an :id param
router.patch('/onboarding', protect, completeOnboarding);

// GET /api/users/staff/all   — /staff/all MUST be above /staff/:group so "all" isn't captured as :group
// GET /api/users/staff/:group
router.get('/staff/all',    protect, authorize('admin'), getAllStaff);
router.get('/staff/:group', protect, authorize('admin'), getStaffByGroup);

// GET /api/users
// Only admins can see all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find()
    .select('-__v')
    .sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// DELETE /api/users/me — must be above /:id so "me" isn't captured as :id
router.delete('/me', protect, deleteMyAccount);

// DELETE /api/users/:id  (admin only)
router.delete('/:id', protect, authorize('admin'), deleteUserByAdmin);

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