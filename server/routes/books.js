const express = require('express');
const router = express.Router();
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per minute
    message: 'Too many requests, please try again later.'
});

router.use(limiter);

router.get('/', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    try {
        const sanitizedQuery = encodeURIComponent(q.trim());
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${sanitizedQuery}&maxResults=10${apiKey}`);

        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).json({ message: 'No books found for the given query' });
        }

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching books:", error.message);
        res.status(500).json({ message: 'Error fetching books', error: error.message });
    }
});

module.exports = router;