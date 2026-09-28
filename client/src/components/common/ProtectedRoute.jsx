import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      addToast('Please login to continue your order.', 'info');
    }
  }, [loading, isAuthenticated, addToast]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }}>
            ✨
          </div>
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
