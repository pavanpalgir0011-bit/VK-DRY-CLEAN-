import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve redirect parameter if any
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin' && redirectUrl === '/') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate(redirectUrl);
    } catch (err) {
      // toast shown in context
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          {/* Logo / Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              className="brand-icon"
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}
            >
              <Sparkles size={24} />
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>Welcome Back</h1>
            <p style={{ fontSize: '0.95rem' }}>
              Sign in to manage bookings, track orders & view history.
            </p>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="btn btn-outline"
            style={{ width: '100%', display: 'flex', gap: '0.75rem', padding: '0.85rem', marginBottom: '1.5rem', fontWeight: 600 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.64v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.11z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.27 21.39 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>or with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="••••••••"
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
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.85rem' }}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
