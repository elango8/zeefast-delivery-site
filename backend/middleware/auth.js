/**
 * Authentication Middleware
 * Validates user tokens for protected routes
 */

const fs = require('fs');
const path = require('path');

const loadUsers = () => {
    const filePath = path.join(__dirname, '../data/users.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8')).users;
};

/**
 * Simple token-based authentication
 * In production, use JWT or similar
 */
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        // Simple token format: base64(userId)
        const userId = Buffer.from(token, 'base64').toString('utf8');
        const users = loadUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token format' });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
        try {
            const userId = Buffer.from(token, 'base64').toString('utf8');
            const users = loadUsers();
            const user = users.find(u => u.id === userId);
            if (user) {
                req.user = user;
                req.userId = userId;
            }
        } catch (error) {
            // Ignore invalid tokens for optional auth
        }
    }

    next();
};

module.exports = { authenticate, optionalAuth };
