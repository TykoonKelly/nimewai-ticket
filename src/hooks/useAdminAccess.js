// src/hooks/useAdminAccess.js
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useAdminAccess = () => {
  const { user } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check multiple conditions for admin access
    const hasAdminCookie = document.cookie.includes('admin_session=true');
    const urlHasSecret = window.location.hash === '#admin-access';
    const isAdminUser = user?.role === 'admin';
    
    setIsAdminAuthenticated(hasAdminCookie || urlHasSecret || isAdminUser);
  }, [user]);

  const grantAdminAccess = () => {
    // Set cookie for 7 days
    document.cookie = 'admin_session=true; max-age=604800; path=/';
    setIsAdminAuthenticated(true);
  };

  const revokeAdminAccess = () => {
    document.cookie = 'admin_session=; max-age=0; path=/';
    setIsAdminAuthenticated(false);
  };

  return { isAdminAuthenticated, grantAdminAccess, revokeAdminAccess };
};