import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  LogOut, 
  Save, 
  ShieldCheck, 
  Sparkles, 
  Building, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { settingsAPI, ordersAPI } from '../services/api';
import { INDIAN_STATES, STATE_CITIES_MAP } from '../data/indianStates';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    landmark: user?.landmark || '',
  });

  const [serviceableCities, setServiceableCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [orderStats, setOrderStats] = useState({ total: 0, active: 0 });
  const [saving, setSaving] = useState(false);
  const [savedRecently, setSavedRecently] = useState(false);

  // Sync formData when auth user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || prev.city || '',
        state: user.state || prev.state || '',
        pincode: user.pincode || '',
        landmark: user.landmark || '',
      }));
    }
  }, [user]);

  // Load live serviceable cities from backend settings
  useEffect(() => {
    let isMounted = true;
    settingsAPI
      .getPublicSettings()
      .then((res) => {
        if (isMounted && res.success && res.settings) {
          const citiesList = res.settings.serviceableCities || [];
          setServiceableCities(citiesList);
          // If no city selected yet, pick the first active city
          if (!formData.city && citiesList.length > 0) {
            const firstActive = citiesList.find((c) => c.enabled) || citiesList[0];
            setFormData((prev) => ({
              ...prev,
              city: prev.city || firstActive.name,
              state: prev.state || firstActive.state,
            }));
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load serviceable cities:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCities(false);
      });

    // Load customer order stats
    ordersAPI
      .getMyOrders()
      .then((res) => {
        if (isMounted && res.success && res.orders) {
          const total = res.orders.length;
          const active = res.orders.filter(
            (o) => !['Delivered', 'Cancelled'].includes(o.status)
          ).length;
          setOrderStats({ total, active });
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSavedRecently(false);
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    // Find if there are serviceable cities in this selected state
    const stateCities = serviceableCities.filter(
      (c) => c.state.toLowerCase() === newState.toLowerCase() && c.enabled
    );

    let nextCity = formData.city;
    if (stateCities.length > 0) {
      // Pick first active city in this state
      nextCity = stateCities[0].name;
    } else {
      // Pick from state cities map or reset
      const commonInState = STATE_CITIES_MAP[newState];
      nextCity = commonInState && commonInState.length > 0 ? commonInState[0] : '';
    }

    setFormData((prev) => ({
      ...prev,
      state: newState,
      city: nextCity,
    }));
    setSavedRecently(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedRecently(false);
    try {
      await updateProfile(formData);
      setSavedRecently(true);
      addToast('Profile & Doorstep Address updated successfully!', 'success');
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

  // Check if currently selected city is serviceable
  const activeCityMatch = serviceableCities.find(
    (c) => c.name.toLowerCase() === (formData.city || '').trim().toLowerCase() && c.enabled
  );
  const isCityServiceable = !!activeCityMatch;

  // Filter cities for dropdown
  // 1. Serviceable cities in the selected state (if state selected)
  // 2. Or all active serviceable cities
  const citiesInState = formData.state
    ? serviceableCities.filter((c) => c.state.toLowerCase() === formData.state.toLowerCase())
    : serviceableCities;

  return (
    <div className="section" style={{ minHeight: '85vh', background: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
                Account Settings
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', margin: 0, fontWeight: 800 }}>My Profile</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0 0', fontSize: '0.95rem' }}>
              Manage personal details, default doorstep pickup location, and view active order history.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/orders" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Package size={16} />
              <span>My Orders ({orderStats.total})</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Hero Card with Glassmorphic Style */}
        <div
          className="card"
          style={{
            padding: '2rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(14, 165, 233, 0.08) 100%)',
            border: '1px solid rgba(37, 99, 235, 0.15)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800 }}>{user?.name || 'Customer'}</h2>
                  <span
                    className="badge"
                    style={{
                      background: user?.role === 'admin' ? '#fef3c7' : '#ecfdf5',
                      color: user?.role === 'admin' ? '#92400e' : '#065f46',
                      border: `1px solid ${user?.role === 'admin' ? '#fcd34d' : '#a7f3d0'}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>{user?.role === 'admin' ? 'Store Administrator' : 'Verified Member'}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="var(--primary)" />
                    <span>{user?.email}</span>
                  </span>
                  {user?.phone && (
                    <>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} color="#059669" />
                        <span>{user?.phone}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics Pills */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1.25rem',
                  textAlign: 'center',
                  minWidth: '110px',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {orderStats.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                  Total Orders
                </div>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 1.25rem',
                  textAlign: 'center',
                  minWidth: '110px',
                }}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>
                  {orderStats.active}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                  Active Orders
                </div>
              </div>
            </div>
          </div>
        </div>

        {savedRecently && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={20} color="#059669" />
            <span>Profile and delivery address updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Card 1: Personal Contact Information */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Personal Information</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Name and contact info</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Full Name *</label>
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

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '42px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Primary login email cannot be modified.
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Phone / Mobile Number *</label>
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
                    required
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Used for order pickup coordinates and WhatsApp delivery updates.
                </div>
              </div>
            </div>

            {/* Card 2: Doorstep Address & Coverage Zone */}
            <div className="card" style={{ padding: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Default Doorstep Address</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Auto-filled during checkout</span>
                </div>
              </div>

              {/* State Selection Dropdown (All Indian States) */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>State / Union Territory *</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose your state</span>
                </label>
                <select
                  name="state"
                  className="form-select"
                  value={formData.state}
                  onChange={handleStateChange}
                  required
                >
                  <option value="">-- Select Your State / UT --</option>
                  {INDIAN_STATES.map((stateName) => (
                    <option key={stateName} value={stateName}>
                      {stateName}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selection Dropdown (Only Serviceable Cities Allowed) */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  <span>City / Coverage Zone *</span>
                  {isCityServiceable ? (
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Active Pickup
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>
                      Coming Soon
                    </span>
                  )}
                </label>

                {citiesInState && citiesInState.length > 0 ? (
                  <select
                    name="city"
                    className="form-select"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Serviceable City --</option>
                    {citiesInState.map((c) => (
                      <option key={`${c.name}-${c.state}`} value={c.name} disabled={!c.enabled}>
                        {c.name} {c.enabled ? '✓ (Active)' : '✗ (Paused)'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      placeholder="Enter your city name"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <div style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '0.35rem' }}>
                      Note: Doorstep order placement is restricted to active cities configured in the store.
                    </div>
                  </div>
                )}
              </div>

              {/* House Address */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Street / House / Apartment Address *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} color="var(--text-light)" style={{ position: 'absolute', left: '14px', top: '16px' }} />
                  <textarea
                    name="address"
                    className="form-textarea"
                    style={{ paddingLeft: '42px' }}
                    placeholder="e.g. Flat 402, Tower B, Lotus Boulevard"
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    required
                  />
                </div>
              </div>

              {/* Pincode & Landmark */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-input"
                    placeholder="e.g. 110001"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Nearby Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    className="form-input"
                    placeholder="e.g. Opposite Gate 2"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: '#ffffff',
              padding: '1.25rem 1.75rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span>Addresses saved here are automatically populated at checkout.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Profile...' : 'Save Profile & Address'}</span>
            </button>
          </div>
        </form>

        {/* Quick Help & Order Shortcuts Card */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1.5rem',
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Need pickup assistance or dry-cleaning guidance?</h4>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Our expert fabric care team is ready to assist you anytime.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/contact" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Contact Care</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/services" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Explore Services</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
