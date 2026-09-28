import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const AdminRoute = ({ children }) => {
  const { user, logout } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const verifyAdmin = async () => {
      const storedToken = localStorage.getItem('vk_token');
      if (!storedToken || !user || user.role !== 'admin') {
        if (isMounted) {
          setAuthorized(false);
          setVerifying(false);
        }
        return;
      }

      try {
        const res = await authAPI.getMe();
        if (isMounted) {
          if (res.success && res.user && res.user.role === 'admin') {
            setAuthorized(true);
          } else {
            logout(false);
            setAuthorized(false);
          }
          setVerifying(false);
        }
      } catch (err) {
        if (isMounted) {
          logout(false);
          setAuthorized(false);
          setVerifying(false);
        }
      }
    };

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, user]);

  if (verifying) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', gap: '1rem' }}>
        <div style={{ width: '38px', height: '38px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Verifying Secure Administrator Credentials...</p>
      </div>
    );
  }

  if (!authorized) {
    return <Navigate to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default AdminRoute;
