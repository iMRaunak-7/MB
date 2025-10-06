import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants';

// Base query with authentication header
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  // We don't use cookies; rely on Authorization header
  credentials: 'omit',
  prepareHeaders: (headers, { getState }) => {
    // Get the Clerk user info from state
    const state = getState();
    const clerkUserInfo = state.clerkAuth?.userInfo;
    const legacyUserInfo = state.auth?.userInfo;
    
    // Debug auth state
    const authDebug = {
      clerkAuth: clerkUserInfo ? 'present' : 'missing',
      legacyAuth: legacyUserInfo ? 'present' : 'missing',
      clerkToken: clerkUserInfo?.token ? 'present' : 'missing',
      legacyToken: legacyUserInfo?.token ? 'present' : 'missing',
    };
    
    console.log('API Request Auth State:', authDebug);
    
    // If we have a token from Clerk, add it to headers
    if (clerkUserInfo?.token) {
      headers.set('authorization', `Bearer ${clerkUserInfo.token}`);
      // Optional extra headers for robustness with some middlewares / proxies
      headers.set('x-clerk-auth', clerkUserInfo.token);
      headers.set('x-clerk-session', clerkUserInfo.token);
      console.log('Using Clerk authentication token');
    }
    // Fallback to legacy token if available
    else if (legacyUserInfo?.token) {
      headers.set('authorization', `Bearer ${legacyUserInfo.token}`);
      console.log('Using legacy authentication token');
    }
    else {
      console.log('No authentication token available');
    }
    
    // Add cache control headers to prevent caching
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    return headers;
  }
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Product', 'Order'],
  endpoints: builder => ({})
});
                                                              