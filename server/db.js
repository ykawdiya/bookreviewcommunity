const mongoose = require('mongoose');

const MAX_RETRIES = 5; // Limit retries to prevent infinite loops
let retryCount = 0;
const RETRY_DELAY = process.env.MONGO_RETRY_DELAY || 5000; // Configurable retry delay

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('Missing MONGO_URI environment variable');
    }

    try {
        // Removed deprecated options
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
        retryCount = 0; // Reset retry count on successful connection
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.warn(`⚠️ Retry ${retryCount}/${MAX_RETRIES} in ${RETRY_DELAY / 1000} seconds...`);
            setTimeout(connectDB, RETRY_DELAY);
        } else {
            console.error('❌ Max retries reached. Exiting...');
            process.exit(1);
        }
    }
};

// Handle MongoDB disconnections
mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected.');
    if (retryCount < MAX_RETRIES) {
        console.warn(`🔄 Attempting to reconnect (${retryCount + 1}/${MAX_RETRIES})...`);
        setTimeout(connectDB, RETRY_DELAY);
    } else {
        console.error('❌ Max retries reached. Exiting...');
        process.exit(1);
    }
});

// Log successful reconnections
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB Reconnected');
});

module.exports = connectDB;