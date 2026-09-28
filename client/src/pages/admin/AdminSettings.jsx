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
  Receipt
} from 'lucide-react';
import { settingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    deliveryFee: 50,
    freeDeliveryThreshold: 499,
    gstRate: 5,
    gstNumber: '',
    storePhone: '',
    storeAddress: '',
    storeEmail: '',
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.adminGetSettings();
      if (res.success && res.settings) {
        setFormData({
          deliveryFee: res.settings.deliveryFee ?? 50,
          freeDeliveryThreshold: res.settings.freeDeliveryThreshold ?? 499,
          gstRate: res.settings.gstRate ?? 5,
          gstNumber: res.settings.gstNumber || '',
          storePhone: res.settings.storePhone || '',
          storeAddress: res.settings.storeAddress || '',
          storeEmail: res.settings.storeEmail || '',
        });
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
      };

      const res = await settingsAPI.adminUpdateSettings(payload);
      if (res.success) {
        setSavedSuccess(true);
        addToast('Settings & tax configurations updated successfully!', 'success');
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
                  This GSTIN will print on all customer Tax Invoices generated by VK Dry Clean.
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
