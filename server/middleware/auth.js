const jwt = require('jsonwebtoken');

const ensureAuth = (req, res, next) => {
    // Check JWT_SECRET for each request (in case it changes during runtime)
    if (!process.env.JWT_SECRET) {
        console.error('Missing JWT_SECRET environment variable');
        return res.status(500).json({ message: 'Server authentication configuration error' });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        console.warn('Authorization attempt without token');
        return res.status(401).json({ message: 'Authentication required. Please login.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token expired:', error.message);
            return res.status(401).json({ message: 'Your session has expired. Please login again.' });
        } else {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
    }
};

module.exports = { ensureAuth };