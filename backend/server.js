import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
const envFile = path.resolve('.env');
if (fs.existsSync(envFile)) {
  console.log(`Loading environment variables from ${envFile}`);
  dotenv.config({ path: envFile });
} else {
  console.warn(`Warning: .env file not found at ${envFile}`);
  dotenv.config(); // Try default locations
}

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { logError } from './utils/errorUtils.js';

const DEFAULT_PORT = 5000;
const MAX_PORT_ATTEMPTS = 10;
let port = Number(process.env.PORT) || DEFAULT_PORT;

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS and compression
app.use(cors());
app.use(compression());
app.use(cookieParser());

// Special handling for Stripe webhook - needs raw body
app.post('/api/v1/payment/stripe/webhook', 
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  }
);

// Standard JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __dirname = path.resolve(); // Set {__dirname} to current working directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/payment', paymentRoutes);
//-------------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  //any app route that is not api will redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });
}

//-------------------------------------
app.use(notFound);
app.use(errorHandler);

/**
 * Start server on specified port, with retry logic for port conflicts
 * @param {number} attemptPort - Port to try
 * @param {number} attempt - Current attempt number
 */
const startServer = (attemptPort, attempt = 1) => {
  console.log(`Attempting to start server on port ${attemptPort}...`);
  
  const server = app.listen(attemptPort)
    .on('listening', () => {
      console.log(`✅ Server running successfully at http://localhost:${attemptPort}/`);
      
      // Store the actual port in case it was dynamically assigned
      app.set('port', attemptPort);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (attempt < MAX_PORT_ATTEMPTS) {
          console.warn(`⚠️ Port ${attemptPort} is already in use, trying port ${attemptPort + 1}...`);
          setTimeout(() => {
            startServer(attemptPort + 1, attempt + 1);
          }, 300);
        } else {
          console.error(`❌ Failed to find an available port after ${MAX_PORT_ATTEMPTS} attempts.`);
          console.error('Please manually specify an available port using the PORT environment variable.');
          process.exit(1);
        }
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
};

// Start the server with the initial port
startServer(port);
