const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * The app is designed to still boot (for health checks, public calculators, etc.)
 * even if the database is temporarily unavailable, but logs a clear warning.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '[db] MONGODB_URI is not set. Skipping database connection. ' +
        'Set MONGODB_URI in your .env file to enable database-backed features.'
    );
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected successfully');
  } catch (err) {
    console.error('[db] MongoDB connection error:', err.message);
    console.warn('[db] Server will continue running without a database connection.');
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[db] MongoDB disconnected');
});

module.exports = connectDB;
