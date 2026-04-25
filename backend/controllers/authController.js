import jwt from 'jsonwebtoken';

// Helper function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },            // what we store inside the token
    process.env.JWT_SECRET,    // secret key to sign it
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Runs after Google OAuth succeeds
export const googleAuthCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);

    // Store token in an HttpOnly cookie
    // HttpOnly means JavaScript on frontend CANNOT read this cookie
    // This protects against hackers stealing your token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Redirect user to frontend dashboard
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (err) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// GET /auth/me — returns who is currently logged in
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /auth/logout — clears the cookie
export const logout = (req, res) => {
  res.cookie('token', '', { maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully' });
};