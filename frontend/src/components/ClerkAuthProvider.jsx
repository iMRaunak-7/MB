import React, { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useDispatch } from 'react-redux';
import { setClerkUser, clearClerkUser } from '../slices/clerkAuthSlice';

const ClerkAuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded) {
        if (isSignedIn && user) {
          try {
            // Get a fresh JWT token from Clerk for backend API calls
            // If you have a JWT template configured, set REACT_APP_CLERK_JWT_TEMPLATE
            const template = process.env.REACT_APP_CLERK_JWT_TEMPLATE;
            const token = await getToken({
              template: template || undefined,
              skipCache: true,
            });
            
            console.log('Clerk user authenticated:', user.id);
            console.log('Token received:', token ? 'Yes' : 'No');
            
            // Map Clerk user to our app's user format
            const userData = {
              userId: user.id,
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
              email: user.primaryEmailAddress?.emailAddress,
              isAdmin: user.publicMetadata?.isAdmin || false,
              token,
              imageUrl: user.imageUrl,
            };
            
            console.log('Setting user data:', { ...userData, token: token ? 'Hidden' : 'None' });
            
            // Store user in Redux (used by apiSlice to attach Authorization header)
            dispatch(setClerkUser(userData));
          } catch (error) {
            console.error('Error getting Clerk token:', error);
            dispatch(clearClerkUser());
          }
        } else {
          console.log('User not signed in, clearing auth state');
          // Clear user from Redux
          dispatch(clearClerkUser());
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, getToken, dispatch]);

  // Return children regardless of auth state
  return <>{children}</>;
};

export default ClerkAuthProvider;