import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';

const AdminRoute = () => {
  // Get user info from both auth systems during transition
  const { userInfo: legacyUserInfo } = useSelector(state => state.auth);
  const { userInfo: clerkUserInfo } = useSelector(state => state.clerkAuth);
  const { isLoaded, user } = useUser();
  const { isSignedIn } = useAuth();

  // If Clerk is not yet loaded, show nothing
  if (!isLoaded) {
    return null;
  }

  // Check if user is admin with either system
  const isAdmin = 
    (isSignedIn && user?.publicMetadata?.isAdmin === true) || 
    (clerkUserInfo?.isAdmin === true) || 
    (legacyUserInfo?.isAdmin === true);

  return isAdmin ? <Outlet /> : <Navigate to='/admin/login' replace />;
};

export default AdminRoute;
