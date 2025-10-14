const mongoose = require('mongoose');

/**
 * Connect to MongoDB with sensible defaults and retry/backoff.
 * @param {object} options
 */
async function connectDB({ retries = 3, delayMs = 2000 } = {}) {
    const DB_URL = process.env.DB_URL;
    if (!DB_URL) throw new Error('DB_URL is not defined in environment');

    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000 // fail fast if server unreachable
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await mongoose.connect(DB_URL, opts);
            console.log('Mongodb is connected...');
            return mongoose;
        } catch (err) {
            console.error(`Mongodb connection attempt ${attempt} failed:`, err && err.message ? err.message : err);
            if (attempt === retries) throw err;
            // exponential backoff
            const wait = delayMs * Math.pow(2, attempt - 1);
            await new Promise((r) => setTimeout(r, wait));
        }
    }
}

module.exports = { connectDB, mongoose };