import React, { useContext } from 'react';
import { redirect } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(AuthContext)!;

  if (!isAuthenticated) {
    window.location.href = "/auth" // Redirect to login if not authenticated
    return null; // Prevent rendering protected content
  }

  return <>{children}</>;
};

export default PrivateRoute;
