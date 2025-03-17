import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Profile() {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get(
                    `${API_URL}/api/reviews/user/${user.userId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReviews(res.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Failed to fetch your reviews. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (user && !authLoading) {
            fetchReviews();
        }
    }, [user, authLoading, API_URL]);

    if (authLoading) return <div className="p-4 text-center">Loading...</div>;

    if (!user) {
        return (
            <div className="p-4 text-center">
                <h2 className="text-xl mb-4">Please login to view your profile</h2>
                <p>You need to be logged in to access this page.</p>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{user.username}'s Profile</h2>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Username</p>
                        <p className="font-medium">{user.username}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Your Reviews</h3>

                {error && <p className="text-red-500 p-2 bg-red-100 rounded mb-4">{error}</p>}

                {loading ? (
                    <p className="text-gray-500">Loading your reviews...</p>
                ) : (
                    <>
                        {reviews.length === 0 ? (
                            <div className="text-gray-500 mb-4">
                                <p>You haven't written any reviews yet.</p>
                                <Link to="/" className="text-blue-500 mt-2 inline-block">
                                    Browse books to review
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="border p-4 rounded">
                                        <div className="flex justify-between mb-2">
                                            <h4 className="font-bold">
                                                {review?.bookId?.title || "Unknown Book"}
                                            </h4>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                Rating: {review.rating}/5
                                            </span>
                                        </div>
                                        <p className="mb-2">{review.text}</p>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                            {review?.bookId?._id && (
                                                <Link
                                                    to={`/book/${review.bookId._id}`}
                                                    className="text-blue-500"
                                                >
                                                    View Book
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;