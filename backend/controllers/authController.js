import jwt from 'jsonwebtoken';

// Helper function to generate a JWT token
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
    console.log('✅ Google callback reached');
    console.log('User from Google:', req.user);

    const token = generateToken(req.user._id);
    console.log('✅ Token generated:', token);

    res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${token}`
    );
  } catch (err) {
    console.error('❌ Auth callback error:', err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// GET /auth/me — returns current logged in user
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};