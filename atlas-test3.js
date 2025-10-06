import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing MongoDB Atlas connection with increased timeouts...');
const uri = process.env.MONGO_URI;
console.log('Connection string: ' + uri?.replace(/:([^:@]+)@/, ':****@'));
const client = new MongoClient(uri, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000
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
    if (err.cause) {
      console.error('Caused by:', err.cause.name, ':', err.cause.message);
    }
  } finally {
    await client.close();
    process.exit(0);
  }
}
run().catch(console.dir);
