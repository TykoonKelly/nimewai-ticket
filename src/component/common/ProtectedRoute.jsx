// src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #7c3aed',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has the required role
  if (requiredRole) {
    // Check if user role matches required role OR is admin (admin has access to everything)
    const hasAccess = user.role === requiredRole || user.role === 'admin';
    
    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Also check localStorage as a backup
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  // For admin routes, also check localStorage
  if (requiredRole === 'admin' && !isAdmin && user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;