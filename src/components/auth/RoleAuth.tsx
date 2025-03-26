
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RoleAuthProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export const RoleAuth = ({ 
  children, 
  allowedRoles, 
  redirectTo = "/cash-register" 
}: RoleAuthProps) => {
  const { user } = useAuth();
  
  // If the user's role is not in the allowed roles, redirect
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
