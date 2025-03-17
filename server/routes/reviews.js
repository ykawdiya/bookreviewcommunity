const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');
const axios = require('axios');
const { ensureAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Add rate limiting to review submission
const postLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 reviews per hour
    message: 'Too many reviews submitted. Please try again later.'
});

// Apply to post endpoint
router.post('/', ensureAuth, postLimiter, async (req, res) => {
    const { text, rating, bookId } = req.body;

    // Validate inputs
    if (!text || !rating || !bookId) {
        return res.status(400).json({ message: 'Text, rating, and bookId are required' });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
        return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    if (text.trim().length < 3) {
        return res.status(400).json({ message: 'Review text is too short' });
    }

    try {
        // Find or create book
        let book = await Book.findOne({ googleId: bookId });
        if (!book) {
            try {
                const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
                if (!response || !response.data.volumeInfo) {
                    return res.status(404).json({ message: 'Book not found' });
                }
                const bookData = response.data;
                book = new Book({
                    googleId: bookId,
                    title: bookData.volumeInfo.title,
                    authors: bookData.volumeInfo.authors || ['Unknown'],
                    description: bookData.volumeInfo.description || 'No description available',
                    coverImage: bookData.volumeInfo.imageLinks?.thumbnail || '',
                    ISBN: bookData.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 'N/A',
                });
                await book.save();
            } catch (error) {
                console.error("Error fetching book from Google API:", error);
                return res.status(500).json({ message: 'Error fetching book details' });
            }
        }

        // Check if user already reviewed this book
        const existingReview = await Review.findOne({
            bookId: book._id,
            userId: req.user.userId
        });

        if (existingReview) {
            // Update existing review
            existingReview.text = text;
            existingReview.rating = rating;
            await existingReview.save();
            return res.status(200).json({
                ...existingReview.toObject(),
                message: 'Review updated successfully'
            });
        }

        // Create new review
        const review = new Review({
            text,
            rating,
            bookId: book._id,
            userId: req.user.userId,
        });
        await review.save();

        // Update book with reference to review
        book.reviews.push(review._id);
        await book.save();

        // Update user with reference to review
        await User.findByIdAndUpdate(req.user.userId, {
            $push: { reviews: review._id }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
});

router.get('/book/:googleId', async (req, res) => {
    try {
        const book = await Book.findOne({ googleId: req.params.googleId });
        if (!book) return res.json([]);

        const reviews = await Review.find({ bookId: book._id })
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 }); // Sort by newest first

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

router.get('/user/:userId', ensureAuth, async (req, res) => {
    // Only allow users to see their own reviews, or admins to see any reviews
    if (req.user.userId !== req.params.userId && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized to access these reviews' });
    }

    try {
        const reviews = await Review.find({ userId: req.params.userId })
            .populate('bookId', 'title googleId')
            .sort({ createdAt: -1 }); // Show newest first

        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Add endpoint to delete a review
router.delete('/:reviewId', ensureAuth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns this review
        if (review.userId.toString() !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'You are not authorized to delete this review' });
        }

        // Remove reference from book
        await Book.findByIdAndUpdate(review.bookId, {
            $pull: { reviews: review._id }
        });

        // Remove reference from user
        await User.findByIdAndUpdate(review.userId, {
            $pull: { reviews: review._id }
        });

        // Delete the review
        await Review.findByIdAndDelete(req.params.reviewId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
});

module.exports = router;