import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore, UserRoleBackend } from '@/store/authStore';
import { authService } from '@/services/authService'; // Import authService

interface ProtectedRouteProps {
  allowedRoles?: UserRoleBackend[];
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const fetchedUser = await authService.me();
        setAuth(fetchedUser);
      } catch (error) {
        setAuth(null);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [setAuth]);

  if (isVerifying) return <div>Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ... rest of the logic
  // Role-based access control
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  // Profile completion logic for candidates
  if (user.role === 'CANDIDATE') {
    const isProfileComplete = !!(user.candidate_profile?.resume_path && user.candidate_profile?.skills);
    
    // If profile is incomplete and user is not on the completion page, redirect to completion page
    if (!isProfileComplete && location.pathname !== '/candidate/complete-profile') {
      return <Navigate to="/candidate/complete-profile" replace />;
    }
    
    // If profile is complete and user is on the completion page, redirect to dashboard
    if (isProfileComplete && location.pathname === '/candidate/complete-profile') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
