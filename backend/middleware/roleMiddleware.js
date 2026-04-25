export const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'No user found, authorization denied' });
        }
        
        // Ensure user has the correct role
        if (req.user.role !== requiredRole && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied: insufficient permissions' });
        }
        
        next();
    };
};
