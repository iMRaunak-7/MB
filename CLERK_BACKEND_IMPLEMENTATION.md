# Clerk Authentication Integration Guide

This guide outlines the backend changes needed to fully support Clerk authentication in the MERN eCommerce application.

## Backend Changes Required

### 1. Install Required Packages

```bash
cd backend
npm install @clerk/clerk-sdk-node
```

### 2. Create Clerk Authentication Controller

Create a new file: `backend/controllers/clerkAuthController.js`

```javascript
import User from '../models/userModel.js';
import { generateToken } from '../utils/generateToken.js';
import Clerk from '@clerk/clerk-sdk-node';

// Initialize Clerk SDK
const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

// @desc     Authenticate user with Clerk
// @method   POST
// @endpoint /api/v1/users/clerk-auth
// @access   Public
const clerkAuthenticate = async (req, res, next) => {
  try {
    const { email, name, clerkId } = req.body;
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from Clerk data
      user = new User({
        name,
        email,
        password: 'clerk-managed', // Password is managed by Clerk
        clerkId // Store Clerk user ID for reference
      });
      
      await user.save();
    } else {
      // Update existing user with Clerk ID if not already set
      if (!user.clerkId) {
        user.clerkId = clerkId;
        await user.save();
      }
    }
    
    // Generate token
    generateToken(req, res, user._id);
    
    // Return user data
    res.status(200).json({
      message: 'Authentication with Clerk successful',
      userId: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Verify Clerk token
// @method   POST
// @endpoint /api/v1/users/verify-clerk
// @access   Public
const verifyClerkToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      res.status(400);
      throw new Error('No token provided');
    }
    
    try {
      // Verify token with Clerk
      const session = await clerkClient.sessions.verifySession(token);
      
      // Find user by Clerk ID
      const user = await User.findOne({ clerkId: session.userId });
      
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
      
      res.status(200).json({
        valid: true,
        userId: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      res.status(401);
      throw new Error('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

export { clerkAuthenticate, verifyClerkToken };
```

### 3. Update User Model

Update `backend/models/userModel.js` to include Clerk ID:

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    clerkId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;
```

### 4. Update User Routes

Update `backend/routes/userRoutes.js` to add Clerk endpoints:

```javascript
import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  getUsers,
  getUserById,
  updateUser,
  updateUserProfile,
  deleteUser,
  admins,
  resetPasswordRequest,
  resetPassword
} from '../controllers/userController.js';

import { clerkAuthenticate, verifyClerkToken } from '../controllers/clerkAuthController.js';

import { protect, admin } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validator.js';
import { registerValidationRules, loginValidationRules, resetPasswordValidationRules } from '../middleware/validator.js';

const router = express.Router();

router
  .post('/login', validateRequest(loginValidationRules), loginUser)
  .post('/', validateRequest(registerValidationRules), registerUser)
  .post('/logout', logoutUser)
  .post('/reset-password/request', resetPasswordRequest)
  .post('/reset-password/reset/:id/:token', validateRequest(resetPasswordValidationRules), resetPassword)
  // Add Clerk authentication routes
  .post('/clerk-auth', clerkAuthenticate)
  .post('/verify-clerk', verifyClerkToken)
  .get('/admins', protect, admin, admins);

router.get('/', protect, admin, getUsers);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
```

### 5. Update Auth Middleware

Modify `backend/middleware/authMiddleware.js` to support Clerk tokens:

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Clerk from '@clerk/clerk-sdk-node';

// Initialize Clerk SDK
const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;
    
    if (!token) {
      // Check for Clerk session token in header
      const clerkSessionToken = req.header('X-Clerk-Session');
      if (clerkSessionToken) {
        try {
          // Verify Clerk session
          const session = await clerkClient.sessions.verifySession(clerkSessionToken);
          
          // Find user by Clerk ID
          const clerkUser = await User.findOne({ clerkId: session.userId });
          
          if (clerkUser) {
            req.user = clerkUser;
            return next();
          }
        } catch (error) {
          // Clerk token verification failed, continue to JWT check
        }
      }
      
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decodedToken.userId).select('-password');
      
      if (!req.user) {
        res.status(404);
        throw new Error('User not found');
      }
      
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } catch (error) {
    next(error);
  }
};

const admin = (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401);
      throw new Error('Not authorized as an admin');
    }
  } catch (error) {
    next(error);
  }
};

export { protect, admin };
```

### 6. Update Environment Variables

Make sure to add the Clerk environment variables to your backend `.env` file:

```
# Clerk Auth
CLERK_SECRET_KEY=sk_test_tnEBvgCpo5ls2rkQQ1C1cVZaOKtiBEiPQzbohtlt2W
```

## Testing the Integration

After implementing these changes:

1. Restart your backend server
2. Test user sign-up and sign-in flows using Clerk
3. Verify that protected routes work with Clerk authentication
4. Test admin functionality with Clerk users who have isAdmin=true in their metadata

## Adding Admin Rights to Clerk Users

To make a Clerk user an admin:

1. Go to the Clerk Dashboard
2. Navigate to Users
3. Find the user you want to make an admin
4. Click on the user to open their profile
5. Go to the "Metadata" tab
6. Add a new public metadata field: `isAdmin: true`
7. Save the changes

This user will now have admin privileges in your application.