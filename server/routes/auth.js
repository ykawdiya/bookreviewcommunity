const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

// Add rate limiting to auth routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: 'Too many login attempts, please try again later.'
});

// Apply rate limiter to auth endpoint
router.use('/google', limiter);

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    // Check JWT_SECRET for each request
    if (!process.env.JWT_SECRET) {
        console.error('Missing JWT_SECRET environment variable');
        return res.status(500).json({ message: 'Server authentication configuration error' });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        let user = await User.findOne({ googleId: payload['sub'] });
        if (!user) {
            user = new User({
                googleId: payload['sub'],
                username: payload['name'],
                email: payload['email'],
                profilePic: payload['picture'],
            });
            await user.save();
        } else {
            // Update user info in case it changed at Google
            user.username = payload['name'];
            user.email = payload['email'];
            user.profilePic = payload['picture'];
            await user.save();
        }

        const jwtToken = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Longer session time
        );

        res.json({
            token: jwtToken,
            user: {
                username: user.username,
                profilePic: user.profilePic
            }
        });
    } catch (error) {
        console.error("Google auth error:", error);
        res.status(401).json({ message: 'Authentication failed. Please try again.' });
    }
});

module.exports = router;