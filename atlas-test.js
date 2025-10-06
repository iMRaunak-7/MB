import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing MongoDB Atlas connection...');
const uri = process.env.MONGO_URI;
console.log('Connection string: ' + uri?.replace(/:([^:@]+)@/, ':****@'));
const client = new MongoClient(uri);
async function run() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('Connected to MongoDB Atlas!');
    const databases = await client.db().admin().listDatabases();
    console.log('Databases:', databases.databases.map(db => db.name).join(', '));
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}
run().catch(console.dir);
