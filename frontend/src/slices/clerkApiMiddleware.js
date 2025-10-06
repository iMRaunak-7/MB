import { apiSlice } from './apiSlice';

/**
 * This middleware allows the frontend to work with Clerk authentication while
 * still maintaining compatibility with the backend API that expects JWT tokens.
 */
export const clerkApiMiddleware = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Transform Clerk user to backend user format and authenticate
    clerkAuthenticate: builder.mutation({
      query: (clerkUser) => ({
        url: '/api/v1/users/clerk-auth',
        method: 'POST',
        body: {
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim(),
          clerkId: clerkUser.id,
          isAdmin: clerkUser.publicMetadata?.isAdmin || false,
        },
      }),
    }),
    
    // Verify Clerk token with backend
    verifyClerkToken: builder.mutation({
      query: (token) => ({
        url: '/api/v1/users/verify-clerk',
        method: 'POST',
        body: { token },
      }),
    }),
  }),
});

export const {
  useClerkAuthenticateMutation,
  useVerifyClerkTokenMutation,
} = clerkApiMiddleware;