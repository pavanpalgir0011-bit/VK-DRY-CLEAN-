import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Package, LogOut, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || 'New Delhi',
    state: user?.state || 'Delhi',
    pincode: user?.pincode || '',
    landmark: user?.landmark || '',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
    } catch (err) {
      // toast shown in context
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout(true);
    navigate('/');
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>My Profile</h1>
            <p>Manage your account details and default doorstep pickup address.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/orders" className="btn btn-outline btn-sm">
              <Package size={16} />
              <span>My Orders</span>
            </Link>
            <button onClick={handleLogout} className="btn btn-danger btn-sm">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: '2.5rem' }}>
          {/* Header preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-heading)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{user?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                <span>{user?.email}</span>
                <span>•</span>
                <span className="badge badge-primary">{user?.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Personal Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    style={{ paddingLeft: '42px' }}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email (Cannot be modified)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '42px', backgroundColor: 'var(--bg-card-subtle)', cursor: 'not-allowed' }}
                    value={user?.email || ''}
                    disabled
                  />
                </div>
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

            <h3 style={{ fontSize: '1.15rem', marginTop: '2rem', marginBottom: '1.25rem' }}>Default Doorstep Address</h3>

            <div className="form-group">
              <label className="form-label">Street / House Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                <textarea
                  name="address"
                  className="form-textarea"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Flat No, Building, Street, Area"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  className="form-input"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Landmark</label>
                <input
                  type="text"
                  name="landmark"
                  className="form-input"
                  value={formData.landmark}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-lg"
                style={{ minWidth: '180px' }}
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Save Profile & Address'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
