import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Sliders, 
  Truck, 
  Percent, 
  Building, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Receipt,
  MapPin,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Check,
  X,
  Globe
} from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { INDIAN_STATES } from '../../data/indianStates';

const AdminSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    deliveryFee: 50,
    freeDeliveryThreshold: 499,
    gstRate: 0,
    gstNumber: '',
    storePhone: '',
    storeAddress: '',
    storeEmail: '',
  });

  // Serviceable Cities & Coverage state
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityState, setNewCityState] = useState('Delhi');
  const [newCityEnabled, setNewCityEnabled] = useState(true);
  const [togglingCity, setTogglingCity] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.adminGetSettings();
      if (res.success && res.settings) {
        setFormData({
          deliveryFee: res.settings.deliveryFee ?? 50,
          freeDeliveryThreshold: res.settings.freeDeliveryThreshold ?? 499,
          gstRate: res.settings.gstRate ?? 0,
          gstNumber: res.settings.gstNumber || '',
          storePhone: res.settings.storePhone || '',
          storeAddress: res.settings.storeAddress || '',
          storeEmail: res.settings.storeEmail || '',
        });
        setCities(res.settings.serviceableCities || []);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      addToast('Failed to load settings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    setSavedSuccess(false);
  };

  const handleToggleCity = async (cityName) => {
    setTogglingCity(cityName);
    try {
      const res = await settingsAPI.adminToggleCity(cityName);
      if (res.success) {
        setCities((prev) =>
          prev.map((c) =>
            c.name.toLowerCase() === cityName.toLowerCase() ? { ...c, enabled: !c.enabled } : c
          )
        );
        addToast(res.message, 'success');
      }
    } catch (err) {
      console.error('Toggle city error:', err);
      addToast(err.message || 'Failed to update city status.', 'error');
    } finally {
      setTogglingCity(null);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) {
      addToast('Please enter a valid city name.', 'error');
      return;
    }

    try {
      const res = await settingsAPI.adminAddCity({
        name: newCityName.trim(),
        state: newCityState.trim(),
        enabled: newCityEnabled,
      });

      if (res.success) {
        setCities(res.serviceableCities || [...cities, { name: newCityName.trim(), state: newCityState.trim(), enabled: newCityEnabled }]);
        setNewCityName('');
        setShowAddModal(false);
        addToast(`City "${newCityName.trim()}" added to coverage zones!`, 'success');
      }
    } catch (err) {
      console.error('Add city error:', err);
      addToast(err.message || 'Failed to add city.', 'error');
    }
  };

  const handleDeleteCity = async (cityName) => {
    if (!window.confirm(`Are you sure you want to remove "${cityName}" from coverage?`)) return;
    try {
      const res = await settingsAPI.adminDeleteCity(cityName);
      if (res.success) {
        setCities((prev) => prev.filter((c) => c.name.toLowerCase() !== cityName.toLowerCase()));
        addToast(`City "${cityName}" removed.`, 'success');
      }
    } catch (err) {
      console.error('Delete city error:', err);
      addToast(err.message || 'Failed to delete city.', 'error');
    }
  };

  const handleEnableAllNCR = () => {
    const ncrNames = ['New Delhi', 'South Delhi', 'West Delhi', 'North Delhi', 'East Delhi', 'Central Delhi', 'Noida', 'Greater Noida', 'Ghaziabad', 'Gurugram', 'Faridabad'];
    setCities((prev) =>
      prev.map((c) => (ncrNames.includes(c.name) ? { ...c, enabled: true } : c))
    );
    addToast('Enabled all Delhi NCR cities! Click "Save Settings" to persist.', 'success');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const payload = {
        deliveryFee: Math.max(0, Number(formData.deliveryFee) || 0),
        freeDeliveryThreshold: Math.max(0, Number(formData.freeDeliveryThreshold) || 0),
        gstRate: Math.max(0, Math.min(100, Number(formData.gstRate) || 0)),
        gstNumber: formData.gstNumber.trim(),
        storePhone: formData.storePhone.trim(),
        storeAddress: formData.storeAddress.trim(),
        storeEmail: formData.storeEmail.trim(),
        serviceableCities: cities,
      };

      const res = await settingsAPI.adminUpdateSettings(payload);
      if (res.success) {
        setSavedSuccess(true);
        addToast('Settings, Pricing & Coverage zones updated successfully!', 'success');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      addToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Real-time calculation previews for admin
  const sampleLowSubtotal = 300;
  const sampleLowDelivery = sampleLowSubtotal >= (Number(formData.freeDeliveryThreshold) || 0) ? 0 : (Number(formData.deliveryFee) || 0);
  const sampleLowGst = Math.round((sampleLowSubtotal * (Number(formData.gstRate) || 0)) / 100);
  const sampleLowTotal = sampleLowSubtotal + sampleLowDelivery + sampleLowGst;

  const sampleHighSubtotal = Math.max(600, (Number(formData.freeDeliveryThreshold) || 499) + 100);
  const sampleHighDelivery = sampleHighSubtotal >= (Number(formData.freeDeliveryThreshold) || 0) ? 0 : (Number(formData.deliveryFee) || 0);
  const sampleHighGst = Math.round((sampleHighSubtotal * (Number(formData.gstRate) || 0)) / 100);
  const sampleHighTotal = sampleHighSubtotal + sampleHighDelivery + sampleHighGst;

  return (
    <AdminLayout title="Delivery, Taxes & Store Settings">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 800 }}>Delivery & Tax Controls</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
              Configure live delivery rates, free delivery incentives, and GST calculation for all customer orders & invoices.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSettings}
            disabled={loading}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>Reload</span>
          </button>
        </div>

        {savedSuccess && (
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
            <span>Settings saved successfully! Orders and checkout will now reflect these rates in real time.</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Card 1: Doorstep Delivery Settings */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Delivery Charges</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pickup & Drop rates</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Standard Delivery Fee (₹)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Charged on orders below free limit</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    name="deliveryFee"
                    min="0"
                    step="1"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Free Delivery Minimum (₹)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0 = Always Free</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ₹
                  </span>
                  <input
                    type="number"
                    name="freeDeliveryThreshold"
                    min="0"
                    step="1"
                    className="form-input"
                    style={{ paddingLeft: '2.2rem' }}
                    value={formData.freeDeliveryThreshold}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Orders with garments subtotal of <strong>₹{formData.freeDeliveryThreshold || 0}</strong> or more get 100% Free Doorstep Delivery.
                </div>
              </div>
            </div>

            {/* Card 2: GST & Tax Calculation */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <Percent size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>GST & Tax Setup</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Applied to orders & invoices</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>GST Rate (%)</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0% = Tax exempt</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    name="gstRate"
                    min="0"
                    max="100"
                    step="0.5"
                    className="form-input"
                    value={formData.gstRate}
                    onChange={handleChange}
                    required
                  />
                  <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    %
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Standard dry cleaning GST in India is <strong>5%</strong> (CGST 2.5% + SGST 2.5%) or <strong>18%</strong>.
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  GSTIN / Tax Identification No.
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  className="form-input"
                  placeholder="e.g. 07AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  This GSTIN will print on all customer Tax Invoices generated by JKM Dry Clean.
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Store & Invoice Information */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
                <Building size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Store Invoice Information</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Printed on receipts and tax invoices</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Helpline Phone</label>
                <input
                  type="text"
                  name="storePhone"
                  className="form-input"
                  value={formData.storePhone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>Customer Care Email</label>
                <input
                  type="email"
                  name="storeEmail"
                  className="form-input"
                  value={formData.storeEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Registered Store Address</label>
                <input
                  type="text"
                  name="storeAddress"
                  className="form-input"
                  value={formData.storeAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Serviceable Cities & Order Coverage Management */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Serviceable Cities & Order Coverage</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Only cities enabled below will be allowed for doorstep dry-cleaning orders
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleEnableAllNCR}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <Check size={14} />
                  <span>Enable All NCR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
                >
                  <Plus size={14} />
                  <span>Add City</span>
                </button>
              </div>
            </div>

            {/* Coverage Summary Stats */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--border-color)' }}>
                Total Cities: <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{cities.length}</span>
              </div>
              <div style={{ background: '#ecfdf5', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, color: '#065f46', border: '1px solid #a7f3d0' }}>
                ● Active Coverage: <span style={{ fontWeight: 800 }}>{cities.filter(c => c.enabled).length}</span> cities
              </div>
              <div style={{ background: '#fef2f2', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', fontWeight: 600, color: '#991b1b', border: '1px solid #fecaca' }}>
                ○ Orders Paused: <span style={{ fontWeight: 800 }}>{cities.filter(c => !c.enabled).length}</span> cities
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search city name..."
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '0.88rem' }}
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '220px', height: '38px', fontSize: '0.88rem' }}
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="All">All States / UTs</option>
                {Array.from(new Set(cities.map((c) => c.state))).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Cities Grid List */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '0.85rem',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {cities
                .filter((c) => {
                  const matchSearch = c.name.toLowerCase().includes(citySearch.toLowerCase());
                  const matchState = stateFilter === 'All' || c.state === stateFilter;
                  return matchSearch && matchState;
                })
                .map((city) => (
                  <div
                    key={`${city.name}-${city.state}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: city.enabled ? '#ffffff' : '#f8fafc',
                      border: `1.5px solid ${city.enabled ? '#10b981' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease',
                      boxShadow: city.enabled ? '0 2px 8px rgba(16, 185, 129, 0.08)' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: city.enabled ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {city.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {city.state}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleCity(city.name)}
                        disabled={togglingCity === city.name}
                        title={city.enabled ? 'Click to Pause Orders in this city' : 'Click to Enable Orders in this city'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: city.enabled ? '#ecfdf5' : '#f1f5f9',
                          border: `1px solid ${city.enabled ? '#a7f3d0' : '#cbd5e1'}`,
                          color: city.enabled ? '#059669' : '#64748b',
                          borderRadius: '20px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {city.enabled ? <ToggleRight size={18} color="#059669" /> : <ToggleLeft size={18} color="#64748b" />}
                        <span>{city.enabled ? 'Active' : 'Disabled'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCity(city.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        title={`Delete ${city.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={15} color="var(--primary)" />
              <span>
                Customers during Checkout & Profile updates will strictly only see and be able to book orders for <strong>Active</strong> cities.
              </span>
            </div>
          </div>

          {/* Add City Modal */}
          {showAddModal && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: '460px',
                  padding: '1.75rem',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 700 }}>Add New Serviceable City</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>State / Territory *</label>
                  <select
                    className="form-select"
                    value={newCityState}
                    onChange={(e) => setNewCityState(e.target.value)}
                    required
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>City / Area Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Gurugram, Dwarka, Noida Sector 62"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  <input
                    type="checkbox"
                    id="newCityEnabled"
                    checked={newCityEnabled}
                    onChange={(e) => setNewCityEnabled(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="newCityEnabled" style={{ fontSize: '0.9rem', cursor: 'pointer', fontWeight: 500 }}>
                    Enable doorstep orders immediately for this city
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Check size={16} />
                    <span>Add to Coverage</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Preview of Calculations */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              <Receipt size={18} color="var(--primary)" />
              <span>Live Order & Invoice Calculation Simulation</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {/* Below threshold simulation */}
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  Scenario A: Small Order (₹{sampleLowSubtotal})
                </div>
                <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{sampleLowSubtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Fee:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{sampleLowDelivery}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GST ({formData.gstRate}%):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{sampleLowGst}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                    <span>Total Payable:</span>
                    <span>₹{sampleLowTotal}</span>
                  </div>
                </div>
              </div>

              {/* Above threshold simulation */}
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>
                  Scenario B: High Value Order (₹{sampleHighSubtotal})
                </div>
                <div style={{ fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{sampleHighSubtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Fee:</span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>FREE (₹0)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GST ({formData.gstRate}%):</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{sampleHighGst}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)', fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                    <span>Total Payable:</span>
                    <span>₹{sampleHighTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={fetchSettings}
              className="btn btn-outline"
              disabled={saving || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving || loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px', justifyContent: 'center' }}
            >
              <Save size={18} />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
