import mongoose from 'mongoose';
import 'dotenv/config';

// Get MongoDB URI from environment variables with fallback
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stackmart';

console.log(`Attempting to connect to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);

// Try to connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    console.log(`Host: ${mongoose.connection.host}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    
    // Provide helpful advice based on error
    if (err.name === 'MongoNetworkError') {
      console.error('\nPossible solutions:');
      console.error('1. Make sure MongoDB is running on your machine');
      console.error('2. Check if the connection string is correct');
      console.error('3. Verify network connectivity to the MongoDB server');
    } else if (err.name === 'MongoServerSelectionError') {
      console.error('\nServer selection timeout. Possible solutions:');
      console.error('1. Check if MongoDB server is up and running');
      console.error('2. Verify that the server is accessible on the specified port');
      console.error('3. Check firewall settings that might block connections');
    }
    
    process.exit(1);
  });