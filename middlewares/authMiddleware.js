
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Access denied, no token provided'
            });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get the latest user data from database
        const user = await userModel.findUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                error: 'User account not found'
            });
        }

        // Check whether the account is active
        if (!user.isActive) {
            return res.status(403).json({
                error: 'Your account has been deactivated'
            });
        }

        // Keep the existing token payload
        req.user = decoded;

        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError' ||
            error.name === 'NotBeforeError') {
            return res.status(403).json({
                error: 'Invalid or expired token'
            });
        }

        next(error);
    }
};

module.exports = {
    authenticateToken
};
