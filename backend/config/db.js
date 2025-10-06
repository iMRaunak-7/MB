import mongoose from 'mongoose';
import 'dotenv/config';

/**
 * Connect to MongoDB database
 * Attempts to connect to the database with proper error handling
 */
const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error('❌ MongoDB connection error: MONGO_URI is not defined in environment variables');
      console.error('Please check your .env file and ensure MONGO_URI is set');
      process.exit(1);
    }

    // Set mongoose options with extended timeouts for Atlas connections
    const options = {
      serverSelectionTimeoutMS: 30000,  // Extended from 5s to 30s
      connectTimeoutMS: 30000,          // Extended from 10s to 30s
      socketTimeoutMS: 45000,           // Added to prevent socket timeouts
      family: 4                         // Force IPv4 (can help with some network setups)
    };

    // Support both variable names for MongoDB URI
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/stackmart';
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`); // Hide password in logs
    
    // Check if it's an Atlas connection
    const isAtlas = mongoUri.includes('mongodb+srv://');
    if (isAtlas) {
      console.log('Using MongoDB Atlas connection...');
    }
    
    const connection = await mongoose.connect(mongoUri, options);
    
    console.log(
      `✅ MongoDB connected successfully on host: ${connection.connection.host}`
    );
    return connection;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error(`Error type: ${error.name}`);
    
    // Provide more helpful error messages
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB. Please check that:');
      console.error('  - MongoDB is running and accessible');
      console.error('  - Your connection string is correct');
      console.error('  - Network allows the connection (no firewall blocking port 27017)');
      console.error('  - For Atlas: your IP is whitelisted in Network Access settings');
      console.error('  - For Atlas: username and password are correct');
      
      // Add additional debugging info for Atlas connections
      if (process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv://')) {
        console.error('For Atlas connections, try these troubleshooting steps:');
        console.error('  1. Verify your username and password are correct');
        console.error('  2. Make sure your IP address is whitelisted in Atlas Network Access');
        console.error('  3. Check if your cluster is active and running');
        console.error('  4. Test if you can ping the Atlas servers');
        console.error('  5. Try accessing Atlas from a different network');
      }
    }
    
    // Exit with failure code but don't prevent server from starting in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️ Running server without database connection (development mode)');
    }
  }
};

export default connectDB;
