import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLogin = () => {
  const [email, setEmail] = useState(import.meta.env.VITE_ADMIN_EMAIL || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.trim().length === 0) {
      addToast('Security check: Admin password is required to login.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (!user || user.role !== 'admin') {
        addToast('Access denied. Administrator privileges required.', 'error');
        return;
      }
      navigate('/admin');
    } catch (err) {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b1329',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-icon"
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 1rem auto',
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            }}
          >
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>Admin Portal</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Authorized Administrator Access for <strong>JKM Dry Clean</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                placeholder={import.meta.env.VITE_ADMIN_EMAIL || 'jkmdryclean68@gmail.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '42px' }}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', padding: '0.9rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link to="/" style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
