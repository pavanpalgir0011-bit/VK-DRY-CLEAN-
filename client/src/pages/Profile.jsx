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
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Home,
  Briefcase,
  HelpCircle,
  HeartHandshake
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
    alternatePhone: user?.alternatePhone || '',
    gender: user?.gender || '',
    address: user?.address || '',
    addressType: user?.addressType || 'Home',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    landmark: user?.landmark || '',
  });

  // Interactive Tap Columns (Accordion state)
  // By default, both personal and address columns can be opened, or toggle on tap
  const [openSections, setOpenSections] = useState({
    personal: true,
    address: true,
    orders: false,
  });

  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

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
        alternatePhone: user.alternatePhone || '',
        gender: user.gender || '',
        address: user.address || '',
        addressType: user.addressType || 'Home',
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
    const stateCities = serviceableCities.filter(
      (c) => c.state.toLowerCase() === newState.toLowerCase() && c.enabled
    );

    let nextCity = formData.city;
    if (stateCities.length > 0) {
      nextCity = stateCities[0].name;
    } else {
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

  const citiesInState = formData.state
    ? serviceableCities.filter((c) => c.state.toLowerCase() === formData.state.toLowerCase())
    : serviceableCities;

  return (
    <div style={{ minHeight: '88vh', background: 'var(--bg-main)', paddingBottom: '3rem' }}>
      <div className="profile-wrapper">
        {/* Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
              My Account
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', margin: '0.15rem 0 0 0', fontWeight: 800, lineHeight: 1.2 }}>
              Account Settings
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link to="/orders" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}>
              <Package size={15} />
              <span>Orders ({orderStats.total})</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="profile-hero">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  boxShadow: '0 6px 16px rgba(37, 99, 235, 0.28)',
                  flexShrink: 0,
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
                    {user?.name || 'Customer'}
                  </h2>
                  <span
                    className="badge"
                    style={{
                      background: user?.role === 'admin' ? '#fef3c7' : '#ecfdf5',
                      color: user?.role === 'admin' ? '#92400e' : '#065f46',
                      border: `1px solid ${user?.role === 'admin' ? '#fcd34d' : '#a7f3d0'}`,
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.55rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <ShieldCheck size={12} />
                    <span>{user?.role === 'admin' ? 'Administrator' : 'Verified Member'}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span>{user?.email}</span>
                  {user?.phone && (
                    <>
                      <span>•</span>
                      <span>{user?.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stat Chips */}
            <div style={{ display: 'flex', gap: '0.6rem', width: '100%', maxWidth: '280px', justifyContent: 'flex-start' }}>
              <div
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {orderStats.total}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                  Total Bookings
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>
                  {orderStats.active}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                  Active Pickups
                </div>
              </div>
            </div>
          </div>
        </div>

        {savedRecently && (
          <div
            style={{
              padding: '0.85rem 1.15rem',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-md)',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>Profile and address saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* ======================================================== */}
          {/* COLLAPSIBLE COLUMN 1: PERSONAL DETAILS (Tap to Open) */}
          {/* ======================================================== */}
          <div className={`profile-accordion-card ${openSections.personal ? 'active' : ''}`}>
            <div
              className={`profile-accordion-header ${openSections.personal ? 'active' : ''}`}
              onClick={() => toggleSection('personal')}
              role="button"
              tabIndex={0}
              title="Tap to expand / collapse Personal Details"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    Personal Details
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {formData.name ? `${formData.name} • ${formData.phone || 'Phone pending'}` : 'Tap to manage name and contact'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    background: '#eff6ff',
                    color: 'var(--primary)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 700,
                  }}
                >
                  {openSections.personal ? 'Open' : 'Tap to View'}
                </span>
                {openSections.personal ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>
            </div>

            {openSections.personal && (
              <div className="profile-accordion-body">
                {/* Salutation / Title Selection */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Salutation</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Mr.', 'Ms.', 'Mrs.', 'Dr.'].map((title) => (
                      <button
                        type="button"
                        key={title}
                        onClick={() => setFormData({ ...formData, gender: title })}
                        className={`address-tag-btn ${formData.gender === title ? 'selected' : ''}`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Full Name *</label>
                    <div style={{ position: 'relative' }}>
                      <User size={17} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        style={{ paddingLeft: '38px', height: '44px', fontSize: '15px' }}
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Email Address</span>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>Locked ID</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={17} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        className="form-input"
                        style={{ paddingLeft: '38px', height: '44px', fontSize: '15px', backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                        value={user?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Primary Phone Number *</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={17} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="tel"
                        name="phone"
                        className="form-input"
                        style={{ paddingLeft: '38px', height: '44px', fontSize: '15px' }}
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      Used for pickup OTP & WhatsApp tracking updates.
                    </span>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Alternate Phone (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={17} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="tel"
                        name="alternatePhone"
                        className="form-input"
                        style={{ paddingLeft: '38px', height: '44px', fontSize: '15px' }}
                        placeholder="Secondary contact number"
                        value={formData.alternatePhone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* COLLAPSIBLE COLUMN 2: DOORSTEP ADDRESS (Tap to Open) */}
          {/* ======================================================== */}
          <div className={`profile-accordion-card ${openSections.address ? 'active' : ''}`}>
            <div
              className={`profile-accordion-header ${openSections.address ? 'active' : ''}`}
              onClick={() => toggleSection('address')}
              role="button"
              tabIndex={0}
              title="Tap to expand / collapse Doorstep Address"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Truck size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    Doorstep Address & Coverage
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {formData.city ? `${formData.addressType || 'Home'} • ${formData.city}, ${formData.state || ''}` : 'Tap to configure doorstep delivery address'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {isCityServiceable ? (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                    }}
                  >
                    ● Active City
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      background: '#fffbeb',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                    }}
                  >
                    Check City
                  </span>
                )}
                {openSections.address ? <ChevronUp size={18} color="#059669" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>
            </div>

            {openSections.address && (
              <div className="profile-accordion-body">
                {/* Address Tag Selection */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Address Label</label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'Home', label: 'Home', icon: Home },
                      { id: 'Office', label: 'Office / Work', icon: Briefcase },
                      { id: 'Other', label: 'Other', icon: MapPin },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = formData.addressType === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => setFormData({ ...formData, addressType: item.id })}
                          className={`address-tag-btn ${isSelected ? 'selected' : ''}`}
                        >
                          <Icon size={14} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* State Dropdown */}
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>State / Union Territory *</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Choose your state</span>
                  </label>
                  <select
                    name="state"
                    className="form-select"
                    style={{ height: '44px', fontSize: '15px' }}
                    value={formData.state}
                    onChange={handleStateChange}
                    required
                  >
                    <option value="">-- Select Your State / Territory --</option>
                    {INDIAN_STATES.map((stateName) => (
                      <option key={stateName} value={stateName}>
                        {stateName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Dropdown */}
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>City / Service Area *</span>
                    {isCityServiceable ? (
                      <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> Doorstep Pickup Active
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>
                        Select Active Store City
                      </span>
                    )}
                  </label>

                  {citiesInState && citiesInState.length > 0 ? (
                    <select
                      name="city"
                      className="form-select"
                      style={{ height: '44px', fontSize: '15px' }}
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Active City --</option>
                      {citiesInState.map((c) => (
                        <option key={`${c.name}-${c.state}`} value={c.name} disabled={!c.enabled}>
                          {c.name} {c.enabled ? '✓ (Doorstep Active)' : '✗ (Paused)'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div>
                      <input
                        type="text"
                        name="city"
                        className="form-input"
                        style={{ height: '44px', fontSize: '15px' }}
                        placeholder="Enter your city name"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                      <div style={{ fontSize: '0.76rem', color: '#d97706', marginTop: '0.3rem' }}>
                        Doorstep dry-cleaning is active in configured cities. Please select a serviceable location.
                      </div>
                    </div>
                  )}
                </div>

                {/* Complete Street Address */}
                <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>House / Flat No., Building & Street *</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={17} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                    <textarea
                      name="address"
                      className="form-textarea"
                      style={{ paddingLeft: '38px', minHeight: '68px', fontSize: '15px' }}
                      placeholder="e.g. Flat 302, Tower 4, Oberoi Springs, Link Road"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      required
                    />
                  </div>
                </div>

                {/* Pincode & Landmark */}
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      className="form-input"
                      style={{ height: '44px', fontSize: '15px' }}
                      placeholder="e.g. 110001"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>Nearby Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      className="form-input"
                      style={{ height: '44px', fontSize: '15px' }}
                      placeholder="e.g. Near Metro Gate 3"
                      value={formData.landmark}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* COLLAPSIBLE COLUMN 3: ORDERS & QUICK ACTIONS (Tap to Open) */}
          {/* ======================================================== */}
          <div className={`profile-accordion-card ${openSections.orders ? 'active' : ''}`}>
            <div
              className={`profile-accordion-header ${openSections.orders ? 'active' : ''}`}
              onClick={() => toggleSection('orders')}
              role="button"
              tabIndex={0}
              title="Tap to expand / collapse Orders & Help"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    background: '#fef3c7',
                    color: '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Package size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    Orders & Service Quick Links
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {orderStats.total} Bookings recorded • Customer support
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {openSections.orders ? <ChevronUp size={18} color="#b45309" /> : <ChevronDown size={18} color="var(--text-muted)" />}
              </div>
            </div>

            {openSections.orders && (
              <div className="profile-accordion-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <Link
                    to="/orders"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={16} color="var(--primary)" />
                      <span>View All Orders</span>
                    </span>
                    <ArrowRight size={15} color="var(--text-muted)" />
                  </Link>

                  <Link
                    to="/contact"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      textDecoration: 'none',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircle size={16} color="#059669" />
                      <span>Helpline & Support</span>
                    </span>
                    <ArrowRight size={15} color="var(--text-muted)" />
                  </Link>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Need urgent garment pickup or modification? Call store customer care at <strong>+91 98765 43210</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Mobile-Friendly Save Action Bar */}
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              background: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              <Sparkles size={15} color="var(--primary)" />
              <span>Tap Save to persist personal details and address.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                maxWidth: '260px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
              }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Profile & Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
