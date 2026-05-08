import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Runs after Google OAuth succeeds
export const googleAuthCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  } catch (err) {
    console.error('❌ Auth callback error:', err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// GET /auth/me — returns current logged in user (fresh from DB)
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-__v -googleId');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ success: true, user });
};

// POST /auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};
