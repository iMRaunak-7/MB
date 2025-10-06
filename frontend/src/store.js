// Import necessary functions and slices from Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './slices/apiSlice';
import cartSliceReducer from './slices/cartSlice';
import authSliceReducer from './slices/authSlice';
import searchProductSliceReducer from './slices/searchProductSlice';
import clerkAuthReducer from './slices/clerkAuthSlice';

// Configure the Redux store
const store = configureStore({
  // Combine reducers for different slices
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer, // API-related state reducer
    cart: cartSliceReducer, // Shopping cart state reducer
    auth: authSliceReducer, // Legacy Authentication state reducer
    search: searchProductSliceReducer,
    clerkAuth: clerkAuthReducer, // New Clerk Authentication state reducer
  },

  // Add middleware to the Redux store
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware) // Add API middleware
});

// Export the configured Redux store for use in the application
export default store;
