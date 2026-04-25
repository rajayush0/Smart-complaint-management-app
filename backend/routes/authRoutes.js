import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { getMe, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initial Google OAuth login route
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // Check if user exists
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate JWT
    const payload = {
        user: {
            id: req.user.id,
            role: req.user.role || 'user'
        }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
            if (err) throw err;
            
            // Set token in HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            // Redirect to frontend
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            res.redirect(`${clientUrl}/track`); // Redirect user to track or dashboard after login
        }
    );
  }
);

// Get current user route
router.get('/me', authMiddleware, getMe);

// Logout route
router.post('/logout', logout);

export default router;
