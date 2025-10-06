import mongoose from 'mongoose';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';
import colors from 'colors';
import 'dotenv/config';

// Set mongoose options with extended timeouts for Atlas connections
mongoose.set('bufferTimeoutMS', 60000); // Increase buffer timeout to 60 seconds

// Connect to DB with extended connection timeout
const startConnection = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding data'.green);
  } catch (error) {
    console.error('MongoDB connection error:'.red, error);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    console.log('Deleting existing data...'.yellow);
    await Order.deleteMany();
    console.log('Orders deleted'.green);
    await User.deleteMany();
    console.log('Users deleted'.green);
    await Product.deleteMany();
    console.log('Products deleted'.green);

    console.log('Creating users...'.yellow);
    const createUsers = await User.insertMany(users);
    console.log(`${createUsers.length} users created`.green);

    const adminUser = createUsers[0]._id;

    const sampleProducts = products.map(product => {
      return { ...product, user: adminUser };
    });

    console.log('Creating products...'.yellow);
    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} products created`.green);
    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.log(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    console.log('Deleting all data...'.yellow);
    await Order.deleteMany();
    console.log('Orders deleted'.green);
    await User.deleteMany();
    console.log('Users deleted'.green);
    await Product.deleteMany();
    console.log('Products deleted'.green);

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.log(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// Run the appropriate function
(async () => {
  await startConnection();
  
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    importData();
  }
})();
