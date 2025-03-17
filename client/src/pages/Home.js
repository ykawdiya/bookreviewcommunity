import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [query, setQuery] = useState('');
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";
    const DEFAULT_IMAGE = "/default-book-cover.png"; // Make sure this exists in public folder

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Please enter a search term.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const res = await axios.get(`${API_URL}/api/books`, {
                params: { q: query },
            });

            setBooks(res.data.items || []);

            if (!res.data.items || res.data.items.length === 0) {
                setError('No books found for your search. Try different keywords.');
            }
        } catch (error) {
            console.error('Error searching books', error);
            setError(error.response?.data?.message || 'Failed to fetch books. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="max-w-2xl mx-auto mb-8">
                <h1 className="text-2xl font-bold mb-4">Search for Books</h1>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title, author, or keyword"
                        className="border p-2 flex-grow rounded"
                        aria-label="Search query"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>
            </div>

            {error && <p className="text-red-500 p-2 bg-red-100 rounded mb-4">{error}</p>}

            {loading ? (
                <p className="text-center text-gray-500">Searching books...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                            <div className="p-4 flex flex-col h-full">
                                <div className="flex-shrink-0 flex justify-center mb-4">
                                    <img
                                        src={book.volumeInfo.imageLinks?.thumbnail || DEFAULT_IMAGE}
                                        alt={book.volumeInfo.title || "Book cover"}
                                        className="h-48 object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_IMAGE;
                                        }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg mb-1">{book.volumeInfo.title}</h3>
                                    <p className="text-gray-600 mb-2">
                                        {book.volumeInfo.authors?.join(', ') || "Unknown Author"}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {book.volumeInfo.description || "No description available."}
                                    </p>
                                </div>
                                <Link
                                    to={`/book/${book.id}`}
                                    className="text-blue-500 hover:text-blue-700 font-medium"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {books.length === 0 && !loading && !error && (
                <p className="text-center text-gray-500">Search for books to get started.</p>
            )}
        </div>
    );
}

export default Home;