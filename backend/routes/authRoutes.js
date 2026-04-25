import express from 'express';
import passport from 'passport';
import { 
  googleAuthCallback, 
  getMe, 
  logout 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Step 1: User clicks "Login with Google"
// Browser visits this URL → redirected to Google's login page
router.get(
  '/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Step 2: Google sends user back here after they log in
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: '/login' 
  }),
  googleAuthCallback
);

// Get current logged in user (protected — must be logged in)
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

export default router;