import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing MongoDB Atlas connection with direct connection...');
const uri = process.env.MONGO_URI;
console.log('Connection string: ' + uri?.replace(/:([^:@]+)@/, ':****@'));
const client = new MongoClient(uri, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  directConnection: true,
  retryWrites: true,
});
async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected to MongoDB Atlas!');
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name).join(', '));
  } catch (err) {
    console.error('Connection error:', err.name, ':', err.message);
    console.error('Error code:', err.code);
    console.error('Error stack:', err.stack);
  } finally {
    await client.close();
    process.exit(0);
  }
}
run().catch(console.dir);
