import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './auth-context';

/**
 * Component that redirects users to the appropriate default page based on their role
 */
export const RoleBasedRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show loading while user data is being fetched
  if (isLoading || !user) {
    return null;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'CONTRACTOR':
      // Contractors should go to chats by default
      return <Navigate to="/chats" replace />;
    
    case 'INSPECTOR':
    case 'ADMIN':
      // Inspectors and admins can access the gantt chart (main page)
      return <Navigate to="/main" replace />;
    
    default:
      // Fallback to main page for unknown roles
      return <Navigate to="/main" replace />;
  }
};
