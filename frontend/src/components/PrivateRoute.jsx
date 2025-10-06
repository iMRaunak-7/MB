import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';

const PrivateRoute = () => {
  // Get user info from both auth systems during transition
  const { userInfo: legacyUserInfo } = useSelector(state => state.auth);
  const { userInfo: clerkUserInfo } = useSelector(state => state.clerkAuth);
  const { isSignedIn, isLoaded } = useAuth();

  // If Clerk is not yet loaded, show nothing
  if (!isLoaded) {
    return null;
  }

  // Check if user is authenticated with either system
  const isAuthenticated = isSignedIn || !!clerkUserInfo || !!legacyUserInfo;

  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
