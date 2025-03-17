const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Book = require('../models/Book');
const User = require('../models/User');
const axios = require('axios');
const { ensureAuth } = require('../middleware/auth');

// Create a new review
router.post('/', ensureAuth, async (req, res) => {
    const { text, rating, bookId } = req.body;

    if (!text || !rating || !bookId) {
        return res.status(400).json({ message: 'Text, rating, and bookId are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    try {
        console.log(`Creating review for book with Google ID: ${bookId}`);

        // First check if the book exists in our database
        let book = await Book.findOne({ googleId: bookId });

        // If book doesn't exist, fetch it from Google Books API and create it
        if (!book) {
            console.log(`Book not found in database, fetching from Google Books API`);

            try {
                const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`);

                if (!response || !response.data || !response.data.volumeInfo) {
                    console.error(`Invalid response from Google Books API for ID: ${bookId}`);
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
                console.log(`Created new book in database: ${book.title} (${book._id})`);
            } catch (error) {
                console.error(`Error fetching book from Google Books API:`, error.message);
                return res.status(500).json({ message: 'Error fetching book details from Google Books API' });
            }
        }

        // Check if user has already reviewed this book
        const existingReview = await Review.findOne({
            bookId: book._id,
            userId: req.user.userId
        });

        if (existingReview) {
            console.log(`User ${req.user.userId} already reviewed this book. Updating review.`);

            // Update existing review
            existingReview.text = text;
            existingReview.rating = rating;
            await existingReview.save();

            return res.status(200).json(existingReview);
        }

        // Create new review
        const review = new Review({
            text,
            rating,
            bookId: book._id,
            userId: req.user.userId,
        });

        await review.save();
        console.log(`Created new review: ${review._id}`);

        // Add review to user's reviews
        await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { reviews: review._id } }
        );

        // Add review to book's reviews
        await Book.findByIdAndUpdate(
            book._id,
            { $push: { reviews: review._id } }
        );

        res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ message: 'Error creating review', error: error.message });
    }
});

// Get reviews for a book by Google ID
router.get('/book/:googleId', async (req, res) => {
    try {
        console.log(`Fetching reviews for book with Google ID: ${req.params.googleId}`);

        const book = await Book.findOne({ googleId: req.params.googleId });

        if (!book) {
            console.log(`No book found with Google ID: ${req.params.googleId}`);
            return res.json([]);
        }

        console.log(`Found book: ${book.title} with ID: ${book._id}`);

        const reviews = await Review.find({ bookId: book._id })
            .populate('userId', 'username profilePic')
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log(`Found ${reviews.length} reviews for this book`);
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Get reviews by a specific user
router.get('/user/:userId', ensureAuth, async (req, res) => {
    if (req.user.userId !== req.params.userId && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized to access these reviews' });
    }

    try {
        console.log(`Fetching reviews for user: ${req.params.userId}`);

        const reviews = await Review.find({ userId: req.params.userId })
            .populate('bookId', 'title googleId coverImage')
            .sort({ createdAt: -1 });

        console.log(`Found ${reviews.length} reviews by this user`);
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
});

// Delete a review
router.delete('/:reviewId', ensureAuth, async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify owner of review
        if (review.userId.toString() !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized to delete this review' });
        }

        // Remove review from book
        await Book.findByIdAndUpdate(
            review.bookId,
            { $pull: { reviews: review._id } }
        );

        // Remove review from user
        await User.findByIdAndUpdate(
            review.userId,
            { $pull: { reviews: review._id } }
        );

        // Delete the review
        await Review.findByIdAndDelete(req.params.reviewId);

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
});

module.exports = router;