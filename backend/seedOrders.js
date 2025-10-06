import mongoose from 'mongoose';
import Order from './models/orderModel.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import connectDB from './config/db.js';
import colors from 'colors';
import 'dotenv/config';

connectDB();

const createSampleOrders = async () => {
  try {
    // Find all users (excluding admin for more realistic testing)
    const users = await User.find({ isAdmin: false });
    
    if (users.length === 0) {
      console.log('No regular users found. Please run seeder.js first.'.yellow);
      process.exit(1);
    }
    
    // Find products
    const products = await Product.find({}).limit(5);
    
    if (products.length === 0) {
      console.log('No products found. Please run seeder.js first.'.yellow);
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users and ${products.length} products`.blue);
    
    // Create sample order for each user
    const sampleOrders = [];
    
    for (const user of users) {
      // Create 2 sample orders per user
      for (let i = 0; i < 2; i++) {
        const randomProducts = products
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3) + 1);
          
        const orderItems = randomProducts.map(product => ({
          name: product.name,
          qty: Math.floor(Math.random() * 3) + 1,
          image: product.image,
          price: product.price,
          product: product._id
        }));
        
        const itemsPrice = orderItems.reduce(
          (acc, item) => acc + item.qty * item.price, 
          0
        ).toFixed(2);
        
        const taxPrice = (itemsPrice * 0.15).toFixed(2);
        const shippingPrice = (itemsPrice > 100 ? 0 : 10).toFixed(2);
        const totalPrice = (
          Number(itemsPrice) + 
          Number(taxPrice) + 
          Number(shippingPrice)
        ).toFixed(2);
        
        const order = {
          user: user._id,
          orderItems,
          shippingAddress: {
            address: '123 Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'Test Country'
          },
          paymentMethod: i === 0 ? 'PayPal' : 'COD',
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          isPaid: i === 0, // First order is paid
          paidAt: i === 0 ? new Date() : undefined,
          isDelivered: false,
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) // Different dates
        };
        
        sampleOrders.push(order);
      }
    }
    
    // Clear existing orders (optional)
    await Order.deleteMany({});
    
    // Insert orders
    await Order.insertMany(sampleOrders);
    
    console.log(`Created ${sampleOrders.length} sample orders`.green.inverse);
    process.exit();
  } catch (error) {
    console.log(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

createSampleOrders();