const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true },
    profilePic: String,
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review', default: [] }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);