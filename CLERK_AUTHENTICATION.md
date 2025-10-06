# Clerk Authentication for MERN eCommerce

This project has been updated to use [Clerk](https://clerk.dev/) for authentication and user management.

## Frontend Changes Implemented

- Installed Clerk React SDK (`@clerk/clerk-react`)
- Added Clerk provider to wrap the application
- Created Clerk login and registration pages
- Updated routes to use Clerk components
- Created middleware to connect Clerk with the backend
- Updated protected routes to work with Clerk authentication
- Added Clerk user profile page

## Environment Variables

The following environment variables need to be set in your `.env` file:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Backend Changes Required

Detailed instructions for the necessary backend changes can be found in the `CLERK_BACKEND_IMPLEMENTATION.md` file. These changes include:

- Adding Clerk SDK to the backend
- Creating routes to handle Clerk authentication
- Updating the user model to store Clerk user IDs
- Modifying the authentication middleware to support Clerk tokens

## Getting Started

1. Make sure you have the required environment variables set
2. Install the dependencies: `npm install`
3. Implement the backend changes outlined in `CLERK_BACKEND_IMPLEMENTATION.md`
4. Start the development server: `npm run dev`

## Authentication Flow

1. Users sign up or log in using Clerk's UI components
2. Clerk handles authentication, password management, and session management
3. The frontend syncs Clerk's auth state with Redux
4. API calls are authenticated using Clerk session tokens
5. The backend verifies Clerk tokens and maps them to the appropriate user

## User Data

The integration maintains backward compatibility with the existing user model while adding Clerk support. When a user signs up with Clerk:

1. If the user already exists in the database, their account is linked to their Clerk ID
2. If the user is new, a new account is created with data from Clerk

## Admin Users

To give a Clerk user admin privileges:

1. Go to the Clerk Dashboard
2. Find the user and edit their profile
3. Add a public metadata field: `isAdmin: true`
4. Save the changes

## Current Limitations

This implementation maintains the existing JWT authentication alongside Clerk. For a full migration:

1. Complete the backend implementation described in `CLERK_BACKEND_IMPLEMENTATION.md`
2. Test thoroughly with both authentication systems
3. Eventually, phase out the JWT authentication system