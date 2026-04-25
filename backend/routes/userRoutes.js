import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Example route: Get user profile
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ message: 'User profile retrieved successfully', user: req.user });
});

// Example admin route
router.get('/admin-dashboard', authMiddleware, roleMiddleware('admin'), (req, res) => {
    res.json({ message: 'Welcome to the admin dashboard' });
});

export default router;
