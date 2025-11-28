const jwt = require('jsonwebtoken');

/**
 * Middleware: ensureAuthenticated
 * - Accepts `Authorization` header in any casing.
 * - Accepts either "Bearer <token>" or the raw token.
 * - Verifies JWT and attaches `req.user`, plus `req.userId`/`req.userEmail` when available.
 */
const ensureAuthenticated = (req, res, next) => {
    const header = req.headers.authorization || req.headers.Authorization || req.headers['Authorization'] || req.headers['authorization'] || req.headers['x-access-token'];
    if (!header) {
        return res.status(401).json({ success: false, message: 'Authorization header required' });
    }

    // Accept "Bearer <token>" or raw token
    const token = (typeof header === 'string' && header.startsWith('Bearer ')) ? header.slice(7) : header;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // helper convenience fields for controllers
        if (decoded && (decoded._id || decoded.id)) req.userId = decoded._id || decoded.id;
        if (decoded && decoded.email) req.userEmail = decoded.email;
        return next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = ensureAuthenticated;
