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
    const token = generateToken(req.user._id);

    // If user hasn't completed onboarding (role + org selection), send them there
    const needsOnboarding = !req.user.onboardingComplete;

    res.redirect(
      `${process.env.CLIENT_URL}/auth/success?token=${token}&onboarding=${needsOnboarding}`
    );
  } catch (err) {
    console.error('❌ Auth callback error:', err.message);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// GET /auth/me — returns current logged in user with org info
export const getMe = async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(req.user._id)
    .populate({ path: 'organizations.org', select: 'name inviteCode description' })
    .select('-__v');

  res.json({ success: true, user });
};

// POST /auth/logout
export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};