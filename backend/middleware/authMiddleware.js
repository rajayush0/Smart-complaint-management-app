import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // Look for token in cookies OR in Authorization header
    const token = req.cookies?.token || 
                  req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Not authorized, please log in' 
      });
    }

    // Verify the token is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user this token belongs to
    req.user = await User.findById(decoded.id).select('-__v');

    if (!req.user) {
      return res.status(401).json({ 
        message: 'User no longer exists' 
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ 
      message: 'Token invalid or expired' 
    });
  }
};