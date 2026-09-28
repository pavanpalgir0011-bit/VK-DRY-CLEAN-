import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'New Delhi',
    pincode: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await signup(formData);
      navigate(redirectUrl);
    } catch (err) {
      // toast shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
      navigate(redirectUrl);
    } catch (err) {}
  };

  return (
    <div className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              className="brand-icon"
              style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}
            >
              <Sparkles size={24} />
            </div>
            <h1 style={{ fontSize: '1.9rem', marginBottom: '0.35rem' }}>Create Account</h1>
            <p style={{ fontSize: '0.95rem' }}>
              Book doorstep dry cleaning & track your garments in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            <span>Sign Up with Google</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>or with email</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    placeholder="Re-type password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address (Optional)</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                <textarea
                  name="address"
                  className="form-textarea"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Street, Building, Flat No."
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
            >
              {submitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
