import mongoose from 'mongoose';

// Set up default mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gami_protocol';

// Configure mongoose
mongoose.set('strictQuery', false);

// Connect to MongoDB
export async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Disconnect from MongoDB
export async function disconnectFromMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    return false;
  }
}

// Export the mongoose connection
export const mongoConnection = mongoose.connection;

// Export mongoose for direct use elsewhere
export { mongoose };