const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri === 'your_mongodb_connection') {
    console.warn('MongoDB is not configured. Add MONGO_URI in backend/.env to enable persistence.');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
  }
};
  