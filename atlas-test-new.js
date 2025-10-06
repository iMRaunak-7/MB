import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing MongoDB Atlas connection with new credentials...');
const uri = process.env.MONGO_URI;
console.log('Connection string: ' + uri?.replace(/:([^:@]+)@/, ':****@'));
const client = new MongoClient(uri);
async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected to MongoDB Atlas!');
    const db = client.db('ecommerce-store');
    console.log('Connected to database:', db.databaseName);
    // Test a simple operation
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', ') || 'No collections found');
  } catch (err) {
    console.error('Connection error:', err.name, ':', err.message);
    if (err.cause) {
      console.error('Caused by:', err.cause.name, ':', err.cause.message);
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}
run().catch(console.dir);
