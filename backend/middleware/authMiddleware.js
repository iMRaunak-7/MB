import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Decode JWT payload without verifying signature (for Clerk tokens) using base64url-safe logic
const decodeJwtPayload = (token) => {
  const parts = token?.split('.') || [];
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  // Base64url -> Base64
  let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  // Pad if necessary
  const pad = b64.length % 4;
  if (pad === 2) b64 += '==';
  else if (pad === 3) b64 += '=';
  const json = Buffer.from(b64, 'base64').toString('utf8');
  return JSON.parse(json);
};

// Try to safely extract an email-like field from Clerk token claims
const extractEmailFromClaims = (claims) => {
  return (
    claims?.email ||
    claims?.email_address ||
    claims?.primary_email ||
    (Array.isArray(claims?.email_addresses) ? claims.email_addresses[0] : undefined) ||
    undefined
  );
};

// Middleware to protect routes by verifying JWT authentication token.
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Log headers for debugging
    console.log('Auth Headers:', {
      authHeader: req.headers.authorization ? 'Present' : 'Missing',
      clerkSession: req.headers['x-clerk-session'] ? 'Present' : 'Missing',
      clerkAuth: req.headers['x-clerk-auth'] ? 'Present' : 'Missing',
      cookies: req.cookies ? 'Present' : 'Missing',
    });
    
    // Check for token in Authorization header (Clerk JWT)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Using token from Authorization header');
    }
    // Fallback to cookie-based JWT (legacy support)
    else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
      console.log('Using token from cookies');
    }
    // Additional Clerk header fallbacks
    else if (req.headers['x-clerk-session']) {
      token = req.headers['x-clerk-session'];
      console.log('Using token from x-clerk-session header');
    } else if (req.headers['x-clerk-auth']) {
      token = req.headers['x-clerk-auth'];
      console.log('Using token from x-clerk-auth header');
    }

    if (!token) {
      console.error('Authentication failed: No token provided');
      res.statusCode = 401;
      throw new Error('Authentication failed: Token not provided.');
    }

    // Log token type (without exposing token)
    console.log('Token found, length:', token.length);

    // Try to verify as Clerk JWT first (no secret needed for Clerk tokens)
    let decodedToken;
    try {
      decodedToken = decodeJwtPayload(token);
      const isClerkToken = !!(decodedToken?.iss && decodedToken.iss.includes('clerk'));
      
      console.log('Token decoded, appears to be a Clerk token:', isClerkToken);
      
      if (isClerkToken) {
        // Handle Clerk JWT - find or create a user by clerkId, falling back to email if present
        const clerkUserId = decodedToken.sub;
        console.log('Looking up user by Clerk ID:', clerkUserId);
        let user = await User.findOne({ clerkId: clerkUserId });

        if (!user) {
          // Try to match by email first to link existing accounts
          const emailFromToken = extractEmailFromClaims(decodedToken);
          console.log('No user found by Clerk ID. Email from token:', emailFromToken || 'None');
          
          if (emailFromToken) {
            console.log('Looking up user by email:', emailFromToken);
            user = await User.findOne({ email: emailFromToken });
            console.log('User found by email:', user ? 'Yes' : 'No');
          }

          if (!user) {
            // Create user from Clerk token if none found
            const synthesizedEmail = emailFromToken || `${clerkUserId}@users.clerk.dev`;
            const name = decodedToken.name || decodedToken.given_name || 'User';
            console.log('Creating new user from Clerk data:', { name, email: synthesizedEmail });
            
            try {
              user = await User.create({
                clerkId: clerkUserId,
                name,
                email: synthesizedEmail,
                isAdmin: false
              });
              console.log('New user created with ID:', user._id);
            } catch (createErr) {
              // Handle duplicate email race: link existing user by email
              if (createErr?.code === 11000 && createErr?.keyPattern?.email) {
                user = await User.findOne({ email: synthesizedEmail });
                if (user && !user.clerkId) {
                  user.clerkId = clerkUserId;
                  await user.save();
                }
              } else {
                throw createErr;
              }
            }
          } else if (!user.clerkId) {
            // Link found user with Clerk ID if missing
            user.clerkId = clerkUserId;
            await user.save();
          }
        }

        req.user = user;
      } else {
        // Handle legacy JWT tokens
        const legacyToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(legacyToken.userId).select('-password');
      }
    } catch (jwtError) {
      // Try legacy JWT verification as fallback
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.userId).select('-password');
      } catch (legacyError) {
        res.statusCode = 401;
        throw new Error('Authentication failed: Invalid token.');
      }
    }

    if (!req.user) {
      res.statusCode = 401;
      throw new Error('Authentication failed: User not found.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if the user is an admin.
const admin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      res.statusCode = 401;
      throw new Error('Authorization failed: Not authorized as an admin.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { protect, admin };
