import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CreditCard, 
  Banknote, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI, settingsAPI } from '../services/api';
import { INDIAN_STATES } from '../data/indianStates';

const TIME_SLOTS = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

const Checkout = () => {
  const { cartItems, subtotal, deliveryFee, gstAmount, gstRate, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Tomorrow's date formatted as YYYY-MM-DD for min pickup date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    landmark: user?.landmark || '',
    pickupDate: minDate,
    pickupTime: TIME_SLOTS[1],
    specialInstructions: '',
    paymentMethod: 'Cash on Delivery',
  });

  const [serviceableCities, setServiceableCities] = useState([]);
  const [activeCities, setActiveCities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load live serviceable cities from backend settings
  useEffect(() => {
    let isMounted = true;
    settingsAPI
      .getPublicSettings()
      .then((res) => {
        if (isMounted && res.success && res.settings) {
          const allCities = res.settings.serviceableCities || [];
          const active = allCities.filter((c) => c.enabled);
          setServiceableCities(allCities);
          setActiveCities(active);

          // If city not set or city is not active, auto-select first active city
          setFormData((prev) => {
            const currentCityActive = active.some(
              (c) => c.name.toLowerCase() === (prev.city || '').toLowerCase()
            );
            if (!currentCityActive && active.length > 0) {
              return {
                ...prev,
                city: active[0].name,
                state: prev.state || active[0].state,
              };
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        console.warn('Failed to load serviceable cities:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      addToast('Your cart is empty. Please add services first.', 'error');
      navigate('/services');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg('Please provide your name, email, and phone number.');
      return;
    }

    if (!formData.address || !formData.city || !formData.pincode) {
      setErrorMsg('Please provide a complete pickup address (street, city, pincode).');
      return;
    }

    // Strict validation: Only allow placing orders in enabled serviceable cities
    if (activeCities.length > 0) {
      const isAllowed = activeCities.some(
        (c) => c.name.toLowerCase() === (formData.city || '').trim().toLowerCase()
      );
      if (!isAllowed) {
        const allowedList = activeCities.map((c) => c.name).join(', ');
        setErrorMsg(`Doorstep pickup is currently not available in "${formData.city}". We are actively serving in: ${allowedList}.`);
        addToast(`Delivery is not available in "${formData.city}"`, 'error');
        return;
      }
    }

    if (!formData.pickupDate || !formData.pickupTime) {
      setErrorMsg('Please choose a valid pickup date and time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        pickupAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        },
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        specialInstructions: formData.specialInstructions,
        // Backend recalculates prices from DB
        items: cartItems.map((item) => ({
          serviceId: item.serviceId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
        })),
        paymentMethod: formData.paymentMethod,
      };

      const res = await ordersAPI.createOrder(orderPayload);

      if (res.success && res.order) {
        clearCart();
        addToast('Order placed successfully! 🎉', 'success');
        navigate(`/order-success/${res.order.orderId}`, { state: { order: res.order } });
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
      addToast(err.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="section" style={{ textAlign: 'center' }}>
        <h3>Your cart is empty</h3>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>Add some services before checking out.</p>
        <Link to="/services" className="btn btn-primary">
          Explore Services
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <Link
          to="/cart"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Schedule Pickup & Checkout</h1>
          <p>Provide your doorstep collection details and confirm your dry-cleaning order.</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '1rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Left Column: Form Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* 1. Customer Information */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <User size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Customer Contact</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="e.g. +91 85868 25438"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* 2. Pickup Address */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <MapPin size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Doorstep Pickup Address</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Complete Street Address / House / Flat No. *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    placeholder="e.g. Flat 304, Tower B, Oberoi Enclave"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  {/* State Selection Dropdown */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>State / Territory *</label>
                    <select
                      name="state"
                      className="form-select"
                      value={formData.state}
                      onChange={(e) => {
                        const selectedState = e.target.value;
                        const stateCities = activeCities.filter(
                          (c) => c.state.toLowerCase() === selectedState.toLowerCase()
                        );
                        setFormData((prev) => ({
                          ...prev,
                          state: selectedState,
                          city: stateCities.length > 0 ? stateCities[0].name : '',
                        }));
                      }}
                      required
                    >
                      <option value="">-- Select State --</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Selection Dropdown (Only Active Cities Enabled by Admin) */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>City / Service Zone *</span>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
                        🟢 Active Doorstep
                      </span>
                    </label>
                    <select
                      name="city"
                      className="form-select"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Active City --</option>
                      {activeCities
                        .filter(
                          (c) => !formData.state || c.state.toLowerCase() === formData.state.toLowerCase()
                        )
                        .map((c) => (
                          <option key={`${c.name}-${c.state}`} value={c.name}>
                            {c.name} ({c.state})
                          </option>
                        ))}
                      {formData.state &&
                        activeCities.filter(
                          (c) => c.state.toLowerCase() === formData.state.toLowerCase()
                        ).length === 0 && (
                          <option disabled value="">
                            No active pickup in {formData.state} currently
                          </option>
                        )}
                    </select>
                    {formData.state &&
                      activeCities.filter(
                        (c) => c.state.toLowerCase() === formData.state.toLowerCase()
                      ).length === 0 && (
                        <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.35rem' }}>
                          ⚠️ Doorstep pickup is currently active in: {activeCities.map((c) => c.name).join(', ')}.
                        </div>
                      )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pincode *</label>
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
                    <label className="form-label">Nearby Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      className="form-input"
                      placeholder="e.g. Opposite Metro Gate 3"
                      value={formData.landmark}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Schedule Slot */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <Calendar size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Schedule Pickup Slot</h3>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Pickup Date *</label>
                    <input
                      type="date"
                      name="pickupDate"
                      min={minDate}
                      className="form-input"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pickup Time Slot *</label>
                    <select
                      name="pickupTime"
                      className="form-select"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      required
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Instructions for Rider / Fabric Care (Optional)</label>
                  <textarea
                    name="specialInstructions"
                    className="form-textarea"
                    placeholder="e.g. Please ring doorbell twice, or delicate silk saree needs specific stain removal on pallu..."
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
              </div>

              {/* 4. Payment Method */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <Banknote size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Payment Method</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      border: '2px solid var(--primary)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-light)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      onChange={handleChange}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        Cash on Delivery (Pay at Pickup / Delivery)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Pay via Cash or UPI QR code when our rider arrives at your doorstep.
                      </div>
                    </div>
                    <CheckCircle2 size={20} color="var(--primary)" />
                  </label>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      opacity: 0.6,
                      background: 'var(--bg-card-subtle)',
                    }}
                  >
                    <CreditCard size={20} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                        Online Payment (Razorpay / UPI / Cards)
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Architecture ready — will be activated soon.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary Sticky Card */}
            <div className="card" style={{ position: 'sticky', top: '90px', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                Order Summary ({cartItems.length} Services)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', maxHeight: '280px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {cartItems.map((item) => (
                  <div key={item.serviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × ₹{item.price}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                  <span>Pickup & Delivery</span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                  ) : (
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{deliveryFee}</span>
                  )}
                </div>
                {gstRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                    <span>GST ({gstRate}%)</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{gstAmount}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '1rem', borderTop: '2px dashed var(--border-color)', marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Total Payable</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  ₹{total}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontSize: '1.05rem', padding: '1rem' }}
              >
                {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.25rem', justifyContent: 'center' }}>
                <ShieldCheck size={16} color="var(--success)" />
                <span>Verified Clean & Sanitized Processing</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
