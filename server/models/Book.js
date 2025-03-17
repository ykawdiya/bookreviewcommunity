const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    authors: { type: [String], required: true },
    description: String,
    coverImage: String,
    ISBN: { type: String, unique: true, sparse: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: [] }],
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);