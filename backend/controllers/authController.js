// Placeholder for Authentication logic
// The actual Google OAuth login callback is currently handled directly in routes/authRoutes.js
// However, standard email/password or JWT utility functions would go here

import User from '../models/User.js';

export const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
