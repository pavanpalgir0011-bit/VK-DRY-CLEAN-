import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      addToast('Password reset link sent to your email.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div className="card" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-xl)', textAlign: submitted ? 'center' : 'left' }}>
          {submitted ? (
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Check Your Email</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
                We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox or spam folder.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div className="brand-icon" style={{ width: '44px', height: '44px', margin: '0 auto 1rem auto' }}>
                  <Sparkles size={22} />
                </div>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>Reset Password</h1>
                <p style={{ fontSize: '0.92rem' }}>
                  Enter your registered email address to receive recovery instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 600 }}>
                  <ArrowLeft size={16} />
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
