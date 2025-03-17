import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

function BookDetails() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState({ book: true, reviews: true });

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
    const DEFAULT_IMAGE = "/default-book-cover.png"; // Make sure this exists in public folder

    const fetchBook = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, book: true }));
            const res = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`);
            setBook(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching book details:", err);
            setError("Failed to fetch book details.");
        } finally {
            setLoading(prev => ({ ...prev, book: false }));
        }
    }, [id]);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(prev => ({ ...prev, reviews: true }));
            const res = await axios.get(`${API_URL}/api/reviews/book/${id}`);
            setReviews(res.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setError("Failed to fetch reviews.");
        } finally {
            setLoading(prev => ({ ...prev, reviews: false }));
        }
    }, [id, API_URL]);

    useEffect(() => {
        fetchBook();
        fetchReviews();
    }, [fetchBook, fetchReviews]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review');
            return;
        }

        if (!reviewText.trim() || rating < 1) {
            alert("Please write a review and provide a rating between 1 and 5.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/reviews`,
                { text: reviewText, rating, bookId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setReviewText('');
            setRating(0);
            fetchReviews(); // Re-fetch reviews after submitting a new one
        } catch (error) {
            console.error('Error submitting review', error);
            if (error.response?.status === 400) {
                alert(error.response.data.message || "Please check your review input");
            } else {
                alert("Failed to submit review. Please try again.");
            }
        }
    };

    if (loading.book && !error) return <div className="p-4">Loading book details...</div>;

    return (
        <div className="p-4">
            {error && <div className="text-red-500 p-2 bg-red-100 rounded mb-4">{error}</div>}

            {book && (
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">{book?.volumeInfo?.title || "Unknown Title"}</h2>
                    <p className="text-gray-600">{book?.volumeInfo?.authors?.join(', ') || "Unknown Author"}</p>
                    <div className="flex flex-col md:flex-row mt-4">
                        <img
                            src={book?.volumeInfo?.imageLinks?.thumbnail || DEFAULT_IMAGE}
                            alt={book?.volumeInfo?.title}
                            className="w-32 h-auto mb-4 md:mb-0 md:mr-4"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = DEFAULT_IMAGE;
                            }}
                        />
                        <div>
                            <p>{book?.volumeInfo?.description || "No description available."}</p>
                        </div>
                    </div>
                </div>
            )}

            {user && (
                <form onSubmit={handleSubmitReview} className="my-6 p-4 bg-gray-50 rounded">
                    <h3 className="text-lg font-medium mb-2">Write a Review</h3>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review"
                        className="border p-2 w-full rounded mb-2"
                        rows="4"
                        required
                    />
                    <div className="flex items-center mb-2">
                        <label htmlFor="rating" className="mr-2">Rating:</label>
                        <input
                            id="rating"
                            type="number"
                            value={rating}
                            onChange={(e) => setRating(parseInt(e.target.value, 10))}
                            min="1"
                            max="5"
                            placeholder="Rating (1-5)"
                            className="border p-2 w-16 rounded"
                            required
                        />
                        <span className="ml-2 text-sm text-gray-500">1-5 stars</span>
                    </div>
                    <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                        Submit Review
                    </button>
                </form>
            )}

            <h3 className="text-xl mt-4 mb-2">Reviews</h3>
            {loading.reviews && !error ? (
                <div className="text-gray-500">Loading reviews...</div>
            ) : (
                <>
                    {reviews.length === 0 ? (
                        <div className="text-gray-500">No reviews yet. Be the first to review!</div>
                    ) : (
                        <div>
                            {reviews.map((review) => (
                                <div key={review._id} className="border p-4 my-2 rounded bg-white">
                                    <div className="flex justify-between">
                                        <p className="font-bold">{review?.userId?.username || "Anonymous"}</p>
                                        <p>Rating: {review.rating}/5</p>
                                    </div>
                                    <p className="mt-2">{review.text}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default BookDetails;